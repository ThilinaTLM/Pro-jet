import { Button } from '@renderer/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@renderer/components/ui/card'
import { FolderOpen, Plus, Trash2, ExternalLink } from 'lucide-react'
import { Badge } from '@renderer/components/ui/badge'
import { Separator } from '@renderer/components/ui/separator'
import { ScrollArea } from '@renderer/components/ui/scroll-area'
import { useRepoActions, useRecentRepos } from '@renderer/stores/repoStore'
import { useState } from 'react'

const MainView: React.FC = () => {
  const repos = useRecentRepos()
  const { removeRepo, addRepo, updateLastOpened } = useRepoActions()
  const [isAddingDirectory, setIsAddingDirectory] = useState(false)

  const formatPath = (path: string): string => {
    const parts = path.split('/')
    return parts[parts.length - 1] || path
  }

  const formatLastAccessed = (date?: Date): string => {
    if (!date) return 'Never'
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
    <Card className="h-full">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <FolderOpen className="h-5 w-5" />
            Recent Directories
          </CardTitle>
          <Button 
            onClick={handleAddDirectory} 
            size="sm" 
            className="gap-2"
            disabled={isAddingDirectory}
          >
            <Plus className="h-4 w-4" />
            {isAddingDirectory ? 'Adding...' : 'Add'}
          </Button>
        </div>
      </CardHeader>
      <CardContent className="p-0">
        <Separator />
        <ScrollArea className="h-[400px] p-4">
          {repos.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-32 text-muted-foreground">
              <FolderOpen className="h-8 w-8 mb-2 opacity-50" />
              <p className="text-sm">No directories added yet</p>
              <p className="text-xs">Click "Add Directory" to get started</p>
            </div>
          ) : (
            <div className="space-y-3">
              {repos.map((repo) => (
                <div
                  key={repo.path}
                  className="flex items-center justify-between p-3 rounded-lg border bg-card hover:bg-accent/50 transition-colors"
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className="font-medium text-sm truncate">{formatPath(repo.path)}</h4>
                      <Badge variant="secondary" className="text-xs">
                        {formatLastAccessed(repo.lastOpened)}
                      </Badge>
                    </div>
                    <p className="text-xs text-muted-foreground truncate" title={repo.path}>
                      {repo.path}
                    </p>
                  </div>
                  <div className="flex items-center gap-1 ml-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleLaunchCursor(repo.path)}
                      className="h-8 w-8 p-0"
                      title="Launch in Cursor"
                    >
                      <ExternalLink className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleRemoveDirectory(repo.path)}
                      className="h-8 w-8 p-0 text-destructive hover:text-destructive"
                      title="Remove directory"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </ScrollArea>
      </CardContent>
    </Card>
  )
}

export default MainView
