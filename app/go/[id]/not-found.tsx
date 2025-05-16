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
          <div className="text-xs text-gray-400">error.sh</div>
        </div>

        <div className="mb-4">
          <div className="flex">
            <span className="terminal-prompt">$</span>
            <span className="terminal-command ml-2">cat error.log</span>
          </div>
        </div>

        <h1 className="text-red-500 text-3xl font-bold mb-4">Error 404: URL no encontrada</h1>
        <p className="text-gray-300 mb-6 text-xl">
          La URL acortada que estás buscando no existe o ha expirado después de 24 horas.
        </p>

        <div className="flex">
          <span className="terminal-prompt">$</span>
          <span className="terminal-command ml-2">cd /home</span>
        </div>

        <div className="mt-4">
          <Link href="/es" className="terminal-button inline-block">
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
