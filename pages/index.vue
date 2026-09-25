<template>
  <div class="home">
    <PublicHeader />

    <main id="main" class="pub-main">
      <!-- Hero -->
      <section class="hero" aria-labelledby="hero-title">
        <div class="pub-container hero__inner">
          <img
            src="~assets/imgs/caci_mark.png"
            alt="The CACI Taifa emblem: a dove above the globe, and a baptism in the sea"
            class="hero__mark"
            width="88"
            height="88"
          >
          <p class="pub-eyebrow pub-eyebrow--rule">Christ Apostolic Church International</p>
          <h1 id="hero-title" class="pub-display hero__title">
            Experience God’s presence, love and miracles.
          </h1>
          <p class="pub-lead hero__lead">
            Welcome to the Miracle Centre Assembly, Taifa — a family of believers committed to
            worshipping God in truth, loving our community, and raising disciples for Christ Jesus.
          </p>

          <div class="hero__actions">
            <a href="#services" class="pub-btn pub-btn--primary">Plan your visit</a>
            <a href="#app-download" class="pub-btn pub-btn--secondary">Get the app</a>
          </div>

          <p class="hero__next">
            <span class="hero__dot" aria-hidden="true"></span>
            <span>Sunday Divine Service at <strong>9:00 AM</strong> · Loquat Street, Taifa</span>
          </p>
        </div>
      </section>

      <!-- What to expect -->
      <section class="expect" aria-label="What to expect">
        <div class="pub-container">
          <ul class="expect__list">
            <li v-for="item in expect" :key="item.title" class="expect__item">
              <h2 class="pub-h3">{{ item.title }}</h2>
              <p class="pub-muted">{{ item.text }}</p>
            </li>
          </ul>
        </div>
      </section>

      <!-- Service times & visit -->
      <section id="services" class="pub-section pub-section--soft" aria-labelledby="services-title">
        <div class="pub-container">
          <div class="pub-heading">
            <p class="pub-eyebrow">Service times</p>
            <h2 id="services-title" class="pub-h2">Worship with us</h2>
            <p class="pub-lead">
              We gather at the Miracle Centre on Loquat Street, Taifa. You are warmly welcome at any of our services.
            </p>
          </div>

          <div class="visit">
            <ol class="schedule">
              <li v-for="service in services" :key="service.name" class="schedule__row">
                <p class="schedule__day">{{ service.day }}</p>
                <div class="schedule__what">
                  <h3 class="pub-h3">{{ service.name }}</h3>
                  <p class="pub-muted">{{ service.about }}</p>
                </div>
                <ul class="schedule__times">
                  <li v-for="slot in service.times" :key="slot.time">
                    <span v-if="slot.label" class="schedule__label">{{ slot.label }}</span>
                    <span class="schedule__time">{{ slot.time }}</span>
                  </li>
                </ul>
              </li>
            </ol>

            <aside class="place pub-card" aria-labelledby="place-title">
              <h3 id="place-title" class="pub-h3">Find us</h3>
              <address class="place__address">
                Christ Apostolic Church International<br>
                Taifa Central (Miracle Centre)<br>
                Loquat Street, Taifa, Accra
              </address>
              <a
                :href="mapsUrl"
                target="_blank"
                rel="noopener noreferrer"
                class="pub-btn pub-btn--primary pub-btn--sm place__maps"
              >
                Get directions
              </a>

              <dl class="place__contact">
                <div>
                  <dt>Call</dt>
                  <dd>
                    <a href="tel:+233242969760">+233 24 296 9760</a><br>
                    <a href="tel:+233596270150">+233 59 627 0150</a>
                  </dd>
                </div>
                <div>
                  <dt>Ghana Post GPS</dt>
                  <dd>GE-331-4852</dd>
                </div>
                <div>
                  <dt>Email</dt>
                  <dd><a href="mailto:cactaifacentral@gmail.com">cactaifacentral@gmail.com</a></dd>
                </div>
              </dl>
              <p class="pub-meta">Open for counselling, prayer appointments and weekly fellowship.</p>
            </aside>
          </div>
        </div>
      </section>

      <!-- The app -->
      <section id="app-download" class="pub-section pub-dark app" aria-labelledby="app-title">
        <div class="pub-container app__inner">
          <div class="app__copy">
            <div class="pub-heading app__heading">
              <p class="pub-eyebrow">The CACI Taifa app</p>
              <h2 id="app-title" class="pub-h2">Your church, all week long.</h2>
              <p class="pub-lead">
                Give with instant receipts, listen to sermons, sing the hymns and hear the announcements —
                wherever you are.
              </p>
            </div>

            <ul class="app__features">
              <li v-for="feature in features" :key="feature.title">
                <h3 class="app__feature">{{ feature.title }}</h3>
                <p>{{ feature.text }}</p>
              </li>
            </ul>

            <AppStoreLinks variant="dark" />
          </div>

          <!--
            The real app, photographed from the real app. This was a phone drawn
            in CSS showing invented screens -- a giving card reading "Verified &
            Instant" and a row of emoji -- none of which exists in the app a
            visitor would then download.
          -->
          <figure class="app__visual">
            <img
              src="~assets/imgs/app_preview.jpg"
              alt="The CACI Taifa app showing the home screen with the day's bible verse and the church feed, beside the events screen"
              class="app__shot"
              width="800"
              height="720"
              loading="lazy"
              decoding="async"
            >
          </figure>
        </div>
      </section>

      <!-- Ministries -->
      <section id="ministries" class="pub-section" aria-labelledby="ministries-title">
        <div class="pub-container">
          <div class="pub-heading">
            <p class="pub-eyebrow">Ministries</p>
            <h2 id="ministries-title" class="pub-h2">There is a place for everyone.</h2>
            <p class="pub-lead">
              Grow in your relationship with God alongside brothers and sisters of like faith.
            </p>
          </div>

          <ul class="ministries">
            <li v-for="ministry in ministries" :key="ministry.name" class="ministries__item">
              <h3 class="pub-h3">{{ ministry.name }}</h3>
              <p class="pub-muted">{{ ministry.text }}</p>
            </li>
          </ul>
        </div>
      </section>

      <!-- The commission the emblem depicts -->
      <section class="pub-section pub-section--soft verse" aria-label="Scripture">
        <div class="pub-container pub-container--narrow">
          <figure class="verse__figure">
            <blockquote class="verse__quote">
              <p>“Go ye into all the world, and preach the gospel to every creature.”</p>
            </blockquote>
            <figcaption class="pub-eyebrow pub-eyebrow--rule">Mark 16:15</figcaption>
          </figure>
        </div>
      </section>

      <!-- Member sign in -->
      <section class="portal" aria-labelledby="portal-title">
        <div class="pub-container portal__inner">
          <div class="portal__copy">
            <h2 id="portal-title" class="pub-h3">Members and church leaders</h2>
            <p class="pub-muted">
              Sign in to see your giving records, print receipts and keep your details up to date.
            </p>
          </div>
          <div class="portal__actions">
            <NuxtLink to="/login" class="pub-btn pub-btn--primary">Sign in</NuxtLink>
            <NuxtLink to="/register" class="pub-btn pub-btn--secondary">Register as a member</NuxtLink>
          </div>
        </div>
      </section>
    </main>

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
  data () {
    return {
      // The church's own Maps listing, by place id, so directions end at the
      // building rather than at whatever a name search finds first.
      mapsUrl: 'https://www.google.com/maps/search/?api=1&query=Christ+Apostolic+Church+International+Taifa+Central&query_place_id=ChIJowBTHM-e3w8RBkwe7hfQsdE',
      expect: [
        { title: 'Christ-centred Word', text: 'Solid biblical teaching that anchors your daily walk in faith.' },
        { title: 'Spirit-filled worship', text: 'An atmosphere of prayer, deliverance and genuine breakthrough.' },
        { title: 'A warm family', text: 'An open, caring fellowship ready to walk with you every step.' }
      ],
      // As the church's public listing gives them. Midweek services have no
      // published clock times, so none are invented here.
      services: [
        {
          day: 'Sunday',
          name: 'Divine Service',
          about: 'Praise, worship and the Word.',
          times: [{ label: 'Morning service', time: '9:00 AM – 12:00 PM' }]
        },
        {
          day: 'Wednesday',
          name: 'Midweek services',
          about: 'Bible teaching and prayer. Call the office for this week’s times.',
          times: [{ time: 'Morning' }, { time: 'Evening' }]
        },
        {
          day: 'Friday',
          name: 'Prayer services',
          about: 'Intercession and prayer. Call the office for this week’s times.',
          times: [{ time: 'Morning' }, { time: 'Evening' }]
        }
      ],
      features: [
        { title: 'Giving and receipts', text: 'Tithes, offerings and welfare by Mobile Money or card, with a receipt for every gift.' },
        { title: 'Sermons', text: 'Sunday messages, midweek series and convention audio, whenever you want them.' },
        { title: 'Hymns and scripture', text: 'The church hymns (Dwom), the order of service and daily readings.' },
        { title: 'Announcements', text: 'Reminders for prayer sessions, fellowship dates and youth activities.' }
      ],
      ministries: [
        { name: 'Men’s Movement', text: 'Christian men as priests in their homes, mentors in the church and upright leaders at work.' },
        { name: 'Women’s Movement', text: 'Prayerful women devoted to family building, intercession and practical charity.' },
        { name: 'Youth Fellowship', text: 'Young people living passionately for Jesus and growing their gifts on campus and in career.' },
        { name: 'Children’s Ministry', text: 'Bible stories, memory verses and joyful songs that raise little ones in the Lord.' },
        { name: 'Music & Praise', text: 'Praise and worship that leads the congregation into the presence of God.' },
        { name: 'Evangelism & Missions', text: 'The Great Commission carried to the streets, homes and schools of Taifa.' }
      ]
    }
  },
  head () {
    const churchSchema = {
      '@context': 'https://schema.org',
      '@type': 'Church',
      name: 'Christ Apostolic Church International, Taifa Central Assembly',
      alternateName: ['CACI Taifa Central', 'Miracle Centre Assembly'],
      description: 'Official website of Christ Apostolic Church International, Taifa Central Assembly (Miracle Centre), Accra, Ghana. Weekly worship schedules, sermon archives, digital tithes & offerings, and mobile app.',
      url: 'https://cacitaifa.com',
      logo: 'https://cacitaifa.com/android-chrome-512x512.png',
      image: 'https://cacitaifa.com/og-image.jpg',
      telephone: ['+233242969760', '+233596270150'],
      email: 'cactaifacentral@gmail.com',
      address: {
        '@type': 'PostalAddress',
        streetAddress: 'Loquat Street',
        postOfficeBoxNumber: 'TA 184',
        addressLocality: 'Taifa, Accra',
        addressRegion: 'Greater Accra',
        addressCountry: 'GH'
      },
      geo: {
        '@type': 'GeoCoordinates',
        latitude: 5.65924,
        longitude: -0.25226
      },
      hasMap: 'https://www.google.com/maps/search/?api=1&query=Christ+Apostolic+Church+International+Taifa+Central&query_place_id=ChIJowBTHM-e3w8RBkwe7hfQsdE',
      foundingDate: '1986-03-09',
      sameAs: [
        'https://web.facebook.com/CACTaifaCentral/',
        'https://www.instagram.com/cacitaifacentral/',
        'https://x.com/cactaifacentral'
      ],
      // Only the service with published hours. Wednesday and Friday have
      // morning and evening services but no public times yet.
      openingHoursSpecification: [
        {
          '@type': 'OpeningHoursSpecification',
          dayOfWeek: ['Sunday'],
          opens: '09:00',
          closes: '12:00'
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
.home { display: contents; }

/* Hero ------------------------------------------------------------------ */

.hero {
  position: relative;
  padding: clamp(64px, 10vw, 136px) 0 clamp(56px, 8vw, 104px);
  text-align: center;
  overflow: hidden;
}

/* One soft wash of the brand navy, from where the emblem sits. */
.hero::before {
  content: '';
  position: absolute;
  inset: -40% -20% auto;
  height: 90%;
  background: radial-gradient(closest-side, rgba(27, 61, 143, 0.08), transparent);
  pointer-events: none;
}

.hero__inner {
  position: relative;
  display: grid;
  justify-items: center;
  gap: 24px;
  max-width: calc(900px + 2 * var(--pub-gutter));
}

.hero__mark { width: 88px; height: 88px; }

.hero__title { color: var(--pub-navy-ink); max-width: 13.5em; }

.hero__lead { margin-top: -4px; }

.hero__actions {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 12px;
  margin-top: 8px;
}

.hero__next {
  display: inline-flex;
  align-items: baseline;
  gap: 10px;
  margin-top: 8px;
  font-size: var(--pub-small);
  color: var(--pub-text-2);
}
.hero__next strong { font-weight: 600; color: var(--pub-text); font-variant-numeric: tabular-nums; }

.hero__dot {
  flex-shrink: 0;
  align-self: center;
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: var(--pub-red);
}

/* What to expect -------------------------------------------------------- */

.expect { border-top: 1px solid var(--pub-line); }

.expect__list {
  list-style: none;
  padding: 0;
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
}

.expect__item {
  display: grid;
  gap: 8px;
  align-content: start;
  padding: 40px 32px 44px;
}
.expect__item:first-child { padding-left: 0; }
.expect__item:last-child { padding-right: 0; }
.expect__item + .expect__item { border-left: 1px solid var(--pub-line); }

/* Service times & visit ------------------------------------------------- */

.visit {
  display: grid;
  grid-template-columns: minmax(0, 1.65fr) minmax(280px, 1fr);
  gap: 24px;
  align-items: start;
}

.schedule {
  list-style: none;
  padding: 0;
  background: var(--pub-bg);
  border: 1px solid var(--pub-line);
  border-radius: var(--pub-radius);
}

.schedule__row {
  display: grid;
  grid-template-columns: 112px minmax(0, 1fr) auto;
  gap: 8px 24px;
  padding: 28px 32px;
}
.schedule__row + .schedule__row { border-top: 1px solid var(--pub-line); }

.schedule__day {
  font-size: var(--pub-micro);
  font-weight: 600;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: var(--pub-navy);
  padding-top: 3px;
}

.schedule__what { display: grid; gap: 6px; }
.schedule__what .pub-muted { font-size: var(--pub-small); }

.schedule__times {
  list-style: none;
  padding: 0;
  display: grid;
  gap: 10px;
  text-align: right;
  align-content: start;
}
.schedule__times li { display: grid; gap: 2px; }
.schedule__label { font-size: var(--pub-micro); color: var(--pub-text-3); }
.schedule__time {
  font-weight: 600;
  font-variant-numeric: tabular-nums;
  white-space: nowrap;
  color: var(--pub-text);
}

.place { display: grid; gap: 20px; }
.place__address { font-style: normal; line-height: 1.6; color: var(--pub-text-2); }
.place__maps { justify-self: start; }

.place__contact {
  display: grid;
  gap: 16px;
  padding-top: 20px;
  border-top: 1px solid var(--pub-line);
}
.place__contact dt { font-size: var(--pub-micro); color: var(--pub-text-3); margin-bottom: 2px; }
.place__contact dd { margin: 0; line-height: 1.6; overflow-wrap: anywhere; }
.place__contact a { text-decoration: none; }
.place__contact a:hover { text-decoration: underline; }

/* The app --------------------------------------------------------------- */

.app__inner {
  display: grid;
  grid-template-columns: minmax(0, 1.1fr) minmax(0, 0.9fr);
  gap: clamp(40px, 6vw, 88px);
  align-items: center;
}

.app__heading { margin-bottom: 40px; }

.app__features {
  list-style: none;
  padding: 0;
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 28px 32px;
  margin-bottom: 40px;
}
.app__features li {
  display: grid;
  gap: 6px;
  padding-top: 16px;
  border-top: 1px solid var(--pub-line-dark);
}
.app__feature {
  font-size: 1rem;
  font-weight: 600;
  color: var(--pub-on-dark);
}
.app__features p { font-size: var(--pub-small); line-height: 1.55; color: var(--pub-on-dark-2); }

.app__visual { display: flex; justify-content: center; }

.app__shot {
  width: 100%;
  max-width: 460px;
  height: auto;
  border-radius: 24px;
  /* The shot carries its own royal blue, which does not meet this section's
     navy. Framed deliberately rather than pretending it bleeds. */
  box-shadow: 0 0 0 1px rgba(255, 255, 255, 0.08), 0 32px 64px -16px rgba(0, 0, 0, 0.5);
}

/* Ministries ------------------------------------------------------------ */

.ministries {
  list-style: none;
  padding: 0;
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 0 40px;
}

.ministries__item {
  display: grid;
  gap: 8px;
  align-content: start;
  padding: 28px 0 36px;
  border-top: 1px solid var(--pub-line);
}
.ministries__item .pub-muted { font-size: var(--pub-small); line-height: 1.6; }

/* Scripture ------------------------------------------------------------- */

.verse__figure { display: grid; justify-items: center; gap: 28px; text-align: center; }

.verse__quote { margin: 0; }
.verse__quote p {
  font-family: var(--pub-serif);
  font-style: italic;
  font-weight: 400;
  font-size: clamp(1.75rem, 1.2rem + 2.2vw, 2.75rem);
  line-height: 1.25;
  letter-spacing: -0.015em;
  color: var(--pub-navy-ink);
  text-wrap: balance;
}

/* Member sign in -------------------------------------------------------- */

.portal { border-top: 1px solid var(--pub-line); }

.portal__inner {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: space-between;
  gap: 24px 48px;
  padding-top: 48px;
  padding-bottom: 48px;
}

.portal__copy { display: grid; gap: 6px; max-width: 56ch; text-wrap: pretty; }
.portal__actions { display: flex; flex-wrap: wrap; gap: 12px; }

/* Responsive ------------------------------------------------------------ */

@media (max-width: 960px) {
  .visit { grid-template-columns: 1fr; }
  .app__inner { grid-template-columns: 1fr; }
  /* Shown on a phone, above the copy. A screenshot of the app is the most
     persuasive thing on a page about the app, and most of the people
     reading this are already on the device it wants them to install it on. */
  .app__visual { order: -1; }
  .app__shot { max-width: 400px; }
  .ministries { grid-template-columns: repeat(2, minmax(0, 1fr)); }
}

@media (max-width: 720px) {
  .expect__list { grid-template-columns: 1fr; }
  .expect__item,
  .expect__item:first-child,
  .expect__item:last-child { padding: 28px 0; }
  .expect__item + .expect__item { border-left: 0; border-top: 1px solid var(--pub-line); }

  .schedule__row { grid-template-columns: 1fr; padding: 24px; gap: 12px; }
  .schedule__times { text-align: left; grid-template-columns: repeat(auto-fit, minmax(150px, 1fr)); gap: 12px 24px; }

  .app__features { grid-template-columns: 1fr; gap: 20px; }
  .ministries { grid-template-columns: 1fr; }
}

@media (max-width: 480px) {
  /* The eyebrow wraps at this width; the rule goes above it rather than
     being stranded at the start of the first line. Same for the dot. */
  .hero .pub-eyebrow { flex-direction: column; gap: 12px; }
  .hero__dot { display: none; }
  .hero__actions { width: 100%; flex-direction: column; }
  .hero__actions .pub-btn { width: 100%; }
  .portal__actions { width: 100%; }
  .portal__actions .pub-btn { flex: 1 1 100%; }
}
</style>
