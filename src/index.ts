import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";

import { HackerNewsClient } from "./client.js";

import {
  topStoriesSchema, topStories,
  newStoriesSchema, newStories,
  bestStoriesSchema, bestStories,
  askStoriesSchema, askStories,
  showStoriesSchema, showStories,
  jobStoriesSchema, jobStories,
  getStorySchema, getStory,
} from "./tools/stories.js";

import { searchSchema, search } from "./tools/search.js";

import {
  getUserSchema, getUser,
  getCommentsSchema, getComments,
} from "./tools/info.js";

const server = new McpServer({ name: "hackernews", version: "1.0.0" });

let client: HackerNewsClient;
function ensureClient(): HackerNewsClient {
  if (!client) client = new HackerNewsClient();
  return client;
}

// ─── Stories ────────────────────────────────────────────────────

server.tool(
  "top_stories",
  "Get current top stories on Hacker News",
  topStoriesSchema.shape,
  async (args) => ({
    content: [{ type: "text", text: await topStories(ensureClient(), topStoriesSchema.parse(args)) }],
  }),
);

server.tool(
  "new_stories",
  "Get newest stories on Hacker News",
  newStoriesSchema.shape,
  async (args) => ({
    content: [{ type: "text", text: await newStories(ensureClient(), newStoriesSchema.parse(args)) }],
  }),
);

server.tool(
  "best_stories",
  "Get highest-voted stories on Hacker News",
  bestStoriesSchema.shape,
  async (args) => ({
    content: [{ type: "text", text: await bestStories(ensureClient(), bestStoriesSchema.parse(args)) }],
  }),
);

server.tool(
  "ask_stories",
  "Get Ask HN stories",
  askStoriesSchema.shape,
  async (args) => ({
    content: [{ type: "text", text: await askStories(ensureClient(), askStoriesSchema.parse(args)) }],
  }),
);

server.tool(
  "show_stories",
  "Get Show HN stories",
  showStoriesSchema.shape,
  async (args) => ({
    content: [{ type: "text", text: await showStories(ensureClient(), showStoriesSchema.parse(args)) }],
  }),
);

server.tool(
  "job_stories",
  "Get job postings from Hacker News",
  jobStoriesSchema.shape,
  async (args) => ({
    content: [{ type: "text", text: await jobStories(ensureClient(), jobStoriesSchema.parse(args)) }],
  }),
);

server.tool(
  "get_story",
  "Get a specific Hacker News story by ID (title, URL, score, text)",
  getStorySchema.shape,
  async (args) => ({
    content: [{ type: "text", text: await getStory(ensureClient(), getStorySchema.parse(args)) }],
  }),
);

// ─── Search ─────────────────────────────────────────────────────

server.tool(
  "search",
  "Search Hacker News stories and comments via Algolia (full-text search with relevance or date sorting)",
  searchSchema.shape,
  async (args) => ({
    content: [{ type: "text", text: await search(ensureClient(), searchSchema.parse(args)) }],
  }),
);

// ─── Info ───────────────────────────────────────────────────────

server.tool(
  "get_user",
  "Get a Hacker News user profile (karma, about, member since)",
  getUserSchema.shape,
  async (args) => ({
    content: [{ type: "text", text: await getUser(ensureClient(), getUserSchema.parse(args)) }],
  }),
);

server.tool(
  "get_comments",
  "Get comments on a Hacker News story (threaded, depth-limited)",
  getCommentsSchema.shape,
  async (args) => ({
    content: [{ type: "text", text: await getComments(ensureClient(), getCommentsSchema.parse(args)) }],
  }),
);

// ─── Start ──────────────────────────────────────────────────────

async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error("[hackernews-mcp] Server started");
}

main().catch((err) => {
  console.error("[hackernews-mcp] Fatal:", err);
  process.exit(1);
});
