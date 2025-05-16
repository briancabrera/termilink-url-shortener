export default function Loading() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-black">
      <div className="terminal-container w-full max-w-md">
        <div className="flex items-center justify-between mb-4">
          <div className="flex space-x-2">
            <div className="w-3 h-3 rounded-full bg-red-500"></div>
            <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
            <div className="w-3 h-3 rounded-full bg-green-500"></div>
          </div>
          <div className="text-xs text-gray-400">loading.sh</div>
        </div>

        <div className="mb-6">
          <div className="flex">
            <span className="terminal-prompt">$</span>
            <span className="terminal-command ml-2">loading</span>
            <span className="blink ml-2">_</span>
          </div>
        </div>

        <div className="p-4 bg-black/30 border border-green-500/30 rounded">
          <div className="flex items-center justify-center">
            <div className="flex space-x-2">
              <div className="h-3 w-3 bg-green-500 rounded-full animate-pulse"></div>
              <div className="h-3 w-3 bg-green-500 rounded-full animate-pulse delay-150"></div>
              <div className="h-3 w-3 bg-green-500 rounded-full animate-pulse delay-300"></div>
            </div>
          </div>
          <p className="text-center text-green-400 mt-4">Cargando página de acceso...</p>
        </div>
      </div>
    </div>
  )
}
