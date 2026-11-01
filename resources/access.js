/**
 * What the signed-in person may do, as the API reported it on `access/me`.
 *
 * Pure functions over that response, so the sidebar, the route guard, the
 * `$can` plugin and the tests all answer the question the same way. None of
 * this is security: the API checks every request. It decides only what is
 * drawn, so nobody is shown a button that would be refused.
 *
 * `access` is the `data` of `GET access/me`:
 *   { roleId, roleName, fullAccess, familyId,
 *     permissions: { 'finance.tithe.record': { church: true, familyIds: [] } } }
 */

function grantOf (access, code) {
  if (!access || !access.permissions) { return null }
  return access.permissions[code] || null
}

/**
 * True when the person holds `code`. With a `familyId`, the permission must
 * also cover that family: church-wide, or that family named in its scope.
 */
export function can (access, code, familyId) {
  if (!access) { return false }
  if (access.fullAccess) { return true }

  const grant = grantOf(access, code)
  if (!grant) { return false }
  if (grant.church || !familyId) { return true }

  return (grant.familyIds || []).indexOf(familyId) !== -1
}

export function canAny (access, codes, familyId) {
  return (codes || []).some(code => can(access, code, familyId))
}

/** True only when `code` covers the whole church, not some families of it. */
export function canChurch (access, code) {
  if (!access) { return false }
  if (access.fullAccess) { return true }

  const grant = grantOf(access, code)
  return !!(grant && grant.church)
}

/** The family ids a scoped permission covers; empty when church-wide or not held. */
export function familiesFor (access, code) {
  const grant = grantOf(access, code)
  return grant && !grant.church ? (grant.familyIds || []).slice() : []
}

/**
 * Whether a navigation entry or route rule is open to this person. An entry
 * with neither `permission` nor `anyOf` is open to everyone signed in.
 */
export function allows (access, entry) {
  if (entry.permission) { return can(access, entry.permission) }
  if (entry.anyOf) { return canAny(access, entry.anyOf) }
  return true
}
