import MainView from '@renderer/views/MainView'
import SettingsView from '@renderer/views/SettingsView'
import { useRoute } from './components/context/RouteProvider'
import Header from './components/common/Header'
import { useRepos } from './hooks/repos'

function App() {
  const { route } = useRoute()
  const { repos } = useRepos()

  const getMainDescription = () => {
    const count = repos.length
    return `${count} ${count === 1 ? 'directory' : 'directories'}`
  }

  return (
    <div className="bg-background text-foreground flex flex-col h-screen">
      <Header
        descriptions={{
          main: getMainDescription(),
          settings: 'Settings'
        }}
      />

      <div className="grow-0 pt-3 overflow-y-scroll h-full fancy-scrollbar">
        {route === 'main' && <MainView />}
        {route === 'settings' && <SettingsView />}
      </div>
    </div>
  )
}

export default App
