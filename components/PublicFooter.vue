<template>
  <footer class="pub-footer">
    <div class="pub-container">
      <div class="pub-footer__grid">
        <!-- Brand & Mission -->
        <div class="pub-footer__col pub-footer__col--brand">
          <div class="pub-footer__brand">
            <img src="~assets/imgs/caci_logo.png" alt="CACI Logo" class="pub-footer__logo" />
            <div>
              <h3 class="pub-footer__name">CACI TAIFA CENTRAL</h3>
              <p class="pub-footer__tag">Miracle Centre Assembly</p>
            </div>
          </div>
          <p class="pub-footer__desc">
            A dynamic Bible-believing church rooted in the Word, empowered by the Holy Spirit,
            and dedicated to touching lives with the love and power of Jesus Christ in Taifa, Accra and beyond.
          </p>
          <div class="pub-footer__social">
            <a
              href="https://web.facebook.com/CACTaifaCentral/?_rdc=1&_rdr#"
              target="_blank"
              rel="noopener noreferrer"
              class="pub-footer__social-link"
              aria-label="CACI Taifa Central Facebook"
            >
              <svg width="20" height="20" fill="currentColor" viewBox="0 0 24 24">
                <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
              </svg>
              <span>Follow us on Facebook</span>
            </a>
          </div>
        </div>

        <!-- Church Services -->
        <div class="pub-footer__col">
          <h4 class="pub-footer__heading">Weekly Services</h4>
          <ul class="pub-footer__list">
            <li>
              <strong>Sunday Glorious Worship</strong>
              <span>1st: 7:00 AM • 2nd: 9:45 AM</span>
            </li>
            <li>
              <strong>Wednesday Solution Hour</strong>
              <span>Teaching & Prayer: 6:00 PM</span>
            </li>
            <li>
              <strong>Friday Deliverance Hour</strong>
              <span>Prayer & Breakthrough: 6:30 PM</span>
            </li>
            <li>
              <strong>Monthly Half-Night</strong>
              <span>Last Friday: 10:00 PM - 3:00 AM</span>
            </li>
          </ul>
        </div>

        <!-- Store & App Compliance -->
        <div class="pub-footer__col">
          <h4 class="pub-footer__heading">Mobile App & Legal</h4>
          <ul class="pub-footer__links">
            <li>
              <NuxtLink to="/privacypolicy">Privacy Policy</NuxtLink>
            </li>
            <li>
              <NuxtLink to="/terms">Terms of Service (EULA)</NuxtLink>
            </li>
            <li>
              <NuxtLink to="/support">App Support & Help Center</NuxtLink>
            </li>
            <li>
              <NuxtLink to="/child-safety">Child Safety Standards</NuxtLink>
            </li>
            <li>
              <NuxtLink to="/delete-account">Request Account Deletion</NuxtLink>
            </li>
            <li>
              <NuxtLink to="/login">Member Portal Login</NuxtLink>
            </li>
            <li>
              <NuxtLink to="/register">Create Member Account</NuxtLink>
            </li>
          </ul>
        </div>

        <!-- Contact & Location -->
        <div class="pub-footer__col">
          <h4 class="pub-footer__heading">Contact & Location</h4>
          <address class="pub-footer__address">
            <div class="pub-footer__contact-item">
              <svg width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/>
                <circle cx="12" cy="10" r="3"/>
              </svg>
              <span>Loquat Street, Taifa Central Assembly, Accra, Ghana</span>
            </div>
            <div class="pub-footer__contact-item">
              <svg width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/>
              </svg>
              <div>
                <a href="tel:+233242969760">+233 24 296 9760</a><br/>
                <a href="tel:+233596270150">+233 59 627 0150</a>
              </div>
            </div>
            <div class="pub-footer__contact-item">
              <svg width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
                <polyline points="22,6 12,13 2,6"/>
              </svg>
              <a href="mailto:cactaifacentral@gmail.com">cactaifacentral@gmail.com</a>
            </div>
          </address>
        </div>
      </div>

      <!-- Bottom Bar -->
      <div class="pub-footer__bottom">
        <p class="pub-footer__copy">
          &copy; {{ new Date().getFullYear() }} Christ Apostolic Church International - Taifa Central Assembly (Miracle Centre). All rights reserved.
        </p>
        <div class="pub-footer__legal-strip">
          <NuxtLink to="/privacypolicy">Privacy Policy</NuxtLink>
          <span>•</span>
          <NuxtLink to="/terms">Terms</NuxtLink>
          <span>•</span>
          <NuxtLink to="/support">Support</NuxtLink>
          <span>•</span>
          <NuxtLink to="/child-safety">Child Safety</NuxtLink>
          <span>•</span>
          <NuxtLink to="/delete-account">Data Deletion</NuxtLink>
        </div>
      </div>
    </div>
  </footer>
</template>

<script>
export default {
  name: 'PublicFooter'
}
</script>

<style scoped>
.pub-footer {
  background: #0b1329;
  color: #94a3b8;
  font-family: inherit;
  padding: 64px 0 32px;
  border-top: 1px solid #1e293b;
}

.pub-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 24px;
}

.pub-footer__grid {
  display: grid;
  grid-template-columns: 1.4fr 1fr 1fr 1.2fr;
  gap: 40px;
  padding-bottom: 48px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.08);
}

.pub-footer__col--brand {
  padding-right: 12px;
}

.pub-footer__brand {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 16px;
}

.pub-footer__logo {
  height: 46px;
  width: auto;
  object-fit: contain;
}

.pub-footer__name {
  color: #ffffff;
  font-size: 1.05rem;
  font-weight: 800;
  margin: 0;
  letter-spacing: -0.01em;
}

.pub-footer__tag {
  color: #fbbf24;
  font-size: 0.75rem;
  font-weight: 600;
  margin: 0;
  text-transform: uppercase;
  letter-spacing: 0.06em;
}

.pub-footer__desc {
  font-size: 0.9rem;
  line-height: 1.65;
  color: #94a3b8;
  margin-bottom: 20px;
}

.pub-footer__social-link {
  display: inline-flex;
  align-items: center;
  gap: 10px;
  background: rgba(255, 255, 255, 0.06);
  padding: 8px 16px;
  border-radius: 9999px;
  color: #ffffff !important;
  font-size: 0.85rem;
  font-weight: 500;
  text-decoration: none;
  border: 1px solid rgba(255, 255, 255, 0.1);
  transition: all 0.2s ease;
}

.pub-footer__social-link:hover {
  background: #1877f2;
  border-color: #1877f2;
  transform: translateY(-1px);
}

.pub-footer__heading {
  color: #ffffff;
  font-size: 0.95rem;
  font-weight: 700;
  margin-bottom: 20px;
  letter-spacing: 0.02em;
  text-transform: uppercase;
}

.pub-footer__list {
  list-style: none;
  padding: 0;
  margin: 0;
  display: flex;
  flex-direction: column;
  gap: 14px;
}

.pub-footer__list li {
  display: flex;
  flex-direction: column;
  gap: 2px;
  font-size: 0.88rem;
}

.pub-footer__list strong {
  color: #f1f5f9;
  font-weight: 600;
}

.pub-footer__list span {
  color: #94a3b8;
  font-size: 0.82rem;
}

.pub-footer__links {
  list-style: none;
  padding: 0;
  margin: 0;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.pub-footer__links a {
  color: #cbd5e1;
  text-decoration: none;
  font-size: 0.9rem;
  transition: color 0.15s ease;
}

.pub-footer__links a:hover {
  color: #60a5fa;
  text-decoration: underline;
}

.pub-footer__address {
  font-style: normal;
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.pub-footer__contact-item {
  display: flex;
  align-items: flex-start;
  gap: 12px;
  font-size: 0.88rem;
  line-height: 1.5;
}

.pub-footer__contact-item svg {
  color: #60a5fa;
  flex-shrink: 0;
  margin-top: 2px;
}

.pub-footer__contact-item a {
  color: #e2e8f0;
  text-decoration: none;
}

.pub-footer__contact-item a:hover {
  color: #60a5fa;
  text-decoration: underline;
}

.pub-footer__bottom {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding-top: 28px;
  font-size: 0.82rem;
  color: #64748b;
  flex-wrap: wrap;
  gap: 16px;
}

.pub-footer__copy {
  margin: 0;
}

.pub-footer__legal-strip {
  display: flex;
  align-items: center;
  gap: 12px;
}

.pub-footer__legal-strip a {
  color: #94a3b8;
  text-decoration: none;
}

.pub-footer__legal-strip a:hover {
  color: #ffffff;
}

@media (max-width: 960px) {
  .pub-footer__grid {
    grid-template-columns: 1fr 1fr;
    gap: 32px;
  }
}

@media (max-width: 600px) {
  .pub-footer__grid {
    grid-template-columns: 1fr;
  }
  .pub-footer__bottom {
    flex-direction: column;
    align-items: flex-start;
  }
}
</style>
