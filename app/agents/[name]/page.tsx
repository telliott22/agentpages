import { getAgentByName } from '../../lib/store'
import { notFound } from 'next/navigation'

export const dynamic = 'force-dynamic'

export default async function AgentProfile({ params }: { params: { name: string } }) {
  const agent = await getAgentByName(decodeURIComponent(params.name))
  if (!agent) notFound()

  const skills = Array.isArray(agent.skills) ? agent.skills : []

  return (
    <div className="max-w-3xl">
      <div className="flex items-center gap-4 mb-8">
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

      <div className="grid sm:grid-cols-2 gap-4 mb-8">
        {[
          { label: 'Platform', value: agent.platform },
          { label: 'Protocol', value: agent.protocol_version },
          { label: 'URL', value: agent.url, link: true },
          { label: 'Agent Card', value: agent.agent_card_url, link: true },
          { label: 'Contact', value: agent.contact },
          { label: 'Registered', value: agent.created_at ? new Date(agent.created_at).toLocaleDateString() : undefined },
        ].filter(m => m.value).map(m => (
          <div key={m.label} className="border border-white/10 rounded-lg p-3">
            <div className="text-xs text-gray-500 uppercase">{m.label}</div>
            {m.link ? (
              <a href={m.value} target="_blank" rel="noopener" className="text-blue-400 hover:underline text-sm break-all">{m.value}</a>
            ) : (
              <div className="text-sm">{m.value}</div>
            )}
          </div>
        ))}
      </div>

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

      <div className="flex gap-4 mb-8">
        <div>
          <span className="text-xs text-gray-500">Input: </span>
          {(agent.input_modes || ['text']).map((m: string) => (
            <span key={m} className="text-xs bg-white/5 px-2 py-0.5 rounded mr-1">{m}</span>
          ))}
        </div>
        <div>
          <span className="text-xs text-gray-500">Output: </span>
          {(agent.output_modes || ['text']).map((m: string) => (
            <span key={m} className="text-xs bg-white/5 px-2 py-0.5 rounded mr-1">{m}</span>
          ))}
        </div>
      </div>

      <h2 className="text-xl font-bold mb-4">Skills ({skills.length})</h2>
      {skills.length === 0 ? (
        <p className="text-gray-500">No skills listed.</p>
      ) : (
        <div className="space-y-3 mb-8">
          {skills.map((s: any, i: number) => (
            <div key={i} className="border border-white/10 rounded-lg p-4">
              <div className="font-medium">{s.name || s.id}</div>
              {s.description && <p className="text-sm text-gray-400 mt-1">{s.description}</p>}
              {s.tags?.length > 0 && (
                <div className="mt-2 flex gap-1">
                  {s.tags.map((t: string) => (
                    <span key={t} className="text-xs bg-white/5 px-2 py-0.5 rounded">{t}</span>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      <h2 className="text-xl font-bold mb-4">Try messaging this agent</h2>
      <pre className="bg-white/5 border border-white/10 rounded-lg p-4 text-sm overflow-x-auto text-gray-300">
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
    </div>
  )
}
