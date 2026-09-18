/**
 * Cover images for uploaded media.
 *
 * Cloudflare Stream makes a thumbnail for every video it transcodes, and a
 * YouTube link has one derivable from its id. Everything else -- which since
 * video moved to R2 means every uploaded sermon and video -- had none, so the
 * app showed those entries with no cover at all.
 *
 * R2 stores bytes and nothing else, so nothing on the server can produce a
 * frame. The browser can: it already has the file, and it has a decoder. We
 * take one frame during upload and store it as an ordinary image.
 *
 * Audio is deliberately not handled here. There is no frame in an MP3, so a
 * cover for a recording has to be supplied by the office.
 */

/**
 * One frame from a video file, as a JPEG blob.
 *
 * Seeks a little way in rather than taking frame zero, which is very often
 * black, a title card, or the camera still settling.
 *
 * Rejects when the browser cannot decode the file -- some MOV and HEVC
 * recordings are readable by the app but not by canvas -- so callers must
 * treat a cover as a nice-to-have and fall back to asking for one.
 */
export function grabPoster (file, options) {
  const settings = Object.assign({ seekRatio: 0.1, maxWidth: 1280, quality: 0.82 }, options || {})

  return new Promise((resolve, reject) => {
    if (!file || !/^video\//.test(file.type || '')) {
      reject(new Error('Not a video file'))
      return
    }

    const objectUrl = URL.createObjectURL(file)
    const video = document.createElement('video')
    let settled = false

    const finish = (fn, value) => {
      if (settled) { return }
      settled = true
      URL.revokeObjectURL(objectUrl)
      fn(value)
    }

    // A file the browser cannot decode never fires loadedmetadata or error on
    // some versions, and a silent hang would stall the upload UI behind it.
    const timer = setTimeout(() => finish(reject, new Error('Timed out reading the video')), 15000)

    video.preload = 'metadata'
    video.muted = true
    video.playsInline = true

    video.onloadedmetadata = () => {
      const duration = video.duration
      if (!duration || !isFinite(duration)) {
        video.currentTime = 0.1
        return
      }
      video.currentTime = Math.min(Math.max(duration * settings.seekRatio, 0.1), Math.max(duration - 0.05, 0.1))
    }

    video.onseeked = () => {
      clearTimeout(timer)
      try {
        const width = video.videoWidth
        const height = video.videoHeight

        if (!width || !height) {
          finish(reject, new Error('The video has no picture to take'))
          return
        }

        const scale = Math.min(1, settings.maxWidth / width)
        const canvas = document.createElement('canvas')
        canvas.width = Math.round(width * scale)
        canvas.height = Math.round(height * scale)
        canvas.getContext('2d').drawImage(video, 0, 0, canvas.width, canvas.height)

        canvas.toBlob(blob => {
          if (blob) {
            finish(resolve, blob)
          } else {
            finish(reject, new Error('Could not turn the frame into an image'))
          }
        }, 'image/jpeg', settings.quality)
      } catch (error) {
        // A cross-origin or DRM-protected source taints the canvas.
        finish(reject, error)
      }
    }

    video.onerror = () => {
      clearTimeout(timer)
      finish(reject, new Error('The browser could not read that video'))
    }

    video.src = objectUrl
  })
}

/**
 * Puts an image into R2 the same way the uploader does, and hands back the
 * public address. Sermons and videos store a cover as a URL rather than a
 * media id, so the caller needs the address rather than the asset.
 */
export async function uploadImage (axios, blob, title) {
  const fileName = (title ? title.replace(/[^\w.-]+/g, '-').slice(0, 60) : 'cover') + '.jpg'

  const ticketResponse = await axios.post('media/r2/upload-url', {
    type: 'image',
    fileName,
    contentType: blob.type || 'image/jpeg',
    sizeInBytes: blob.size,
    title: title || 'Cover image'
  })

  const ticket = (ticketResponse.data && ticketResponse.data.data) || null

  if (!ticket || !ticket.uploadUrl || !ticket.mediaId) {
    throw new Error('No upload ticket came back')
  }

  await fetch(ticket.uploadUrl, {
    method: (ticket.uploadMethod || 'put').toUpperCase(),
    body: blob,
    headers: { 'Content-Type': blob.type || 'image/jpeg' }
  }).then(response => {
    if (!response.ok) { throw new Error(`Cloudflare rejected the cover (${response.status})`) }
  })

  const marked = await axios.post(`media/${ticket.mediaId}/uploaded`)
  const asset = (marked.data && marked.data.data) || null

  if (!asset || !asset.sourceUrl) {
    throw new Error('The cover uploaded but has no address')
  }

  return asset.sourceUrl
}
