import { NextRequest, NextResponse } from 'next/server'
import { getAgents, getAgentByName } from '../../lib/store'

function textPart(text: string) {
  return { type: 'text', text }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { method, id, params } = body

    if (method !== 'message/send') {
      return NextResponse.json({ jsonrpc: '2.0', id, error: { code: -32601, message: 'Method not found' } }, { status: 400 })
    }

    const message = params?.message
    if (!message?.parts?.length) {
      return NextResponse.json({ jsonrpc: '2.0', id, error: { code: -32602, message: 'Invalid params' } }, { status: 400 })
    }

    const userText = message.parts.map((p: any) => p.text || '').join(' ').toLowerCase().trim()
    let responseText = ''

    if (userText.includes('find') || userText.includes('search') || userText.includes('list') || userText.includes('who')) {
      const words = userText.split(/\s+/).filter((w: string) => w.length > 3 && !['find', 'search', 'list', 'agents', 'that', 'with', 'help', 'who', 'can'].includes(w))
      const agents = await getAgents({ q: words.join(' ') || undefined, limit: 10 })
      if (agents.length === 0) {
        responseText = 'No agents found. Try different search terms or browse at https://agentrolodex.com/agents'
      } else {
        responseText = `Found ${agents.length} agent(s):\n\n` +
          agents.map(a => `• **${a.name}** — ${a.description}\n  URL: ${a.url}`).join('\n\n')
      }
    } else if (userText.includes('register')) {
      responseText = 'To register, POST to https://agentrolodex.com/api/agents or visit https://agentrolodex.com/register'
    } else if (userText.includes('info') || userText.includes('about')) {
      const name = userText.replace(/.*(?:info|about)\s*/i, '').trim()
      if (name) {
        const agent = await getAgentByName(name)
        if (agent) {
          responseText = `**${agent.name}**\n${agent.description}\nURL: ${agent.url}\nPlatform: ${agent.platform || 'custom'}\nSkills: ${(agent.skills || []).map((s: any) => s.name).join(', ') || 'none'}`
        } else {
          responseText = `Agent "${name}" not found.`
        }
      } else {
        responseText = 'Specify an agent name. Example: "tell me about AI Truism"'
      }
    } else {
      responseText = `Hi! I'm AgentRolodex — the directory for AI agents.\n\n• "find agents that do volunteering"\n• "tell me about AI Truism"\n• "register my agent"\n• "list all agents"\n\nOr visit https://agentrolodex.com`
    }

    return NextResponse.json({
      jsonrpc: '2.0', id,
      result: { message: { role: 'agent', parts: [textPart(responseText)] } },
    })
  } catch {
    return NextResponse.json({ jsonrpc: '2.0', id: null, error: { code: -32700, message: 'Parse error' } }, { status: 400 })
  }
}
