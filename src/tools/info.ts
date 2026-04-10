import { z } from "zod";
import { HackerNewsClient, type CommentNode } from "../client.js";

// ─── Schemas ────────────────────────────────────────────────────

export const getUserSchema = z.object({
  username: z.string().describe("HN username"),
});

export const getCommentsSchema = z.object({
  story_id: z.number().describe("Hacker News story ID"),
  limit: z.number().min(1).max(30).default(15).describe("Max top-level comments to fetch (max 30)"),
  depth: z.number().min(1).max(5).default(3).describe("Max reply depth (max 5)"),
});

// ─── Handlers ───────────────────────────────────────────────────

export async function getUser(client: HackerNewsClient, args: z.infer<typeof getUserSchema>): Promise<string> {
  const user = await client.getUser(args.username);
  if (!user) return `User "${args.username}" not found.`;

  const created = new Date(user.created * 1000).toISOString().split("T")[0];
  const about = user.about ? `\nAbout: ${stripHtml(user.about)}` : "";
  const submissions = user.submitted?.length ?? 0;

  return `${user.id}\nKarma: ${user.karma}\nMember since: ${created}\nSubmissions: ${submissions}${about}\nProfile: https://news.ycombinator.com/user?id=${user.id}`;
}

export async function getComments(client: HackerNewsClient, args: z.infer<typeof getCommentsSchema>): Promise<string> {
  const story = await client.getItem(args.story_id);
  if (!story) return `Story ${args.story_id} not found.`;

  const comments = await client.getComments(args.story_id, args.depth, args.limit);
  if (!comments.length) return `No comments on "${story.title}".`;

  const lines = comments.map((c) => formatComment(c, 0));
  return `Comments on "${story.title}" (${story.descendants ?? 0} total):\n\n${lines.join("\n\n")}`;
}

function formatComment(node: CommentNode, indent: number): string {
  const prefix = "  ".repeat(indent);
  const date = new Date(node.time * 1000).toISOString().split("T")[0];
  const text = stripHtml(node.text).slice(0, 300);
  const truncated = node.text.length > 300 ? "..." : "";

  let result = `${prefix}[${node.by}] (${date})\n${prefix}${text}${truncated}`;

  if (node.replies.length) {
    const replies = node.replies.map((r) => formatComment(r, indent + 1));
    result += "\n" + replies.join("\n\n");
  }

  return result;
}

function stripHtml(html: string): string {
  return html
    .replace(/<a\s+href="([^"]*)"[^>]*>[^<]*<\/a>/gi, "$1")
    .replace(/<p>/gi, "\n")
    .replace(/<[^>]+>/g, "")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#x27;/g, "'")
    .trim();
}
