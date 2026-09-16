import { shallowMount } from '@vue/test-utils'

/**
 * The drafting panel fills a form someone then publishes, so the risks are
 * quiet ones: silently overwriting what the office typed, showing the button
 * on a server that cannot draft, or offering a video that was never confirmed.
 */
function mount (options = {}) {
  const {
    status = { isAvailable: true },
    draft = { fields: { title: 'Drafted' } },
    props = {},
    statusFails = false,
    draftFails = false
  } = options

  const post = draftFails
    ? jest.fn().mockRejectedValue({ response: { data: { message: 'DeepSeek is down' } } })
    : jest.fn().mockResolvedValue({ data: { data: draft } })

  const get = statusFails
    ? jest.fn().mockRejectedValue(new Error('404'))
    : jest.fn().mockResolvedValue({ data: { data: status } })

  let wrapper
  // The status answer is cached for the page, so each case needs its own module.
  jest.isolateModules(() => {
    // eslint-disable-next-line global-require
    const AiAssist = require('../components/AiAssist').default
    wrapper = shallowMount(AiAssist, {
      propsData: Object.assign({ resource: 'sermon', noun: 'sermon' }, props),
      mocks: {
        $axios: { get, post },
        $toast: { success: jest.fn(), error: jest.fn() }
      }
    })
  })

  return { wrapper, post, get }
}

const settle = async wrapper => {
  await wrapper.vm.$nextTick()
  await wrapper.vm.$nextTick()
}

describe('whether the panel appears at all', () => {
  it('shows when the server can draft', async () => {
    const { wrapper } = mount()
    await settle(wrapper)
    expect(wrapper.vm.isAvailable).toBe(true)
    expect(wrapper.find('.ai').exists()).toBe(true)
  })

  it('stays hidden when drafting is switched off', async () => {
    const { wrapper } = mount({ status: { isAvailable: false } })
    await settle(wrapper)
    expect(wrapper.find('.ai').exists()).toBe(false)
  })

  it('stays hidden on a server that has no such endpoint', async () => {
    // An older API, or a role not allowed to draft. Either way, no button.
    const { wrapper } = mount({ statusFails: true })
    await settle(wrapper)
    expect(wrapper.find('.ai').exists()).toBe(false)
  })
})

describe('drafting', () => {
  it('sends the resource, the prompt and what the form already holds', async () => {
    const { wrapper, post } = mount({ props: { current: { title: 'Old title', speaker: '' } } })
    await settle(wrapper)

    wrapper.setData({ prompt: '  a sermon on grace  ' })
    await wrapper.vm.draft()

    expect(post).toHaveBeenCalledWith('admin/ai/draft', {
      resource: 'sermon',
      prompt: 'a sermon on grace',
      // The empty field is left out rather than described as a blank.
      current: { title: 'Old title' }
    })
  })

  it('emits the fields for the form to apply', async () => {
    const { wrapper } = mount({ draft: { fields: { title: 'Grace Abounding', speaker: 'Pastor Mensah' } } })
    await settle(wrapper)

    wrapper.setData({ prompt: 'grace' })
    await wrapper.vm.draft()

    expect(wrapper.emitted().apply.pop()).toEqual([{ title: 'Grace Abounding', speaker: 'Pastor Mensah' }])
  })

  it('does nothing on an empty prompt', async () => {
    const { wrapper, post } = mount()
    await settle(wrapper)

    wrapper.setData({ prompt: '   ' })
    await wrapper.vm.draft()

    expect(post).not.toHaveBeenCalled()
  })

  it('says so rather than emitting an empty draft', async () => {
    const { wrapper } = mount({ draft: { fields: {} } })
    await settle(wrapper)

    wrapper.setData({ prompt: 'something vague' })
    await wrapper.vm.draft()

    expect(wrapper.emitted().apply).toBeUndefined()
    expect(wrapper.vm.error).toContain('Nothing usable')
  })

  it('surfaces why a draft failed', async () => {
    const { wrapper } = mount({ draftFails: true })
    await settle(wrapper)

    wrapper.setData({ prompt: 'anything' })
    await wrapper.vm.draft()

    expect(wrapper.vm.error).toBe('DeepSeek is down')
    expect(wrapper.vm.isDrafting).toBe(false)
  })

  it('clears the previous answer before drafting again', async () => {
    const { wrapper } = mount()
    await settle(wrapper)

    wrapper.setData({ prompt: 'again', note: 'old note', videos: [{ videoId: 'x' }], searchQuery: 'old' })
    await wrapper.vm.draft()

    expect(wrapper.vm.note).toBe('')
    expect(wrapper.vm.videos).toEqual([])
  })
})

describe('video suggestions', () => {
  const video = {
    videoId: 'dQw4w9WgXcQ',
    url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
    title: 'Sunday Service',
    channel: 'CACI Taifa',
    thumbnailUrl: 'https://i.ytimg.com/vi/dQw4w9WgXcQ/hqdefault.jpg'
  }

  it('lists what the server confirmed', async () => {
    const { wrapper } = mount({ draft: { fields: { title: 'x' }, videos: [video] } })
    await settle(wrapper)

    wrapper.setData({ prompt: 'our easter service' })
    await wrapper.vm.draft()
    await wrapper.vm.$nextTick()

    expect(wrapper.vm.videos).toHaveLength(1)
    expect(wrapper.text()).toContain('CACI Taifa')
  })

  it('offers a search when nothing could be confirmed', async () => {
    const { wrapper } = mount({
      draft: { fields: { title: 'x' }, videos: [], searchQuery: 'CACI Taifa easter 2025' }
    })
    await settle(wrapper)

    wrapper.setData({ prompt: 'our easter service' })
    await wrapper.vm.draft()
    await wrapper.vm.$nextTick()

    expect(wrapper.vm.youtubeSearchUrl).toContain('CACI%20Taifa%20easter%202025')
    expect(wrapper.text()).toContain('Nothing could be confirmed')
  })
})
