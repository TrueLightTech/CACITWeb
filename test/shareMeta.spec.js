const shareMeta = require('../server-middleware/share-meta')

const { describe: card, rewriteHead, SHARE_ROUTE } = shareMeta

/** The head a crawler sees today: the site-wide card from nuxt.config. */
const SHELL = `<!doctype html><html><head>` +
  `<title>CACI Taifa Central Assembly | Miracle Centre</title>` +
  `<meta data-n-head="1" data-hid="description" name="description" content="Official platform.">` +
  `<meta data-n-head="1" data-hid="og:type" property="og:type" content="website">` +
  `<meta data-n-head="1" data-hid="og:site_name" property="og:site_name" content="CACI Taifa Central Assembly">` +
  `<meta data-n-head="1" data-hid="og:title" property="og:title" content="Christ Apostolic Church International">` +
  `<meta data-n-head="1" data-hid="og:description" property="og:description" content="Join us for Sunday.">` +
  `<meta data-n-head="1" data-hid="og:image" property="og:image" content="https://cacitaifa.com/og-image.jpg">` +
  `<meta data-n-head="1" data-hid="twitter:card" name="twitter:card" content="summary_large_image">` +
  `<meta data-n-head="1" data-hid="twitter:image" name="twitter:image" content="https://cacitaifa.com/og-image.jpg">` +
  `</head><body><div id="__nuxt"></div></body></html>`

const tag = (html, attr, key) => {
  const m = new RegExp(`<meta[^>]*${attr}="${key.replace(':', ':')}"[^>]*content="([^"]*)"`, 'i').exec(html)
  return m ? m[1] : null
}
const titleOf = html => {
  const m = /<title[^>]*>([\s\S]*?)<\/title>/i.exec(html)
  return m ? m[1] : null
}

describe('which URLs get a per-record card', () => {
  it.each([
    ['/sermons/abc', 'sermons', 'abc'],
    ['/videos/abc', 'videos', 'abc'],
    ['/events/abc', 'events', 'abc'],
    ['/shorts/abc', 'shorts', 'abc'],
    ['/shorts/abc/', 'shorts', 'abc']
  ])('%s', (path, collection, id) => {
    const m = SHARE_ROUTE.exec(path)
    expect(m).not.toBeNull()
    expect(m[1]).toBe(collection)
    expect(m[2]).toBe(id)
  })

  it.each(['/', '/login', '/sermons', '/admin/members', '/shorts/abc/extra'])(
    'leaves %s alone', path => {
      expect(SHARE_ROUTE.exec(path)).toBeNull()
    })
})

describe('the card a record produces', () => {
  it('uses a sermon\'s own title, summary and thumbnail', () => {
    const c = card('sermons', 's-1', {
      id: 's-1',
      title: 'Sunday 15th September Sermon',
      summary: 'Sunday Divine Church Service Sermon.',
      thumbnailUrl: 'https://pub.r2.dev/image/sermon.jpg',
      video: { sourceUrl: 'https://pub.r2.dev/video/sermon.mp4' }
    })

    expect(c.title).toBe('Sunday 15th September Sermon | CACI Taifa')
    expect(c.description).toBe('Sunday Divine Church Service Sermon.')
    expect(c.image).toBe('https://pub.r2.dev/image/sermon.jpg')
    expect(c.url).toBe('https://cacitaifa.com/sermons/s-1')
    expect(c.type).toBe('video.other')
  })

  it('reads a short from its nested content', () => {
    const c = card('shorts', 's-2', {
      id: 's-2',
      kind: 'video',
      title: 'Sunday in sixty seconds',
      caption: 'The choir and the baptisms.',
      content: {
        sourceUrl: 'https://pub.r2.dev/video/clip.mp4',
        thumbnailUrl: 'https://pub.r2.dev/video/clip.jpg'
      }
    })

    expect(c.description).toBe('The choir and the baptisms.')
    expect(c.image).toBe('https://pub.r2.dev/video/clip.jpg')
    expect(c.url).toBe('https://cacitaifa.com/shorts/s-2')
  })

  it('reads a scripture short, whose words are the whole point', () => {
    const c = card('shorts', 's-3', {
      id: 's-3',
      title: 'A word for the week',
      content: { text: 'The Lord is my shepherd.', reference: 'Psalm 23:1' }
    })

    expect(c.description).toBe('The Lord is my shepherd.')
  })

  it('marks an event as an article, not a video', () => {
    const c = card('events', 'e-1', { id: 'e-1', title: 'Compound Cleaning', description: 'Come and clean.' })
    expect(c.type).toBe('article')
  })

  it('falls back to the church card when a record has no image of its own', () => {
    // A work-day event carries no artwork; a card with no image at all is
    // worse than the church's.
    const c = card('events', 'e-1', { id: 'e-1', title: 'Compound Cleaning', description: 'Come and clean.' })
    expect(c.image).toBe('https://cacitaifa.com/og-image.jpg')
    expect(c.hasOwnImage).toBe(false)
  })

  it('shortens a long description rather than pasting a whole sermon', () => {
    const c = card('sermons', 's-4', { id: 's-4', title: 'Long', summary: 'x'.repeat(500) })
    expect(c.description.length).toBeLessThanOrEqual(300)
    expect(c.description.endsWith('…')).toBe(true)
  })
})

describe('rewriting the served HTML', () => {
  const html = () => rewriteHead(SHELL, card('sermons', 's-1', {
    id: 's-1',
    title: 'Sunday 15th September Sermon',
    summary: 'Sunday Divine Church Service Sermon.',
    thumbnailUrl: 'https://pub.r2.dev/image/sermon.jpg'
  }))

  it('puts the record\'s own tags in the head', () => {
    const out = html()
    expect(titleOf(out)).toBe('Sunday 15th September Sermon | CACI Taifa')
    expect(tag(out, 'property', 'og:title')).toBe('Sunday 15th September Sermon | CACI Taifa')
    expect(tag(out, 'property', 'og:image')).toBe('https://pub.r2.dev/image/sermon.jpg')
    expect(tag(out, 'property', 'og:url')).toBe('https://cacitaifa.com/sermons/s-1')
    expect(tag(out, 'name', 'twitter:card')).toBe('summary_large_image')
  })

  it('replaces the site-wide tags instead of sitting beside them', () => {
    const out = html()
    // Two og:title tags in one document is a coin toss over which one wins.
    expect(out.match(/property="og:title"/g)).toHaveLength(1)
    expect(out.match(/property="og:image"/g)).toHaveLength(1)
    expect(out.match(/<title/g)).toHaveLength(1)
    expect(out).not.toContain('Christ Apostolic Church International"')
  })

  it('carries Safari\'s app banner, pointing the app at this record', () => {
    // Safari reads it from the HTML as served; it never looks again once
    // the page's scripts have run.
    expect(tag(html(), 'name', 'apple-itunes-app'))
      .toBe('app-id=6813027106, app-argument=https://cacitaifa.com/sermons/s-1')
  })

  it('keeps site-wide tags it does not own', () => {
    expect(html()).toContain('og:site_name')
  })

  it('leaves the app shell intact so the page still boots', () => {
    expect(html()).toContain('<div id="__nuxt">')
  })

  it('escapes a title that would otherwise break the markup', () => {
    const out = rewriteHead(SHELL, card('events', 'e-2', {
      id: 'e-2',
      title: 'Men\'s "Iron Sharpens Iron" <Retreat>',
      description: 'A weekend away.'
    }))
    expect(out).toContain('&quot;Iron Sharpens Iron&quot;')
    expect(out).toContain('&lt;Retreat&gt;')
    expect(out).not.toContain('<Retreat>')
  })
})

describe('richer previews and search results', () => {
  const ldJson = html => {
    const m = /<script type="application\/ld\+json">([\s\S]*?)<\/script>/.exec(html)
    return m ? JSON.parse(m[1]) : null
  }

  const youtubeVideo = {
    id: 'v-1',
    title: 'Gifted to Break the Siege Part 2',
    description: 'The Chairman continues the message.',
    publishedOn: '2026-11-01T00:00:00Z',
    thumbnailUrl: 'https://img.youtube.com/vi/eKDNl6m1aFk/hqdefault.jpg',
    createdAt: '0001-01-01T00:00:00',
    media: {
      type: 'video',
      sourceUrl: 'https://www.youtube.com/watch?v=eKDNl6m1aFk',
      thumbnailUrl: 'https://img.youtube.com/vi/eKDNl6m1aFk/hqdefault.jpg',
      durationSeconds: 3725,
      metadata: { provider: 'youtube', embedUrl: 'https://www.youtube-nocookie.com/embed/eKDNl6m1aFk?rel=0' }
    }
  }

  const streamShort = {
    id: 's-9',
    kind: 'video',
    title: 'A Man Kept By God',
    caption: 'Kept.',
    publishedAt: '2026-11-01T17:50:22Z',
    content: {
      type: 'video',
      sourceUrl: 'https://customer-x.cloudflarestream.com/eyJtoken/manifest/video.m3u8',
      thumbnailUrl: 'https://customer-x.cloudflarestream.com/uid/thumbnails/thumbnail.jpg',
      durationSeconds: 81,
      metadata: { provider: 'stream' }
    }
  }

  const audioSermon = {
    id: 'a-1',
    title: 'Elevation by Divine Power',
    summary: 'God lifts a person up.',
    thumbnailUrl: 'https://imagedelivery.net/x/y/public',
    video: null,
    audio: { type: 'audio', sourceUrl: 'https://pub.r2.dev/audio/a.mp3', durationSeconds: 2885 }
  }

  it('gives a YouTube video a playable og:video and its known thumbnail size', () => {
    const out = rewriteHead(SHELL, card('videos', 'v-1', youtubeVideo))
    expect(tag(out, 'property', 'og:video')).toBe('https://www.youtube-nocookie.com/embed/eKDNl6m1aFk?rel=0')
    expect(tag(out, 'property', 'og:video:type')).toBe('text/html')
    expect(tag(out, 'property', 'og:image:width')).toBe('480')
    expect(tag(out, 'property', 'og:image:height')).toBe('360')
  })

  it('describes a video to Google as a VideoObject', () => {
    const data = ldJson(rewriteHead(SHELL, card('videos', 'v-1', youtubeVideo)))
    expect(data).toMatchObject({
      '@type': 'VideoObject',
      name: 'Gifted to Break the Siege Part 2',
      thumbnailUrl: ['https://img.youtube.com/vi/eKDNl6m1aFk/hqdefault.jpg'],
      uploadDate: '2026-11-01T00:00:00Z',
      duration: 'PT1H2M5S',
      embedUrl: 'https://www.youtube-nocookie.com/embed/eKDNl6m1aFk?rel=0'
    })
  })

  it('never hands out an expiring Stream link, but still marks the short up', () => {
    const out = rewriteHead(SHELL, card('shorts', 's-9', streamShort))
    expect(out).not.toContain('og:video')
    expect(out).not.toContain('m3u8')
    const data = ldJson(out)
    expect(data.duration).toBe('PT1M21S')
    expect(data.embedUrl).toBeUndefined()
    expect(data.contentUrl).toBeUndefined()
  })

  it('gives a plain video file as contentUrl', () => {
    const c = card('sermons', 's-1', {
      id: 's-1', title: 'T', thumbnailUrl: 'https://pub.r2.dev/i.jpg', preachedOn: '2026-10-20T16:50:00Z',
      video: { type: 'video', sourceUrl: 'https://pub.r2.dev/video/sermon.mp4' }
    })
    expect(c.video).toEqual({ url: 'https://pub.r2.dev/video/sermon.mp4', type: 'video/mp4', embed: false })
    expect(shareMeta.videoObject(c).contentUrl).toBe('https://pub.r2.dev/video/sermon.mp4')
  })

  it('gives an audio sermon og:audio and no VideoObject', () => {
    const out = rewriteHead(SHELL, card('sermons', 'a-1', audioSermon))
    expect(tag(out, 'property', 'og:audio')).toBe('https://pub.r2.dev/audio/a.mp3')
    expect(out).not.toContain('og:video')
    expect(ldJson(out)).toBeNull()
  })

  it('sends no VideoObject without an upload date, which Google requires', () => {
    const { publishedOn, ...undated } = youtubeVideo
    expect(shareMeta.videoObject(card('videos', 'v-1', { ...undated, createdAt: '0001-01-01T00:00:00' }))).toBeNull()
  })

  it('sends no VideoObject for an image short', () => {
    const c = card('shorts', 's-1', {
      id: 's-1', kind: 'image', title: 'YOUTH WEEK', publishedAt: '2026-10-27T09:35:18Z',
      content: { imageUrl: 'https://imagedelivery.net/x/y/public', altText: 'A youth week flyer' }
    })
    expect(shareMeta.videoObject(c)).toBeNull()
    expect(tag(rewriteHead(SHELL, c), 'property', 'og:image:alt')).toBe('A youth week flyer')
  })

  it('sizes the church fallback card', () => {
    const out = rewriteHead(SHELL, card('events', 'e-1', { id: 'e-1', title: 'Compound Cleaning' }))
    expect(tag(out, 'property', 'og:image:width')).toBe('1200')
    expect(tag(out, 'property', 'og:image:height')).toBe('630')
  })

  it('cannot be broken out of by a title containing </script>', () => {
    const out = rewriteHead(SHELL, card('videos', 'v-1', { ...youtubeVideo, title: 'x</script><script>alert(1)</script>' }))
    expect(out).not.toContain('</script><script>alert(1)')
    expect(ldJson(out).name).toBe('x</script><script>alert(1)</script>')
  })
})
