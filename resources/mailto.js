/**
 * A mailto: address with the subject and body filled in.
 *
 * The public forms hand over to the visitor's own email app because the API
 * has no endpoint that accepts a message from someone who is not signed in.
 * encodeURIComponent, not URLSearchParams: the latter writes spaces as '+',
 * which mail clients show literally.
 */
export function mailtoLink (to, { subject = '', lines = [] } = {}) {
  const body = lines.join('\r\n')
  return `mailto:${to}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`
}
