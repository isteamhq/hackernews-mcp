const HN_API = "https://hacker-news.firebaseio.com/v0";
const ALGOLIA_API = "https://hn.algolia.com/api/v1";

export interface HNItem {
  id: number;
  type: "story" | "comment" | "job" | "poll" | "pollopt";
  by: string;
  time: number;
  text?: string;
  url?: string;
  title?: string;
  score?: number;
  descendants?: number;
  kids?: number[];
  parent?: number;
  dead?: boolean;
  deleted?: boolean;
}

export interface HNUser {
  id: string;
  created: number;
  karma: number;
  about?: string;
  submitted?: number[];
}

export interface AlgoliaHit {
  objectID: string;
  title?: string;
  url?: string;
  author: string;
  points: number | null;
  num_comments: number | null;
  created_at: string;
  story_text?: string;
  comment_text?: string;
  _tags: string[];
}

export interface AlgoliaResult {
  hits: AlgoliaHit[];
  nbHits: number;
  page: number;
  nbPages: number;
  hitsPerPage: number;
}

export class HackerNewsClient {
  /** Fetch a single item by ID */
  async getItem(id: number): Promise<HNItem | null> {
    const res = await fetch(`${HN_API}/item/${id}.json`);
    if (!res.ok) throw new Error(`HN API ${res.status}`);
    return res.json() as Promise<HNItem | null>;
  }

  /** Fetch a user profile */
  async getUser(username: string): Promise<HNUser | null> {
    const res = await fetch(`${HN_API}/user/${encodeURIComponent(username)}.json`);
    if (!res.ok) throw new Error(`HN API ${res.status}`);
    return res.json() as Promise<HNUser | null>;
  }

  /** Fetch a list of story IDs by category */
  async getStoryIds(category: "top" | "new" | "best" | "ask" | "show" | "job"): Promise<number[]> {
    const res = await fetch(`${HN_API}/${category}stories.json`);
    if (!res.ok) throw new Error(`HN API ${res.status}`);
    return res.json() as Promise<number[]>;
  }

  /** Fetch multiple items in parallel */
  async getItems(ids: number[]): Promise<HNItem[]> {
    const items = await Promise.all(ids.map((id) => this.getItem(id)));
    return items.filter((item): item is HNItem => item !== null && !item.deleted && !item.dead);
  }

  /** Search stories via Algolia */
  async search(query: string, opts: { tags?: string; page?: number; hitsPerPage?: number } = {}): Promise<AlgoliaResult> {
    const params = new URLSearchParams({
      query,
      hitsPerPage: String(opts.hitsPerPage ?? 20),
      page: String(opts.page ?? 0),
    });
    if (opts.tags) params.set("tags", opts.tags);

    const res = await fetch(`${ALGOLIA_API}/search?${params}`);
    if (!res.ok) throw new Error(`Algolia API ${res.status}`);
    return res.json() as Promise<AlgoliaResult>;
  }

  /** Search with date range via Algolia */
  async searchByDate(query: string, opts: { tags?: string; page?: number; hitsPerPage?: number; numericFilters?: string } = {}): Promise<AlgoliaResult> {
    const params = new URLSearchParams({
      query,
      hitsPerPage: String(opts.hitsPerPage ?? 20),
      page: String(opts.page ?? 0),
    });
    if (opts.tags) params.set("tags", opts.tags);
    if (opts.numericFilters) params.set("numericFilters", opts.numericFilters);

    const res = await fetch(`${ALGOLIA_API}/search_by_date?${params}`);
    if (!res.ok) throw new Error(`Algolia API ${res.status}`);
    return res.json() as Promise<AlgoliaResult>;
  }

  /** Get comments for a story (recursive, depth-limited) */
  async getComments(storyId: number, maxDepth = 3, maxComments = 30): Promise<CommentNode[]> {
    const story = await this.getItem(storyId);
    if (!story?.kids?.length) return [];

    const ids = story.kids.slice(0, maxComments);
    const items = await this.getItems(ids);
    return this.buildCommentTree(items, maxDepth, 1, maxComments);
  }

  private async buildCommentTree(items: HNItem[], maxDepth: number, depth: number, remaining: number): Promise<CommentNode[]> {
    const nodes: CommentNode[] = [];

    for (const item of items) {
      if (remaining <= 0) break;
      remaining--;

      const node: CommentNode = {
        id: item.id,
        by: item.by,
        text: item.text ?? "",
        time: item.time,
        replies: [],
      };

      if (depth < maxDepth && item.kids?.length) {
        const childIds = item.kids.slice(0, Math.min(5, remaining));
        const children = await this.getItems(childIds);
        node.replies = await this.buildCommentTree(children, maxDepth, depth + 1, remaining - children.length);
        remaining -= node.replies.length;
      }

      nodes.push(node);
    }

    return nodes;
  }
}

export interface CommentNode {
  id: number;
  by: string;
  text: string;
  time: number;
  replies: CommentNode[];
}
