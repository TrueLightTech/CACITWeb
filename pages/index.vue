<template>
  <div class="church-home">
    <PublicHeader />

    <!-- Hero Section -->
    <section class="hero">
      <div class="hero__bg-overlay"></div>
      <div class="pub-container hero__content">
        <div class="hero__logo-wrapper">
          <img src="~assets/imgs/caci_taifa_logo.png" alt="Christ Apostolic Church International Taifa Central Emblem" class="hero__logo" />
        </div>
        <div class="hero__badge">
          <span class="hero__badge-pulse"></span>
          <span>Christ Apostolic Church International • Taifa Central</span>
        </div>
        <h1 class="hero__title">
          Experience God’s Presence, Love & <span class="hero__highlight">Miracles</span>
        </h1>
        <p class="hero__subtitle">
          Welcome to the Miracle Centre Assembly, Taifa. We are a family of believers committed to worshiping God in truth, loving our community, and raising disciples for Christ Jesus.
        </p>

        <div class="hero__actions">
          <NuxtLink to="/login" class="hero-btn hero-btn--primary">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4" />
              <polyline points="10 17 15 12 10 7" />
              <line x1="15" y1="12" x2="3" y2="12" />
            </svg>
            <span>Member Portal Sign In</span>
          </NuxtLink>

          <a href="#app-download" class="hero-btn hero-btn--secondary">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <rect x="5" y="2" width="14" height="20" rx="2" ry="2"/>
              <line x1="12" y1="18" x2="12.01" y2="18"/>
            </svg>
            <span>Get the Mobile App</span>
          </a>

          <a href="#services" class="hero-btn hero-btn--ghost">
            <span>View Service Times ↓</span>
          </a>
        </div>

        <!-- Scripture Quote -->
        <div class="hero__scripture">
          <p class="hero__verse">
            &ldquo;And he said unto them, Go ye into all the world, and preach the gospel to every creature.&rdquo;
          </p>
          <span class="hero__reference">— Mark 16:15</span>
        </div>
      </div>
    </section>

    <!-- Quick Highlights Bar -->
    <section class="quick-highlights">
      <div class="pub-container quick-highlights__grid">
        <div class="highlight-item">
          <div class="highlight-item__icon">✝️</div>
          <div>
            <h3>Christ-Centred Word</h3>
            <p>Solid Biblical teaching that anchors your daily walk in faith.</p>
          </div>
        </div>
        <div class="highlight-item">
          <div class="highlight-item__icon">🔥</div>
          <div>
            <h3>Spirit-Filled Worship</h3>
            <p>Atmosphere of prayer, deliverance, and genuine breakthroughs.</p>
          </div>
        </div>
        <div class="highlight-item">
          <div class="highlight-item__icon">🤝</div>
          <div>
            <h3>Warm Fellowship</h3>
            <p>An open, caring family ready to walk with you every step.</p>
          </div>
        </div>
      </div>
    </section>

    <!-- Service Schedule Section -->
    <section id="services" class="services-section">
      <div class="pub-container">
        <div class="section-header">
          <span class="section-header__tag">Join Us in Fellowship</span>
          <h2 class="section-header__title">Weekly Worship & Prayer Schedule</h2>
          <p class="section-header__sub">
            We gather regularly at the Miracle Centre, Loquat Street, Taifa Central. You are warmly welcome to any of our services.
          </p>
        </div>

        <div class="services-grid">
          <!-- Sunday Service -->
          <div class="service-card service-card--featured">
            <div class="service-card__badge">Main Gatherings</div>
            <div class="service-card__icon">☀️</div>
            <h3 class="service-card__title">Sunday Glorious Services</h3>
            <p class="service-card__desc">A time of uplifting praise, soul-enriching worship, and life-transforming sermons.</p>
            <div class="service-card__times">
              <div class="time-slot">
                <span class="time-slot__label">First Service</span>
                <span class="time-slot__val">7:00 AM – 9:30 AM</span>
              </div>
              <div class="time-slot">
                <span class="time-slot__label">Second Service</span>
                <span class="time-slot__val">9:45 AM – 12:00 PM</span>
              </div>
            </div>
            <div class="service-card__extra">
              <span>Includes Children & Youth Sunday Classes</span>
            </div>
          </div>

          <!-- Wednesday Service -->
          <div class="service-card">
            <div class="service-card__icon">📖</div>
            <h3 class="service-card__title">Wednesday Solution Hour</h3>
            <p class="service-card__desc">In-depth Bible teaching, interactive discipleship, and communal prayer for everyday victories.</p>
            <div class="service-card__times">
              <div class="time-slot">
                <span class="time-slot__label">Every Wednesday Evening</span>
                <span class="time-slot__val">6:00 PM – 8:00 PM</span>
              </div>
            </div>
            <div class="service-card__extra">
              <span>Bring your Bible & note pad</span>
            </div>
          </div>

          <!-- Friday Service -->
          <div class="service-card">
            <div class="service-card__icon">🛡️</div>
            <h3 class="service-card__title">Friday Deliverance Hour</h3>
            <p class="service-card__desc">Spiritual warfare, intercessory prayer, prophetic insight, and monthly Half-Night vigils.</p>
            <div class="service-card__times">
              <div class="time-slot">
                <span class="time-slot__label">Weekly Deliverance Hour</span>
                <span class="time-slot__val">6:30 PM – 9:00 PM</span>
              </div>
              <div class="time-slot">
                <span class="time-slot__label">Last Friday (Half-Night)</span>
                <span class="time-slot__val">10:00 PM – 3:00 AM</span>
              </div>
            </div>
            <div class="service-card__extra">
              <span>Fervent, Holy Spirit led intercession</span>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- App Showcase Section -->
    <section id="app-download" class="app-section">
      <div class="pub-container app-section__inner">
        <div class="app-content">
          <span class="section-header__tag section-header__tag--light">Official Church App</span>
          <h2 class="app-content__title">
            The CACI Taifa App: Stay Connected to Your Church Family Everywhere
          </h2>
          <p class="app-content__desc">
            Designed specifically for Christ Apostolic Church International - Taifa Central members and friends. Access church resources, give tithes and offerings with instant receipts, listen to sermons, and receive announcements anytime, anywhere.
          </p>

          <div class="app-features">
            <div class="app-feature-row">
              <div class="app-feature-icon">💳</div>
              <div>
                <h4>Seamless Mobile Giving & Instant Receipts</h4>
                <p>Give your Tithes, First Fruits, Offerings, and Welfare securely via Mobile Money or Card, and access your verified digital receipts anytime.</p>
              </div>
            </div>

            <div class="app-feature-row">
              <div class="app-feature-icon">🎙️</div>
              <div>
                <h4>Sermon Audio & Video Library</h4>
                <p>Never miss a sermon. Stream past Sunday messages, midweek series, and special convention audio on your phone.</p>
              </div>
            </div>

            <div class="app-feature-row">
              <div class="app-feature-icon">🎵</div>
              <div>
                <h4>CACI Hymns & Scripture Reading (Dwom)</h4>
                <p>Full digital access to church hymns, order of service, scripture references, and devotionals.</p>
              </div>
            </div>

            <div class="app-feature-row">
              <div class="app-feature-icon">🔔</div>
              <div>
                <h4>Instant Announcements & Event Reminders</h4>
                <p>Get push notifications for prayer sessions, fellowship dates, youth activities, and leadership bulletins.</p>
              </div>
            </div>
          </div>

          <!-- Store Download Badges -->
          <AppStoreLinks variant="dark" />
        </div>
            </div>
          </div>
        </div>

        <!--
          The real app, photographed from the real app. This was a phone drawn
          in CSS showing invented screens -- a giving card reading "Verified &
          Instant" and a row of emoji -- none of which exists in the app a
          visitor would then download.
        -->
        <div class="app-visual">
          <img
            src="~assets/imgs/app_preview.jpg"
            alt="The CACI Taifa app showing the home screen with the day's bible verse and the church feed, beside the events screen"
            class="app-visual__shot"
            width="800"
            height="720"
            loading="lazy"
          >
        </div>
      </div>
    </section>

    <!-- Church Ministries Section -->
    <section id="ministries" class="ministries-section">
      <div class="pub-container">
        <div class="section-header">
          <span class="section-header__tag">Church Family Life</span>
          <h2 class="section-header__title">Our Ministries & Fellowships</h2>
          <p class="section-header__sub">
            There is a place for everyone at CACI Taifa Central. Grow in your relationship with God alongside brothers and sisters of like faith.
          </p>
        </div>

        <div class="ministries-grid">
          <div class="ministry-card">
            <div class="ministry-card__icon">👔</div>
            <h3 class="ministry-card__title">Men's Movement</h3>
            <p class="ministry-card__desc">Empowering Christian men to be righteous priests in their homes, mentors in the church, and upright leaders in the marketplace.</p>
          </div>

          <div class="ministry-card">
            <div class="ministry-card__icon">🌸</div>
            <h3 class="ministry-card__title">Women's Movement</h3>
            <p class="ministry-card__desc">Virtuous, prayerful, and supportive women devoted to family building, prayer intercession, and practical Christian charity.</p>
          </div>

          <div class="ministry-card">
            <div class="ministry-card__icon">⚡</div>
            <h3 class="ministry-card__title">Youth Fellowship</h3>
            <p class="ministry-card__desc">Dynamic, Christ-driven young people living passionately for Jesus, developing their talents, and impacting campus and career.</p>
          </div>

          <div class="ministry-card">
            <div class="ministry-card__icon">🎨</div>
            <h3 class="ministry-card__title">Children's Ministry</h3>
            <p class="ministry-card__desc">Nurturing our young ones in the fear and admonition of the Lord with age-appropriate Bible stories, memory verses, and joyful songs.</p>
          </div>

          <div class="ministry-card">
            <div class="ministry-card__icon">🎶</div>
            <h3 class="ministry-card__title">Music & Praise Ministry</h3>
            <p class="ministry-card__desc">Lifting up a sweet fragrance of praise and worship that ushers the congregation into the manifest presence and power of God.</p>
          </div>

          <div class="ministry-card">
            <div class="ministry-card__icon">🌍</div>
            <h3 class="ministry-card__title">Evangelism & Missions</h3>
            <p class="ministry-card__desc">Carrying the Great Commission to streets, homes, and schools in Taifa, winning souls and establishing them in Christ.</p>
          </div>
        </div>
      </div>
    </section>

    <!-- Member Portal Callout Section -->
    <section class="portal-cta">
      <div class="pub-container portal-cta__inner">
        <div class="portal-cta__content">
          <h2>Access the CACI Member & Church Portal</h2>
          <p>
            Are you a registered member or leader of CACI Taifa Central? Sign in to view your verified tithe records, print donation receipts, update your member profile, and access church administrative services.
          </p>
        </div>
        <div class="portal-cta__actions">
          <NuxtLink to="/login" class="hero-btn hero-btn--primary hero-btn--lg">
            <span>Sign In to Member Portal</span>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <line x1="5" y1="12" x2="19" y2="12"></line>
              <polyline points="12 5 19 12 12 19"></polyline>
            </svg>
          </NuxtLink>
          <NuxtLink to="/register" class="hero-btn hero-btn--secondary">
            <span>Register as New Member</span>
          </NuxtLink>
        </div>
      </div>
    </section>

    <!-- Location & Directions -->
    <section class="location-section">
      <div class="pub-container location-section__inner">
        <div class="location-card">
          <span class="section-header__tag">Visit Us</span>
          <h3>Christ Apostolic Church Int. - Taifa Central</h3>
          <p class="location-address">
            📍 <strong>Loquat Street, Taifa Central Assembly</strong>, near Taifa Bank & Market, Accra, Ghana
          </p>
          <p class="location-hours">
            Open for counseling, prayer appointments, and weekly fellowship.
          </p>
          <div class="location-contact-list">
            <div>📞 <strong>Phone:</strong> +233 24 296 9760 / +233 59 627 0150</div>
            <div>✉️ <strong>Email:</strong> cactaifacentral@gmail.com</div>
          </div>
          <div class="location-btn-group">
            <a
              href="https://web.facebook.com/CACTaifaCentral/?_rdc=1&_rdr#"
              target="_blank"
              rel="noopener noreferrer"
              class="hero-btn hero-btn--secondary"
            >
              Visit Our Facebook Page
            </a>
            <NuxtLink to="/support" class="hero-btn hero-btn--ghost">
              Contact Support
            </NuxtLink>
          </div>
        </div>
      </div>
    </section>

    <PublicFooter />
  </div>
</template>

<script>
export default {
  // Public site, not the admin app: no AppShell, so a signed-in visitor
  // does not get the admin sidebar stacked above this page's own header.
  layout: 'public',
  auth: false,
  name: 'IndexPage',
  head() {
    const churchSchema = {
      '@context': 'https://schema.org',
      '@type': 'Church',
      name: 'Christ Apostolic Church International, Taifa Central Assembly',
      alternateName: ['CACI Taifa Central', 'Miracle Centre Assembly'],
      description: 'Official website of Christ Apostolic Church International, Taifa Central Assembly (Miracle Centre), Accra, Ghana. Weekly worship schedules, sermon archives, digital tithes & offerings, and mobile app.',
      url: 'https://cacitaifa.com',
      logo: 'https://cacitaifa.com/android-chrome-512x512.png',
      image: 'https://cacitaifa.com/og-image.jpg',
      telephone: '+233242969760',
      email: 'cactaifacentral@gmail.com',
      address: {
        '@type': 'PostalAddress',
        streetAddress: 'Loquat Street, Taifa Central',
        addressLocality: 'Taifa, Accra',
        addressRegion: 'Greater Accra',
        addressCountry: 'GH'
      },
      sameAs: [
        'https://web.facebook.com/CACTaifaCentral/'
      ],
      openingHoursSpecification: [
        {
          '@type': 'OpeningHoursSpecification',
          dayOfWeek: ['Sunday'],
          opens: '07:00',
          closes: '12:00'
        },
        {
          '@type': 'OpeningHoursSpecification',
          dayOfWeek: ['Wednesday'],
          opens: '18:00',
          closes: '20:00'
        },
        {
          '@type': 'OpeningHoursSpecification',
          dayOfWeek: ['Friday'],
          opens: '18:30',
          closes: '21:00'
        }
      ]
    }

    return {
      title: 'Christ Apostolic Church Int. - Taifa Central Assembly | Miracle Centre',
      meta: [
        {
          hid: 'description',
          name: 'description',
          content: 'Official website of Christ Apostolic Church International, Taifa Central Assembly (Miracle Centre), Accra, Ghana. Weekly service times, ministries, mobile app downloads, and member login.'
        },
        {
          hid: 'og:title',
          property: 'og:title',
          content: 'Christ Apostolic Church Int. - Taifa Central Assembly | Miracle Centre'
        },
        {
          hid: 'og:description',
          property: 'og:description',
          content: 'Join us in worship, prayer, and fellowship at Taifa Central. Experience God’s presence and access church services on our mobile app.'
        }
      ],
      script: [
        {
          type: 'application/ld+json',
          json: churchSchema
        }
      ]
    }
  }
}
</script>

<style scoped>
.church-home {
  font-family: var(--ds-font-sans, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif);
  color: #0f172a;
  background-color: #ffffff;
  overflow-x: hidden;
}

.pub-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 24px;
}

/* Hero */
.hero {
  position: relative;
  background: linear-gradient(135deg, #0b1329 0%, #172554 50%, #1e3a8a 100%);
  color: #ffffff;
  padding: 96px 0 88px;
  overflow: hidden;
}

.hero__bg-overlay {
  position: absolute;
  inset: 0;
  background-image: radial-gradient(rgba(255, 255, 255, 0.08) 1px, transparent 1px);
  background-size: 24px 24px;
  opacity: 0.7;
}

.hero__content {
  position: relative;
  z-index: 2;
  max-width: 860px;
  text-align: center;
  margin: 0 auto;
}

.hero__logo-wrapper {
  margin-bottom: 24px;
  display: flex;
  justify-content: center;
}

.hero__logo {
  width: 120px;
  height: 120px;
  object-fit: contain;
  border-radius: 50%;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.45);
  animation: heroLogoFloat 4s ease-in-out infinite alternate;
}

@keyframes heroLogoFloat {
  0% {
    transform: translateY(0);
  }
  100% {
    transform: translateY(-8px);
  }
}

.hero__badge {
  display: inline-flex;
  align-items: center;
  gap: 10px;
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
  padding: 6px 16px;
  border-radius: 9999px;
  font-size: 0.85rem;
  font-weight: 600;
  color: #fbbf24;
  margin-bottom: 24px;
  backdrop-filter: blur(8px);
}

.hero__badge-pulse {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: #10b981;
  box-shadow: 0 0 0 3px rgba(16, 185, 129, 0.35);
}

.hero__title {
  font-size: 3.25rem;
  font-weight: 800;
  line-height: 1.15;
  letter-spacing: -0.02em;
  margin-bottom: 20px;
  color: #ffffff;
}

.hero__highlight {
  background: linear-gradient(120deg, #fde68a 0%, #f59e0b 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}

.hero__subtitle {
  font-size: 1.2rem;
  line-height: 1.6;
  color: #cbd5e1;
  margin: 0 auto 36px;
  max-width: 720px;
}

.hero__actions {
  display: flex;
  align-items: center;
  justify-content: center;
  flex-wrap: wrap;
  gap: 16px;
  margin-bottom: 44px;
}

.hero-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  padding: 13px 26px;
  font-size: 0.95rem;
  font-weight: 600;
  border-radius: 9999px;
  text-decoration: none;
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
  cursor: pointer;
}

.hero-btn--primary {
  background: linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%);
  color: #ffffff !important;
  box-shadow: 0 4px 18px rgba(37, 99, 235, 0.4);
}

.hero-btn--primary:hover {
  background: linear-gradient(135deg, #1d4ed8 0%, #1e40af 100%);
  transform: translateY(-2px);
  box-shadow: 0 6px 24px rgba(37, 99, 235, 0.5);
  color: #ffffff !important;
}

.hero-btn--secondary {
  background: rgba(255, 255, 255, 0.12);
  color: #ffffff !important;
  border: 1px solid rgba(255, 255, 255, 0.25);
  backdrop-filter: blur(8px);
}

.hero-btn--secondary:hover {
  background: rgba(255, 255, 255, 0.2);
  border-color: rgba(255, 255, 255, 0.4);
  transform: translateY(-2px);
  color: #ffffff !important;
}

.hero-btn--ghost {
  background: transparent;
  color: #cbd5e1 !important;
  padding: 13px 18px;
}

.hero-btn--ghost:hover {
  color: #ffffff !important;
}

.hero-btn--lg {
  padding: 15px 32px;
  font-size: 1.05rem;
}

.hero__scripture {
  padding-top: 24px;
  border-top: 1px solid rgba(255, 255, 255, 0.12);
  max-width: 600px;
  margin: 0 auto;
}

.hero__verse {
  font-style: italic;
  font-size: 0.95rem;
  color: #94a3b8;
  margin-bottom: 4px;
}

.hero__reference {
  font-size: 0.8rem;
  color: #fbbf24;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

/* Quick Highlights */
.quick-highlights {
  background: #f8fafc;
  border-bottom: 1px solid #e2e8f0;
  padding: 28px 0;
}

.quick-highlights__grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 32px;
}

.highlight-item {
  display: flex;
  align-items: flex-start;
  gap: 16px;
}

.highlight-item__icon {
  font-size: 28px;
  flex-shrink: 0;
  background: #ffffff;
  width: 52px;
  height: 52px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
  border: 1px solid #e2e8f0;
}

.highlight-item h3 {
  font-size: 1rem;
  font-weight: 700;
  margin: 0 0 4px;
  color: #0f172a;
}

.highlight-item p {
  font-size: 0.875rem;
  color: #64748b;
  margin: 0;
  line-height: 1.5;
}

/* Section Header Generic */
.section-header {
  text-align: center;
  max-width: 700px;
  margin: 0 auto 52px;
}

.section-header__tag {
  display: inline-block;
  font-size: 0.8rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  color: #2563eb;
  background: #eff6ff;
  padding: 5px 14px;
  border-radius: 9999px;
  margin-bottom: 12px;
}

.section-header__tag--light {
  color: #fbbf24;
  background: rgba(251, 191, 36, 0.15);
}

.section-header__title {
  font-size: 2.25rem;
  font-weight: 800;
  color: #0f172a;
  letter-spacing: -0.02em;
  margin-bottom: 14px;
}

.section-header__sub {
  font-size: 1.05rem;
  color: #64748b;
  line-height: 1.6;
}

/* Services */
.services-section {
  padding: 88px 0;
  background: #ffffff;
}

.services-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 28px;
}

.service-card {
  position: relative;
  background: #ffffff;
  border: 1px solid #e2e8f0;
  border-radius: 16px;
  padding: 32px 28px;
  display: flex;
  flex-direction: column;
  box-shadow: 0 4px 12px rgba(15, 23, 42, 0.03);
  transition: all 0.25s ease;
}

.service-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 12px 28px rgba(15, 23, 42, 0.08);
  border-color: #cbd5e1;
}

.service-card--featured {
  border-color: #93c5fd;
  background: linear-gradient(180deg, #f0f7ff 0%, #ffffff 100%);
  box-shadow: 0 8px 24px rgba(37, 99, 235, 0.08);
}

.service-card__badge {
  position: absolute;
  top: 18px;
  right: 18px;
  background: #2563eb;
  color: #ffffff;
  font-size: 0.72rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  padding: 4px 10px;
  border-radius: 9999px;
}

.service-card__icon {
  font-size: 36px;
  margin-bottom: 16px;
}

.service-card__title {
  font-size: 1.35rem;
  font-weight: 700;
  color: #0f172a;
  margin-bottom: 10px;
}

.service-card__desc {
  font-size: 0.92rem;
  color: #64748b;
  line-height: 1.55;
  margin-bottom: 24px;
}

.service-card__times {
  display: flex;
  flex-direction: column;
  gap: 12px;
  padding: 16px;
  background: rgba(241, 245, 249, 0.8);
  border-radius: 10px;
  margin-top: auto;
}

.time-slot {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 0.88rem;
}

.time-slot__label {
  color: #475569;
  font-weight: 500;
}

.time-slot__val {
  color: #1e293b;
  font-weight: 700;
}

.service-card__extra {
  margin-top: 14px;
  font-size: 0.8rem;
  color: #d97706;
  font-weight: 600;
}

/* App Section */
.app-section {
  background: linear-gradient(135deg, #0b1329 0%, #0f172a 100%);
  color: #ffffff;
  padding: 96px 0;
  position: relative;
  overflow: hidden;
}

.app-section__inner {
  display: grid;
  grid-template-columns: 1.2fr 0.8fr;
  gap: 64px;
  align-items: center;
}

.app-content__title {
  font-size: 2.35rem;
  font-weight: 800;
  line-height: 1.2;
  margin: 16px 0 20px;
  letter-spacing: -0.02em;
}

.app-content__desc {
  font-size: 1.05rem;
  color: #94a3b8;
  line-height: 1.6;
  margin-bottom: 32px;
}

.app-features {
  display: flex;
  flex-direction: column;
  gap: 20px;
  margin-bottom: 40px;
}

.app-feature-row {
  display: flex;
  align-items: flex-start;
  gap: 16px;
}

.app-feature-icon {
  font-size: 24px;
  background: rgba(255, 255, 255, 0.08);
  width: 44px;
  height: 44px;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  border: 1px solid rgba(255, 255, 255, 0.1);
}

.app-feature-row h4 {
  font-size: 1rem;
  font-weight: 700;
  margin: 0 0 4px;
  color: #f1f5f9;
}

.app-feature-row p {
  font-size: 0.88rem;
  color: #94a3b8;
  margin: 0;
  line-height: 1.5;
}

.store-badges {
  display: flex;
  gap: 16px;
  flex-wrap: wrap;
}

.store-badge-card {
  display: inline-flex;
  align-items: center;
  gap: 14px;
  background: rgba(255, 255, 255, 0.08);
  border: 1px solid rgba(255, 255, 255, 0.2);
  padding: 10px 20px;
  border-radius: 12px;
  color: #ffffff;
  cursor: pointer;
  transition: all 0.2s ease;
}

.store-badge-card:hover {
  background: rgba(255, 255, 255, 0.16);
  border-color: rgba(255, 255, 255, 0.4);
  transform: translateY(-2px);
}

.store-badge-card__icon {
  color: #ffffff;
}

.store-badge-card__info {
  display: flex;
  flex-direction: column;
}

.store-badge-card__sub {
  font-size: 0.7rem;
  text-transform: uppercase;
  letter-spacing: 0.04em;
  color: #cbd5e1;
}

.store-badge-card__main {
  font-size: 0.95rem;
  font-weight: 700;
}

/* Phone Mockup */
.app-visual {
  display: flex;
  justify-content: center;
}

.app-visual__shot {
  width: 100%;
  max-width: 420px;
  height: auto;
  border-radius: 16px;
  /* The shot carries its own royal blue, which does not meet this section's
     navy. Framed deliberately rather than pretending it bleeds. */
  box-shadow: 0 24px 60px rgba(0, 0, 0, 0.45);
}

@media (max-width: 900px) {
  .app-visual__shot { max-width: 340px; }
}


/* Ministries */
.ministries-section {
  padding: 88px 0;
  background: #f8fafc;
}

.ministries-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 28px;
}

.ministry-card {
  background: #ffffff;
  border: 1px solid #e2e8f0;
  border-radius: 14px;
  padding: 28px;
  transition: all 0.2s ease;
}

.ministry-card:hover {
  border-color: #cbd5e1;
  box-shadow: 0 8px 20px rgba(15, 23, 42, 0.05);
  transform: translateY(-2px);
}

.ministry-card__icon {
  font-size: 32px;
  margin-bottom: 14px;
}

.ministry-card__title {
  font-size: 1.2rem;
  font-weight: 700;
  color: #0f172a;
  margin-bottom: 8px;
}

.ministry-card__desc {
  font-size: 0.9rem;
  color: #64748b;
  line-height: 1.55;
  margin: 0;
}

/* Member Portal CTA */
.portal-cta {
  background: linear-gradient(135deg, #1e3a8a 0%, #1e40af 100%);
  color: #ffffff;
  padding: 72px 0;
}

.portal-cta__inner {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 40px;
}

.portal-cta__content h2 {
  font-size: 2.1rem;
  font-weight: 800;
  letter-spacing: -0.02em;
  margin-bottom: 12px;
}

.portal-cta__content p {
  font-size: 1.05rem;
  color: #cbd5e1;
  line-height: 1.6;
  max-width: 650px;
  margin: 0;
}

.portal-cta__actions {
  display: flex;
  flex-direction: column;
  gap: 12px;
  flex-shrink: 0;
}

/* Location Section */
.location-section {
  padding: 72px 0;
  background: #ffffff;
}

.location-section__inner {
  max-width: 860px;
}

.location-card {
  background: #f8fafc;
  border: 1px solid #e2e8f0;
  border-radius: 20px;
  padding: 40px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.03);
}

.location-card h3 {
  font-size: 1.6rem;
  font-weight: 800;
  margin: 8px 0 12px;
  color: #0f172a;
}

.location-address {
  font-size: 1.05rem;
  color: #334155;
  margin-bottom: 8px;
}

.location-hours {
  font-size: 0.92rem;
  color: #64748b;
  margin-bottom: 20px;
}

.location-contact-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
  font-size: 0.95rem;
  color: #334155;
  margin-bottom: 28px;
}

.location-btn-group {
  display: flex;
  gap: 16px;
  flex-wrap: wrap;
}

.location-btn-group .hero-btn--secondary {
  background: #0f172a;
  color: #ffffff !important;
  border: none;
}

.location-btn-group .hero-btn--secondary:hover {
  background: #1e293b;
}

.location-btn-group .hero-btn--ghost {
  color: #475569 !important;
  border: 1px solid #cbd5e1;
}

.location-btn-group .hero-btn--ghost:hover {
  background: #e2e8f0;
}

/* Responsive */
@media (max-width: 960px) {
  .hero__title {
    font-size: 2.5rem;
  }
  .quick-highlights__grid,
  .services-grid,
  .ministries-grid {
    grid-template-columns: 1fr;
  }
  .app-section__inner {
    grid-template-columns: 1fr;
  }
  .app-visual {
    /* Shown on a phone now. It was hidden here while it was a mockup drawn in
       CSS, which was worth no space. A screenshot of the app is the most
       persuasive thing on a page about the app, and most of the people
       reading this are already on the device it wants them to install it on. */
    order: -1;
    margin-bottom: 32px;
  }
  .portal-cta__inner {
    flex-direction: column;
    align-items: flex-start;
  }
}

@media (max-width: 600px) {
  .hero {
    padding: 64px 0;
  }
  .hero__title {
    font-size: 2rem;
  }
  .hero__subtitle {
    font-size: 1rem;
  }
  .hero-btn {
    width: 100%;
  }
}
</style>
