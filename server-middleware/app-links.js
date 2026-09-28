/**
 * The two files a phone reads before it lets a cacitaifa.com link open the
 * CACI Taifa app instead of the browser.
 *
 * iOS fetches /.well-known/apple-app-site-association and Android fetches
 * /.well-known/assetlinks.json. Each must be JSON and must name the app —
 * iOS by team and bundle id, Android by package and signing-key fingerprint.
 * Anything else and the phone quietly keeps the link in the browser.
 *
 * They are answered here rather than dropped into static/ for two reasons.
 * The Apple file has no extension, so a static server sends it as
 * octet-stream at best; and before this, the SPA's catch-all answered it with
 * the HTML shell and a 200, which iOS reads as "this site claims no app".
 *
 * Only the four share paths are claimed. The rest of the site — the home
 * page, the console, support — is the website, and opening it should stay in
 * the browser even on a phone with the app.
 */

const APPLE_APP_ID = process.env.APPLE_APP_ID || 'G9G7Q2687F.com.cacitaifa.caciTaifa'
const ANDROID_PACKAGE = process.env.ANDROID_PACKAGE || 'com.cacitaifa.caci_taifa'

/**
 * The upload key the release bundle is signed with. Google re-signs what it
 * ships with its own app-signing key, so a phone that installed from Play
 * checks against *that* fingerprint: it goes in ANDROID_CERT_FINGERPRINTS
 * (comma-separated, from Play Console → App integrity), which can be set on
 * the server without a deploy.
 */
const UPLOAD_KEY_FINGERPRINT =
  '83:8B:16:18:9E:99:E5:1B:FB:27:29:35:AE:F0:F1:CA:28:E5:A6:29:71:DF:97:E1:12:79:E2:00:88:61:DB:AC'

const SHARE_PATHS = ['/sermons/*', '/shorts/*', '/videos/*', '/events/*']

function androidFingerprints (env = process.env) {
  const extra = String(env.ANDROID_CERT_FINGERPRINTS || '')
    .split(',')
    .map(value => value.trim().toUpperCase())
    .filter(Boolean)
  return Array.from(new Set([UPLOAD_KEY_FINGERPRINT, ...extra]))
}

function appleAppSiteAssociation () {
  return {
    applinks: {
      // Both shapes: `appIDs` and `components` for iOS 13 and later, `appID`
      // and `paths` for the older phones members still carry.
      apps: [],
      details: [
        {
          appID: APPLE_APP_ID,
          appIDs: [APPLE_APP_ID],
          paths: SHARE_PATHS,
          components: SHARE_PATHS.map(path => ({ '/': path }))
        }
      ]
    }
  }
}

function assetLinks (env = process.env) {
  return [
    {
      relation: ['delegate_permission/common.handle_all_urls'],
      target: {
        namespace: 'android_app',
        package_name: ANDROID_PACKAGE,
        sha256_cert_fingerprints: androidFingerprints(env)
      }
    }
  ]
}

function sendJson (res, body) {
  res.statusCode = 200
  res.setHeader('Content-Type', 'application/json')
  // Phones and Apple's CDN fetch these rarely and cache them; an hour keeps
  // a fingerprint added on the server from taking a day to be believed.
  res.setHeader('Cache-Control', 'public, max-age=3600')
  res.end(JSON.stringify(body))
}

module.exports = function appLinks (req, res, next) {
  const path = String(req.url || '').split('?')[0]

  if (path === '/.well-known/apple-app-site-association' ||
      path === '/apple-app-site-association') {
    return sendJson(res, appleAppSiteAssociation())
  }

  if (path === '/.well-known/assetlinks.json') {
    return sendJson(res, assetLinks())
  }

  return next()
}

// Exported for tests.
module.exports.appleAppSiteAssociation = appleAppSiteAssociation
module.exports.assetLinks = assetLinks
module.exports.androidFingerprints = androidFingerprints
module.exports.SHARE_PATHS = SHARE_PATHS
