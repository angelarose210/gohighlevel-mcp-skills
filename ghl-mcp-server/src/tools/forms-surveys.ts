/**
 * Forms & Surveys Tools — 4 tools for viewing forms, surveys, and their submissions.
 */
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { ghlRequest, formatResponse } from "../client.js";

export function registerFormsSurveysTools(server: McpServer) {
  // ─── List Forms ──────────────────────────────────────────────────
  server.tool(
    "ghl_list_forms",
    "List all forms configured for the location. Forms are used to capture leads from funnels and websites.",
    {
      limit: z.number().optional().default(20),
      skip: z.number().optional().default(0),
      type: z.string().optional().describe("Filter by form type"),
    },
    async (params) => {
      const queryParams: Record<string, unknown> = {};
      if (params.limit) queryParams.limit = params.limit;
      if (params.skip) queryParams.skip = params.skip;
      if (params.type) queryParams.type = params.type;
      const res = await ghlRequest({
        method: "GET",
        path: "/forms/",
        params: queryParams,
      });
      return { content: [{ type: "text" as const, text: formatResponse(res) }] };
    }
  );

  // ─── Get Form Submissions ────────────────────────────────────────
  server.tool(
    "ghl_get_form_submissions",
    "Get submissions/entries for a specific form. Includes contact data captured by the form.",
    {
      formId: z.string().describe("Form ID"),
      limit: z.number().optional().default(20),
      page: z.number().optional().default(1),
      startAt: z.string().optional().describe("Filter submissions after this date (ISO 8601)"),
      endAt: z.string().optional().describe("Filter submissions before this date (ISO 8601)"),
    },
    async (params) => {
      const queryParams: Record<string, unknown> = {};
      queryParams.formId = params.formId;
      queryParams.limit = params.limit;
      queryParams.page = params.page;
      if (params.startAt) queryParams.startAt = params.startAt;
      if (params.endAt) queryParams.endAt = params.endAt;
      const res = await ghlRequest({
        method: "GET",
        path: "/forms/submissions",
        params: queryParams,
      });
      return { content: [{ type: "text" as const, text: formatResponse(res) }] };
    }
  );

  // ─── List Surveys ────────────────────────────────────────────────
  server.tool(
    "ghl_list_surveys",
    "List all surveys configured for the location.",
    {
      limit: z.number().optional().default(20),
      skip: z.number().optional().default(0),
    },
    async (params) => {
      const res = await ghlRequest({
        method: "GET",
        path: "/surveys/",
        params: { limit: params.limit, skip: params.skip },
      });
      return { content: [{ type: "text" as const, text: formatResponse(res) }] };
    }
  );

  // ─── Get Survey Submissions ──────────────────────────────────────
  server.tool(
    "ghl_get_survey_submissions",
    "Get submissions/responses for a specific survey.",
    {
      surveyId: z.string().describe("Survey ID"),
      limit: z.number().optional().default(20),
      page: z.number().optional().default(1),
      startAt: z.string().optional().describe("Filter after this date (ISO 8601)"),
      endAt: z.string().optional().describe("Filter before this date (ISO 8601)"),
    },
    async (params) => {
      const queryParams: Record<string, unknown> = {};
      queryParams.surveyId = params.surveyId;
      queryParams.limit = params.limit;
      queryParams.page = params.page;
      if (params.startAt) queryParams.startAt = params.startAt;
      if (params.endAt) queryParams.endAt = params.endAt;
      const res = await ghlRequest({
        method: "GET",
        path: "/surveys/submissions",
        params: queryParams,
      });
      return { content: [{ type: "text" as const, text: formatResponse(res) }] };
    }
  );
}
