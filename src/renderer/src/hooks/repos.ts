import { useCallback, useState, useEffect } from 'react'
import { Repo } from 'src/common/models'

export function useRepos() {
  const [repos, setRepos] = useState<Repo[]>([])
  const [isLoading, setIsLoading] = useState(true)

  // Load repos from store on initialization
  useEffect(() => {
    const loadRepos = async () => {
      try {
        const storedRepos = await window.api.store.getRepos()
        setRepos(storedRepos)
      } catch (error) {
        console.error('Failed to load repos from store:', error)
      } finally {
        setIsLoading(false)
      }
    }

    loadRepos()
  }, [])

  // Save repos to store whenever repos change
  useEffect(() => {
    if (!isLoading && repos.length >= 0) {
      window.api.store.setRepos(repos).catch((error) => {
        console.error('Failed to save repos to store:', error)
      })
    }
  }, [repos, isLoading])

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
    updateLastOpened,
    isLoading
  }
}
