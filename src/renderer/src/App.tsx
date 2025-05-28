import Versions from './components/Versions'

function App(): React.JSX.Element {
  const ipcHandle = (): void => window.electron.ipcRenderer.send('ping')

  return (
    <>
      <Versions />
      <button className="bg-blue-500 text-white p-2 rounded-md" onClick={ipcHandle}>
        Ping
      </button>
    </>
  )
}

export default App
