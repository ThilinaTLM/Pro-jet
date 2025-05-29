export type Repo = {
  label: string
  path: string
  lastOpened: Date
}

export type EditorConfig = {
  cursor: string
  vscode: string
  idea: string
  terminal: string[]
}

export type AppConfig = {
  theme: 'light' | 'dark'
  repos: Repo[]
  editors: EditorConfig
}
