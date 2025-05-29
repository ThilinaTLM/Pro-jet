import { useState, ReactNode } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { Upload } from 'lucide-react'
import { cn } from '@renderer/lib/utils'

interface DragDropZoneProps {
  children: ReactNode
  onDrop: (paths: string[]) => void
  className?: string
  dropMessage?: string
  dropSubMessage?: string
}

const DragDropZone: React.FC<DragDropZoneProps> = ({
  children,
  onDrop,
  className,
  dropMessage = 'Drop directories here',
  dropSubMessage = 'Release to add directories to your project list'
}) => {
  const [isDragOver, setIsDragOver] = useState(false)

  const handleDragEnter = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (
      e.dataTransfer.items &&
      Array.from(e.dataTransfer.items).some((item) => item.kind === 'file')
    ) {
      setIsDragOver(true)
    }
  }

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    // Only hide drag overlay if we're leaving the main container
    if (!e.currentTarget.contains(e.relatedTarget as Node)) {
      setIsDragOver(false)
    }
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (
      e.dataTransfer.items &&
      Array.from(e.dataTransfer.items).some((item) => item.kind === 'file')
    ) {
      e.dataTransfer.dropEffect = 'copy'
    } else {
      e.dataTransfer.dropEffect = 'none'
    }
  }

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragOver(false)

    const droppedItems = Array.from(e.dataTransfer.files)

    if (droppedItems.length === 0) {
      console.log('No items dropped.')
      return
    }

    console.log(`Dropped ${droppedItems.length} item(s). Processing...`)

    const paths: string[] = []

    for (const item of droppedItems) {
      try {
        const absPath = await window.electron.webUtils.getPathForFile(item)
        if (absPath) {
          paths.push(absPath)
        } else {
          console.error(`Error processing dropped item "${item.name}": No path returned`)
        }
      } catch (error) {
        console.error(`Error processing dropped item "${item.name}":`, error)
      }
    }

    if (paths.length > 0) {
      onDrop(paths)
    }
  }

  return (
    <div
      className={cn(
        'relative transition-all duration-200',
        isDragOver && 'bg-primary/5 border-2 border-dashed border-primary/30',
        className
      )}
      onDragEnter={handleDragEnter}
      onDragLeave={handleDragLeave}
      onDragOver={handleDragOver}
      onDrop={handleDrop}
    >
      {/* Drag overlay */}
      <AnimatePresence>
        {isDragOver && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm"
          >
            <div className="text-center p-8 rounded-lg border-2 border-dashed border-primary bg-primary/5">
              <Upload className="h-12 w-12 text-primary mx-auto mb-4" />
              <h3 className="text-lg font-medium text-foreground mb-2">{dropMessage}</h3>
              <p className="text-sm text-muted-foreground">{dropSubMessage}</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {children}
    </div>
  )
}

export default DragDropZone
