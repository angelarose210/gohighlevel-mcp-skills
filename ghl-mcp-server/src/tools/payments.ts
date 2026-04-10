/**
 * Payments Tools — 5 tools for orders, subscriptions, transactions, and coupons.
 */
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { ghlRequest, formatResponse } from "../client.js";

export function registerPaymentsTools(server: McpServer) {
  // ─── List Orders ─────────────────────────────────────────────────
  server.tool(
    "ghl_list_orders",
    "List payment orders. Filter by contact, status, or date range.",
    {
      contactId: z.string().optional().describe("Filter by contact ID"),
      status: z.string().optional().describe("Filter by status"),
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
        path: "/payments/orders",
        params: queryParams,
      });
      return { content: [{ type: "text" as const, text: formatResponse(res) }] };
    }
  );

  // ─── Get Order ───────────────────────────────────────────────────
  server.tool(
    "ghl_get_order",
    "Get detailed information about a specific order.",
    {
      orderId: z.string().describe("Order ID"),
    },
    async (params) => {
      const res = await ghlRequest({
        method: "GET",
        path: "/payments/orders/{orderId}",
        params: { orderId: params.orderId },
      });
      return { content: [{ type: "text" as const, text: formatResponse(res) }] };
    }
  );

  // ─── List Subscriptions ──────────────────────────────────────────
  server.tool(
    "ghl_list_subscriptions",
    "List active and past subscriptions.",
    {
      contactId: z.string().optional().describe("Filter by contact ID"),
      limit: z.number().optional().default(20),
      offset: z.number().optional().default(0),
    },
    async (params) => {
      const queryParams: Record<string, unknown> = {};
      for (const [key, value] of Object.entries(params)) {
        if (value !== undefined) queryParams[key] = value;
      }
      const res = await ghlRequest({
        method: "GET",
        path: "/payments/subscriptions",
        params: queryParams,
      });
      return { content: [{ type: "text" as const, text: formatResponse(res) }] };
    }
  );

  // ─── List Transactions ───────────────────────────────────────────
  server.tool(
    "ghl_list_transactions",
    "List payment transactions. Shows individual payment events.",
    {
      contactId: z.string().optional().describe("Filter by contact ID"),
      limit: z.number().optional().default(20),
      offset: z.number().optional().default(0),
      startAt: z.string().optional(),
      endAt: z.string().optional(),
    },
    async (params) => {
      const queryParams: Record<string, unknown> = {};
      for (const [key, value] of Object.entries(params)) {
        if (value !== undefined) queryParams[key] = value;
      }
      const res = await ghlRequest({
        method: "GET",
        path: "/payments/transactions",
        params: queryParams,
      });
      return { content: [{ type: "text" as const, text: formatResponse(res) }] };
    }
  );

  // ─── List Coupons ────────────────────────────────────────────────
  server.tool(
    "ghl_list_coupons",
    "List discount coupons configured for the location.",
    {
      limit: z.number().optional().default(20),
      offset: z.number().optional().default(0),
    },
    async (params) => {
      const res = await ghlRequest({
        method: "GET",
        path: "/payments/coupons",
        params: { limit: params.limit, offset: params.offset },
      });
      return { content: [{ type: "text" as const, text: formatResponse(res) }] };
    }
  );
}
