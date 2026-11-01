import { navigation, routeRules } from '../resources/navigation'
import { allows } from '../resources/access'

/**
 * Stops a signed-in user opening a screen they have no permission for.
 *
 * Hiding a link is not access control: until the guard existed, a family group
 * manager who typed /admin/app/sermons landed on the mobile app console. The
 * API refuses them, but the page still drew — an empty console full of failing
 * requests, which reads as a broken app rather than as a closed door.
 *
 * The rule comes from resources/navigation.js rather than a second list here,
 * so a screen cannot be visible in the menu and barred by the guard, or the
 * reverse. Paths below a menu entry inherit it: /admin/app/sermons/new is
 * governed by the Sermons entry. `routeRules` add the few child screens that
 * need more than their parent, such as a member's membership form.
 */

const ENTRIES = navigation
  .reduce((all, group) => all.concat(group.items), [])
  .concat(routeRules)
  .map(entry => Object.assign({ segments: entry.to.split('/').filter(Boolean) }, entry))

/** How well `entry` matches `parts`, or -1. More segments win, then literals. */
function score (entry, parts) {
  const segments = entry.segments
  if (segments.length > parts.length) { return -1 }
  if (entry.exact && segments.length !== parts.length) { return -1 }

  let literals = 0
  for (let i = 0; i < segments.length; i++) {
    if (segments[i].charAt(0) === ':') { continue }
    if (segments[i] !== parts[i]) { return -1 }
    literals += 1
  }
  return segments.length * 100 + literals
}

/** Longest match wins, so a child entry beats its parent. */
export function entryFor (path) {
  const parts = path.split('/').filter(Boolean)
  let best = null
  let bestScore = -1

  ENTRIES.forEach(entry => {
    const value = score(entry, parts)
    if (value > bestScore) {
      best = entry
      bestScore = value
    }
  })

  return best
}

export default async function ({ route, store, redirect }) {
  const auth = store.state.auth
  if (!auth || !auth.loggedIn) {
    // Not signed in: `auth` middleware owns that case.
    return
  }

  // Wait for access/me before deciding anything, and so that every page can
  // rely on $can being answered by the time it mounts.
  await store.dispatch('access/ensure')

  const path = route.path.replace(/\/$/, '') || '/'
  const entry = entryFor(path)

  // No entry governs this path — a public page, or a screen reached from
  // inside another one. Left alone deliberately: this guard exists to enforce
  // what the menu already says, not to become a second router.
  if (!entry) { return }

  if (allows(store.state.access.me, entry)) { return }

  return redirect('/admin/dashboard')
}
