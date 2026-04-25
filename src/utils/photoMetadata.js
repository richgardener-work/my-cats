export async function readFileMetadata(file) {
  const [hash, dims, takenAt] = await Promise.all([
    sha256Hex(file).catch(() => null),
    readDimensions(file).catch(() => ({ width: 0, height: 0 })),
    readExifTakenAt(file).catch(() => null),
  ])
  return {
    contentHash: hash ? `sha256:${hash}` : '',
    width: dims.width,
    height: dims.height,
    aspectRatio: dims.width && dims.height ? dims.width / dims.height : 1,
    takenAt,
    originalFilename: file.name,
    fileSize: file.size,
    mimeType: file.type || 'application/octet-stream',
  }
}

async function sha256Hex(file) {
  if (!globalThis.crypto?.subtle?.digest) return null
  const buf = await file.arrayBuffer()
  const digest = await crypto.subtle.digest('SHA-256', buf)
  return Array.from(new Uint8Array(digest)).map(b => b.toString(16).padStart(2, '0')).join('')
}

function readDimensions(file) {
  return new Promise((resolve) => {
    const url = URL.createObjectURL(file)
    const img = new Image()
    const done = (result) => { URL.revokeObjectURL(url); resolve(result) }
    img.onload = () => done({ width: img.naturalWidth, height: img.naturalHeight })
    img.onerror = () => done({ width: 0, height: 0 })
    img.src = url
  })
}

async function readExifTakenAt(file) {
  if (!file.type.includes('jpeg') && !file.name.toLowerCase().endsWith('.jpg')) return null
  try {
    const buf = await file.slice(0, 128 * 1024).arrayBuffer()
    const view = new DataView(buf)
    if (view.getUint16(0) !== 0xFFD8) return null
    let offset = 2
    while (offset < view.byteLength) {
      const marker = view.getUint16(offset); offset += 2
      if (marker === 0xFFE1) {
        const size = view.getUint16(offset); offset += 2
        if (view.getUint32(offset) !== 0x45786966) return null
        const tiffStart = offset + 6
        const little = view.getUint16(tiffStart) === 0x4949
        const get16 = (p) => little ? view.getUint16(p, true) : view.getUint16(p)
        const get32 = (p) => little ? view.getUint32(p, true) : view.getUint32(p)
        const ifd0 = tiffStart + get32(tiffStart + 4)
        const entries = get16(ifd0)
        for (let i = 0; i < entries; i++) {
          const entry = ifd0 + 2 + i * 12
          if (get16(entry) === 0x8769) {
            const subIfd = tiffStart + get32(entry + 8)
            const subEntries = get16(subIfd)
            for (let j = 0; j < subEntries; j++) {
              const e = subIfd + 2 + j * 12
              if (get16(e) === 0x9003) {
                const valLen = get32(e + 4)
                const valOffset = tiffStart + get32(e + 8)
                const chars = []
                for (let k = 0; k < valLen - 1; k++) chars.push(String.fromCharCode(view.getUint8(valOffset + k)))
                const str = chars.join('')
                const m = str.match(/^(\d{4}):(\d{2}):(\d{2}) (\d{2}):(\d{2}):(\d{2})$/)
                if (m) return new Date(`${m[1]}-${m[2]}-${m[3]}T${m[4]}:${m[5]}:${m[6]}`)
                return null
              }
            }
          }
        }
        return null
      } else {
        offset += view.getUint16(offset)
      }
    }
    return null
  } catch {
    return null
  }
}
