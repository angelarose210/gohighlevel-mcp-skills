/**
 * Conversations & Messaging Tools — 4 tools for multi-channel communication.
 */
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { ghlRequest, formatResponse } from "../client.js";

export function registerConversationsTools(server: McpServer) {
  // ─── List Conversations ──────────────────────────────────────────
  server.tool(
    "ghl_list_conversations",
    "List conversations for the location. Filter by contact or status.",
    {
      contactId: z.string().optional().describe("Filter by contact ID"),
      status: z.string().optional().describe("Filter status (e.g. 'all', 'read', 'unread', 'starred')"),
      limit: z.number().optional().default(20),
    },
    async (params) => {
      const queryParams: Record<string, unknown> = {};
      if (params.contactId) queryParams.contactId = params.contactId;
      if (params.status) queryParams.status = params.status;
      queryParams.limit = params.limit;
      const res = await ghlRequest({
        method: "GET",
        path: "/conversations/search",
        params: queryParams,
      });
      return { content: [{ type: "text" as const, text: formatResponse(res) }] };
    }
  );

  // ─── Get Conversation Messages ───────────────────────────────────
  server.tool(
    "ghl_get_messages",
    "Get message history for a specific conversation.",
    {
      conversationId: z.string().describe("Conversation ID"),
      limit: z.number().optional().default(20).describe("Number of messages to return"),
    },
    async (params) => {
      const res = await ghlRequest({
        method: "GET",
        path: "/conversations/{conversationId}/messages",
        params: { conversationId: params.conversationId, limit: params.limit },
      });
      return { content: [{ type: "text" as const, text: formatResponse(res) }] };
    }
  );

  // ─── Send Message ────────────────────────────────────────────────
  server.tool(
    "ghl_send_message",
    "Send an SMS, Email, or WhatsApp message to a contact. For Email, the 'html' field is required (not just 'message').",
    {
      contactId: z.string().describe("Contact ID to message"),
      type: z.enum(["SMS", "Email", "WhatsApp", "Facebook", "Instagram", "Live_Chat", "Custom"]).describe("Message channel"),
      message: z.string().optional().describe("Message body (required for SMS/WhatsApp)"),
      html: z.string().optional().describe("HTML body (required for Email)"),
      subject: z.string().optional().describe("Email subject line (required for Email)"),
      conversationId: z.string().optional().describe("Existing conversation ID (optional — auto-created if omitted)"),
      conversationProviderId: z.string().optional().describe("Provider ID for custom channels"),
    },
    async (params) => {
      const body: Record<string, unknown> = {
        contactId: params.contactId,
        type: params.type,
      };
      if (params.message) body.message = params.message;
      if (params.html) body.html = params.html;
      if (params.subject) body.subject = params.subject;
      if (params.conversationId) body.conversationId = params.conversationId;
      if (params.conversationProviderId) body.conversationProviderId = params.conversationProviderId;
      const res = await ghlRequest({
        method: "POST",
        path: "/conversations/messages",
        body,
      });
      return { content: [{ type: "text" as const, text: formatResponse(res) }] };
    }
  );

  // ─── Create Conversation ─────────────────────────────────────────
  server.tool(
    "ghl_create_conversation",
    "Create a new conversation thread with a contact.",
    {
      contactId: z.string().describe("Contact ID"),
    },
    async (params) => {
      const res = await ghlRequest({
        method: "POST",
        path: "/conversations/",
        body: { contactId: params.contactId },
      });
      return { content: [{ type: "text" as const, text: formatResponse(res) }] };
    }
  );
}
