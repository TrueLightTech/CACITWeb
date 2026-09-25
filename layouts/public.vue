<template>
  <!--
    The public site, with no admin chrome.

    Every public page renders PublicHeader itself, but the default layout wraps
    whatever it is given in AppShell — and AppShell draws the admin sidebar and
    top bar as soon as a visitor is signed in. A church manager opening a link
    they had just shared therefore got the admin navigation stacked above the
    page's own header. These pages are for anyone with the address, signed in
    or not, so they do not go through the shell at all.

    ds-root is kept: PublicRecord still draws on the design system's tokens.
  -->
  <div class="ds-root pub-site">
    <a href="#main" class="pub-skip">Skip to content</a>
    <Nuxt />
  </div>
</template>

<script>
export default {
  name: 'public',
  // Fonts load here rather than in nuxt.config so the admin console, which
  // has never had them, does not change under anyone's feet. A <link> with
  // preconnect, not the CSS @import main.css uses, so they never block paint.
  head () {
    return {
      link: [
        { rel: 'preconnect', href: 'https://fonts.googleapis.com' },
        { rel: 'preconnect', href: 'https://fonts.gstatic.com', crossorigin: '' },
        {
          rel: 'stylesheet',
          href: 'https://fonts.googleapis.com/css2?family=IBM+Plex+Sans:wght@400;500;600&family=Source+Serif+4:ital,opsz,wght@0,8..60,500;1,8..60,400&display=swap'
        }
      ]
    }
  }
}
</script>

<style src="~/assets/public.css"></style>
