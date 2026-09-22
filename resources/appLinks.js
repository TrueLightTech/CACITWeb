/**
 * Where the CACI Taifa app lives on each store.
 *
 * One place, because these appear on the home page, on every shared record
 * and in the footer — and a store listing that moves should not have to be
 * chased through the markup.
 */

export const APP_STORE_URL = 'https://apps.apple.com/us/app/caci-taifa/id6813027106'
export const PLAY_STORE_URL = 'https://play.google.com/store/apps/details?id=com.cacitaifa.caci_taifa'

export const APP_STORES = [
  {
    key: 'ios',
    href: APP_STORE_URL,
    sub: 'Download on the',
    name: 'App Store',
    // Apple's mark, drawn rather than fetched so the page owes nothing to a
    // third-party asset host.
    path: 'M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M15.97 6.37c.62-.75 1.04-1.8 1.01-2.85-.92.04-2.04.62-2.7 1.39-.58.67-1.09 1.74-1.03 2.78 1.03.08 2.09-.57 2.72-1.32z'
  },
  {
    key: 'android',
    href: PLAY_STORE_URL,
    sub: 'Get it on',
    name: 'Google Play',
    path: 'M3.609 1.814L13.792 12 3.61 22.186a2.38 2.38 0 0 1-.61-.715V2.529c.176-.282.388-.528.609-.715zm11.306 11.306l2.35 2.35-12.062 6.892 9.712-9.242zm2.35-2.35l-2.35 2.35L5.203 3.878l12.062 6.892zm1.127 1.127l2.846 1.626c.725.414.725 1.09 0 1.504l-2.846 1.626-2.083-2.378 2.083-2.378z'
  }
]
