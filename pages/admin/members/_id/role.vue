<template>
  <div></div>
</template>

<script>
/**
 * Roles are now one part of a person's access, set on their page under
 * Access Control together with anything granted or blocked for them alone.
 * Kept as a redirect so old links and bookmarks still land somewhere useful.
 */
export default {
  name: 'member-role',
  middleware ({ params, redirect }) {
    return redirect(`/admin/access/people/${params.id}`)
  }
}
</script>
