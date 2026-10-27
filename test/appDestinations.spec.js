const {
  PUSH_DESTINATIONS,
  destinationFor,
  needsItem,
  deepLinkFor
} = require('../resources/appDestinations')

/**
 * The path a broadcast carries into the app.
 *
 * A message sent without one lands the member on the home screen, so the
 * only thing that matters here is that a destination the office *did* choose
 * comes out as a path the app's router recognises — and that a half-made
 * choice comes out as nothing at all rather than as a path with a hole in it.
 */
describe('where a push notification points', () => {
  test('nowhere in particular carries no link', () => {
    expect(deepLinkFor('', '')).toBeNull()
    expect(deepLinkFor('', 'anything')).toBeNull()
  })

  test('the live service needs nothing chosen', () => {
    expect(needsItem('live')).toBe(false)
    expect(deepLinkFor('live')).toBe('/live')
  })

  test('a particular thing becomes the app path for it', () => {
    expect(deepLinkFor('sermon', 'abc123')).toBe('/sermon/abc123')
    expect(deepLinkFor('event', 'e-1')).toBe('/event/e-1')
    expect(deepLinkFor('announcement', 'a-1')).toBe('/announcement/a-1')
  })

  test('a kind chosen with nothing picked yet carries no link', () => {
    expect(deepLinkFor('sermon', '')).toBeNull()
    expect(deepLinkFor('sermon', '   ')).toBeNull()
    expect(deepLinkFor('sermon', null)).toBeNull()
    expect(deepLinkFor('sermon', undefined)).toBeNull()
  })

  test('a kind we do not offer carries no link', () => {
    expect(destinationFor('giving')).toBeNull()
    expect(deepLinkFor('giving', 'g-1')).toBeNull()
  })

  /**
   * The app routes these as `/sermon/:id`, not `/sermons/:id`. The singular
   * is not a typo and the plural lands on nothing, so it is pinned here.
   */
  test('the paths are the singular ones the app actually routes', () => {
    const kinds = PUSH_DESTINATIONS.filter(d => d.endpoint).map(d => d.kind)

    expect(kinds).toEqual(['announcement', 'event', 'sermon'])
    kinds.forEach((kind) => {
      expect(deepLinkFor(kind, 'x')).toBe(`/${kind}/x`)
    })
  })

  test('every offered destination says what it is called', () => {
    PUSH_DESTINATIONS.forEach((option) => {
      expect(typeof option.label).toBe('string')
      expect(option.label.length).toBeGreaterThan(0)
      if (option.endpoint) { expect(typeof option.noun).toBe('string') }
    })
  })
})
