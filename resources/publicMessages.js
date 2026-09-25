/**
 * Sends the public website's support message or deletion request to the API.
 *
 * Resolves rather than throws, to one of three outcomes the forms show
 * differently: sent; refused for a reason the visitor can fix (the API's own
 * wording, e.g. a phone number it cannot call); or the office could not be
 * reached at all, the one case where email is offered instead.
 */
export async function sendPublicMessage (axios, message) {
  try {
    const response = await axios.post('public/messages', message)
    const code = String((response.data && response.data.code) || response.status)
    if (code.startsWith('200')) {
      return { ok: true, message: '', unreachable: false }
    }
    return { ok: false, message: messageFrom(response.data), unreachable: false }
  } catch (error) {
    const status = error.response && error.response.status
    const data = error.response && error.response.data
    if (status === 400 || status === 429) {
      return { ok: false, message: messageFrom(data), unreachable: false }
    }
    return {
      ok: false,
      message: 'We could not reach the church office just now. You can email your message instead, or call +233 24 296 9760.',
      unreachable: true
    }
  }
}

function messageFrom (data) {
  return (data && data.message) || 'Please check the form and try again.'
}
