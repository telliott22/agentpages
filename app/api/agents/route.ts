import { NextRequest, NextResponse } from 'next/server'
import { getAgents, registerAgent, query } from '../../lib/store'

function cfg() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) return null;
  return { url, key };
}

export async function PATCH(req: NextRequest) {
  try {
    const body = await req.json();
    const { name, ...updates } = body;
    if (!name) return NextResponse.json({ error: 'name is required' }, { status: 400 });
    const c = cfg();
    if (!c) return NextResponse.json({ error: 'DB not configured' }, { status: 500 });
    const res = await fetch(`${c.url}/rest/v1/agent_cards?name=eq.${encodeURIComponent(name)}`, {
      method: 'PATCH',
      headers: {
        'apikey': c.key, 'Authorization': `Bearer ${c.key}`,
        'Content-Type': 'application/json', 'Prefer': 'return=representation',
        'Accept': 'application/vnd.pgrst.object+json',
      },
      body: JSON.stringify({ ...updates, updated_at: new Date().toISOString() }),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      return NextResponse.json({ error: err.message || 'Update failed' }, { status: res.status });
    }
    return NextResponse.json(await res.json());
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  const sp = req.nextUrl.searchParams
  const agents = await getAgents({
    q: sp.get('q') || undefined,
    platform: sp.get('platform') || undefined,
    tag: sp.get('tag') || undefined,
    type: sp.get('type') || undefined,
    sort: sp.get('sort') || undefined,
    limit: Number(sp.get('limit')) || 20,
    offset: Number(sp.get('offset')) || 0,
  })
  return NextResponse.json(agents)
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    if (!body.name || !body.description || !body.url) {
      return NextResponse.json({ error: 'name, description, and url are required' }, { status: 400 })
    }
    const agent = await registerAgent(body)
    return NextResponse.json(agent, { status: 201 })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
