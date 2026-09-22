import roleGuard from '../middleware/role-guard'
import { navigationForRole, ROLE_CHURCH_MANAGER, ROLE_FAMILY_MANAGER, ROLE_PASTORAL } from '../resources/navigation'

/**
 * Who can open the mobile app console.
 *
 * Publishing to the app is the church manager's job. A family group manager
 * runs their family's giving and members, and has no business putting a sermon
 * on every member's phone. Hiding the menu entry was never enough on its own —
 * without this guard, typing the address still opened the console, and it drew
 * as an empty screen full of failing requests rather than as a closed door.
 */
function visit (path, roleId) {
  const redirect = jest.fn()
  roleGuard({
    route: { path },
    store: {
      state: {
        auth: roleId
          ? { loggedIn: true, user: { data: { roleId } } }
          : { loggedIn: false, user: null }
      }
    },
    redirect
  })
  return redirect
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

describe('the mobile app console', () => {
  it.each(APP_SCREENS)('opens for the church manager: %s', path => {
    expect(visit(path, ROLE_CHURCH_MANAGER)).not.toHaveBeenCalled()
  })

  it.each(APP_SCREENS)('is closed to a family group manager: %s', path => {
    expect(visit(path, ROLE_FAMILY_MANAGER)).toHaveBeenCalledWith('/admin/dashboard')
  })

  it('covers screens below a menu entry too', () => {
    // /admin/app/sermons/new has no entry of its own; it inherits Sermons.
    expect(visit('/admin/app/sermons/new', ROLE_FAMILY_MANAGER)).toHaveBeenCalledWith('/admin/dashboard')
    expect(visit('/admin/app/sermons/abc/edit', ROLE_FAMILY_MANAGER)).toHaveBeenCalledWith('/admin/dashboard')
    expect(visit('/admin/app/sermons/new', ROLE_CHURCH_MANAGER)).not.toHaveBeenCalled()
  })
})

describe('requests stay pastoral', () => {
  it('opens for the pastoral team and the church manager', () => {
    expect(visit('/admin/app/requests', ROLE_PASTORAL)).not.toHaveBeenCalled()
    expect(visit('/admin/app/requests', ROLE_CHURCH_MANAGER)).not.toHaveBeenCalled()
  })

  it('is still closed to a family group manager', () => {
    expect(visit('/admin/app/requests', ROLE_FAMILY_MANAGER)).toHaveBeenCalledWith('/admin/dashboard')
  })
})

describe('a family group manager keeps their own work', () => {
  it.each([
    '/admin/dashboard',
    '/admin/members',
    '/admin/tithe',
    '/admin/welfare',
    '/admin/records',
    '/admin/announcements',
    '/admin/manage',
    '/admin/report',
    '/admin/account'
  ])('%s', path => {
    expect(visit(path, ROLE_FAMILY_MANAGER)).not.toHaveBeenCalled()
  })
})

describe('the guard stays out of the way', () => {
  it('leaves signed-out visitors to the auth middleware', () => {
    expect(visit('/admin/app/sermons', null)).not.toHaveBeenCalled()
  })

  it('ignores paths no menu entry governs', () => {
    // Public pages, and screens opened from inside another one.
    expect(visit('/sermons/abc', ROLE_FAMILY_MANAGER)).not.toHaveBeenCalled()
    expect(visit('/support', ROLE_FAMILY_MANAGER)).not.toHaveBeenCalled()
  })

  it('does not bounce the church manager anywhere', () => {
    navigationForRole(ROLE_CHURCH_MANAGER).forEach(group => {
      group.items.forEach(item => {
        expect(visit(item.to, ROLE_CHURCH_MANAGER)).not.toHaveBeenCalled()
      })
    })
  })
})

describe('the menu and the guard agree', () => {
  // They read the same definition, so a screen can never be listed for a role
  // the guard then turns away.
  it.each([ROLE_CHURCH_MANAGER, ROLE_FAMILY_MANAGER, ROLE_PASTORAL])('role %s', roleId => {
    navigationForRole(roleId).forEach(group => {
      group.items.forEach(item => {
        expect(visit(item.to, roleId)).not.toHaveBeenCalled()
      })
    })
  })

  it('no longer lists any app screen for a family group manager', () => {
    const groups = navigationForRole(ROLE_FAMILY_MANAGER)
    const appPaths = groups
      .reduce((all, g) => all.concat(g.items), [])
      .filter(item => item.to.indexOf('/admin/app') === 0)
    expect(appPaths).toEqual([])
  })
})
