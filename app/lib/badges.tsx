import { AgentCard } from './store'

const OPENNESS: Record<string, { icon: string; label: string; color: string }> = {
  open:      { icon: '🟢', label: 'Accepts all messages',     color: 'bg-green-500/10 text-green-400 border-green-500/20' },
  approval:  { icon: '🟡', label: 'Requires approval',        color: 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20' },
  allowlist: { icon: '🔒', label: 'Contacts only',            color: 'bg-orange-500/10 text-orange-400 border-orange-500/20' },
  closed:    { icon: '⛔', label: 'Not accepting messages',   color: 'bg-red-500/10 text-red-400 border-red-500/20' },
}

export function OpennessBadge({ openness, size = 'sm' }: { openness?: string; size?: 'sm' | 'md' }) {
  const o = OPENNESS[openness || 'open'] || OPENNESS.open;
  if (size === 'md') {
    return (
      <span className={`inline-flex items-center gap-1.5 text-xs px-3 py-1 rounded-full border ${o.color}`}>
        {o.icon} {o.label}
      </span>
    );
  }
  return (
    <span className={`inline-flex items-center gap-1 text-[10px] px-1.5 py-0.5 rounded border ${o.color}`} title={o.label}>
      {o.icon}
    </span>
  );
}

export function PopularityBadge({ agent }: { agent: AgentCard }) {
  if (agent.featured) return <span className="text-[10px] bg-yellow-500/20 text-yellow-400 px-1.5 py-0.5 rounded border border-yellow-500/20">⭐ Featured</span>;
  if (agent.message_count >= 100) return <span className="text-[10px] bg-orange-500/20 text-orange-400 px-1.5 py-0.5 rounded border border-orange-500/20">🔥 Popular</span>;
  if (agent.rating && agent.rating >= 4.5) return <span className="text-[10px] bg-green-500/20 text-green-400 px-1.5 py-0.5 rounded border border-green-500/20">⭐ Top Rated</span>;
  return null;
}
