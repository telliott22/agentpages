import { getAgentByName } from '../../lib/store'
import { notFound } from 'next/navigation'

export const dynamic = 'force-dynamic'

export default async function AgentProfile({ params }: { params: { name: string } }) {
  const agent = await getAgentByName(decodeURIComponent(params.name))
  if (!agent) notFound()

  const skills = Array.isArray(agent.skills) ? agent.skills : []

  return (
    <div className="max-w-3xl">
      {/* Header */}
      <div className="flex items-center gap-4 mb-6">
        {agent.avatar_url ? (
          <img src={agent.avatar_url} alt="" className="w-16 h-16 rounded-full" />
        ) : (
          <div className="w-16 h-16 rounded-full bg-blue-500/20 flex items-center justify-center text-blue-500 text-2xl font-bold">
            {agent.name[0]}
          </div>
        )}
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            {agent.name}
            {agent.verified && <span className="text-blue-500 text-lg">✓ verified</span>}
          </h1>
          <p className="text-gray-400">{agent.description}</p>
        </div>
      </div>

      {/* Badges */}
      <div className="flex items-center gap-3 mb-8 flex-wrap">
        <span className="bg-white/5 text-gray-300 text-xs px-3 py-1 rounded-full border border-white/10">
          {agent.type === 'service' ? '🔧 Service' : '🤖 Agent'}
        </span>
        <span className="bg-blue-500/10 text-blue-400 text-xs px-3 py-1 rounded-full border border-blue-500/20">
          A2A Protocol v{agent.protocol_version || '0.3.0'}
        </span>
        {agent.platform && (
          <span className="bg-white/5 text-gray-400 text-xs px-3 py-1 rounded-full border border-white/10">
            {agent.platform}
          </span>
        )}
        {agent.featured && (
          <span className="bg-yellow-500/10 text-yellow-400 text-xs px-3 py-1 rounded-full border border-yellow-500/20">⭐ Featured</span>
        )}
        {agent.message_count >= 100 && (
          <span className="bg-orange-500/10 text-orange-400 text-xs px-3 py-1 rounded-full border border-orange-500/20">🔥 Popular</span>
        )}
        {agent.rating && agent.rating >= 4.5 && (
          <span className="bg-green-500/10 text-green-400 text-xs px-3 py-1 rounded-full border border-green-500/20">⭐ Top Rated</span>
        )}
      </div>

      {/* Stats row */}
      {(agent.message_count > 0 || agent.rating) && (
        <div className="flex gap-6 mb-8 text-sm">
          {agent.message_count > 0 && (
            <div><span className="text-gray-500">Messages:</span> <span className="text-white font-medium">{agent.message_count.toLocaleString()}</span></div>
          )}
          {agent.rating && (
            <div><span className="text-gray-500">Rating:</span> <span className="text-yellow-400 font-medium">★ {agent.rating}</span></div>
          )}
        </div>
      )}

      {/* A2A Details */}
      <div className="border border-white/10 rounded-xl p-6 mb-8">
        <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-4">A2A Agent Card</h2>
        <div className="grid sm:grid-cols-2 gap-4">
          <div>
            <div className="text-xs text-gray-500 mb-1">Agent URL</div>
            <a href={agent.url} target="_blank" rel="noopener" className="text-blue-400 hover:underline text-sm break-all">{agent.url}</a>
          </div>
          {agent.agent_card_url && (
            <div>
              <div className="text-xs text-gray-500 mb-1">Agent Card (/.well-known/agent.json)</div>
              <a href={agent.agent_card_url} target="_blank" rel="noopener" className="text-blue-400 hover:underline text-sm break-all">{agent.agent_card_url}</a>
            </div>
          )}
          <div>
            <div className="text-xs text-gray-500 mb-1">Protocol Version</div>
            <div className="text-sm">A2A v{agent.protocol_version || '0.3.0'}</div>
          </div>
          <div>
            <div className="text-xs text-gray-500 mb-1">Registered</div>
            <div className="text-sm">{agent.created_at ? new Date(agent.created_at).toLocaleDateString() : '—'}</div>
          </div>
          {agent.provider_org && (
            <div>
              <div className="text-xs text-gray-500 mb-1">Provider</div>
              <div className="text-sm">
                {agent.provider_url ? (
                  <a href={agent.provider_url} target="_blank" rel="noopener" className="text-blue-400 hover:underline">{agent.provider_org}</a>
                ) : agent.provider_org}
              </div>
            </div>
          )}
          {agent.contact && (
            <div>
              <div className="text-xs text-gray-500 mb-1">Contact</div>
              <div className="text-sm">{agent.contact}</div>
            </div>
          )}
        </div>
      </div>

      {/* I/O Modes — A2A specific */}
      <div className="border border-white/10 rounded-xl p-6 mb-8">
        <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-4">A2A Capabilities</h2>
        <div className="grid sm:grid-cols-2 gap-4">
          <div>
            <div className="text-xs text-gray-500 mb-2">Input Modes</div>
            <div className="flex flex-wrap gap-1.5">
              {(agent.input_modes || ['text']).map((m: string) => (
                <span key={m} className="text-xs bg-blue-500/10 text-blue-400 px-2.5 py-1 rounded border border-blue-500/20">{m}</span>
              ))}
            </div>
          </div>
          <div>
            <div className="text-xs text-gray-500 mb-2">Output Modes</div>
            <div className="flex flex-wrap gap-1.5">
              {(agent.output_modes || ['text']).map((m: string) => (
                <span key={m} className="text-xs bg-blue-500/10 text-blue-400 px-2.5 py-1 rounded border border-blue-500/20">{m}</span>
              ))}
            </div>
          </div>
          {agent.capabilities && Object.keys(agent.capabilities).length > 0 && (
            <div className="sm:col-span-2">
              <div className="text-xs text-gray-500 mb-2">Capabilities</div>
              <div className="flex flex-wrap gap-1.5">
                {Object.entries(agent.capabilities).map(([k, v]) => (
                  <span key={k} className={`text-xs px-2.5 py-1 rounded border ${v ? 'bg-green-500/10 text-green-400 border-green-500/20' : 'bg-white/5 text-gray-500 border-white/10'}`}>
                    {k}: {String(v)}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Tags & Likes */}
      {((agent.tags && agent.tags.length > 0) || (agent.likes && agent.likes.length > 0)) && (
        <div className="mb-8">
          {agent.tags && agent.tags.length > 0 && (
            <div className="mb-3">
              <span className="text-sm text-gray-500 mr-2">Tags:</span>
              {agent.tags.map((t: string) => (
                <span key={t} className="text-xs bg-blue-500/20 text-blue-400 px-2 py-1 rounded mr-1">{t}</span>
              ))}
            </div>
          )}
          {agent.likes && agent.likes.length > 0 && (
            <div>
              <span className="text-sm text-gray-500 mr-2">Likes:</span>
              {agent.likes.map((l: string) => (
                <span key={l} className="text-xs bg-white/10 text-gray-400 px-2 py-1 rounded mr-1">{l}</span>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Skills */}
      <h2 className="text-xl font-bold mb-4">A2A Skills ({skills.length})</h2>
      {skills.length === 0 ? (
        <p className="text-gray-500 mb-8">No skills listed in agent card.</p>
      ) : (
        <div className="space-y-3 mb-8">
          {skills.map((s: any, i: number) => (
            <div key={i} className="border border-white/10 rounded-lg p-4">
              <div className="font-medium">{s.name || s.id}</div>
              {s.description && <p className="text-sm text-gray-400 mt-1">{s.description}</p>}
              {s.tags?.length > 0 && (
                <div className="mt-2 flex gap-1">
                  {s.tags.map((t: string) => (
                    <span key={t} className="text-xs bg-white/5 px-2 py-0.5 rounded text-gray-500">{t}</span>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Connect via A2A */}
      <div className="border border-blue-500/20 rounded-xl p-6 bg-blue-500/5">
        <h2 className="text-xl font-bold mb-2">Connect via A2A</h2>
        <p className="text-sm text-gray-400 mb-4">
          Send a JSON-RPC message to this agent using the A2A protocol&apos;s <code className="bg-white/5 px-1 py-0.5 rounded text-gray-300">message/send</code> method:
        </p>
        <pre className="bg-[#0a0a0a] border border-white/10 rounded-lg p-4 text-sm overflow-x-auto text-gray-300">
{`curl -X POST ${agent.url}/api/a2a \\
  -H "Content-Type: application/json" \\
  -d '{
  "jsonrpc": "2.0",
  "method": "message/send",
  "id": "1",
  "params": {
    "message": {
      "role": "user",
      "parts": [{"type": "text", "text": "Hello!"}]
    }
  }
}'`}
        </pre>
        <p className="text-xs text-gray-500 mt-3">
          Learn more about the A2A protocol at <a href="https://a2a-protocol.org" target="_blank" rel="noopener" className="text-blue-400 hover:underline">a2a-protocol.org</a>
        </p>
      </div>
    </div>
  )
}
