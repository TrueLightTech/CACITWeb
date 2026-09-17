/**
 * Shapes and small helpers for the Mobile App section.
 *
 * The API returns the same envelope everywhere — { message, code, data } — with
 * paged collections under `data.results`. These helpers unwrap that in one
 * place so the pages do not each repeat the same three lines of defensive
 * property access.
 */

/** Publishing lifecycle, shared by every content resource. */
export const CONTENT_STATUS = {
  DRAFT: 'draft',
  SCHEDULED: 'scheduled',
  PUBLISHED: 'published',
  ARCHIVED: 'archived'
}

export const STATUS_LABELS = {
  draft: 'Draft',
  scheduled: 'Scheduled',
  published: 'Published',
  archived: 'Archived'
}

/** Maps a status onto the design system's badge modifiers. */
export const STATUS_BADGE = {
  draft: 'ds-badge--neutral',
  scheduled: 'ds-badge--warning',
  published: 'ds-badge--success',
  archived: 'ds-badge--neutral'
}

export const SHORT_KINDS = [
  { value: 'video', label: 'Video clip' },
  { value: 'audio', label: 'Voice note' },
  { value: 'image', label: 'Picture or flyer' },
  { value: 'slides', label: 'Slides' },
  { value: 'event', label: 'Promoted event' },
  { value: 'scripture', label: 'Scripture' }
]

export const EVENT_STATUSES = [
  { value: 'confirmed', label: 'Confirmed' },
  { value: 'updated', label: 'Updated' },
  { value: 'rescheduled', label: 'Rescheduled' },
  { value: 'cancelled', label: 'Cancelled' },
  { value: 'concluded', label: 'Concluded' }
]

export const REQUEST_TYPES = {
  counselling: 'Counselling',
  child_naming: 'Child naming',
  marriage: 'Marriage',
  funeral: 'Funeral',
  dedication: 'Dedication',
  prayer: 'Prayer',
  visitation: 'Visitation',
  other: 'Other'
}

export const REQUEST_STATUSES = [
  { value: 'submitted', label: 'Submitted' },
  { value: 'in_review', label: 'In review' },
  { value: 'scheduled', label: 'Scheduled' },
  { value: 'completed', label: 'Completed' },
  { value: 'declined', label: 'Declined' }
]

export const REQUEST_STATUS_BADGE = {
  submitted: 'ds-badge--warning',
  in_review: 'ds-badge--info',
  scheduled: 'ds-badge--info',
  completed: 'ds-badge--success',
  declined: 'ds-badge--neutral'
}

/** Where a short's action link can point. Never free text — see the API note. */
export const SHORT_ACTION_TARGETS = [
  { value: 'sermon', label: 'A sermon', path: '/sermon/' },
  { value: 'event', label: 'An event', path: '/event/' },
  { value: 'announcement', label: 'An announcement', path: '/announcement/' },
  { value: 'video', label: 'A video', path: '/video/' }
]

/** The payload of a successful response, or null. */
export function payload (response) {
  return response && response.data && response.data.data !== undefined
    ? response.data.data
    : null
}

/** Rows out of a paged response, always an array. */
export function rowsOf (response) {
  const data = payload(response)
  if (!data) { return [] }
  if (Array.isArray(data)) { return data }
  return Array.isArray(data.results) ? data.results : []
}

/**
 * Paging out of a paged response.
 *
 * The API echoes `pageIndex` zero-based while the `page` it accepts is
 * one-based. Everything above this function works in one-based page numbers.
 */
export function pagingOf (response, requestedPage) {
  const data = payload(response) || {}
  return {
    page: requestedPage || (Number(data.pageIndex || 0) + 1),
    pageSize: Number(data.pageSize || 10),
    totalPages: Number(data.totalPages || 0),
    totalCount: Number(data.totalCount || 0)
  }
}

/**
 * The member-readable sentence from a failed request.
 *
 * Some of the API's older messages are not written for a person ("OOps,
 * something die"), so anything that looks like one is replaced with the
 * caller's fallback rather than shown.
 */
export function errorMessage (error, fallback) {
  const message = error && error.response && error.response.data
    ? error.response.data.message
    : null

  if (!message) { return fallback }

  const unusable = /oops|something die|something really bad/i
  return unusable.test(message) ? fallback : message
}

/**
 * A datetime-local input value (which is local, with no zone) as a UTC ISO
 * string for the API.
 */
export function toUtcIso (localValue) {
  if (!localValue) { return null }
  const date = new Date(localValue)
  return isNaN(date.getTime()) ? null : date.toISOString()
}

/** A UTC ISO string back into a datetime-local input value. */
export function toLocalInput (isoValue) {
  if (!isoValue) { return '' }
  const date = new Date(isoValue)
  if (isNaN(date.getTime())) { return '' }

  const pad = n => String(n).padStart(2, '0')
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}` +
    `T${pad(date.getHours())}:${pad(date.getMinutes())}`
}

/** Seconds as m:ss, for media durations. */
export function duration (seconds) {
  if (!seconds && seconds !== 0) { return '' }
  const total = Math.round(seconds)
  const minutes = Math.floor(total / 60)
  const remainder = total % 60
  return `${minutes}:${String(remainder).padStart(2, '0')}`
}

export function bytes (size) {
  if (!size) { return '' }
  const units = ['B', 'KB', 'MB', 'GB']
  let value = size
  let unit = 0
  while (value >= 1024 && unit < units.length - 1) {
    value /= 1024
    unit += 1
  }
  return `${value.toFixed(value < 10 && unit > 0 ? 1 : 0)} ${units[unit]}`
}

/**
 * What a member can leave on a sermon, video, event or announcement. Words
 * rather than emoji, so the console and the app can draw them differently and
 * the meaning survives a redesign.
 */
export const REACTIONS = [
  { value: 'amen', label: 'Amen', glyph: '🙏' },
  { value: 'praise', label: 'Praise', glyph: '🙌' },
  { value: 'love', label: 'Love', glyph: '❤️' },
  { value: 'pray', label: 'Praying', glyph: '🕊️' },
  { value: 'thanks', label: 'Thanks', glyph: '🤍' }
]

export const COMMENT_STATUS_LABELS = {
  visible: 'Visible',
  hidden: 'Hidden',
  removed: 'Withdrawn'
}

export const COMMENT_STATUS_BADGE = {
  visible: 'ds-badge--success',
  hidden: 'ds-badge--warning',
  removed: 'ds-badge--neutral'
}
