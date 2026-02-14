import { NextRequest, NextResponse } from 'next/server'
import { getAgents, registerAgent } from '../../lib/store'

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
