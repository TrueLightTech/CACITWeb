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
 * The same choices PublicRecord.vue makes, so the crawler's card and the page
 * a person then opens agree with each other.
 */
function describe (collection, id, record) {
  const content = (record && record.content) || {}
  const media = content.sourceUrl ? content : (record.video || record.media || null)

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

  return {
    title: record.title ? `${record.title} | CACI Taifa` : 'CACI Taifa',
    description: trim(description, 300),
    // An event is a page about a thing; the other three are something to watch.
    type: collection === 'events' ? 'article' : 'video.other',
    image: image || FALLBACK_IMAGE,
    hasOwnImage: !!image,
    url: `${SITE_URL}/${collection}/${id}`
  }
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
    ['name', 'twitter:image', card.image]
  ]

  // data-n-head/data-hid are vue-meta's own bookkeeping. Carrying them means
  // that once the SPA boots, vue-meta recognises these as tags it manages and
  // replaces them in place — without, it leaves them and adds its own
  // alongside, so the live DOM ends up with two of every tag.
  return [
    `<title data-n-head="ssr">${escapeAttr(card.title)}</title>`,
    ...meta.map(([attr, key, value]) =>
      `<meta data-n-head="ssr" data-hid="${key}" ${attr}="${key}" content="${escapeAttr(value)}">`),
    `<link data-n-head="ssr" data-hid="canonical" rel="canonical" href="${escapeAttr(card.url)}">`
  ].join('')
}

/**
 * Replaces rather than appends. The shell already carries the site-wide card
 * from nuxt.config, and two og:title tags in one document is a coin toss over
 * which one an unfurler believes.
 */
function rewriteHead (html, card) {
  const keys = [
    'description', 'og:type', 'og:title', 'og:description', 'og:image',
    'og:url', 'twitter:card', 'twitter:title', 'twitter:description', 'twitter:image'
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
module.exports.rewriteHead = rewriteHead
module.exports.SHARE_ROUTE = SHARE_ROUTE
