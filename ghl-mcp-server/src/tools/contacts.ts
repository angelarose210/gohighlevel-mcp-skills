/**
 * Contacts Tools — 9 tools for contact CRUD, search, upsert, and tag management.
 */
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { ghlRequest, formatResponse } from "../client.js";

export function registerContactsTools(server: McpServer) {
  // ─── List Contacts ───────────────────────────────────────────────
  server.tool(
    "ghl_list_contacts",
    "List contacts for the current GHL location. Supports search queries and pagination.",
    {
      query: z.string().optional().describe("Search query (name, email, phone)"),
      limit: z.number().optional().default(20).describe("Results per page (max 100)"),
      page: z.number().optional().default(1).describe("Page number"),
    },
    async (params) => {
      const res = await ghlRequest({
        method: "GET",
        path: "/contacts/",
        params: { query: params.query, limit: params.limit, page: params.page },
      });
      return { content: [{ type: "text" as const, text: formatResponse(res) }] };
    }
  );

  // ─── Get Contact ─────────────────────────────────────────────────
  server.tool(
    "ghl_get_contact",
    "Get a specific contact by ID with all their details, tags, and custom fields.",
    {
      contactId: z.string().describe("The contact ID"),
    },
    async (params) => {
      const res = await ghlRequest({
        method: "GET",
        path: "/contacts/{contactId}",
        params: { contactId: params.contactId },
      });
      return { content: [{ type: "text" as const, text: formatResponse(res) }] };
    }
  );

  // ─── Create Contact ──────────────────────────────────────────────
  server.tool(
    "ghl_create_contact",
    "Create a new contact. At least email or phone is recommended. Supports custom fields and tags.",
    {
      firstName: z.string().optional().describe("First name"),
      lastName: z.string().optional().describe("Last name"),
      email: z.string().optional().describe("Email address"),
      phone: z.string().optional().describe("Phone with country code (e.g. +1234567890)"),
      tags: z.array(z.string()).optional().describe("Tags to assign"),
      source: z.string().optional().describe("Lead source (e.g. 'Website', 'API')"),
      customFields: z
        .array(
          z.object({
            id: z.string().describe("Custom field ID"),
            value: z.string().describe("Custom field value"),
          })
        )
        .optional()
        .describe("Custom field values"),
      assignedTo: z.string().optional().describe("User ID to assign contact to"),
      companyName: z.string().optional().describe("Company name"),
      website: z.string().optional().describe("Website URL"),
      address1: z.string().optional().describe("Street address"),
      city: z.string().optional().describe("City"),
      state: z.string().optional().describe("State"),
      postalCode: z.string().optional().describe("Postal/ZIP code"),
      country: z.string().optional().describe("Country"),
      timezone: z.string().optional().describe("Timezone (e.g. America/New_York)"),
    },
    async (params) => {
      const body: Record<string, unknown> = {};
      for (const [key, value] of Object.entries(params)) {
        if (value !== undefined) body[key] = value;
      }
      const res = await ghlRequest({ method: "POST", path: "/contacts/", body });
      return { content: [{ type: "text" as const, text: formatResponse(res) }] };
    }
  );

  // ─── Update Contact ──────────────────────────────────────────────
  server.tool(
    "ghl_update_contact",
    "Update an existing contact's details. Only provided fields are changed.",
    {
      contactId: z.string().describe("The contact ID to update"),
      firstName: z.string().optional(),
      lastName: z.string().optional(),
      email: z.string().optional(),
      phone: z.string().optional(),
      tags: z.array(z.string()).optional().describe("Replace all tags"),
      source: z.string().optional(),
      customFields: z
        .array(z.object({ id: z.string(), value: z.string() }))
        .optional(),
      assignedTo: z.string().optional(),
      companyName: z.string().optional(),
      website: z.string().optional(),
      address1: z.string().optional(),
      city: z.string().optional(),
      state: z.string().optional(),
      postalCode: z.string().optional(),
      country: z.string().optional(),
    },
    async (params) => {
      const { contactId, ...fields } = params;
      const body: Record<string, unknown> = {};
      for (const [key, value] of Object.entries(fields)) {
        if (value !== undefined) body[key] = value;
      }
      const res = await ghlRequest({
        method: "PUT",
        path: "/contacts/{contactId}",
        params: { contactId },
        body,
      });
      return { content: [{ type: "text" as const, text: formatResponse(res) }] };
    }
  );

  // ─── Delete Contact ──────────────────────────────────────────────
  server.tool(
    "ghl_delete_contact",
    "Permanently delete a contact by ID. This cannot be undone.",
    {
      contactId: z.string().describe("The contact ID to delete"),
    },
    async (params) => {
      const res = await ghlRequest({
        method: "DELETE",
        path: "/contacts/{contactId}",
        params: { contactId: params.contactId },
      });
      return { content: [{ type: "text" as const, text: formatResponse(res) }] };
    }
  );

  // ─── Search Contacts ─────────────────────────────────────────────
  server.tool(
    "ghl_search_contacts",
    "Advanced contact search with filters and sorting. Filter by email, name, tag, date, custom fields, etc.",
    {
      query: z.string().optional().describe("Search query string"),
      filters: z
        .array(
          z.object({
            field: z.string().describe("Field to filter (e.g. 'email', 'tags', 'dateAdded')"),
            operator: z
              .string()
              .describe("Operator: 'contains', 'eq', 'gt', 'lt', 'startsWith'"),
            value: z.string().describe("Filter value"),
          })
        )
        .optional()
        .describe("Advanced filter conditions"),
      sortBy: z.string().optional().describe("Field to sort by (e.g. 'dateAdded')"),
      sortOrder: z.enum(["asc", "desc"]).optional().default("desc"),
      pageLimit: z.number().optional().default(50).describe("Results per page"),
      page: z.number().optional().default(1),
    },
    async (params) => {
      const body: Record<string, unknown> = {};
      if (params.query) body.query = params.query;
      if (params.filters) body.filters = params.filters;
      if (params.sortBy) body.sort = [{ field: params.sortBy, direction: params.sortOrder ?? "desc" }];
      body.pageLimit = params.pageLimit;
      body.page = params.page;
      const res = await ghlRequest({ method: "POST", path: "/contacts/search", body });
      return { content: [{ type: "text" as const, text: formatResponse(res) }] };
    }
  );

  // ─── Upsert Contact ──────────────────────────────────────────────
  server.tool(
    "ghl_upsert_contact",
    "Create or update a contact matched by email or phone. If a matching contact exists, it's updated; otherwise a new one is created.",
    {
      email: z.string().optional().describe("Email for matching"),
      phone: z.string().optional().describe("Phone for matching"),
      firstName: z.string().optional(),
      lastName: z.string().optional(),
      tags: z.array(z.string()).optional(),
      source: z.string().optional(),
      customFields: z
        .array(z.object({ id: z.string(), value: z.string() }))
        .optional(),
      assignedTo: z.string().optional(),
      companyName: z.string().optional(),
    },
    async (params) => {
      const body: Record<string, unknown> = {};
      for (const [key, value] of Object.entries(params)) {
        if (value !== undefined) body[key] = value;
      }
      const res = await ghlRequest({ method: "POST", path: "/contacts/upsert", body });
      return { content: [{ type: "text" as const, text: formatResponse(res) }] };
    }
  );

  // ─── Add Tags ────────────────────────────────────────────────────
  server.tool(
    "ghl_add_contact_tags",
    "Add one or more tags to a contact. Tags are used for segmentation and workflow triggers.",
    {
      contactId: z.string().describe("The contact ID"),
      tags: z.array(z.string()).describe("Tag names to add (e.g. ['vip', 'lead'])"),
    },
    async (params) => {
      const res = await ghlRequest({
        method: "POST",
        path: "/contacts/{contactId}/tags",
        params: { contactId: params.contactId },
        body: { tags: params.tags },
      });
      return { content: [{ type: "text" as const, text: formatResponse(res) }] };
    }
  );

  // ─── Remove Tag ──────────────────────────────────────────────────
  server.tool(
    "ghl_remove_contact_tag",
    "Remove a specific tag from a contact.",
    {
      contactId: z.string().describe("The contact ID"),
      tag: z.string().describe("Tag name to remove"),
    },
    async (params) => {
      const res = await ghlRequest({
        method: "DELETE",
        path: "/contacts/{contactId}/tags",
        params: { contactId: params.contactId },
        body: { tags: [params.tag] },
      });
      return { content: [{ type: "text" as const, text: formatResponse(res) }] };
    }
  );
}
