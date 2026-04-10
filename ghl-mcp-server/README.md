# GoHighLevel MCP Server

A [Model Context Protocol](https://modelcontextprotocol.io/) server that gives Claude (or any MCP client) **66 tools** for managing your GoHighLevel CRM — contacts, funnels, pipelines, calendars, messaging, payments, invoicing, blogs, social media, and more.

Part of [gohighlevel-mcp-skills](../README.md) — the MCP server plus multi-platform agent skills for GoHighLevel.

## Quick Start

### 1. Get your GHL credentials

1. Log into your GHL sub-account
2. Go to **Settings** > **Integrations** > **API Key**
3. Copy your **Private Integration Token**
4. Note your **Location ID** (in the URL or under Settings > Business Profile)

### 2. Set environment variables

```bash
export GHL_API_KEY="your-private-integration-token"
export GHL_LOCATION_ID="your-location-id"
```

Or create a `.env` file (see `.env.example`).

### 3. Add to Claude Code

Add this to your Claude Code MCP settings (`~/.claude/settings.json` or project `.claude/settings.json`):

```json
{
  "mcpServers": {
    "ghl": {
      "command": "npx",
      "args": ["tsx", "C:/path/to/ghl-mcp-server/src/index.ts"],
      "env": {
        "GHL_API_KEY": "your-private-integration-token",
        "GHL_LOCATION_ID": "your-location-id"
      }
    }
  }
}
```

Or if you prefer to build first:

```bash
cd ghl-mcp-server
npm install
npm run build
```

Then use the compiled version:

```json
{
  "mcpServers": {
    "ghl": {
      "command": "node",
      "args": ["C:/path/to/ghl-mcp-server/dist/index.js"],
      "env": {
        "GHL_API_KEY": "your-private-integration-token",
        "GHL_LOCATION_ID": "your-location-id"
      }
    }
  }
}
```

## Tools (66 across 16 categories)

| Category | Tools | Key Operations |
|----------|-------|----------------|
| **Contacts** | 9 | CRUD, search, upsert, tags, custom fields |
| **Opportunities** | 5 | Pipelines, deals, stage management |
| **Calendars** | 6 | Appointments, free slots, scheduling |
| **Conversations** | 4 | SMS, Email, WhatsApp, message history |
| **Workflows** | 3 | List, enroll/remove contacts |
| **Funnels** | 4 | List funnels/pages, URL redirects |
| **Forms & Surveys** | 4 | List forms/surveys, get submissions |
| **Payments** | 5 | Orders, subscriptions, transactions, coupons |
| **Invoices** | 4 | Create, send, list invoices |
| **Products** | 4 | Catalog, pricing |
| **Media** | 3 | Upload, list, delete files |
| **Locations** | 3 | Sub-account details, custom fields, tags |
| **Users** | 2 | Team member management |
| **Blogs** | 3 | Posts, categories |
| **Social Media** | 3 | Accounts, create/list posts |
| **Custom Objects** | 4 | Schemas, records |

## Architecture

```
src/
├── index.ts          # Entry point — registers all tools, starts stdio transport
├── client.ts         # HTTP client — auth, retries, rate limiting, error handling
└── tools/
    ├── contacts.ts         # Contact CRUD, search, tags
    ├── opportunities.ts    # Pipelines, deals
    ├── calendars.ts        # Appointments, scheduling
    ├── conversations.ts    # Multi-channel messaging
    ├── workflows.ts        # Automation enrollment
    ├── funnels.ts          # Funnel/page listing, redirects
    ├── forms-surveys.ts    # Form/survey submissions
    ├── payments.ts         # Orders, subscriptions
    ├── invoices.ts         # Invoice management
    ├── products.ts         # Product catalog
    ├── media.ts            # Media library
    ├── locations.ts        # Sub-account config
    ├── users.ts            # Team management
    ├── blogs.ts            # Blog posts
    ├── social-media.ts     # Social posting
    └── custom-objects.ts   # Extensible data
```

## Authentication

This server uses **Private Integration Tokens** (the simplest GHL auth method). Each team member uses their own token.

| Variable | Required | Description |
|----------|----------|-------------|
| `GHL_API_KEY` | Yes | Private Integration Token from GHL Settings |
| `GHL_LOCATION_ID` | Yes | Your sub-account/location ID |

### For Teams

Each coworker sets their own environment variables. No shared secrets, no marketplace app registration needed.

## Error Handling

- **Rate limiting**: Automatic retry with exponential backoff (500ms → 1s → 2s)
- **Auth errors**: Clear messages explaining how to fix your API key
- **Validation errors**: Passed through from GHL with field-level details
- **Network errors**: Retry up to 3 times

## Important Notes

- **Funnels are read-only** — the GHL API cannot create or edit funnel pages. Use the GHL drag-and-drop builder for that.
- **Email requires `html` field** — when sending email via `ghl_send_message`, use `html` (not `message`) for the body.
- **Invoice amounts in cents** — `9999` = $99.99
- **Phone numbers need country code** — use `+1` prefix for US numbers

## Companion Skill

This repo includes a companion skill that teaches AI agents how to use these tools effectively. Available for three platforms:

| Agent | Install from |
|-------|-------------|
| Claude Code | `../.claude/skills/ghl/` |
| Hermes Agent | `../.hermes/skills/ghl/` |
| OpenClaw | `../.openclaw/skills/ghl/` |

Each skill directory contains:

```
ghl/
├── SKILL.md              # Main skill (auto-triggers on GHL-related requests)
└── references/
    └── api-reference.md  # Complete GHL API documentation
```

See the root [README.md](../README.md) for installation instructions.

## Development

```bash
npm install
npm run dev          # Run with tsx (hot reload)
npm run typecheck    # Type-check without building
npm run build        # Compile to dist/
npm start            # Run compiled version
```

## License

MIT
