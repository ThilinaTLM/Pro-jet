export const formatPath = (path: string): string => {
  const parts = path.split('/')
  return parts[parts.length - 1] || path
}

/**
 * Extracts a summary of path segments from a file path
 * @param options - Configuration object
 * @param options.path - The file path to summarize
 * @param options.maxLength - Maximum number of path segments to return (default: 3)
 * @param options.showEllipsis - Whether to add '...' when path is truncated (default: false)
 * @param options.skipLast - Whether to exclude the last segment (filename) and return parent directory segments (default: true)
 * @returns Array of path segments, optionally with ellipsis indicator
 */
export const getPathSummary = ({
  path,
  maxLength = 3,
  showEllipsis = false,
  skipLast = true
}: {
  path: string
  maxLength?: number
  showEllipsis?: boolean
  skipLast?: boolean
}): string[] => {
  if (!path || typeof path !== 'string') return []

  const normalizedPath = path.replace(/\\/g, '/').replace(/^\/+|\/+$/g, '')
  if (!normalizedPath) return []

  const segments = normalizedPath.split('/').filter((segment) => segment.length > 0)

  // If skipLast is true, exclude the last segment (filename) and work with parent directory
  const workingSegments = skipLast ? segments.slice(0, -1) : segments

  if (workingSegments.length <= maxLength) {
    return workingSegments
  }

  const truncated = workingSegments.slice(-maxLength)
  return showEllipsis ? ['...', ...truncated] : truncated
}
