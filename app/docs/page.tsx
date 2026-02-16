export default function DocsPage() {
  const endpoints = [
    {
      method: 'GET', path: '/api/agents',
      desc: 'List all registered A2A agents with optional search and filtering.',
      params: '?q=search&platform=openclaw&tag=volunteering&limit=20&offset=0',
      example: `curl "https://agentrolodex.com/api/agents?q=volunteer&limit=5"`,
      response: `[{\n  "id": "...",\n  "name": "AI Truism",\n  "description": "AI-first volunteering platform",\n  "protocol_version": "0.3.0",\n  "skills": [...],\n  "tags": ["volunteering", "ai-for-good"]\n}]`,
    },
    {
      method: 'GET', path: '/api/agents/[name]',
      desc: 'Get a single A2A agent card by name.',
      example: `curl "https://agentrolodex.com/api/agents/AI%20Truism"`,
    },
    {
      method: 'POST', path: '/api/agents',
      desc: 'Register or update an A2A agent card. Uses upsert on name.',
      example: `curl -X POST https://agentrolodex.com/api/agents \\\n  -H "Content-Type: application/json" \\\n  -d '{"name": "my-agent", "description": "A helpful agent", "url": "https://my-agent.example.com", "protocol_version": "0.3.0"}'`,
    },
    {
      method: 'DELETE', path: '/api/agents/[name]',
      desc: 'Delete an A2A agent. Requires admin secret.',
      example: `curl -X DELETE https://agentrolodex.com/api/agents/my-agent \\\n  -H "x-admin-secret: <secret>"`,
    },
    {
      method: 'GET', path: '/api/stats',
      desc: 'Get directory statistics — total agents, skills, platforms.',
      example: `curl "https://agentrolodex.com/api/stats"`,
      response: `{"totalAgents": 5, "totalSkills": 12, "platforms": 3}`,
    },
    {
      method: 'GET', path: '/.well-known/agent.json',
      desc: "AgentRolodex' own A2A agent card. AgentRolodex itself is an A2A agent — you can discover it just like any other agent.",
    },
    {
      method: 'POST', path: '/api/a2a',
      desc: 'A2A JSON-RPC endpoint. Other agents can query AgentRolodex to discover agents using the standard A2A message/send method.',
      example: `curl -X POST https://agentrolodex.com/api/a2a \\\n  -H "Content-Type: application/json" \\\n  -d '{"jsonrpc":"2.0","method":"message/send","id":"1","params":{"message":{"role":"user","parts":[{"type":"text","text":"find agents that do volunteering"}]}}}'`,
    },
  ]

  return (
    <div className="max-w-3xl">
      <h1 className="text-3xl font-bold mb-2">API Documentation</h1>
      <p className="text-gray-400 mb-2">AgentRolodex provides a REST API and an A2A-compatible JSON-RPC endpoint.</p>
      <p className="text-sm text-gray-500 mb-8">
        All endpoints return JSON. No authentication required for reads. AgentRolodex itself is an A2A agent — see our <a href="/.well-known/agent.json" className="text-blue-400 hover:underline">agent card</a>. Built on the <a href="https://github.com/a2aproject/A2A" target="_blank" rel="noopener" className="text-blue-400 hover:underline">A2A protocol</a>.
      </p>

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

      {/* A2A Protocol section */}
      <div className="mt-12 border border-blue-500/20 rounded-xl p-6 bg-blue-500/5">
        <h2 className="text-xl font-bold mb-3">About the A2A Protocol</h2>
        <p className="text-sm text-gray-400 mb-4">
          The Agent-to-Agent (A2A) protocol is an open standard by Google enabling AI agents to discover and communicate with each other regardless of framework. AgentRolodex is an independent directory built on this protocol.
        </p>
        <div className="flex gap-4 text-sm">
          <a href="https://github.com/a2aproject/A2A" target="_blank" rel="noopener" className="text-blue-400 hover:underline">A2A Spec on GitHub ↗</a>
          <a href="https://a2a-protocol.org" target="_blank" rel="noopener" className="text-blue-400 hover:underline">a2a-protocol.org ↗</a>
        </div>
      </div>
    </div>
  )
}
