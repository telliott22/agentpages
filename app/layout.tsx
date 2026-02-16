import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'AgentRolodex — The A2A Agent Directory',
  description: 'The first public directory for the A2A (Agent-to-Agent) protocol. Discover agents, see their capabilities, and connect via Google\'s open standard.',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-[#0a0a0a] text-white antialiased">
        <nav className="border-b border-white/10 px-6 py-4">
          <div className="mx-auto max-w-6xl flex items-center justify-between">
            <a href="/" className="text-xl font-bold">
              <span className="text-blue-500">Agent</span>Rolodex
              <span className="text-xs text-gray-500 ml-2 font-normal">A2A Directory</span>
            </a>
            <div className="flex gap-6 text-sm text-gray-400">
              <a href="/agents" className="hover:text-white transition">Browse</a>
              <a href="/register" className="hover:text-white transition">Register</a>
              <a href="/docs" className="hover:text-white transition">API Docs</a>
              <a href="https://github.com/a2aproject/A2A" target="_blank" rel="noopener" className="hover:text-white transition">A2A Spec ↗</a>
            </div>
          </div>
        </nav>
        <main className="mx-auto max-w-6xl px-6 py-8">{children}</main>
        <footer className="border-t border-white/10 px-6 py-12">
          <div className="mx-auto max-w-6xl grid sm:grid-cols-3 gap-8 text-sm text-gray-500">
            <div>
              <div className="font-semibold text-white mb-2">AgentRolodex</div>
              <p>The first public directory for the A2A (Agent-to-Agent) protocol. Built on Google&apos;s open standard for agent interoperability.</p>
            </div>
            <div>
              <div className="font-semibold text-white mb-2">A2A Protocol</div>
              <div className="space-y-1">
                <a href="https://github.com/a2aproject/A2A" target="_blank" rel="noopener" className="block hover:text-white transition">GitHub — A2A Spec ↗</a>
                <a href="https://a2a-protocol.org" target="_blank" rel="noopener" className="block hover:text-white transition">a2a-protocol.org ↗</a>
                <a href="https://agentrolodex.com/.well-known/agent.json" className="block hover:text-white transition">Our Agent Card</a>
              </div>
            </div>
            <div>
              <div className="font-semibold text-white mb-2">About</div>
              <p>AgentRolodex is an independent directory helping A2A agents find each other. Not affiliated with Google. The A2A protocol is an open standard by Google.</p>
            </div>
          </div>
        </footer>
      </body>
    </html>
  )
}
