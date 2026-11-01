/**
 * Per-record link previews for the four public share routes.
 *
 * The site is an SPA: components/PublicRecord.vue already computes the right
 * title, description and poster and sets them through head(), but that runs
 * in the browser. WhatsApp, Facebook, X and Google fetch the raw HTML and
 * never execute JavaScript, so every shared link previewed as the site-wide
 * card no matter what it pointed at.
 *
 * This runs on the server, ahead of the SPA shell: it looks up the record on
 * the public API and rewrites the head before the HTML goes out. Components
 * still render client-side, so nothing here can break a page by touching
 * window or document at render time.
 *
 * It is deliberately never fatal. If the API is slow, down, or does not know
 * the id, the request falls through untouched and the visitor gets the
 * ordinary page with the generic card — which is exactly today's behaviour.
 */

const axios = require('axios')

/** The four routes that get handed out as links. */
const SHARE_ROUTE = /^\/(sermons|videos|events|shorts)\/([^/?#]+)\/?$/

const SITE_URL = (process.env.SITE_URL || 'https://cacitaifa.com').replace(/\/+$/, '')
const API_BASE_URL = (process.env.API_BASE_URL || 'https://cacitapi-production.up.railway.app/api/').replace(/\/+$/, '')
const FALLBACK_IMAGE = `${SITE_URL}/og-image.jpg`

/**
 * The app's App Store id, for Safari's own "Open / Get" banner at the top of
 * a shared page. It has to be in the HTML as it arrives — Safari does not
 * look again once the page's scripts have run.
 */
const APP_STORE_ID = process.env.APP_STORE_ID || '6813027106'

/** A crawler that waits is a crawler that gives up and shows nothing. */
const API_TIMEOUT_MS = 2500

/**
 * Records change rarely and a popular link is fetched many times in a row —
 * once by the sender's client, then once per recipient whose app unfurls it.
 * Small and in-process on purpose: this is a courtesy to the API, not a
 * correctness mechanism, and a stale preview for a few minutes is harmless.
 */
const CACHE_TTL_MS = 5 * 60 * 1000
const CACHE_MAX_ENTRIES = 200
const cache = new Map()

function cacheGet (key) {
  const hit = cache.get(key)
  if (!hit) { return null }
  if (Date.now() - hit.at > CACHE_TTL_MS) {
    cache.delete(key)
    return null
  }
  return hit.record
}

function cacheSet (key, record) {
  if (cache.size >= CACHE_MAX_ENTRIES) {
    cache.delete(cache.keys().next().value)
  }
  cache.set(key, { record, at: Date.now() })
}

/** Attribute-safe. Everything here is church-authored, but it still lands in HTML. */
function escapeAttr (value) {
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}

/** Crawlers truncate anyway, and a description should not carry a whole sermon. */
function trim (value, max) {
  const text = String(value || '').replace(/\s+/g, ' ').trim()
  if (text.length <= max) { return text }
  return text.slice(0, max - 1).trimEnd() + '…'
}

/**
 * Sizes we can know without fetching the image. WhatsApp in particular decides
 * between the large card and a small square from these on a first share, before
 * it has the image itself. Cloudflare Images variants are not listed: their
 * shape depends on the upload, and a wrong size is worse than none.
 */
function knownImageSize (url) {
  if (url === FALLBACK_IMAGE) { return { width: 1200, height: 630 } }
  if (/^https:\/\/img\.youtube\.com\/vi\/[^/]+\/hqdefault\.jpg$/.test(url)) { return { width: 480, height: 360 } }
  return null
}

const FILE_TYPES = { mp4: 'video/mp4', webm: 'video/webm', mov: 'video/quicktime' }

/**
 * Something a crawler can actually play. YouTube's embed is stable; a plain
 * file is too. Cloudflare Stream is left out: its URLs carry a signed token
 * that expires within hours, and Facebook and Google keep what they fetch for
 * far longer than that. HLS manifests are left out because no unfurler plays them.
 */
function playable (media) {
  if (!media || !media.sourceUrl) { return null }
  const meta = media.metadata || {}

  if (meta.provider === 'youtube' && meta.embedUrl) {
    return { url: meta.embedUrl, type: 'text/html', embed: true }
  }

  const ext = (/\.([a-z0-9]+)(?:[?#]|$)/i.exec(media.sourceUrl) || [])[1]
  const type = ext && FILE_TYPES[ext.toLowerCase()]
  return type ? { url: media.sourceUrl, type, embed: false } : null
}

/** The API's empty date is the year 1; that is not an upload date. */
function realDate (...values) {
  const value = values.find(v => v && !String(v).startsWith('0001-'))
  return value || null
}

function isoDuration (seconds) {
  const total = Math.round(Number(seconds))
  if (!total || total < 0) { return null }
  const h = Math.floor(total / 3600)
  const m = Math.floor((total % 3600) / 60)
  const s = total % 60
  return 'PT' + (h ? `${h}H` : '') + (m ? `${m}M` : '') + (s || (!h && !m) ? `${s}S` : '')
}

/**
 * The same choices PublicRecord.vue makes, so the crawler's card and the page
 * a person then opens agree with each other.
 */
function describe (collection, id, record) {
  const content = (record && record.content) || {}
  const media = content.sourceUrl ? content : (record.video || record.media || null)
  const audio = record.audio && record.audio.sourceUrl ? record.audio : null

  const image =
    record.thumbnailUrl ||
    record.imageUrl ||
    content.imageUrl ||
    content.artworkUrl ||
    (media && media.thumbnailUrl) ||
    (Array.isArray(content.slides) && content.slides.length ? content.slides[0].imageUrl : '') ||
    ''

  const description =
    record.summary ||
    record.description ||
    record.caption ||
    content.text ||
    'Christ Apostolic Church International — Taifa Central.'

  const finalImage = image || FALLBACK_IMAGE
  const isVideo = !!media && (media.type === 'video' || collection === 'videos' || record.kind === 'video')

  return {
    title: record.title ? `${record.title} | CACI Taifa` : 'CACI Taifa',
    name: record.title || '',
    description: trim(description, 300),
    // An event is a page about a thing; the other three are something to watch.
    type: collection === 'events' ? 'article' : 'video.other',
    image: finalImage,
    imageSize: knownImageSize(finalImage),
    imageAlt: content.altText || record.title || '',
    hasOwnImage: !!image,
    url: `${SITE_URL}/${collection}/${id}`,
    video: isVideo ? playable(media) : null,
    audio: audio ? { url: audio.sourceUrl, type: 'audio/mpeg' } : null,
    isVideo,
    duration: isoDuration(media && media.durationSeconds),
    uploadDate: realDate(record.publishedAt, record.publishedOn, record.preachedOn)
  }
}

/**
 * Google's video rich result: thumbnail, duration and date beside the link in
 * search. Its three required fields are a name, a thumbnail and an upload
 * date; without all three Google ignores the block, so it is not sent.
 */
function videoObject (card) {
  if (!card.isVideo || !card.name || !card.hasOwnImage || !card.uploadDate) { return null }

  const data = {
    '@context': 'https://schema.org',
    '@type': 'VideoObject',
    name: card.name,
    description: card.description,
    thumbnailUrl: [card.image],
    uploadDate: card.uploadDate
  }
  if (card.duration) { data.duration = card.duration }
  if (card.video) { data[card.video.embed ? 'embedUrl' : 'contentUrl'] = card.video.url }
  return data
}

function buildTags (card) {
  const meta = [
    ['name', 'description', card.description],
    ['property', 'og:type', card.type],
    ['property', 'og:title', card.title],
    ['property', 'og:description', card.description],
    ['property', 'og:image', card.image],
    ['property', 'og:url', card.url],
    ['name', 'twitter:card', card.hasOwnImage ? 'summary_large_image' : 'summary'],
    ['name', 'twitter:title', card.title],
    ['name', 'twitter:description', card.description],
    ['name', 'twitter:image', card.image],
    // app-argument is this record's own address, which the app routes to.
    ['name', 'apple-itunes-app', `app-id=${APP_STORE_ID}, app-argument=${card.url}`]
  ]

  // data-n-head/data-hid are vue-meta's own bookkeeping. Carrying them means
  // that once the SPA boots, vue-meta recognises these as tags it manages and
  // replaces them in place — without, it leaves them and adds its own
  // alongside, so the live DOM ends up with two of every tag.
  return [
    `<title data-n-head="ssr">${escapeAttr(card.title)}</title>`,
    ...meta.map(([attr, key, value]) =>
      `<meta data-n-head="ssr" data-hid="${key}" ${attr}="${key}" content="${escapeAttr(value)}">`),
    `<link data-n-head="ssr" data-hid="canonical" rel="canonical" href="${escapeAttr(card.url)}">`,
    // No vue-meta bookkeeping on these: the SPA never sets them, and tags it
    // thinks it owns but no longer lists get removed once it boots — which
    // would take them out of the page Google renders.
    ...extraMeta(card).map(([key, value]) =>
      `<meta property="${key}" content="${escapeAttr(value)}">`),
    ...structuredData(card)
  ].join('')
}

function extraMeta (card) {
  const tags = []
  if (card.imageSize) {
    tags.push(['og:image:width', card.imageSize.width], ['og:image:height', card.imageSize.height])
  }
  if (card.imageAlt) { tags.push(['og:image:alt', card.imageAlt]) }
  if (card.video) {
    tags.push(['og:video', card.video.url], ['og:video:secure_url', card.video.url], ['og:video:type', card.video.type])
  }
  if (card.audio) {
    tags.push(['og:audio', card.audio.url], ['og:audio:type', card.audio.type])
  }
  return tags
}

function structuredData (card) {
  const data = videoObject(card)
  if (!data) { return [] }
  // JSON is not HTML: "</script>" inside a title would end the block early.
  const json = JSON.stringify(data).replace(/</g, '\\u003c')
  return [`<script type="application/ld+json">${json}</script>`]
}

/**
 * Replaces rather than appends. The shell already carries the site-wide card
 * from nuxt.config, and two og:title tags in one document is a coin toss over
 * which one an unfurler believes.
 */
function rewriteHead (html, card) {
  const keys = [
    'description', 'og:type', 'og:title', 'og:description', 'og:image',
    'og:url', 'twitter:card', 'twitter:title', 'twitter:description', 'twitter:image',
    'apple-itunes-app', 'og:image:width', 'og:image:height', 'og:image:alt',
    'og:video', 'og:video:secure_url', 'og:video:type', 'og:audio', 'og:audio:type'
  ]

  let out = html.replace(/<title[^>]*>[\s\S]*?<\/title>/i, '')

  keys.forEach(key => {
    const escaped = key.replace(/[:]/g, '\\:')
    const pattern = new RegExp(
      `<meta[^>]*(?:data-hid|property|name)=["']${escaped}["'][^>]*>\\s*`,
      'gi'
    )
    out = out.replace(pattern, '')
  })

  out = out.replace(/<link[^>]*rel=["']canonical["'][^>]*>\s*/gi, '')

  const tags = buildTags(card)
  return out.includes('</head>')
    ? out.replace('</head>', `${tags}</head>`)
    : tags + out
}

async function fetchRecord (collection, id) {
  const key = `${collection}/${id}`
  const cached = cacheGet(key)
  if (cached) { return cached }

  const response = await axios.get(`${API_BASE_URL}/${collection}/${id}`, {
    timeout: API_TIMEOUT_MS,
    headers: { Accept: 'application/json' }
  })

  const body = response.data
  const record = (body && body.data) || body
  if (!record || !record.id) { return null }

  cacheSet(key, record)
  return record
}

/**
 * Buffers the SPA shell so the head can be rewritten before it is sent.
 * Only HTML is touched; anything else is passed straight through.
 */
function interceptHtml (res, transform) {
  const originalWrite = res.write
  const originalEnd = res.end
  const chunks = []

  const isHtml = () => {
    const type = res.getHeader('content-type')
    return !type || String(type).includes('text/html')
  }

  const collect = (chunk, encoding) => {
    if (!chunk) { return }
    chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk, typeof encoding === 'string' ? encoding : 'utf8'))
  }

  res.write = function (chunk, encoding, callback) {
    if (!isHtml()) {
      res.write = originalWrite
      return originalWrite.call(res, chunk, encoding, callback)
    }
    collect(chunk, encoding)
    if (typeof callback === 'function') { callback() }
    return true
  }

  res.end = function (chunk, encoding, callback) {
    if (typeof chunk === 'function') { callback = chunk; chunk = null }

    res.write = originalWrite
    res.end = originalEnd

    if (!isHtml()) {
      return originalEnd.call(res, chunk, encoding, callback)
    }

    collect(chunk, encoding)

    let html = Buffer.concat(chunks).toString('utf8')
    try {
      html = transform(html)
    } catch (e) {
      // Serving the untouched shell beats serving nothing.
    }

    const body = Buffer.from(html, 'utf8')
    res.setHeader('Content-Length', String(body.length))
    return originalEnd.call(res, body, callback)
  }
}

module.exports = function shareMeta (req, res, next) {
  const path = String(req.url || '').split('?')[0]
  const match = SHARE_ROUTE.exec(path)

  if (!match || (req.method && req.method !== 'GET' && req.method !== 'HEAD')) {
    return next()
  }

  const collection = match[1]
  const id = match[2]

  fetchRecord(collection, id)
    .then(record => {
      if (record) {
        const card = describe(collection, id, record)
        interceptHtml(res, html => rewriteHead(html, card))
      }
      next()
    })
    .catch(() => {
      // Unknown id, slow API, API down: fall through to the ordinary page.
      next()
    })
}

// Exported for tests.
module.exports.describe = describe
module.exports.buildTags = buildTags
module.exports.videoObject = videoObject
module.exports.rewriteHead = rewriteHead
module.exports.SHARE_ROUTE = SHARE_ROUTE
