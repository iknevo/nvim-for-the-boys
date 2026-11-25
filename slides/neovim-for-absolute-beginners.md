%% Neovim for Absolute Beginners: a TalkTUI deck
%% Run from the repo root:  bun run deck slides/neovim-for-absolute-beginners.md
%% Optional practice files for practising on your own live in slides/practice/

%% ============================================================
%% LESSON 1
%% ============================================================

# Lesson 1
---
layout: section
subtitle: Introduction to Neovim
---

What it is, where it came from, and the one idea that makes it different.

# Vim And Neovim
---
layout: two-cols
subtitle: same keys, modern engine
---

- vi: 1970s
- Vim ("Vi IMproved"): 1991
- Installed almost everywhere
- Famous for modal editing

::right::

- Neovim: 2014, continues Vim
- Lua for config and plugins
- Built-in LSP (smart code features)
- Tree-sitter (smarter highlighting)
- Sensible defaults
- You run it as: nvim

# Why Neovim?
---
subtitle: what you get for the effort
---

| Reason | What it means for you |
| --- | --- |
| Hands on the keyboard | no reaching for the mouse |
| Editing is a language | a grammar, not 500 shortcuts |
| Lightweight | starts instantly, even on servers |
| It's everywhere | Vim keys work in most editors |
| It's yours | shape it into your own editor |
| Free and open source | no license, no account, no telemetry |

:::warning An honest warning
The first few days are **slower** than whatever you use now. The payoff comes later, and it lasts for **years**.
:::

# Modal Editing
---
layout: two-cols
subtitle: the same key does different things depending on the mode
---

:::note Normal mode
`j` is a **command**: the cursor moves **down** one line. Nothing is typed.
:::

::right::

:::tip Insert mode
`j` is a **character**: the letter "j" appears, like in any editor.
:::

# Why Design It Like That?
---
subtitle: think about how you actually spend your time
---

You spend most of your time **reading, moving and fixing**, not typing new text.

Modal editing gives those actions the **best seats** on the keyboard.

Delete a word? `dw`. Two keys. No mouse, no double-click, no Backspace.

:::tip Remember this
**Normal mode** is for moving and changing text. **Insert mode** is for typing text.
:::

%% ============================================================
%% LESSON 2
%% ============================================================

# Lesson 2
---
layout: section
subtitle: Understanding Neovim Modes
---

Four modes. One home base.

# The Four Modes
---
subtitle: you visit the other modes, then come home
---

| Mode | Use it to | Bottom shows | Enter → Leave |
| --- | --- | --- | --- |
| Normal | move, delete, undo | (nothing) | Esc → (home) |
| Insert | type text | -- INSERT -- | i a o → Esc |
| Visual | select, then act | -- VISUAL -- | v V Ctrl+v → Esc |
| Cmd-line | save, quit, replace | : prompt | : → Enter / Esc |

:::tip Normal mode is home base
Neovim **starts** in Normal mode. When in doubt, press **Esc**. It's always safe.
:::

# The Exit Decoded
---
subtitle: now Esc  :q!  Enter makes sense
---

| Keys | Meaning |
| --- | --- |
| Esc | whatever mode I'm in, take me to Normal |
| : | open the command line |
| q! | quit, and I'm sure (!) even with unsaved changes |
| Enter | run it |

:::warning Classic beginner mistake
You type `:w` to save... and ":w" appears **in your file**. You were in Insert mode. Tap **Esc** before every command, and `u` undoes the accidental text.
:::

%% ============================================================
%% LESSON 3
%% ============================================================

# Lesson 3
---
layout: section
subtitle: Basic Navigation
---

Moving around in Normal mode. All of it.

# One Step At A Time
---
subtitle: h  j  k  l  (arrow keys still work, use them if hjkl feels bad)
---

| Key | Moves |
| --- | --- |
| h | left |
| j | down |
| k | up |
| l | right |

:::note Counts
`5j` = down 5 lines, `10G` = line 10. Works with most commands.
:::

# Words
---
subtitle: w  b  e
---

| Key | Moves to |
| --- | --- |
| w | start of the next word |
| b | start of the previous word |
| e | end of the word |

:::note Punctuation is its own word
`user.name` has three stops: `user` · `.` · `name`
:::

:::tip Bonus
`W` `B` `E` treat everything between spaces as one big WORD.
:::

# Moving Within A Line
---
subtitle: in code, ^ is usually what you want
---

```text
    return total;
^                     0  column zero
    ^                 ^  first non-blank character
                ^     $  end of the line
```

# Moving Through The File
---
subtitle: gg  G  Ctrl+d  Ctrl+u
---

| Key | Does |
| --- | --- |
| gg | first line of the file |
| G | last line of the file |
| 10G | line 10 (or type :10 Enter) |
| Ctrl+d | scroll down half a screen |
| Ctrl+u | scroll up half a screen |

%% ============================================================
%% LESSON 4
%% ============================================================

# Lesson 4
---
layout: section
subtitle: Editing Text
---

Inserting, deleting, copying, pasting, undoing.

# Entering Insert Mode
---
subtitle: cursor on the i in "milk", then type X
---

| Key | Starts typing | Result |
| --- | --- | --- |
| i | before the cursor | mXilk |
| a | after the cursor | miXlk |
| I | start of the line | Xmilk |
| A | end of the line | milkX |
| o | on a new line below | |
| O | on a new line above | |

:::tip Uppercase means bigger
The uppercase version is the **line-level** version. `A;` adds a semicolon to the end of the line, **wherever** your cursor is.
:::

# Delete, Yank, Put
---
subtitle: copying is called yanking (c was taken by change)
---

| Key | Does | Example |
| --- | --- | --- |
| x | delete one character | cheese → chese |
| dw | delete to the next word | the old bags → the bags |
| dd | delete the line | |
| yy | yank (copy) the line | |
| p / P | paste after / before | lines go below / above |
| ddp / xp | swap lines / characters | teh → the |

:::note Delete is really cut
Delete · move · `p` = **moving text**.
:::

# Undo And Redo
---
subtitle: u  and  Ctrl+r
---

| Key | Does |
| --- | --- |
| u | undo the last change (press again to go further back) |
| Ctrl+r | redo (undo the undo) |
| U | NOT redo: an old, rarely useful command (press u) |

:::tip One Insert visit = one undo
Three paragraphs typed in one go = one `u`. **Leave Insert mode often.**
:::

# Small Fixes And The Dot
---
subtitle: r  cw  .
---

| Key | Does | Example |
| --- | --- | --- |
| r + char | replace one char, stay in Normal | cat → ru → cut |
| cw | change word: delete it, enter Insert | cw bread Esc |
| . | repeat your last change | dd, then . = dd again |

:::note
Each change is a complete **sentence** Neovim can replay. More in Lesson 5.
:::

%% ============================================================
%% LESSON 5
%% ============================================================

# Lesson 5
---
layout: section
subtitle: Operators and Motions
---

The heart of Vim. Stop memorizing, start composing.

# Editing Is A Language
---
layout: center
subtitle: dw was never an arbitrary shortcut
---

```text
      d          w
      │          │
    verb   +   noun
 (operator)  (motion)

 "delete"  +  "to the next word"
```

You already know the nouns from Lesson 3. Now learn the verbs.

# Verbs And Nouns
---
layout: two-cols
subtitle: an operator alone waits for its noun (Esc cancels)
---

| Operator | Does |
| --- | --- |
| d | delete (keeps it for pasting) |
| c | change: delete, then Insert mode |
| y | yank: copy, change nothing |

::right::

| Motion | From the cursor to... |
| --- | --- |
| w / b | next / previous word start |
| e | end of the word |
| 0 / ^ / $ | line start / first non-blank / end |
| gg / G | start / end of the file |

# Combine Them
---
subtitle: 3 verbs × 4 nouns = 12 commands from 7 keys
---

|  | w | e | $ | 0 |
| --- | --- | --- | --- | --- |
| d (delete) | dw | de | d$ | d0 |
| c (change) | cw | ce | c$ | c0 |
| y (yank) | yw | ye | y$ | y0 |

Learn one new motion later, and you get **three new commands for free**.

# Sentences In Action
---
subtitle: cursor on the r of "returns"
---

`This function returns the total price of the cart.`

| You type | Result |
| --- | --- |
| dw | This function the total price of the cart. |
| d$ | This function |
| d0 | returns the total price of the cart. |
| cw calculates Esc | This function calculates the total price... |
| y$ | copies "returns the total price of the cart." |

# Counts And Doubles
---
layout: two-cols
subtitle: making sentences richer
---

- d3w   delete 3 words
- 3dw   3 times, delete a word
- c2w   change 2 words
- y5j   yank this line + 5 below

::right::

- dd   delete the whole line
- yy   yank the whole line
- cc   change the whole line
- D = d$    C = c$    Y = y$

:::note The cw quirk
`cw` acts like `ce`: it keeps the space after the word, because when you change a word you almost always want it.
:::

# Text Objects
---
subtitle: act on the thing the cursor is inside: operator + text object
---

`i` = **inner** (just the contents) · `a` = **around** (contents + surroundings)

| Text object | Selects |
| --- | --- |
| iw | the word under the cursor |
| aw | the word + the space after it |
| i) or i( | everything inside the parentheses |
| a) or a( | inside + the parentheses themselves |
| i" | everything inside the double quotes |
| a" | inside + the quote marks |

# Text Objects In Action
---
subtitle: console.log("Hello world", user.name);  cursor inside "world"
---

| You type | Reads as | Result |
| --- | --- | --- |
| ciw | change inner word | console.log("Hello _", user.name); |
| ci" | change inside quotes | console.log("_", user.name); |
| da" | delete around quotes | console.log(, user.name); |
| di) | delete inside parens | console.log(); |
| ya) | yank around parens | copies ("Hello world", user.name) |

:::tip Why text objects win
`ciw` works from **anywhere** in the word. `daw` removes it with no double space.
:::

# New Verbs, Same Nouns
---
subtitle: more operators
---

| Operator | Does | Try |
| --- | --- | --- |
| gU | UPPERCASE | gUiw: the word |
| gu | lowercase | gu$: to end of line |
| > | indent | >j: this line and the next |
| gc | toggle comment (code) | gcc: this line, gc2j: three |

Commands become guessable: yank inside parens? `yi)`. And `.` repeats whole sentences.

%% ============================================================
%% LESSON 6
%% ============================================================

# Lesson 6
---
layout: section
subtitle: Visual Mode
---

Select first. Then act.

# Three Flavors
---
subtitle: grow the selection with any motion (on Windows, Ctrl+q if Ctrl+v pastes)
---

| Key | Mode | Selects | Shown as |
| --- | --- | --- | --- |
| v | character-wise | any range of characters | -- VISUAL -- |
| V | line-wise | whole lines only | -- VISUAL LINE -- |
| Ctrl+v | block-wise | a rectangle (a column) | -- VISUAL BLOCK -- |

:::note Two styles, both valid
`dw`: act, then describe. `v` `e` `d`: select, then act. You **see** it first.
:::

# Act On A Selection
---
subtitle: most of these drop you back in Normal mode
---

| Key | Action |
| --- | --- |
| d or x | delete it |
| y | yank it |
| c | change it |
| p | replace it with what you last yanked |
| > / < | indent / unindent (. repeats; >> << in Normal mode) |
| ~  u  U | toggle case / lowercase / UPPERCASE |
| J | join the lines into one |

:::tip You never have to start over
`o` other end · `gv` reselect · `viw` / `vi"` word / inside quotes
:::

# Block Mode Magic
---
layout: two-cols
subtitle: add "- " to many lines at once (only line 1 changes until you press Esc)
---

```text title="before → after"
apples        - apples
bread         - bread
milk          - milk
eggs          - eggs
```

::right::

1. Cursor on the a of apples
2. Ctrl+v, then 3j
3. I (capital i)
4. Type "- "
5. Esc

%% ============================================================
%% LESSON 7
%% ============================================================

# Lesson 7
---
layout: section
subtitle: Saving and Quitting
---

And opening files, from Neovim and from the terminal.

# Save And Quit
---
subtitle: w = write · q = quit · ! = I'm sure, do it anyway
---

| Command | Meaning |
| --- | --- |
| :w | save, keep editing |
| :q | quit (only if nothing is unsaved) |
| :wq | save, then quit |
| :q! | quit and throw changes away |
| :wa  :qa  :wqa | save all / quit all / save all and quit |
| ZZ  ZQ | Normal mode: save and quit / quit, no save |

:::note E37: No write since last change
Neovim protecting you: `:wq` to save, `:q!` to discard.
:::

# Opening Files
---
subtitle: from inside Neovim
---

| Command | Does |
| --- | --- |
| :e notes.txt | open notes.txt (created on first :w if new) |
| :e! | reload from disk, discarding unsaved changes |
| :e . | simple file browser for the current folder |
| :w backup.txt | write a copy, keep editing the original |
| :saveas new.txt | real "Save As": continue editing the new file |

:::tip Tab completion
Type `:e no` and press **Tab**. Neovim completes file names for you.
:::

# From The Terminal
---
layout: code
subtitle: your terminal always has a current folder
---

```bash title="getting around, then launching nvim"
pwd                   # where am I?
ls                    # what's in this folder?
cd projects           # go into "projects" (cd .. goes up)

nvim notes.txt        # open (or create on first save)
nvim .                # file browser for this folder
nvim +25 app.js       # open with the cursor on line 25
nvim -O a.txt b.txt   # two files, side by side
```

%% ============================================================
%% LESSON 8
%% ============================================================

# Lesson 8
---
layout: section
subtitle: Searching and Replacing
---

Stop counting lines. Say where you want to go.

# Search
---
subtitle: matches highlight live, and wrap around at the end
---

| Key | Does |
| --- | --- |
| /text Enter | search forward (down) |
| ?text Enter | search backward (up) |
| n  /  N | next match, same / opposite direction |
| *  /  # | whole word under the cursor, forward / backward |
| :noh  or  Ctrl+l | clear the search highlights |


# Search Gotchas
---
subtitle: three things that trip beginners
---

| Problem | Fix |
| --- | --- |
| /sky doesn't find Sky | add \c anywhere: /sky\c |

# Substitute
---
subtitle: forget % = current line only · forget g = first match per line only
---

```text
:[range]s/old/new/[flags]        e.g.  :%s/colour/color/g
   │    │  │   │     └─ options (g, c, i, ...)
   │    │  │   └─ the replacement
   │    │  └─ what to find (a pattern)
   │    └─ s for substitute
   └─ which lines (default: current line only)
```

# Flags And Ranges
---
layout: two-cols
subtitle: mix and match
---

| Flag | Meaning |
| --- | --- |
| g | all matches per line |
| c | confirm each (y/n/a/q/l) |
| i / I | ignore case / match case |
| n | only count matches |
| e | no error if nothing found |

::right::

| Range | Lines |
| --- | --- |
| (none) | current line |
| % | whole file |
| 5,10 | lines 5 to 10 |

# Recipes
---
subtitle: practical substitutions
---

| Task | Command |
| --- | --- |
| replace everywhere | :%s/colour/color/g |
| same, ask each time | :%s/colour/color/gc |
| only lines 10 to 40 | :10,40s/oldName/newName/g |
| count TODOs | :%s/TODO//gn |
| inside a selection | select with V, press :, type s/old/new/g |

%% ============================================================
%% LESSON 9
%% ============================================================

# Lesson 9
---
layout: section
subtitle: Working with Multiple Files
---

Buffers, windows and tabs. The names don't mean what you think.

# Three Ideas
---
subtitle: read this slide carefully
---

| Concept | What it is | Analogy |
| --- | --- | --- |
| Buffer | a file loaded in memory | a book on your desk |
| Window | a view onto a buffer | a magnifying glass |
| Tab | a layout of windows | a separate desk |

- One buffer can be shown in zero, one, or many windows
- Closing a window does NOT close the buffer

:::warning Tabs are not browser tabs
**Buffers are your open files.** Use **windows** to see several at once, and **tabs** only for completely separate layouts.
:::

# Buffers
---
subtitle: your open files
---

| Command | Does |
| --- | --- |
| :e file | open a file in a buffer (or switch to it) |
| :ls | list open buffers (+ marks unsaved ones) |
| :bn  /  :bp | next / previous buffer |
| :b 3  /  :b name | go to buffer 3 / by name (Tab completes) |
| :bd | close the current buffer |

:::tip Your file is safe
`:bd` closes the file **in Neovim**. It does **not** delete anything from your disk. `:wa` saves every buffer.
:::

# Windows
---
subtitle: splitting the screen
---

| Command | Shortcut | Does |
| --- | --- | --- |
| :split  /  :sp | Ctrl+w s | split: one above the other |
| :vsplit  /  :vs | Ctrl+w v | split: side by side |
| :close  /  :q | Ctrl+w c | close this window (buffer stays) |
| :only | Ctrl+w o | close all OTHER windows |
|  | Ctrl+w h j k l | move to the window in that direction |
|  | Ctrl+w w | next window (cycles through all) |
|  | Ctrl+w = | make all windows equal size |

# Tabs
---
subtitle: separate layouts (a tab bar appears at the top)
---

| Command | Does |
| --- | --- |
| :tabnew | new empty tab |
| :tabnew file.txt | open file.txt in a new tab |
| gt  /  gT | next / previous tab |
| 2gt | go to tab 2 |
| :tabclose | close this tab |
| :tabonly | close all other tabs |

# A Realistic Workflow
---
subtitle: editing a small website
---

1. nvim index.html                       editing the page
2. :vsplit style.css                     CSS opens on the right
3. Ctrl+w h  /  Ctrl+w l                 hop between them
4. :e script.js  (in the right window)   CSS is still a buffer
5. :ls                                   all three files listed
6. :b style                              CSS is back
7. :tabnew notes.txt, then gt            a separate desk for notes

%% ============================================================
%% LESSON 10
%% ============================================================

# Lesson 10
---
layout: section
subtitle: Neovim Configuration
---

init.lua, a little Lua, options, and key mappings.

# What Is init.lua?
---
subtitle: Lua that runs at startup: your :set commands, made permanent
---

```bash title="create it (first time only)"
# Linux / macOS
mkdir -p ~/.config/nvim && nvim ~/.config/nvim/init.lua
# Windows
mkdir $env:LOCALAPPDATA\nvim; nvim $env:LOCALAPPDATA\nvim\init.lua
# not sure where? inside nvim:  :echo stdpath("config")
```

:::warning Wait a few days first
Learn **plain** Neovim first, so you know what's yours.
:::

# Lua In 60 Seconds
---
layout: code
subtitle: all the Lua you need for now
---

```lua title="the basics"
-- two dashes start a comment
local name = "Neovim"     -- text (string) in quotes
local width = 4           -- numbers are plain
local enabled = true      -- true / false
local fruits = { "apple", "banana" }  -- a table (list)
local opts = { desc = "Save" }        -- a table (named)
print("Hello from Lua!")  -- call a function
```

Neovim gives Lua a `vim` object: `vim.opt`, `vim.keymap`...

# Options
---
subtitle: vim.opt.NAME = VALUE is :set NAME=VALUE, saved for every session
---

```lua title="init.lua: what you see, how you indent"
vim.opt.number = true         -- show line numbers
vim.opt.relativenumber = true -- count from the cursor,
                              -- so you can read off 5j
vim.opt.scrolloff = 8         -- keep 8 lines of context
                              -- above and below cursor
vim.opt.shiftwidth = 2        -- >> and << move 2 columns
vim.opt.expandtab = true      -- the Tab key types spaces
```

:::note Reading an option
`true` / `false` switch it on or off. Numbers and "text" set a value.
:::

# More Options
---
subtitle: search, clipboard and undo
---

```lua title="init.lua: search, clipboard, undo"
vim.opt.ignorecase = true         -- /hello finds Hello
vim.opt.smartcase = true          -- /Hello finds only Hello
vim.opt.clipboard = "unnamedplus" -- y and p share the
                                  -- system clipboard
vim.opt.undofile = true           -- undo survives restarts
```

:::warning Clipboard on Linux needs a helper
Install `wl-clipboard` (Wayland) or `xclip` (X11).
:::

# Key Mappings
---
subtitle: vim.keymap.set(mode, keys, action, options)
---

```lua title="init.lua: your own shortcuts"
vim.g.mapleader = " "      -- Space is <leader>: set FIRST
local map = vim.keymap.set -- short name, shorter lines

-- Normal mode ("n"): Space then w runs :write
map("n", "<leader>w", "<cmd>write<CR>", { desc = "Save" })

-- Visual mode ("x"): > indents, gv selects again
map("x", ">", ">gv", { desc = "Indent, keep selection" })
```

:::note Reading a mapping
`<cmd>...<CR>` runs a command (`<CR>` is Enter). `desc` labels it in `:map`.
:::

%% ============================================================
%% LESSON 11
%% ============================================================

# Lesson 11
---
layout: section
subtitle: Plugins and the Ecosystem
---

An overview. Nothing to install today.

# Plugins And lazy.nvim
---
layout: code
subtitle: community code that adds features, managed by a list in your config
---

```lua title="a plugin list"
require("lazy").setup({
  { "folke/tokyonight.nvim", priority = 1000 },
  { "folke/which-key.nvim", event = "VeryLazy" },
})
```

**lazy.nvim** is the most popular plugin manager (lazy = load only when needed). Each plugin is `"author/repository"` on GitHub. Setup snippet: **lazy.folke.io**.

`:Lazy` opens a window to install, update and inspect plugins.

# Ecosystem: Code
---
subtitle: plugins that help Neovim understand your code
---

:::note LSP (Language Server Protocol) · nvim-lspconfig, mason
A language server reads your project. Neovim asks it for definitions, errors and renames.
:::

:::note Treesitter · nvim-treesitter
Parses code into a tree, so colours and indenting follow the real syntax.
:::

:::note Completion · blink.cmp, nvim-cmp
Suggestions as you type, from the language server, the file and snippets.
:::

# Ecosystem: Workflow
---
subtitle: plugins for finding files and seeing your changes
---

:::tip Fuzzy finder · telescope, fzf-lua
Type a few letters to jump anywhere: `usrctl` finds `userController.js`.
:::

:::tip File explorer · oil.nvim, neo-tree
Browse folders. In oil, rename or delete files by editing the list as text.
:::

:::tip Git · gitsigns, fugitive
gitsigns marks changed lines in the margin. fugitive runs Git from Neovim.
:::

# Try The Built-ins First
---
subtitle: Neovim already does a lot
---

| Built-in | Try it |
| --- | --- |
| file browser (netrw) | nvim .  then j/k, Enter opens, - goes up |
| basic completion | Insert mode, type part of a word, Ctrl+n |
| commenting | gcc in a code file (again to uncomment) |
| LSP client | built in, just needs a language server |

:::tip Fewer plugins
Fewer things to break, less to learn at once.
:::

# Starter Configs
---
subtitle: when you're ready for plugins
---

| Project | What it is | Best for |
| --- | --- | --- |
| kickstart.nvim | one heavily commented init.lua | LEARNING (start here) |
| LazyVim | a complete, polished distribution | a full IDE quickly |

:::danger Don't copy a giant config on day one
Hundreds of keybindings you don't know, errors you can't debug. Add **one plugin at a time**, only when you feel the need.
:::

%% ============================================================
%% CHEAT SHEET
%% ============================================================

# Cheat Sheet
---
layout: section
subtitle: the essentials on six slides
---

Take a photo.

# Cheat Sheet - Modes
---
subtitle: from Normal mode
---

| Key | Action |
| --- | --- |
| Esc | back to Normal mode (from anywhere) |
| i  /  a | insert before / after the cursor |
| I  /  A | insert at start / end of line |
| o  /  O | open a new line below / above |
| v  /  V  /  Ctrl+v | visual: characters / lines / block |
| : | command-line mode |

# Cheat Sheet - Movement
---
subtitle: from Normal mode
---

| Key | Action |
| --- | --- |
| h j k l | left, down, up, right |
| w  /  b  /  e | next word / back a word / end of word |
| 0  /  ^  /  $ | line start / first non-blank / line end |
| gg  /  G | first line / last line |
| 10G  or  :10 | go to line 10 |
| Ctrl+d  /  Ctrl+u | half page down / up |

# Cheat Sheet - Editing
---
subtitle: from Normal mode
---

| Key | Action |
| --- | --- |
| x | delete character |
| dd  /  yy  /  cc | delete / yank / change line |
| D  /  C  /  Y | delete / change / yank to end of line |
| p  /  P | paste after / before |
| r + char | replace one character |
| u  /  Ctrl+r | undo / redo |
| . | repeat last change |
| >>  /  << | indent / unindent line |

# Cheat Sheet - Grammar
---
subtitle: [count] operator (motion or text object)
---

| Operators | Motions | Text objects |
| --- | --- | --- |
| d  delete | w b e  words | iw / aw  word |
| c  change | 0 ^ $  line positions | i" / a"  double quotes |
| y  yank | gg G  file | i) / a)  parentheses |
| > <  indent | /text  search | i' / a'  single quotes |
| gU gu  case |  | i] i}  brackets, braces |

Examples: `d3w` · `ci"` · `y$` · `gUiw`

# Cheat Sheet - Search
---
subtitle: find and replace
---

| Command | Action |
| --- | --- |
| /text  /  ?text | search forward / backward |
| n  /  N | next / previous match |
| *  /  # | word under cursor, forward / backward |
| :noh | clear highlights |
| :%s/old/new/g | replace all in the file |
| :%s/old/new/gc | replace all, confirm each |

# Cheat Sheet - Files
---
subtitle: buffers, windows, tabs, help
---

| Command | Action |
| --- | --- |
| :w  :q  :wq  :q! | save / quit / save+quit / quit, no save |
| :e file | open a file |
| :ls  :bn  :bp  :bd | list / next / prev / close buffer |
| :sp  /  :vs | split / vertical split |
| Ctrl+w h j k l | move between windows |
| :tabnew  gt  gT | new tab / next / previous |
| :help topic  ·  :Tutor | help · interactive tutorial |

%% ============================================================
%% MISTAKES
%% ============================================================

Rebuild slowly, adding only what you understand.

%% ============================================================
%% LEARNING PATH
%% ============================================================

# What Next?
---
layout: section
subtitle: Recommended Learning Path
---

Little and often: 15–30 minutes a day beats one weekend.

# The Path
---
subtitle: five stages
---

| Stage | When | Focus |
| --- | --- | --- |
| 1. Get comfortable | week 1 | Lessons 1-5, :Tutor, small edits |
| 2. Build fluency | weeks 2-3 | Lessons 6-9, real work |
| 3. Personalize | weeks 3-4 | Lesson 10, a small init.lua |
| 4. Power features | month 2 | registers, macros, marks |
| 5. Grow into an IDE | when ready | kickstart.nvim, plugins slowly |

# Next Motions To Learn
---
subtitle: one or two per day
---

| Command | What it does |
| --- | --- |
| f{c}  t{c} | jump to / just before character c |
| ;  , | repeat last f/t forward / backward |
| % | jump between matching brackets |
| {  } | previous / next blank line |
| Ctrl+o  Ctrl+i | jump back / forward in history |
| ip  ap | paragraph text objects (dap) |
| it  at | HTML tag text objects |

%% ============================================================
%% RESOURCES
%% ============================================================

# Built-In Help
---
subtitle: always available, even offline
---

| Resource | How to open it |
| --- | --- |
| interactive tutorial | :Tutor  (or nvim +Tutor) |
| the help system | :help  or  :help text-objects |
| the user manual | :help user-manual |
| Lua guide | :help lua-guide |
| health check | :checkhealth |

:::tip Inside help
**Ctrl+]** follows a link, **Ctrl+o** goes back, `:q` closes help.
:::

# Happy Editing
---
layout: cover
hideHeader: true
hideFooter: true
---

Learn the **language**, not a list of shortcuts.

Keep asking: *is there a better way to do what I just did?*

::space:1::

```text
Esc   :wq   Enter
```
