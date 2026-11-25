## Getting the slices

```bash
bun install
bun run deck slides/neovim-for-absolute-beginners.md
```


## Controls

- `k`: next
- `j`: previous
- `f`: first slide
- `l`: last slide
- `?`: toggle help
- `q`: quit

## Config

`deck.config.ts`:

```ts
import type { DeckUserConfig } from "./src/config"

export default {
  theme: "tokyonight",
  keybindings: {
    next: ["j", "space"],
    previous: ["k"],
  },
} satisfies DeckUserConfig
```

See [`docs.md`](./docs.md) for Markdown syntax and supported primitives.
