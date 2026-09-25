<template>
  <transition name="acs">
    <div v-if="open" class="acs" @click.self="$emit('close')">
      <div
        ref="panel"
        class="acs__panel"
        role="dialog"
        aria-modal="true"
        aria-labelledby="acs-title"
        aria-describedby="acs-lead"
      >
        <button ref="close" type="button" class="acs__close" aria-label="Close" @click="$emit('close')">
          <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="1.8"
               stroke-linecap="round" aria-hidden="true">
            <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        </button>

        <div class="acs__copy">
          <p class="acs__eyebrow">The CACI Taifa app</p>
          <h2 id="acs-title" class="acs__title">Coming {{ launch.short }}.</h2>
          <p id="acs-lead" class="acs__lead">
            Sermons, giving with instant receipts, the hymns and the week’s announcements —
            on the App Store and Google Play from {{ launch.day }}.
          </p>

          <p class="acs__count" aria-live="polite">
            <span class="acs__dot" aria-hidden="true"></span>
            {{ countdown }}
          </p>

          <div class="acs__actions">
            <button type="button" class="acs__btn acs__btn--primary" @click="addToCalendar">
              Add to my calendar
            </button>
            <button type="button" class="acs__btn acs__btn--quiet" @click="$emit('close')">
              Close
            </button>
          </div>
        </div>

        <figure class="acs__visual">
          <img
            src="~assets/imgs/app_preview.jpg"
            alt="The CACI Taifa app: the home screen with the day's bible verse, and the events screen"
            width="800"
            height="720"
            decoding="async"
          >
        </figure>
      </div>
    </div>
  </transition>
</template>

<script>
import { APP_LAUNCH, daysUntilLaunch } from '../resources/appLinks'

/**
 * What a store badge opens until the app is on the stores.
 *
 * The badges used to link to listings that did not exist yet, so a visitor
 * who tapped one landed on a store error. This says when instead, and lets
 * them put the date in their calendar.
 */
export default {
  name: 'AppComingSoon',
  props: {
    open: { type: Boolean, default: false }
  },
  data () {
    return { launch: APP_LAUNCH, returnTo: null }
  },
  computed: {
    countdown () {
      const days = daysUntilLaunch()
      if (days <= 1) { return 'Out tomorrow' }
      return `${days} days to go`
    }
  },
  watch: {
    open (isOpen) {
      if (isOpen) {
        this.returnTo = document.activeElement
        document.body.style.overflow = 'hidden'
        document.addEventListener('keydown', this.onKeydown)
        this.$nextTick(() => this.$refs.close && this.$refs.close.focus())
      } else {
        this.release()
      }
    }
  },
  beforeDestroy () {
    this.release()
  },
  methods: {
    release () {
      document.body.style.overflow = ''
      document.removeEventListener('keydown', this.onKeydown)
      if (this.returnTo && this.returnTo.focus) { this.returnTo.focus() }
      this.returnTo = null
    },
    onKeydown (event) {
      if (event.key === 'Escape') {
        this.$emit('close')
        return
      }
      if (event.key !== 'Tab' || !this.$refs.panel) { return }
      const focusable = [...this.$refs.panel.querySelectorAll('button')]
      const first = focusable[0]
      const last = focusable[focusable.length - 1]
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault()
        last.focus()
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault()
        first.focus()
      }
    },
    // An all-day event, built here so the reminder needs nothing from a
    // server and works in whichever calendar the phone opens it with.
    addToCalendar () {
      const ics = [
        'BEGIN:VCALENDAR',
        'VERSION:2.0',
        'PRODID:-//CACI Taifa//App launch//EN',
        'BEGIN:VEVENT',
        'UID:caci-taifa-app-launch-20261015@cacitaifa.com',
        'DTSTAMP:20260925T000000Z',
        'DTSTART;VALUE=DATE:20261015',
        'DTEND;VALUE=DATE:20261016',
        'SUMMARY:The CACI Taifa app is out',
        'DESCRIPTION:Download it from the App Store or Google Play: https://cacitaifa.com/#app-download',
        'URL:https://cacitaifa.com/#app-download',
        'END:VEVENT',
        'END:VCALENDAR'
      ].join('\r\n')

      const url = URL.createObjectURL(new Blob([ics], { type: 'text/calendar;charset=utf-8' }))
      const link = document.createElement('a')
      link.href = url
      link.download = 'caci-taifa-app.ics'
      document.body.appendChild(link)
      link.click()
      link.remove()
      setTimeout(() => URL.revokeObjectURL(url), 1000)
    }
  }
}
</script>

<style scoped>
.acs {
  position: fixed;
  inset: 0;
  z-index: 2500;
  display: grid;
  place-items: center;
  padding: 24px;
  background: rgba(6, 14, 38, 0.62);
  -webkit-backdrop-filter: blur(10px);
  backdrop-filter: blur(10px);
}

.acs__panel {
  position: relative;
  width: min(960px, 100%);
  max-height: calc(100vh - 48px);
  overflow: auto;
  display: grid;
  grid-template-columns: minmax(0, 1.05fr) minmax(0, 0.95fr);
  align-items: center;
  gap: clamp(24px, 4vw, 56px);
  padding: clamp(32px, 5vw, 64px);
  border-radius: 28px;
  color: #FFFFFF;
  background:
    radial-gradient(120% 90% at 100% 50%, rgba(0, 53, 174, 0.55), transparent 60%),
    #0B1B45;
  box-shadow: 0 40px 100px -24px rgba(0, 0, 0, 0.6), inset 0 0 0 1px rgba(255, 255, 255, 0.08);
}

.acs__close {
  position: absolute;
  top: 16px;
  right: 16px;
  width: 44px;
  height: 44px;
  display: grid;
  place-items: center;
  border: 0;
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.08);
  color: #FFFFFF;
  cursor: pointer;
  transition: background-color 160ms ease;
}
.acs__close:hover { background: rgba(255, 255, 255, 0.16); }

.acs__copy { display: grid; gap: 20px; align-content: center; }

.acs__eyebrow {
  display: inline-flex;
  align-items: center;
  gap: 10px;
  margin: 0;
  font-size: 0.8125rem;
  font-weight: 600;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: rgba(255, 255, 255, 0.74);
}
.acs__eyebrow::before {
  content: '';
  width: 20px;
  height: 2px;
  border-radius: 2px;
  background: #CF0118;
}

.acs__title {
  margin: 0;
  font-family: var(--pub-serif, Georgia, serif);
  font-weight: 500;
  font-size: clamp(2.5rem, 1.6rem + 3.6vw, 4.25rem);
  line-height: 1.02;
  letter-spacing: -0.025em;
  text-wrap: balance;
}

.acs__lead {
  margin: 0;
  max-width: 40ch;
  font-size: 1.0625rem;
  line-height: 1.6;
  color: rgba(255, 255, 255, 0.78);
  text-wrap: pretty;
}

.acs__count {
  display: inline-flex;
  align-items: center;
  gap: 10px;
  justify-self: start;
  margin: 0;
  padding: 8px 16px 8px 14px;
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.08);
  box-shadow: inset 0 0 0 1px rgba(255, 255, 255, 0.12);
  font-size: 0.9375rem;
  font-weight: 500;
  font-variant-numeric: tabular-nums;
}

.acs__dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: #FFFFFF;
  animation: acs-breathe 2.4s ease-in-out infinite;
}

@keyframes acs-breathe {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.35; }
}

.acs__actions { display: flex; flex-wrap: wrap; gap: 12px; margin-top: 4px; }

.acs__btn {
  min-height: 48px;
  padding: 0 24px;
  border-radius: 999px;
  border: 1px solid transparent;
  font: inherit;
  font-size: 1rem;
  font-weight: 500;
  cursor: pointer;
  transition: background-color 160ms ease, border-color 160ms ease;
}
.acs__btn--primary { background: #FFFFFF; color: #0B1B45; }
.acs__btn--primary:hover { background: #E7ECF6; }
.acs__btn--quiet { background: transparent; color: #FFFFFF; border-color: rgba(255, 255, 255, 0.34); }
.acs__btn--quiet:hover { background: rgba(255, 255, 255, 0.08); border-color: rgba(255, 255, 255, 0.6); }

.acs__panel :focus-visible { outline: 2px solid #FFFFFF; outline-offset: 3px; }

.acs__visual { margin: 0; display: flex; justify-content: center; }
.acs__visual img {
  width: 100%;
  max-width: 420px;
  height: auto;
  border-radius: 20px;
  box-shadow: 0 0 0 1px rgba(255, 255, 255, 0.1), 0 32px 64px -20px rgba(0, 0, 0, 0.6);
}

/* Enter: the scrim fades, the panel rises a little. */
.acs-enter-active,
.acs-leave-active { transition: opacity 220ms cubic-bezier(0.2, 0, 0, 1); }
.acs-enter-active .acs__panel,
.acs-leave-active .acs__panel { transition: transform 320ms cubic-bezier(0.2, 0, 0, 1); }
.acs-enter,
.acs-leave-to { opacity: 0; }
.acs-enter .acs__panel,
.acs-leave-to .acs__panel { transform: translateY(16px) scale(0.98); }

/* A phone gets the whole screen: picture first, then the date. */
@media (max-width: 760px) {
  .acs { padding: 0; place-items: stretch; }
  .acs__panel {
    width: 100%;
    max-height: 100%;
    min-height: 100%;
    border-radius: 0;
    grid-template-columns: 1fr;
    align-content: center;
    padding: 72px 24px 40px;
    background:
      radial-gradient(120% 60% at 50% 0%, rgba(0, 53, 174, 0.6), transparent 70%),
      #0B1B45;
  }
  .acs__visual { order: -1; }
  .acs__visual img { max-width: 300px; }
  .acs__actions .acs__btn { flex: 1 1 100%; }
}

@media (prefers-reduced-motion: reduce) {
  .acs__dot { animation: none; }
  .acs-enter-active,
  .acs-leave-active,
  .acs-enter-active .acs__panel,
  .acs-leave-active .acs__panel { transition: none; }
}
</style>
