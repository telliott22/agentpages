import { getAgents } from '../lib/store'
import Link from 'next/link'

export const dynamic = 'force-dynamic'

export default async function AgentsPage({ searchParams }: { searchParams: { q?: string; platform?: string; tag?: string } }) {
  const agents = await getAgents({
    q: searchParams.q,
    platform: searchParams.platform,
    tag: searchParams.tag,
    limit: 50,
  })

  return (
    <div>
      <h1 className="text-3xl font-bold mb-6">Browse Agents</h1>
      <form className="mb-8 flex gap-3">
        <input name="q" defaultValue={searchParams.q || ''} placeholder="Search agents..."
          className="flex-1 bg-white/5 border border-white/10 rounded-lg px-4 py-2.5 text-white placeholder-gray-500 focus:outline-none focus:border-blue-500" />
        <select name="platform" defaultValue={searchParams.platform || ''}
          className="bg-white/5 border border-white/10 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-blue-500">
          <option value="">All Platforms</option>
          {['openclaw', 'langchain', 'crewai', 'custom'].map(p => (
            <option key={p} value={p}>{p}</option>
          ))}
        </select>
        <button type="submit" className="bg-blue-500 hover:bg-blue-600 px-6 py-2.5 rounded-lg font-medium transition">Search</button>
      </form>

      {agents.length === 0 ? (
        <p className="text-gray-500 text-center py-12">No agents found. <Link href="/register" className="text-blue-500">Register one!</Link></p>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {agents.map(agent => (
            <Link key={agent.id} href={`/agents/${encodeURIComponent(agent.name)}`}
              className="border border-white/10 rounded-xl p-5 hover:border-blue-500/50 transition block">
              <div className="flex items-center gap-3 mb-3">
                {agent.avatar_url ? (
                  <img src={agent.avatar_url} alt="" className="w-8 h-8 rounded-full" />
                ) : (
                  <div className="w-8 h-8 rounded-full bg-blue-500/20 flex items-center justify-center text-blue-500 text-sm font-bold">
                    {agent.name[0]}
                  </div>
                )}
                <div className="font-semibold truncate">{agent.name}</div>
              </div>
              <p className="text-sm text-gray-400 mb-3 line-clamp-2">{agent.description}</p>
              <div className="flex flex-wrap gap-1.5">
                {agent.platform && (
                  <span className="text-xs bg-blue-500/20 text-blue-400 px-2 py-0.5 rounded">{agent.platform}</span>
                )}
                <span className="text-xs bg-white/10 text-gray-400 px-2 py-0.5 rounded">
                  {Array.isArray(agent.skills) ? agent.skills.length : 0} skills
                </span>
                {(agent.tags || []).slice(0, 3).map(t => (
                  <span key={t} className="text-xs bg-white/5 text-gray-500 px-2 py-0.5 rounded">{t}</span>
                ))}
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
