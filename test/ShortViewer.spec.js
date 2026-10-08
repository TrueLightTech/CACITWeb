import { shallowMount } from '@vue/test-utils'
import ShortViewer from '../components/ShortViewer'

const clip = {
  id: 'clip', kind: 'video', title: 'Sunday worship', caption: 'A moment from Sunday.',
  author: { name: 'Media team' }, likes: 2, isLiked: false,
  content: { sourceUrl: 'https://media.example/clip.mp4', thumbnailUrl: 'https://media.example/cover.jpg' }
}
const picture = { id: 'picture', kind: 'image', title: 'Church life', content: { imageUrl: 'https://media.example/picture.jpg', altText: 'Church family' } }
const flush = () => new Promise(resolve => setTimeout(resolve))

function mount (record = clip, feed = { items: [clip, picture], nextCursor: null }, options = {}) {
  const get = jest.fn((path) => {
    if (path === 'shorts') {
      return options.feedFails ? Promise.reject(new Error('Offline')) : Promise.resolve({ data: { data: feed } })
    }
    return options.recordFails ? Promise.reject({ response: { status: options.recordFails } }) : Promise.resolve({ data: { data: record } })
  })
  const post = options.likeFails ? jest.fn().mockRejectedValue(new Error('Offline')) : jest.fn().mockResolvedValue({})
  const replace = jest.fn().mockResolvedValue({})
  const wrapper = shallowMount(ShortViewer, {
    mocks: {
      $axios: { get, post }, $auth: { loggedIn: !!options.signedIn },
      $route: { params: { id: record.id }, path: `/shorts/${record.id}` }, $router: { replace }
    },
    stubs: { NuxtLink: true, NavIcon: true, ShortMedia: true }
  })
  return { wrapper, get, post, replace }
}

describe('the public Shorts viewer', () => {
  it('opens the shared clip first and deduplicates it from the feed', async () => {
    const { wrapper, get } = mount()
    await flush()
    expect(get).toHaveBeenCalledWith('shorts/clip')
    expect(get).toHaveBeenCalledWith('shorts', { params: { Limit: 5 } })
    expect(wrapper.vm.records.map(item => item.id)).toEqual(['clip', 'picture'])
    expect(wrapper.vm.current.id).toBe('clip')
    expect(wrapper.vm.hasMore).toBe(false)
    expect(wrapper.find('shortmedia-stub').exists()).toBe(true)
    expect(wrapper.text()).toContain('Media team')
    wrapper.destroy()
  })

  it('keeps the shared post usable when the feed request fails', async () => {
    const { wrapper } = mount(clip, {}, { feedFails: true })
    await flush()
    expect(wrapper.vm.current.id).toBe('clip')
    expect(wrapper.vm.error).toBe('')
    expect(wrapper.vm.feedError).toBe(true)
    expect(wrapper.text()).toContain('Retry')
    wrapper.destroy()
  })

  it('paginates with the cursor and never adds the same post twice', async () => {
    const { wrapper, get } = mount(clip, { items: [clip, picture], nextCursor: 'page-2' })
    await flush()
    get.mockResolvedValueOnce({ data: { data: { items: [picture, { ...picture, id: 'third' }], nextCursor: null } } })
    await wrapper.vm.loadFeed()
    expect(get).toHaveBeenLastCalledWith('shorts', { params: { Limit: 5, Cursor: 'page-2' } })
    expect(wrapper.vm.records.map(item => item.id)).toEqual(['clip', 'picture', 'third'])
    expect(wrapper.vm.hasMore).toBe(false)
    wrapper.destroy()
  })

  it('changes the URL and stops rendering the old player when the feed scrolls', async () => {
    const { wrapper, replace } = mount()
    await flush()
    Object.defineProperty(wrapper.vm.$refs.feed, 'clientHeight', { value: 800 })
    wrapper.vm.$refs.feed.scrollTop = 800
    wrapper.vm.onScroll()
    await new Promise(resolve => setTimeout(resolve, 40))
    expect(wrapper.vm.current.id).toBe('picture')
    expect(replace).toHaveBeenCalledWith('/shorts/picture')
    expect(wrapper.find('shortmedia-stub').exists()).toBe(false)
    expect(wrapper.vm.$options.head.call(wrapper.vm).title).toContain('Church life')
    wrapper.destroy()
  })

  it('moves through every picture, without vertical swipes changing the slide', async () => {
    const slides = { id: 'slides', kind: 'slides', title: 'Sunday pictures', content: { slides: [{ imageUrl: '/one.jpg', altText: 'First picture' }, { imageUrl: '/two.jpg', altText: 'Second picture' }] } }
    const { wrapper } = mount(slides, { items: [], nextCursor: null })
    await flush()
    wrapper.vm.touchStart({ changedTouches: [{ clientX: 200, clientY: 400 }] })
    wrapper.vm.touchEnd(slides, { changedTouches: [{ clientX: 100, clientY: 390 }] })
    await wrapper.vm.$nextTick()
    expect(wrapper.vm.currentSlide(slides).imageUrl).toBe('/two.jpg')
    wrapper.vm.moveSlide(slides, 1)
    expect(wrapper.vm.slideIndex(slides)).toBe(1)
    wrapper.vm.touchStart({ changedTouches: [{ clientX: 100, clientY: 400 }] })
    wrapper.vm.touchEnd(slides, { changedTouches: [{ clientX: 200, clientY: 100 }] })
    expect(wrapper.vm.slideIndex(slides)).toBe(1)
    expect(wrapper.find('.sv__picture').attributes('alt')).toBe('Second picture')
    wrapper.destroy()
  })

  it('renders scripture and text content with a safe fallback palette', async () => {
    const { wrapper } = mount({ id: 'verse', kind: 'scripture', title: 'A word for today', content: { text: 'The Lord is my shepherd.', reference: 'Psalm 23:1', background: 'unknown' } }, { items: [], nextCursor: null })
    await flush()
    expect(wrapper.text()).toContain('Psalm 23:1')
    expect(wrapper.text()).toContain('The Lord is my shepherd.')
    expect(wrapper.find('.sv__words').attributes('style')).toContain('background-color: rgb(18, 48, 110)')
    expect(wrapper.find('shortmedia-stub').exists()).toBe(false)
    wrapper.destroy()
  })

  it('asks a guest to sign in without creating a pretend like', async () => {
    const { wrapper, post } = mount()
    await flush()
    await wrapper.vm.like(wrapper.vm.current)
    expect(post).not.toHaveBeenCalled()
    expect(wrapper.vm.current.likes).toBe(2)
    expect(wrapper.vm.needsSignIn).toBe(true)
    wrapper.destroy()
  })

  it('saves a signed-in like using the existing API contract', async () => {
    const { wrapper, post } = mount({ ...clip }, undefined, { signedIn: true })
    await flush()
    await wrapper.vm.like(wrapper.vm.current)
    expect(post).toHaveBeenCalledWith('shorts/clip/like', { liked: true })
    expect(wrapper.vm.current.likes).toBe(3)
    expect(wrapper.vm.current.isLiked).toBe(true)
    await wrapper.vm.like(wrapper.vm.current)
    expect(wrapper.vm.current.likes).toBe(2)
    expect(wrapper.vm.current.isLiked).toBe(false)
    wrapper.destroy()
  })

  it('preserves the count when a like fails', async () => {
    const { wrapper } = mount({ ...clip }, undefined, { signedIn: true, likeFails: true })
    await flush()
    await wrapper.vm.like(wrapper.vm.current)
    expect(wrapper.vm.current.likes).toBe(2)
    expect(wrapper.vm.current.isLiked).toBe(false)
    expect(wrapper.vm.likingId).toBe('')
    wrapper.destroy()
  })

  it('shares the current public record link', async () => {
    const writeText = jest.fn().mockResolvedValue({})
    Object.defineProperty(navigator, 'clipboard', { configurable: true, value: { writeText } })
    Object.defineProperty(window, 'isSecureContext', { configurable: true, value: true })
    const { wrapper } = mount()
    await flush()
    await wrapper.vm.share(picture)
    expect(writeText).toHaveBeenCalledWith('https://cacitaifa.com/shorts/picture')
    expect(wrapper.vm.notice).toBe('Link copied.')
    wrapper.destroy()
  })

  it('renders a clear missing-post state', async () => {
    const { wrapper } = mount(clip, undefined, { recordFails: 404 })
    await flush()
    expect(wrapper.text()).toContain('This short is no longer available.')
    expect(wrapper.find('shortmedia-stub').exists()).toBe(false)
    expect(wrapper.vm.retryable).toBe(false)
    wrapper.destroy()
  })

  it('maps app actions to working public event and sermon pages', async () => {
    const { wrapper } = mount()
    await flush()
    expect(wrapper.vm.actionFor({ action: { route: '/sermon/abc' } })).toBe('/sermons/abc')
    expect(wrapper.vm.actionFor({ kind: 'event', content: { eventId: 'def' } })).toBe('/events/def')
    expect(wrapper.vm.actionFor({ action: { route: 'https://example.com' } })).toBe('')
    wrapper.destroy()
  })
})
