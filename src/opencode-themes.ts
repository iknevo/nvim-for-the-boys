import type { DeckTheme } from "./config"

interface OpenCodePalette {
  readonly neutral: string
  readonly ink: string
  readonly primary: string
  readonly accent: string
  readonly success: string
  readonly warning: string
  readonly error: string
  readonly info: string
  readonly syntaxComment?: string
  readonly syntaxKeyword?: string
  readonly syntaxString?: string
  readonly syntaxPrimitive?: string
  readonly syntaxProperty?: string
  readonly syntaxType?: string
  readonly syntaxConstant?: string
}

const palettes = {
  "oc-2": { neutral: "#1f1f1f", ink: "#f1ece8", primary: "#fab283", accent: "#edb2f1", success: "#12c905", warning: "#fcd53a", error: "#fc533a", info: "#edb2f1", syntaxComment: "#8f8f8f", syntaxKeyword: "#edb2f1", syntaxString: "#00ceb9", syntaxPrimitive: "#8cb0ff", syntaxProperty: "#fab283", syntaxType: "#fcd53a", syntaxConstant: "#93e9f6" },
  amoled: { neutral: "#000000", ink: "#ffffff", primary: "#b388ff", accent: "#ff4081", success: "#00ff88", warning: "#ffea00", error: "#ff1744", info: "#18ffff", syntaxComment: "#555555", syntaxKeyword: "#ff00ff", syntaxString: "#00ff88", syntaxPrimitive: "#18ffff", syntaxProperty: "#ffea00", syntaxConstant: "#b388ff" },
  aura: { neutral: "#15141b", ink: "#edecee", primary: "#a277ff", accent: "#ff6767", success: "#61ffca", warning: "#ffca85", error: "#ff6767", info: "#82e2ff", syntaxComment: "#6d6a7e", syntaxKeyword: "#a277ff", syntaxString: "#61ffca", syntaxPrimitive: "#82e2ff", syntaxProperty: "#ffca85", syntaxType: "#61ffca", syntaxConstant: "#ff6767" },
  ayu: { neutral: "#0f1419", ink: "#d6dae0", primary: "#3fb7e3", accent: "#f2856f", success: "#78d05c", warning: "#e4a75c", error: "#f58572", info: "#66c6f1", syntaxComment: "#5a6673", syntaxKeyword: "#ff8f40", syntaxString: "#aad94c", syntaxPrimitive: "#ffb454", syntaxProperty: "#39bae6", syntaxType: "#59c2ff", syntaxConstant: "#d2a6ff" },
  carbonfox: { neutral: "#393939", ink: "#f2f4f8", primary: "#33b1ff", accent: "#ff8389", success: "#42be65", warning: "#f1c21b", error: "#ff8389", info: "#78a9ff", syntaxComment: "#6f6f6f", syntaxKeyword: "#be95ff", syntaxString: "#42be65", syntaxPrimitive: "#33b1ff", syntaxProperty: "#78a9ff", syntaxType: "#f1c21b", syntaxConstant: "#ff8389" },
  catppuccin: { neutral: "#1e1e2e", ink: "#cdd6f4", primary: "#b4befe", accent: "#f38ba8", success: "#a6d189", warning: "#f4b8e4", error: "#f38ba8", info: "#89dceb", syntaxComment: "#6c7086", syntaxKeyword: "#cba6f7", syntaxPrimitive: "#89b4fa", syntaxConstant: "#fab387" },
  "catppuccin-frappe": { neutral: "#303446", ink: "#c6d0f5", primary: "#8da4e2", accent: "#f4b8e4", success: "#a6d189", warning: "#e5c890", error: "#e78284", info: "#81c8be", syntaxComment: "#949cb8", syntaxKeyword: "#ca9ee6", syntaxString: "#a6d189", syntaxPrimitive: "#8da4e2", syntaxProperty: "#99d1db", syntaxType: "#e5c890", syntaxConstant: "#ef9f76" },
  "catppuccin-macchiato": { neutral: "#24273a", ink: "#cad3f5", primary: "#8aadf4", accent: "#f5bde6", success: "#a6da95", warning: "#eed49f", error: "#ed8796", info: "#8bd5ca", syntaxComment: "#939ab7", syntaxKeyword: "#c6a0f6", syntaxString: "#a6da95", syntaxPrimitive: "#8aadf4", syntaxProperty: "#91d7e3", syntaxType: "#eed49f", syntaxConstant: "#f5a97f" },
  cobalt2: { neutral: "#193549", ink: "#ffffff", primary: "#0088ff", accent: "#2affdf", success: "#9eff80", warning: "#ffc600", error: "#ff0088", info: "#ff9d00", syntaxComment: "#0088ff", syntaxKeyword: "#ff9d00", syntaxString: "#9eff80", syntaxPrimitive: "#ffc600", syntaxProperty: "#2affdf", syntaxType: "#2affdf", syntaxConstant: "#ff628c" },
  cursor: { neutral: "#181818", ink: "#e4e4e4", primary: "#88c0d0", accent: "#88c0d0", success: "#3fa266", warning: "#f1b467", error: "#e34671", info: "#81a1c1", syntaxComment: "#e4e4e45e", syntaxKeyword: "#82D2CE", syntaxString: "#E394DC", syntaxPrimitive: "#EFB080", syntaxProperty: "#81a1c1", syntaxType: "#EFB080", syntaxConstant: "#F8C762" },
  dracula: { neutral: "#1d1e28", ink: "#f8f8f2", primary: "#bd93f9", accent: "#ff79c6", success: "#50fa7b", warning: "#ffb86c", error: "#ff5555", info: "#8be9fd", syntaxComment: "#6272a4", syntaxKeyword: "#ff79c6", syntaxString: "#f1fa8c", syntaxPrimitive: "#50fa7b", syntaxProperty: "#8be9fd", syntaxConstant: "#bd93f9" },
  everforest: { neutral: "#2d353b", ink: "#d3c6aa", primary: "#a7c080", accent: "#d699b6", success: "#a7c080", warning: "#e69875", error: "#e67e80", info: "#83c092", syntaxComment: "#7a8478", syntaxKeyword: "#d699b6", syntaxString: "#a7c080", syntaxPrimitive: "#a7c080", syntaxProperty: "#83c092", syntaxType: "#dbbc7f", syntaxConstant: "#e69875" },
  flexoki: { neutral: "#100F0F", ink: "#CECDC3", primary: "#DA702C", accent: "#8B7EC8", success: "#879A39", warning: "#DA702C", error: "#D14D41", info: "#3AA99F", syntaxComment: "#6F6E69", syntaxKeyword: "#879A39", syntaxString: "#3AA99F", syntaxPrimitive: "#DA702C", syntaxProperty: "#3AA99F", syntaxType: "#D0A215", syntaxConstant: "#8B7EC8" },
  github: { neutral: "#0d1117", ink: "#c9d1d9", primary: "#58a6ff", accent: "#39c5cf", success: "#3fb950", warning: "#e3b341", error: "#f85149", info: "#d29922", syntaxComment: "#8b949e", syntaxKeyword: "#ff7b72", syntaxString: "#39c5cf", syntaxPrimitive: "#bc8cff", syntaxProperty: "#39c5cf", syntaxType: "#d29922", syntaxConstant: "#58a6ff" },
  gruvbox: { neutral: "#282828", ink: "#ebdbb2", primary: "#83a598", accent: "#fb4934", success: "#b8bb26", warning: "#fabd2f", error: "#fb4934", info: "#d3869b", syntaxComment: "#928374", syntaxKeyword: "#fb4934", syntaxPrimitive: "#83a598", syntaxConstant: "#d3869b" },
  kanagawa: { neutral: "#1F1F28", ink: "#DCD7BA", primary: "#7E9CD8", accent: "#D27E99", success: "#98BB6C", warning: "#D7A657", error: "#E82424", info: "#76946A", syntaxComment: "#727169", syntaxKeyword: "#957FB8", syntaxString: "#98BB6C", syntaxPrimitive: "#7E9CD8", syntaxProperty: "#76946A", syntaxType: "#C38D9D", syntaxConstant: "#D7A657" },
  "lucent-orng": { neutral: "#2a1a15", ink: "#eeeeee", primary: "#EC5B2B", accent: "#FFF7F1", success: "#6ba1e6", warning: "#EC5B2B", error: "#e06c75", info: "#56b6c2", syntaxComment: "#808080", syntaxKeyword: "#EC5B2B", syntaxString: "#6ba1e6", syntaxPrimitive: "#EE7948", syntaxProperty: "#56b6c2", syntaxType: "#e5c07b", syntaxConstant: "#FFF7F1" },
  material: { neutral: "#263238", ink: "#eeffff", primary: "#82aaff", accent: "#89ddff", success: "#c3e88d", warning: "#ffcb6b", error: "#f07178", info: "#ffcb6b", syntaxComment: "#546e7a", syntaxKeyword: "#c792ea", syntaxString: "#c3e88d", syntaxPrimitive: "#82aaff", syntaxProperty: "#c792ea", syntaxType: "#ffcb6b", syntaxConstant: "#ffcb6b" },
  matrix: { neutral: "#0a0e0a", ink: "#62ff94", primary: "#2eff6a", accent: "#c770ff", success: "#62ff94", warning: "#e6ff57", error: "#ff4b4b", info: "#30b3ff", syntaxComment: "#8ca391", syntaxKeyword: "#c770ff", syntaxString: "#1cc24b", syntaxPrimitive: "#30b3ff", syntaxProperty: "#24f6d9", syntaxType: "#e6ff57", syntaxConstant: "#ffa83d" },
  mercury: { neutral: "#171721", ink: "#dddde5", primary: "#8da4f5", accent: "#8da4f5", success: "#77c599", warning: "#fc9b6f", error: "#fc92b4", info: "#77becf", syntaxComment: "#9d9da8", syntaxKeyword: "#8da4f5", syntaxString: "#77c599", syntaxPrimitive: "#8da4f5", syntaxProperty: "#a7b6f8", syntaxType: "#77becf", syntaxConstant: "#fc9b6f" },
  monokai: { neutral: "#272822", ink: "#f8f8f2", primary: "#ae81ff", accent: "#f92672", success: "#a6e22e", warning: "#fd971f", error: "#f92672", info: "#66d9ef", syntaxComment: "#75715e", syntaxKeyword: "#f92672", syntaxString: "#e6db74", syntaxPrimitive: "#a6e22e", syntaxProperty: "#66d9ef", syntaxConstant: "#ae81ff" },
  nightowl: { neutral: "#011627", ink: "#d6deeb", primary: "#82aaff", accent: "#f78c6c", success: "#c5e478", warning: "#ecc48d", error: "#ef5350", info: "#82aaff", syntaxComment: "#637777", syntaxKeyword: "#c792ea", syntaxString: "#ecc48d", syntaxPrimitive: "#82aaff", syntaxConstant: "#f78c6c" },
  nord: { neutral: "#2e3440", ink: "#e5e9f0", primary: "#88c0d0", accent: "#d57780", success: "#a3be8c", warning: "#d08770", error: "#bf616a", info: "#81a1c1", syntaxComment: "#616e88", syntaxKeyword: "#81a1c1", syntaxPrimitive: "#88c0d0", syntaxConstant: "#b48ead" },
  "one-dark": { neutral: "#282c34", ink: "#abb2bf", primary: "#61afef", accent: "#56b6c2", success: "#98c379", warning: "#e5c07b", error: "#e06c75", info: "#d19a66", syntaxComment: "#5c6370", syntaxKeyword: "#c678dd", syntaxString: "#98c379", syntaxPrimitive: "#61afef", syntaxProperty: "#56b6c2", syntaxType: "#e5c07b", syntaxConstant: "#d19a66" },
  onedarkpro: { neutral: "#1e222a", ink: "#abb2bf", primary: "#61afef", accent: "#e06c75", success: "#98c379", warning: "#e5c07b", error: "#e06c75", info: "#56b6c2", syntaxComment: "#5c6370", syntaxKeyword: "#c678dd", syntaxPrimitive: "#61afef", syntaxConstant: "#d19a66" },
  opencode: { neutral: "#0a0a0a", ink: "#eeeeee", primary: "#fab283", accent: "#9d7cd8", success: "#7fd88f", warning: "#f5a742", error: "#e06c75", info: "#56b6c2", syntaxComment: "#808080", syntaxKeyword: "#9d7cd8", syntaxString: "#7fd88f", syntaxPrimitive: "#fab283", syntaxProperty: "#56b6c2", syntaxType: "#e5c07b", syntaxConstant: "#f5a742" },
  orng: { neutral: "#0a0a0a", ink: "#eeeeee", primary: "#EC5B2B", accent: "#FFF7F1", success: "#6ba1e6", warning: "#EC5B2B", error: "#e06c75", info: "#56b6c2", syntaxComment: "#808080", syntaxKeyword: "#EC5B2B", syntaxString: "#6ba1e6", syntaxPrimitive: "#EE7948", syntaxProperty: "#56b6c2", syntaxType: "#e5c07b", syntaxConstant: "#FFF7F1" },
  "osaka-jade": { neutral: "#111c18", ink: "#C1C497", primary: "#2DD5B7", accent: "#549e6a", success: "#549e6a", warning: "#E5C736", error: "#FF5345", info: "#2DD5B7", syntaxComment: "#53685B", syntaxKeyword: "#2DD5B7", syntaxString: "#63b07a", syntaxPrimitive: "#509475", syntaxProperty: "#549e6a", syntaxType: "#549e6a", syntaxConstant: "#D2689C" },
  palenight: { neutral: "#292d3e", ink: "#a6accd", primary: "#82aaff", accent: "#89ddff", success: "#c3e88d", warning: "#ffcb6b", error: "#f07178", info: "#f78c6c", syntaxComment: "#676e95", syntaxKeyword: "#c792ea", syntaxString: "#c3e88d", syntaxPrimitive: "#82aaff", syntaxProperty: "#89ddff", syntaxType: "#ffcb6b", syntaxConstant: "#f78c6c" },
  rosepine: { neutral: "#191724", ink: "#e0def4", primary: "#9ccfd8", accent: "#ebbcba", success: "#31748f", warning: "#f6c177", error: "#eb6f92", info: "#9ccfd8", syntaxComment: "#6e6a86", syntaxKeyword: "#31748f", syntaxString: "#f6c177", syntaxPrimitive: "#ebbcba", syntaxProperty: "#ebbcba", syntaxType: "#9ccfd8", syntaxConstant: "#c4a7e7" },
  shadesofpurple: { neutral: "#1a102b", ink: "#f5f0ff", primary: "#c792ff", accent: "#ff7ac6", success: "#7be0b0", warning: "#ffd580", error: "#ff7ac6", info: "#7dd4ff", syntaxComment: "#b362ff", syntaxKeyword: "#ff9d00", syntaxString: "#a5ff90", syntaxPrimitive: "#fb94ff", syntaxProperty: "#9effff", syntaxType: "#fad000", syntaxConstant: "#ff628c" },
  solarized: { neutral: "#002b36", ink: "#93a1a1", primary: "#6c71c4", accent: "#d33682", success: "#859900", warning: "#b58900", error: "#dc322f", info: "#2aa198", syntaxComment: "#586e75", syntaxKeyword: "#859900", syntaxString: "#2aa198", syntaxPrimitive: "#268bd2", syntaxProperty: "#268bd2", syntaxConstant: "#d33682" },
  synthwave84: { neutral: "#262335", ink: "#ffffff", primary: "#36f9f6", accent: "#b084eb", success: "#72f1b8", warning: "#fede5d", error: "#fe4450", info: "#ff8b39", syntaxComment: "#848bbd", syntaxKeyword: "#ff7edb", syntaxString: "#fede5d", syntaxPrimitive: "#ff8b39", syntaxProperty: "#b084eb", syntaxType: "#36f9f6", syntaxConstant: "#b084eb" },
  tokyonight: { neutral: "#1a1b26", ink: "#c0caf5", primary: "#7aa2f7", accent: "#ff9e64", success: "#9ece6a", warning: "#e0af68", error: "#f7768e", info: "#7dcfff", syntaxComment: "#565f89", syntaxKeyword: "#bb9af7", syntaxPrimitive: "#7aa2f7", syntaxProperty: "#7dcfff", syntaxConstant: "#ff9e64" },
  vercel: { neutral: "#000000", ink: "#EDEDED", primary: "#0070F3", accent: "#8E4EC6", success: "#46A758", warning: "#FFB224", error: "#E5484D", info: "#52A8FF", syntaxComment: "#878787", syntaxKeyword: "#F75590", syntaxString: "#63C46D", syntaxPrimitive: "#BF7AF0", syntaxProperty: "#0AC7AC", syntaxType: "#0AC7AC", syntaxConstant: "#F2A700" },
  vesper: { neutral: "#101010", ink: "#FFF", primary: "#FFC799", accent: "#FF8080", success: "#99FFE4", warning: "#FFC799", error: "#FF8080", info: "#FFC799", syntaxComment: "#8b8b8b", syntaxKeyword: "#a0a0a0", syntaxString: "#99ffe4", syntaxPrimitive: "#ffc799", syntaxProperty: "#ffffff", syntaxType: "#ffc799", syntaxConstant: "#ffc799" },
  zenburn: { neutral: "#3f3f3f", ink: "#dcdccc", primary: "#8cd0d3", accent: "#93e0e3", success: "#7f9f7f", warning: "#f0dfaf", error: "#cc9393", info: "#dfaf8f", syntaxComment: "#7f9f7f", syntaxKeyword: "#f0dfaf", syntaxString: "#cc9393", syntaxPrimitive: "#8cd0d3", syntaxProperty: "#93e0e3", syntaxType: "#93e0e3", syntaxConstant: "#8fb28f" },
} satisfies Record<string, OpenCodePalette>

export const openCodeThemeNames = Object.keys(palettes)

export function createOpenCodeThemes(base: DeckTheme): Readonly<Record<string, DeckTheme>> {
  const fromPalette = (palette: OpenCodePalette): DeckTheme => ({
    colors: {
      appBackground: palette.neutral,
      chrome: palette.primary,
      chromeMuted: palette.syntaxComment ?? palette.ink,
      text: palette.ink,
      title: palette.primary,
      titleAccent: palette.accent,
      codeBackground: palette.neutral,
      codeBorder: palette.primary,
      codeHighlight: palette.neutral,
      calloutNote: palette.info,
      calloutTip: palette.success,
      calloutWarning: palette.warning,
      calloutDanger: palette.error,
      tableBorder: palette.syntaxComment ?? palette.primary,
      tableHeader: palette.primary,
      muted: palette.syntaxComment ?? palette.ink,
      footer: palette.ink,
      progress: palette.primary,
      helpBorder: palette.syntaxComment ?? palette.primary,
      helpText: palette.ink,
    },
    layout: { ...base.layout },
    syntax: {
      default: { fg: palette.ink },
      keyword: { fg: palette.syntaxKeyword ?? palette.accent, bold: true },
      string: { fg: palette.syntaxString ?? palette.success },
      comment: { fg: palette.syntaxComment ?? palette.ink, italic: true },
      number: { fg: palette.syntaxConstant ?? palette.warning },
      function: { fg: palette.syntaxProperty ?? palette.primary },
      type: { fg: palette.syntaxType ?? palette.warning },
      "markup.heading": { fg: palette.primary, bold: true },
      "markup.heading.1": { fg: palette.accent, bold: true },
      "markup.heading.2": { fg: palette.info, bold: true },
      "markup.bold": { fg: palette.ink, bold: true },
      "markup.italic": { fg: palette.ink, italic: true },
      "markup.raw": { fg: palette.syntaxString ?? palette.success, bg: palette.neutral },
      "markup.raw.block": { fg: palette.syntaxString ?? palette.success, bg: palette.neutral },
      "markup.raw.inline": { fg: palette.warning, bg: palette.neutral },
      "markup.link": { fg: palette.info, underline: true },
      "markup.quote": { fg: palette.syntaxComment ?? palette.ink, italic: true },
      "markup.list": { fg: palette.primary },
      conceal: { fg: palette.syntaxComment ?? palette.ink },
    },
  })

  return Object.fromEntries(Object.entries(palettes).map(([name, palette]) => [name, fromPalette(palette)]))
}
