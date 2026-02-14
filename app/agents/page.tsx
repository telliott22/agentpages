import { getAgents, AgentCard } from '../lib/store'
import { PopularityBadge, OpennessBadge } from '../lib/badges'
import Link from 'next/link'

export const dynamic = 'force-dynamic'

export default async function AgentsPage({ searchParams }: { searchParams: { q?: string; platform?: string; tag?: string; type?: string; sort?: string } }) {
  const agents = await getAgents({
    q: searchParams.q,
    platform: searchParams.platform,
    tag: searchParams.tag,
    type: searchParams.type,
    sort: searchParams.sort,
    limit: 50,
  })

  const currentType = searchParams.type || '';
  const currentSort = searchParams.sort || 'popular';

  // Build query string preserving other params
  function tabUrl(type: string) {
    const p = new URLSearchParams();
    if (searchParams.q) p.set('q', searchParams.q);
    if (searchParams.platform) p.set('platform', searchParams.platform);
    if (searchParams.sort) p.set('sort', searchParams.sort);
    if (type) p.set('type', type);
    const qs = p.toString();
    return `/agents${qs ? `?${qs}` : ''}`;
  }

  function sortUrl(sort: string) {
    const p = new URLSearchParams();
    if (searchParams.q) p.set('q', searchParams.q);
    if (searchParams.platform) p.set('platform', searchParams.platform);
    if (searchParams.type) p.set('type', searchParams.type);
    if (sort && sort !== 'popular') p.set('sort', sort);
    const qs = p.toString();
    return `/agents${qs ? `?${qs}` : ''}`;
  }

  return (
    <div>
      <h1 className="text-3xl font-bold mb-2">A2A Directory</h1>
      <p className="text-gray-400 mb-6">Browse agents and services in the <a href="https://github.com/a2aproject/A2A" target="_blank" rel="noopener" className="text-blue-400 hover:underline">A2A</a> ecosystem. Sorted by popularity.</p>

      {/* Type tabs */}
      <div className="flex gap-2 mb-6">
        {[
          { label: 'All', value: '' },
          { label: '🤖 Agents', value: 'agent' },
          { label: '🔧 Services', value: 'service' },
        ].map(tab => (
          <Link key={tab.value} href={tabUrl(tab.value)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition ${currentType === tab.value ? 'bg-blue-500 text-white' : 'bg-white/5 text-gray-400 hover:bg-white/10'}`}>
            {tab.label}
          </Link>
        ))}
        <div className="flex-1" />
        {/* Sort */}
        <div className="flex gap-1 text-xs">
          {[
            { label: 'Popular', value: 'popular' },
            { label: 'Newest', value: 'newest' },
            { label: 'Name', value: 'name' },
          ].map(s => (
            <Link key={s.value} href={sortUrl(s.value)}
              className={`px-3 py-2 rounded-lg transition ${currentSort === s.value ? 'bg-white/10 text-white' : 'text-gray-500 hover:text-gray-300'}`}>
              {s.label}
            </Link>
          ))}
        </div>
      </div>

      {/* Search */}
      <form className="mb-8 flex gap-3">
        {searchParams.type && <input type="hidden" name="type" value={searchParams.type} />}
        {searchParams.sort && <input type="hidden" name="sort" value={searchParams.sort} />}
        <input name="q" defaultValue={searchParams.q || ''} placeholder="Search agents & services..."
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

      {/* Grid */}
      {agents.length === 0 ? (
        <div className="text-center py-16">
          <p className="text-gray-500 mb-2">No {currentType === 'service' ? 'services' : currentType === 'agent' ? 'agents' : 'entries'} found.</p>
          <Link href="/register" className="text-blue-500 hover:underline">Register one!</Link>
        </div>
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
                <div className="font-semibold truncate flex-1">{agent.name}</div>
                <span className="text-[10px] text-gray-600">
                  {agent.type === 'service' ? '🔧' : '🤖'}
                </span>
              </div>
              <p className="text-sm text-gray-400 mb-3 line-clamp-2">{agent.description}</p>
              <div className="flex flex-wrap gap-1.5 items-center">
                <OpennessBadge openness={agent.openness} />
                <PopularityBadge agent={agent} />
                {agent.platform && (
                  <span className="text-xs bg-blue-500/20 text-blue-400 px-2 py-0.5 rounded">{agent.platform}</span>
                )}
                <span className="text-xs bg-white/10 text-gray-400 px-2 py-0.5 rounded">
                  {Array.isArray(agent.skills) ? agent.skills.length : 0} skills
                </span>
                {agent.message_count > 0 && (
                  <span className="text-xs text-gray-600">{agent.message_count} msgs</span>
                )}
                {agent.rating && (
                  <span className="text-xs text-yellow-500">★ {agent.rating}</span>
                )}
              </div>
              <div className="flex flex-wrap gap-1 mt-2">
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
