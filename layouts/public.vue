<template>
  <!--
    The public site, with no admin chrome.

    Every public page renders PublicHeader itself, but the default layout wraps
    whatever it is given in AppShell — and AppShell draws the admin sidebar and
    top bar as soon as a visitor is signed in. A church manager opening a link
    they had just shared therefore got the admin navigation stacked above the
    page's own header. These pages are for anyone with the address, signed in
    or not, so they do not go through the shell at all.

    ds-root is kept: it carries the design system's typography and background,
    which AppShell used to provide.
  -->
  <div class="ds-root">
    <Nuxt />
  </div>
</template>

<script>
export default {
  name: 'public'
}
</script>
