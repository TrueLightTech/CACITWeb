// Absolute URLs are not optional in a link preview: a crawler fetching the
// page has no base to resolve '/og-image.jpg' against, and silently drops it.
const SITE_URL = (process.env.SITE_URL || 'https://cacitaifa.com').replace(/\/+$/, '')

export default {
  // Disable server-side rendering: https://go.nuxtjs.dev/ssr-mode
  ssr: false,

  // Target: https://go.nuxtjs.dev/config-target
  //
  // 'server', not 'static', so serverMiddleware runs on every request and can
  // put a record's own link preview into the HTML before it is sent. Rendering
  // is unchanged — ssr stays false above, so pages are still built entirely in
  // the browser and nothing here can break on a server render.
  //
  // 'static' would freeze the head at build time, and the church publishes
  // weekly: anything added after a deploy would preview as the generic card
  // until the next one.
  target: 'server',
  env: {
    IMAGE_BASE_URL: process.env.IMAGE_BASE_URL || "https://pub-78c3b0ef114642b8859d4d64c75e96c3.r2.dev"
  },

  // Global page headers: https://go.nuxtjs.dev/config-head
  head: {
    title: 'CACI Taifa Central Assembly | Miracle Centre',
    titleTemplate: '%s',
    htmlAttrs: {
      lang: 'en'
    },
    meta: [
      { charset: 'utf-8' },
      { name: 'viewport', content: 'width=device-width, initial-scale=1, shrink-to-fit=no' },
      { hid: 'description', name: 'description', content: 'Official platform of Christ Apostolic Church International, Taifa Central Assembly (Miracle Centre), Accra, Ghana. Worship schedules, sermon archives, digital tithes & offerings, and mobile app download.' },
      { hid: 'keywords', name: 'keywords', content: 'Christ Apostolic Church International, CACI Taifa, CACI Taifa Central, Miracle Centre, Church in Taifa Accra, Christian Church Ghana, CACI Mobile App, Tithe and Offering, CACI Hymns Dwom' },
      { name: 'author', content: 'Christ Apostolic Church International - Taifa Central' },
      { name: 'theme-color', content: '#0f172a' },
      { name: 'format-detection', content: 'telephone=no' },

      // Mobile Web App
      { name: 'mobile-web-app-capable', content: 'yes' },
      { name: 'apple-mobile-web-app-capable', content: 'yes' },
      { name: 'apple-mobile-web-app-title', content: 'CACI Taifa' },
      { name: 'apple-mobile-web-app-status-bar-style', content: 'black-translucent' },

      // Open Graph / Facebook / WhatsApp
      { hid: 'og:type', property: 'og:type', content: 'website' },
      { hid: 'og:site_name', property: 'og:site_name', content: 'CACI Taifa Central Assembly' },
      { hid: 'og:title', property: 'og:title', content: 'Christ Apostolic Church International — Taifa Central Assembly (Miracle Centre)' },
      { hid: 'og:description', property: 'og:description', content: 'Join us for the Sunday Divine Service at 9:00 AM, and midweek services on Wednesdays and Fridays, at the Miracle Centre on Loquat Street, Taifa.' },
      { hid: 'og:image', property: 'og:image', content: `${SITE_URL}/og-image.jpg` },
      { hid: 'og:url', property: 'og:url', content: SITE_URL },
      { hid: 'og:locale', property: 'og:locale', content: 'en_GH' },

      // Twitter Card
      { hid: 'twitter:card', name: 'twitter:card', content: 'summary_large_image' },
      { hid: 'twitter:title', name: 'twitter:title', content: 'CACI Taifa Central Assembly | Miracle Centre' },
      { hid: 'twitter:description', name: 'twitter:description', content: 'Official church website and mobile app for Christ Apostolic Church International - Taifa Central, Accra, Ghana.' },
      { hid: 'twitter:image', name: 'twitter:image', content: `${SITE_URL}/og-image.jpg` }
    ],
    link: [
      { rel: 'icon', type: 'image/x-icon', href: '/favicon.ico' },
      { rel: 'icon', type: 'image/png', sizes: '32x32', href: '/favicon-32x32.png' },
      { rel: 'icon', type: 'image/png', sizes: '16x16', href: '/favicon-16x16.png' },
      { rel: 'apple-touch-icon', sizes: '180x180', href: '/apple-touch-icon.png' }
    ]
    // No `script` entries: interactive markup is driven by bootstrap-vue's
    // components and by ConfirmDialog, neither of which needs Bootstrap's own
    // JS bundle. A `/bootstrap/bootstrap.bundle.min.js` tag used to sit here
    // pointing into `static/`, where that file was never added, so every page
    // load 404'd on it.
  },

  // Global CSS: https://go.nuxtjs.dev/config-css
  css: [
    '~/assets/main.css',
    '~/assets/admin.css',
    '~/assets/design-system.css'
  ],

  // Rewrites the head for /sermons/:id, /videos/:id, /events/:id and
  // /shorts/:id so a shared link previews as that record rather than as the
  // site. Falls through untouched if the API cannot answer.
  serverMiddleware: [
    '~/server-middleware/share-meta.js'
  ],

  // Plugins to run before rendering page: https://go.nuxtjs.dev/config-plugins
  plugins: [],

  // Auto import components: https://go.nuxtjs.dev/config-components
  components: true,

  // Modules for dev and build (recommended): https://go.nuxtjs.dev/config-modules
  buildModules: [
    '@nuxtjs/moment',
  ],

  // Modules: https://go.nuxtjs.dev/config-modules
  modules: [
    // https://go.nuxtjs.dev/bootstrap
    '@nuxtjs/moment',
    'bootstrap-vue/nuxt',
    '@nuxtjs/axios',
    '@nuxtjs/toast',
    '@nuxtjs/auth-next',
  ],
  toast: {
    position: 'top-right',
    duration: 5000,
    theme: "outline",
    register: [ // Register custom toasts
      {
        name: 'my-error',
        message: 'Oops...Something went wrong',
        options: {
          type: 'error'
        }
      }
    ]
  },
  axios: {
    // retry: {retries: 5},
    headers: {
      common: {
        'Accept': 'application/json, text/plain, */*',
        'Authorization': 'Basic Y3ZiZGZqeWU1dHdmZHM6NTY3ODY3MzZ0d2VoZGdkZmdzZGY='
      },
      delete: {},
      get: {},
      head: {},
      post: {},
      put: {},
      patch: {}
    }
  },
  publicRuntimeConfig: {
    IMAGE_BASE_URL: process.env.IMAGE_BASE_URL || "https://pub-78c3b0ef114642b8859d4d64c75e96c3.r2.dev",
    axios: {
      browserBaseURL: process.env.API_BASE_URL || "https://cacitapi-production.up.railway.app/api/"
    }
  },
  // Build Configuration: https://go.nuxtjs.dev/config-build
  build: {
    babel: {
      compact: true
    }
  },
  router: {
    // role-guard runs after auth: auth decides whether you are signed in,
    // role-guard whether this screen is yours. See middleware/role-guard.js.
    middleware: ['auth', 'role-guard']
  },
  auth: {
    redirect: {
      login: '/login',
      logout: '/login',
      home: '/admin/dashboard'
    },
    strategies: {
      local: {
        // cookie: true,
        token: {
          property: 'data.token',
          global: true,
          type:'Bearer'
          // expires: 100,
          // maxAge: 86400 // seconds - 1 day
        },
        user: {
          property: false
        },
        endpoints: {
          login: {url: 'auth/login', method: 'post'},
          user: {url: 'useraccounts/me', method: 'get'},
          logout: false
        },
        localStorage: false,
      }
    }
  }
}
