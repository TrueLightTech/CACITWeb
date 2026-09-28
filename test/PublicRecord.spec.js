import { shallowMount } from '@vue/test-utils'
import PublicRecord from '../components/PublicRecord'

/**
 * The page a shared link opens.
 *
 * The API hands out a `shareUrl` for every kind of content and members paste
 * those into WhatsApp, so each one has to resolve to something a person with
 * no account and no app can read. A short was the one kind with no page at
 * all — the link 404'd — and a short is also the awkward one, because its
 * payload is nested under `content` and its shape changes with its kind.
 */
function mount (kind, record, { fail } = {}) {
  const get = fail
    ? jest.fn().mockRejectedValue({ response: { status: 404 } })
    : jest.fn().mockResolvedValue({ data: { data: record } })

  const wrapper = shallowMount(PublicRecord, {
    propsData: { kind },
    mocks: {
      $axios: { get },
      $route: {
        params: { id: record ? record.id : 'missing' },
        path: `/${kind}/${record ? record.id : 'missing'}`
      }
    },
    // Nuxt auto-registers these at runtime; the test runner does not.
    stubs: { NuxtLink: true, PublicHeader: true, PublicFooter: true, AppStoreLinks: true }
  })

  return { wrapper, get }
}

const videoShort = {
  id: 's-1',
  kind: 'video',
  title: 'Sunday in sixty seconds',
  caption: 'The choir and the baptisms.',
  publishedAt: '2026-09-17T10:00:00Z',
  author: { name: 'Media team' },
  content: {
    id: 'm-1',
    type: 'video',
    sourceUrl: 'https://pub.r2.dev/video/clip.mp4',
    thumbnailUrl: 'https://pub.r2.dev/video/clip.jpg'
  }
}

describe('a shared short', () => {
  it('asks the shorts endpoint for it', async () => {
    const { get } = mount('shorts', videoShort)
    await new Promise(resolve => setTimeout(resolve))
    expect(get).toHaveBeenCalledWith('shorts/s-1')
  })

  it('plays the clip and shows what it is', async () => {
    const { wrapper } = mount('shorts', videoShort)
    await new Promise(resolve => setTimeout(resolve))

    expect(wrapper.vm.playableUrl).toBe('https://pub.r2.dev/video/clip.mp4')
    expect(wrapper.vm.posterUrl).toBe('https://pub.r2.dev/video/clip.jpg')
    expect(wrapper.vm.bodyText).toBe('The choir and the baptisms.')
    expect(wrapper.text()).toContain('Sunday in sixty seconds')
    expect(wrapper.text()).toContain('Media team')
  })

  it('shows a picture short as a picture rather than a dead player', async () => {
    const { wrapper } = mount('shorts', {
      id: 's-2',
      kind: 'image',
      title: 'Boon Life Conference',
      content: { imageUrl: 'https://pub.r2.dev/image/flyer.jpg' }
    })
    await new Promise(resolve => setTimeout(resolve))

    expect(wrapper.vm.playableUrl).toBe('')
    expect(wrapper.vm.posterUrl).toBe('https://pub.r2.dev/image/flyer.jpg')
  })

  it('reads a scripture short, whose words are the whole point', async () => {
    const { wrapper } = mount('shorts', {
      id: 's-3',
      kind: 'scripture',
      title: 'A word for the week',
      content: { text: 'The Lord is my shepherd.', reference: 'Psalm 23:1' }
    })
    await new Promise(resolve => setTimeout(resolve))

    expect(wrapper.text()).toContain('The Lord is my shepherd.')
    expect(wrapper.text()).toContain('Psalm 23:1')
  })

  it('says so plainly when the short has gone', async () => {
    const { wrapper } = mount('shorts', null, { fail: true })
    await new Promise(resolve => setTimeout(resolve))

    expect(wrapper.text()).toContain('That post is no longer available.')
  })
})

describe('the kinds that already had a page', () => {
  it('still reads a sermon the way it did', async () => {
    const { wrapper, get } = mount('sermons', {
      id: 'x-1',
      title: 'Sunday 15th September Sermon',
      speaker: 'Rev Samuel Anarfi',
      preachedOn: '2026-09-21T19:04:00Z',
      scripture: 'John 3:16',
      summary: 'Sunday Divine Church Service.',
      video: { sourceUrl: 'https://pub.r2.dev/video/sermon.mp4' },
      audio: { sourceUrl: 'https://pub.r2.dev/audio/sermon.mp3' }
    })
    await new Promise(resolve => setTimeout(resolve))

    expect(get).toHaveBeenCalledWith('sermons/x-1')
    expect(wrapper.vm.playableUrl).toBe('https://pub.r2.dev/video/sermon.mp4')
    expect(wrapper.vm.audioUrl).toBe('https://pub.r2.dev/audio/sermon.mp3')
    expect(wrapper.text()).toContain('Rev Samuel Anarfi')
  })
})

describe('opening the app from a shared page', () => {
  const realAgent = navigator.userAgent
  afterEach(() => {
    Object.defineProperty(navigator, 'userAgent', { value: realAgent, configurable: true })
  })

  function asPhone (agent) {
    Object.defineProperty(navigator, 'userAgent', { value: agent, configurable: true })
  }

  test('an Android phone is offered the app, on this record', async () => {
    asPhone('Mozilla/5.0 (Linux; Android 14; SM-S928B) AppleWebKit/537.36 Chrome/120 Mobile')
    const { wrapper } = mount('sermons', { id: 'abc', title: 'Strengthening the Hands' })
    await wrapper.vm.$nextTick()

    const link = wrapper.find('.pr__open')
    expect(link.exists()).toBe(true)
    // An intent link: the app when it is installed, and a fallback when not.
    expect(link.attributes('href')).toMatch(
      /^intent:\/\/cacitaifa\.com\/sermons\/abc#Intent;scheme=https;package=com\.cacitaifa\.caci_taifa;S\.browser_fallback_url=.+;end$/
    )
  })

  test('anything else is not: an iPhone has Safari\'s own banner', async () => {
    asPhone('Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 Safari/604.1')
    const { wrapper } = mount('sermons', { id: 'abc', title: 'Strengthening the Hands' })
    await wrapper.vm.$nextTick()

    expect(wrapper.find('.pr__open').exists()).toBe(false)
  })
})
