'use client'

import { useState } from 'react'

export default function RegisterPage() {
  const [mode, setMode] = useState<'url' | 'manual'>('url')
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<any>(null)
  const [error, setError] = useState('')

  async function handleFetchCard(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setLoading(true); setError(''); setResult(null)
    const fd = new FormData(e.currentTarget)
    const cardUrl = fd.get('card_url') as string
    try {
      const res = await fetch(cardUrl)
      if (!res.ok) throw new Error('Failed to fetch agent card')
      const card = await res.json()
      const reg = await fetch('/api/agents', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: card.name,
          description: card.description,
          url: card.url || cardUrl.replace('/.well-known/agent.json', ''),
          agent_card_url: cardUrl,
          provider_org: card.provider?.organization,
          provider_url: card.provider?.url,
          skills: card.skills || [],
          tags: card.tags || [],
          platform: fd.get('platform') || 'custom',
          type: fd.get('type') || 'agent',
          version: card.version,
          protocol_version: card.protocolVersion || card.protocol_version || '0.3.0',
          capabilities: card.capabilities || {},
          input_modes: card.defaultInputModes || ['text'],
          output_modes: card.defaultOutputModes || ['text'],
        }),
      })
      if (!reg.ok) throw new Error(await reg.text())
      setResult(await reg.json())
    } catch (err: any) { setError(err.message) }
    setLoading(false)
  }

  async function handleManual(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setLoading(true); setError(''); setResult(null)
    const fd = new FormData(e.currentTarget)
    try {
      const body: any = {
        name: fd.get('name'),
        description: fd.get('description'),
        url: fd.get('url'),
        platform: fd.get('platform') || 'custom',
        type: fd.get('type') || 'agent',
        contact: fd.get('contact') || undefined,
        avatar_url: fd.get('avatar_url') || undefined,
        agent_card_url: fd.get('agent_card_url') || undefined,
        tags: (fd.get('tags') as string || '').split(',').map(t => t.trim()).filter(Boolean),
        likes: (fd.get('likes') as string || '').split(',').map(t => t.trim()).filter(Boolean),
      }
      const res = await fetch('/api/agents', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })
      if (!res.ok) throw new Error(await res.text())
      setResult(await res.json())
    } catch (err: any) { setError(err.message) }
    setLoading(false)
  }

  const inputClass = "w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2.5 text-white placeholder-gray-500 focus:outline-none focus:border-blue-500"

  return (
    <div className="max-w-2xl">
      <h1 className="text-3xl font-bold mb-2">Register Your A2A Agent</h1>
      <p className="text-gray-400 mb-2">
        Add your agent to the A2A directory so other agents can discover and communicate with it.
      </p>
      <p className="text-sm text-gray-500 mb-8">
        If your agent publishes a standard <code className="bg-white/5 px-1.5 py-0.5 rounded text-gray-400">/.well-known/agent.json</code> card (<a href="https://github.com/a2aproject/A2A" target="_blank" rel="noopener" className="text-blue-400 hover:underline">A2A spec</a>), just provide the URL and we&apos;ll import everything automatically.
      </p>

      {/* Toggle */}
      <div className="flex gap-2 mb-8">
        <button onClick={() => setMode('url')}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition ${mode === 'url' ? 'bg-blue-500 text-white' : 'bg-white/5 text-gray-400'}`}>
          From Agent Card URL (recommended)
        </button>
        <button onClick={() => setMode('manual')}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition ${mode === 'manual' ? 'bg-blue-500 text-white' : 'bg-white/5 text-gray-400'}`}>
          Manual Entry
        </button>
      </div>

      {mode === 'url' ? (
        <form onSubmit={handleFetchCard} className="space-y-4">
          <div>
            <label className="block text-sm text-gray-400 mb-1">A2A Agent Card URL</label>
            <input name="card_url" required placeholder="https://your-agent.com/.well-known/agent.json" className={inputClass} />
            <p className="text-xs text-gray-600 mt-1">The URL to your agent&apos;s A2A agent card JSON</p>
          </div>
          <div>
            <label className="block text-sm text-gray-400 mb-1">Type</label>
            <select name="type" className={inputClass}>
              <option value="agent">🤖 Agent — an AI agent that can be messaged</option>
              <option value="service">🔧 Service — a platform/API agents can use</option>
            </select>
          </div>
          <div>
            <label className="block text-sm text-gray-400 mb-1">Platform / Framework</label>
            <select name="platform" className={inputClass}>
              {['custom', 'openclaw', 'langchain', 'crewai'].map(p => <option key={p} value={p}>{p}</option>)}
            </select>
          </div>
          <button type="submit" disabled={loading}
            className="bg-blue-500 hover:bg-blue-600 disabled:opacity-50 px-6 py-2.5 rounded-lg font-medium transition">
            {loading ? 'Fetching Agent Card...' : 'Fetch & Register A2A Agent'}
          </button>
        </form>
      ) : (
        <form onSubmit={handleManual} className="space-y-4">
          {[
            { name: 'name', label: 'Agent Name', required: true, placeholder: 'my-cool-agent' },
            { name: 'description', label: 'Description', required: true, placeholder: 'What does your agent do?' },
            { name: 'url', label: 'Agent URL', required: true, placeholder: 'https://my-agent.example.com' },
            { name: 'agent_card_url', label: 'Agent Card URL (/.well-known/agent.json)', placeholder: 'https://my-agent.example.com/.well-known/agent.json' },
            { name: 'tags', label: 'Tags (comma-separated)', placeholder: 'ai, coding, helpful' },
            { name: 'likes', label: 'Likes (comma-separated)', placeholder: 'open source, helping people' },
            { name: 'contact', label: 'Contact', placeholder: '@twitter or email' },
            { name: 'avatar_url', label: 'Avatar URL', placeholder: 'https://...' },
          ].map(f => (
            <div key={f.name}>
              <label className="block text-sm text-gray-400 mb-1">{f.label}</label>
              <input name={f.name} required={f.required} placeholder={f.placeholder} className={inputClass} />
            </div>
          ))}
          <div>
            <label className="block text-sm text-gray-400 mb-1">Type</label>
            <select name="type" className={inputClass}>
              <option value="agent">🤖 Agent — an AI agent that can be messaged</option>
              <option value="service">🔧 Service — a platform/API agents can use</option>
            </select>
          </div>
          <div>
            <label className="block text-sm text-gray-400 mb-1">Platform / Framework</label>
            <select name="platform" className={inputClass}>
              {['custom', 'openclaw', 'langchain', 'crewai'].map(p => <option key={p} value={p}>{p}</option>)}
            </select>
          </div>
          <button type="submit" disabled={loading}
            className="bg-blue-500 hover:bg-blue-600 disabled:opacity-50 px-6 py-2.5 rounded-lg font-medium transition">
            {loading ? 'Registering...' : 'Register A2A Agent'}
          </button>
        </form>
      )}

      {error && <div className="mt-6 bg-red-500/10 border border-red-500/20 rounded-lg p-4 text-red-400">{error}</div>}
      {result && (
        <div className="mt-6 bg-green-500/10 border border-green-500/20 rounded-lg p-4">
          <div className="text-green-400 font-medium mb-2">✓ A2A Agent registered!</div>
          <a href={`/agents/${encodeURIComponent(result.name)}`} className="text-blue-400 hover:underline">
            View {result.name} in the directory →
          </a>
        </div>
      )}

      {/* A2A info box */}
      <div className="mt-12 border border-white/10 rounded-xl p-6 text-sm">
        <h3 className="font-semibold mb-2">What is an A2A Agent Card?</h3>
        <p className="text-gray-400 mb-3">
          An Agent Card is a JSON document published at <code className="bg-white/5 px-1 py-0.5 rounded text-gray-300">/.well-known/agent.json</code> that describes your agent&apos;s identity, skills, and capabilities according to the <a href="https://a2a-protocol.org" target="_blank" rel="noopener" className="text-blue-400 hover:underline">A2A protocol spec</a>.
        </p>
        <pre className="bg-white/5 rounded-lg p-3 text-xs text-gray-400 overflow-x-auto">{`{
  "name": "My Agent",
  "description": "What my agent does",
  "url": "https://my-agent.com",
  "protocolVersion": "0.3.0",
  "capabilities": { "streaming": false },
  "defaultInputModes": ["text"],
  "defaultOutputModes": ["text"],
  "skills": [
    { "id": "skill1", "name": "Do Thing", "description": "..." }
  ]
}`}</pre>
      </div>
    </div>
  )
}
