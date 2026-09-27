import { tusUpload } from '../resources/tusUpload'
import { storedImageUrl } from '../resources/constants'

/**
 * A sermon upload that restarts from zero on every dropped connection never
 * finishes on a Ghanaian mobile network; one that skips bytes is a corrupt
 * video. Both are pinned here.
 */
const fileOf = size => ({ size, slice: (start, end) => ({ start, end }) })

describe('resumable upload', () => {
  it('sends the file in chunks, each from where the last one ended', async () => {
    const sent = []
    const patch = jest.fn(async (url, chunk, offset) => { sent.push([offset, chunk.start, chunk.end]); return chunk.end })

    await tusUpload({ url: 'u', file: fileOf(50), chunkSize: 20, patch, head: jest.fn(), wait: async () => {} })

    expect(sent).toEqual([[0, 0, 20], [20, 20, 40], [40, 40, 50]])
  })

  it('resumes from what the server actually received after a failure', async () => {
    const offsets = []
    let calls = 0
    const patch = jest.fn(async (url, chunk, offset) => {
      offsets.push(offset)
      calls += 1
      if (calls === 2) { throw new Error('dropped') }
      return chunk.end
    })
    // The failed second chunk had half-landed before the connection dropped.
    const head = jest.fn(async () => 30)

    await tusUpload({ url: 'u', file: fileOf(50), chunkSize: 20, patch, head, wait: async () => {} })

    expect(offsets).toEqual([0, 20, 30])
    expect(head).toHaveBeenCalledTimes(1)
  })

  it('gives up after too many failures in a row, and says why', async () => {
    const patch = jest.fn(async () => { throw new Error('offline') })

    await expect(tusUpload({
      url: 'u', file: fileOf(50), chunkSize: 20, retries: 2, patch, head: async () => 0, wait: async () => {}
    })).rejects.toThrow('offline')
    expect(patch).toHaveBeenCalledTimes(3)
  })

  it('reports progress up to the whole file', async () => {
    const seen = []
    await tusUpload({
      url: 'u', file: fileOf(40), chunkSize: 20,
      patch: async (u, chunk) => chunk.end, head: jest.fn(), wait: async () => {},
      onProgress: f => seen.push(f)
    })
    expect(seen[seen.length - 1]).toBe(1)
  })
})

describe('stored picture addresses', () => {
  it('adds the bucket to a picture stored before Cloudflare Images', () => {
    expect(storedImageUrl('images/abc.jpeg')).toMatch(/^https:\/\/.+\/images\/abc\.jpeg$/)
    expect(storedImageUrl('/images/abc.jpeg')).not.toContain('//images')
  })

  it('uses a Cloudflare Images address as it is', () => {
    const url = 'https://imagedelivery.net/hash/img-1/public'
    expect(storedImageUrl(url)).toBe(url)
  })

  it('leaves no picture as no picture, so the placeholder shows', () => {
    expect(storedImageUrl('')).toBe('')
    expect(storedImageUrl(null)).toBeNull()
  })
})
