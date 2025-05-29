import { createContext, useContext, useEffect, useState } from 'react'

type Theme = 'dark' | 'light' | 'system'

type ThemeProviderProps = {
  children: React.ReactNode
  defaultTheme?: Theme
  storageKey?: string
}

type ThemeProviderState = {
  theme: Theme
  setTheme: (theme: Theme) => void
}

const initialState: ThemeProviderState = {
  theme: 'system',
  setTheme: () => null
}

const ThemeProviderContext = createContext<ThemeProviderState>(initialState)

export const ThemeProvider: React.FC<ThemeProviderProps> = ({
  children,
  defaultTheme = 'system',
  storageKey = 'vite-ui-theme',
  ...props
}) => {
  const [theme, setTheme] = useState<Theme>(defaultTheme)
  const [isLoaded, setIsLoaded] = useState(false)

  // Load theme from electron-store on mount
  useEffect(() => {
    const loadTheme = async () => {
      try {
        const storedTheme = await window.api.store.getTheme()
        setTheme(storedTheme)
      } catch (error) {
        console.error('Failed to load theme from store:', error)
        setTheme(defaultTheme)
      } finally {
        setIsLoaded(true)
      }
    }

    loadTheme()
  }, [defaultTheme])

  useEffect(() => {
    if (!isLoaded) return

    const root = window.document.documentElement

    root.classList.remove('light', 'dark')

    if (theme === 'system') {
      const systemTheme = window.matchMedia('(prefers-color-scheme: dark)').matches
        ? 'dark'
        : 'light'

      root.classList.add(systemTheme)
      return
    }

    root.classList.add(theme)
  }, [theme, isLoaded])

  const value = {
    theme,
    setTheme: async (theme: Theme) => {
      try {
        await window.api.store.setTheme(theme)
        setTheme(theme)
      } catch (error) {
        console.error('Failed to save theme to store:', error)
        // Still update the local state even if saving fails
        setTheme(theme)
      }
    }
  }

  // Don't render children until theme is loaded to prevent flash
  if (!isLoaded) {
    return (
      <div className="h-screen w-screen bg-background text-foreground flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    )
  }

  return (
    <ThemeProviderContext.Provider {...props} value={value}>
      <div data-ag-theme-mode={theme}>{children}</div>
    </ThemeProviderContext.Provider>
  )
}

export const useTheme = () => {
  const context = useContext(ThemeProviderContext)

  if (context === undefined) throw new Error('useTheme must be used within a ThemeProvider')

  return context
}
