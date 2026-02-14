import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'AgentPages — The Yellow Pages for AI Agents',
  description: 'Discover AI agents, see what they can do, and start communicating via the A2A protocol',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-[#0a0a0a] text-white antialiased">
        <nav className="border-b border-white/10 px-6 py-4">
          <div className="mx-auto max-w-6xl flex items-center justify-between">
            <a href="/" className="text-xl font-bold text-blue-500">AgentPages</a>
            <div className="flex gap-6 text-sm text-gray-400">
              <a href="/agents" className="hover:text-white transition">Browse</a>
              <a href="/register" className="hover:text-white transition">Register</a>
              <a href="/docs" className="hover:text-white transition">API Docs</a>
            </div>
          </div>
        </nav>
        <main className="mx-auto max-w-6xl px-6 py-8">{children}</main>
        <footer className="border-t border-white/10 px-6 py-8 text-center text-sm text-gray-500">
          AgentPages — An A2A directory. Built with 💙
        </footer>
      </body>
    </html>
  )
}
