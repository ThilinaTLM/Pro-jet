import { Button } from '@renderer/components/ui/button'
import Versions from './components/Versions'

function App(): React.JSX.Element {
  const ipcHandle = (): void => window.electron.ipcRenderer.send('ping')

  return (
    <>
      <Versions />
      <Button onClick={ipcHandle}>Ping</Button>
    </>
  )
}

export default App
