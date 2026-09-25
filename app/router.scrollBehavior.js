import { getMatchedComponents, setScrollRestoration } from './utils'

// Nuxt's default scroll behaviour (.nuxt/router.scrollBehavior.js), with two
// changes for anchors: the element's own scroll-margin-top is honoured, which
// vue-router ignores, so a section is not hidden under the public site's
// sticky header; and on a first load the anchor is looked for over a few
// frames, because the page chunk may not have mounted when this first runs.

if (process.client) {
  if ('scrollRestoration' in window.history) {
    setScrollRestoration('manual')

    window.addEventListener('beforeunload', () => {
      setScrollRestoration('auto')
    })

    window.addEventListener('load', () => {
      setScrollRestoration('manual')
    })
  }
}

function shouldScrollToTop (route) {
  const Pages = getMatchedComponents(route)
  if (Pages.length === 1) {
    const { options = {} } = Pages[0]
    return options.scrollToTop !== false
  }
  return Pages.some(({ options }) => options && options.scrollToTop)
}

function anchorSelector (hash) {
  if (typeof window.CSS !== 'undefined' && typeof window.CSS.escape !== 'undefined') {
    return '#' + window.CSS.escape(hash.substr(1))
  }
  return hash
}

function findAnchor (selector, framesLeft) {
  return new Promise((resolve) => {
    const look = (left) => {
      let el = null
      try { el = document.querySelector(selector) } catch (e) {}
      if (el || left <= 0) { return resolve(el) }
      requestAnimationFrame(() => look(left - 1))
    }
    look(framesLeft)
  })
}

export default function (to, from, savedPosition) {
  let position = false
  const isRouteChanged = to !== from

  if (savedPosition) {
    position = savedPosition
  } else if (isRouteChanged && shouldScrollToTop(to)) {
    position = { x: 0, y: 0 }
  }

  const nuxt = window.$nuxt

  if (
    // Initial load (vuejs/vue-router#3199)
    !isRouteChanged ||
    // Route hash changes
    (to.path === from.path && to.hash !== from.hash)
  ) {
    nuxt.$nextTick(() => nuxt.$emit('triggerScroll'))
  }

  return new Promise((resolve) => {
    nuxt.$once('triggerScroll', () => {
      if (!to.hash) { return resolve(position) }

      const selector = anchorSelector(to.hash)
      findAnchor(selector, isRouteChanged ? 1 : 120).then((el) => {
        if (el) {
          const margin = parseFloat(getComputedStyle(el).scrollMarginTop) || 0
          position = { selector, offset: { x: 0, y: margin } }
        }
        resolve(position)
      })
    })
  })
}
