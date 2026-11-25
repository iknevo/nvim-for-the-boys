import { Array as Arr, Effect, pipe } from "effect"
import { UnterminatedCodeFence, type ParseError } from "./errors"
import type { CalloutKind, CodeBlock, Deck, ListItem, ParseSlidesOptions, Slide, SlideContentBlock, SlideFrontmatter, SlideLayout, SlideMetadata } from "./types"

const DEFAULT_COMMENT_PREFIX = "%%"
const DEFAULT_STOP_PATTERN = /<!--\s*stop\s*-->/g
const FRAGMENT_PATTERN = /<!--\s*fragment\s*-->/
const FRAGMENT_REPLACE_PATTERN = /<!--\s*fragment\s*-->/g

interface ActiveFence {
  readonly info: string
  readonly language: string
  readonly title?: string
  readonly filename?: string
  readonly highlights: CodeBlock["highlights"]
  readonly showLineNumbers: boolean
  readonly startLine: number
  readonly body: ReadonlyArray<string>
}

interface SourceLine {
  readonly text: string
  readonly number: number
}

interface ParserSyntax {
  readonly commentPrefix: string | false
  readonly stopPattern: RegExp | string | false
}

interface ParserState {
  readonly slides: ReadonlyArray<Slide>
  readonly current: Slide
  readonly fence: ActiveFence | null
  readonly sectionIndex: number
}

function createEmptySlide(section = 0, fragmentIndex = 0): Slide {
  return {
    title: "",
    layout: "default",
    frontmatter: {},
    metadata: createSlideMetadata("", {}),
    fragment: {
      section,
      index: fragmentIndex,
      count: 1,
      isFragment: false,
    },
    body: [],
    blocks: [],
    content: [],
  }
}

function cloneSlide(slide: Slide): Slide {
  return {
    title: slide.title,
    layout: slide.layout,
    frontmatter: { ...slide.frontmatter },
    metadata: { ...slide.metadata },
    fragment: { ...slide.fragment },
    body: [...slide.body],
    blocks: slide.blocks.map((block) => ({ ...block })),
    content: slide.content.map((block) => ({ ...block })),
  }
}

function setFragmentIndex(slide: Slide, index: number): Slide {
  return {
    ...slide,
    fragment: {
      ...slide.fragment,
      index,
    },
  }
}

function finalizeSlide(slide: Slide): Slide {
  const frontmatter = extractFrontmatter(slide.body)

  return {
    ...slide,
    layout: resolveSlideLayout(frontmatter.data.layout),
    frontmatter: frontmatter.data,
    metadata: createSlideMetadata(slide.title, frontmatter.data),
    body: frontmatter.body,
    content: parseSlideContent(frontmatter.body, slide.blocks),
  }
}

function appendBodyLine(slide: Slide, line: string): Slide {
  return {
    ...slide,
    body: [...slide.body, trimTrailingWhitespace(line)],
  }
}

function appendCodeBlock(slide: Slide, block: CodeBlock): Slide {
  return {
    ...slide,
    blocks: [...slide.blocks, block],
  }
}

function pushCurrentSlide(state: ParserState, current: Slide = state.current): ParserState {
  return {
    ...state,
    slides: [...state.slides, finalizeSlide(current)],
    current,
  }
}

function trimTrailingWhitespace(line: string): string {
  return line.replace(/\s+$/, "")
}

function headingText(title: string): string {
  return title.replace(/^#{1,6}\s+/, "") || "Untitled slide"
}

function parseBoolean(value: string | undefined): boolean {
  if (!value) return false
  return ["1", "true", "yes", "on"].includes(value.toLowerCase())
}

function optionalText(value: string | undefined): string | undefined {
  return value && value.length > 0 ? value : undefined
}

function createSlideMetadata(title: string, frontmatter: SlideFrontmatter): SlideMetadata {
  return {
    title: frontmatter.title || headingText(title),
    subtitle: optionalText(frontmatter.subtitle),
    author: optionalText(frontmatter.author),
    date: optionalText(frontmatter.date),
    variant: optionalText(frontmatter.variant),
    hideHeader: parseBoolean(frontmatter.hideHeader),
    hideFooter: parseBoolean(frontmatter.hideFooter),
  }
}

function isHeading(line: string): boolean {
  return /^#{1,6}\s+/.test(line)
}

type CodeFenceStart = Omit<ActiveFence, "startLine" | "body">

function parseFenceStart(line: string): CodeFenceStart | null {
  const match = line.match(/^```\s*([^`]*)\s*$/)
  if (!match) return null

  return parseCodeFenceInfo(match[1]?.trim() ?? "")
}

function parseCodeFenceInfo(info: string): CodeFenceStart {
  const language = info.match(/^\S+/)?.[0] ?? ""
  const filename = info.match(/\[([^\]]+)\]/)?.[1] ?? parseInfoField(info, "filename")
  const title = parseInfoField(info, "title") ?? filename

  return {
    info,
    language,
    title,
    filename,
    highlights: parseHighlightRanges(info),
    showLineNumbers: /(?:^|\s)(lines|lineNumbers|line-numbers)(?:\s|$)/.test(info),
  }
}

function parseInfoField(info: string, key: string): string | undefined {
  const quoted = info.match(new RegExp(`${key}="([^"]+)"`))?.[1]
  if (quoted) return quoted

  return info.match(new RegExp(`${key}=([^\\s]+)`))?.[1]
}

function parseHighlightRanges(info: string): CodeBlock["highlights"] {
  const source = info.match(/\{([^}]+)\}/)?.[1]
  if (!source) return []

  return source
    .split(",")
    .map((part) => part.trim())
    .flatMap((part) => {
      const match = part.match(/^(\d+)(?:-(\d+))?$/)
      if (!match) return []
      const start = Number(match[1])
      const end = Number(match[2] ?? match[1])
      return [{ start, end }]
    })
}

function resolveSlideLayout(layout: string | undefined): SlideLayout {
  switch (layout) {
    case "center":
    case "cover":
    case "section":
    case "statement":
    case "quote":
    case "fact":
    case "two-cols":
    case "code":
      return layout
    case "two-columns":
    case "split":
      return "two-cols"
    default:
      return "default"
  }
}

function parseFrontmatterLine(line: string): readonly [string, string] | null {
  const match = line.match(/^([A-Za-z][\w-]*)\s*:\s*(.*?)\s*$/)
  if (!match) return null

  return [match[1] ?? "", match[2] ?? ""]
}

function extractFrontmatter(body: ReadonlyArray<string>): { readonly data: SlideFrontmatter; readonly body: ReadonlyArray<string> } {
  const firstContentIndex = body.findIndex((line) => line.trim().length > 0)
  if (firstContentIndex === -1 || body[firstContentIndex]?.trim() !== "---") {
    return { data: {}, body }
  }

  const endIndex = body.findIndex((line, index) => index > firstContentIndex && line.trim() === "---")
  if (endIndex === -1) {
    return { data: {}, body }
  }

  const data: Record<string, string> = {}
  for (const line of body.slice(firstContentIndex + 1, endIndex)) {
    const entry = parseFrontmatterLine(line)
    if (entry) {
      data[entry[0]] = entry[1]
    }
  }

  return {
    data,
    body: [...body.slice(0, firstContentIndex), ...body.slice(endIndex + 1)],
  }
}

interface ParsedListItem {
  readonly ordered: boolean
  readonly item: ListItem
}

function parseListItem(line: string): ParsedListItem | null {
  const match = line.match(/^\s*((?:[-*+])|(?:\d+[.)]))\s+(.*)$/)
  if (!match) return null

  const marker = match[1] ?? ""
  const text = match[2] ?? ""

  return {
    ordered: /\d/.test(marker),
    item: {
      text,
      raw: line,
    },
  }
}

function isMarkdownFallbackLine(line: string): boolean {
  const trimmed = line.trim()
  return trimmed.startsWith(">") || trimmed.startsWith("|") || /^-{3,}$/.test(trimmed)
}

function parseSlot(line: string): "default" | "left" | "right" | "header" | "footer" | null {
  const match = line.trim().match(/^::(default|left|right|header|footer)::$/)
  return match ? (match[1] as "default" | "left" | "right" | "header" | "footer") : null
}

function parseSpacer(line: string): number | null {
  const match = line.trim().match(/^::space(?::(\d+))?::$/)
  if (!match) return null

  return Number(match[1] ?? 2)
}

function parseImage(line: string): { readonly alt: string; readonly src: string; readonly options: { readonly width?: number; readonly height?: number; readonly fit: "contain" | "cover" | "fill"; readonly caption?: string } } | null {
  const match = line.trim().match(/^!\[([^\]]*)\]\(([^)]+)\)(?:\{([^}]*)\})?$/)
  if (!match) return null

  return {
    alt: match[1] ?? "",
    src: match[2] ?? "",
    options: parseImageOptions(match[3] ?? ""),
  }
}

function parseImageOptions(source: string): { readonly width?: number; readonly height?: number; readonly fit: "contain" | "cover" | "fill"; readonly caption?: string } {
  const entries = Array.from(source.matchAll(/(\w+)=("[^"]+"|\S+)/g))
  const options = Object.fromEntries(entries.map((entry) => [entry[1], (entry[2] ?? "").replace(/^"|"$/g, "")]))
  const fit = options.fit === "cover" || options.fit === "fill" ? options.fit : "contain"

  return {
    width: options.width ? Number(options.width) : undefined,
    height: options.height ? Number(options.height) : undefined,
    fit,
    caption: options.caption,
  }
}

function parseTableRow(line: string): ReadonlyArray<string> | null {
  const trimmed = line.trim()
  if (!trimmed.startsWith("|") || !trimmed.endsWith("|")) return null

  return trimmed.slice(1, -1).split("|").map((cell) => cell.trim())
}

function isTableSeparator(line: string): boolean {
  const cells = parseTableRow(line)
  return !!cells && cells.length > 0 && cells.every((cell) => /^:?-{3,}:?$/.test(cell))
}

function parseCalloutStart(line: string): { readonly kind: CalloutKind; readonly title?: string } | null {
  const match = line.trim().match(/^:::(note|tip|warning|danger)(?:\s+(.*))?$/)
  if (!match) return null

  return {
    kind: match[1] as CalloutKind,
    title: match[2],
  }
}

function isCalloutEnd(line: string): boolean {
  return line.trim() === ":::"
}

function parseSlideContent(body: ReadonlyArray<string>, codeBlocks: ReadonlyArray<CodeBlock>): ReadonlyArray<SlideContentBlock> {
  const content: SlideContentBlock[] = []
  let codeIndex = 0
  let index = 0

  while (index < body.length) {
    const line = body[index] ?? ""

    if (line.trim().length === 0) {
      index++
      continue
    }

    const slot = parseSlot(line)
    if (slot) {
      content.push({ type: "slot", name: slot })
      index++
      continue
    }

    const spacer = parseSpacer(line)
    if (spacer !== null) {
      content.push({ type: "spacer", size: spacer })
      index++
      continue
    }

    if (/^-{3,}$/.test(line.trim())) {
      content.push({ type: "divider" })
      index++
      continue
    }

    const image = parseImage(line)
    if (image) {
      content.push({ type: "image", ...image })
      index++
      continue
    }

    const tableHeaders = parseTableRow(line)
    if (tableHeaders && isTableSeparator(body[index + 1] ?? "")) {
      const rows: ReadonlyArray<string>[] = []
      index += 2

      while (index < body.length) {
        const row = parseTableRow(body[index] ?? "")
        if (!row) break
        rows.push(row)
        index++
      }

      content.push({ type: "table", headers: tableHeaders, rows })
      continue
    }

    const callout = parseCalloutStart(line)
    if (callout) {
      const lines: string[] = []
      index++

      while (index < body.length && !isCalloutEnd(body[index] ?? "")) {
        lines.push(body[index] ?? "")
        index++
      }
      if (index < body.length) index++

      content.push({
        type: "callout",
        kind: callout.kind,
        title: callout.title,
        lines,
        text: lines.join("\n"),
      })
      continue
    }

    if (parseFenceStart(line) !== null) {
      const codeBlock = codeBlocks[codeIndex]
      if (codeBlock) {
        content.push(codeBlock.language === "mermaid"
          ? { type: "mermaid", body: codeBlock.body, lines: codeBlock.body.split("\n") }
          : { type: "code", ...codeBlock })
        codeIndex++
      }

      index++
      while (index < body.length && !isFenceEnd(body[index] ?? "")) {
        index++
      }
      if (index < body.length) index++
      continue
    }

    const listItem = parseListItem(line)
    if (listItem) {
      const ordered = listItem.ordered
      const items: ListItem[] = []

      while (index < body.length) {
        const nextItem = parseListItem(body[index] ?? "")
        if (!nextItem || nextItem.ordered !== ordered) break
        items.push(nextItem.item)
        index++
      }

      content.push({ type: "list", ordered, items })
      continue
    }

    const lines: string[] = []
    let markdownFallback = false

    while (index < body.length) {
      const nextLine = body[index] ?? ""
      if (nextLine.trim().length === 0 || parseFenceStart(nextLine) !== null || parseListItem(nextLine)) break
      if (parseSlot(nextLine)) break
      if (parseSpacer(nextLine) !== null) break
      if (parseCalloutStart(nextLine)) break
      if (/^-{3,}$/.test(nextLine.trim()) || parseImage(nextLine)) break
      if (parseTableRow(nextLine) && isTableSeparator(body[index + 1] ?? "")) break
      markdownFallback = markdownFallback || isMarkdownFallbackLine(nextLine)
      lines.push(nextLine)
      index++
    }

    content.push({
      type: markdownFallback ? "markdown" : "paragraph",
      lines,
      text: lines.join("\n"),
    })
  }

  return content
}

function isFenceEnd(line: string): boolean {
  return /^```\s*$/.test(line)
}

function normalizeLines(input: string | readonly string[]): string[] {
  if (typeof input !== "string") return [...input]
  if (input.length === 0) return [""]

  const lines = input.split(/\r?\n/)
  if (lines.at(-1) === "") lines.pop()
  return lines.length > 0 ? lines : [""]
}

function toSourceLines(input: string | readonly string[]): ReadonlyArray<SourceLine> {
  return pipe(
    normalizeLines(input),
    Arr.map((text, index) => ({ text, number: index + 1 })),
  )
}

function resolveSyntax(options: ParseSlidesOptions): ParserSyntax {
  return {
    commentPrefix: options.commentPrefix ?? DEFAULT_COMMENT_PREFIX,
    stopPattern: options.stopPattern ?? DEFAULT_STOP_PATTERN,
  }
}

function removeStopMarkers(line: string, pattern: RegExp | string): string {
  if (typeof pattern === "string") return line.split(pattern).join("")

  const flags = pattern.flags.includes("g") ? pattern.flags : `${pattern.flags}g`
  return line.replace(new RegExp(pattern.source, flags), "")
}

function hasStopMarker(line: string, pattern: RegExp | string): boolean {
  if (typeof pattern === "string") return line.includes(pattern)

  const flags = pattern.flags.replace("g", "")
  return new RegExp(pattern.source, flags).test(line)
}

function hasFragmentMarker(line: string): boolean {
  return FRAGMENT_PATTERN.test(line)
}

function removeFragmentMarkers(line: string): string {
  return line.replace(FRAGMENT_REPLACE_PATTERN, "")
}

function initialState(): ParserState {
  return {
    slides: [],
    current: createEmptySlide(),
    fence: null,
    sectionIndex: 0,
  }
}

function finishFence(state: ParserState, endLine: number): ParserState {
  if (!state.fence) return state

  return {
    ...state,
    current: appendCodeBlock(state.current, {
      info: state.fence.info,
      language: state.fence.language,
      title: state.fence.title,
      filename: state.fence.filename,
      highlights: state.fence.highlights,
      showLineNumbers: state.fence.showLineNumbers,
      body: state.fence.body.join("\n"),
      startLine: state.fence.startLine,
      endLine,
    }),
    fence: null,
  }
}

function parseLine(syntax: ParserSyntax) {
  return (state: ParserState, source: SourceLine): Effect.Effect<ParserState, ParseError> => {
    const line = source.text

    if (state.fence) {
      const current = appendBodyLine(state.current, line)
      const nextState = { ...state, current }

      if (isFenceEnd(line)) {
        return Effect.succeed(finishFence(nextState, source.number))
      }

      return Effect.succeed({
        ...nextState,
        fence: {
          ...state.fence,
          body: [...state.fence.body, line],
        },
      })
    }

    if (isHeading(line)) {
      const sectionIndex = state.current.title.length > 0 ? state.sectionIndex + 1 : state.sectionIndex
      const nextSlide = {
        ...createEmptySlide(sectionIndex, 0),
        title: trimTrailingWhitespace(line),
      }

      return Effect.succeed(
        state.current.title.length > 0
          ? { ...pushCurrentSlide(state), sectionIndex, current: nextSlide }
          : { ...state, sectionIndex, current: nextSlide },
      )
    }

    if (syntax.commentPrefix && line.startsWith(syntax.commentPrefix)) {
      return Effect.succeed(state)
    }

    if (hasFragmentMarker(line)) {
      const current = appendBodyLine(setFragmentIndex(cloneSlide(state.current), state.current.fragment.index + 1), removeFragmentMarkers(line))

      return Effect.succeed({
        ...pushCurrentSlide(state),
        current,
      })
    }

    if (syntax.stopPattern && hasStopMarker(line, syntax.stopPattern)) {
      const current = appendBodyLine(state.current, removeStopMarkers(line, syntax.stopPattern))

      return Effect.succeed({
        ...pushCurrentSlide(state, current),
        current: setFragmentIndex(cloneSlide(current), current.fragment.index + 1),
      })
    }

    const fenceLanguage = parseFenceStart(line)
    if (fenceLanguage !== null) {
      return Effect.succeed({
        ...state,
        current: appendBodyLine(state.current, line),
        fence: {
          ...fenceLanguage,
          startLine: source.number,
          body: [],
        },
      })
    }

    return Effect.succeed(state.current.title.length > 0 ? { ...state, current: appendBodyLine(state.current, line) } : state)
  }
}

function failUnterminatedFence(fence: ActiveFence): UnterminatedCodeFence {
  const language = fence.language.length > 0 ? fence.language : "plain text"

  return new UnterminatedCodeFence({
    startLine: fence.startLine,
    language: fence.language,
    message: `Unterminated ${language} code fence starting on line ${fence.startLine}`,
  })
}

function completeDeck(state: ParserState): Effect.Effect<Deck, ParseError> {
  return state.fence
    ? Effect.fail(failUnterminatedFence(state.fence))
    : Effect.succeed({
        slides: withFragmentCounts([...state.slides, finalizeSlide(state.current)]),
      })
}

function withFragmentCounts(slides: ReadonlyArray<Slide>): ReadonlyArray<Slide> {
  const counts = new Map<number, number>()
  for (const slide of slides) {
    counts.set(slide.fragment.section, Math.max(counts.get(slide.fragment.section) ?? 0, slide.fragment.index + 1))
  }

  return slides.map((slide) => {
    const count = counts.get(slide.fragment.section) ?? 1
    return {
      ...slide,
      fragment: {
        ...slide.fragment,
        count,
        isFragment: count > 1,
      },
    }
  })
}

export function parseSlides(
  input: string | readonly string[],
  options: ParseSlidesOptions = {},
): Effect.Effect<Deck, ParseError> {
  const sourceLines = toSourceLines(input)
  const syntax = resolveSyntax(options)
  const parseSourceLine = parseLine(syntax)

  return pipe(
    sourceLines,
    Arr.reduce(Effect.succeed(initialState()) as Effect.Effect<ParserState, ParseError>, (stateEffect, source) =>
      pipe(stateEffect, Effect.flatMap((state) => parseSourceLine(state, source))),
    ),
    Effect.flatMap(completeDeck),
  )
}

export type { ParseError } from "./errors"
