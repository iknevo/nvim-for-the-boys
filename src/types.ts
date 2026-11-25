export interface Deck {
  readonly slides: ReadonlyArray<Slide>
}

export interface Slide {
  readonly title: string
  readonly layout: SlideLayout
  readonly frontmatter: SlideFrontmatter
  readonly metadata: SlideMetadata
  readonly fragment: SlideFragment
  readonly body: ReadonlyArray<string>
  readonly blocks: ReadonlyArray<CodeBlock>
  readonly content: ReadonlyArray<SlideContentBlock>
}

export type SlideLayout = "default" | "center" | "cover" | "section" | "statement" | "quote" | "fact" | "two-cols" | "code"

export interface SlideFrontmatter {
  readonly layout?: string
  readonly title?: string
  readonly subtitle?: string
  readonly author?: string
  readonly date?: string
  readonly variant?: string
  readonly hideHeader?: string
  readonly hideFooter?: string
  readonly [key: string]: string | undefined
}

export interface SlideMetadata {
  readonly title: string
  readonly subtitle?: string
  readonly author?: string
  readonly date?: string
  readonly variant?: string
  readonly hideHeader: boolean
  readonly hideFooter: boolean
}

export interface SlideFragment {
  readonly section: number
  readonly index: number
  readonly count: number
  readonly isFragment: boolean
}

export interface CodeBlock {
  readonly info: string
  readonly language: string
  readonly title?: string
  readonly filename?: string
  readonly highlights: ReadonlyArray<CodeHighlight>
  readonly showLineNumbers: boolean
  readonly body: string
  readonly startLine: number
  readonly endLine: number
}

export interface CodeHighlight {
  readonly start: number
  readonly end: number
}

export type SlideContentBlock =
  | ParagraphBlock
  | ListBlock
  | CodeContentBlock
  | MarkdownBlock
  | SlotBlock
  | CalloutBlock
  | DividerBlock
  | SpacerBlock
  | ImageBlock
  | TableBlock
  | MermaidBlock

export interface ParagraphBlock {
  readonly type: "paragraph"
  readonly lines: ReadonlyArray<string>
  readonly text: string
}

export interface ListBlock {
  readonly type: "list"
  readonly ordered: boolean
  readonly items: ReadonlyArray<ListItem>
}

export interface ListItem {
  readonly text: string
  readonly raw: string
}

export interface CodeContentBlock extends CodeBlock {
  readonly type: "code"
}

export interface MarkdownBlock {
  readonly type: "markdown"
  readonly lines: ReadonlyArray<string>
  readonly text: string
}

export interface SlotBlock {
  readonly type: "slot"
  readonly name: "default" | "left" | "right" | "header" | "footer"
}

export type CalloutKind = "note" | "tip" | "warning" | "danger"

export interface CalloutBlock {
  readonly type: "callout"
  readonly kind: CalloutKind
  readonly title?: string
  readonly lines: ReadonlyArray<string>
  readonly text: string
}

export interface DividerBlock {
  readonly type: "divider"
}

export interface SpacerBlock {
  readonly type: "spacer"
  readonly size: number
}

export interface ImageBlock {
  readonly type: "image"
  readonly alt: string
  readonly src: string
  readonly options: ImageOptions
}

export interface ImageOptions {
  readonly width?: number
  readonly height?: number
  readonly fit: "contain" | "cover" | "fill"
  readonly caption?: string
}

export interface TableBlock {
  readonly type: "table"
  readonly headers: ReadonlyArray<string>
  readonly rows: ReadonlyArray<ReadonlyArray<string>>
}

export interface MermaidBlock {
  readonly type: "mermaid"
  readonly body: string
  readonly lines: ReadonlyArray<string>
}

export interface ParseSlidesOptions {
  readonly commentPrefix?: string | false
  readonly stopPattern?: RegExp | string | false
}
