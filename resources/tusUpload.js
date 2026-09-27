/**
 * Sends a file to a tus 1.0.0 endpoint in chunks — how Cloudflare Stream
 * takes anything over 200MB, which a Sunday service recording always is.
 *
 * On a failed chunk it waits, asks the server how much actually arrived, and
 * carries on from there, so a dropped connection costs one chunk rather than
 * the whole recording. Gives up after `retries` failures in a row.
 *
 * `patch` and `head` are injectable so the retry logic can be tested without
 * a network; in the browser they are XHR, for upload progress.
 */
export async function tusUpload ({
  url,
  file,
  chunkSize,
  onProgress = () => {},
  retries = 5,
  patch = xhrPatch,
  head = xhrHead,
  wait = ms => new Promise(resolve => setTimeout(resolve, ms))
}) {
  let offset = 0
  let failures = 0

  while (offset < file.size) {
    const chunk = file.slice(offset, Math.min(offset + chunkSize, file.size))
    const start = offset

    try {
      offset = await patch(url, chunk, start, loaded => onProgress((start + loaded) / file.size))
      failures = 0
      onProgress(offset / file.size)
    } catch (error) {
      failures += 1
      if (failures > retries) { throw error }

      await wait(Math.min(30000, 1000 * 2 ** failures))

      try {
        offset = await head(url)
      } catch (e) {
        // Still offline; the next PATCH will say so, and count as a failure.
        offset = start
      }
    }
  }
}

function xhrPatch (url, chunk, offset, onLoaded) {
  return new Promise((resolve, reject) => {
    const request = new XMLHttpRequest()
    request.open('PATCH', url, true)
    request.setRequestHeader('Tus-Resumable', '1.0.0')
    request.setRequestHeader('Upload-Offset', String(offset))
    request.setRequestHeader('Content-Type', 'application/offset+octet-stream')

    request.upload.onprogress = event => {
      if (event.lengthComputable) { onLoaded(event.loaded) }
    }

    request.onload = () => {
      const next = Number(request.getResponseHeader('Upload-Offset'))
      if (request.status >= 200 && request.status < 300 && Number.isFinite(next)) {
        resolve(next)
      } else {
        reject(new Error(`Cloudflare rejected part of the upload (${request.status})`))
      }
    }
    request.onerror = () => reject(new Error('The upload connection dropped'))
    request.onabort = () => reject(new Error('The upload was cancelled'))
    request.send(chunk)
  })
}

function xhrHead (url) {
  return new Promise((resolve, reject) => {
    const request = new XMLHttpRequest()
    request.open('HEAD', url, true)
    request.setRequestHeader('Tus-Resumable', '1.0.0')
    request.onload = () => {
      const offset = Number(request.getResponseHeader('Upload-Offset'))
      if (request.status >= 200 && request.status < 300 && Number.isFinite(offset)) {
        resolve(offset)
      } else {
        reject(new Error(`Could not check the upload (${request.status})`))
      }
    }
    request.onerror = () => reject(new Error('The upload connection dropped'))
    request.send()
  })
}
