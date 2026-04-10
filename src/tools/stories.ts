import { z } from "zod";
import { HackerNewsClient, type HNItem } from "../client.js";

// ─── Schemas ────────────────────────────────────────────────────

export const topStoriesSchema = z.object({
  limit: z.number().min(1).max(50).default(10).describe("Number of stories to fetch (max 50)"),
});

export const newStoriesSchema = z.object({
  limit: z.number().min(1).max(50).default(10).describe("Number of stories to fetch (max 50)"),
});

export const bestStoriesSchema = z.object({
  limit: z.number().min(1).max(50).default(10).describe("Number of stories to fetch (max 50)"),
});

export const askStoriesSchema = z.object({
  limit: z.number().min(1).max(50).default(10).describe("Number of stories to fetch (max 50)"),
});

export const showStoriesSchema = z.object({
  limit: z.number().min(1).max(50).default(10).describe("Number of stories to fetch (max 50)"),
});

export const jobStoriesSchema = z.object({
  limit: z.number().min(1).max(50).default(10).describe("Number of stories to fetch (max 50)"),
});

export const getStorySchema = z.object({
  id: z.number().describe("Hacker News story ID"),
});

// ─── Handlers ───────────────────────────────────────────────────

function formatStory(item: HNItem, index?: number): string {
  const prefix = index !== undefined ? `${index + 1}. ` : "";
  const points = item.score ?? 0;
  const comments = item.descendants ?? 0;
  const date = new Date(item.time * 1000).toISOString().split("T")[0];
  const url = item.url ? `\n   URL: ${item.url}` : "";
  const hnUrl = `https://news.ycombinator.com/item?id=${item.id}`;

  return `${prefix}${item.title} (${points} pts, ${comments} comments)\n   by ${item.by} | ${date}${url}\n   HN: ${hnUrl}`;
}

async function fetchStories(client: HackerNewsClient, category: "top" | "new" | "best" | "ask" | "show" | "job", limit: number): Promise<string> {
  const ids = await client.getStoryIds(category);
  const items = await client.getItems(ids.slice(0, limit));
  if (!items.length) return `No ${category} stories found.`;

  const label = category.charAt(0).toUpperCase() + category.slice(1);
  const lines = items.map((item, i) => formatStory(item, i));
  return `${label} Stories (${items.length}):\n\n${lines.join("\n\n")}`;
}

export async function topStories(client: HackerNewsClient, args: z.infer<typeof topStoriesSchema>): Promise<string> {
  return fetchStories(client, "top", args.limit);
}

export async function newStories(client: HackerNewsClient, args: z.infer<typeof newStoriesSchema>): Promise<string> {
  return fetchStories(client, "new", args.limit);
}

export async function bestStories(client: HackerNewsClient, args: z.infer<typeof bestStoriesSchema>): Promise<string> {
  return fetchStories(client, "best", args.limit);
}

export async function askStories(client: HackerNewsClient, args: z.infer<typeof askStoriesSchema>): Promise<string> {
  return fetchStories(client, "ask", args.limit);
}

export async function showStories(client: HackerNewsClient, args: z.infer<typeof showStoriesSchema>): Promise<string> {
  return fetchStories(client, "show", args.limit);
}

export async function jobStories(client: HackerNewsClient, args: z.infer<typeof jobStoriesSchema>): Promise<string> {
  return fetchStories(client, "job", args.limit);
}

export async function getStory(client: HackerNewsClient, args: z.infer<typeof getStorySchema>): Promise<string> {
  const item = await client.getItem(args.id);
  if (!item) return `Story ${args.id} not found.`;

  const points = item.score ?? 0;
  const comments = item.descendants ?? 0;
  const date = new Date(item.time * 1000).toISOString();
  const url = item.url ? `URL: ${item.url}\n` : "";
  const text = item.text ? `\nText:\n${stripHtml(item.text)}` : "";

  return `${item.title}\nby ${item.by} | ${date}\n${points} points | ${comments} comments\n${url}HN: https://news.ycombinator.com/item?id=${item.id}${text}`;
}

function stripHtml(html: string): string {
  return html
    .replace(/<a\s+href="([^"]*)"[^>]*>[^<]*<\/a>/gi, "$1")
    .replace(/<p>/gi, "\n\n")
    .replace(/<[^>]+>/g, "")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#x27;/g, "'")
    .trim();
}
