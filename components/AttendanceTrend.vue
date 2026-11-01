<template>
  <div class="trend">
    <div class="trend__plot" role="list" :aria-label="label">
      <button
        v-for="day in days"
        :key="day.date"
        class="trend__col"
        :class="{ 'is-selected': day.key === selected, 'is-clickable': clickable }"
        type="button"
        role="listitem"
        :disabled="!clickable"
        :aria-label="`${dayLabel(day.date)}: ${day.count} present`"
        @mouseenter="hovered = day.key"
        @mouseleave="hovered = ''"
        @focus="hovered = day.key"
        @blur="hovered = ''"
        @click="$emit('select', day.key)"
      >
        <span v-if="hovered === day.key" class="trend__tip">
          <b>{{ day.count }}</b> present
          <span>{{ dayLabel(day.date) }}</span>
        </span>
        <span class="trend__bar" :style="{ height: barHeight(day.count) }"></span>
        <span class="trend__tick">{{ tickLabel(day.date) }}</span>
      </button>
    </div>
  </div>
</template>

<script>
/**
 * Head count per day as a single-series bar strip.
 *
 * One series, so no legend — the card title names it. Each column is a
 * button: hovering shows the exact count, and on the attendance page clicking
 * opens that day's register.
 */
export default {
  name: 'AttendanceTrend',
  props: {
    /** [{ date, count }], oldest first, as the API returns them. */
    series: { type: Array, default: () => [] },
    /** yyyy-MM-dd of the highlighted day. */
    selected: { type: String, default: '' },
    clickable: { type: Boolean, default: false },
    label: { type: String, default: 'Attendance by day' }
  },
  data () {
    return { hovered: '' }
  },
  computed: {
    days () {
      return this.series.map(day => ({
        date: day.date,
        key: this.$moment.utc(day.date).format('YYYY-MM-DD'),
        count: day.count || 0
      }))
    },
    max () {
      return Math.max(1, ...this.days.map(day => day.count))
    }
  },
  methods: {
    barHeight (count) {
      // A zero still draws a sliver on the baseline, so an empty day reads as
      // "nobody" rather than as missing data.
      return count ? `${Math.max(4, (count / this.max) * 100)}%` : '2px'
    },
    dayLabel (date) {
      return this.$moment.utc(date).format('ddd D MMM')
    },
    tickLabel (date) {
      return this.$moment.utc(date).format(this.days.length > 10 ? 'D' : 'ddd')
    }
  }
}
</script>

<style scoped>
.trend__plot {
  display: flex;
  align-items: stretch;
  gap: 2px;
  height: 120px;
  padding-top: 8px;
  border-bottom: 1px solid var(--ds-border);
}

.trend__col {
  position: relative;
  flex: 1 1 0;
  min-width: 0;
  display: flex;
  flex-direction: column;
  justify-content: flex-end;
  align-items: center;
  border: 0;
  padding: 0 2px;
  background: transparent;
  font: inherit;
  color: inherit;
  cursor: default;
}

.trend__col.is-clickable { cursor: pointer; }
.trend__col:disabled { opacity: 1; }

.trend__bar {
  width: 100%;
  max-width: 28px;
  background: var(--ds-navy);
  opacity: 0.55;
  border-radius: 4px 4px 0 0;
  transition: opacity var(--ds-duration) var(--ds-ease);
}

.trend__col:hover .trend__bar,
.trend__col:focus-visible .trend__bar,
.trend__col.is-selected .trend__bar { opacity: 1; }

.trend__tick {
  position: absolute;
  bottom: -20px;
  font-size: var(--ds-text-xs);
  color: var(--ds-text-3);
  white-space: nowrap;
}

.trend__col.is-selected .trend__tick { color: var(--ds-text); font-weight: var(--ds-weight-semibold); }

.trend__tip {
  position: absolute;
  bottom: calc(100% - 4px);
  z-index: 2;
  display: grid;
  gap: 2px;
  padding: 6px 10px;
  background: var(--ds-surface);
  border: 1px solid var(--ds-border);
  border-radius: var(--ds-radius-sm);
  box-shadow: var(--ds-shadow-md);
  font-size: var(--ds-text-xs);
  color: var(--ds-text-2);
  white-space: nowrap;
  pointer-events: none;
}

.trend__tip b { color: var(--ds-text); font-size: var(--ds-text-sm); }

.trend { padding-bottom: 22px; }
</style>
