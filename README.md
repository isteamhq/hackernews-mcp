# @isteam/hackernews-mcp

[![npm version](https://img.shields.io/npm/v/@isteam/hackernews-mcp.svg)](https://www.npmjs.com/package/@isteam/hackernews-mcp)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](https://opensource.org/licenses/MIT)

MCP server for Hacker News — search stories, read comments, and track tech trends via AI agents.

Built by [is.team](https://is.team) — the AI-native project management platform.

## Quick Start

Add to your MCP config (`.mcp.json` for Claude Code, or Claude Desktop settings):

```json
{
  "mcpServers": {
    "hackernews": {
      "command": "npx",
      "args": ["-y", "@isteam/hackernews-mcp"]
    }
  }
}
```

No API keys required — uses the public Hacker News API and Algolia HN Search.

## Tools (10)

### Stories

| Tool | Description |
|------|-------------|
| `top_stories` | Get current top stories on Hacker News |
| `new_stories` | Get newest stories |
| `best_stories` | Get highest-voted stories |
| `ask_stories` | Get Ask HN stories |
| `show_stories` | Get Show HN stories |
| `job_stories` | Get job postings |
| `get_story` | Get a specific story by ID (title, URL, score, text) |

### Search

| Tool | Description |
|------|-------------|
| `search` | Full-text search across stories and comments (powered by Algolia) |

### Users & Comments

| Tool | Description |
|------|-------------|
| `get_user` | Get a user's profile (karma, about, member since) |
| `get_comments` | Get threaded comments on a story (depth-limited) |

## Rate Limits & Agent Safety

Both APIs used by this server are public and have generous limits:

| API | Limit | Notes |
|-----|-------|-------|
| HN Firebase API | ~500 req/sec per IP | No auth required, very lenient |
| Algolia HN Search | ~1,000 req/min per IP | Returns `X-RateLimit-*` headers |

**This server is read-only** — there are no write operations, so idempotency and duplicate posting are not a concern.

**Backoff:** If you hit Algolia's rate limit, it returns `429` with `X-RateLimit-Reset` header. Add a brief delay before retrying.

## Usage Examples

**Track tech trends:**
> "What are the top 10 stories on Hacker News right now?"

**Research a topic:**
> "Search Hacker News for discussions about 'MCP protocol' sorted by date"

**Analyze community sentiment:**
> "Get the comments on story 12345678 and summarize the main opinions"

**Monitor Show HN:**
> "Show me the latest Show HN posts — are any related to AI project management?"

**Competitive research:**
> "Search HN for mentions of Linear, Jira, and Asana in the past month"

## Data Sources

This MCP server uses two public APIs:

- **[Hacker News API](https://github.com/HackerNews/API)** — Official Firebase-based API for stories, comments, and user profiles
- **[Algolia HN Search](https://hn.algolia.com/api)** — Full-text search with relevance ranking and date filtering

Both APIs are free, require no authentication, and have generous rate limits.

## About is.team

[is.team](https://is.team) is an AI-native project management platform where AI agents and humans collaborate as real teammates. AI agents join boards, create tasks, chat, and get work done — just like any other team member.

Part of the [is.team](https://is.team) open-source MCP ecosystem:
- [@isteam/mcp](https://www.npmjs.com/package/@isteam/mcp) — Project management
- [@isteam/google-ads-mcp](https://www.npmjs.com/package/@isteam/google-ads-mcp) — Google Ads
- [@isteam/twitter-mcp](https://www.npmjs.com/package/@isteam/twitter-mcp) — Twitter/X
- [@isteam/bluesky-mcp](https://www.npmjs.com/package/@isteam/bluesky-mcp) — Bluesky
- [@isteam/linkedin-mcp](https://www.npmjs.com/package/@isteam/linkedin-mcp) — LinkedIn
- [@isteam/hackernews-mcp](https://www.npmjs.com/package/@isteam/hackernews-mcp) — Hacker News

## License

MIT
