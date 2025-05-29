import { formatPath, getPathSummary } from '@renderer/lib/path'
import { Repo } from 'src/common/models'
import { Trash2, ChevronRight } from 'lucide-react'
import { Button } from '@renderer/components/ui/button'
import cursorIcon from '@renderer/assets/cursor-app-icon.png'
import vscodeIcon from '@renderer/assets/vscode-svgrepo-com.svg'
import terminalIcon from '@renderer/assets/terminal-screen-svgrepo-com.svg'
import ideaIcon from '@renderer/assets/intellij-idea-svgrepo-com.svg'
import { Separator } from '@radix-ui/react-separator'

type RepoItemProps = {
  repo: Repo
  onRemove: (path: string) => void
  updateLastOpened: (path: string) => void
}

const RepoItem: React.FC<RepoItemProps> = ({ repo, onRemove, updateLastOpened }) => {
  const pathSummary = getPathSummary({
    path: repo.path,
    maxLength: 4,
    showEllipsis: true
  })

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

  const onLaunchTerminal = async (path: string) => {
    try {
      const result = await window.api.launchTerminal(path)
      if (result.success) {
        updateLastOpened(path)
      } else {
        console.error('Failed to launch Terminal:', result.error)
      }
    } catch (error) {
      console.error('Failed to launch Terminal:', error)
    }
  }

  const onLaunchIdea = async (path: string) => {
    try {
      const result = await window.api.launchIdea(path)
      if (result.success) {
        updateLastOpened(path)
      } else {
        console.error('Failed to launch IntelliJ IDEA:', result.error)
      }
    } catch (error) {
      console.error('Failed to launch IntelliJ IDEA:', error)
    }
  }

  return (
    <div key={repo.path} className="relative bg-background px-3">
      {/* Directory Info */}
      <div className="mb-2 flex flex-col gap-[1px]">
        <div
          className="flex items-center text-[10px] text-muted-foreground leading-4"
          title={repo.path}
        >
          {pathSummary.map((segment, index, array) => (
            <span key={index} className="flex items-center">
              {segment === '...' ? (
                <span className="text-muted-foreground/60">...</span>
              ) : (
                <span className="hover:text-foreground transition-colors truncate max-w-full">
                  {segment}
                </span>
              )}
              {index < array.length - 1 && (
                <ChevronRight className="h-3 w-3 mx-1 text-muted-foreground/40 flex-shrink-0" />
              )}
            </span>
          ))}
        </div>
        <h4 className="font-medium text-sm text-foreground truncate flex-1 leading-5">
          {formatPath(repo.path)}
        </h4>
      </div>

      {/* Action Buttons */}
      <div className="flex items-center justify-between ">
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => onLaunchTerminal(repo.path)}
            className="w-fit"
            title="Open in Terminal"
          >
            <img src={terminalIcon} alt="Terminal" className="h-4 w-4 dark:invert" />
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => onLaunchVscode(repo.path)}
            className="w-fit"
            title="Open in VS Code"
          >
            <img src={vscodeIcon} alt="VS Code" className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => onLaunchIdea(repo.path)}
            className="w-fit"
            title="Open in IntelliJ IDEA"
          >
            <img src={ideaIcon} alt="IntelliJ IDEA" className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => onLaunchCursor(repo.path)}
            className="w-fit"
            title="Open in Cursor"
          >
            <img src={cursorIcon} alt="Cursor" className="h-4 w-4" />
          </Button>
        </div>
        <Button variant="ghost" size="sm" onClick={() => onRemove(repo.path)}>
          <Trash2 className="h-4 w-4 text-destructive" />
        </Button>
      </div>

      <hr className="my-3" />
    </div>
  )
}

export default RepoItem
