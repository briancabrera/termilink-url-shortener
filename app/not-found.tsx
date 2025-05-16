import Link from "next/link"

export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-black">
      <div className="terminal-container w-full max-w-md">
        <div className="flex items-center justify-between mb-4">
          <div className="flex space-x-2">
            <div className="w-3 h-3 rounded-full bg-red-500"></div>
            <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
            <div className="w-3 h-3 rounded-full bg-green-500"></div>
          </div>
          <div className="text-xs text-gray-400">404.sh</div>
        </div>

        <div className="mb-4">
          <div className="flex">
            <span className="terminal-prompt">$</span>
            <span className="terminal-command ml-2">find / -name "requested-page" 2>/dev/null</span>
          </div>
        </div>

        <div className="p-3 bg-black/30 border border-yellow-500/30 rounded mb-6">
          <p className="text-yellow-400 font-mono">No results found.&lt;/dev/null</p>
        </div>

        <h1 className="text-red-500 text-3xl font-bold mb-4">Error 404: Página no encontrada</h1>
        <p className="text-gray-300 mb-6 text-xl">La ruta que estás buscando no existe en este servidor.</p>

        <div className="flex mb-3">
          <span className="terminal-prompt">$</span>
          <span className="terminal-command ml-2">traceroute</span>
        </div>

        <div className="p-3 bg-black/30 border border-green-500/30 rounded mb-6 font-mono text-sm">
          <p className="text-gray-400">traceroute to homepage (127.0.0.1), 30 hops max, 60 byte packets</p>
          <p className="text-gray-400">1 localhost (127.0.0.1) 0.123 ms 0.456 ms 0.789 ms</p>
        </div>

        <div className="flex">
          <span className="terminal-prompt">$</span>
          <span className="terminal-command ml-2">cd /home</span>
        </div>

        <div className="mt-4">
          <Link href="/" className="terminal-button inline-block">
            Volver al inicio
          </Link>
        </div>

        <div className="mt-6 pt-4 border-t border-green-500/30 flex justify-center">
          <a href="https://links.briancabrera.com/" target="_blank" rel="noopener noreferrer" className="terminal-link">
            <span className="text-cyan-400">Brian Cabrera</span>
          </a>
        </div>
      </div>
    </div>
  )
}
