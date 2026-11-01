import roleGuard, { entryFor } from '../middleware/role-guard'
import { navigationFor } from '../resources/navigation'
import { can, canAny, canChurch, familiesFor } from '../resources/access'

/**
 * Who can open which screen.
 *
 * The guard and the menu read one table (resources/navigation.js), and both
 * judge it against the person's permissions from `access/me`. The API is the
 * real boundary; this only stops a screen drawing as an empty page full of
 * refused requests.
 */

const family = familyIds => ({ church: false, familyIds })
const church = { church: true, familyIds: [] }

const CHURCH_MANAGER = { roleId: '1', roleName: 'Church Manager', fullAccess: true, permissions: {} }

const FAMILY_MANAGER = {
  roleId: '2',
  roleName: 'Family Group Manager',
  fullAccess: false,
  familyId: 'fam1',
  permissions: {
    'members.view': family(['fam1']),
    'members.edit': family(['fam1']),
    'finance.tithe.view': family(['fam1']),
    'finance.tithe.record': family(['fam1']),
    'finance.contributors.view': family(['fam1']),
    'attendance.view': family(['fam1'])
  }
}

const PASTORAL = {
  roleId: '4',
  roleName: 'Pastoral Team',
  fullAccess: false,
  permissions: { 'pastoral.requests.manage': church }
}

const MEMBER = { roleId: '3', roleName: 'Member', fullAccess: false, permissions: {} }

/** A member given a few things by hand: the case the whole system is for. */
const BARB = {
  roleId: '3',
  roleName: 'Member',
  fullAccess: false,
  familyId: 'fam2',
  permissions: {
    'finance.tithe.record': family(['fam2']),
    'attendance.view': church,
    'finance.contributors.view': family(['fam2'])
  }
}

function visit (path, access, loggedIn = true) {
  const redirect = jest.fn()
  const store = {
    state: {
      auth: loggedIn ? { loggedIn: true, user: { data: {} } } : { loggedIn: false, user: null },
      access: { me: null, loaded: false }
    },
    dispatch: jest.fn(() => {
      // Access arrives only when the guard asks for it, so a guard that
      // decided before waiting would see nothing and refuse everyone.
      store.state.access = { me: access, loaded: true }
      return Promise.resolve()
    })
  }
  return roleGuard({ route: { path }, store, redirect }).then(() => ({ redirect, store }))
}

async function redirected (path, access) {
  const { redirect } = await visit(path, access)
  return redirect.mock.calls.length > 0
}

const APP_SCREENS = [
  '/admin/app',
  '/admin/app/hero',
  '/admin/app/sermons',
  '/admin/app/shorts',
  '/admin/app/events',
  '/admin/app/videos',
  '/admin/app/hymns',
  '/admin/app/word',
  '/admin/app/live',
  '/admin/app/comments',
  '/admin/app/push'
]

describe('$can', () => {
  it('needs the code', () => {
    expect(can(BARB, 'finance.tithe.record')).toBe(true)
    expect(can(BARB, 'finance.tithe.edit')).toBe(false)
    expect(can(null, 'members.view')).toBe(false)
  })

  it('checks a family against the scope', () => {
    expect(can(BARB, 'finance.tithe.record', 'fam2')).toBe(true)
    expect(can(BARB, 'finance.tithe.record', 'fam1')).toBe(false)
    expect(can(BARB, 'attendance.view', 'fam1')).toBe(true)
  })

  it('gives full access everything', () => {
    expect(can(CHURCH_MANAGER, 'access.manage', 'any')).toBe(true)
    expect(canChurch(CHURCH_MANAGER, 'members.view')).toBe(true)
  })

  it('answers any-of, church scope and scoped families', () => {
    expect(canAny(BARB, ['members.view', 'attendance.view'])).toBe(true)
    expect(canAny(BARB, ['members.view', 'issues.manage'])).toBe(false)
    expect(canChurch(BARB, 'finance.tithe.record')).toBe(false)
    expect(familiesFor(BARB, 'finance.tithe.record')).toEqual(['fam2'])
    expect(familiesFor(BARB, 'attendance.view')).toEqual([])
  })
})

describe('the mobile app console', () => {
  it.each(APP_SCREENS)('opens for the church manager: %s', async path => {
    expect(await redirected(path, CHURCH_MANAGER)).toBe(false)
  })

  it.each(APP_SCREENS)('is closed to a family group manager: %s', async path => {
    const { redirect } = await visit(path, FAMILY_MANAGER)
    expect(redirect).toHaveBeenCalledWith('/admin/dashboard')
  })

  it('opens one screen for whoever holds its permission, and no other', async () => {
    const sermonsOnly = { fullAccess: false, permissions: { 'content.sermons.manage': church } }
    expect(await redirected('/admin/app/sermons', sermonsOnly)).toBe(false)
    expect(await redirected('/admin/app/sermons/new', sermonsOnly)).toBe(false)
    expect(await redirected('/admin/app/push', sermonsOnly)).toBe(true)
    expect(await redirected('/admin/app', sermonsOnly)).toBe(true)
  })

  it('covers screens below a menu entry too', async () => {
    // /admin/app/sermons/new has no entry of its own; it inherits Sermons.
    expect(await redirected('/admin/app/sermons/new', FAMILY_MANAGER)).toBe(true)
    expect(await redirected('/admin/app/sermons/abc/edit', FAMILY_MANAGER)).toBe(true)
    expect(await redirected('/admin/app/sermons/new', CHURCH_MANAGER)).toBe(false)
  })
})

describe('requests stay pastoral', () => {
  it('opens for the pastoral team and the church manager', async () => {
    expect(await redirected('/admin/app/requests', PASTORAL)).toBe(false)
    expect(await redirected('/admin/app/requests', CHURCH_MANAGER)).toBe(false)
  })

  it('is still closed to a family group manager', async () => {
    expect(await redirected('/admin/app/requests', FAMILY_MANAGER)).toBe(true)
  })
})

describe('a family group manager keeps their own work', () => {
  it.each([
    '/admin/dashboard',
    '/admin/members',
    '/admin/members/abc/view',
    '/admin/members/abc',
    '/admin/members/abc/tithe',
    '/admin/tithe',
    '/admin/welfare',
    '/admin/records',
    '/admin/attendance',
    '/admin/report',
    '/admin/account'
  ])('%s', async path => {
    expect(await redirected(path, FAMILY_MANAGER)).toBe(false)
  })
})

describe('screens below Members that need more than the list', () => {
  it.each([
    ['/admin/members/new', 'members.create'],
    ['/admin/members/abc/membership-form', 'members.personal.view'],
    ['/admin/members/abc/welfare', 'finance.welfare.view'],
    ['/admin/members/abc/role', 'access.manage']
  ])('%s needs %s', async (path, code) => {
    expect(entryFor(path).permission).toBe(code)
    expect(await redirected(path, FAMILY_MANAGER)).toBe(true)

    const holder = { fullAccess: false, permissions: { [code]: church, 'members.view': church } }
    expect(await redirected(path, holder)).toBe(false)
  })

  it('tells new and registrations apart from a member id', () => {
    expect(entryFor('/admin/members/new').permission).toBe('members.create')
    expect(entryFor('/admin/members/registrations').permission).toBe('members.approve')
    expect(entryFor('/admin/members/abc').permission).toBe('members.edit')
  })
})

describe('announcements', () => {
  it('lets everyone read one, as the dashboard links it', async () => {
    expect(await redirected('/admin/announcements/abc', MEMBER)).toBe(false)
  })

  it('keeps the list, new and edit for whoever manages them', async () => {
    expect(await redirected('/admin/announcements', MEMBER)).toBe(true)
    expect(await redirected('/admin/announcements/new', MEMBER)).toBe(true)
    expect(await redirected('/admin/announcements/abc/edit', MEMBER)).toBe(true)

    const editor = { fullAccess: false, permissions: { 'content.announcements.manage': church } }
    expect(await redirected('/admin/announcements/new', editor)).toBe(false)
    expect(await redirected('/admin/announcements/abc/edit', editor)).toBe(false)
  })
})

describe('Manage and Access Control', () => {
  it('opens Manage for any one of its tabs', async () => {
    const issuesOnly = { fullAccess: false, permissions: { 'issues.manage': church } }
    expect(await redirected('/admin/manage', issuesOnly)).toBe(false)
    expect(await redirected('/admin/manage', FAMILY_MANAGER)).toBe(true)
  })

  it('keeps access control for access.manage', async () => {
    expect(await redirected('/admin/access', FAMILY_MANAGER)).toBe(true)
    expect(await redirected('/admin/access/people/abc', FAMILY_MANAGER)).toBe(true)
    expect(await redirected('/admin/access/roles', CHURCH_MANAGER)).toBe(false)
  })
})

describe('the guard stays out of the way', () => {
  it('leaves signed-out visitors to the auth middleware', async () => {
    const { redirect, store } = await visit('/admin/app/sermons', null, false)
    expect(redirect).not.toHaveBeenCalled()
    expect(store.dispatch).not.toHaveBeenCalled()
  })

  it('waits for access before deciding', async () => {
    const { store } = await visit('/admin/dashboard', MEMBER)
    expect(store.dispatch).toHaveBeenCalledWith('access/ensure')
  })

  it('ignores paths no entry governs', async () => {
    // Public pages, and screens opened from inside another one.
    expect(await redirected('/sermons/abc', MEMBER)).toBe(false)
    expect(await redirected('/support', MEMBER)).toBe(false)
  })

  it('refuses everything gated when access/me could not be loaded', async () => {
    expect(await redirected('/admin/members', null)).toBe(true)
    expect(await redirected('/admin/dashboard', null)).toBe(false)
  })
})

describe('the menu and the guard agree', () => {
  // They read the same definition, so a screen can never be listed for
  // someone the guard then turns away.
  it.each([
    ['church manager', CHURCH_MANAGER],
    ['family group manager', FAMILY_MANAGER],
    ['pastoral team', PASTORAL],
    ['member', MEMBER],
    ['Barb', BARB]
  ])('%s', async (name, access) => {
    const items = navigationFor(access).reduce((all, g) => all.concat(g.items), [])
    for (const item of items) {
      expect(await redirected(item.to, access)).toBe(false)
    }
  })

  it('shows Barb exactly what she was given', () => {
    const labels = navigationFor(BARB).reduce((all, g) => all.concat(g.items), []).map(item => item.label)
    expect(labels).toContain('Attendance')
    expect(labels).not.toContain('Members')
    expect(labels).not.toContain('Accounting')
    expect(labels).not.toContain('People with access')
  })

  it('lists no app screen for a family group manager', () => {
    const appPaths = navigationFor(FAMILY_MANAGER)
      .reduce((all, g) => all.concat(g.items), [])
      .filter(item => item.to.indexOf('/admin/app') === 0)
    expect(appPaths).toEqual([])
  })
})
