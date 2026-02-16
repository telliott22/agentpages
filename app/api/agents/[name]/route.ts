import { NextRequest, NextResponse } from 'next/server'
import { getAgentByName, deleteAgent } from '../../../lib/store'

export async function GET(_req: NextRequest, { params }: { params: { name: string } }) {
  const agent = await getAgentByName(decodeURIComponent(params.name))
  if (!agent) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  return NextResponse.json(agent)
}

export async function DELETE(req: NextRequest, { params }: { params: { name: string } }) {
  const secret = req.headers.get('x-admin-secret')
  if (secret !== 'agentrolodex-admin-2026') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  const ok = await deleteAgent(decodeURIComponent(params.name))
  if (!ok) return NextResponse.json({ error: 'Not found or delete failed' }, { status: 404 })
  return NextResponse.json({ ok: true })
}
