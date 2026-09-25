import { isAppLaunched, daysUntilLaunch, APP_LAUNCH } from '../resources/appLinks'
import { sendPublicMessage } from '../resources/publicMessages'
import { mailtoLink } from '../resources/mailto'

/**
 * The public site's two quiet failure points: a store badge that links to a
 * listing that is not live yet, and a form that looks sent when it was not.
 */
describe('app launch date', () => {
  const at = iso => Date.parse(iso)

  it('keeps the coming-soon screen until midnight on launch day in Accra', () => {
    expect(isAppLaunched(at('2026-10-14T23:59:59Z'))).toBe(false)
    expect(isAppLaunched(at('2026-10-15T00:00:00Z'))).toBe(true)
  })

  it('counts down whole days, with the last day as one', () => {
    expect(daysUntilLaunch(at('2026-09-25T09:00:00Z'))).toBe(20)
    expect(daysUntilLaunch(at('2026-10-14T18:00:00Z'))).toBe(1)
    expect(daysUntilLaunch(at('2026-10-20T00:00:00Z'))).toBe(0)
  })

  it('keeps the day and month together wherever the short date wraps', () => {
    expect(APP_LAUNCH.short).toBe('15 October')
  })
})

describe('sending a public message', () => {
  const axiosThat = post => ({ post })
  const failWith = (status, data) => () => Promise.reject(Object.assign(new Error('x'), { response: { status, data } }))

  it('reports sent only when the API says so', async () => {
    const result = await sendPublicMessage(axiosThat(() => Promise.resolve({ status: 200, data: { code: '200' } })), {})
    expect(result).toEqual({ ok: true, message: '', unreachable: false })
  })

  it('shows the API’s own reason for a message it refused, without offering email', async () => {
    const result = await sendPublicMessage(axiosThat(failWith(400, { message: 'Enter your full name.' })), {})
    expect(result).toEqual({ ok: false, message: 'Enter your full name.', unreachable: false })
  })

  it('treats the rate limit as something to wait out, not a reason to email', async () => {
    const result = await sendPublicMessage(axiosThat(failWith(429, { message: 'Please wait a few minutes.' })), {})
    expect(result.unreachable).toBe(false)
    expect(result.message).toBe('Please wait a few minutes.')
  })

  it('offers email only when the office could not be reached', async () => {
    const offline = await sendPublicMessage(axiosThat(() => Promise.reject(new Error('Network Error'))), {})
    const broken = await sendPublicMessage(axiosThat(failWith(500, { message: 'boom' })), {})
    expect(offline.unreachable).toBe(true)
    expect(broken.unreachable).toBe(true)
  })

  it('posts to the public messages endpoint', async () => {
    const post = jest.fn(() => Promise.resolve({ status: 200, data: { code: '200' } }))
    await sendPublicMessage({ post }, { kind: 'support' })
    expect(post).toHaveBeenCalledWith('public/messages', { kind: 'support' })
  })
})

describe('email fallback', () => {
  it('encodes the subject and keeps line breaks', () => {
    const url = new URL(mailtoLink('office@example.com', { subject: 'A & B', lines: ['one', 'two'] }))
    expect(url.searchParams.get('subject')).toBe('A & B')
    expect(url.searchParams.get('body')).toBe('one\r\ntwo')
  })
})
