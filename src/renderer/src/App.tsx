import { ThemeProvider } from '@renderer/components/context/ThemeProvider'
import MainView from '@renderer/views/MainView'

function App() {
  return (
    <ThemeProvider>
      <MainView />
    </ThemeProvider>
  )
}

export default App
