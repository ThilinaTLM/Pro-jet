import { Button } from '@renderer/components/ui/button'
import { FolderOpen, Plus } from 'lucide-react'
import { useRepos } from '@renderer/hooks/repos'
import { useState } from 'react'
import RepoItem from '@renderer/components/common/RepoItem'
import { AnimatePresence, motion } from 'framer-motion'

const MainView: React.FC = () => {
  const { repos, addRepo, removeRepo, updateLastOpened, isLoading } = useRepos()
  const [isAddingDirectory, setIsAddingDirectory] = useState(false)

  const sortedRepos = repos.sort((a, b) => {
    const aLastOpened = a.lastOpened.getTime()
    const bLastOpened = b.lastOpened.getTime()
    return bLastOpened - aLastOpened
  })

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

  if (isLoading) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-sm text-muted-foreground">Loading directories...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="h-full flex flex-col">
      {/* Content */}
      <div>
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
          <div className="px-1 space-y-4">
            <AnimatePresence mode="popLayout">
              {sortedRepos.map((repo) => (
                <motion.div
                  key={repo.path}
                  layout
                  initial={{ opacity: 0, y: 80 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -80 }}
                  transition={{
                    layout: { duration: 0.3, ease: 'easeInOut' },
                    opacity: { duration: 0.2 },
                    y: { duration: 0.2 }
                  }}
                >
                  <RepoItem
                    key={repo.path}
                    repo={repo}
                    onRemove={onRemove}
                    updateLastOpened={updateLastOpened}
                  />
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}
      </div>
      <div className="flex-shrink-0 px-4 py-2 flex justify-end">
        <Button
          onClick={onAdd}
          size="sm"
          className="h-8 w-8 p-0"
          disabled={isAddingDirectory}
          variant="outline"
        >
          <Plus className="h-4 w-4" />
        </Button>
      </div>
      <div className="flex-shrink-0 px-4 py-2 flex justify-center items-center">
        {/* drop zone */}
      </div>
    </div>
  )
}

export default MainView
