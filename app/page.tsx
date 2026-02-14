import { getAgents, getStats } from './lib/store'
import Link from 'next/link'

export const dynamic = 'force-dynamic'

export default async function Home() {
  const [stats, recent] = await Promise.all([
    getStats(),
    getAgents({ limit: 5 }),
  ])

  return (
    <div>
      {/* Hero */}
      <section className="py-20 text-center">
        <div className="inline-block bg-blue-500/10 text-blue-400 text-sm px-4 py-1.5 rounded-full mb-6 border border-blue-500/20">
          Built on Google&apos;s A2A (Agent-to-Agent) Protocol
        </div>
        <h1 className="text-5xl font-bold mb-4">
          The Directory for <span className="text-blue-500">A2A Agents</span>
        </h1>
        <p className="text-xl text-gray-400 max-w-2xl mx-auto mb-4">
          The first public directory for the A2A protocol. Discover agents, see their capabilities, and connect via Google&apos;s open standard for agent interoperability.
        </p>
        <p className="text-sm text-gray-500 max-w-xl mx-auto mb-8">
          Every agent listed publishes a standard <code className="bg-white/5 px-1.5 py-0.5 rounded text-gray-400">/.well-known/agent.json</code> card. Browse them all, or register yours.
        </p>
        <div className="flex gap-4 justify-center">
          <Link href="/register" className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-3 rounded-lg font-medium transition">
            Register Your A2A Agent
          </Link>
          <Link href="/agents" className="border border-white/20 hover:border-white/40 px-6 py-3 rounded-lg font-medium transition">
            Browse Directory
          </Link>
        </div>
      </section>

      {/* Stats */}
      <section className="grid grid-cols-3 gap-6 mb-16">
        {[
          { label: 'A2A Agents', value: stats.totalAgents },
          { label: 'Skills Listed', value: stats.totalSkills },
          { label: 'Platforms', value: stats.platforms },
        ].map(s => (
          <div key={s.label} className="border border-white/10 rounded-xl p-6 text-center">
            <div className="text-3xl font-bold text-blue-500">{s.value}</div>
            <div className="text-gray-400 text-sm mt-1">{s.label}</div>
          </div>
        ))}
      </section>

      {/* What is A2A */}
      <section className="mb-16 border border-white/10 rounded-xl p-8">
        <h2 className="text-2xl font-bold mb-4">What is the A2A Protocol?</h2>
        <p className="text-gray-400 mb-4">
          <strong className="text-white">Agent-to-Agent (A2A)</strong> is an open protocol by Google that enables AI agents to discover each other&apos;s capabilities and communicate — regardless of framework, vendor, or language. Agents publish a standard <code className="bg-white/5 px-1.5 py-0.5 rounded text-gray-300">/.well-known/agent.json</code> card describing who they are and what they can do.
        </p>
        <p className="text-gray-400 mb-6">
          AgentPages is the public directory that makes A2A discovery easy. Instead of knowing every agent&apos;s URL, just search here. Think of it as DNS for AI agents.
        </p>
        <div className="flex gap-4 text-sm">
          <a href="https://github.com/a2aproject/A2A" target="_blank" rel="noopener"
            className="bg-white/5 hover:bg-white/10 px-4 py-2 rounded-lg transition text-blue-400">
            Read the A2A Spec on GitHub ↗
          </a>
          <a href="https://a2a-protocol.org" target="_blank" rel="noopener"
            className="bg-white/5 hover:bg-white/10 px-4 py-2 rounded-lg transition text-blue-400">
            Official A2A Docs ↗
          </a>
        </div>
      </section>

      {/* How it works */}
      <section className="mb-16">
        <h2 className="text-2xl font-bold mb-6 text-center">How A2A Discovery Works</h2>
        <div className="grid sm:grid-cols-3 gap-6">
          {[
            { step: '1', title: 'Publish Your Agent Card', desc: 'Host a /.well-known/agent.json at your agent\'s URL describing its name, skills, capabilities, and supported I/O modes.' },
            { step: '2', title: 'Register on AgentPages', desc: 'Add your agent to the directory — either by providing your agent card URL (we\'ll fetch it) or by filling in the details manually.' },
            { step: '3', title: 'Get Discovered', desc: 'Other agents and developers can find you by searching the directory or querying our A2A endpoint. Start communicating via JSON-RPC.' },
          ].map(s => (
            <div key={s.step} className="border border-white/10 rounded-xl p-6">
              <div className="w-8 h-8 rounded-full bg-blue-500/20 text-blue-500 flex items-center justify-center text-sm font-bold mb-3">{s.step}</div>
              <h3 className="font-semibold mb-2">{s.title}</h3>
              <p className="text-sm text-gray-400">{s.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Recent */}
      <section>
        <h2 className="text-2xl font-bold mb-6">Recently Registered A2A Agents</h2>
        {recent.length === 0 ? (
          <p className="text-gray-500">No agents registered yet. Be the first to list your A2A agent!</p>
        ) : (
          <div className="grid gap-4">
            {recent.map(agent => (
              <Link key={agent.id} href={`/agents/${encodeURIComponent(agent.name)}`}
                className="border border-white/10 rounded-xl p-5 hover:border-blue-500/50 transition block">
                <div className="flex items-center gap-4">
                  {agent.avatar_url ? (
                    <img src={agent.avatar_url} alt="" className="w-10 h-10 rounded-full" />
                  ) : (
                    <div className="w-10 h-10 rounded-full bg-blue-500/20 flex items-center justify-center text-blue-500 text-sm font-bold">
                      {agent.name[0]}
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <div className="font-semibold flex items-center gap-2">
                      {agent.name}
                      {agent.verified && <span className="text-blue-500 text-xs">✓</span>}
                      {agent.platform && (
                        <span className="text-xs bg-white/10 px-2 py-0.5 rounded">{agent.platform}</span>
                      )}
                      <span className="text-xs text-gray-600">A2A {agent.protocol_version || '0.3.0'}</span>
                    </div>
                    <div className="text-sm text-gray-400 truncate">{agent.description}</div>
                  </div>
                  <div className="text-sm text-gray-500">
                    {Array.isArray(agent.skills) ? agent.skills.length : 0} skills
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </section>
    </div>
  )
}
