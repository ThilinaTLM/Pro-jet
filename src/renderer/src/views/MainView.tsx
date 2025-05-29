import { Button } from '@renderer/components/ui/button'
import { FolderOpen, Plus, Trash2, ExternalLink } from 'lucide-react'
import { Badge } from '@renderer/components/ui/badge'
import { ScrollArea } from '@renderer/components/ui/scroll-area'
import { useRepos } from '@renderer/hooks/repoStore'
import { useState } from 'react'

const MainView: React.FC = () => {
  const { repos, addRepo, removeRepo, updateLastOpened } = useRepos()
  const [isAddingDirectory, setIsAddingDirectory] = useState(false)

  const formatPath = (path: string): string => {
    const parts = path.split('/')
    return parts[parts.length - 1] || path
  }

  const formatLastAccessed = (date?: Date): string => {
    if (!date) return 'Never'
    if (typeof date === 'string') {
      date = new Date(date)
    }
    return new Intl.RelativeTimeFormat('en', { numeric: 'auto' }).format(
      Math.floor((date.getTime() - Date.now()) / (1000 * 60 * 60 * 24)),
      'day'
    )
  }

  const handleRemoveDirectory = (path: string) => {
    removeRepo(path)
  }

  const handleAddDirectory = async () => {
    setIsAddingDirectory(true)
    try {
      const selectedPath = await window.api.selectDirectory()
      if (selectedPath) {
        const pathParts = selectedPath.split('/')
        const label = pathParts[pathParts.length - 1] || selectedPath
        addRepo({
          label,
          path: selectedPath
        })
      }
    } catch (error) {
      console.error('Failed to select directory:', error)
    } finally {
      setIsAddingDirectory(false)
    }
  }

  const handleLaunchCursor = async (path: string) => {
    try {
      const result = await window.api.launchCursor(path)
      if (result.success) {
        // Update last opened time
        updateLastOpened(path)
      } else {
        console.error('Failed to launch Cursor:', result.error)
        // You could show a toast notification here
      }
    } catch (error) {
      console.error('Failed to launch Cursor:', error)
    }
  }

  return (
    <div className="h-full bg-background text-foreground flex flex-col">
      {/* Header */}
      <div className="flex-shrink-0 px-4 py-4 border-b border-border bg-background">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-primary/10">
              <FolderOpen className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h1 className="text-lg font-semibold text-foreground">Recent Directories</h1>
              <p className="text-xs text-muted-foreground">
                {repos.length} {repos.length === 1 ? 'directory' : 'directories'}
              </p>
            </div>
          </div>
        </div>
        <Button
          onClick={handleAddDirectory}
          className="w-full gap-2 h-10"
          disabled={isAddingDirectory}
        >
          <Plus className="h-4 w-4" />
          {isAddingDirectory ? 'Adding Directory...' : 'Add Directory'}
        </Button>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-hidden">
        <ScrollArea className="h-full">
          {repos.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-64 px-6 text-center">
              <div className="p-4 rounded-full bg-muted/50 mb-4">
                <FolderOpen className="h-8 w-8 text-muted-foreground" />
              </div>
              <h3 className="text-sm font-medium text-foreground mb-1">No directories yet</h3>
              <p className="text-xs text-muted-foreground max-w-[280px] leading-relaxed">
                Add your first directory to get started with quick access to your projects
              </p>
            </div>
          ) : (
            <div className="p-4 space-y-3">
              {repos.map((repo, index) => (
                <div
                  key={repo.path}
                  className="group relative bg-background border border-border rounded-lg p-4 hover:bg-accent/30 transition-all duration-200 hover:border-accent-foreground/20"
                >
                  {/* Directory Info */}
                  <div className="mb-3">
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <h4 className="font-medium text-sm text-foreground truncate flex-1 leading-5">
                        {formatPath(repo.path)}
                      </h4>
                      <Badge variant="secondary" className="text-xs shrink-0">
                        {formatLastAccessed(repo.lastOpened)}
                      </Badge>
                    </div>
                    <p className="text-xs text-muted-foreground truncate leading-4" title={repo.path}>
                      {repo.path}
                    </p>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex items-center gap-2">
                    <Button
                      variant="default"
                      size="sm"
                      onClick={() => handleLaunchCursor(repo.path)}
                      className="flex-1 gap-2 h-9"
                    >
                      <ExternalLink className="h-4 w-4" />
                      Open in Cursor
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleRemoveDirectory(repo.path)}
                      className="h-9 w-9 p-0 text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                      title="Remove directory"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>

                  {/* Subtle separator line for visual hierarchy */}
                  {index < repos.length - 1 && (
                    <div className="absolute bottom-0 left-4 right-4 h-px bg-border/50" />
                  )}
                </div>
              ))}
            </div>
          )}
        </ScrollArea>
      </div>
    </div>
  )
}

export default MainView
