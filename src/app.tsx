import {
  CliRenderEvents,
  infoStringToFiletype,
  SyntaxStyle,
  type BoxRenderable,
  type LineNumberRenderable,
  type TerminalCapabilities,
} from "@opentui/core"
import { useBindings } from "@opentui/keymap/react"
import { useRenderer, useTerminalDimensions } from "@opentui/react"
import { Effect } from "effect"
import { createContext, useContext, useEffect, useRef, useState } from "react"
import type { DeckKeybindings, ResolvedDeckConfig } from "./config"
import { buildKittyDeleteSequence, writeKittyImage, type ImageRenderError } from "./image"
import type { Deck, Slide, SlideContentBlock, SlideLayout } from "./types"

/** Vertical gaps, in rows. Short terminals get the compact set so slides fit instead of clipping. */
interface Spacing {
  readonly block: number
  readonly codePad: number
  readonly subtitle: number
  readonly heading: number
  readonly stagePadY?: number
}
const roomySpacing: Spacing = { block: 2, codePad: 1, subtitle: 2, heading: 4 }
const compactSpacing: Spacing = { block: 1, codePad: 0, subtitle: 1, heading: 1, stagePadY: 0 }
const compactBelowHeight = 36
const SpacingContext = createContext<Spacing>(roomySpacing)

let imageIdCounter = 1

const emptySlide: Slide = {
  title: "",
  layout: "default",
  frontmatter: {},
  metadata: {
    title: "Untitled slide",
    hideHeader: false,
    hideFooter: false,
  },
  fragment: {
    section: 0,
    index: 0,
    count: 1,
    isFragment: false,
  },
  body: [],
  blocks: [],
  content: [],
}

interface DeckAppProps {
  readonly deck: Deck
  readonly fileName: string
  readonly baseDir: string
  readonly config: ResolvedDeckConfig
}

function clampSlideIndex(index: number, lastIndex: number): number {
  return Math.min(Math.max(index, 0), lastIndex)
}

function titleText(slide: Slide): string {
  return slide.metadata.title
}

function progressText(currentIndex: number, slideCount: number): string {
  const width = 18
  const filled = Math.max(1, Math.round(((currentIndex + 1) / Math.max(slideCount, 1)) * width))
  return `${"━".repeat(filled)}${"─".repeat(width - filled)}`
}

function isLongContent(content: string, threshold: number): boolean {
  return content.split("\n").length > threshold
}

function primaryText(blocks: ReadonlyArray<SlideContentBlock>): string {
  for (const block of blocks) {
    if (block.type === "paragraph" || block.type === "markdown") return block.text
    if (block.type === "list") return block.items.map((item) => item.text).join(" · ")
    if (block.type === "callout") return block.text
    if (block.type === "image") return block.alt || block.src
    if (block.type === "table") return block.headers.join(" · ")
    if (block.type === "mermaid") return block.lines[0] ?? ""
  }
  return ""
}

function cleanMermaidNode(node: string): string {
  const trimmed = node.trim().replace(/;$/, "")
  return trimmed.match(/^[A-Za-z0-9_-]+\[([^\]]+)\]$/)?.[1]
    ?? trimmed.match(/^[A-Za-z0-9_-]+\(([^)]+)\)$/)?.[1]
    ?? trimmed.match(/^[A-Za-z0-9_-]+\{([^}]+)\}$/)?.[1]
    ?? trimmed.replace(/^([A-Za-z0-9_-]+)$/, "$1")
}

function mermaidDiagramLines(lines: ReadonlyArray<string>): ReadonlyArray<string> {
  const rendered = lines
    .map((line) => line.trim())
    .filter((line) => line.length > 0 && !/^(flowchart|graph|sequenceDiagram|classDiagram)\b/.test(line))
    .flatMap((line) => {
      const match = line.match(/^(.+?)\s*(-->|---|==>)\s*(.+)$/)
      if (!match) return [`  ${line}`]

      const left = cleanMermaidNode(match[1] ?? "")
      const arrow = match[2] === "---" ? "───" : match[2] === "==>" ? "══▶" : "──▶"
      const right = cleanMermaidNode(match[3] ?? "")
      return [`  ${left} ${arrow} ${right}`]
    })

  return rendered.length > 0 ? rendered : ["  Mermaid diagram"]
}

function tableLines(headers: ReadonlyArray<string>, rows: ReadonlyArray<ReadonlyArray<string>>): ReadonlyArray<string> {
  const widths = headers.map((header, index) =>
    Math.max(header.length, ...rows.map((row) => row[index]?.length ?? 0)),
  )
  const format = (cells: ReadonlyArray<string>) => `│ ${widths.map((width, index) => (cells[index] ?? "").padEnd(width)).join(" │ ")} │`
  const top = `╭${widths.map((width) => "─".repeat(width + 2)).join("┬")}╮`
  const separator = `├${widths.map((width) => "─".repeat(width + 2)).join("┼")}┤`
  const bottom = `╰${widths.map((width) => "─".repeat(width + 2)).join("┴")}╯`

  return [top, format(headers), separator, ...rows.map(format), bottom]
}

function nonSlotBlocks(blocks: ReadonlyArray<SlideContentBlock>): ReadonlyArray<SlideContentBlock> {
  return blocks.filter((block) => block.type !== "slot")
}

function splitColumnBlocks(blocks: ReadonlyArray<SlideContentBlock>): {
  readonly left: ReadonlyArray<SlideContentBlock>
  readonly right: ReadonlyArray<SlideContentBlock>
} {
  const left: SlideContentBlock[] = []
  const right: SlideContentBlock[] = []
  let side: "left" | "right" = "left"

  for (const block of blocks) {
    if (block.type === "slot") {
      if (block.name === "right") side = "right"
      if (block.name === "left" || block.name === "default") side = "left"
      continue
    }

    if (side === "left") left.push(block)
    else right.push(block)
  }

  return { left, right }
}

function splitChromeBlocks(blocks: ReadonlyArray<SlideContentBlock>): {
  readonly main: ReadonlyArray<SlideContentBlock>
  readonly header: ReadonlyArray<SlideContentBlock>
  readonly footer: ReadonlyArray<SlideContentBlock>
} {
  const main: SlideContentBlock[] = []
  const header: SlideContentBlock[] = []
  const footer: SlideContentBlock[] = []
  let zone: "main" | "header" | "footer" = "main"

  for (const block of blocks) {
    if (block.type === "slot") {
      if (block.name === "header") zone = "header"
      else if (block.name === "footer") zone = "footer"
      else {
        zone = "main"
        main.push(block)
      }
      continue
    }

    if (zone === "header") header.push(block)
    else if (zone === "footer") footer.push(block)
    else main.push(block)
  }

  return { main, header, footer }
}

function commandBindings(keybindings: DeckKeybindings) {
  return [
    ...keybindings.next.map((key) => ({ key, cmd: "deck.next", desc: "Next slide" })),
    ...keybindings.previous.map((key) => ({ key, cmd: "deck.prev", desc: "Previous slide" })),
    ...keybindings.first.map((key) => ({ key, cmd: "deck.first", desc: "First slide" })),
    ...keybindings.last.map((key) => ({ key, cmd: "deck.last", desc: "Last slide" })),
    ...keybindings.help.map((key) => ({ key, cmd: "deck.help", desc: "Toggle help" })),
    ...keybindings.quit.map((key) => ({ key, cmd: "deck.quit", desc: "Quit" })),
  ]
}

function keyHelp(keybindings: DeckKeybindings): string {
  return [
    `${keybindings.next.join("/")} next`,
    `${keybindings.previous.join("/")} previous`,
    `${keybindings.first.join("/")} first`,
    `${keybindings.last.join("/")} last`,
    `${keybindings.help.join("/")} help`,
    `${keybindings.quit.join("/")} quit`,
  ].join(" · ")
}

interface SlideBlockProps {
  readonly block: SlideContentBlock
  readonly markdownStyle: SyntaxStyle
  readonly colors: ResolvedDeckConfig["theme"]["colors"]
  readonly baseDir: string
}

function CodeBlockView({ block, markdownStyle, colors }: { readonly block: Extract<SlideContentBlock, { type: "code" }>; readonly markdownStyle: SyntaxStyle; readonly colors: ResolvedDeckConfig["theme"]["colors"] }) {
  const lineNumberRef = useRef<LineNumberRenderable>(null)
  const filetype = infoStringToFiletype(block.language)
  const showLineNumbers = block.showLineNumbers || block.highlights.length > 0
  const highlightText = block.highlights.length > 0
    ? `lines ${block.highlights.map((range) => range.start === range.end ? range.start : `${range.start}-${range.end}`).join(",")}`
    : undefined

  useEffect(() => {
    const lineNumber = lineNumberRef.current
    if (!lineNumber) return

    lineNumber.clearAllLineColors()
    lineNumber.clearAllLineSigns()
    for (const range of block.highlights) {
      const startIndex = Math.max(0, range.start - 1)
      const endIndex = Math.max(startIndex, range.end - 1)

      lineNumber.highlightLines(startIndex, endIndex, {
        gutter: colors.codeBackground,
        content: colors.codeHighlight,
      })
      lineNumber.setLineSign(startIndex, { before: "▏", beforeColor: colors.progress })
    }
  }, [block.highlights, colors.codeBackground, colors.codeBorder, colors.progress])
  const spacing = useContext(SpacingContext)

  return (
    <box
      style={{
        width: "92%",
        border: true,
        borderStyle: "rounded",
        borderColor: colors.codeBorder,
        backgroundColor: colors.codeBackground,
        paddingTop: spacing.codePad,
        paddingRight: 2,
        paddingBottom: spacing.codePad,
        paddingLeft: 2,
        marginBottom: spacing.block,
      }}
    >
      <box style={{ width: "100%", flexDirection: "row", justifyContent: "space-between", marginBottom: spacing.codePad }}>
        <text style={{ fg: colors.muted }}>{block.title || block.filename || block.language || "text"}</text>
        <text style={{ fg: colors.muted }}>{highlightText ?? (block.showLineNumbers ? "line numbers" : "")}</text>
      </box>
      {showLineNumbers ? (
        <line-number
          ref={lineNumberRef}
          showLineNumbers
          minWidth={String(block.body.split("\n").length).length}
          paddingRight={1}
          fg={colors.muted}
          bg={colors.codeBackground}
          width="100%"
        >
          <code content={block.body} filetype={filetype} syntaxStyle={markdownStyle} width="100%" />
        </line-number>
      ) : (
        <code content={block.body} filetype={filetype} syntaxStyle={markdownStyle} width="100%" />
      )}
    </box>
  )
}

function ImageFallback({ block, colors, error }: { readonly block: Extract<SlideContentBlock, { type: "image" }>; readonly colors: ResolvedDeckConfig["theme"]["colors"]; readonly error?: ImageRenderError }) {
  const caption = block.options.caption ?? block.alt

  return (
    <box
      style={{
        width: "80%",
        border: true,
        borderStyle: "rounded",
        borderColor: colors.muted,
        paddingTop: 1,
        paddingRight: 2,
        paddingBottom: 1,
        paddingLeft: 2,
        marginBottom: 2,
        alignItems: "center",
      }}
    >
      <text style={{ fg: colors.muted }}>{`image: ${block.alt || block.src}`}</text>
      <text style={{ fg: colors.muted }}>{block.src}</text>
      {caption ? <text style={{ fg: colors.muted }}>{caption}</text> : null}
      {error ? <text style={{ fg: colors.muted }}>{error.message}</text> : null}
    </box>
  )
}

function TerminalImageBlock({ block, colors, baseDir }: { readonly block: Extract<SlideContentBlock, { type: "image" }>; readonly colors: ResolvedDeckConfig["theme"]["colors"]; readonly baseDir: string }) {
  const renderer = useRenderer()
  const anchorRef = useRef<BoxRenderable>(null)
  const imageIdRef = useRef(imageIdCounter++)
  const width = block.options.width ?? 80
  const height = block.options.height ?? 18
  const caption = block.options.caption ?? block.alt
  const [supportsNativeImages, setSupportsNativeImages] = useState(() => renderer.capabilities?.kitty_graphics ?? false)
  const [error, setError] = useState<ImageRenderError | undefined>()

  useEffect(() => {
    const onCapabilities = (capabilities: TerminalCapabilities) => {
      setSupportsNativeImages(capabilities.kitty_graphics)
    }

    renderer.on(CliRenderEvents.CAPABILITIES, onCapabilities)
    return () => {
      renderer.off(CliRenderEvents.CAPABILITIES, onCapabilities)
    }
  }, [renderer])

  useEffect(() => {
    if (!supportsNativeImages) return

    const id = imageIdRef.current
    let cancelled = false
    setError(undefined)

    const timeout = setTimeout(() => {
      const anchor = anchorRef.current
      if (!anchor || anchor.width <= 0 || anchor.height <= 0) return

      Effect.runPromise(
        writeKittyImage({
          id,
          src: block.src,
          baseDir,
          x: anchor.screenX,
          y: anchor.screenY,
          width: anchor.width,
          height: anchor.height,
        }),
      ).catch((cause) => {
        if (!cancelled) setError(cause as ImageRenderError)
      })
    }, 40)

    return () => {
      cancelled = true
      clearTimeout(timeout)
      process.stdout.write(buildKittyDeleteSequence(id))
    }
  }, [baseDir, block.src, renderer.terminalHeight, renderer.terminalWidth, supportsNativeImages])

  if (!supportsNativeImages || error) {
    return <ImageFallback block={block} colors={colors} error={error} />
  }

  return (
    <box ref={anchorRef} style={{ width, height, alignItems: "center", justifyContent: "center", marginBottom: 2 }}>
      {caption ? <text style={{ fg: colors.muted, marginTop: 1 }}>{caption}</text> : null}
    </box>
  )
}

function SlideBlock({ block, markdownStyle, colors, baseDir }: SlideBlockProps) {
  const spacing = useContext(SpacingContext)
  switch (block.type) {
    case "slot":
      return null

    case "paragraph":
      return (
        <box style={{ width: "100%", alignItems: "center", marginBottom: 1 }}>
          {/* The capped column lets long paragraphs wrap instead of running off the stage. */}
          <box style={{ maxWidth: "100%", flexDirection: "column" }}>
            <markdown content={block.text} syntaxStyle={markdownStyle} fg={colors.text} bg={colors.appBackground} internalBlockMode="top-level" />
          </box>
        </box>
      )

    case "markdown":
      return (
        <box style={{ width: "100%", alignItems: "center", marginBottom: 1 }}>
          {/* The capped column lets long paragraphs wrap instead of running off the stage. */}
          <box style={{ maxWidth: "100%", flexDirection: "column" }}>
            <markdown content={block.text} syntaxStyle={markdownStyle} fg={colors.text} bg={colors.appBackground} internalBlockMode="top-level" />
          </box>
        </box>
      )

    case "list":
      return (
        <box style={{ flexDirection: "column", marginBottom: 1 }}>
          {block.items.map((item, index) => (
            <text key={`${item.raw}-${index}`} style={{ fg: colors.text }}>
              {block.ordered ? `${index + 1}. ${item.text}` : `- ${item.text}`}
            </text>
          ))}
        </box>
      )

    case "code":
      return <CodeBlockView block={block} markdownStyle={markdownStyle} colors={colors} />

    case "callout": {
      const color = {
        note: colors.calloutNote,
        tip: colors.calloutTip,
        warning: colors.calloutWarning,
        danger: colors.calloutDanger,
      }[block.kind]
      const title = block.title ?? block.kind.toUpperCase()

      return (
        <box
          style={{
            border: ["left"],
            borderColor: color,
            paddingLeft: 2,
            marginBottom: spacing.block,
            flexDirection: "column",
          }}
        >
          <text style={{ fg: color }}>{title}</text>
          <markdown content={block.text} syntaxStyle={markdownStyle} fg={colors.text} bg={colors.appBackground} internalBlockMode="top-level" />
        </box>
      )
    }

    case "divider":
      return (
        <box style={{ width: "70%", alignItems: "center", marginTop: 1, marginBottom: 1 }}>
          <text style={{ fg: colors.progress }}>━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━</text>
        </box>
      )

    case "spacer":
      return <box style={{ height: block.size }} />

    case "image":
      return <TerminalImageBlock block={block} colors={colors} baseDir={baseDir} />

    case "table":
      return (
        <box style={{ flexDirection: "column", marginBottom: spacing.block }}>
          {tableLines(block.headers, block.rows).map((line, index) => (
            <text
              key={`${line}-${index}`}
              style={{
                fg: index === 1 ? colors.tableHeader : line.includes("─") ? colors.tableBorder : colors.text,
              }}
            >
              {line}
            </text>
          ))}
        </box>
      )

    case "mermaid":
      return (
        <box
          style={{
            width: "86%",
            border: true,
            borderStyle: "rounded",
            borderColor: colors.codeBorder,
            paddingTop: 1,
            paddingRight: 2,
            paddingBottom: 1,
            paddingLeft: 2,
            marginBottom: 2,
            flexDirection: "column",
          }}
        >
          <text style={{ fg: colors.muted }}>mermaid</text>
          {mermaidDiagramLines(block.lines).map((line, index) => (
            <text key={`${line}-${index}`} style={{ fg: colors.text }}>{line}</text>
          ))}
        </box>
      )
  }
}

function SlideBlocks({ blocks, markdownStyle, colors, baseDir }: { readonly blocks: ReadonlyArray<SlideContentBlock>; readonly markdownStyle: SyntaxStyle; readonly colors: ResolvedDeckConfig["theme"]["colors"]; readonly baseDir: string }) {
  return (
    <box style={{ width: "100%", flexDirection: "column", alignItems: "center" }}>
      {groupCallouts(blocks).map((group, index) =>
        Array.isArray(group) ? (
          // Consecutive callouts share one centered column, so they line up with each other
          // and shrink to their content instead of hugging the left edge of the stage.
          <box key={`callouts-${index}`} style={{ maxWidth: "80%", flexDirection: "column" }}>
            {group.map((block, inner) => (
              <SlideBlock key={`callout-${inner}`} block={block} markdownStyle={markdownStyle} colors={colors} baseDir={baseDir} />
            ))}
          </box>
        ) : (
          <SlideBlock key={`${group.type}-${index}`} block={group} markdownStyle={markdownStyle} colors={colors} baseDir={baseDir} />
        ),
      )}
    </box>
  )
}

function groupCallouts(blocks: ReadonlyArray<SlideContentBlock>): Array<SlideContentBlock | SlideContentBlock[]> {
  const groups: Array<SlideContentBlock | SlideContentBlock[]> = []
  for (const block of blocks) {
    const last = groups.at(-1)
    if (block.type !== "callout") groups.push(block)
    else if (Array.isArray(last)) last.push(block)
    else groups.push([block])
  }
  return groups
}

interface LayoutProps {
  readonly layout: SlideLayout
  readonly title: string
  readonly subtitle?: string
  readonly blocks: ReadonlyArray<SlideContentBlock>
  readonly markdownStyle: SyntaxStyle
  readonly colors: ResolvedDeckConfig["theme"]["colors"]
  readonly baseDir: string
  readonly hasContent: boolean
  readonly spacing: Spacing
}

function SlideTitle({ title, colors, maxLength = 28 }: { readonly title: string; readonly colors: ResolvedDeckConfig["theme"]["colors"]; readonly maxLength?: number }) {
  return title.length <= maxLength ? (
    <ascii-font text={title.toUpperCase()} font="tiny" color={[colors.title, colors.titleAccent]} />
  ) : (
    <text style={{ fg: colors.title }}>{title.toUpperCase()}</text>
  )
}

function SlideSubtitle({ subtitle, colors }: { readonly subtitle?: string; readonly colors: ResolvedDeckConfig["theme"]["colors"] }) {
  const spacing = useContext(SpacingContext)
  return subtitle ? <text style={{ fg: colors.muted, marginTop: spacing.subtitle }}>{subtitle}</text> : null
}

function renderLayout({ layout, title, subtitle, blocks, markdownStyle, colors, baseDir, hasContent, spacing }: LayoutProps) {
  const visibleBlocks = nonSlotBlocks(blocks)

  switch (layout) {
    case "cover":
    case "center":
      return (
        <box style={{ width: "100%", height: "100%", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
          <box style={{ alignItems: "center", marginBottom: hasContent ? spacing.heading + 1 : 0 }}>
            <SlideTitle title={title} colors={colors} />
            <SlideSubtitle subtitle={subtitle} colors={colors} />
          </box>
          <SlideBlocks blocks={visibleBlocks} markdownStyle={markdownStyle} colors={colors} baseDir={baseDir} />
        </box>
      )

    case "section":
      return (
        <box style={{ width: "100%", height: "100%", flexDirection: "column", justifyContent: "center" }}>
          <box style={{ marginBottom: 2 }}>
            <text style={{ fg: colors.progress }}>━━━━━━━━━━━━━━━━</text>
          </box>
          <SlideTitle title={title} colors={colors} maxLength={36} />
          <SlideSubtitle subtitle={subtitle} colors={colors} />
          {hasContent ? <box style={{ marginTop: 3 }}><SlideBlocks blocks={visibleBlocks} markdownStyle={markdownStyle} colors={colors} baseDir={baseDir} /></box> : null}
        </box>
      )

    case "statement":
      return (
        <box style={{ width: "100%", height: "100%", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
          <box style={{ alignItems: "center", marginBottom: spacing.heading - 1 || 1 }}>
            <text style={{ fg: colors.title }}>{title.toUpperCase()}</text>
            <SlideSubtitle subtitle={subtitle} colors={colors} />
          </box>
          <SlideBlocks blocks={visibleBlocks} markdownStyle={markdownStyle} colors={colors} baseDir={baseDir} />
        </box>
      )

    case "quote":
      return (
        <box style={{ width: "100%", height: "100%", flexDirection: "column", justifyContent: "center" }}>
          <text style={{ fg: colors.title }}>"</text>
          <box style={{ marginLeft: 4, marginTop: 1, marginBottom: 2 }}>
            <SlideBlocks blocks={visibleBlocks} markdownStyle={markdownStyle} colors={colors} baseDir={baseDir} />
          </box>
          <text style={{ fg: colors.muted }}>{title}</text>
        </box>
      )

    case "fact": {
      const fact = primaryText(visibleBlocks) || title
      return (
        <box style={{ width: "100%", height: "100%", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
          <SlideTitle title={fact} colors={colors} maxLength={18} />
          {fact !== title ? <text style={{ fg: colors.muted, marginTop: 3 }}>{title}</text> : null}
        </box>
      )
    }

    case "two-cols": {
      const columns = splitColumnBlocks(blocks)
      return (
        <box style={{ width: "100%", height: "100%", flexDirection: "column", justifyContent: "center" }}>
          <box style={{ width: "100%", alignItems: "center", marginBottom: spacing.heading }}>
            <text style={{ fg: colors.title }}>{title.toUpperCase()}</text>
            <SlideSubtitle subtitle={subtitle} colors={colors} />
          </box>
          <box style={{ width: "100%", flexDirection: "row", columnGap: 4 }}>
            <box style={{ flexGrow: 1, flexBasis: 0, alignItems: "center" }}>
              <SlideBlocks blocks={columns.left} markdownStyle={markdownStyle} colors={colors} baseDir={baseDir} />
            </box>
            <box style={{ flexGrow: 1, flexBasis: 0, alignItems: "center" }}>
              <SlideBlocks blocks={columns.right} markdownStyle={markdownStyle} colors={colors} baseDir={baseDir} />
            </box>
          </box>
        </box>
      )
    }

    case "code": {
      const codeBlocks = visibleBlocks.filter((block) => block.type === "code")
      const otherBlocks = visibleBlocks.filter((block) => block.type !== "code")
      return (
        <box style={{ width: "100%", height: "100%", flexDirection: "column", justifyContent: "center" }}>
          <box style={{ width: "100%", alignItems: "center", marginBottom: spacing.heading - 1 || 1 }}>
            <text style={{ fg: colors.title }}>{title.toUpperCase()}</text>
            <SlideSubtitle subtitle={subtitle} colors={colors} />
          </box>
          <SlideBlocks blocks={codeBlocks.length > 0 ? codeBlocks : visibleBlocks} markdownStyle={markdownStyle} colors={colors} baseDir={baseDir} />
          {otherBlocks.length > 0 ? <box style={{ width: "100%", marginTop: spacing.block }}><SlideBlocks blocks={otherBlocks} markdownStyle={markdownStyle} colors={colors} baseDir={baseDir} /></box> : null}
        </box>
      )
    }

    case "default":
    default:
      return (
        <box style={{ width: "100%", height: "100%", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
          <box style={{ width: "100%", alignItems: "center", marginBottom: hasContent ? spacing.heading : 0 }}>
            <SlideTitle title={title} colors={colors} />
            <SlideSubtitle subtitle={subtitle} colors={colors} />
          </box>
          <SlideBlocks blocks={visibleBlocks} markdownStyle={markdownStyle} colors={colors} baseDir={baseDir} />
        </box>
      )
  }
}

export function DeckApp({ deck, fileName, baseDir, config }: DeckAppProps) {
  const renderer = useRenderer()
  const terminal = useTerminalDimensions()
  const { theme, keybindings } = config
  const { colors, layout } = theme
  const [markdownStyle] = useState(() => SyntaxStyle.fromStyles({ ...theme.syntax }))
  const [slideIndex, setSlideIndex] = useState(0)
  const [showHelp, setShowHelp] = useState(false)
  const slideCount = deck.slides.length
  const lastIndex = Math.max(slideCount - 1, 0)
  const currentIndex = clampSlideIndex(slideIndex, lastIndex)
  const slide = deck.slides[currentIndex] ?? emptySlide
  const chromeBlocks = splitChromeBlocks(slide.content)
  const title = titleText(slide)
  const subtitle = slide.metadata.subtitle
  const content = slide.body.join("\n")
  const hasContent = chromeBlocks.main.length > 0
  const headerText = primaryText(chromeBlocks.header)
  const footerText = primaryText(chromeBlocks.footer)
  const shouldScrollContent = isLongContent(content, layout.longContentLineThreshold)
  const spacing = terminal.height < compactBelowHeight ? compactSpacing : roomySpacing

  useBindings(
    () => ({
      priority: 1000,
      commands: [
        {
          name: "deck.next",
          run: () => setSlideIndex((index) => clampSlideIndex(index + 1, lastIndex)),
          title: "Next slide",
        },
        {
          name: "deck.prev",
          run: () => setSlideIndex((index) => clampSlideIndex(index - 1, lastIndex)),
          title: "Previous slide",
        },
        {
          name: "deck.first",
          run: () => setSlideIndex(0),
          title: "First slide",
        },
        {
          name: "deck.last",
          run: () => setSlideIndex(lastIndex),
          title: "Last slide",
        },
        {
          name: "deck.help",
          run: () => setShowHelp((visible) => !visible),
          title: "Toggle help",
        },
        {
          name: "deck.quit",
          run: () => renderer.destroy(),
          title: "Quit",
        },
      ],
      bindings: commandBindings(keybindings),
    }),
    [keybindings, lastIndex, renderer],
  )

  return (
    <SpacingContext.Provider value={spacing}>
    <box
      style={{
        height: terminal.height,
        width: terminal.width,
        backgroundColor: colors.appBackground,
        flexDirection: "column",
        paddingTop: 1,
        paddingRight: 3,
        paddingBottom: 1,
        paddingLeft: 3,
      }}
    >
      {slide.metadata.hideHeader ? null : (
        <box
          style={{
            height: 1,
            width: "100%",
            flexDirection: "row",
            justifyContent: "space-between",
          }}
        >
          <text style={{ fg: colors.chrome }}>{headerText || "deck"}</text>
          <text style={{ fg: colors.chromeMuted }}>press {keybindings.help[0] ?? "?"} for keys</text>
        </box>
      )}

      <box
        style={{
          flexGrow: 1,
          alignItems: "center",
          justifyContent: "center",
          paddingTop: spacing.stagePadY ?? layout.stagePaddingY,
          paddingRight: layout.stagePaddingX,
          paddingBottom: spacing.stagePadY ?? layout.stagePaddingY,
          paddingLeft: layout.stagePaddingX,
        }}
      >
        <box
          style={{
            width: layout.stageWidth,
            maxWidth: layout.stageMaxWidth,
            height: "100%",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          {hasContent && shouldScrollContent ? (
            <scrollbox
              focused
              style={{
                width: "100%",
                maxHeight: "70%",
                paddingTop: 1,
                paddingRight: 1,
                paddingBottom: 1,
                paddingLeft: 1,
                backgroundColor: colors.appBackground,
              }}
            >
              {renderLayout({ layout: slide.layout, title, subtitle, blocks: chromeBlocks.main, markdownStyle, colors, baseDir, hasContent, spacing })}
            </scrollbox>
          ) : (
            renderLayout({ layout: slide.layout, title, subtitle, blocks: chromeBlocks.main, markdownStyle, colors, baseDir, hasContent, spacing })
          )}
        </box>
      </box>

      {showHelp ? (
        <box
          style={{
            border: true,
            borderStyle: "rounded",
            borderColor: colors.helpBorder,
            paddingLeft: 1,
            paddingRight: 1,
            marginBottom: 1,
            alignItems: "center",
          }}
        >
          <text style={{ fg: colors.helpText }}>{keyHelp(keybindings)}</text>
        </box>
      ) : null}

      {slide.metadata.hideFooter ? null : (
        <box style={{ height: 1, width: "100%", flexDirection: "row", justifyContent: "space-between" }}>
          <text style={{ fg: colors.muted }}>{footerText || fileName}</text>
          <text style={{ fg: colors.progress }}>{progressText(currentIndex, slideCount)}</text>
          <text style={{ fg: colors.footer }}>
            {slide.fragment.isFragment
              ? `${currentIndex + 1} / ${Math.max(slideCount, 1)} · step ${slide.fragment.index + 1}/${slide.fragment.count}`
              : `${currentIndex + 1} / ${Math.max(slideCount, 1)}`}
          </text>
        </box>
      )}
    </box>
    </SpacingContext.Provider>
  )
}
