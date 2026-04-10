/**
 * Blogs Tools — 3 tools for blog post management.
 */
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { ghlRequest, formatResponse } from "../client.js";

export function registerBlogsTools(server: McpServer) {
  // ─── List Blog Posts ─────────────────────────────────────────────
  server.tool(
    "ghl_list_blog_posts",
    "List blog posts for the location. GHL blogs can be used for SEO content.",
    {
      limit: z.number().optional().default(10),
      offset: z.number().optional().default(0),
      status: z.enum(["published", "draft", "scheduled"]).optional(),
    },
    async (params) => {
      const queryParams: Record<string, unknown> = {
        limit: params.limit,
        offset: params.offset,
      };
      if (params.status) queryParams.status = params.status;
      const res = await ghlRequest({
        method: "GET",
        path: "/blogs/posts",
        params: queryParams,
      });
      return { content: [{ type: "text" as const, text: formatResponse(res) }] };
    }
  );

  // ─── Create Blog Post ────────────────────────────────────────────
  server.tool(
    "ghl_create_blog_post",
    "Create a new blog post. Supports HTML content, categories, and SEO metadata.",
    {
      title: z.string().describe("Post title"),
      content: z.string().describe("Post content (HTML)"),
      status: z.enum(["published", "draft"]).optional().default("draft"),
      categoryId: z.string().optional().describe("Category ID"),
      authorId: z.string().optional().describe("Author user ID"),
      slug: z.string().optional().describe("URL slug (auto-generated from title if omitted)"),
      imageUrl: z.string().optional().describe("Featured image URL"),
      description: z.string().optional().describe("SEO meta description"),
      tags: z.array(z.string()).optional().describe("Post tags"),
    },
    async (params) => {
      const body: Record<string, unknown> = {};
      for (const [key, value] of Object.entries(params)) {
        if (value !== undefined) body[key] = value;
      }
      const res = await ghlRequest({ method: "POST", path: "/blogs/posts", body });
      return { content: [{ type: "text" as const, text: formatResponse(res) }] };
    }
  );

  // ─── List Blog Categories ────────────────────────────────────────
  server.tool(
    "ghl_list_blog_categories",
    "List blog categories for organizing posts.",
    {},
    async () => {
      const res = await ghlRequest({
        method: "GET",
        path: "/blogs/categories",
        params: {},
      });
      return { content: [{ type: "text" as const, text: formatResponse(res) }] };
    }
  );
}
