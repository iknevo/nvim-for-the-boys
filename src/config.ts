import type { StyleDefinitionInput } from "@opentui/core"
import { Effect } from "effect"
import { pathToFileURL } from "node:url"
import { ConfigLoadError, InvalidConfigError, UnknownTheme, type ConfigError } from "./errors"
import { createOpenCodeThemes, openCodeThemeNames } from "./opencode-themes"

export type DeckCommand = "next" | "previous" | "first" | "last" | "help" | "quit"

export type DeckKeybindings = Record<DeckCommand, ReadonlyArray<string>>

export interface DeckThemeColors {
  readonly appBackground: string
  readonly chrome: string
  readonly chromeMuted: string
  readonly text: string
  readonly title: string
  readonly titleAccent: string
  readonly codeBackground: string
  readonly codeBorder: string
  readonly codeHighlight: string
  readonly calloutNote: string
  readonly calloutTip: string
  readonly calloutWarning: string
  readonly calloutDanger: string
  readonly tableBorder: string
  readonly tableHeader: string
  readonly muted: string
  readonly footer: string
  readonly progress: string
  readonly helpBorder: string
  readonly helpText: string
}

export interface DeckThemeLayout {
  readonly stageWidth: `${number}%`
  readonly stageMaxWidth: number
  readonly stagePaddingX: number
  readonly stagePaddingY: number
  readonly titleGap: number
  readonly longContentLineThreshold: number
}

export interface DeckTheme {
  readonly colors: DeckThemeColors
  readonly layout: DeckThemeLayout
  readonly syntax: Readonly<Record<string, StyleDefinitionInput>>
}

type PartialRecord<K extends string, V> = Partial<Record<K, V>>

export interface DeckThemeInput {
  readonly extends?: string
  readonly colors?: Partial<DeckThemeColors>
  readonly layout?: Partial<DeckThemeLayout>
  readonly syntax?: Readonly<Record<string, StyleDefinitionInput>>
}

export interface DeckUserConfig {
  readonly theme?: string
  readonly themes?: Readonly<Record<string, DeckThemeInput>>
  readonly keybindings?: PartialRecord<DeckCommand, ReadonlyArray<string>>
}

export interface ResolvedDeckConfig {
  readonly themeName: string
  readonly theme: DeckTheme
  readonly keybindings: DeckKeybindings
}

const defaultKeybindings: DeckKeybindings = {
  next: ["n", "space", "return", "right"],
  previous: ["p", "backspace", "left"],
  first: ["f"],
  last: ["l"],
  help: ["?"],
  quit: ["q", "escape"],
}

const midnightTheme: DeckTheme = {
  colors: {
    appBackground: "#070A12",
    chrome: "#38BDF8",
    chromeMuted: "#475569",
    text: "#E6EDF3",
    title: "#7DD3FC",
    titleAccent: "#A78BFA",
    codeBackground: "#0B1220",
    codeBorder: "#1E3A5F",
    codeHighlight: "#172033",
    calloutNote: "#38BDF8",
    calloutTip: "#34D399",
    calloutWarning: "#FBBF24",
    calloutDanger: "#FB7185",
    tableBorder: "#334155",
    tableHeader: "#7DD3FC",
    muted: "#64748B",
    footer: "#94A3B8",
    progress: "#38BDF8",
    helpBorder: "#475569",
    helpText: "#CBD5E1",
  },
  layout: {
    stageWidth: "82%",
    stageMaxWidth: 136,
    stagePaddingX: 8,
    stagePaddingY: 4,
    titleGap: 4,
    longContentLineThreshold: 18,
  },
  syntax: {
    default: { fg: "#E6EDF3" },
    keyword: { fg: "#FF7B72", bold: true },
    string: { fg: "#A5D6FF" },
    comment: { fg: "#8B949E", italic: true },
    number: { fg: "#79C0FF" },
    function: { fg: "#D2A8FF" },
    type: { fg: "#FFA657" },
    "markup.heading": { fg: "#7DD3FC", bold: true },
    "markup.heading.1": { fg: "#A78BFA", bold: true },
    "markup.heading.2": { fg: "#60A5FA", bold: true },
    "markup.bold": { fg: "#F8FAFC", bold: true },
    "markup.italic": { fg: "#CBD5E1", italic: true },
    "markup.raw": { fg: "#A5D6FF", bg: "#161B22" },
    "markup.raw.block": { fg: "#A5D6FF", bg: "#161B22" },
    "markup.raw.inline": { fg: "#FDE68A", bg: "#1F2937" },
    "markup.link": { fg: "#38BDF8", underline: true },
    "markup.quote": { fg: "#94A3B8", italic: true },
    "markup.list": { fg: "#F472B6" },
    conceal: { fg: "#64748B" },
  },
}

const emberTheme: DeckTheme = mergeTheme(midnightTheme, {
  colors: {
    appBackground: "#100B08",
    chrome: "#FDBA74",
    chromeMuted: "#78716C",
    title: "#FED7AA",
    titleAccent: "#F97316",
    codeBackground: "#1A100B",
    codeBorder: "#7C2D12",
    codeHighlight: "#2A1A12",
    calloutNote: "#FDBA74",
    calloutTip: "#A3E635",
    calloutWarning: "#FACC15",
    calloutDanger: "#FB7185",
    tableBorder: "#7C2D12",
    tableHeader: "#FED7AA",
    progress: "#FB923C",
  },
  syntax: {
    default: { fg: "#F5E9DC" },
    keyword: { fg: "#FB7185", bold: true },
    string: { fg: "#FDBA74" },
    comment: { fg: "#A8A29E", italic: true },
    function: { fg: "#FACC15" },
    type: { fg: "#FCA5A5" },
    "markup.heading": { fg: "#FED7AA", bold: true },
    "markup.raw": { fg: "#FDBA74", bg: "#2A1A12" },
    "markup.raw.block": { fg: "#FDBA74", bg: "#2A1A12" },
    "markup.link": { fg: "#FB923C", underline: true },
    conceal: { fg: "#78716C" },
  },
})

const builtInThemes: Readonly<Record<string, DeckTheme>> = {
  ...createOpenCodeThemes(midnightTheme),
  midnight: midnightTheme,
  ember: emberTheme,
}

export const builtInThemeNames = [...new Set([...openCodeThemeNames, "midnight", "ember"])]

export const defaultConfig: ResolvedDeckConfig = {
  themeName: "midnight",
  theme: midnightTheme,
  keybindings: defaultKeybindings,
}

function mergeTheme(base: DeckTheme, input: DeckThemeInput = {}): DeckTheme {
  return {
    colors: { ...base.colors, ...input.colors },
    layout: { ...base.layout, ...input.layout },
    syntax: { ...base.syntax, ...input.syntax },
  }
}

function mergeKeybindings(input?: PartialRecord<DeckCommand, ReadonlyArray<string>>): DeckKeybindings {
  return {
    ...defaultKeybindings,
    ...input,
  }
}

function isObject(value: unknown): value is Record<string, unknown> {
  return value !== null && typeof value === "object" && !Array.isArray(value)
}

function normalizeUserConfig(value: unknown, path: string): Effect.Effect<DeckUserConfig | undefined, ConfigError> {
  if (value === undefined) return Effect.succeed(undefined)
  return isObject(value)
    ? Effect.succeed(value as DeckUserConfig)
    : Effect.fail(new InvalidConfigError({ path, message: `${path} must default export an object` }))
}

export function resolveDeckConfig(
  userConfig: DeckUserConfig | undefined,
  options: { readonly themeOverride?: string } = {},
): Effect.Effect<ResolvedDeckConfig, ConfigError> {
  const userThemes = userConfig?.themes ?? {}
  const themeNames = [...new Set([...Object.keys(builtInThemes), ...Object.keys(userThemes)])]
  const themeName = options.themeOverride ?? userConfig?.theme ?? defaultConfig.themeName
  const theme = resolveTheme(themeName, userThemes)

  return theme
    ? Effect.succeed({
        themeName,
        theme,
        keybindings: mergeKeybindings(userConfig?.keybindings),
      })
    : Effect.fail(
        new UnknownTheme({
          theme: themeName,
          availableThemes: themeNames,
          message: `Unknown theme '${themeName}'. Available themes: ${themeNames.join(", ")}`,
        }),
      )
}

function resolveTheme(
  name: string,
  userThemes: Readonly<Record<string, DeckThemeInput>>,
  seen: ReadonlySet<string> = new Set(),
): DeckTheme | undefined {
  const userTheme = userThemes[name]
  if (!userTheme) return builtInThemes[name]

  if (seen.has(name)) return undefined
  const nextSeen = new Set(seen).add(name)
  const baseName = userTheme.extends ?? (builtInThemes[name] ? name : defaultConfig.themeName)
  const base = resolveTheme(baseName, userThemes, nextSeen)
  if (!base) return undefined

  return mergeTheme(base, userTheme)
}

export function loadDeckUserConfig(path = "deck.config.ts"): Effect.Effect<DeckUserConfig | undefined, ConfigError> {
  return Effect.gen(function*() {
    const exists = yield* Effect.tryPromise({
      try: () => Bun.file(path).exists(),
      catch: (cause) => new ConfigLoadError({ path, cause, message: `Could not check ${path}` }),
    })
    if (!exists) return undefined

    const module = yield* Effect.tryPromise({
      try: () => import(pathToFileURL(path).href),
      catch: (cause) => new ConfigLoadError({ path, cause, message: `Could not load ${path}` }),
    })

    return yield* normalizeUserConfig((module as { default?: unknown }).default, path)
  })
}

export function loadDeckConfig(options: { readonly themeOverride?: string } = {}): Effect.Effect<ResolvedDeckConfig, ConfigError> {
  return Effect.gen(function*() {
    const userConfig = yield* loadDeckUserConfig()
    return yield* resolveDeckConfig(userConfig, options)
  })
}
