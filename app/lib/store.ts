/**
 * Supabase PostgREST raw fetch helpers for agent_cards table.
 */

function cfg() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) return null;
  return { url, key };
}

function hdrs(c: { key: string }) {
  return {
    'apikey': c.key,
    'Authorization': `Bearer ${c.key}`,
    'Content-Type': 'application/json',
    'Prefer': 'return=representation',
  };
}

export async function query<T = any>(table: string, params = ""): Promise<T[]> {
  const c = cfg();
  if (!c) return [];
  const res = await fetch(`${c.url}/rest/v1/${table}?${params}`, {
    headers: hdrs(c), cache: 'no-store',
  });
  if (!res.ok) return [];
  return res.json();
}

export async function queryOne<T = any>(table: string, params: string): Promise<T | null> {
  const c = cfg();
  if (!c) return null;
  const res = await fetch(`${c.url}/rest/v1/${table}?${params}&limit=1`, {
    headers: { ...hdrs(c), 'Accept': 'application/vnd.pgrst.object+json' },
    cache: 'no-store',
  });
  if (!res.ok || res.status === 406) return null;
  return res.json();
}

export async function insert<T = any>(table: string, body: any): Promise<T> {
  const c = cfg();
  if (!c) throw new Error("Supabase not configured");
  const res = await fetch(`${c.url}/rest/v1/${table}`, {
    method: 'POST',
    headers: { ...hdrs(c), 'Accept': 'application/vnd.pgrst.object+json' },
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.message || err.details || `Insert failed: ${res.status}`);
  }
  return res.json();
}

export async function upsert<T = any>(table: string, body: any): Promise<T> {
  const c = cfg();
  if (!c) throw new Error("Supabase not configured");
  const res = await fetch(`${c.url}/rest/v1/${table}`, {
    method: 'POST',
    headers: {
      ...hdrs(c),
      'Accept': 'application/vnd.pgrst.object+json',
      'Prefer': 'return=representation,resolution=merge-duplicates',
    },
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.message || err.details || `Upsert failed: ${res.status}`);
  }
  return res.json();
}

export async function del(table: string, params: string): Promise<boolean> {
  const c = cfg();
  if (!c) return false;
  const res = await fetch(`${c.url}/rest/v1/${table}?${params}`, {
    method: 'DELETE',
    headers: hdrs(c),
  });
  return res.ok;
}

// Agent card types
export interface AgentCard {
  id: string;
  name: string;
  description: string;
  url: string;
  agent_card_url?: string;
  provider_org?: string;
  provider_url?: string;
  skills: any[];
  tags: string[];
  platform?: string;
  version?: string;
  protocol_version: string;
  capabilities: any;
  input_modes: string[];
  output_modes: string[];
  contact?: string;
  likes?: string[];
  avatar_url?: string;
  type: 'agent' | 'service';
  openness: 'open' | 'approval' | 'allowlist' | 'closed';
  message_count: number;
  rating?: number;
  featured: boolean;
  verified: boolean;
  last_seen_at?: string;
  created_at: string;
  updated_at: string;
}

export async function getAgents(opts?: {
  q?: string; platform?: string; tag?: string; type?: string;
  limit?: number; offset?: number; sort?: string;
}): Promise<AgentCard[]> {
  // Default sort: featured first, then by popularity score (message_count desc, rating desc)
  const sortOrder = opts?.sort === 'newest' ? 'created_at.desc'
    : opts?.sort === 'name' ? 'name.asc'
    : 'featured.desc,message_count.desc.nullslast,rating.desc.nullslast,created_at.desc';
  let params = `order=${sortOrder}`;
  if (opts?.platform) params += `&platform=eq.${encodeURIComponent(opts.platform)}`;
  if (opts?.tag) params += `&tags=cs.{${encodeURIComponent(opts.tag)}}`;
  if (opts?.type) params += `&type=eq.${encodeURIComponent(opts.type)}`;
  if (opts?.limit) params += `&limit=${opts.limit}`;
  if (opts?.offset) params += `&offset=${opts.offset}`;
  if (opts?.q) {
    const q = encodeURIComponent(opts.q);
    params += `&or=(name.ilike.*${q}*,description.ilike.*${q}*)`;
  }
  return query<AgentCard>("agent_cards", params);
}

export async function getAgentByName(name: string): Promise<AgentCard | null> {
  return queryOne<AgentCard>("agent_cards", `name=eq.${encodeURIComponent(name)}`);
}

export async function registerAgent(data: Partial<AgentCard>): Promise<AgentCard> {
  return upsert<AgentCard>("agent_cards", {
    ...data,
    updated_at: new Date().toISOString(),
  });
}

export async function deleteAgent(name: string): Promise<boolean> {
  return del("agent_cards", `name=eq.${encodeURIComponent(name)}`);
}

export async function getFeatured(): Promise<AgentCard[]> {
  return query<AgentCard>("agent_cards", "featured=eq.true&order=message_count.desc.nullslast&limit=5");
}

export async function getPopularServices(limit = 5): Promise<AgentCard[]> {
  return query<AgentCard>("agent_cards", `type=eq.service&order=message_count.desc.nullslast,rating.desc.nullslast&limit=${limit}`);
}

export async function getActiveAgents(limit = 5): Promise<AgentCard[]> {
  return query<AgentCard>("agent_cards", `type=eq.agent&order=last_seen_at.desc.nullslast,message_count.desc.nullslast&limit=${limit}`);
}

export async function getRecentAgents(limit = 5): Promise<AgentCard[]> {
  return query<AgentCard>("agent_cards", `order=created_at.desc&limit=${limit}`);
}

export async function getStats() {
  const agents = await query<AgentCard>("agent_cards", "select=id,skills,platform,type");
  const totalAgents = agents.length;
  const totalSkills = agents.reduce((sum, a) => sum + (Array.isArray(a.skills) ? a.skills.length : 0), 0);
  const platforms = [...new Set(agents.map(a => a.platform).filter(Boolean))];
  const agentCount = agents.filter(a => a.type === 'agent').length;
  const serviceCount = agents.filter(a => a.type === 'service').length;
  return { totalAgents, totalSkills, platforms: platforms.length, platformList: platforms, agentCount, serviceCount };
}
