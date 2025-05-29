import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { Repo } from '../models'

interface RepoStore {
  repos: Repo[]
  actions: {
    addRepo: (repo: Omit<Repo, 'lastOpened'>) => void
    removeRepo: (path: string) => void
    updateRepo: (path: string, updates: Partial<Repo>) => void
    updateLastOpened: (path: string) => void
  }
}

export const useRepoStore = create<RepoStore>()(
  persist(
    (set) => ({
      repos: [],

      actions: {
        addRepo: (repo) =>
          set((state) => {
            const existingIndex = state.repos.findIndex((r) => r.path === repo.path)

            if (existingIndex !== -1) {
              const updatedRepos = [...state.repos]
              updatedRepos[existingIndex] = {
                ...updatedRepos[existingIndex],
                ...repo,
                lastOpened: new Date()
              }
              return { repos: updatedRepos }
            }

            // Add new repo
            const newRepo: Repo = {
              ...repo,
              lastOpened: new Date()
            }
            return { repos: [...state.repos, newRepo] }
          }),

        removeRepo: (path) =>
          set((state) => ({
            repos: state.repos.filter((repo) => repo.path !== path)
          })),

        updateRepo: (path, updates) =>
          set((state) => ({
            repos: state.repos.map((repo) => (repo.path === path ? { ...repo, ...updates } : repo))
          })),

        updateLastOpened: (path) =>
          set((state) => ({
            repos: state.repos.map((repo) =>
              repo.path === path ? { ...repo, lastOpened: new Date() } : repo
            )
          }))
      }
    }),
    {
      name: 'repo-store',
      storage: {
        getItem: (name) => {
          const str = localStorage.getItem(name)
          if (!str) return null
          const parsed = JSON.parse(str)
          // Convert lastOpened strings back to Date objects
          if (parsed.state?.repos) {
            parsed.state.repos = parsed.state.repos.map((repo: any) => ({
              ...repo,
              lastOpened: new Date(repo.lastOpened)
            }))
          }
          return parsed
        },
        setItem: (name, value) => {
          localStorage.setItem(name, JSON.stringify(value))
        },
        removeItem: (name) => {
          localStorage.removeItem(name)
        }
      }
    }
  )
)

export const useRepos = () => useRepoStore((state) => state.repos)
export const useRepoActions = () => useRepoStore((state) => state.actions)

export const useRecentRepos = () =>
  useRepoStore((state) =>
    state.repos.sort((a, b) => b.lastOpened.getTime() - a.lastOpened.getTime())
  )
