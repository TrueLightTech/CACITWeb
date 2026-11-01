import { activeNavTarget, navigationFor } from '../resources/navigation'

// A church manager sees every item, so every overlap is in play.
const groups = navigationFor({ fullAccess: true, permissions: {} })

describe('the sidebar highlights one item', () => {
  test.each([
    ['/admin/access', '/admin/access'],
    ['/admin/access/roles', '/admin/access/roles'],
    ['/admin/access/history', '/admin/access/history'],
    ['/admin/access/people/abc123', '/admin/access'],
    ['/admin/members', '/admin/members'],
    ['/admin/members/registrations', '/admin/members/registrations'],
    ['/admin/members/abc123/view', '/admin/members'],
    ['/admin/app', '/admin/app'],
    ['/admin/app/sermons', '/admin/app/sermons'],
    ['/admin/app/sermons/new', '/admin/app/sermons'],
    ['/admin/tithe/', '/admin/tithe']
  ])('%s highlights %s', (path, expected) => {
    expect(activeNavTarget(groups, path)).toBe(expected)
  })

  test('a shared prefix that is not a whole segment does not match', () => {
    expect(activeNavTarget([{ items: [{ to: '/admin/app' }] }], '/admin/apple')).toBeNull()
  })

  test('a page with no item highlights nothing', () => {
    expect(activeNavTarget(groups, '/admin/unknown')).toBeNull()
  })
})
