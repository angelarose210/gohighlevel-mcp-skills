/**
 * Social Media Tools — 3 tools for social media management via the Social Planner.
 */
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { ghlRequest, formatResponse } from "../client.js";

export function registerSocialMediaTools(server: McpServer) {
  // ─── List Social Accounts ────────────────────────────────────────
  server.tool(
    "ghl_list_social_accounts",
    "List connected social media accounts (Facebook, Instagram, Google Business, LinkedIn, Twitter/X, TikTok).",
    {},
    async () => {
      const res = await ghlRequest({
        method: "GET",
        path: "/social-media-posting/accounts/",
        params: {},
      });
      return { content: [{ type: "text" as const, text: formatResponse(res) }] };
    }
  );

  // ─── Create Social Post ──────────────────────────────────────────
  server.tool(
    "ghl_create_social_post",
    "Create and schedule a social media post. Can post to multiple platforms at once.",
    {
      accountIds: z.array(z.string()).describe("Social account IDs to post to"),
      content: z.string().describe("Post text content"),
      mediaUrls: z.array(z.string()).optional().describe("URLs of images/videos to attach"),
      scheduledAt: z.string().optional().describe("Schedule time (ISO 8601). If omitted, posts immediately."),
      title: z.string().optional().describe("Post title (for platforms that support it)"),
    },
    async (params) => {
      const body: Record<string, unknown> = {
        accountIds: params.accountIds,
        content: params.content,
      };
      if (params.mediaUrls) body.mediaUrls = params.mediaUrls;
      if (params.scheduledAt) body.scheduledAt = params.scheduledAt;
      if (params.title) body.title = params.title;
      const res = await ghlRequest({
        method: "POST",
        path: "/social-media-posting/posts/",
        body,
      });
      return { content: [{ type: "text" as const, text: formatResponse(res) }] };
    }
  );

  // ─── List Social Posts ───────────────────────────────────────────
  server.tool(
    "ghl_list_social_posts",
    "List scheduled and published social media posts.",
    {
      limit: z.number().optional().default(10),
      offset: z.number().optional().default(0),
      status: z.enum(["published", "scheduled", "failed", "in_review"]).optional(),
      accountId: z.string().optional().describe("Filter by social account ID"),
    },
    async (params) => {
      const queryParams: Record<string, unknown> = {
        limit: params.limit,
        offset: params.offset,
      };
      if (params.status) queryParams.status = params.status;
      if (params.accountId) queryParams.accountId = params.accountId;
      const res = await ghlRequest({
        method: "GET",
        path: "/social-media-posting/posts/",
        params: queryParams,
      });
      return { content: [{ type: "text" as const, text: formatResponse(res) }] };
    }
  );
}
