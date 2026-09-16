import {
  payload, rowsOf, pagingOf, errorMessage,
  toUtcIso, toLocalInput, duration, bytes,
  STATUS_LABELS, STATUS_BADGE, SHORT_ACTION_TARGETS
} from '../network/MobileApp'

/**
 * These helpers sit between every console screen and the API, so a mistake
 * here is a mistake on ten pages at once.
 */
describe('response unwrapping', () => {
  it('reads the payload out of the envelope', () => {
    expect(payload({ data: { data: { id: '1' } } })).toEqual({ id: '1' })
  })

  it('returns null rather than throwing on a shape it does not recognise', () => {
    expect(payload(null)).toBeNull()
    expect(payload({})).toBeNull()
    expect(payload({ data: {} })).toBeNull()
  })

  it('always returns an array of rows', () => {
    expect(rowsOf({ data: { data: { results: [1, 2] } } })).toEqual([1, 2])
    expect(rowsOf({ data: { data: [3, 4] } })).toEqual([3, 4])
    expect(rowsOf({ data: { data: {} } })).toEqual([])
    expect(rowsOf(null)).toEqual([])
  })
})

describe('paging', () => {
  // The API echoes pageIndex zero-based while the page it accepts is
  // one-based. Everything above this helper works in one-based pages, and
  // getting that wrong re-fetches page one forever.
  it('reports the page that was asked for, not the zero-based echo', () => {
    const response = { data: { data: { pageIndex: 0, pageSize: 20, totalPages: 3, totalCount: 55 } } }
    expect(pagingOf(response, 1).page).toBe(1)
  })

  it('converts the zero-based echo when no page was tracked', () => {
    const response = { data: { data: { pageIndex: 2, pageSize: 20, totalPages: 5, totalCount: 90 } } }
    expect(pagingOf(response).page).toBe(3)
  })

  it('survives a response with no paging at all', () => {
    expect(pagingOf({ data: { data: null } }, 1)).toEqual({
      page: 1, pageSize: 10, totalPages: 0, totalCount: 0
    })
  })
})

describe('error messages', () => {
  it('shows the API sentence when it was written for a person', () => {
    const error = { response: { data: { message: 'Describe the image for members using a screen reader.' } } }
    expect(errorMessage(error, 'fallback')).toBe('Describe the image for members using a screen reader.')
  })

  it('hides the ones that were not', () => {
    // These strings exist in the API today and must never reach a member.
    for (const message of ['OOps, something die', 'Oops, something really bad happened']) {
      expect(errorMessage({ response: { data: { message } } }, 'Could not save.')).toBe('Could not save.')
    }
  })

  it('falls back when there is no response at all', () => {
    expect(errorMessage(new Error('network'), 'Could not save.')).toBe('Could not save.')
    expect(errorMessage(null, 'Could not save.')).toBe('Could not save.')
  })
})

describe('datetime conversion', () => {
  it('round-trips a local input value through UTC', () => {
    const local = '2026-09-18T05:30'
    expect(toLocalInput(toUtcIso(local))).toBe(local)
  })

  it('produces a UTC instant the API can store', () => {
    expect(toUtcIso('2026-09-18T05:30')).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/)
  })

  it('treats empty and malformed values as nothing', () => {
    expect(toUtcIso('')).toBeNull()
    expect(toUtcIso('not a date')).toBeNull()
    expect(toLocalInput('')).toBe('')
    expect(toLocalInput('not a date')).toBe('')
  })
})

describe('formatting', () => {
  it('renders a duration as minutes and seconds', () => {
    expect(duration(0)).toBe('0:00')
    expect(duration(59)).toBe('0:59')
    expect(duration(2840)).toBe('47:20')
  })

  it('renders a file size', () => {
    expect(bytes(0)).toBe('')
    expect(bytes(512)).toBe('512 B')
    expect(bytes(4 * 1024 * 1024)).toBe('4.0 MB')
  })
})

describe('publishing vocabulary', () => {
  it('names every status the API can return', () => {
    for (const status of ['draft', 'scheduled', 'published', 'archived']) {
      expect(STATUS_LABELS[status]).toBeTruthy()
      expect(STATUS_BADGE[status]).toMatch(/^ds-badge--/)
    }
  })
})

describe('short action targets', () => {
  // action.route is an in-app path, never a web URL — a typo there is a dead
  // end the member cannot recover from, which is why the console offers a
  // picker built from this list.
  it('every target builds an in-app path', () => {
    for (const target of SHORT_ACTION_TARGETS) {
      expect(target.path.startsWith('/')).toBe(true)
      expect(target.path.endsWith('/')).toBe(true)
      expect(`${target.path}abc123`).not.toMatch(/^https?:/)
    }
  })
})
