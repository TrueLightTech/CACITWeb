/**
 * Shared wording for the Access Control screens.
 *
 * The permission catalogue (`GET admin/access/catalogue`) is the source of
 * every label; codes are only ever keys. These helpers index it and say a
 * scope in plain words.
 */

/** Tier 2 and 3 permissions carry a "Sensitive" badge. */
export const SENSITIVE_TIER = 2

export const SCOPE_LABELS = {
  church: 'Whole church',
  own_family: 'Own family',
  family: 'A specific family'
}

/** Catalogue modules flattened to `{ code: { ...permission, moduleLabel } }`. */
export function indexCatalogue (catalogue) {
  const index = {}
  ;(catalogue || []).forEach(module => {
    ;(module.permissions || []).forEach(permission => {
      index[permission.code] = Object.assign({ moduleKey: module.key, moduleLabel: module.label }, permission)
    })
  })
  return index
}

export function isSensitive (permission) {
  return !!permission && Number(permission.tier) >= SENSITIVE_TIER
}

/** A label for a code, falling back to a readable form rather than the raw code. */
export function permissionLabel (index, code) {
  if (index && index[code]) { return index[code].label }
  return 'Unknown permission'
}

/** "Whole church", "Own family", or the named family. */
export function scopeLabel (scope, familyName) {
  if (scope === 'family') { return familyName || SCOPE_LABELS.family }
  return SCOPE_LABELS[scope] || SCOPE_LABELS.church
}
