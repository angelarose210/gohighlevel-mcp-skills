/**
 * Custom Objects Tools — 4 tools for managing extensible data schemas and records.
 */
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { ghlRequest, formatResponse } from "../client.js";

export function registerCustomObjectsTools(server: McpServer) {
  // ─── List Custom Object Schemas ──────────────────────────────────
  server.tool(
    "ghl_list_custom_objects",
    "List custom object schemas defined for the location. Custom objects extend GHL's data model with your own entity types.",
    {},
    async () => {
      const res = await ghlRequest({
        method: "GET",
        path: "/objects/schemas",
        params: {},
      });
      return { content: [{ type: "text" as const, text: formatResponse(res) }] };
    }
  );

  // ─── Get Custom Object Schema ────────────────────────────────────
  server.tool(
    "ghl_get_custom_object_schema",
    "Get details of a specific custom object schema including its fields.",
    {
      schemaId: z.string().describe("Schema/object ID"),
    },
    async (params) => {
      const res = await ghlRequest({
        method: "GET",
        path: "/objects/schemas/{schemaId}",
        params: { schemaId: params.schemaId },
      });
      return { content: [{ type: "text" as const, text: formatResponse(res) }] };
    }
  );

  // ─── Search Custom Object Records ────────────────────────────────
  server.tool(
    "ghl_search_custom_records",
    "Search records within a custom object. Returns data matching your filters.",
    {
      schemaKey: z.string().describe("Schema key/ID for the custom object"),
      query: z.string().optional().describe("Search query"),
      limit: z.number().optional().default(20),
      page: z.number().optional().default(1),
    },
    async (params) => {
      const res = await ghlRequest({
        method: "POST",
        path: "/objects/records/search",
        body: {
          schemaKey: params.schemaKey,
          searchText: params.query,
          pageLimit: params.limit,
          page: params.page,
        },
      });
      return { content: [{ type: "text" as const, text: formatResponse(res) }] };
    }
  );

  // ─── Create Custom Object Record ─────────────────────────────────
  server.tool(
    "ghl_create_custom_record",
    "Create a new record in a custom object. Fields depend on the object's schema — use ghl_get_custom_object_schema first to see available fields.",
    {
      schemaKey: z.string().describe("Schema key/ID"),
      properties: z
        .record(z.string(), z.unknown())
        .describe("Field values as key-value pairs (field IDs from the schema)"),
    },
    async (params) => {
      const res = await ghlRequest({
        method: "POST",
        path: "/objects/records",
        body: {
          schemaKey: params.schemaKey,
          properties: params.properties,
        },
      });
      return { content: [{ type: "text" as const, text: formatResponse(res) }] };
    }
  );
}
