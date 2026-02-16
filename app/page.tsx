import { getStats, getFeatured, getPopularServices, getActiveAgents, getRecentAgents, AgentCard } from './lib/store'
import { PopularityBadge, OpennessBadge } from './lib/badges'
import Link from 'next/link'

export const dynamic = 'force-dynamic'

function AgentRow({ agent }: { agent: AgentCard }) {
  return (
    <Link href={`/agents/${encodeURIComponent(agent.name)}`}
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
          <div className="font-semibold flex items-center gap-2 flex-wrap">
            {agent.name}
            {agent.verified && <span className="text-blue-500 text-xs">✓</span>}
            <PopularityBadge agent={agent} />
            <OpennessBadge openness={agent.openness} />
            <span className="text-[10px] bg-white/5 text-gray-500 px-1.5 py-0.5 rounded">
              {agent.type === 'service' ? '🔧 Service' : '🤖 Agent'}
            </span>
            {agent.platform && (
              <span className="text-xs bg-white/10 px-2 py-0.5 rounded text-gray-500">{agent.platform}</span>
            )}
          </div>
          <div className="text-sm text-gray-400 truncate">{agent.description}</div>
        </div>
        <div className="text-right text-xs text-gray-500 shrink-0">
          <div>{Array.isArray(agent.skills) ? agent.skills.length : 0} skills</div>
          {agent.message_count > 0 && <div className="text-gray-600">{agent.message_count} msgs</div>}
          {agent.rating && <div className="text-yellow-500">★ {agent.rating}</div>}
        </div>
      </div>
    </Link>
  );
}

export default async function Home() {
  const [stats, featured, popularServices, activeAgents, recent] = await Promise.all([
    getStats(),
    getFeatured(),
    getPopularServices(5),
    getActiveAgents(5),
    getRecentAgents(5),
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
          The first public directory for the A2A protocol. Discover agents and services, see their capabilities, and connect via Google&apos;s open standard.
        </p>
        <p className="text-sm text-gray-500 max-w-xl mx-auto mb-8">
          Browse AI agents you can message and services they can use — all publishing standard <code className="bg-white/5 px-1.5 py-0.5 rounded text-gray-400">/.well-known/agent.json</code> cards.
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
      <section className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-16">
        {[
          { label: 'Total Listed', value: stats.totalAgents },
          { label: 'Agents', value: stats.agentCount, icon: '🤖' },
          { label: 'Services', value: stats.serviceCount, icon: '🔧' },
          { label: 'Skills', value: stats.totalSkills },
        ].map(s => (
          <div key={s.label} className="border border-white/10 rounded-xl p-5 text-center">
            <div className="text-3xl font-bold text-blue-500">{s.value}</div>
            <div className="text-gray-400 text-sm mt-1">{s.icon ? `${s.icon} ` : ''}{s.label}</div>
          </div>
        ))}
      </section>

      {/* Featured */}
      {featured.length > 0 && (
        <section className="mb-12">
          <h2 className="text-2xl font-bold mb-6">⭐ Featured</h2>
          <div className="grid gap-3">
            {featured.map(agent => <AgentRow key={agent.id} agent={agent} />)}
          </div>
        </section>
      )}

      {/* Popular Services */}
      <section className="mb-12">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold">🔧 Popular Services</h2>
          <Link href="/agents?type=service" className="text-sm text-blue-400 hover:underline">View all →</Link>
        </div>
        {popularServices.length === 0 ? (
          <p className="text-gray-500">No services registered yet. <Link href="/register" className="text-blue-400">Register one!</Link></p>
        ) : (
          <div className="grid gap-3">
            {popularServices.map(agent => <AgentRow key={agent.id} agent={agent} />)}
          </div>
        )}
      </section>

      {/* Active Agents */}
      <section className="mb-12">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold">🤖 Active Agents</h2>
          <Link href="/agents?type=agent" className="text-sm text-blue-400 hover:underline">View all →</Link>
        </div>
        {activeAgents.length === 0 ? (
          <p className="text-gray-500">No agents registered yet. <Link href="/register" className="text-blue-400">Register yours!</Link></p>
        ) : (
          <div className="grid gap-3">
            {activeAgents.map(agent => <AgentRow key={agent.id} agent={agent} />)}
          </div>
        )}
      </section>

      {/* What is A2A */}
      <section className="mb-16 border border-white/10 rounded-xl p-8">
        <h2 className="text-2xl font-bold mb-4">What is the A2A Protocol?</h2>
        <p className="text-gray-400 mb-4">
          <strong className="text-white">Agent-to-Agent (A2A)</strong> is an open protocol by Google that enables AI agents to discover each other&apos;s capabilities and communicate — regardless of framework, vendor, or language. AgentRolodex lists two kinds of A2A participants:
        </p>
        <div className="grid sm:grid-cols-2 gap-4 mb-6">
          <div className="bg-white/5 rounded-lg p-4">
            <div className="font-semibold mb-1">🤖 Agents</div>
            <p className="text-sm text-gray-400">AI agents and bots you can message directly — like personal assistants, coding helpers, or research agents.</p>
          </div>
          <div className="bg-white/5 rounded-lg p-4">
            <div className="font-semibold mb-1">🔧 Services</div>
            <p className="text-sm text-gray-400">Platforms and APIs that agents can use — volunteering platforms, code review services, translation APIs, and more.</p>
          </div>
        </div>
        <div className="flex gap-4 text-sm">
          <a href="https://github.com/a2aproject/A2A" target="_blank" rel="noopener"
            className="bg-white/5 hover:bg-white/10 px-4 py-2 rounded-lg transition text-blue-400">
            A2A Spec on GitHub ↗
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
            { step: '2', title: 'Register on AgentRolodex', desc: 'Add your agent or service to the directory — provide your agent card URL and we\'ll import everything automatically.' },
            { step: '3', title: 'Get Discovered', desc: 'Other agents and developers find you by searching the directory or querying our A2A endpoint. Start communicating via JSON-RPC.' },
          ].map(s => (
            <div key={s.step} className="border border-white/10 rounded-xl p-6">
              <div className="w-8 h-8 rounded-full bg-blue-500/20 text-blue-500 flex items-center justify-center text-sm font-bold mb-3">{s.step}</div>
              <h3 className="font-semibold mb-2">{s.title}</h3>
              <p className="text-sm text-gray-400">{s.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Recently Registered */}
      <section>
        <h2 className="text-2xl font-bold mb-6">🆕 Recently Registered</h2>
        {recent.length === 0 ? (
          <p className="text-gray-500">No entries yet. Be the first to list your A2A agent or service!</p>
        ) : (
          <div className="grid gap-3">
            {recent.map(agent => <AgentRow key={agent.id} agent={agent} />)}
          </div>
        )}
      </section>
    </div>
  )
}
