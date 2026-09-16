import { shallowMount } from '@vue/test-utils'
import MediaUpload from '../components/MediaUpload'

/**
 * The uploader's states are the part people notice when they are wrong:
 * a sermon saved while its video is still transcoding, a link that silently
 * does nothing, a failure with no way back.
 */
const asset = (over = {}) => Object.assign({
  id: 'media-1', type: 'video', status: 'ready', provider: 'r2',
  title: 'sermon.mp4', sourceUrl: 'https://cdn/x.mp4',
  thumbnailUrl: null, durationSeconds: 2840, sizeInBytes: 1024
}, over)

function mount (props = {}, axios = {}) {
  return shallowMount(MediaUpload, {
    propsData: Object.assign({ kind: 'video' }, props),
    mocks: {
      $axios: Object.assign({
        post: jest.fn().mockResolvedValue({ data: { data: {} } }),
        get: jest.fn().mockResolvedValue({ data: { data: asset() } })
      }, axios)
    }
  })
}

describe('what the uploader offers', () => {
  it('offers a link for video and audio', () => {
    expect(mount({ kind: 'video' }).vm.allowsLink).toBe(true)
    expect(mount({ kind: 'audio' }).vm.allowsLink).toBe(true)
  })

  it('does not offer a link for images or documents', () => {
    // Nothing is gained by linking a flyer, and the app cannot resize one it
    // does not hold.
    expect(mount({ kind: 'image' }).vm.allowsLink).toBe(false)
    expect(mount({ kind: 'document' }).vm.allowsLink).toBe(false)
  })

  it('can be told not to offer a link at all', () => {
    expect(mount({ kind: 'video', allowLink: false }).vm.allowsLink).toBe(false)
  })
})

describe('when the server cannot take uploads', () => {
  /**
   * The capability answer is cached for the whole page, so each case gets a
   * fresh copy of the module rather than the previous case's answer.
   */
  function mountWith (capabilities, props = {}) {
    let wrapper
    jest.isolateModules(() => {
      // eslint-disable-next-line global-require
      const Fresh = require('../components/MediaUpload').default
      wrapper = shallowMount(Fresh, {
        propsData: Object.assign({ kind: 'video' }, props),
        mocks: {
          $axios: {
            post: jest.fn().mockResolvedValue({ data: { data: {} } }),
            get: jest.fn().mockResolvedValue({ data: { data: capabilities } })
          }
        }
      })
    })
    return wrapper
  }

  const noVideo = {
    canUploadVideo: false,
    canUploadFiles: true,
    videoUploadNote: 'Video upload is off. Paste a link instead.'
  }

  it('opens on the link, not on a file picker that would fail', async () => {
    const wrapper = mountWith(noVideo)
    await wrapper.vm.$nextTick()
    await wrapper.vm.$nextTick()

    expect(wrapper.vm.mode).toBe('link')
    expect(wrapper.vm.canUploadThisKind).toBe(false)
  })

  it('says why, in words the office can act on', async () => {
    const wrapper = mountWith(noVideo)
    await wrapper.vm.$nextTick()
    await wrapper.vm.$nextTick()

    expect(wrapper.text()).toContain('Paste a link instead')
  })

  it('leaves audio alone when only video is off', async () => {
    const wrapper = mountWith(noVideo, { kind: 'audio' })
    await wrapper.vm.$nextTick()
    await wrapper.vm.$nextTick()

    expect(wrapper.vm.canUploadThisKind).toBe(true)
    expect(wrapper.vm.mode).toBe('upload')
  })

  it('an image has no link to fall back to, so it stays on upload', async () => {
    const wrapper = mountWith({ canUploadVideo: false, canUploadFiles: false }, { kind: 'image' })
    await wrapper.vm.$nextTick()
    await wrapper.vm.$nextTick()

    // Switching to a mode the component does not offer would leave an empty box.
    expect(wrapper.vm.mode).toBe('upload')
  })

  it('an older server with no such endpoint behaves as before', async () => {
    let wrapper
    jest.isolateModules(() => {
      // eslint-disable-next-line global-require
      const Fresh = require('../components/MediaUpload').default
      wrapper = shallowMount(Fresh, {
        propsData: { kind: 'video' },
        mocks: {
          $axios: {
            post: jest.fn().mockResolvedValue({ data: { data: {} } }),
            get: jest.fn().mockRejectedValue(new Error('404'))
          }
        }
      })
    })
    await wrapper.vm.$nextTick()
    await wrapper.vm.$nextTick()

    expect(wrapper.vm.canUploadThisKind).toBe(true)
    expect(wrapper.vm.mode).toBe('upload')
  })
})

describe('applying an asset', () => {
  it('goes to ready and emits the media id', () => {
    const wrapper = mount()
    wrapper.vm.applyAsset(asset())

    expect(wrapper.vm.state).toBe('ready')
    expect(wrapper.emitted().input.pop()).toEqual(['media-1'])
    expect(wrapper.vm.durationLabel).toBe('47:20')
  })

  it('stays in processing while Cloudflare transcodes', () => {
    // Stream finishes the upload long before the video is playable. The id is
    // already emitted, so the form can be saved and the app shows a disabled
    // control until the API reports a source URL.
    const wrapper = mount()
    wrapper.vm.applyAsset(asset({ status: 'processing' }))

    expect(wrapper.vm.state).toBe('processing')
    expect(wrapper.emitted().state.pop()).toEqual(['processing'])
  })

  it('surfaces the reason a file failed', () => {
    const wrapper = mount()
    wrapper.vm.applyAsset(asset({ status: 'failed', failureReason: 'Codec not supported' }))

    expect(wrapper.vm.state).toBe('failed')
    expect(wrapper.vm.failureReason).toBe('Codec not supported')
  })

  it('treats a missing asset as a failure rather than pretending it worked', () => {
    const wrapper = mount()
    wrapper.vm.applyAsset(null)
    expect(wrapper.vm.state).toBe('failed')
  })
})

describe('linked media', () => {
  it('names the platform so the office knows it plays in the app', () => {
    const wrapper = mount()
    wrapper.vm.applyAsset(asset({ provider: 'youtube' }))

    expect(wrapper.vm.isLinked).toBe(true)
    expect(wrapper.vm.providerLabel).toBe('YouTube')
  })

  it('does not call an uploaded file "linked"', () => {
    const wrapper = mount()
    wrapper.vm.applyAsset(asset({ provider: 'r2' }))
    expect(wrapper.vm.isLinked).toBe(false)
  })

  it('posts the link and adopts the asset that comes back', async () => {
    const post = jest.fn().mockResolvedValue({ data: { data: asset({ provider: 'youtube', title: 'YouTube' }) } })
    const wrapper = mount({ kind: 'video' }, { post })

    wrapper.setData({ linkUrl: 'https://youtu.be/abc123' })
    await wrapper.vm.attachLink()

    expect(post).toHaveBeenCalledWith('media/external', expect.objectContaining({
      url: 'https://youtu.be/abc123', type: 'video'
    }))
    expect(wrapper.vm.state).toBe('ready')
    expect(wrapper.vm.providerLabel).toBe('YouTube')
  })

  it('shows why a link was refused instead of failing silently', async () => {
    const post = jest.fn().mockRejectedValue({
      response: { data: { message: 'That does not look like a web link.' } }
    })
    const wrapper = mount({ kind: 'video' }, { post })

    wrapper.setData({ linkUrl: 'nonsense' })
    await wrapper.vm.attachLink()

    expect(wrapper.vm.linkError).toBe('That does not look like a web link.')
    expect(wrapper.vm.state).toBe('idle')
  })
})

describe('clearing', () => {
  it('resets everything and tells the form the media is gone', () => {
    const wrapper = mount()
    wrapper.vm.applyAsset(asset({ provider: 'youtube' }))
    wrapper.vm.clear()

    expect(wrapper.vm.state).toBe('idle')
    expect(wrapper.vm.mediaId).toBe('')
    expect(wrapper.vm.provider).toBe('')
    expect(wrapper.vm.linkError).toBe('')
    expect(wrapper.emitted().input.pop()).toEqual([''])
  })
})
