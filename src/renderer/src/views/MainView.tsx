import { Button } from '@renderer/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@renderer/components/ui/card'
import { FolderOpen, Plus, Trash2, ExternalLink } from 'lucide-react'
import { Badge } from '@renderer/components/ui/badge'
import { Separator } from '@renderer/components/ui/separator'
import { ScrollArea } from '@renderer/components/ui/scroll-area'
import { useRepos, useRepoActions } from '@renderer/stores/repoStore'

const MainView: React.FC = () => {
  const repos = useRepos()
  const { removeRepo } = useRepoActions()

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

  return (
    <Card className="h-full">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <FolderOpen className="h-5 w-5" />
            Recent Directories
          </CardTitle>
          <Button onClick={() => {}} size="sm" className="gap-2">
            <Plus className="h-4 w-4" />
            Add
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
                      onClick={() => {}}
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
