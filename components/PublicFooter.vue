<template>
  <footer class="pf pub-dark">
    <div class="pub-container">
      <div class="pf__top">
        <div class="pf__brand">
          <img src="~assets/imgs/caci_mark.png" alt="" class="pf__mark" width="48" height="48" loading="lazy">
          <div>
            <p class="pf__name">Christ Apostolic Church International</p>
            <p class="pf__assembly">Taifa Central Assembly · Miracle Centre</p>
          </div>
        </div>

        <div class="pf__cols">
          <div class="pf__col pf__col--wide">
            <h2 class="pf__heading">Visit</h2>
            <address class="pf__address">
              <span>Loquat Street, Taifa Central<br>Accra, Ghana</span>
              <span class="pf__times">Sundays 7:00 &amp; 9:45 AM</span>
            </address>
          </div>

          <div class="pf__col pf__col--wide">
            <h2 class="pf__heading">Contact</h2>
            <ul class="pf__list">
              <li><a href="tel:+233242969760">+233 24 296 9760</a></li>
              <li><a href="tel:+233596270150">+233 59 627 0150</a></li>
              <li><a href="mailto:cactaifacentral@gmail.com">cactaifacentral@gmail.com</a></li>
              <li>
                <a href="https://web.facebook.com/CACTaifaCentral/" target="_blank" rel="noopener noreferrer">
                  Facebook<span class="pf__ext" aria-hidden="true">↗</span>
                </a>
              </li>
            </ul>
          </div>

          <nav class="pf__col" aria-label="Footer">
            <h2 class="pf__heading">Church</h2>
            <ul class="pf__list">
              <li><NuxtLink to="/#services">Service times</NuxtLink></li>
              <li><NuxtLink to="/#ministries">Ministries</NuxtLink></li>
              <li><NuxtLink to="/#app-download">The app</NuxtLink></li>
              <li><NuxtLink to="/support">Support</NuxtLink></li>
              <li><NuxtLink to="/login">Member sign in</NuxtLink></li>
            </ul>
          </nav>

          <nav class="pf__col" aria-label="Policies">
            <h2 class="pf__heading">Policies</h2>
            <ul class="pf__list">
              <li><NuxtLink to="/privacypolicy">Privacy policy</NuxtLink></li>
              <li><NuxtLink to="/terms">Terms of service</NuxtLink></li>
              <li><NuxtLink to="/child-safety">Child safety</NuxtLink></li>
              <li><NuxtLink to="/delete-account">Delete your account</NuxtLink></li>
            </ul>
          </nav>
        </div>
      </div>

      <p class="pf__copy">
        © {{ year }} Christ Apostolic Church International, Taifa Central Assembly.
      </p>
    </div>
  </footer>
</template>

<script>
export default {
  name: 'PublicFooter',
  data () {
    return { year: new Date().getFullYear() }
  }
}
</script>

<style scoped>
.pf {
  padding: clamp(56px, 7vw, 88px) 0 32px;
  font-size: var(--pub-small);
}

.pf__top {
  display: grid;
  grid-template-columns: minmax(240px, 1fr) 2.4fr;
  gap: 48px;
  padding-bottom: 48px;
  border-bottom: 1px solid var(--pub-line-dark);
}

.pf__brand { display: flex; align-items: flex-start; gap: 14px; }
.pf__mark { width: 48px; height: 48px; flex-shrink: 0; }
.pf__name { font-weight: 600; color: var(--pub-on-dark); line-height: 1.35; }
.pf__assembly { margin-top: 4px; color: var(--pub-on-dark-3); line-height: 1.4; }

.pf__cols {
  display: grid;
  grid-template-columns: minmax(0, 1fr) minmax(0, 1.25fr) minmax(0, 1fr) minmax(0, 1fr);
  gap: 32px;
}

.pf__heading {
  font-family: var(--pub-sans);
  font-size: var(--pub-micro);
  font-weight: 600;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: var(--pub-on-dark-3);
  margin-bottom: 16px;
}

.pf__address {
  display: grid;
  gap: 12px;
  font-style: normal;
  line-height: 1.55;
  color: var(--pub-on-dark-2);
}
.pf__times { color: var(--pub-on-dark); }

.pf__list { list-style: none; padding: 0; display: grid; gap: 10px; }

.pf__list a {
  color: var(--pub-on-dark-2);
  text-decoration: none;
  overflow-wrap: break-word;
  transition: color var(--pub-fast) var(--pub-ease);
}
.pf__list a:hover { color: var(--pub-on-dark); text-decoration: underline; }

.pf__ext { margin-left: 4px; font-size: 0.85em; }

.pf__copy {
  padding-top: 28px;
  font-size: var(--pub-micro);
  color: var(--pub-on-dark-3);
}

@media (max-width: 1180px) {
  .pf__top { grid-template-columns: 1fr; gap: 40px; }
}

@media (max-width: 640px) {
  .pf__cols { grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 32px 24px; }
  .pf__col--wide { grid-column: 1 / -1; }
}
</style>
