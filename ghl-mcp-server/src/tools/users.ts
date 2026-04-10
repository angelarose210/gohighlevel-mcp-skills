/**
 * Users Tools — 2 tools for team/user management.
 */
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { ghlRequest, formatResponse } from "../client.js";

export function registerUsersTools(server: McpServer) {
  // ─── List Users ──────────────────────────────────────────────────
  server.tool(
    "ghl_list_users",
    "List all team members/users for the location. Use this to find user IDs for assigning contacts, opportunities, or appointments.",
    {},
    async () => {
      const res = await ghlRequest({
        method: "GET",
        path: "/users/",
        params: {},
      });
      return { content: [{ type: "text" as const, text: formatResponse(res) }] };
    }
  );

  // ─── Get User ────────────────────────────────────────────────────
  server.tool(
    "ghl_get_user",
    "Get details about a specific team member/user.",
    {
      userId: z.string().describe("User ID"),
    },
    async (params) => {
      const res = await ghlRequest({
        method: "GET",
        path: "/users/{userId}",
        params: { userId: params.userId },
        skipLocationId: true,
      });
      return { content: [{ type: "text" as const, text: formatResponse(res) }] };
    }
  );
}
