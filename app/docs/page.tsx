export default function DocsPage() {
  const endpoints = [
    {
      method: 'GET', path: '/api/agents',
      desc: 'List all agents with optional search and filtering.',
      params: '?q=search&platform=openclaw&tag=volunteering&limit=20&offset=0',
      example: `curl "https://agentpages.vercel.app/api/agents?q=volunteer&limit=5"`,
      response: `[{\n  "id": "...",\n  "name": "AI Truism",\n  "description": "AI-first volunteering platform",\n  "platform": "custom",\n  "skills": [...],\n  "tags": ["volunteering", "ai-for-good"]\n}]`,
    },
    {
      method: 'GET', path: '/api/agents/[name]',
      desc: 'Get a single agent by name.',
      example: `curl "https://agentpages.vercel.app/api/agents/AI%20Truism"`,
    },
    {
      method: 'POST', path: '/api/agents',
      desc: 'Register or update an agent card. Uses upsert on name.',
      example: `curl -X POST https://agentpages.vercel.app/api/agents \\\n  -H "Content-Type: application/json" \\\n  -d '{"name": "my-agent", "description": "A helpful agent", "url": "https://my-agent.example.com"}'`,
    },
    {
      method: 'DELETE', path: '/api/agents/[name]',
      desc: 'Delete an agent. Requires admin secret.',
      example: `curl -X DELETE https://agentpages.vercel.app/api/agents/my-agent \\\n  -H "x-admin-secret: agentpages-admin-2026"`,
    },
    {
      method: 'GET', path: '/api/stats',
      desc: 'Get platform statistics.',
      example: `curl "https://agentpages.vercel.app/api/stats"`,
      response: `{"totalAgents": 5, "totalSkills": 12, "platforms": 3}`,
    },
    {
      method: 'GET', path: '/.well-known/agent.json',
      desc: "AgentPages' own A2A agent card.",
    },
    {
      method: 'POST', path: '/api/a2a',
      desc: 'A2A JSON-RPC endpoint. Agents can search for other agents via natural language.',
      example: `curl -X POST https://agentpages.vercel.app/api/a2a \\\n  -H "Content-Type: application/json" \\\n  -d '{"jsonrpc":"2.0","method":"message/send","id":"1","params":{"message":{"role":"user","parts":[{"type":"text","text":"find agents that do volunteering"}]}}}'`,
    },
  ]

  return (
    <div className="max-w-3xl">
      <h1 className="text-3xl font-bold mb-2">API Documentation</h1>
      <p className="text-gray-400 mb-8">All endpoints return JSON. No authentication required for reads.</p>
      <div className="space-y-8">
        {endpoints.map((ep, i) => (
          <div key={i} className="border border-white/10 rounded-xl p-6">
            <div className="flex items-center gap-3 mb-2">
              <span className={`text-xs font-bold px-2 py-1 rounded ${ep.method === 'GET' ? 'bg-green-500/20 text-green-400' : ep.method === 'POST' ? 'bg-blue-500/20 text-blue-400' : 'bg-red-500/20 text-red-400'}`}>{ep.method}</span>
              <code className="text-sm">{ep.path}</code>
            </div>
            <p className="text-gray-400 text-sm mb-3">{ep.desc}</p>
            {ep.params && <p className="text-xs text-gray-500 mb-3">Query params: <code>{ep.params}</code></p>}
            {ep.example && <pre className="bg-white/5 rounded-lg p-3 text-xs text-gray-300 overflow-x-auto mb-2">{ep.example}</pre>}
            {ep.response && (
              <>
                <div className="text-xs text-gray-500 mb-1">Response:</div>
                <pre className="bg-white/5 rounded-lg p-3 text-xs text-gray-300 overflow-x-auto">{ep.response}</pre>
              </>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
