import { describe, expect, test } from "bun:test"
import { Effect } from "effect"
import { buildKittyDeleteSequence, buildKittyImageSequence, writeKittyImage } from "../src/image"

describe("native image rendering", () => {
  test("builds kitty image protocol sequences", () => {
    const sequence = buildKittyImageSequence({
      id: 42,
      data: new Uint8Array([1, 2, 3]),
      x: 4,
      y: 8,
      width: 20,
      height: 10,
    })

    expect(sequence.startsWith("\x1b[9;5H")).toBe(true)
    expect(sequence).toContain("\x1b_Ga=T,f=100,t=d,i=42,q=2,c=20,r=10,m=0;")
    expect(sequence.endsWith("\x1b\\")).toBe(true)
  })

  test("builds kitty image delete sequences", () => {
    expect(buildKittyDeleteSequence(42)).toBe("\x1b_Ga=d,d=I,i=42,q=2;\x1b\\")
  })

  test("writes local images with kitty protocol", async () => {
    let output = ""

    await Effect.runPromise(
      writeKittyImage({
        id: 7,
        src: "assets/pipeline.png",
        baseDir: "examples",
        x: 1,
        y: 2,
        width: 32,
        height: 12,
        write: (chunk) => {
          output += chunk
          return true
        },
      }),
    )

    expect(output.startsWith("\x1b[3;2H")).toBe(true)
    expect(output).toContain("\x1b_Ga=T,f=100,t=d,i=7,q=2,c=32,r=12")
  })

  test("does not try to load remote images yet", async () => {
    try {
      await Effect.runPromise(
        writeKittyImage({
          id: 1,
          src: "https://example.com/image.png",
          baseDir: ".",
          x: 0,
          y: 0,
          width: 10,
          height: 5,
          write: () => true,
        }),
      )
      throw new Error("Expected writeKittyImage to fail")
    } catch (error) {
      expect(error).toMatchObject({
        _tag: "UnsupportedImageSource",
        src: "https://example.com/image.png",
      })
    }
  })
})
