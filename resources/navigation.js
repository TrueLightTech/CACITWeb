import { allows } from './access'

/**
 * Application navigation.
 *
 * One definition, filtered by what the signed-in person may do. Each entry
 * names the permission its screen's endpoints check — `permission` for one
 * code, `anyOf` when any of several will do. An entry with neither is open to
 * everyone signed in: the dashboard, your own tithe and welfare, your profile.
 *
 * The route guard reads the same table (plus `routeRules` below), so a screen
 * cannot be listed in the menu and then refused, or the reverse.
 *
 * Every `to` points at a route that already exists in `pages/`.
 */

export const navigation = [
  {
    title: 'Overview',
    items: [
      { label: 'Dashboard', to: '/admin/dashboard', icon: 'dashboard' }
    ]
  },
  {
    title: 'People',
    items: [
      { label: 'Members', to: '/admin/members', icon: 'manage', permission: 'members.view' },
      // Its own permission: who joins the congregation is a different
      // decision from who is already in it.
      {
        label: 'Registrations',
        to: '/admin/members/registrations',
        icon: 'manage',
        permission: 'members.approve'
      },
      // Counted from the app's location check-ins. Someone scoped to a family
      // sees that family only; the API enforces it.
      { label: 'Attendance', to: '/admin/attendance', icon: 'pin', permission: 'attendance.view' }
    ]
  },
  {
    title: 'Giving',
    items: [
      { label: 'Offerings', to: '/admin/offering', icon: 'offering', permission: 'finance.offering.view' },
      // Your own giving: open to everyone.
      { label: 'Tithe', to: '/admin/tithe', icon: 'tithe' },
      { label: 'Welfare', to: '/admin/welfare', icon: 'welfare' }
    ]
  },
  {
    title: 'Reports',
    items: [
      { label: 'Accounting', to: '/admin/accounting', icon: 'reports', permission: 'finance.reports.view' },
      // Tithe totals per member of a family.
      { label: 'Tithe Records', to: '/admin/records', icon: 'records', permission: 'finance.tithe.view' }
    ]
  },
  {
    title: 'Church',
    items: [
      { label: 'Announcements', to: '/admin/announcements', icon: 'announcement', permission: 'content.announcements.manage' }
    ]
  },
  {
    // Each screen of the mobile app console has its own permission, so
    // someone can be trusted with sermons without also sending pushes to the
    // whole church.
    title: 'Mobile App',
    items: [
      { label: 'App Overview', to: '/admin/app', icon: 'dashboard', permission: 'app.overview.view' },
      { label: 'Home Screen', to: '/admin/app/hero', icon: 'home', permission: 'content.home.manage' },
      { label: 'Sermons', to: '/admin/app/sermons', icon: 'sermon', permission: 'content.sermons.manage' },
      { label: 'Shorts', to: '/admin/app/shorts', icon: 'shorts', permission: 'content.shorts.manage' },
      { label: 'Events', to: '/admin/app/events', icon: 'calendar', permission: 'content.events.manage' },
      { label: 'Event Questions', to: '/admin/app/questions', icon: 'question', permission: 'content.events.manage' },
      { label: 'Videos', to: '/admin/app/videos', icon: 'video', permission: 'content.videos.manage' },
      { label: 'Hymnal (Dwom)', to: '/admin/app/hymns', icon: 'hymn', permission: 'content.hymns.manage' },
      { label: 'Word for Today', to: '/admin/app/word', icon: 'verse', permission: 'content.home.manage' },
      { label: 'Live Service', to: '/admin/app/live', icon: 'live', permission: 'content.live.manage' },
      { label: 'Comments', to: '/admin/app/comments', icon: 'comment', permission: 'engagement.moderate' },
      { label: 'Reported Posts', to: '/admin/app/reported', icon: 'flag', permission: 'engagement.moderate' },
      // Pastoral work: a counselling request is not for every family manager.
      { label: 'Requests', to: '/admin/app/requests', icon: 'support', permission: 'pastoral.requests.manage' },
      { label: 'Push Messages', to: '/admin/app/push', icon: 'push', permission: 'comms.push.send' },
      { label: 'App Updates', to: '/admin/app/release', icon: 'update', permission: 'app.release.manage' }
    ]
  },
  {
    title: 'Administration',
    items: [
      // Each tab of Manage has its own permission; any one opens the screen.
      {
        label: 'Manage',
        to: '/admin/manage',
        icon: 'manage',
        anyOf: [
          'issues.manage',
          'org.families.manage',
          'org.groups.manage',
          'org.services.manage',
          'finance.settings.manage'
        ]
      }
    ]
  },
  {
    title: 'Access Control',
    items: [
      { label: 'People with access', to: '/admin/access', icon: 'shield', permission: 'access.manage' },
      { label: 'Roles', to: '/admin/access/roles', icon: 'manage', permission: 'access.manage' },
      { label: 'Access history', to: '/admin/access/history', icon: 'records', permission: 'access.manage' }
    ]
  },
  {
    title: 'Support',
    items: [
      { label: 'Report an Issue', to: '/admin/report', icon: 'support' }
    ]
  },
  {
    title: 'Account',
    items: [
      { label: 'My Profile', to: '/admin/account', icon: 'profile' }
    ]
  }
]

/**
 * Screens below a menu entry that need more than the entry does. Not shown in
 * the menu; read by the route guard only. `:name` matches any one segment,
 * and `exact` stops a rule from also governing the paths below it.
 *
 * Opening a member needs only the member list; their membership form, giving
 * and the screens that change them each need their own permission.
 */
export const routeRules = [
  { to: '/admin/members/new', permission: 'members.create' },
  { to: '/admin/members/:id', permission: 'members.edit', exact: true },
  { to: '/admin/members/:id/view', permission: 'members.view' },
  { to: '/admin/members/:id/membership-form', permission: 'members.personal.view' },
  { to: '/admin/members/:id/tithe', permission: 'finance.tithe.view' },
  { to: '/admin/members/:id/welfare', permission: 'finance.welfare.view' },
  { to: '/admin/members/:id/role', permission: 'access.manage' },
  // The dashboard links every member to an announcement; managing them is
  // still Announcements' permission.
  { to: '/admin/announcements/:id', exact: true },
  { to: '/admin/announcements/new', permission: 'content.announcements.manage' }
]

/**
 * Groups visible to this person, with empty groups removed so a member never
 * sees an "Administration" heading with nothing under it.
 */
export function navigationFor (access) {
  return navigation
    .map(group => ({
      title: group.title,
      items: group.items.filter(item => allows(access, item))
    }))
    .filter(group => group.items.length > 0)
}

/**
 * The one sidebar item to highlight for `path`: the item whose address is the
 * longest whole-segment prefix of it.
 *
 * The router's own active class matches every prefix, so on
 * /admin/access/roles both "Roles" and "People with access" (/admin/access)
 * lit up, and every app screen also lit "App Overview" (/admin/app).
 */
export function activeNavTarget (groups, path) {
  const current = (path || '').replace(/\/+$/, '') || '/'
  let best = null

  for (const group of groups || []) {
    for (const item of group.items) {
      const to = item.to.replace(/\/+$/, '')
      const matches = current === to || current.startsWith(to + '/')
      if (matches && (!best || to.length > best.length)) {
        best = to
      }
    }
  }

  return best
}
