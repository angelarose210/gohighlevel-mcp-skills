/**
 * Products Tools — 4 tools for product catalog and pricing management.
 */
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { ghlRequest, formatResponse } from "../client.js";

export function registerProductsTools(server: McpServer) {
  // ─── List Products ───────────────────────────────────────────────
  server.tool(
    "ghl_list_products",
    "List all products in the catalog for the current location.",
    {
      limit: z.number().optional().default(20),
      offset: z.number().optional().default(0),
    },
    async (params) => {
      const res = await ghlRequest({
        method: "GET",
        path: "/products/",
        params: { limit: params.limit, offset: params.offset },
      });
      return { content: [{ type: "text" as const, text: formatResponse(res) }] };
    }
  );

  // ─── Get Product ─────────────────────────────────────────────────
  server.tool(
    "ghl_get_product",
    "Get detailed information about a specific product including prices.",
    {
      productId: z.string().describe("Product ID"),
    },
    async (params) => {
      const res = await ghlRequest({
        method: "GET",
        path: "/products/{productId}",
        params: { productId: params.productId },
      });
      return { content: [{ type: "text" as const, text: formatResponse(res) }] };
    }
  );

  // ─── Create Product ──────────────────────────────────────────────
  server.tool(
    "ghl_create_product",
    "Create a new product in the catalog.",
    {
      name: z.string().describe("Product name"),
      description: z.string().optional().describe("Product description"),
      productType: z.enum(["PHYSICAL", "DIGITAL", "SERVICE"]).optional().default("DIGITAL"),
      imageUrl: z.string().optional().describe("Product image URL"),
    },
    async (params) => {
      const body: Record<string, unknown> = {};
      for (const [key, value] of Object.entries(params)) {
        if (value !== undefined) body[key] = value;
      }
      const res = await ghlRequest({ method: "POST", path: "/products/", body });
      return { content: [{ type: "text" as const, text: formatResponse(res) }] };
    }
  );

  // ─── List Product Prices ─────────────────────────────────────────
  server.tool(
    "ghl_list_product_prices",
    "List pricing options/variants for a specific product.",
    {
      productId: z.string().describe("Product ID"),
    },
    async (params) => {
      const res = await ghlRequest({
        method: "GET",
        path: "/products/{productId}/price",
        params: { productId: params.productId },
      });
      return { content: [{ type: "text" as const, text: formatResponse(res) }] };
    }
  );
}
