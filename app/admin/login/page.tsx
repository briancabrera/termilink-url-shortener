"use client"

import { TerminalLogin } from "@/components/terminal-login"
import Link from "next/link"

export default function AdminLoginPage() {
  return (
    <div className="min-h-screen p-4 md:p-8">
      <div className="container mx-auto">
        <header className="mb-8">
          <div className="flex justify-between items-center">
            <div>
              <span className="terminal-prompt no-select">$</span>
              <span className="terminal-command ml-2 no-select">cd ~/termilink/admin</span>
            </div>
          </div>
        </header>

        <div className="flex flex-col items-center justify-center">
          <TerminalLogin />

          <div className="mt-6">
            <Link href="/" className="terminal-link">
              Volver al inicio
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
