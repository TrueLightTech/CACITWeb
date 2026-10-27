import { shallowMount } from '@vue/test-utils'

/**
 * Pointing a broadcast at something.
 *
 * A message sent without a destination lands the member on the home screen.
 * The risks worth a test are the quiet ones: sending a half-made choice as
 * no choice at all, sending the wrong path, and letting the office send
 * without seeing where it goes — a push cannot be taken back.
 */
function mount (options = {}) {
  const { rows = [{ id: 's-1', title: 'Gifted to reflect Christ' }] } = options

  const get = jest.fn().mockImplementation((url) => {
    if (url === 'churchfamilies') { return Promise.resolve({ data: { data: [] } }) }
    if (url === 'admin/push/audience') {
      return Promise.resolve({ data: { data: { memberCount: 12, audienceLabel: '' } } })
    }
    if (url === 'admin/push') {
      return Promise.resolve({ data: { data: { results: [], totalCount: 0 } } })
    }
    return Promise.resolve({ data: { data: { results: rows, totalCount: rows.length } } })
  })

  const post = jest.fn().mockResolvedValue({ data: { data: { membersNotified: 12 } } })

  const Push = require('../pages/admin/app/push').default
  const wrapper = shallowMount(Push, {
    mocks: {
      $axios: { get, post },
      $toast: { success: jest.fn(), error: jest.fn() }
    },
    stubs: { ConfirmDialog: true, AiAssist: true, NuxtLink: true }
  })

  return { wrapper, get, post }
}

const flush = () => new Promise(resolve => setTimeout(resolve, 0))

describe('where a broadcast opens', () => {
  test('starts pointing nowhere, and sends no link', async () => {
    const { wrapper, post } = mount()
    await flush()

    wrapper.setData({ form: { ...wrapper.vm.form, title: 'Hi', body: 'There' } })
    wrapper.vm.send()
    await flush()

    expect(post.mock.calls[0][1].deepLink).toBeNull()
  })

  test('choosing a kind loads what there is to choose between', async () => {
    const { wrapper, get } = mount()
    await flush()

    wrapper.vm.form.linkKind = 'sermon'
    wrapper.vm.onDestinationChanged()
    await flush()

    expect(get).toHaveBeenCalledWith('admin/sermons', {
      params: { Page: 1, PageSize: 30 }
    })
    expect(wrapper.vm.destinationItems).toHaveLength(1)
    expect(wrapper.vm.destinationNeedsItem).toBe(true)
  })

  test('a chosen sermon is sent as the path the app routes', async () => {
    const { wrapper, post } = mount()
    await flush()

    wrapper.vm.form.linkKind = 'sermon'
    wrapper.vm.onDestinationChanged()
    await flush()
    wrapper.vm.form.linkId = 's-1'
    wrapper.vm.form.title = 'New sermon'
    wrapper.vm.form.body = 'Listen now'

    wrapper.vm.send()
    await flush()

    expect(post.mock.calls[0][1].deepLink).toBe('/sermon/s-1')
  })

  test('a kind chosen with nothing picked will not send', async () => {
    const { wrapper, post } = mount()
    await flush()

    wrapper.vm.form.title = 'New sermon'
    wrapper.vm.form.body = 'Listen now'
    wrapper.vm.form.linkKind = 'sermon'
    wrapper.vm.onDestinationChanged()
    await flush()

    wrapper.vm.review()

    expect(wrapper.vm.confirmOpen).toBe(false)
    expect(wrapper.vm.showErrors).toBe(true)
    expect(post).not.toHaveBeenCalled()
  })

  test('the sentence before sending says where it goes', async () => {
    const { wrapper } = mount()
    await flush()

    wrapper.vm.form.title = 'New sermon'
    expect(wrapper.vm.confirmMessage).toContain('opens the home screen')

    wrapper.vm.form.linkKind = 'sermon'
    wrapper.vm.onDestinationChanged()
    await flush()
    wrapper.vm.form.linkId = 's-1'

    expect(wrapper.vm.confirmMessage).toContain('Gifted to reflect Christ')
  })

  test('the live service needs nothing chosen and sends /live', async () => {
    const { wrapper, post } = mount()
    await flush()

    wrapper.vm.form.linkKind = 'live'
    wrapper.vm.onDestinationChanged()
    await flush()
    wrapper.vm.form.title = 'We are live'
    wrapper.vm.form.body = 'Join now'

    expect(wrapper.vm.destinationNeedsItem).toBe(false)
    wrapper.vm.send()
    await flush()

    expect(post.mock.calls[0][1].deepLink).toBe('/live')
  })

  test('sending clears the destination with the message', async () => {
    const { wrapper } = mount()
    await flush()

    wrapper.vm.form.linkKind = 'live'
    wrapper.vm.form.title = 'We are live'
    wrapper.vm.form.body = 'Join now'
    wrapper.vm.send()
    await flush()

    expect(wrapper.vm.form.linkKind).toBe('')
    expect(wrapper.vm.form.linkId).toBe('')
  })
})
