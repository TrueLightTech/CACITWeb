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

  test('Android gets the package, Play\'s signing key and the upload key', async () => {
    const res = await request('/.well-known/assetlinks.json')

    expect(res.status).toBe(200)
    expect(res.headers['content-type']).toBe('application/json')

    const target = res.body[0].target
    expect(res.body[0].relation).toEqual(['delegate_permission/common.handle_all_urls'])
    expect(target.package_name).toBe('com.cacitaifa.caci_taifa')
    // Phones that installed from Play check this one; without it every
    // shared link stays in the browser.
    expect(target.sha256_cert_fingerprints).toContain(
      '5E:62:08:36:AC:83:69:8D:D5:DB:4E:75:55:93:05:F5:47:C5:46:BB:E7:84:20:F3:F4:BC:4D:8E:EC:B3:77:7C'
    )
    expect(target.sha256_cert_fingerprints).toContain(
      '83:8B:16:18:9E:99:E5:1B:FB:27:29:35:AE:F0:F1:CA:28:E5:A6:29:71:DF:97:E1:12:79:E2:00:88:61:DB:AC'
    )
  })

  test('another key can be added on the server, without a deploy', () => {
    const fingerprints = appLinks.androidFingerprints({
      ANDROID_CERT_FINGERPRINTS: ' aa:bb , 5e:62:08:36:ac:83:69:8d:d5:db:4e:75:55:93:05:f5:47:c5:46:bb:e7:84:20:f3:f4:bc:4d:8e:ec:b3:77:7c'
    })

    expect(fingerprints).toContain('AA:BB')
    // Play's key once, however it was written.
    expect(fingerprints).toHaveLength(3)
  })

  test('everything else is left to the rest of the site', async () => {
    expect(await request('/sermons/abc')).toEqual({ passed: true })
    expect(await request('/.well-known/security.txt')).toEqual({ passed: true })
  })
})
