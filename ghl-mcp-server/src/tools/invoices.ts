/**
 * Invoices Tools — 4 tools for invoice management.
 */
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { ghlRequest, formatResponse } from "../client.js";

export function registerInvoicesTools(server: McpServer) {
  // ─── List Invoices ───────────────────────────────────────────────
  server.tool(
    "ghl_list_invoices",
    "List invoices for the location. Filter by contact, status, or date.",
    {
      contactId: z.string().optional().describe("Filter by contact ID"),
      status: z.enum(["draft", "sent", "paid", "void", "partially_paid"]).optional(),
      limit: z.number().optional().default(20),
      offset: z.number().optional().default(0),
      startAt: z.string().optional().describe("Filter after date (ISO 8601)"),
      endAt: z.string().optional().describe("Filter before date (ISO 8601)"),
    },
    async (params) => {
      const queryParams: Record<string, unknown> = {};
      for (const [key, value] of Object.entries(params)) {
        if (value !== undefined) queryParams[key] = value;
      }
      const res = await ghlRequest({
        method: "GET",
        path: "/invoices/",
        params: queryParams,
      });
      return { content: [{ type: "text" as const, text: formatResponse(res) }] };
    }
  );

  // ─── Get Invoice ─────────────────────────────────────────────────
  server.tool(
    "ghl_get_invoice",
    "Get full details of a specific invoice.",
    {
      invoiceId: z.string().describe("Invoice ID"),
    },
    async (params) => {
      const res = await ghlRequest({
        method: "GET",
        path: "/invoices/{invoiceId}",
        params: { invoiceId: params.invoiceId },
      });
      return { content: [{ type: "text" as const, text: formatResponse(res) }] };
    }
  );

  // ─── Create Invoice ──────────────────────────────────────────────
  server.tool(
    "ghl_create_invoice",
    "Create a new invoice for a contact.",
    {
      contactId: z.string().describe("Contact to invoice"),
      name: z.string().describe("Invoice title/name"),
      items: z
        .array(
          z.object({
            name: z.string().describe("Item name"),
            amount: z.number().describe("Price per unit in cents (e.g. 9999 = $99.99)"),
            qty: z.number().optional().default(1).describe("Quantity"),
          })
        )
        .describe("Invoice line items"),
      currency: z.string().optional().default("USD"),
      dueDate: z.string().optional().describe("Due date (ISO 8601)"),
      businessDetails: z.object({
        name: z.string().optional(),
        address: z.string().optional(),
        email: z.string().optional(),
        phone: z.string().optional(),
      }).optional().describe("Business details on the invoice"),
    },
    async (params) => {
      const body: Record<string, unknown> = {
        contactId: params.contactId,
        name: params.name,
        items: params.items,
        currency: params.currency,
      };
      if (params.dueDate) body.dueDate = params.dueDate;
      if (params.businessDetails) body.businessDetails = params.businessDetails;
      const res = await ghlRequest({ method: "POST", path: "/invoices/", body });
      return { content: [{ type: "text" as const, text: formatResponse(res) }] };
    }
  );

  // ─── Send Invoice ────────────────────────────────────────────────
  server.tool(
    "ghl_send_invoice",
    "Send an existing invoice to the contact via email.",
    {
      invoiceId: z.string().describe("Invoice ID to send"),
    },
    async (params) => {
      const res = await ghlRequest({
        method: "POST",
        path: "/invoices/{invoiceId}/send",
        params: { invoiceId: params.invoiceId },
        body: {},
      });
      return { content: [{ type: "text" as const, text: formatResponse(res) }] };
    }
  );
}
