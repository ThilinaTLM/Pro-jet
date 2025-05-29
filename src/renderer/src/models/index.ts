export type Repo = {
  label: string
  path: string
  lastOpened: Date
}

export type AppConfig = {
  repos: Repo[]
}