export default {
  // Disable server-side rendering: https://go.nuxtjs.dev/ssr-mode
  ssr: false,

  // Target: https://go.nuxtjs.dev/config-target
  target: 'static',

  // Global page headers: https://go.nuxtjs.dev/config-head
  head: {
    title: 'CACI - Taifa APP',
    htmlAttrs: {
      lang: 'en'
    },
    meta: [
      {charset: 'utf-8'},
      {name: 'viewport', content: 'width=device-width, initial-scale=1'},
      {hid: 'description', name: 'description', content: ''},
      {name: 'format-detection', content: 'telephone=no'}
    ],
    link: [
      {rel: 'icon', type: 'image/x-icon', href: '/favicon.ico'}
    ],
    script: [
      {
        src: "https://cdnjs.cloudflare.com/ajax/libs/Chart.js/3.5.0/chart.min.js"
      },
      {src: "/bootstrap/bootstrap.bundle.min.js", type: "text/javascript"},
      {
        src: "https://cdn.jsdelivr.net/npm/@popperjs/core@2.9.2/dist/umd/popper.min.js"
      }, {
        src: "https://cdn.jsdelivr.net/npm/bootstrap@5.0.2/dist/js/bootstrap.min.js"
      }
    ]
  },
//
// <script src="https://cdn.jsdelivr.net/npm/@popperjs/core@2.9.2/dist/umd/popper.min.js" integrity="sha384-IQsoLXl5PILFhosVNubq5LC7Qb9DXgDA9i+tQ8Zj3iwWAwPtgFTxbJ8NT4GN1R8p" crossorigin="anonymous"></script>
//   <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.0.2/dist/js/bootstrap.min.js" integrity="sha384-cVKIPhGWiC2Al4u+LWgxfKTRIcfu0JTxR+EQDz/bgldoEyl4H0zUF0QKbrJ0EcQF" crossorigin="anonymous"></script>

  // Global CSS: https://go.nuxtjs.dev/config-css
  css: [
    '~/assets/main.css'
  ],

  // Plugins to run before rendering page: https://go.nuxtjs.dev/config-plugins
  plugins: [],

  // Auto import components: https://go.nuxtjs.dev/config-components
  components: true,

  // Modules for dev and build (recommended): https://go.nuxtjs.dev/config-modules
  buildModules: [],

  // Modules: https://go.nuxtjs.dev/config-modules
  modules: [
    // https://go.nuxtjs.dev/bootstrap
    'bootstrap-vue/nuxt',
    '@nuxtjs/axios',
    '@nuxtjs/toast',
    '@nuxtjs/auth-next'
  ],

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
    axios: {
      browserBaseURL: "http://137.184.74.38:8090/api/"
    }
  },
  // Build Configuration: https://go.nuxtjs.dev/config-build
  build: {},
  router: {
    // middleware: ['auth']
  },
  auth: {
    redirect: {
      login: '/login',
      logout: '/login',
    },
    strategies: {
      customStrategy: {
        scheme: '~/schemes/customScheme',
        endpoints: {
          login: {url: '/auth/login', method: 'post'},
          logout: {url: '/auth/logout', method: 'post'},
          user: {url: '/useraccounts/me', method: 'get'}
        },
        token: {
          type: 'Basic',
          global: true
        }
      },
      customRegisterStrategy: {
        scheme: '~/schemes/customRegisterScheme',
        endpoints: {
          login: {url: '/auth/register', method: 'post'},
          logout: {url: '/auth/logout', method: 'post'}
        },
        token: {
          type: 'Basic',
          global: true
        }
      }
    }
  }
}
