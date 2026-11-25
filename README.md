## Getting the slices

```bash
bun install
bun run deck slides/neovim-for-absolute-beginners.md
```


## Links

- [kickstart.nvim](https://github.com/nvim-lua/kickstart.nvim): a small, heavily commented starter config to learn from
- [LazyVim](https://www.lazyvim.org/): a complete, ready-to-use Neovim setup
- [lazy.nvim](https://lazy.folke.io/): the plugin manager used by both
- [Vim Cheat Sheet](https://vim.rtorr.com/): a one-page reference of Vim commands
- [Neovim docs](https://neovim.io/doc/): the official documentation
- [Lua guide](https://neovim.io/doc/user/lua-guide.html): using Lua to configure Neovim
- [Install guide](https://github.com/neovim/neovim/blob/master/INSTALL.md): installing Neovim on any system
- [Learn Vim (the Smart Way)](https://github.com/iggredible/Learn-Vim): a free book on GitHub
- [Practical Vim](https://pragprog.com/titles/dnvim2/practical-vim-second-edition/): a book by Drew Neil
- [Vim Adventures](https://vim-adventures.com/): a game for learning Vim keys
- [awesome-neovim](https://github.com/rockerBOO/awesome-neovim), [dotfyle](https://dotfyle.com/) and [r/neovim](https://www.reddit.com/r/neovim/): plugins and community

### Video playlists

- [Vim As Your Editor](https://youtube.com/playlist?list=PLm323Lc7iSW_wuxqmKx_xxNtJC_hJbQ7R) by ThePrimeagen
- [Neovim for Newbs](https://youtube.com/playlist?list=PLsz00TDipIffreIaUNk64KxTIkQaGguqn) by typecraft: a free beginner course
- [Understanding Neovim](https://youtube.com/playlist?list=PLx2ksyallYzW4WNYHD9xOFrPRYGlntAft) by Vhyrro

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
