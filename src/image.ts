import { Data, Effect } from "effect"
import { isAbsolute, resolve } from "node:path"

export interface KittyImageOptions {
  readonly id: number
  readonly data: Uint8Array
  readonly x: number
  readonly y: number
  readonly width: number
  readonly height: number
}

export interface WriteKittyImageOptions extends Omit<KittyImageOptions, "data"> {
  readonly src: string
  readonly baseDir: string
  readonly write?: (chunk: string) => boolean
}

export class UnsupportedImageSource extends Data.TaggedError("UnsupportedImageSource")<{
  readonly src: string
  readonly message: string
}> {}

export class ImageLoadError extends Data.TaggedError("ImageLoadError")<{
  readonly src: string
  readonly cause: unknown
  readonly message: string
}> {}

export type ImageRenderError = UnsupportedImageSource | ImageLoadError

const kittyChunkSize = 4096

export function isRemoteImageSource(src: string): boolean {
  return /^https?:\/\//.test(src)
}

export function imagePath(src: string, baseDir: string): string {
  return isAbsolute(src) ? src : resolve(baseDir, src)
}

function cursorPosition(x: number, y: number): string {
  return `\x1b[${Math.max(1, y + 1)};${Math.max(1, x + 1)}H`
}

function kittyChunks(data: Uint8Array): ReadonlyArray<string> {
  const base64 = Buffer.from(data).toString("base64")
  const chunks: string[] = []

  for (let index = 0; index < base64.length; index += kittyChunkSize) {
    chunks.push(base64.slice(index, index + kittyChunkSize))
  }

  return chunks.length > 0 ? chunks : [""]
}

export function buildKittyImageSequence(options: KittyImageOptions): string {
  const chunks = kittyChunks(options.data)
  const control = [
    "a=T",
    "f=100",
    "t=d",
    `i=${options.id}`,
    "q=2",
    `c=${Math.max(1, Math.floor(options.width))}`,
    `r=${Math.max(1, Math.floor(options.height))}`,
  ]

  return cursorPosition(options.x, options.y) + chunks.map((chunk, index) => {
    const more = index < chunks.length - 1 ? 1 : 0
    const prefix = index === 0 ? `${control.join(",")},m=${more}` : `m=${more}`
    return `\x1b_G${prefix};${chunk}\x1b\\`
  }).join("")
}

export function buildKittyDeleteSequence(id: number): string {
  return `\x1b_Ga=d,d=I,i=${id},q=2;\x1b\\`
}

export function writeKittyImage(options: WriteKittyImageOptions): Effect.Effect<void, ImageRenderError> {
  if (isRemoteImageSource(options.src)) {
    return Effect.fail(new UnsupportedImageSource({
      src: options.src,
      message: "Remote images are not supported yet",
    }))
  }

  return Effect.tryPromise({
    try: async () => {
      const data = new Uint8Array(await Bun.file(imagePath(options.src, options.baseDir)).arrayBuffer())
      const write = options.write ?? ((chunk: string) => process.stdout.write(chunk))
      write(buildKittyImageSequence({ ...options, data }))
    },
    catch: (cause) => new ImageLoadError({
      src: options.src,
      cause,
      message: `Could not load image ${options.src}`,
    }),
  })
}
