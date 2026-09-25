/**
 * A mailto: address with the subject and body filled in.
 *
 * The public forms send through the API; this is what they offer when the
 * API cannot be reached, so a message is never simply lost. encodeURIComponent,
 * not URLSearchParams: the latter writes spaces as '+', which mail clients
 * show literally.
 */
export function mailtoLink (to, { subject = '', lines = [] } = {}) {
  const body = lines.join('\r\n')
  return `mailto:${to}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`
}
