import { FolderOpen } from 'lucide-react'
import { cn } from '@renderer/lib/utils'
import { X } from 'lucide-react'
import { Button } from '../ui/button'

type HeaderProps = {
  description: string
}

const Header = ({ description }: HeaderProps) => {
  const onClose = async () => {
    await window.api.closeWindow()
  }
  return (
    <div className="flex-shrink-0 px-4 py-2 drag-region">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-primary/10">
            <FolderOpen className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h1 className="text-lg font-semibold text-foreground">Projet</h1>
            <p className="text-xs text-muted-foreground">{description}</p>
          </div>
        </div>
        <Button
          onClick={onClose}
          size="sm"
          className={cn('p-0 cursor-pointer no-drag-region')}
          variant="destructive"
        >
          <X className="h-8 w-8" />
        </Button>
      </div>
    </div>
  )
}

export default Header
