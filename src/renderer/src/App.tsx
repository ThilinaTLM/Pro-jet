import MainView from '@renderer/views/MainView'
import SettingsView from '@renderer/views/SettingsView'
import { useRoute } from './components/context/RouteProvider'

function App() {
  const { route } = useRoute()

  if (route === 'main') {
    return <MainView />
  }

  if (route === 'settings') {
    return <SettingsView />
  }

  return null
}

export default App
