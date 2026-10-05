import { mount } from '@vue/test-utils'
import RowMenu from '../components/RowMenu'

/**
 * A row's actions menu. Tables clip whatever overflows them, so a menu hung
 * off a row in a one-row table showed only its top edge. It is placed against
 * the window instead, which nothing on the page can clip.
 */
function open (triggerBox, windowHeight = 800) {
  window.innerHeight = windowHeight
  window.innerWidth = 1280
  const wrapper = mount(RowMenu, {
    slots: { default: '<button class="ds-menu__item">Approve</button>' },
    mocks: { $route: {} }
  })
  wrapper.vm.$refs.trigger.getBoundingClientRect = () => triggerBox
  return wrapper.find('button').trigger('click').then(() => wrapper)
}

describe('row actions menu', () => {
  it('opens below its button, fixed to the window so the table cannot cut it off', async () => {
    const wrapper = await open({ top: 340, bottom: 372, right: 1240 })
    const panel = wrapper.find('.ds-menu__panel')

    expect(panel.exists()).toBe(true)
    expect(panel.element.style.position).toBe('fixed')
    expect(panel.element.style.top).toBe('376px')
    expect(panel.element.style.right).toBe('40px')
    expect(panel.text()).toContain('Approve')
  })

  it('opens upward near the bottom of the window', async () => {
    const wrapper = await open({ top: 700, bottom: 732, right: 1240 })
    const panel = wrapper.find('.ds-menu__panel')

    // Hung from its bottom edge, just above the button. (The test DOM
    // drops `top: auto`, which browsers keep; what matters is no px top.)
    expect(panel.element.style.bottom).toBe('104px')
    expect(panel.element.style.top).not.toMatch(/px$/)
  })

  it('closes when the page scrolls, rather than floating away from its row', async () => {
    const wrapper = await open({ top: 340, bottom: 372, right: 1240 })

    window.dispatchEvent(new Event('scroll'))
    await wrapper.vm.$nextTick()

    expect(wrapper.find('.ds-menu__panel').exists()).toBe(false)
  })
})
