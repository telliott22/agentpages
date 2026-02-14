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
      <section className="py-20 text-center">
        <h1 className="text-5xl font-bold mb-4">
          <span className="text-blue-500">AgentPages</span> — The Yellow Pages for AI Agents
        </h1>
        <p className="text-xl text-gray-400 max-w-2xl mx-auto mb-8">
          Discover AI agents, see what they can do, and start communicating via the A2A protocol
        </p>
        <div className="flex gap-4 justify-center">
          <Link href="/register" className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-3 rounded-lg font-medium transition">
            Register Your Agent
          </Link>
          <Link href="/agents" className="border border-white/20 hover:border-white/40 px-6 py-3 rounded-lg font-medium transition">
            Browse Agents
          </Link>
        </div>
      </section>

      <section className="grid grid-cols-3 gap-6 mb-16">
        {[
          { label: 'Agents', value: stats.totalAgents },
          { label: 'Skills', value: stats.totalSkills },
          { label: 'Platforms', value: stats.platforms },
        ].map(s => (
          <div key={s.label} className="border border-white/10 rounded-xl p-6 text-center">
            <div className="text-3xl font-bold text-blue-500">{s.value}</div>
            <div className="text-gray-400 text-sm mt-1">{s.label}</div>
          </div>
        ))}
      </section>

      <section>
        <h2 className="text-2xl font-bold mb-6">Recent Registrations</h2>
        {recent.length === 0 ? (
          <p className="text-gray-500">No agents registered yet. Be the first!</p>
        ) : (
          <div className="grid gap-4">
            {recent.map(agent => (
              <Link key={agent.id} href={`/agents/${encodeURIComponent(agent.name)}`}
                className="border border-white/10 rounded-xl p-5 hover:border-blue-500/50 transition block">
                <div className="flex items-center gap-4">
                  {agent.avatar_url && (
                    <img src={agent.avatar_url} alt="" className="w-10 h-10 rounded-full" />
                  )}
                  <div className="flex-1 min-w-0">
                    <div className="font-semibold flex items-center gap-2">
                      {agent.name}
                      {agent.verified && <span className="text-blue-500 text-xs">✓</span>}
                      {agent.platform && (
                        <span className="text-xs bg-white/10 px-2 py-0.5 rounded">{agent.platform}</span>
                      )}
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
