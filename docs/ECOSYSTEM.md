# A2A Agent Registry Ecosystem (Feb 2026)

## The Landscape

There is **no single authoritative public directory** of A2A agents. The ecosystem is fragmented into several categories:

### 1. Public Registries (with actual agents)

| Registry | Agents | Live | Status | Notes |
|----------|--------|------|--------|-------|
| **a2aregistry.org** (Prassanna) | 103 | 6 | SSL broken (526) | GitHub PR-based. Most entries are fake/test. |
| **AgentMe** (agentme.cz) | 1 | 1 | ✅ Live | Has semantic search API + DID identity. Czech project. |
| **AgentRolodex** (ours) | 29 | 29 | ✅ Live | Most comprehensive. A2A-native with own agent card. |

### 2. Self-Deploy Registry Templates (no public agents)

| Project | Stars | What it is |
|---------|-------|------------|
| **awslabs/a2a-agent-registry-on-aws** | 11 | CDK template: Lambda + S3 Vectors + Bedrock for semantic search. You deploy your own private registry on AWS. **Not a public directory.** |
| **aymenfurter/agent-dir** | 4 | Git-based catalog. Push agent card JSONs via PR → get a static site. Has 18 aspirational cards, none deployed. |

### 3. Directories (no agents listed)

| Site | Status | Notes |
|------|--------|-------|
| **a2aagentlist.com** | Under construction | Landing page only, no agents |
| **a2aregistry.in** | Live SPA | "Implementation Registry" — links to code repos, not live agents |

### 4. Adjacent Platforms (not A2A-specific)

| Platform | Stars | Focus |
|----------|-------|-------|
| **Archestra.AI** | 3,574 | MCP registry/gateway/orchestrator (not A2A) |
| **Solace Agent Mesh** | 1,612 | Event-driven agent framework (not A2A) |
| **Casibase** | 4,441 | AI agent platform (not A2A) |
| **GetBindu** | 627 | Agent framework (not A2A) |
| **Nuwax** | 665 | Chinese agent OS platform (not A2A) |

### 5. Security/Validation Tools

| Tool | Stars | Purpose |
|------|-------|---------|
| **cisco-ai-defense/a2a-scanner** | 118 | Scan agents for security threats |
| **FlowMCP/a2a-agent-validator** | 0 | Validate agent card JSON structure |

---

## Key Insight: AWS Registry ≠ AgentRolodex

The **awslabs/a2a-agent-registry-on-aws** is a **template** for building your own private registry. It's what an enterprise would deploy internally to manage their own agents. Think of it like a database schema, not a phone book.

**AgentRolodex is the phone book.** It's the public-facing directory where anyone can discover agents. AWS's template could power the backend of something like AgentRolodex, but AWS hasn't built a public directory themselves.

## Who Has What

```
Public directory with real agents?
  ├── a2aregistry.org  → 103 listed, 6 actually work (broken SSL)
  ├── agentme.cz       → 1 agent, but has semantic search + DIDs
  └── AgentRolodex       → 29 verified live ← WE ARE HERE

Self-deploy templates?
  ├── awslabs CDK      → Deploy your own on AWS
  └── agent-dir        → Deploy your own on GitHub

Under construction?
  ├── a2aagentlist.com → Landing page only
  └── a2aregistry.in   → Implementation links, not live agents

Not A2A (MCP/other)?
  ├── Archestra.AI     → MCP registry
  └── Solace           → Event mesh agents
```

## The Truth About the "Ecosystem"

As of February 2026:
- **29 live A2A agents exist on the entire public internet** (that we can find)
- **97% of registered agents in the main registry are dead**
- **No major tech company has deployed a public A2A agent**
- The "ecosystem" is mostly crypto/DeFi projects using x402 payments
- One freelancer (austegard.com) has an agent card — this is the future use case
- AgentMe is the most technically interesting (DIDs + semantic search), but has 1 agent

**AgentRolodex is currently the most comprehensive public A2A agent directory that exists.**
