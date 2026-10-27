/**
 * Where in the app a notification can point.
 *
 * A message sent with no destination lands the member on the home screen.
 * That is the right answer for "the midweek service has moved" and the wrong
 * one for "a new sermon is up", so the push form offers these.
 *
 * The paths are the app's own, and the `kind` is deliberately the same word
 * the app's router uses for that path segment — `/sermon/:id`, `/event/:id`,
 * `/announcement/:id`, `/live`. Rename a kind here and the link stops
 * matching a route over there, and the member lands on nothing.
 */

export const PUSH_DESTINATIONS = [
  { kind: '', label: 'Nowhere in particular' },
  {
    kind: 'announcement',
    label: 'An announcement',
    noun: 'announcement',
    endpoint: 'admin/announcements'
  },
  {
    kind: 'event',
    label: 'An event',
    noun: 'event',
    endpoint: 'admin/events'
  },
  {
    kind: 'sermon',
    label: 'A sermon',
    noun: 'sermon',
    endpoint: 'admin/sermons'
  },
  { kind: 'live', label: 'The live service' }
]

/** The destination with this kind, or null for one we do not offer. */
export function destinationFor (kind) {
  return PUSH_DESTINATIONS.find(option => option.kind === kind) || null
}

/** Whether this destination is a particular thing that has to be chosen. */
export function needsItem (kind) {
  const destination = destinationFor(kind)
  return !!(destination && destination.endpoint)
}

/**
 * The app path for a destination, or null when there is nothing to point at.
 *
 * Null rather than an empty string: the API leaves the key out of the push
 * payload entirely when the deep link is blank, and the app then falls back
 * on the category. An unfinished choice should behave the same as no choice
 * rather than send a path with a hole in it.
 */
export function deepLinkFor (kind, id) {
  const destination = destinationFor(kind)
  if (!destination || !destination.kind) { return null }
  if (!destination.endpoint) { return `/${destination.kind}` }

  const chosen = (id === null || id === undefined ? '' : String(id)).trim()
  return chosen ? `/${destination.kind}/${chosen}` : null
}
