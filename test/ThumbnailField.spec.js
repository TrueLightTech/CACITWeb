import { shallowMount } from '@vue/test-utils'

/**
 * Covers for sermons and videos.
 *
 * Stream and YouTube hand one over for free; an R2 upload does not, so a frame
 * is taken in the browser. The rules worth pinning are about whose choice wins:
 * an automatic frame must never overwrite a cover the office picked, and a
 * failure to take one must never read as an error, because a sermon with no
 * frame is a prompt to upload one rather than something broken.
 */
jest.mock('../network/Poster', () => ({
  grabPoster: jest.fn(),
  uploadImage: jest.fn()
}))

// eslint-disable-next-line import/first
import { grabPoster, uploadImage } from '../network/Poster'
// eslint-disable-next-line import/first
import ThumbnailField from '../components/ThumbnailField'

function mount (props = {}) {
  return shallowMount(ThumbnailField, {
    propsData: Object.assign({ value: '' }, props),
    mocks: { $axios: { post: jest.fn(), get: jest.fn() } }
  })
}

const videoFile = () => new File([new Uint8Array([1, 2, 3])], 'sermon.mp4', { type: 'video/mp4' })
const imageFile = () => new File([new Uint8Array([1, 2, 3])], 'cover.jpg', { type: 'image/jpeg' })

beforeEach(() => {
  grabPoster.mockReset()
  uploadImage.mockReset()
})

describe('taking a cover from the video', () => {
  it('uses a frame when the sermon has no cover yet', async () => {
    grabPoster.mockResolvedValue(new Blob())
    uploadImage.mockResolvedValue('https://cdn/frame.jpg')

    const wrapper = mount()
    wrapper.setProps({ suggestFrom: videoFile() })
    await wrapper.vm.$nextTick()
    await new Promise(resolve => setTimeout(resolve, 0))

    expect(wrapper.emitted().input[0]).toEqual(['https://cdn/frame.jpg'])
  })

  it('leaves a cover the office already chose alone', async () => {
    const wrapper = mount()
    wrapper.vm.chosenByHand = true
    wrapper.setProps({ suggestFrom: videoFile() })
    await wrapper.vm.$nextTick()
    await new Promise(resolve => setTimeout(resolve, 0))

    expect(grabPoster).not.toHaveBeenCalled()
    expect(wrapper.emitted().input).toBeUndefined()
  })

  it('does not replace a cover that is already set', async () => {
    const wrapper = mount({ value: 'https://cdn/existing.jpg' })
    wrapper.setProps({ suggestFrom: videoFile() })
    await wrapper.vm.$nextTick()
    await new Promise(resolve => setTimeout(resolve, 0))

    expect(grabPoster).not.toHaveBeenCalled()
  })

  /**
   * Some recordings the app plays cannot be decoded to a canvas. That is a
   * reason to ask for a cover, not to show a failure on the sermon.
   */
  it('stays quiet when the browser cannot read the video', async () => {
    grabPoster.mockRejectedValue(new Error('cannot decode'))

    const wrapper = mount()
    wrapper.setProps({ suggestFrom: videoFile() })
    await wrapper.vm.$nextTick()
    await new Promise(resolve => setTimeout(resolve, 0))

    expect(wrapper.vm.error).toBe('')
    expect(wrapper.vm.state).toBe('idle')
    expect(wrapper.emitted().input).toBeUndefined()
  })
})

describe('choosing a cover by hand', () => {
  it('uploads the picked image and keeps it as the choice', async () => {
    uploadImage.mockResolvedValue('https://cdn/chosen.jpg')

    const wrapper = mount()
    await wrapper.vm.onPick({ target: { files: [imageFile()] } })

    expect(wrapper.emitted().input[0]).toEqual(['https://cdn/chosen.jpg'])
    expect(wrapper.vm.chosenByHand).toBe(true)
  })

  it('says so when the image will not upload', async () => {
    uploadImage.mockRejectedValue(new Error('too big'))

    const wrapper = mount()
    await wrapper.vm.onPick({ target: { files: [imageFile()] } })

    expect(wrapper.vm.error).toContain('did not upload')
    expect(wrapper.emitted().input).toBeUndefined()
  })

  /** Removing is a decision too, so the next video must not undo it. */
  it('treats removing as a choice', async () => {
    const wrapper = mount({ value: 'https://cdn/x.jpg' })
    wrapper.vm.clear()
    await wrapper.vm.$nextTick()

    expect(wrapper.emitted().input[0]).toEqual([''])
    expect(wrapper.vm.chosenByHand).toBe(true)

    wrapper.setProps({ suggestFrom: videoFile() })
    await wrapper.vm.$nextTick()
    await new Promise(resolve => setTimeout(resolve, 0))
    expect(grabPoster).not.toHaveBeenCalled()
  })
})

describe('audio', () => {
  /**
   * There is no frame in a recording, so nothing is ever suggested and the
   * field is only ever filled by the office.
   */
  it('never tries to take a frame when no video is offered', async () => {
    const wrapper = mount()
    await wrapper.vm.$nextTick()

    expect(grabPoster).not.toHaveBeenCalled()
    expect(wrapper.vm.hint).toContain('Shown beside the title')
  })
})
