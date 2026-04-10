/**
 * Locations Tools — 3 tools for sub-account details, custom fields, and tags.
 */
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { ghlRequest, formatResponse, getConfig } from "../client.js";

export function registerLocationsTools(server: McpServer) {
  // ─── Get Location ────────────────────────────────────────────────
  server.tool(
    "ghl_get_location",
    "Get details about the current GHL sub-account/location — name, address, timezone, settings, etc.",
    {},
    async () => {
      const config = getConfig();
      const res = await ghlRequest({
        method: "GET",
        path: "/locations/{locationId}",
        params: { locationId: config.locationId },
        skipLocationId: true,
      });
      return { content: [{ type: "text" as const, text: formatResponse(res) }] };
    }
  );

  // ─── List Custom Fields ──────────────────────────────────────────
  server.tool(
    "ghl_list_custom_fields",
    "List all custom fields configured for the location. Custom fields extend contact/opportunity data.",
    {
      model: z.enum(["contact", "opportunity", "all"]).optional().default("all").describe("Which object type's custom fields"),
    },
    async (params) => {
      const config = getConfig();
      const res = await ghlRequest({
        method: "GET",
        path: "/locations/{locationId}/customFields",
        params: { locationId: config.locationId, model: params.model },
        skipLocationId: true,
      });
      return { content: [{ type: "text" as const, text: formatResponse(res) }] };
    }
  );

  // ─── List Location Tags ──────────────────────────────────────────
  server.tool(
    "ghl_list_tags",
    "List all tags configured for the location. Tags are used to segment contacts and trigger workflows.",
    {},
    async () => {
      const config = getConfig();
      const res = await ghlRequest({
        method: "GET",
        path: "/locations/{locationId}/tags",
        params: { locationId: config.locationId },
        skipLocationId: true,
      });
      return { content: [{ type: "text" as const, text: formatResponse(res) }] };
    }
  );
}
