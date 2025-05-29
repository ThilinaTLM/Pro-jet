import { formatPath, getPathSummary } from '@renderer/lib/path'
import { Repo } from 'src/common/models'
import { Trash2, ChevronRight } from 'lucide-react'
import { Button } from '@renderer/components/ui/button'
import cursorIcon from '@renderer/assets/cursor-app-icon.png'
import vscodeIcon from '@renderer/assets/vscode-svgrepo-com.svg'

type RepoItemProps = {
  repo: Repo
  onRemove: (path: string) => void
  onLaunchCursor: (path: string) => void
  onLaunchVscode: (path: string) => void
}

const RepoItem: React.FC<RepoItemProps> = ({ repo, onRemove, onLaunchCursor, onLaunchVscode }) => {
  const pathSummary = getPathSummary({
    path: repo.path,
    maxLength: 3,
    showEllipsis: true
  })

  return (
    <div key={repo.path} className="relative bg-background border border-border p-3">
      {/* Directory Info */}
      <div className="mb-2 flex flex-col gap-1">
        <h4 className="font-medium text-sm text-foreground truncate flex-1 leading-5">
          {formatPath(repo.path)}
        </h4>
        <div
          className="flex items-center text-xs text-muted-foreground leading-4"
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
      </div>

      {/* Action Buttons */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => onLaunchCursor(repo.path)}
            className="w-fit"
          >
            <img src={cursorIcon} alt="Cursor" className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => onLaunchVscode(repo.path)}
            className="w-fit"
          >
            <img src={vscodeIcon} alt="VS Code" className="h-4 w-4" />
          </Button>
        </div>
        <Button variant="ghost" size="sm" onClick={() => onRemove(repo.path)}>
          <Trash2 className="h-4 w-4 text-destructive" />
        </Button>
      </div>
    </div>
  )
}

export default RepoItem
