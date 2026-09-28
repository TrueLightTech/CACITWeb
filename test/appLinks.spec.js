const appLinks = require('../server-middleware/app-links')

/** Runs the middleware for one path and reports what it answered. */
function request (path) {
  return new Promise((resolve) => {
    const headers = {}
    const res = {
      statusCode: 0,
      setHeader: (key, value) => { headers[key.toLowerCase()] = value },
      end: body => resolve({ status: res.statusCode, headers, body: JSON.parse(body) })
    }
    appLinks({ url: path }, res, () => resolve({ passed: true }))
  })
}

describe('the files a phone reads before opening a link in the app', () => {
  test('iOS gets JSON naming the app and only the four share paths', async () => {
    const res = await request('/.well-known/apple-app-site-association')

    expect(res.status).toBe(200)
    expect(res.headers['content-type']).toBe('application/json')

    const detail = res.body.applinks.details[0]
    expect(detail.appIDs).toEqual(['G9G7Q2687F.com.cacitaifa.caciTaifa'])
    expect(detail.appID).toBe('G9G7Q2687F.com.cacitaifa.caciTaifa')
    expect(detail.paths).toEqual(['/sermons/*', '/shorts/*', '/videos/*', '/events/*'])
    expect(detail.components.map(c => c['/'])).toEqual(detail.paths)
  })

  test('the same file is served from the root, where older iOS looked', async () => {
    const res = await request('/apple-app-site-association')
    expect(res.status).toBe(200)
  })

  test('Android gets the package and the upload key', async () => {
    const res = await request('/.well-known/assetlinks.json')

    expect(res.status).toBe(200)
    expect(res.headers['content-type']).toBe('application/json')

    const target = res.body[0].target
    expect(res.body[0].relation).toEqual(['delegate_permission/common.handle_all_urls'])
    expect(target.package_name).toBe('com.cacitaifa.caci_taifa')
    expect(target.sha256_cert_fingerprints).toContain(
      '83:8B:16:18:9E:99:E5:1B:FB:27:29:35:AE:F0:F1:CA:28:E5:A6:29:71:DF:97:E1:12:79:E2:00:88:61:DB:AC'
    )
  })

  test('Play\'s signing key can be added on the server, without a deploy', () => {
    const fingerprints = appLinks.androidFingerprints({
      ANDROID_CERT_FINGERPRINTS: ' aa:bb , 83:8b:16:18:9e:99:e5:1b:fb:27:29:35:ae:f0:f1:ca:28:e5:a6:29:71:df:97:e1:12:79:e2:00:88:61:db:ac'
    })

    expect(fingerprints).toContain('AA:BB')
    // The upload key once, however it was written.
    expect(fingerprints).toHaveLength(2)
  })

  test('everything else is left to the rest of the site', async () => {
    expect(await request('/sermons/abc')).toEqual({ passed: true })
    expect(await request('/.well-known/security.txt')).toEqual({ passed: true })
  })
})
