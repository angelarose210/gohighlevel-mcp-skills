/**
 * Opportunities & Pipelines Tools — 5 tools for pipeline/deal management.
 */
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { ghlRequest, formatResponse } from "../client.js";

export function registerOpportunitiesTools(server: McpServer) {
  // ─── Get Pipelines ───────────────────────────────────────────────
  server.tool(
    "ghl_get_pipelines",
    "List all sales pipelines and their stages. Use this to find pipeline and stage IDs for creating opportunities.",
    {},
    async () => {
      const res = await ghlRequest({
        method: "GET",
        path: "/opportunities/pipelines",
        params: {},
      });
      return { content: [{ type: "text" as const, text: formatResponse(res) }] };
    }
  );

  // ─── Search Opportunities ────────────────────────────────────────
  server.tool(
    "ghl_search_opportunities",
    "Search opportunities (deals) with filters. Filter by pipeline, stage, status, assigned user, etc.",
    {
      pipelineId: z.string().optional().describe("Filter by pipeline ID"),
      stageId: z.string().optional().describe("Filter by stage ID"),
      status: z.enum(["open", "won", "lost", "abandoned", "all"]).optional().describe("Deal status filter"),
      assignedTo: z.string().optional().describe("Filter by assigned user ID"),
      query: z.string().optional().describe("Search by opportunity name or contact"),
      limit: z.number().optional().default(20),
      page: z.number().optional().default(1),
    },
    async (params) => {
      const queryParams: Record<string, unknown> = {};
      for (const [key, value] of Object.entries(params)) {
        if (value !== undefined) queryParams[key] = value;
      }
      const res = await ghlRequest({
        method: "GET",
        path: "/opportunities/search",
        params: queryParams,
      });
      return { content: [{ type: "text" as const, text: formatResponse(res) }] };
    }
  );

  // ─── Create Opportunity ──────────────────────────────────────────
  server.tool(
    "ghl_create_opportunity",
    "Create a new opportunity (deal) in a pipeline. Requires a pipeline stage. Use ghl_get_pipelines first to get stage IDs.",
    {
      pipelineId: z.string().describe("Pipeline ID"),
      stageId: z.string().describe("Pipeline stage ID"),
      name: z.string().describe("Deal/opportunity name"),
      status: z.enum(["open", "won", "lost", "abandoned"]).optional().default("open"),
      contactId: z.string().optional().describe("Associated contact ID"),
      monetaryValue: z.number().optional().describe("Deal value in dollars"),
      assignedTo: z.string().optional().describe("User ID to assign deal to"),
      source: z.string().optional().describe("Lead source"),
    },
    async (params) => {
      const body: Record<string, unknown> = {};
      for (const [key, value] of Object.entries(params)) {
        if (value !== undefined) body[key] = value;
      }
      const res = await ghlRequest({ method: "POST", path: "/opportunities/", body });
      return { content: [{ type: "text" as const, text: formatResponse(res) }] };
    }
  );

  // ─── Update Opportunity ──────────────────────────────────────────
  server.tool(
    "ghl_update_opportunity",
    "Update an opportunity — move pipeline stages, update status, change deal value, etc.",
    {
      opportunityId: z.string().describe("Opportunity ID to update"),
      pipelineId: z.string().optional(),
      stageId: z.string().optional().describe("Move to a different stage"),
      status: z.enum(["open", "won", "lost", "abandoned"]).optional(),
      monetaryValue: z.number().optional(),
      name: z.string().optional(),
      assignedTo: z.string().optional(),
    },
    async (params) => {
      const { opportunityId, ...fields } = params;
      const body: Record<string, unknown> = {};
      for (const [key, value] of Object.entries(fields)) {
        if (value !== undefined) body[key] = value;
      }
      const res = await ghlRequest({
        method: "PUT",
        path: "/opportunities/{opportunityId}",
        params: { opportunityId },
        body,
      });
      return { content: [{ type: "text" as const, text: formatResponse(res) }] };
    }
  );

  // ─── Delete Opportunity ──────────────────────────────────────────
  server.tool(
    "ghl_delete_opportunity",
    "Permanently delete an opportunity/deal.",
    {
      opportunityId: z.string().describe("Opportunity ID to delete"),
    },
    async (params) => {
      const res = await ghlRequest({
        method: "DELETE",
        path: "/opportunities/{opportunityId}",
        params: { opportunityId: params.opportunityId },
      });
      return { content: [{ type: "text" as const, text: formatResponse(res) }] };
    }
  );
}
