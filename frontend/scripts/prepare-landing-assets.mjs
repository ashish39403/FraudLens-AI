import sharp from 'sharp'
import { mkdir, copyFile, stat } from 'node:fs/promises'
import { fileURLToPath } from 'node:url'
import path from 'node:path'

// Keep the supplied source website intact. Ship only the motion sequence it uses.
const root = fileURLToPath(new URL('../', import.meta.url))
const source = path.resolve(root, '../frotend_aml/frontend/public')
const output = path.join(root, 'public/landing')
const fileName = (index) => `frame-${String(index).padStart(3, '0')}.webp`
let totalBytes = 0
for (const [name, width, quality, count] of [
  ['desktop', 1440, 78, 220],
  ['mobile', 800, 74, 110],
]) {
  const folder = path.join(output, 'sequence', name)
  await mkdir(folder, { recursive: true })
  // Small batches avoid decoding hundreds of full-resolution PNGs at once.
  for (let start = 1; start <= count; start += 4) {
    await Promise.all(
      Array.from({ length: Math.min(4, count - start + 1) }, async (_, offset) => {
        const index = start + offset
        const original = name === 'mobile' ? Math.min(220, index * 2) : index
        const target = path.join(folder, fileName(index))
        await sharp(
          path.join(source, 'frames', `ezgif-frame-${String(original).padStart(3, '0')}.png`),
        )
          .resize({ width, withoutEnlargement: true })
          .webp({ quality })
          .toFile(target)
        totalBytes += (await stat(target)).size
      }),
    )
  }
}
await copyFile(path.join(source, 'media/fraudlens-background.mp4'), path.join(output, 'story.mp4'))
console.log(
  `Prepared 220 desktop + 110 mobile frames: ${(totalBytes / 1024 / 1024).toFixed(2)} MB combined.`,
)
