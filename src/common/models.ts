export type Repo = {
  label: string
  path: string
  lastOpened: Date
}

export type AppConfig = {
  theme: 'light' | 'dark'
  repos: Repo[]
}
