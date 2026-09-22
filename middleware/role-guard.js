import { navigation } from '../resources/navigation'

/**
 * Stops a signed-in user opening a screen their role has no menu entry for.
 *
 * Hiding a link is not access control: until now the only route middleware was
 * `auth`, so a family group manager who typed /admin/app/sermons landed on the
 * mobile app console. The API refuses them, but the page still drew — an empty
 * console full of failing requests, which reads as a broken app rather than as
 * a closed door.
 *
 * The rule comes from resources/navigation.js rather than a second list here,
 * so a screen cannot be visible in the menu and barred by the guard, or the
 * reverse. Paths below a menu entry inherit it: /admin/app/sermons/new is
 * governed by the Sermons entry.
 */

/** Longest match wins, so a child entry beats its parent. */
function entryFor (path) {
  let best = null

  navigation.forEach(group => {
    group.items.forEach(item => {
      const isMatch = path === item.to || path.indexOf(item.to + '/') === 0
      if (isMatch && (!best || item.to.length > best.to.length)) {
        best = item
      }
    })
  })

  return best
}

export default function ({ route, store, redirect }) {
  const auth = store.state.auth
  if (!auth || !auth.loggedIn || !auth.user || !auth.user.data) {
    // Not signed in: `auth` middleware owns that case.
    return
  }

  const path = route.path.replace(/\/$/, '') || '/'
  const entry = entryFor(path)

  // No menu entry governs this path — a public page, or a screen reached from
  // inside another one. Left alone deliberately: this guard exists to enforce
  // what the menu already says, not to become a second router.
  if (!entry) { return }

  const roleId = String(auth.user.data.roleId)
  if (entry.roles.indexOf(roleId) !== -1) { return }

  return redirect('/admin/dashboard')
}
