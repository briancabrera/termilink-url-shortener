import Link from "next/link"
import { getDictionary } from "@/dictionaries"

export default async function NotFound({ params }: { params?: { lang: string } }) {
  const lang = params?.lang || "es"
  const dictionary = await getDictionary(lang)

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
            <span className="terminal-command ml-2">{dictionary.errors.notFound.command}</span>
          </div>
        </div>

        <div className="p-3 bg-black/30 border border-yellow-500/30 rounded mb-6">
          <p className="text-yellow-400 font-mono">{dictionary.errors.notFound.result}</p>
        </div>

        <h1 className="text-red-500 text-3xl font-bold mb-4">{dictionary.errors.notFound.title}</h1>
        <p className="text-gray-300 mb-6 text-xl">{dictionary.errors.notFound.description}</p>

        <div className="flex mb-3">
          <span className="terminal-prompt">$</span>
          <span className="terminal-command ml-2">{dictionary.errors.notFound.traceroute}</span>
        </div>

        <div className="p-3 bg-black/30 border border-green-500/30 rounded mb-6 font-mono text-sm">
          <p className="text-gray-400">{dictionary.errors.notFound.tracerouteResult1}</p>
          <p className="text-gray-400">{dictionary.errors.notFound.tracerouteResult2}</p>
        </div>

        <div className="flex">
          <span className="terminal-prompt">$</span>
          <span className="terminal-command ml-2">{dictionary.errors.notFound.homeCommand}</span>
        </div>

        <div className="mt-4">
          <Link href={`/${lang}`} className="terminal-button inline-block">
            {dictionary.errors.notFound.homeButton}
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
