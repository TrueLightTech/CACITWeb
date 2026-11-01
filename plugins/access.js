import { can, canAny, canChurch, familiesFor } from '../resources/access'

/**
 * `this.$can(code, familyId?)` and friends, for showing and hiding.
 *
 * Registered through `auth.plugins` in nuxt.config.js so it runs after
 * `$auth` has restored the session. Reads the store each call, so computed
 * properties that use it update when access loads or changes.
 */
export default function ({ store, $auth }, inject) {
  const me = () => store.state.access.me

  inject('can', (code, familyId) => can(me(), code, familyId))
  inject('canAny', (codes, familyId) => canAny(me(), codes, familyId))
  inject('canChurch', code => canChurch(me(), code))
  inject('familiesFor', code => familiesFor(me(), code))

  if ($auth.loggedIn) {
    store.dispatch('access/load')
  }

  // Signing in loads the new person's access; signing out drops it, so the
  // next person to sign in on this browser never sees the last one's menu.
  // `ensure` rather than `load`: the guard may already have asked for it on
  // the redirect that follows sign-in, and one request serves both.
  $auth.$storage.watchState('loggedIn', loggedIn => {
    store.dispatch(loggedIn ? 'access/ensure' : 'access/clear')
  })
}
