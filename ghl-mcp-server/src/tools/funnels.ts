/**
 * Funnels Tools — 4 tools for funnel listing, page inspection, and redirect management.
 *
 * NOTE: The GHL Funnels API is READ-ONLY for funnels and pages.
 * You can list/inspect funnels but cannot create or edit funnel pages via API.
 * The only write operations are for URL redirects.
 */
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { ghlRequest, formatResponse } from "../client.js";

export function registerFunnelsTools(server: McpServer) {
  // ─── List Funnels ────────────────────────────────────────────────
  server.tool(
    "ghl_list_funnels",
    "List all funnels for the current location. Returns funnel IDs, names, and URLs. Use this to see what funnels exist and get their IDs for further inspection.",
    {
      limit: z.number().optional().default(10).describe("Number of results"),
      offset: z.number().optional().default(0).describe("Offset for pagination"),
    },
    async (params) => {
      const res = await ghlRequest({
        method: "GET",
        path: "/funnels/funnel/list",
        params: { locationId: undefined, limit: params.limit, offset: params.offset },
      });
      return { content: [{ type: "text" as const, text: formatResponse(res) }] };
    }
  );

  // ─── Get Funnel Pages ────────────────────────────────────────────
  server.tool(
    "ghl_get_funnel_pages",
    "Get all pages within a specific funnel. Returns page names, paths, and IDs.",
    {
      funnelId: z.string().describe("Funnel ID"),
      limit: z.number().optional().default(10),
      offset: z.number().optional().default(0),
    },
    async (params) => {
      const res = await ghlRequest({
        method: "GET",
        path: "/funnels/page",
        params: {
          funnelId: params.funnelId,
          limit: params.limit,
          offset: params.offset,
        },
      });
      return { content: [{ type: "text" as const, text: formatResponse(res) }] };
    }
  );

  // ─── List Redirects ──────────────────────────────────────────────
  server.tool(
    "ghl_list_funnel_redirects",
    "List URL redirects configured for funnels. Redirects route old URLs to new pages.",
    {
      limit: z.number().optional().default(10),
      offset: z.number().optional().default(0),
    },
    async (params) => {
      const res = await ghlRequest({
        method: "GET",
        path: "/funnels/lookup/redirect/list",
        params: { limit: params.limit, offset: params.offset },
      });
      return { content: [{ type: "text" as const, text: formatResponse(res) }] };
    }
  );

  // ─── Create Redirect ─────────────────────────────────────────────
  server.tool(
    "ghl_create_funnel_redirect",
    "Create a URL redirect for funnel pages. Useful for routing old URLs or creating short URLs that point to funnel pages.",
    {
      target: z.string().describe("Target URL to redirect to"),
      action: z.enum(["funnel", "website", "url", "all"]).describe("Redirect type"),
      pathName: z.string().describe("Source path to redirect from"),
    },
    async (params) => {
      const res = await ghlRequest({
        method: "POST",
        path: "/funnels/lookup/redirect",
        body: {
          target: params.target,
          action: params.action,
          pathName: params.pathName,
        },
      });
      return { content: [{ type: "text" as const, text: formatResponse(res) }] };
    }
  );
}
