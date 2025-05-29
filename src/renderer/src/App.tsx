import { Button } from '@renderer/components/ui/button'

function App(): React.JSX.Element {
  const ipcHandle = (): void => window.electron.ipcRenderer.send('ping')

  return (
    <div className="flex flex-col gap-4 p-2">
      <Button onClick={ipcHandle}>Ping</Button>
    </div>
  )
}

export default App
