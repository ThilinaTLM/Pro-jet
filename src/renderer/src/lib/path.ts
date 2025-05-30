/**
 * Cross-platform path utilities for the renderer process
 * These utilities handle both Windows and Unix-style paths correctly
 */

/**
 * Normalizes a path to use forward slashes and removes redundant separators
 * @param path - The path to normalize
 * @returns Normalized path with forward slashes
 */
const normalizePath = (path: string): string => {
  if (!path || typeof path !== 'string') return ''

  // Convert backslashes to forward slashes and normalize multiple slashes
  return path
    .replace(/\\/g, '/')
    .replace(/\/+/g, '/')
    .replace(/^\/+|\/+$/g, '')
}

/**
 * Extracts the basename (filename or directory name) from a path
 * Works cross-platform with both Windows and Unix-style paths
 * @param path - The file path
 * @returns The basename of the path
 */
export const formatPath = (path: string): string => {
  if (!path || typeof path !== 'string') return path

  const normalized = normalizePath(path)
  if (!normalized) return path

  const parts = normalized.split('/')
  const basename = parts[parts.length - 1]

  // Handle edge cases
  if (!basename) {
    // If path ends with separator, get the parent directory name
    const nonEmptyParts = parts.filter((part) => part.length > 0)
    return nonEmptyParts[nonEmptyParts.length - 1] || path
  }

  return basename
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

  const normalized = normalizePath(path)
  if (!normalized) return []

  let segments = normalized.split('/').filter((segment) => segment.length > 0)

  // Handle Windows drive letters (e.g., "C:" becomes "C:")
  if (segments.length > 0 && /^[A-Za-z]:$/.test(segments[0])) {
    // Keep drive letter as is
  }

  // If skipLast is true, exclude the last segment (filename) and work with parent directory
  const workingSegments = skipLast ? segments.slice(0, -1) : segments

  if (workingSegments.length <= maxLength) {
    return workingSegments
  }

  const truncated = workingSegments.slice(-maxLength)
  return showEllipsis ? ['...', ...truncated] : truncated
}

/**
 * Joins path segments using forward slashes (cross-platform)
 * @param segments - Path segments to join
 * @returns Joined path with forward slashes
 */
export const joinPath = (...segments: string[]): string => {
  if (segments.length === 0) return ''

  return segments
    .map((segment) => normalizePath(segment))
    .filter((segment) => segment.length > 0)
    .join('/')
}

/**
 * Gets the parent directory of a path
 * @param path - The file path
 * @returns The parent directory path
 */
export const getParentPath = (path: string): string => {
  if (!path || typeof path !== 'string') return ''

  const normalized = normalizePath(path)
  if (!normalized) return ''

  const segments = normalized.split('/').filter((segment) => segment.length > 0)
  if (segments.length <= 1) return ''

  return segments.slice(0, -1).join('/')
}

/**
 * Checks if a path is absolute (works for both Windows and Unix)
 * @param path - The path to check
 * @returns True if the path is absolute
 */
export const isAbsolutePath = (path: string): boolean => {
  if (!path || typeof path !== 'string') return false

  // Unix absolute path starts with /
  if (path.startsWith('/')) return true

  // Windows absolute path starts with drive letter (e.g., C:\, D:\)
  if (/^[A-Za-z]:[\\\/]/.test(path)) return true

  // UNC path (e.g., \\server\share)
  if (path.startsWith('\\\\') || path.startsWith('//')) return true

  return false
}

/**
 * Gets the file extension from a path
 * @param path - The file path
 * @returns The file extension (including the dot) or empty string if no extension
 */
export const getExtension = (path: string): string => {
  if (!path || typeof path !== 'string') return ''

  const basename = formatPath(path)
  const lastDotIndex = basename.lastIndexOf('.')

  if (lastDotIndex === -1 || lastDotIndex === 0) return ''

  return basename.substring(lastDotIndex)
}
