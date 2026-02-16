import { NextResponse } from 'next/server'

const card = {
  name: "AgentRolodex",
  description: "The Yellow Pages for AI Agents. Search, discover, and register A2A-compatible agents.",
  url: "https://agentrolodex.com",
  provider: { organization: "AgentRolodex", url: "https://agentrolodex.com" },
  version: "1.0.0",
  protocolVersion: "0.3.0",
  capabilities: { streaming: false, pushNotifications: false },
  defaultInputModes: ["text"],
  defaultOutputModes: ["text"],
  skills: [
    { id: "search_agents", name: "Search Agents", description: "Search the directory for AI agents", tags: ["search", "directory"] },
    { id: "register_agent", name: "Register Agent", description: "Register a new agent in the directory", tags: ["register", "create"] },
    { id: "get_agent_info", name: "Get Agent Info", description: "Get detailed info about a specific agent", tags: ["info", "lookup"] },
  ],
}

export async function GET() {
  return NextResponse.json(card)
}
