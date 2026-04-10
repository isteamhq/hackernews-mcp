import { z } from "zod";
import { HackerNewsClient, type AlgoliaHit } from "../client.js";

// ─── Schemas ────────────────────────────────────────────────────

export const searchSchema = z.object({
  query: z.string().describe("Search query"),
  limit: z.number().min(1).max(50).default(20).describe("Number of results (max 50)"),
  type: z.enum(["story", "comment", "all"]).default("story").describe("Filter by type: story, comment, or all"),
  sort: z.enum(["relevance", "date"]).default("relevance").describe("Sort by relevance or date"),
});

// ─── Handlers ───────────────────────────────────────────────────

function formatHit(hit: AlgoliaHit, index: number): string {
  const isComment = hit._tags.includes("comment");
  const points = hit.points ?? 0;
  const comments = hit.num_comments ?? 0;
  const date = hit.created_at.split("T")[0];
  const hnUrl = `https://news.ycombinator.com/item?id=${hit.objectID}`;

  if (isComment) {
    const text = stripHtml(hit.comment_text ?? "").slice(0, 200);
    return `${index + 1}. [Comment] by ${hit.author} | ${date}\n   ${text}${(hit.comment_text?.length ?? 0) > 200 ? "..." : ""}\n   HN: ${hnUrl}`;
  }

  const url = hit.url ? `\n   URL: ${hit.url}` : "";
  return `${index + 1}. ${hit.title} (${points} pts, ${comments} comments)\n   by ${hit.author} | ${date}${url}\n   HN: ${hnUrl}`;
}

export async function search(client: HackerNewsClient, args: z.infer<typeof searchSchema>): Promise<string> {
  const tags = args.type === "all" ? undefined : args.type;

  const result = args.sort === "date"
    ? await client.searchByDate(args.query, { tags, hitsPerPage: args.limit })
    : await client.search(args.query, { tags, hitsPerPage: args.limit });

  if (!result.hits.length) return `No results found for "${args.query}".`;

  const lines = result.hits.map((hit, i) => formatHit(hit, i));
  return `Search results for "${args.query}" (${result.nbHits} total):\n\n${lines.join("\n\n")}`;
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
