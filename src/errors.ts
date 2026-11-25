import { Data } from "effect"

export class UnterminatedCodeFence extends Data.TaggedError("UnterminatedCodeFence")<{
  readonly startLine: number
  readonly language: string
  readonly message: string
}> {}

export type ParseError = UnterminatedCodeFence

export class MissingFileArgument extends Data.TaggedError("MissingFileArgument")<{
  readonly message: string
}> {}

export class FileReadError extends Data.TaggedError("FileReadError")<{
  readonly path: string
  readonly cause: unknown
  readonly message: string
}> {}

export class RendererStartError extends Data.TaggedError("RendererStartError")<{
  readonly cause: unknown
  readonly message: string
}> {}

export class ConfigLoadError extends Data.TaggedError("ConfigLoadError")<{
  readonly path: string
  readonly cause: unknown
  readonly message: string
}> {}

export class InvalidConfigError extends Data.TaggedError("InvalidConfigError")<{
  readonly path: string
  readonly message: string
}> {}

export class UnknownTheme extends Data.TaggedError("UnknownTheme")<{
  readonly theme: string
  readonly availableThemes: ReadonlyArray<string>
  readonly message: string
}> {}

export class MissingThemeArgument extends Data.TaggedError("MissingThemeArgument")<{
  readonly message: string
}> {}

export type ConfigError = ConfigLoadError | InvalidConfigError | UnknownTheme

export type CliError = ParseError | MissingFileArgument | MissingThemeArgument | FileReadError | RendererStartError | ConfigError
