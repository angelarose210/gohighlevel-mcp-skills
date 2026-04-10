/**
 * Calendars & Appointments Tools — 6 tools for calendar and scheduling management.
 */
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { ghlRequest, formatResponse } from "../client.js";

export function registerCalendarsTools(server: McpServer) {
  // ─── List Calendars ──────────────────────────────────────────────
  server.tool(
    "ghl_list_calendars",
    "List all calendars configured for the current location. Returns calendar IDs needed for booking appointments.",
    {},
    async () => {
      const res = await ghlRequest({
        method: "GET",
        path: "/calendars/",
        params: {},
      });
      return { content: [{ type: "text" as const, text: formatResponse(res) }] };
    }
  );

  // ─── Get Free Slots ──────────────────────────────────────────────
  server.tool(
    "ghl_get_free_slots",
    "Get available time slots for a calendar. Use this to check availability before booking.",
    {
      calendarId: z.string().describe("Calendar ID"),
      startDate: z.string().describe("Start date (YYYY-MM-DD)"),
      endDate: z.string().describe("End date (YYYY-MM-DD)"),
      timezone: z.string().optional().describe("Timezone (e.g. America/New_York). Defaults to location timezone."),
    },
    async (params) => {
      const res = await ghlRequest({
        method: "GET",
        path: "/calendars/{calendarId}/free-slots",
        params: {
          calendarId: params.calendarId,
          startDate: params.startDate,
          endDate: params.endDate,
          timezone: params.timezone,
        },
      });
      return { content: [{ type: "text" as const, text: formatResponse(res) }] };
    }
  );

  // ─── List Events ─────────────────────────────────────────────────
  server.tool(
    "ghl_list_calendar_events",
    "List calendar events/appointments within a date range.",
    {
      calendarId: z.string().optional().describe("Filter by specific calendar"),
      startTime: z.string().optional().describe("Start time (ISO 8601, e.g. 2026-04-01T00:00:00Z)"),
      endTime: z.string().optional().describe("End time (ISO 8601)"),
    },
    async (params) => {
      const queryParams: Record<string, unknown> = {};
      if (params.calendarId) queryParams.calendarId = params.calendarId;
      if (params.startTime) queryParams.startTime = params.startTime;
      if (params.endTime) queryParams.endTime = params.endTime;
      const res = await ghlRequest({
        method: "GET",
        path: "/calendars/events",
        params: queryParams,
      });
      return { content: [{ type: "text" as const, text: formatResponse(res) }] };
    }
  );

  // ─── Create Appointment ──────────────────────────────────────────
  server.tool(
    "ghl_create_appointment",
    "Book a new appointment on a calendar. Use ghl_get_free_slots first to check availability.",
    {
      calendarId: z.string().describe("Calendar ID to book on"),
      title: z.string().describe("Appointment title"),
      startTime: z.string().describe("Start time (ISO 8601, e.g. 2026-04-10T14:00:00Z)"),
      endTime: z.string().describe("End time (ISO 8601)"),
      contactId: z.string().optional().describe("Contact ID to associate"),
      assignedUserId: z.string().optional().describe("Staff member to assign"),
      notes: z.string().optional().describe("Appointment notes"),
      status: z.enum(["confirmed", "unconfirmed", "cancelled", "showed", "noshow", "invalid"]).optional(),
      address: z.string().optional().describe("Meeting location/address"),
    },
    async (params) => {
      const body: Record<string, unknown> = {};
      for (const [key, value] of Object.entries(params)) {
        if (value !== undefined) body[key] = value;
      }
      const res = await ghlRequest({
        method: "POST",
        path: "/calendars/events/appointments",
        body,
      });
      return { content: [{ type: "text" as const, text: formatResponse(res) }] };
    }
  );

  // ─── Update Appointment ──────────────────────────────────────────
  server.tool(
    "ghl_update_appointment",
    "Update an existing appointment — reschedule, change status, add notes, etc.",
    {
      eventId: z.string().describe("Appointment/event ID to update"),
      title: z.string().optional(),
      startTime: z.string().optional(),
      endTime: z.string().optional(),
      status: z.enum(["confirmed", "unconfirmed", "cancelled", "showed", "noshow", "invalid"]).optional(),
      notes: z.string().optional(),
      address: z.string().optional(),
    },
    async (params) => {
      const { eventId, ...fields } = params;
      const body: Record<string, unknown> = {};
      for (const [key, value] of Object.entries(fields)) {
        if (value !== undefined) body[key] = value;
      }
      const res = await ghlRequest({
        method: "PUT",
        path: "/calendars/events/appointments/{eventId}",
        params: { eventId },
        body,
      });
      return { content: [{ type: "text" as const, text: formatResponse(res) }] };
    }
  );

  // ─── Delete Appointment ──────────────────────────────────────────
  server.tool(
    "ghl_delete_appointment",
    "Cancel and delete a calendar appointment.",
    {
      eventId: z.string().describe("Appointment/event ID to delete"),
    },
    async (params) => {
      const res = await ghlRequest({
        method: "DELETE",
        path: "/calendars/events/{eventId}",
        params: { eventId: params.eventId },
      });
      return { content: [{ type: "text" as const, text: formatResponse(res) }] };
    }
  );
}
