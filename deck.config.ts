import type { DeckUserConfig } from "./src/config"

const black = "#000000"
const white = "#FFFFFF"

export default {
  theme: "void",
  themes: {
    // Absolute black background, white foreground, grayscale accents.
    // Callouts keep a soft tint so note / tip / warning / danger stay distinguishable.
    void: {
      extends: "midnight",
      colors: {
        appBackground: black,
        text: white,
        title: white,
        titleAccent: "#BDBDBD",
        chrome: "#E0E0E0",
        chromeMuted: "#5C5C5C",
        muted: "#8A8A8A",
        footer: "#8A8A8A",
        progress: white,
        codeBackground: "#0A0A0A",
        codeBorder: "#333333",
        codeHighlight: "#1C1C1C",
        tableBorder: "#3D3D3D",
        tableHeader: white,
        helpBorder: "#3D3D3D",
        helpText: "#E0E0E0",
        calloutNote: "#C8C8C8",
        calloutTip: "#9FE0B0",
        calloutWarning: "#F0D58C",
        calloutDanger: "#F29B9B",
      },
      // Tighter stage so slides still fit when the terminal font is zoomed for presenting.
      layout: {
        stageWidth: "90%",
        stagePaddingX: 2,
        stagePaddingY: 1,
      },
      syntax: {
        default: { fg: white },
        keyword: { fg: white, bold: true },
        string: { fg: "#C8C8C8" },
        comment: { fg: "#6E6E6E", italic: true },
        number: { fg: "#E0E0E0" },
        function: { fg: white, bold: true },
        type: { fg: "#D6D6D6", italic: true },
        "markup.heading": { fg: white, bold: true },
        "markup.heading.1": { fg: white, bold: true },
        "markup.heading.2": { fg: white, bold: true },
        "markup.bold": { fg: white, bold: true },
        "markup.italic": { fg: "#D6D6D6", italic: true },
        "markup.raw": { fg: white, bg: "#1A1A1A" },
        "markup.raw.block": { fg: white, bg: "#0A0A0A" },
        "markup.raw.inline": { fg: white, bg: "#262626" },
        "markup.link": { fg: white, underline: true },
        "markup.quote": { fg: "#BDBDBD", italic: true },
        "markup.list": { fg: "#8A8A8A" },
        conceal: { fg: "#5C5C5C" },
      },
    },
  },
  keybindings: {
    next: ["k"],
    previous: ["j"],
    quit: ["q"]
  },
} satisfies DeckUserConfig
