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
