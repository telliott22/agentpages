#!/usr/bin/env python3
"""
A2A Agent Card Crawler for AgentPages
Discovers live A2A agent cards across the internet and outputs registration commands.

Usage:
    python3 scripts/crawl-agents.py                  # Run all strategies
    python3 scripts/crawl-agents.py known github ct   # Run specific strategies
    python3 scripts/crawl-agents.py --register URL    # Register found agents to AgentPages

State files (in scripts/):
    crawl-checked.txt       - URLs already checked (resume support)
    crawl-discovered.json   - All discovered live agents
    crawl-log.txt           - Timestamped log of runs
"""

import json
import urllib.request
import urllib.parse
import urllib.error
import ssl
import time
import sys
import os
import re
import hashlib
import concurrent.futures
from datetime import datetime
from pathlib import Path

# --- Config ---
TIMEOUT = 6
MAX_WORKERS = 20
SCRIPT_DIR = Path(__file__).parent
STATE_DIR = SCRIPT_DIR / "crawl-state"
RESULTS_FILE = STATE_DIR / "crawl-discovered.json"
CHECKED_FILE = STATE_DIR / "crawl-checked.txt"
LOG_FILE = STATE_DIR / "crawl-log.txt"

SSL_CTX = ssl.create_default_context()
SSL_CTX_NOVERIFY = ssl._create_unverified_context()

# --- State ---
checked_urls: set = set()
discovered: list = []
stats = {"started": None, "checked_this_run": 0, "found_this_run": 0}


# =============================================================================
# Helpers
# =============================================================================

def log(msg):
    ts = datetime.now().strftime("%H:%M:%S")
    print(f"[{ts}] {msg}")
    with open(LOG_FILE, "a") as f:
        f.write(f"[{datetime.now().isoformat()}] {msg}\n")

def load_state():
    global checked_urls, discovered
    STATE_DIR.mkdir(exist_ok=True)
    if CHECKED_FILE.exists():
        checked_urls = set(CHECKED_FILE.read_text().strip().split('\n'))
        checked_urls.discard('')
        log(f"Resume: {len(checked_urls)} previously checked URLs")
    if RESULTS_FILE.exists():
        data = json.loads(RESULTS_FILE.read_text())
        discovered = data.get("agents", [])
        log(f"Resume: {len(discovered)} previously discovered agents")

def save_state():
    STATE_DIR.mkdir(exist_ok=True)
    CHECKED_FILE.write_text('\n'.join(sorted(checked_urls)))
    output = {
        "metadata": {
            "last_updated": datetime.now().isoformat(),
            "total_discovered": len(discovered),
            "total_urls_checked": len(checked_urls),
        },
        "agents": discovered
    }
    RESULTS_FILE.write_text(json.dumps(output, indent=2))

def fetch(url, timeout=TIMEOUT):
    """Fetch URL -> (status_code, body) or (error_str, None)."""
    try:
        req = urllib.request.Request(url, headers={
            'User-Agent': 'AgentPages-Crawler/1.0 (+https://agentpages-iota.vercel.app)',
            'Accept': 'application/json',
        })
        try:
            resp = urllib.request.urlopen(req, timeout=timeout, context=SSL_CTX)
        except ssl.SSLError:
            resp = urllib.request.urlopen(req, timeout=timeout, context=SSL_CTX_NOVERIFY)
        return resp.status, resp.read().decode('utf-8', errors='replace')
    except urllib.error.HTTPError as e:
        return e.code, None
    except Exception as e:
        return str(e)[:100], None

def is_valid_agent_card(data):
    """Validate A2A agent card JSON."""
    if not isinstance(data, dict):
        return False
    if 'name' not in data:
        return False
    a2a_fields = ['protocolVersion', 'skills', 'capabilities', 'defaultInputModes', 'defaultOutputModes']
    return any(f in data for f in a2a_fields)

def agent_id(card):
    """Create a stable ID from name+url."""
    raw = (card.get('name', '') + '|' + card.get('url', '')).lower().strip()
    return hashlib.sha256(raw.encode()).hexdigest()[:12]

def check_domain(base_url):
    """Check a domain for A2A agent cards. Returns agent dict or None."""
    base_url = base_url.rstrip('/')
    paths = ['/.well-known/agent.json', '/.well-known/agent-card.json']

    for path in paths:
        url = base_url + path
        if url in checked_urls:
            continue
        checked_urls.add(url)
        stats["checked_this_run"] += 1

        status, body = fetch(url)
        if status == 200 and body:
            try:
                data = json.loads(body)
                if is_valid_agent_card(data):
                    skills = data.get('skills', [])
                    agent = {
                        "id": agent_id(data),
                        "name": data.get("name", "Unknown"),
                        "description": data.get("description", ""),
                        "url": data.get("url", base_url),
                        "agent_card_url": url,
                        "protocol_version": data.get("protocolVersion"),
                        "version": data.get("version"),
                        "capabilities": data.get("capabilities", {}),
                        "skills": skills,
                        "skills_count": len(skills),
                        "provider": data.get("provider", {}),
                        "authentication": data.get("authentication"),
                        "input_modes": data.get("defaultInputModes", []),
                        "output_modes": data.get("defaultOutputModes", []),
                        "discovered_at": datetime.now().isoformat(),
                        "source": "crawler",
                    }
                    # Deduplicate
                    existing_ids = {a["id"] for a in discovered}
                    if agent["id"] not in existing_ids:
                        discovered.append(agent)
                        stats["found_this_run"] += 1
                        log(f"🟢 FOUND: {agent['name']} ({len(skills)} skills) → {url}")
                        save_state()
                    return agent
            except json.JSONDecodeError:
                pass
    return None


# =============================================================================
# STRATEGY: Known URLs (already-found + educated guesses)
# =============================================================================
def strategy_known():
    """Check known/suspected A2A agent URLs."""
    log("━━━ STRATEGY: Known URLs ━━━")
    urls = [
        # Previously verified live
        "https://hello.a2aregistry.org",
        "https://coinrailz.com",
        "https://prassanna-ravishankar--code-agent-code-agent-app.modal.run",
        "https://prassanna-ravishankar--data-agent-data-agent-app.modal.run",
        "https://prassanna-ravishankar--planning-agent-planning-agent-app.modal.run",
        "https://prassanna-ravishankar--research-agent-research-agent-app.modal.run",
        "https://austegard.com",
        "https://slippage-sentinel.vercel.app",
        "https://earnbase.vercel.app",
        "https://agentpages-iota.vercel.app",
        # A2A ecosystem sites
        "https://a2aregistry.org",
        "https://a2aagentlist.com",
        "https://ai-truism.vercel.app",
        # Google A2A samples
        "https://a2a-samples.web.app",
        "https://a2a-demo.web.app",
        "https://a2a.dev",
        "https://a2aprotocol.ai",
    ]
    for url in urls:
        check_domain(url)
    log(f"Known: checked {len(urls)} URLs")


# =============================================================================
# STRATEGY: A2A Registry (github.com/prassanna-ravishankar/a2a-registry)
# =============================================================================
def strategy_registry():
    """Check all agents from the A2A Registry."""
    log("━━━ STRATEGY: A2A Registry ━━━")
    token = os.popen("gh auth token 2>/dev/null").read().strip()
    headers = {"User-Agent": "AgentPages-Crawler"}
    if token:
        headers["Authorization"] = f"token {token}"

    # Get the agents list
    req = urllib.request.Request(
        "https://api.github.com/repos/prassanna-ravishankar/a2a-registry/contents/data",
        headers=headers,
    )
    try:
        resp = urllib.request.urlopen(req, timeout=10, context=SSL_CTX)
        files = json.loads(resp.read())
        agent_files = [f for f in files if f['name'].endswith('.json') and f['name'] != 'agents.json']
        log(f"Registry: found {len(agent_files)} agent files")

        for f in agent_files:
            try:
                req2 = urllib.request.Request(f['download_url'], headers={"User-Agent": "AgentPages-Crawler"})
                resp2 = urllib.request.urlopen(req2, timeout=8, context=SSL_CTX)
                data = json.loads(resp2.read())
                url = data.get('url', '').rstrip('/')
                if url and url.startswith('http'):
                    check_domain(url)
                time.sleep(0.2)
            except:
                pass
    except Exception as e:
        log(f"Registry fetch failed: {e}")


# =============================================================================
# STRATEGY: GitHub Code Search
# =============================================================================
def strategy_github():
    """Search GitHub for repos with A2A agent cards and check deployments."""
    log("━━━ STRATEGY: GitHub Code Search ━━━")
    token = os.popen("gh auth token 2>/dev/null").read().strip()
    if not token:
        log("⚠️  No GitHub token, skipping")
        return

    headers = {
        "Authorization": f"token {token}",
        "User-Agent": "AgentPages-Crawler",
        "Accept": "application/vnd.github.v3+json",
    }

    queries = [
        # Find agent card files
        ("protocolVersion+defaultInputModes+filename:agent.json", "code"),
        ("protocolVersion+skills+filename:agent-card.json", "code"),
        ("path:.well-known+filename:agent.json", "code"),
        ("path:.well-known+filename:agent-card.json", "code"),
        # Find repos about A2A
        ("a2a+agent+protocolVersion+language:python", "code"),
        ("a2a+agent+protocolVersion+language:typescript", "code"),
        # Find deployment configs mentioning agent.json
        ("well-known+agent.json+deploy", "code"),
    ]

    found_repos = set()
    found_urls = set()

    for query_str, search_type in queries:
        url = f"https://api.github.com/search/{search_type}?q={query_str}&per_page=100"
        log(f"GitHub: searching '{urllib.parse.unquote(query_str)}'")

        req = urllib.request.Request(url, headers=headers)
        try:
            resp = urllib.request.urlopen(req, timeout=15, context=SSL_CTX)
            data = json.loads(resp.read())
            total = data.get('total_count', 0)
            items = data.get('items', [])
            log(f"  → {total} results, processing {len(items)}")

            for item in items:
                repo = item.get('repository', {}).get('full_name', '')
                if repo:
                    found_repos.add(repo)
        except urllib.error.HTTPError as e:
            if e.code == 403:
                log("  → Rate limited, sleeping 30s...")
                time.sleep(30)
            else:
                log(f"  → HTTP {e.code}")
        except Exception as e:
            log(f"  → Error: {e}")

        time.sleep(2)  # rate limit

    log(f"GitHub: found {len(found_repos)} unique repos, checking deployments...")

    # For each repo, check: homepage, GitHub Pages, and raw agent card files
    for repo in sorted(found_repos):
        try:
            req = urllib.request.Request(
                f"https://api.github.com/repos/{repo}",
                headers=headers,
            )
            resp = urllib.request.urlopen(req, timeout=8, context=SSL_CTX)
            rdata = json.loads(resp.read())

            homepage = rdata.get('homepage', '') or ''
            has_pages = rdata.get('has_pages', False)
            owner = repo.split('/')[0]
            rname = repo.split('/')[1]

            candidates = []
            if homepage.startswith('http'):
                candidates.append(homepage.rstrip('/'))
            if has_pages:
                candidates.append(f"https://{owner}.github.io/{rname}")
                candidates.append(f"https://{owner}.github.io")

            # Also try raw file
            for branch in ['main', 'master']:
                for fname in ['.well-known/agent.json', '.well-known/agent-card.json']:
                    raw = f"https://raw.githubusercontent.com/{repo}/{branch}/{fname}"
                    if raw not in checked_urls:
                        checked_urls.add(raw)
                        stats["checked_this_run"] += 1
                        status, body = fetch(raw)
                        if status == 200 and body:
                            try:
                                card = json.loads(body)
                                if is_valid_agent_card(card):
                                    card_url = card.get('url', '')
                                    if card_url and card_url.startswith('http'):
                                        candidates.append(card_url.rstrip('/'))
                                    log(f"  📦 {card.get('name')} in {repo} (checking deployment...)")
                            except:
                                pass

            for c in candidates:
                result = check_domain(c)
                if result:
                    break

            time.sleep(0.3)
        except:
            pass

    log(f"GitHub: done, checked {len(found_repos)} repos")


# =============================================================================
# STRATEGY: Certificate Transparency Logs (crt.sh)
# =============================================================================
def strategy_ct():
    """Search CT logs for agent-related domain certificates."""
    log("━━━ STRATEGY: Certificate Transparency Logs ━━━")

    # More targeted queries that are less likely to timeout
    terms = [
        'a2a-agent.%',
        'a2a-%.vercel.app',
        'agent-%.fly.dev',
        '%-agent.vercel.app',
        '%-agent.fly.dev',
        '%-agent.onrender.com',
        '%-agent.railway.app',
        '%-a2a.vercel.app',
        'agentcard.%',
        'agent-card.%',
        'agentpages.%',
        'agentregistry.%',
    ]

    found_domains = set()
    for term in terms:
        encoded = urllib.parse.quote(term)
        url = f"https://crt.sh/?q={encoded}&output=json"
        log(f"CT: '{term}'")

        status, body = fetch(url, timeout=20)
        if status == 200 and body:
            try:
                certs = json.loads(body)
                if isinstance(certs, list):
                    for cert in certs:
                        for field in ['common_name', 'name_value']:
                            val = cert.get(field, '')
                            for d in val.split('\n'):
                                d = d.strip()
                                if d and '.' in d and '*' not in d and len(d) < 100:
                                    found_domains.add(d)
                    if found_domains:
                        log(f"  → {len(certs)} certs, {len(found_domains)} domains so far")
            except:
                log(f"  → Parse error")
        else:
            log(f"  → {status}")
        time.sleep(1.5)

    log(f"CT: checking {len(found_domains)} domains...")
    with concurrent.futures.ThreadPoolExecutor(max_workers=MAX_WORKERS) as ex:
        list(ex.map(lambda d: check_domain(f"https://{d}"), sorted(found_domains)))
    log(f"CT: done")


# =============================================================================
# STRATEGY: Hosting Platform Brute-Force
# =============================================================================
def strategy_platforms():
    """Try common A2A-related names on hosting platforms."""
    log("━━━ STRATEGY: Hosting Platform Brute-Force ━━━")

    prefixes = [
        # A2A specific
        "a2a", "a2a-agent", "a2a-server", "a2a-demo", "a2a-test", "a2a-sample",
        "a2a-hub", "a2a-app", "a2a-api", "a2a-proxy", "a2a-gateway",
        "agent", "agent-server", "agent-hub", "agent-api", "agent-demo",
        "my-agent", "ai-agent", "agent-card", "agentcard", "agent-registry",
        "agentpages", "agent-directory", "agent-discovery", "agent-search",
        # Agent types
        "weather-agent", "travel-agent", "booking-agent", "search-agent",
        "code-agent", "coding-agent", "research-agent", "data-agent",
        "planning-agent", "chat-agent", "support-agent", "help-agent",
        "assistant-agent", "personal-agent", "scheduler-agent", "email-agent",
        "calendar-agent", "finance-agent", "crypto-agent", "trading-agent",
        "translation-agent", "writing-agent", "image-agent", "voice-agent",
        "math-agent", "music-agent", "recipe-agent", "news-agent",
        "shopping-agent", "health-agent", "fitness-agent", "legal-agent",
        "hr-agent", "sales-agent", "marketing-agent", "analytics-agent",
        "devops-agent", "security-agent", "monitoring-agent", "logging-agent",
        "docs-agent", "documentation-agent", "summarizer-agent", "rag-agent",
        "pdf-agent", "excel-agent", "sql-agent", "api-agent",
        # Framework names + agent
        "langgraph-agent", "crewai-agent", "autogen-agent", "adk-agent",
        "langchain-agent", "openai-agent", "gemini-agent", "claude-agent",
        "semantic-kernel-agent", "llamaindex-agent", "haystack-agent",
        # Business/industry
        "customer-agent", "billing-agent", "payment-agent", "order-agent",
        "shipping-agent", "inventory-agent", "pricing-agent", "review-agent",
        "defi-agent", "web3-agent", "blockchain-agent", "nft-agent",
        # Known
        "coinrailz", "slippage-sentinel", "earnbase", "ai-truism",
        # Pattern: project-a2a
        "hello-a2a", "demo-a2a", "test-a2a", "sample-a2a",
        "weather-a2a", "travel-a2a", "my-a2a", "cool-a2a",
    ]

    platforms = [
        "https://{}.vercel.app",
        "https://{}.netlify.app",
        "https://{}.fly.dev",
        "https://{}.railway.app",
        "https://{}.onrender.com",
        "https://{}.render.com",
        "https://{}.herokuapp.com",
        "https://{}.workers.dev",
        "https://{}.pages.dev",
        "https://{}.web.app",
        "https://{}.firebaseapp.com",
        "https://{}.azurewebsites.net",
        "https://{}.up.railway.app",
        "https://{}.koyeb.app",
        "https://{}.deno.dev",
        "https://{}.val.run",
        "https://{}.replit.app",
        "https://{}.glitch.me",
        "https://{}.surge.sh",
        "https://{}.streamlit.app",
        "https://{}.hf.space",       # Hugging Face Spaces
    ]

    urls = [p.format(prefix) for prefix in prefixes for p in platforms]
    log(f"Platforms: checking {len(urls)} URLs ({len(prefixes)} names × {len(platforms)} platforms)...")

    count = 0
    with concurrent.futures.ThreadPoolExecutor(max_workers=MAX_WORKERS) as ex:
        futures = {ex.submit(check_domain, url): url for url in urls}
        for f in concurrent.futures.as_completed(futures):
            count += 1
            if count % 200 == 0:
                log(f"  ... {count}/{len(urls)} checked ({stats['found_this_run']} found this run)")
                save_state()

    log(f"Platforms: done, checked {count}")


# =============================================================================
# STRATEGY: Expanded domain scanning
# =============================================================================
def strategy_domains():
    """Try a broader set of real domains that might host A2A agents."""
    log("━━━ STRATEGY: Domain scanning (AI/tech companies) ━━━")

    domains = [
        # AI companies
        "openai.com", "anthropic.com", "google.com", "deepmind.com", "meta.ai",
        "cohere.com", "ai21.com", "stability.ai", "midjourney.com", "runway.ai",
        "huggingface.co", "replicate.com", "together.ai", "anyscale.com",
        "fireworks.ai", "groq.com", "perplexity.ai", "mistral.ai",
        "databricks.com", "snowflake.com",
        # Agent frameworks
        "langchain.com", "llamaindex.ai", "crewai.com", "autogen.ai",
        "fixie.ai", "dust.tt", "e2b.dev", "modal.com", "val.town",
        # Infrastructure
        "vercel.com", "netlify.com", "fly.io", "railway.app", "render.com",
        "cloudflare.com", "deno.com", "supabase.com", "neon.tech",
        # Agent platforms/tools
        "relevanceai.com", "superagent.sh", "agent.ai", "agentops.ai",
        "helicone.ai", "langsmith.com", "arize.com", "phoenix.arize.com",
        "traceloop.com", "gentrace.ai",
        # Developer tools
        "github.com", "gitlab.com", "bitbucket.org", "replit.com",
        "stackblitz.com", "gitpod.io", "codespaces.github.com",
        # Agent-specific
        "agentprotocol.ai", "agentprotocol.org", "agent.dev", "agents.dev",
        "agentstack.sh", "composio.dev", "toolhouse.ai", "browserbase.com",
        "arcade.ai", "zapier.com", "make.com", "n8n.io", "activepieces.com",
        # Crypto/Web3 (Coin Railz was here)
        "alchemy.com", "infura.io", "moralis.io", "thegraph.com",
        "chainlink.io", "uniswap.org", "aave.com", "compound.finance",
        # A2A ecosystem
        "a2a.dev", "a2aprotocol.ai", "a2aprotocol.org", "a2a.ai",
        "a2aregistry.org", "a2aagentlist.com",
        "agentpages.com", "agentpages.ai", "agentpages.io",
        "agentdirectory.com", "agentdirectory.ai",
        "agenthub.com", "agenthub.ai", "agenthub.io",
        "agentsearch.ai", "agentfinder.ai",
        # Enterprise
        "salesforce.com", "servicenow.com", "workday.com", "zendesk.com",
        "intercom.com", "freshdesk.com", "hubspot.com", "atlassian.com",
        # Consulting/agencies (Austegard was here)
        "thoughtworks.com", "mckinsey.com", "accenture.com", "deloitte.com",
    ]

    log(f"Domains: checking {len(domains)} domains...")
    with concurrent.futures.ThreadPoolExecutor(max_workers=MAX_WORKERS) as ex:
        list(ex.map(lambda d: check_domain(f"https://{d}"), domains))
    log(f"Domains: done")


# =============================================================================
# STRATEGY: Perplexity search for live agents
# =============================================================================
def strategy_perplexity():
    """Use Perplexity to find recently-deployed A2A agents."""
    log("━━━ STRATEGY: Perplexity Search ━━━")

    search_script = os.path.expanduser("~/.claude/skills/perplexity-search/scripts/search.py")
    if not os.path.exists(search_script):
        log("⚠️  Perplexity search not available, skipping")
        return

    queries = [
        "live deployed A2A agent card .well-known/agent.json URL 2025 2026",
        "site:vercel.app OR site:fly.dev agent.json protocolVersion A2A",
        "A2A protocol agent deployed public endpoint 2026",
        "Google A2A agent card example live demo endpoint",
    ]

    for q in queries:
        log(f"Perplexity: '{q[:60]}...'")
        try:
            result = os.popen(f'python3 "{search_script}" "{q}" 2>/dev/null').read()
            # Extract URLs from results
            urls = re.findall(r'https?://[^\s<>"\')\]]+', result)
            urls = [u.rstrip('.,;:') for u in urls if 'perplexity' not in u and 'google.com/search' not in u]
            log(f"  → Found {len(urls)} URLs to check")
            for url in set(urls):
                check_domain(url.rstrip('/'))
        except Exception as e:
            log(f"  → Error: {e}")
        time.sleep(1)

    log("Perplexity: done")


# =============================================================================
# Generate AgentPages registration script
# =============================================================================
def generate_registration_script():
    """Output shell commands to register discovered agents in AgentPages."""
    log("Generating registration script...")

    script_path = SCRIPT_DIR / "register-discovered.sh"
    lines = [
        '#!/bin/bash',
        '# Auto-generated by crawl-agents.py',
        f'# Generated: {datetime.now().isoformat()}',
        f'# Found {len(discovered)} live agents',
        '',
        'API_URL="${1:-https://agentpages-iota.vercel.app}"',
        '',
    ]

    for agent in discovered:
        name = agent.get("name", "Unknown")
        # Skip AgentPages itself
        if "agentpages" in name.lower():
            continue

        skills_json = json.dumps(agent.get("skills", []))
        provider = agent.get("provider", {})
        caps = agent.get("capabilities", {})
        tags = []
        for skill in agent.get("skills", []):
            tags.extend(skill.get("tags", []))
        tags = list(set(tags))[:10]

        body = {
            "name": name,
            "description": agent.get("description", "")[:500],
            "url": agent.get("url", ""),
            "agent_card_url": agent.get("agent_card_url", ""),
            "provider_org": provider.get("organization") or provider.get("name", ""),
            "provider_url": provider.get("url", ""),
            "platform": "custom",
            "type": "agent",
            "version": agent.get("version", ""),
            "protocol_version": agent.get("protocol_version", "0.3.0") or "0.3.0",
            "capabilities": caps,
            "input_modes": agent.get("input_modes", ["text"]) or ["text"],
            "output_modes": agent.get("output_modes", ["text"]) or ["text"],
            "skills": agent.get("skills", []),
            "tags": tags,
            "verified": True,
            "last_seen_at": agent.get("discovered_at", datetime.now().isoformat()),
        }

        body_json = json.dumps(body).replace("'", "'\\''")
        lines.append(f'echo "Registering: {name}..."')
        lines.append(f"curl -s -X POST \"$API_URL/api/agents\" \\")
        lines.append(f"  -H 'Content-Type: application/json' \\")
        lines.append(f"  -d '{body_json}'")
        lines.append(f"echo")
        lines.append('')

    script_path.write_text('\n'.join(lines))
    os.chmod(script_path, 0o755)
    log(f"Registration script: {script_path}")


# =============================================================================
# Main
# =============================================================================
def main():
    print("╔══════════════════════════════════════════════════════════════╗")
    print("║  AgentPages A2A Agent Crawler                               ║")
    print(f"║  {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}                                     ║")
    print("╚══════════════════════════════════════════════════════════════╝")

    load_state()
    stats["started"] = datetime.now().isoformat()

    strategies = {
        "known": strategy_known,
        "registry": strategy_registry,
        "github": strategy_github,
        "ct": strategy_ct,
        "platforms": strategy_platforms,
        "domains": strategy_domains,
        "perplexity": strategy_perplexity,
    }

    # Parse args
    args = sys.argv[1:]
    if "--register" in args:
        api_url = args[args.index("--register") + 1] if len(args) > args.index("--register") + 1 else None
        if api_url:
            # TODO: direct API registration
            pass
        else:
            generate_registration_script()
        return

    selected = [a for a in args if a in strategies] or list(strategies.keys())

    for name in selected:
        if name in strategies:
            try:
                strategies[name]()
            except KeyboardInterrupt:
                log("⚠️  Interrupted! Saving...")
                save_state()
                break
            except Exception as e:
                log(f"❌ Strategy '{name}' failed: {e}")
                import traceback; traceback.print_exc()
            save_state()

    # Final report
    print()
    print("╔══════════════════════════════════════════════════════════════╗")
    print("║  RESULTS                                                    ║")
    print("╠══════════════════════════════════════════════════════════════╣")
    print(f"║  URLs checked this run:  {stats['checked_this_run']:>6}                            ║")
    print(f"║  Total URLs ever checked:{len(checked_urls):>6}                            ║")
    print(f"║  Found this run:         {stats['found_this_run']:>6}                            ║")
    print(f"║  Total discovered:       {len(discovered):>6}                            ║")
    print("╠══════════════════════════════════════════════════════════════╣")

    for a in discovered:
        name = a['name'][:40]
        skills = a.get('skills_count', len(a.get('skills', [])))
        proto = a.get('protocol_version', '?') or '?'
        print(f"║  🟢 {name:<40} {skills:>2} skills  {proto:<6}║")

    print("╚══════════════════════════════════════════════════════════════╝")

    # Generate registration script
    generate_registration_script()

    print(f"\nState: {STATE_DIR}")
    print(f"Register: bash {SCRIPT_DIR}/register-discovered.sh")


if __name__ == '__main__':
    main()
