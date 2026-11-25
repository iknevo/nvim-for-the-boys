import { describe, expect, test } from "bun:test"
import { Effect } from "effect"
import { builtInThemeNames, loadDeckUserConfig, resolveDeckConfig, type DeckUserConfig } from "../src/config"

const resolve = (config?: DeckUserConfig, options?: { readonly themeOverride?: string }) =>
  Effect.runPromise(resolveDeckConfig(config, options))

describe("resolveDeckConfig", () => {
  test("uses the midnight theme and default keybindings by default", async () => {
    const config = await resolve()

    expect(config.themeName).toBe("midnight")
    expect(config.keybindings.next).toEqual(["n", "space", "return", "right"])
    expect(config.theme.colors.appBackground).toBe("#070A12")
  })

  test("allows user keybindings to override one command without replacing the rest", async () => {
    const config = await resolve({
      keybindings: {
        next: ["j"],
      },
    })

    expect(config.keybindings.next).toEqual(["j"])
    expect(config.keybindings.previous).toEqual(["p", "backspace", "left"])
  })

  test("selects built-in themes", async () => {
    const config = await resolve({ theme: "ember" })

    expect(config.themeName).toBe("ember")
    expect(config.theme.colors.appBackground).toBe("#100B08")
    expect(config.theme.colors.progress).toBe("#FB923C")
  })

  test("includes OpenCode built-in themes", async () => {
    expect(builtInThemeNames).toContain("catppuccin")
    expect(builtInThemeNames).toContain("tokyonight")
    expect(builtInThemeNames).toContain("gruvbox")
    expect(builtInThemeNames).toContain("nord")
    expect(builtInThemeNames).toContain("dracula")

    const config = await resolve({ theme: "tokyonight" })

    expect(config.themeName).toBe("tokyonight")
    expect(config.theme.colors.appBackground).toBe("#1a1b26")
    expect(config.theme.colors.progress).toBe("#7aa2f7")
  })

  test("lets the cli theme override the config theme", async () => {
    const config = await resolve({ theme: "ember" }, { themeOverride: "midnight" })

    expect(config.themeName).toBe("midnight")
    expect(config.theme.colors.appBackground).toBe("#070A12")
  })

  test("merges custom themes over the midnight theme", async () => {
    const config = await resolve({
      theme: "paper",
      themes: {
        paper: {
          extends: "midnight",
          colors: {
            appBackground: "#FAF7EF",
            title: "#111111",
          },
          layout: {
            stageWidth: "90%",
          },
          syntax: {
            default: { fg: "#111111" },
          },
        },
      },
    })

    expect(config.themeName).toBe("paper")
    expect(config.theme.colors.appBackground).toBe("#FAF7EF")
    expect(config.theme.colors.progress).toBe("#38BDF8")
    expect(config.theme.layout.stageWidth).toBe("90%")
    expect(config.theme.layout.stageMaxWidth).toBe(136)
    expect(config.theme.syntax.default).toEqual({ fg: "#111111" })
  })

  test("lets custom themes extend built-in themes", async () => {
    const config = await resolve({
      theme: "ember-wide",
      themes: {
        "ember-wide": {
          extends: "ember",
          layout: {
            stageWidth: "95%",
          },
        },
      },
    })

    expect(config.theme.colors.appBackground).toBe("#100B08")
    expect(config.theme.colors.progress).toBe("#FB923C")
    expect(config.theme.layout.stageWidth).toBe("95%")
  })

  test("fails on unknown themes", async () => {
    try {
      await resolve(undefined, { themeOverride: "missing" })
      throw new Error("Expected resolveDeckConfig to fail")
    } catch (error) {
      expect(error).toMatchObject({
        _tag: "UnknownTheme",
        theme: "missing",
      })
    }
  })
})

describe("loadDeckUserConfig", () => {
  test("returns undefined when no config file exists", async () => {
    const config = await Effect.runPromise(loadDeckUserConfig("test/fixtures/missing.config.ts"))

    expect(config).toBeUndefined()
  })

  test("loads a deck config module", async () => {
    const config = await Effect.runPromise(loadDeckUserConfig("test/fixtures/deck.config.ts"))

    expect(config).toEqual({
      theme: "ember",
      keybindings: {
        quit: ["x"],
      },
    })
  })
})
