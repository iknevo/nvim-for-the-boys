# TalkTUI
---
layout: cover
---

Terminal-native decks from plain Markdown.

<!-- stop -->

- Markdown in
- OpenTUI out
- Keymaps from the start

# Shape The Talk
---
layout: two-cols
---

- Write one file
- Pick a layout per slide
- Keep the terminal aesthetic

::right::

```ts
export default {
  theme: "ember",
  keybindings: {
    next: ["j", "space"],
  },
}
```

# The Stage Is The Terminal
---
layout: statement
---

No browser chrome. No canvas. No ceremony.

# Everything Is A Primitive
---
layout: section
---

layouts, blocks, themes, keymaps

# Code Gets A Real Surface
---
layout: code
---

```ts
const slide = parse(markdown)
const view = render(slide.content)

if (slide.layout === "two-cols") {
  split(view)
}
```

Code blocks are first-class now. Execution comes later.

# 17ms
---
layout: fact
---

from markdown to terminal frame

# End
---
layout: quote
---

> Build the talk like you build the tool.
