export const IpcEvents = {
  StoreGetRepos: 'store-get-repos',
  StoreSetRepos: 'store-set-repos',
  StoreGetTheme: 'store-get-theme',
  StoreSetTheme: 'store-set-theme',
  StoreGetEditors: 'store-get-editors',
  StoreSetEditors: 'store-set-editors',
  CloseWindow: 'close-window',
  SelectDirectory: 'select-directory',
  LaunchTerminal: 'launch-terminal',
  LaunchCursor: 'launch-cursor',
  LaunchVscode: 'launch-vscode',
  LaunchIdea: 'launch-idea'
} as const
