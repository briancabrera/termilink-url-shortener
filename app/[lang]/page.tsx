import { UrlShortenerForm } from "@/components/url-shortener-form"
import Link from "next/link"
import { getDictionary } from "@/dictionaries"
import { LanguageSwitcher } from "@/components/language-switcher"

export default async function Home({ params }: { params: { lang: string } }) {
  const dictionary = await getDictionary(params.lang)

  return (
    <div className="min-h-screen flex flex-col p-4 md:p-8">
      <header className="container mx-auto mb-8">
        <div className="terminal-header flex justify-between items-center">
          <div>
            <span className="terminal-prompt">$</span>
            <span className="terminal-command ml-2">cd ~/termilink</span>
          </div>
          <LanguageSwitcher dictionary={dictionary} currentLocale={params.lang} />
        </div>
      </header>

      <main className="flex-1 container mx-auto flex flex-col items-center justify-center">
        <div className="w-full max-w-3xl mx-auto">
          <div className="terminal-container mb-8">
            <div className="flex items-center justify-between mb-4">
              <div className="flex space-x-2">
                <div className="w-3 h-3 rounded-full bg-red-500"></div>
                <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                <div className="w-3 h-3 rounded-full bg-green-500"></div>
              </div>
              <div className="text-xs text-gray-400">termilink.sh</div>
            </div>

            <h1 className="terminal-title mb-2">{dictionary.home.title}</h1>
            <p className="terminal-subtitle">
              <span className="typing">{dictionary.home.subtitle}</span>
            </p>

            <div className="mb-6">
              <div className="flex">
                <span className="terminal-prompt">$</span>
                <span className="terminal-command ml-2">{dictionary.home.readme.command}</span>
              </div>
              <div className="mt-2 p-4 bg-black/30 rounded border border-green-500/30">
                <p className="text-gray-300 mb-2 text-lg">{dictionary.home.readme.description1}</p>
                <p className="text-gray-300 text-lg">{dictionary.home.readme.description2}</p>
              </div>
            </div>

            <UrlShortenerForm lang={params.lang} />
          </div>

          <div className="grid gap-8 md:grid-cols-3">
            <div className="terminal-container feature-card">
              <div className="flex mb-3">
                <span className="terminal-prompt">$</span>
                <span className="terminal-command ml-2">{dictionary.home.features.speed.command}</span>
              </div>
              <h3 className="feature-title">{dictionary.home.features.speed.title}</h3>
              <p className="feature-text">{dictionary.home.features.speed.description}</p>
            </div>

            <div className="terminal-container feature-card">
              <div className="flex mb-3">
                <span className="terminal-prompt">$</span>
                <span className="terminal-command ml-2">{dictionary.home.features.security.command}</span>
              </div>
              <h3 className="feature-title">{dictionary.home.features.security.title}</h3>
              <p className="feature-text">{dictionary.home.features.security.description}</p>
            </div>

            <div className="terminal-container feature-card">
              <div className="flex mb-3">
                <span className="terminal-prompt">$</span>
                <span className="terminal-command ml-2">{dictionary.home.features.simple.command}</span>
              </div>
              <h3 className="feature-title">{dictionary.home.features.simple.title}</h3>
              <p className="feature-text">{dictionary.home.features.simple.description}</p>
            </div>
          </div>
        </div>
      </main>

      <footer className="container mx-auto mt-8 pt-4 border-t border-green-500/30">
        <div className="flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="flex items-center">
            <span className="terminal-prompt">$</span>
            <span className="text-gray-400 ml-2 text-lg">{dictionary.home.footer.command}</span>
          </div>

          <div className="flex items-center">
            <a
              href="https://links.briancabrera.com/"
              target="_blank"
              rel="noopener noreferrer"
              className="terminal-link"
            >
              <span className="text-cyan-400">Brian Cabrera</span>
            </a>
          </div>

          <div>
            <Link href={`/${params.lang}/debug`} className="terminal-link">
              {dictionary.home.footer.debug}
            </Link>
          </div>
        </div>
      </footer>
    </div>
  )
}
