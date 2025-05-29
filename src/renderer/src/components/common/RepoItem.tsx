import { formatPath } from '@renderer/lib/path'
import { formatLastAccessed } from '@renderer/lib/date'
import { Repo } from 'src/common/models'
import { Trash2 } from 'lucide-react'
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
  return (
    <div
      key={repo.path}
      className="group relative bg-background border border-border rounded-lg p-3 transition-all duration-200"
    >
      {/* Directory Info */}
      <div className="mb-2">
        <div className="flex items-start justify-between gap-2 mb-1">
          <h4 className="font-medium text-sm text-foreground truncate flex-1 leading-5">
            {formatPath(repo.path)}
          </h4>
          <div className="text-xs shrink-0">{formatLastAccessed(repo.lastOpened)}</div>
        </div>
        <p className="text-xs text-muted-foreground truncate leading-4" title={repo.path}>
          {repo.path}
        </p>
      </div>

      {/* Action Buttons */}
      <div className="flex items-center gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={() => onLaunchCursor(repo.path)}
          className="flex-1 gap-2 h-8"
        >
          <img src={cursorIcon} alt="Cursor" className="h-4 w-4" />
          Cursor
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => onLaunchVscode(repo.path)}
          className="flex-1 gap-2 h-8"
        >
          <img src={vscodeIcon} alt="VS Code" className="h-4 w-4" />
          VS Code
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => onRemove(repo.path)}
          className="h-8 w-8 p-0 text-muted-foreground hover:text-destructive hover:bg-destructive/10"
          title="Remove directory"
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      </div>
    </div>
  )
}

export default RepoItem
