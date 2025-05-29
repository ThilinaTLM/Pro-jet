import { Repo } from '@renderer/models'
import { useCallback, useState } from 'react'

export function useRepos() {
  const [repos, setRepos] = useState<Repo[]>([])

  const addRepo = useCallback((repo: Omit<Repo, 'lastOpened'>) => {
    setRepos((prev) => [...prev, { ...repo, lastOpened: new Date() }])
  }, [])

  const removeRepo = useCallback((path: string) => {
    setRepos((prev) => prev.filter((repo) => repo.path !== path))
  }, [])

  const updateRepo = useCallback((path: string, updates: Partial<Repo>) => {
    setRepos((prev) => prev.map((repo) => (repo.path === path ? { ...repo, ...updates } : repo)))
  }, [])

  const updateLastOpened = useCallback((path: string) => {
    setRepos((prev) =>
      prev.map((repo) => (repo.path === path ? { ...repo, lastOpened: new Date() } : repo))
    )
  }, [])

  return {
    repos,
    addRepo,
    removeRepo,
    updateRepo,
    updateLastOpened
  }
}
