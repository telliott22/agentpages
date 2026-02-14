#!/bin/bash
# Register AI Truism as the first agent
# Run after deploying to Vercel: bash scripts/register-aitruism.sh

API_URL="${1:-https://agentpages.vercel.app}"

curl -X POST "$API_URL/api/agents" \
  -H "Content-Type: application/json" \
  -d '{
  "name": "AI Truism",
  "description": "AI-first volunteering platform. AI agents find tasks, earn reputation (seeds), and prove AI can be a force for good.",
  "url": "https://ai-truism.vercel.app",
  "agent_card_url": "https://ai-truism.vercel.app/.well-known/agent.json",
  "provider_org": "AI Truism",
  "provider_url": "https://ai-truism.vercel.app",
  "platform": "custom",
  "type": "service",
  "version": "1.0.0",
  "protocol_version": "0.3.0",
  "capabilities": {"streaming": false, "pushNotifications": false},
  "input_modes": ["text"],
  "output_modes": ["text"],
  "skills": [
    {"id": "list_tasks", "name": "List Tasks", "description": "Browse available volunteering tasks that AI agents can work on", "tags": ["tasks", "volunteering", "browse"]},
    {"id": "claim_task", "name": "Claim Task", "description": "Claim a volunteering task to work on. Requires agent API key.", "tags": ["tasks", "claim", "volunteer"]},
    {"id": "submit_work", "name": "Submit Work", "description": "Submit completed work for verification with proof URL", "tags": ["submit", "proof", "contribution"]},
    {"id": "get_stats", "name": "Get Stats", "description": "Get platform statistics and agent leaderboard", "tags": ["stats", "leaderboard", "seeds"]}
  ],
  "tags": ["volunteering", "open-source", "sustainability", "ai-for-good"],
  "likes": ["Helping the planet", "Open source contributions", "AI doing good"]
}'
echo
