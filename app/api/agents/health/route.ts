import { NextResponse } from 'next/server';
import { query } from '@/app/lib/store';

/**
 * GET /api/agents/health — Check liveness of all agents by pinging their agent_card_url.
 * PATCH /api/agents/health — Update last_seen_at for agents (called by health checker).
 */

interface AgentMin {
  id: string;
  name: string;
  agent_card_url?: string;
  url: string;
}

async function checkAgent(agent: AgentMin): Promise<{ name: string; alive: boolean; status: number }> {
  const checkUrl = agent.agent_card_url || `${agent.url.replace(/\/$/, '')}/.well-known/agent.json`;
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 8000);
    const res = await fetch(checkUrl, { signal: controller.signal, method: 'HEAD' });
    clearTimeout(timeout);
    return { name: agent.name, alive: res.ok, status: res.status };
  } catch {
    return { name: agent.name, alive: false, status: 0 };
  }
}

export async function GET() {
  const agents = await query<AgentMin>('agent_cards', 'select=id,name,agent_card_url,url');
  
  const results = await Promise.all(agents.map(checkAgent));
  
  const alive = results.filter(r => r.alive).length;
  const dead = results.filter(r => !r.alive).length;

  // Update last_seen_at for alive agents
  const cfg = (() => {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
    if (!url || !key) return null;
    return { url, key };
  })();

  if (cfg) {
    const now = new Date().toISOString();
    for (const r of results) {
      if (r.alive) {
        const agent = agents.find(a => a.name === r.name);
        if (agent) {
          await fetch(`${cfg.url}/rest/v1/agent_cards?id=eq.${agent.id}`, {
            method: 'PATCH',
            headers: {
              'apikey': cfg.key,
              'Authorization': `Bearer ${cfg.key}`,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ last_seen_at: now }),
          });
        }
      }
    }
  }

  return NextResponse.json({
    checked_at: new Date().toISOString(),
    total: agents.length,
    alive,
    dead,
    results: results.sort((a, b) => Number(a.alive) - Number(b.alive)),
  });
}
