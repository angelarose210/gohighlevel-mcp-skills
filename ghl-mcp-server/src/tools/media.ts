/**
 * Media Library Tools — 3 tools for file/media management.
 */
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { ghlRequest, formatResponse } from "../client.js";

export function registerMediaTools(server: McpServer) {
  // ─── List Media Files ────────────────────────────────────────────
  server.tool(
    "ghl_list_media",
    "List files and folders in the media library. Media is used for email images, funnel assets, etc.",
    {
      sortBy: z.enum(["createdAt", "updatedAt", "name"]).optional().default("createdAt"),
      sortOrder: z.enum(["asc", "desc"]).optional().default("desc"),
      limit: z.number().optional().default(20),
      offset: z.number().optional().default(0),
    },
    async (params) => {
      const res = await ghlRequest({
        method: "GET",
        path: "/medias/files",
        params: {
          sortBy: params.sortBy,
          sortOrder: params.sortOrder,
          limit: params.limit,
          offset: params.offset,
        },
      });
      return { content: [{ type: "text" as const, text: formatResponse(res) }] };
    }
  );

  // ─── Upload Media (by URL) ───────────────────────────────────────
  server.tool(
    "ghl_upload_media_url",
    "Upload a file to the media library from a URL.",
    {
      url: z.string().describe("Public URL of the file to upload"),
      name: z.string().describe("File name to save as"),
    },
    async (params) => {
      const res = await ghlRequest({
        method: "POST",
        path: "/medias/upload-file",
        body: { url: params.url, name: params.name },
      });
      return { content: [{ type: "text" as const, text: formatResponse(res) }] };
    }
  );

  // ─── Delete Media ────────────────────────────────────────────────
  server.tool(
    "ghl_delete_media",
    "Delete a file from the media library.",
    {
      fileId: z.string().describe("File ID to delete"),
    },
    async (params) => {
      const res = await ghlRequest({
        method: "DELETE",
        path: "/medias/{fileId}",
        params: { fileId: params.fileId },
      });
      return { content: [{ type: "text" as const, text: formatResponse(res) }] };
    }
  );
}
