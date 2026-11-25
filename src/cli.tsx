#!/usr/bin/env bun

import { createCliRenderer } from "@opentui/core"
import { createDefaultOpenTuiKeymap } from "@opentui/keymap/opentui"
import { KeymapProvider } from "@opentui/keymap/react"
import { createRoot } from "@opentui/react"
import { Effect, pipe } from "effect"
import { dirname } from "node:path"
import { DeckApp } from "./app"
import { loadDeckConfig } from "./config"
import { FileReadError, MissingFileArgument, MissingThemeArgument, RendererStartError, type CliError } from "./errors"
import { parseSlides } from "./parser"

interface CliArgs {
  readonly file: string
  readonly themeOverride?: string
}

function parseArgs(argv: ReadonlyArray<string>): Effect.Effect<CliArgs, CliError> {
  let file: string | undefined
  let themeOverride: string | undefined

  for (let index = 0; index < argv.length; index++) {
    const arg = argv[index]
    if (!arg) continue

    if (arg === "--theme") {
      const value = argv[index + 1]
      if (!value || value.startsWith("-")) {
        return Effect.fail(new MissingThemeArgument({ message: "usage: deck <slides.md> --theme <name>" }))
      }
      themeOverride = value
      index++
      continue
    }

    if (arg.startsWith("--theme=")) {
      const value = arg.slice("--theme=".length)
      if (!value) {
        return Effect.fail(new MissingThemeArgument({ message: "usage: deck <slides.md> --theme <name>" }))
      }
      themeOverride = value
      continue
    }

    if (!arg.startsWith("-") && !file) {
      file = arg
    }
  }

  return file
    ? Effect.succeed({ file, themeOverride })
    : Effect.fail(new MissingFileArgument({ message: "usage: deck <slides.md>" }))
}

function readFile(path: string): Effect.Effect<string, CliError> {
  return Effect.tryPromise({
    try: () => Bun.file(path).text(),
    catch: (cause) =>
      new FileReadError({
        path,
        cause,
        message: `Could not read ${path}`,
      }),
  })
}

function startRenderer() {
  return Effect.tryPromise({
    try: () => createCliRenderer({ exitOnCtrlC: false }),
    catch: (cause) =>
      new RendererStartError({
        cause,
        message: "Could not start OpenTUI renderer",
      }),
  })
}

function fileName(path: string): string {
  return path.split(/[\\/]/).at(-1) || path
}

function formatError(error: unknown): string {
  if (error && typeof error === "object" && "message" in error && typeof error.message === "string") {
    return error.message
  }

  return String(error)
}

const program = Effect.gen(function*() {
  const args = yield* parseArgs(Bun.argv.slice(2))
  const config = yield* loadDeckConfig({ themeOverride: args.themeOverride })
  const source = yield* readFile(args.file)
  const deck = yield* parseSlides(source)
  const renderer = yield* startRenderer()
  const keymap = createDefaultOpenTuiKeymap(renderer)
  const root = createRoot(renderer)

  root.render(
    <KeymapProvider keymap={keymap}>
      <DeckApp deck={deck} fileName={fileName(args.file)} baseDir={dirname(args.file)} config={config} />
    </KeymapProvider>,
  )
})

pipe(
  program,
  Effect.runPromise,
).catch((error) => {
  console.error(formatError(error))
  process.exitCode = 1
})
