import { Button } from '@renderer/components/ui/button'
import { FolderOpen, Plus } from 'lucide-react'
import { ScrollArea } from '@renderer/components/ui/scroll-area'
import { useRepos } from '@renderer/hooks/repos'
import { useState } from 'react'
import RepoItem from '@renderer/components/common/RepoItem'

const MainView: React.FC = () => {
  const { repos, addRepo, removeRepo, updateLastOpened } = useRepos()
  const [isAddingDirectory, setIsAddingDirectory] = useState(false)

  const onRemove = (path: string) => {
    removeRepo(path)
  }

  const onAdd = async () => {
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

  const onLaunchCursor = async (path: string) => {
    try {
      const result = await window.api.launchCursor(path)
      if (result.success) {
        updateLastOpened(path)
      } else {
        console.error('Failed to launch Cursor:', result.error)
      }
    } catch (error) {
      console.error('Failed to launch Cursor:', error)
    }
  }

  const onLaunchVscode = async (path: string) => {
    try {
      const result = await window.api.launchVscode(path)
      if (result.success) {
        updateLastOpened(path)
      } else {
        console.error('Failed to launch VS Code:', result.error)
      }
    } catch (error) {
      console.error('Failed to launch VS Code:', error)
    }
  }

  return (
    <div className="h-full bg-background text-foreground flex flex-col">
      {/* Header */}
      <div className="flex-shrink-0 px-4 py-4 border-b border-border bg-background">
        <div className="flex items-center justify-between">
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
          <Button 
            onClick={onAdd} 
            size="sm"
            className="h-8 w-8 p-0" 
            disabled={isAddingDirectory}
            title={isAddingDirectory ? 'Adding Directory...' : 'Add Directory'}
          >
            <Plus className="h-4 w-4" />
          </Button>
        </div>
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
              {repos.map((repo) => (
                <RepoItem
                  key={repo.path}
                  repo={repo}
                  onRemove={onRemove}
                  onLaunchCursor={onLaunchCursor}
                  onLaunchVscode={onLaunchVscode}
                />
              ))}
            </div>
          )}
        </ScrollArea>
      </div>
    </div>
  )
}

export default MainView
