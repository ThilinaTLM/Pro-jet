import { createContext, useContext, useState } from 'react'

export const Route = {
  main: 'main',
  settings: 'settings'
} as const

export type Route = (typeof Route)[keyof typeof Route]

const RouteContext = createContext<{
  route: Route
  setRoute: (route: Route) => void
}>({
  route: Route.main,
  setRoute: () => {}
})

const RouteProvider = ({ children }: { children: React.ReactNode }) => {
  const [route, setRoute] = useState<Route>(Route.main)

  return <RouteContext.Provider value={{ route, setRoute }}>{children}</RouteContext.Provider>
}

export const useRoute = () => {
  return useContext(RouteContext)
}

export default RouteProvider
