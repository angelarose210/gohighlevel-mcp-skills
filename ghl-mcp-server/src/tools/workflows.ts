/**
 * Workflows Tools — 3 tools for workflow listing and contact enrollment.
 */
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { ghlRequest, formatResponse } from "../client.js";

export function registerWorkflowsTools(server: McpServer) {
  // ─── List Workflows ──────────────────────────────────────────────
  server.tool(
    "ghl_list_workflows",
    "List all available workflows/automations for the location. Returns workflow IDs needed for enrollment.",
    {},
    async () => {
      const res = await ghlRequest({
        method: "GET",
        path: "/workflows/",
        params: {},
      });
      return { content: [{ type: "text" as const, text: formatResponse(res) }] };
    }
  );

  // ─── Enroll Contact in Workflow ──────────────────────────────────
  server.tool(
    "ghl_enroll_in_workflow",
    "Enroll a contact into a workflow/automation. The contact will begin the workflow from the first step.",
    {
      contactId: z.string().describe("Contact ID to enroll"),
      workflowId: z.string().describe("Workflow ID (use ghl_list_workflows to find)"),
    },
    async (params) => {
      const res = await ghlRequest({
        method: "POST",
        path: "/contacts/{contactId}/workflow/{workflowId}",
        params: { contactId: params.contactId, workflowId: params.workflowId },
        body: {},
      });
      return { content: [{ type: "text" as const, text: formatResponse(res) }] };
    }
  );

  // ─── Remove Contact from Workflow ────────────────────────────────
  server.tool(
    "ghl_remove_from_workflow",
    "Remove a contact from a workflow they are currently enrolled in.",
    {
      contactId: z.string().describe("Contact ID to remove"),
      workflowId: z.string().describe("Workflow ID to remove from"),
    },
    async (params) => {
      const res = await ghlRequest({
        method: "DELETE",
        path: "/contacts/{contactId}/workflow/{workflowId}",
        params: { contactId: params.contactId, workflowId: params.workflowId },
      });
      return { content: [{ type: "text" as const, text: formatResponse(res) }] };
    }
  );
}
