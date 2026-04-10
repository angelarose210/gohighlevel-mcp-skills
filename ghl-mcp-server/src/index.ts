#!/usr/bin/env node
/**
 * GoHighLevel MCP Server
 *
 * A Model Context Protocol server that provides Claude with 47+ tools
 * for managing your GoHighLevel CRM — contacts, funnels, pipelines,
 * calendars, messaging, payments, and more.
 *
 * Auth: Set GHL_API_KEY and GHL_LOCATION_ID environment variables.
 *
 * Usage:
 *   npx tsx src/index.ts          # development
 *   node dist/index.js            # production (after tsc build)
 */

import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";

// Tool registrations
import { registerContactsTools } from "./tools/contacts.js";
import { registerOpportunitiesTools } from "./tools/opportunities.js";
import { registerCalendarsTools } from "./tools/calendars.js";
import { registerConversationsTools } from "./tools/conversations.js";
import { registerWorkflowsTools } from "./tools/workflows.js";
import { registerFunnelsTools } from "./tools/funnels.js";
import { registerFormsSurveysTools } from "./tools/forms-surveys.js";
import { registerPaymentsTools } from "./tools/payments.js";
import { registerInvoicesTools } from "./tools/invoices.js";
import { registerProductsTools } from "./tools/products.js";
import { registerMediaTools } from "./tools/media.js";
import { registerLocationsTools } from "./tools/locations.js";
import { registerUsersTools } from "./tools/users.js";
import { registerBlogsTools } from "./tools/blogs.js";
import { registerSocialMediaTools } from "./tools/social-media.js";
import { registerCustomObjectsTools } from "./tools/custom-objects.js";

async function main() {
  // Validate env vars early with a helpful error
  const apiKey = process.env.GHL_API_KEY;
  const locationId = process.env.GHL_LOCATION_ID;

  if (!apiKey || !locationId) {
    const missing: string[] = [];
    if (!apiKey) missing.push("GHL_API_KEY");
    if (!locationId) missing.push("GHL_LOCATION_ID");
    console.error(
      `\n  GoHighLevel MCP Server\n` +
        `  ──────────────────────\n` +
        `  Missing required environment variable(s): ${missing.join(", ")}\n\n` +
        `  Setup:\n` +
        `    1. Go to your GHL sub-account > Settings > Integrations > API Key\n` +
        `    2. Copy your Private Integration Token\n` +
        `    3. Set environment variables:\n\n` +
        `       export GHL_API_KEY="your-private-integration-token"\n` +
        `       export GHL_LOCATION_ID="your-location-id"\n\n` +
        `  Or add them to your .env file.\n`
    );
    process.exit(1);
  }

  // Create MCP server
  const server = new McpServer({
    name: "ghl-mcp-server",
    version: "1.0.0",
    description:
      "GoHighLevel CRM integration — manage contacts, funnels, pipelines, calendars, messaging, payments, and more.",
  });

  // Register all tool categories
  registerContactsTools(server);          // 9 tools
  registerOpportunitiesTools(server);     // 5 tools
  registerCalendarsTools(server);         // 6 tools
  registerConversationsTools(server);     // 4 tools
  registerWorkflowsTools(server);         // 3 tools
  registerFunnelsTools(server);           // 4 tools
  registerFormsSurveysTools(server);      // 4 tools
  registerPaymentsTools(server);          // 5 tools
  registerInvoicesTools(server);          // 4 tools
  registerProductsTools(server);          // 4 tools
  registerMediaTools(server);             // 3 tools
  registerLocationsTools(server);         // 3 tools
  registerUsersTools(server);             // 2 tools
  registerBlogsTools(server);             // 3 tools
  registerSocialMediaTools(server);       // 3 tools
  registerCustomObjectsTools(server);     // 4 tools
  // Total: 66 tools across 16 categories

  // Connect via stdio transport (standard for MCP)
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error("GoHighLevel MCP Server running (stdio transport)");
}

main().catch((err) => {
  console.error("Fatal error:", err);
  process.exit(1);
});
