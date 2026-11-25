import { describe, expect, test } from "bun:test"
import { Effect } from "effect"
import { parseSlides } from "../src/parser"
import type { ParseSlidesOptions, Slide } from "../src/types"

const parse = (input: string | readonly string[], options?: ParseSlidesOptions) =>
  Effect.runPromise(parseSlides(input, options))

function legacySlide(slide: Slide) {
  return {
    title: slide.title,
    body: slide.body,
    blocks: slide.blocks.map((block) => ({
      language: block.language,
      body: block.body,
      startLine: block.startLine,
      endLine: block.endLine,
    })),
  }
}

describe("parseSlides", () => {
  test("parses an empty file", async () => {
    const results = await parse([""])

    expect(results.slides.map(legacySlide)).toEqual([
        {
          title: "",
          body: [],
          blocks: [],
        },
    ])
  })

  test("parses a file with one slide", async () => {
    expect(
      (await parse([
        "# This is the first slide",
        "This is the body",
      ])).slides.map(legacySlide),
    ).toEqual([
      {
        title: "# This is the first slide",
        body: ["This is the body"],
        blocks: [],
      },
    ])
  })

  test("parses a file with one slide and a code block", async () => {
    const results = await parse([
      "# This is the first slide",
      "This is the body",
      "```lua",
      "print('hi')",
      "```",
    ])

    expect(results.slides).toHaveLength(1)
    expect(legacySlide(results.slides[0]!)).toEqual({
      title: "# This is the first slide",
      body: ["This is the body", "```lua", "print('hi')", "```"],
      blocks: [
        {
          language: "lua",
          body: "print('hi')",
          startLine: 3,
          endLine: 5,
        },
      ],
    })
  })

  test("uses stop comments to create progressive reveal slides", async () => {
    const results = await parse([
      "# This is the first slide",
      "This is the body <!-- stop -->",
      "This is the middle line <!--    stop -->",
      "This is the final line",
    ])

    expect(results.slides).toHaveLength(3)
    expect(legacySlide(results.slides[0]!)).toEqual({
      title: "# This is the first slide",
      body: ["This is the body"],
      blocks: [],
    })
    expect(legacySlide(results.slides[1]!)).toEqual({
      title: "# This is the first slide",
      body: ["This is the body", "This is the middle line"],
      blocks: [],
    })
    expect(legacySlide(results.slides[2]!)).toEqual({
      title: "# This is the first slide",
      body: ["This is the body", "This is the middle line", "This is the final line"],
      blocks: [],
    })
  })

  test("ignores comment lines", async () => {
    const results = await parse([
      "# This is the first slide",
      "%% This is a comment",
      "This is the body <!-- stop -->",
      "This is the final line",
    ])

    expect(results.slides).toHaveLength(2)
    expect(legacySlide(results.slides[0]!)).toEqual({
      title: "# This is the first slide",
      body: ["This is the body"],
      blocks: [],
    })
    expect(legacySlide(results.slides[1]!)).toEqual({
      title: "# This is the first slide",
      body: ["This is the body", "This is the final line"],
      blocks: [],
    })
  })

  test("does not interpret headings inside code blocks as slides", async () => {
    const results = await parse([
      "# This is the first slide",
      "This is the body",
      "```c",
      "#include <stdio.h>",
      "int main() {}",
      "```",
      "Same slide",
    ])

    expect(results.slides).toHaveLength(1)
    expect(legacySlide(results.slides[0]!)).toEqual({
      title: "# This is the first slide",
      body: [
        "This is the body",
        "```c",
        "#include <stdio.h>",
        "int main() {}",
        "```",
        "Same slide",
      ],
      blocks: [
        {
          language: "c",
          body: "#include <stdio.h>\nint main() {}",
          startLine: 3,
          endLine: 6,
        },
      ],
    })
  })

  test("does not apply comments or stops inside code blocks", async () => {
    const results = await parse([
      "# Slide",
      "```markdown",
      "%% not a parser comment",
      "# not a parser heading",
      "inside <!-- stop --> code",
      "```",
      "After code",
    ])

    expect(results.slides).toHaveLength(1)
    expect(legacySlide(results.slides[0]!)).toEqual({
      title: "# Slide",
      body: [
        "```markdown",
        "%% not a parser comment",
        "# not a parser heading",
        "inside <!-- stop --> code",
        "```",
        "After code",
      ],
      blocks: [
        {
          language: "markdown",
          body: "%% not a parser comment\n# not a parser heading\ninside <!-- stop --> code",
          startLine: 2,
          endLine: 6,
        },
      ],
    })
  })

  test("supports custom syntax options", async () => {
    const results = await parse(
      ["# Slide", "// hidden", "First ---", "Second"],
      {
        commentPrefix: "//",
        stopPattern: "---",
      },
    )

    expect(results.slides.map(legacySlide)).toEqual([
      {
        title: "# Slide",
        body: ["First"],
        blocks: [],
      },
      {
        title: "# Slide",
        body: ["First", "Second"],
        blocks: [],
      },
    ])
  })

  test("fails on unterminated code fences", async () => {
    try {
      await parse(["# Slide", "```ts", "const answer = 42"])
      throw new Error("Expected parseSlides to fail")
    } catch (error) {
      expect(error).toMatchObject({
        _tag: "UnterminatedCodeFence",
        startLine: 2,
        language: "ts",
        message: "Unterminated ts code fence starting on line 2",
      })
    }
  })

  test("extracts structured paragraph, list, and code blocks", async () => {
    const results = await parse([
      "# Structured",
      "Intro paragraph",
      "continues here",
      "",
      "- first",
      "- second",
      "",
      "```ts",
      "const answer = 42",
      "```",
    ])

    expect(results.slides[0]?.content).toEqual([
      {
        type: "paragraph",
        lines: ["Intro paragraph", "continues here"],
        text: "Intro paragraph\ncontinues here",
      },
      {
        type: "list",
        ordered: false,
        items: [
          { raw: "- first", text: "first" },
          { raw: "- second", text: "second" },
        ],
      },
      {
        type: "code",
        info: "ts",
        language: "ts",
        highlights: [],
        showLineNumbers: false,
        body: "const answer = 42",
        startLine: 8,
        endLine: 10,
      },
    ])
  })

  test("extracts code fence metadata", async () => {
    const results = await parse([
      "# Code",
      "```ts [parser.ts] {1,3-5} lines title=Parser",
      "const answer = 42",
      "```",
    ])

    expect(results.slides[0]?.blocks[0]).toEqual({
      info: "ts [parser.ts] {1,3-5} lines title=Parser",
      language: "ts",
      filename: "parser.ts",
      title: "Parser",
      highlights: [
        { start: 1, end: 1 },
        { start: 3, end: 5 },
      ],
      showLineNumbers: true,
      body: "const answer = 42",
      startLine: 2,
      endLine: 4,
    })
  })

  test("extracts mermaid diagrams from mermaid fences", async () => {
    const results = await parse([
      "# Diagram",
      "```mermaid",
      "flowchart LR",
      "A[Markdown] --> B[Parser]",
      "B --> C[OpenTUI]",
      "```",
    ])

    expect(results.slides[0]?.content).toEqual([
      {
        type: "mermaid",
        body: "flowchart LR\nA[Markdown] --> B[Parser]\nB --> C[OpenTUI]",
        lines: ["flowchart LR", "A[Markdown] --> B[Parser]", "B --> C[OpenTUI]"],
      },
    ])
  })

  test("extracts callout blocks", async () => {
    const results = await parse([
      "# Callouts",
      ":::warning Check this",
      "Do not forget the terminal size.",
      ":::",
    ])

    expect(results.slides[0]?.content).toEqual([
      {
        type: "callout",
        kind: "warning",
        title: "Check this",
        lines: ["Do not forget the terminal size."],
        text: "Do not forget the terminal size.",
      },
    ])
  })

  test("extracts visual primitive blocks", async () => {
    const results = await parse([
      "# Visuals",
      "---",
      "::space:3::",
      "![Architecture](./architecture.png){width=40 height=12 fit=contain caption=Pipeline}",
    ])

    expect(results.slides[0]?.content).toEqual([
      { type: "divider" },
      { type: "spacer", size: 3 },
      { type: "image", alt: "Architecture", src: "./architecture.png", options: { width: 40, height: 12, fit: "contain", caption: "Pipeline" } },
    ])
  })

  test("extracts markdown tables", async () => {
    const results = await parse([
      "# Table",
      "| Feature | Status |",
      "| --- | --- |",
      "| Layouts | Done |",
      "| Tables | Now |",
    ])

    expect(results.slides[0]?.content).toEqual([
      {
        type: "table",
        headers: ["Feature", "Status"],
        rows: [
          ["Layouts", "Done"],
          ["Tables", "Now"],
        ],
      },
    ])
  })

  test("keeps progressive reveal content structured", async () => {
    const results = await parse([
      "# Reveal",
      "First <!-- stop -->",
      "- second",
      "- third",
    ])

    expect(results.slides[0]?.content).toEqual([
      {
        type: "paragraph",
        lines: ["First"],
        text: "First",
      },
    ])
    expect(results.slides[1]?.content).toEqual([
      {
        type: "paragraph",
        lines: ["First"],
        text: "First",
      },
      {
        type: "list",
        ordered: false,
        items: [
          { raw: "- second", text: "second" },
          { raw: "- third", text: "third" },
        ],
      },
    ])
  })

  test("tracks fragment metadata for progressive reveal slides", async () => {
    const results = await parse([
      "# First",
      "A <!-- stop -->",
      "B",
      "# Second",
      "C",
    ])

    expect(results.slides.map((slide) => slide.fragment)).toEqual([
      { section: 0, index: 0, count: 2, isFragment: true },
      { section: 0, index: 1, count: 2, isFragment: true },
      { section: 1, index: 0, count: 1, isFragment: false },
    ])
  })

  test("supports block-level fragment markers", async () => {
    const results = await parse([
      "# Fragments",
      "- first",
      "- second <!-- fragment -->",
      "- third <!-- fragment -->",
    ])

    expect(results.slides.map((slide) => slide.body)).toEqual([
      ["- first"],
      ["- first", "- second"],
      ["- first", "- second", "- third"],
    ])
    expect(results.slides.map((slide) => slide.fragment)).toEqual([
      { section: 0, index: 0, count: 3, isFragment: true },
      { section: 0, index: 1, count: 3, isFragment: true },
      { section: 0, index: 2, count: 3, isFragment: true },
    ])
  })

  test("extracts slide layout frontmatter", async () => {
    const results = await parse([
      "# Layout",
      "---",
      "layout: two-cols",
      "class: ignored-for-now",
      "---",
      "Left side",
      "::right::",
      "Right side",
    ])

    expect(results.slides[0]?.layout).toBe("two-cols")
    expect(results.slides[0]?.frontmatter).toEqual({
      layout: "two-cols",
      class: "ignored-for-now",
    })
    expect(results.slides[0]?.body).toEqual(["Left side", "::right::", "Right side"])
    expect(results.slides[0]?.content).toEqual([
      {
        type: "paragraph",
        lines: ["Left side"],
        text: "Left side",
      },
      {
        type: "slot",
        name: "right",
      },
      {
        type: "paragraph",
        lines: ["Right side"],
        text: "Right side",
      },
    ])
  })

  test("extracts header and footer slots", async () => {
    const results = await parse([
      "# Slots",
      "::header::",
      "Workshop mode",
      "::default::",
      "Main body",
      "::footer::",
      "repo: talktui",
    ])

    expect(results.slides[0]?.content).toEqual([
      { type: "slot", name: "header" },
      { type: "paragraph", lines: ["Workshop mode"], text: "Workshop mode" },
      { type: "slot", name: "default" },
      { type: "paragraph", lines: ["Main body"], text: "Main body" },
      { type: "slot", name: "footer" },
      { type: "paragraph", lines: ["repo: talktui"], text: "repo: talktui" },
    ])
  })

  test("extracts slide metadata frontmatter", async () => {
    const results = await parse([
      "# Original Heading",
      "---",
      "title: Public Title",
      "subtitle: Better talks in the terminal",
      "author: nexxel",
      "date: 2026-06-28",
      "variant: loud",
      "hideHeader: true",
      "hideFooter: yes",
      "---",
      "Body",
    ])

    expect(results.slides[0]?.metadata).toEqual({
      title: "Public Title",
      subtitle: "Better talks in the terminal",
      author: "nexxel",
      date: "2026-06-28",
      variant: "loud",
      hideHeader: true,
      hideFooter: true,
    })
  })

  test("aliases split layouts to two-cols", async () => {
    const results = await parse(["# Layout", "---", "layout: split", "---", "Body"])

    expect(results.slides[0]?.layout).toBe("two-cols")
  })
})
