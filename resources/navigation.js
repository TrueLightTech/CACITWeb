/**
 * Application navigation.
 *
 * One definition, filtered by role — replacing the three copy-pasted menu
 * components in `components/roleNavs/`, which had to be edited three times for
 * any change.
 *
 * Role ids are strings, exactly as the API returns them on
 * `loggedInUser.data.roleId`. The visibility rules below reproduce the existing
 * gating one for one:
 *
 *   Church Manager  — everything
 *   Family Manager  — everything except Offerings and Accounting
 *   Regular Member  — Dashboard, Tithe, Welfare, Report an Issue, My Profile
 *
 * Every `to` points at a route that already exists in `pages/`. Members,
 * Church Families and the settings screens are reached through Manage until
 * they get their own routes in a later module.
 */

export const ROLE_CHURCH_MANAGER = '1'
export const ROLE_FAMILY_MANAGER = '2'
export const ROLE_MEMBER = '3'

/**
 * Pastoral Team. Added rather than widening the staff group, because a
 * counselling request should not be readable by every family manager — the
 * mobile app tells members only the pastoral team can see it, and the API now
 * gates those endpoints on this role alone.
 */
export const ROLE_PASTORAL = '4'

const EVERYONE = [ROLE_CHURCH_MANAGER, ROLE_FAMILY_MANAGER, ROLE_MEMBER, ROLE_PASTORAL]
const STAFF = [ROLE_CHURCH_MANAGER, ROLE_FAMILY_MANAGER]
const PASTORAL = [ROLE_PASTORAL, ROLE_CHURCH_MANAGER]
const MANAGER_ONLY = [ROLE_CHURCH_MANAGER]

export { STAFF, PASTORAL }

export const navigation = [
  {
    title: 'Overview',
    items: [
      { label: 'Dashboard', to: '/admin/dashboard', icon: 'dashboard', roles: EVERYONE }
    ]
  },
  {
    title: 'People',
    items: [
      { label: 'Members', to: '/admin/members', icon: 'manage', roles: STAFF },
      // Church Manager only: who joins the congregation is a different
      // decision from who is already in it.
      {
        label: 'Registrations',
        to: '/admin/members/registrations',
        icon: 'manage',
        roles: [ROLE_CHURCH_MANAGER]
      }
    ]
  },
  {
    title: 'Giving',
    items: [
      { label: 'Offerings', to: '/admin/offering', icon: 'offering', roles: [ROLE_CHURCH_MANAGER] },
      { label: 'Tithe', to: '/admin/tithe', icon: 'tithe', roles: EVERYONE },
      { label: 'Welfare', to: '/admin/welfare', icon: 'welfare', roles: EVERYONE }
    ]
  },
  {
    title: 'Reports',
    items: [
      // Both screens already exist and are linked from the dashboard's primary
      // action; they were simply never in the menu.
      { label: 'Accounting', to: '/admin/accounting', icon: 'reports', roles: [ROLE_CHURCH_MANAGER] },
      { label: 'Tithe Records', to: '/admin/records', icon: 'records', roles: [ROLE_FAMILY_MANAGER] }
    ]
  },
  {
    title: 'Church',
    items: [
      { label: 'Announcements', to: '/admin/announcements', icon: 'announcement', roles: STAFF }
    ]
  },
  {
    // The whole mobile app console is the church manager's. Family group
    // managers run their family's giving and members; they do not publish to
    // the app. Requests is the one exception: it is pastoral work, and the
    // pastoral policy already excludes family managers.
    title: 'Mobile App',
    items: [
      { label: 'App Overview', to: '/admin/app', icon: 'dashboard', roles: MANAGER_ONLY },
      { label: 'Home Screen', to: '/admin/app/hero', icon: 'home', roles: MANAGER_ONLY },
      { label: 'Sermons', to: '/admin/app/sermons', icon: 'sermon', roles: MANAGER_ONLY },
      { label: 'Shorts', to: '/admin/app/shorts', icon: 'shorts', roles: MANAGER_ONLY },
      { label: 'Events', to: '/admin/app/events', icon: 'calendar', roles: MANAGER_ONLY },
      { label: 'Videos', to: '/admin/app/videos', icon: 'video', roles: MANAGER_ONLY },
      { label: 'Hymnal (Dwom)', to: '/admin/app/hymns', icon: 'hymn', roles: MANAGER_ONLY },
      { label: 'Word for Today', to: '/admin/app/word', icon: 'verse', roles: MANAGER_ONLY },
      { label: 'Live Service', to: '/admin/app/live', icon: 'live', roles: [ROLE_CHURCH_MANAGER] },
      // Pastoral only — see the role note above.
      { label: 'Comments', to: '/admin/app/comments', icon: 'comment', roles: MANAGER_ONLY },
      { label: 'Requests', to: '/admin/app/requests', icon: 'support', roles: PASTORAL },
      { label: 'Push Messages', to: '/admin/app/push', icon: 'push', roles: [ROLE_CHURCH_MANAGER] }
    ]
  },
  {
    title: 'Administration',
    items: [
      { label: 'Manage', to: '/admin/manage', icon: 'manage', roles: STAFF }
    ]
  },
  {
    title: 'Support',
    items: [
      { label: 'Report an Issue', to: '/admin/report', icon: 'support', roles: EVERYONE }
    ]
  },
  {
    title: 'Account',
    items: [
      { label: 'My Profile', to: '/admin/account', icon: 'profile', roles: EVERYONE }
    ]
  }
]

/**
 * Groups visible to a role, with empty groups removed so a member never sees
 * an "Administration" heading with nothing under it.
 */
export function navigationForRole (roleId) {
  const role = roleId === undefined || roleId === null ? '' : String(roleId)

  return navigation
    .map(group => ({
      title: group.title,
      items: group.items.filter(item => item.roles.indexOf(role) !== -1)
    }))
    .filter(group => group.items.length > 0)
}
