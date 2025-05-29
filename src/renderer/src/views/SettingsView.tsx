import { useState, useEffect } from 'react'
import Header from '@renderer/components/common/Header'
import { EditorConfig } from '@common/models'
import { Button } from '@renderer/components/ui/button'
import { ScrollArea } from '@renderer/components/ui/scroll-area'
import { useTheme } from '@renderer/components/context/ThemeProvider'

const SettingsView = () => {
  const { theme, setTheme } = useTheme()
  const [editors, setEditors] = useState<EditorConfig>({
    cursor: 'cursor',
    vscode: 'code',
    idea: 'idea',
    terminal: ['gnome-terminal', 'konsole', 'xfce4-terminal', 'alacritty', 'kitty', 'xterm']
  })
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)

  // Load settings on component mount
  useEffect(() => {
    const loadSettings = async () => {
      try {
        const [currentTheme, currentEditors] = await Promise.all([
          window.api.store.getTheme(),
          window.api.store.getEditors()
        ])
        setTheme(currentTheme)
        setEditors(currentEditors)
      } catch (error) {
        console.error('Failed to load settings:', error)
      } finally {
        setIsLoading(false)
      }
    }

    loadSettings()
  }, [])

  const handleThemeChange = async (newTheme: 'light' | 'dark' | 'system') => {
    setTheme(newTheme)
    try {
      await window.api.store.setTheme(newTheme)
    } catch (error) {
      console.error('Failed to save theme:', error)
    }
  }

  const handleEditorChange = (editorType: keyof EditorConfig, value: string | string[]) => {
    setEditors((prev) => ({
      ...prev,
      [editorType]: value
    }))
  }

  const handleTerminalAdd = () => {
    setEditors((prev) => ({
      ...prev,
      terminal: [...prev.terminal, '']
    }))
  }

  const handleTerminalRemove = (index: number) => {
    setEditors((prev) => ({
      ...prev,
      terminal: prev.terminal.filter((_, i) => i !== index)
    }))
  }

  const handleTerminalChange = (index: number, value: string) => {
    setEditors((prev) => ({
      ...prev,
      terminal: prev.terminal.map((term, i) => (i === index ? value : term))
    }))
  }

  const saveEditorSettings = async () => {
    setIsSaving(true)
    try {
      await window.api.store.setEditors(editors)
    } catch (error) {
      console.error('Failed to save editor settings:', error)
    } finally {
      setIsSaving(false)
    }
  }

  if (isLoading) {
    return (
      <div className="h-full bg-background text-foreground flex flex-col">
        <Header description="Settings" />
        <div className="flex items-center justify-center flex-1">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-sm text-muted-foreground">Loading settings...</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="h-full bg-background text-foreground flex flex-col">
      <Header description="Settings" />

      <div className="flex-1 overflow-hidden">
        <ScrollArea className="h-full">
          <div className="px-4 py-2 space-y-4">
            {/* Theme Settings */}
            <div className="bg-background border border-border rounded-lg p-3">
              <h3 className="text-sm font-medium mb-3 text-foreground">Theme</h3>
              <div className="flex gap-2">
                {(['light', 'dark', 'system'] as const).map((themeOption) => (
                  <Button
                    key={themeOption}
                    onClick={() => handleThemeChange(themeOption)}
                    variant={theme === themeOption ? 'default' : 'outline'}
                    size="sm"
                    className="text-xs capitalize"
                  >
                    {themeOption}
                  </Button>
                ))}
              </div>
            </div>

            {/* Editor Settings */}
            <div className="bg-background border border-border rounded-lg p-3">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-medium text-foreground">Editor Configurations</h3>
                <Button
                  onClick={saveEditorSettings}
                  disabled={isSaving}
                  size="sm"
                  className="text-xs"
                >
                  {isSaving ? 'Saving...' : 'Save'}
                </Button>
              </div>

              <div className="space-y-3">
                {/* Cursor */}
                <div>
                  <label className="block text-xs font-medium text-foreground mb-1">
                    Cursor Binary
                  </label>
                  <input
                    type="text"
                    value={editors.cursor}
                    onChange={(e) => handleEditorChange('cursor', e.target.value)}
                    placeholder="cursor"
                    className="w-full px-2 py-1 text-xs border border-border rounded bg-background text-foreground focus:ring-1 focus:ring-primary focus:border-primary"
                  />
                  <p className="text-[10px] text-muted-foreground mt-1">
                    Command to launch Cursor editor
                  </p>
                </div>

                {/* VS Code */}
                <div>
                  <label className="block text-xs font-medium text-foreground mb-1">
                    VS Code Binary
                  </label>
                  <input
                    type="text"
                    value={editors.vscode}
                    onChange={(e) => handleEditorChange('vscode', e.target.value)}
                    placeholder="code"
                    className="w-full px-2 py-1 text-xs border border-border rounded bg-background text-foreground focus:ring-1 focus:ring-primary focus:border-primary"
                  />
                  <p className="text-[10px] text-muted-foreground mt-1">
                    Command to launch VS Code
                  </p>
                </div>

                {/* IntelliJ IDEA */}
                <div>
                  <label className="block text-xs font-medium text-foreground mb-1">
                    IntelliJ IDEA Binary
                  </label>
                  <input
                    type="text"
                    value={editors.idea}
                    onChange={(e) => handleEditorChange('idea', e.target.value)}
                    placeholder="idea"
                    className="w-full px-2 py-1 text-xs border border-border rounded bg-background text-foreground focus:ring-1 focus:ring-primary focus:border-primary"
                  />
                  <p className="text-[10px] text-muted-foreground mt-1">
                    Command to launch IntelliJ IDEA
                  </p>
                </div>

                {/* Terminal */}
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="block text-xs font-medium text-foreground">
                      Terminal Emulators
                    </label>
                    <Button
                      onClick={handleTerminalAdd}
                      size="sm"
                      variant="outline"
                      className="text-xs h-6 px-2"
                    >
                      Add
                    </Button>
                  </div>
                  <div className="space-y-1">
                    {editors.terminal.map((terminal, index) => (
                      <div key={index} className="flex gap-1">
                        <input
                          type="text"
                          value={terminal}
                          onChange={(e) => handleTerminalChange(index, e.target.value)}
                          placeholder="Terminal command"
                          className="flex-1 px-2 py-1 text-xs border border-border rounded bg-background text-foreground focus:ring-1 focus:ring-primary focus:border-primary"
                        />
                        {editors.terminal.length > 1 && (
                          <Button
                            onClick={() => handleTerminalRemove(index)}
                            size="sm"
                            variant="outline"
                            className="text-xs h-6 px-2"
                          >
                            Remove
                          </Button>
                        )}
                      </div>
                    ))}
                  </div>
                  <p className="text-[10px] text-muted-foreground mt-1">
                    Tried in order until one works
                  </p>
                </div>
              </div>
            </div>

            {/* Info Section */}
            <div className="bg-muted/50 rounded-lg p-3 border border-border">
              <h4 className="text-xs font-medium text-foreground mb-2">Configuration Tips</h4>
              <ul className="text-[10px] text-muted-foreground space-y-1">
                <li>• Use full paths if commands are not in PATH</li>
                <li>• Terminal order matters - first working one is used</li>
                <li>• Theme changes save automatically</li>
                <li>• Restart app if editor launches fail after changes</li>
              </ul>
            </div>
          </div>
        </ScrollArea>
      </div>
    </div>
  )
}

export default SettingsView
