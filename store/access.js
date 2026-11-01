/**
 * The signed-in person's permissions, from `GET access/me`.
 *
 * Loaded once after sign-in (and on start when already signed in) by
 * plugins/access.js, and cleared on sign-out. The route guard waits on
 * `ensure` so a screen is never judged before this has arrived.
 */

// The request in flight, so the plugin and the guard share one call.
let pending = null
// Bumped on every clear: a response for a session that has since signed out
// must not land in the next one.
let generation = 0

export const state = () => ({
  me: null,
  loaded: false
})

export const getters = {
  me: state => state.me,
  loaded: state => state.loaded,
  roleName: state => (state.me && state.me.roleName) || ''
}

export const mutations = {
  set (state, me) {
    state.me = me
    state.loaded = true
  },
  clear (state) {
    state.me = null
    state.loaded = false
  }
}

export const actions = {
  /** Fetches access/me, replacing whatever is held. */
  load ({ commit }) {
    if (pending) { return pending }

    const ticket = generation
    pending = this.$axios.get('access/me').then(response => {
      if (ticket === generation) {
        commit('set', (response.data && response.data.data) || null)
      }
    }).catch(() => {
      // No answer means no permissions: only the screens open to everyone
      // are shown. Marked loaded so the guard does not wait forever.
      if (ticket === generation) { commit('set', null) }
    }).then(() => {
      pending = null
    })

    return pending
  },

  /** Resolves once access is known, loading it only if it is not. */
  ensure ({ state, dispatch }) {
    if (state.loaded) { return Promise.resolve() }
    return dispatch('load')
  },

  clear ({ commit }) {
    generation += 1
    pending = null
    commit('clear')
  }
}
