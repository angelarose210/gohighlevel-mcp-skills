# GoHighLevel MCP + Skills

**MCP server and AI agent skills for managing GoHighLevel CRM with Claude Code, Hermes Agent, and OpenClaw.**

66 MCP tools across 16 categories give your AI agent full control over your GoHighLevel sub-account: contacts, pipelines, calendars, multi-channel messaging (SMS, email, WhatsApp), workflows, invoicing, payments, blogs, social media, and more.

The companion skill teaches your agent how to use these tools correctly, including the gotchas that trip people up (email needs the `html` field, invoice amounts are in cents, funnels are read-only via API).

---

## What's in the box

### MCP Server (`ghl-mcp-server/`)

A TypeScript MCP server that connects your AI agent to the GoHighLevel API.

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

### Companion Skill (`.claude/`, `.hermes/`, `.openclaw/`)

The skill teaches your agent:
- Which tool to call for each task
- What order to call them (get pipeline IDs before creating a deal, etc.)
- Critical rules that prevent errors (email HTML, cents not dollars, phone country codes)
- Common workflow recipes (lead capture, appointment booking, invoice creation, pipeline management)
- Error handling (auth failures, rate limits, validation errors)

---

## Quick start

### 1. Get your GHL credentials

1. Log into your GHL sub-account
2. Go to **Settings** > **Integrations** > **API Key**
3. Copy your **Private Integration Token**
4. Note your **Location ID** (in the URL or under Settings > Business Profile)

### 2. Install the MCP server

```bash
git clone https://github.com/YOUR_USERNAME/gohighlevel-mcp-skills.git
cd gohighlevel-mcp-skills/ghl-mcp-server
npm install
npm run build
```

Add to your Claude Code MCP settings (`~/.claude/settings.json` or project `.claude/settings.json`):

```json
{
  "mcpServers": {
    "ghl": {
      "command": "node",
      "args": ["/path/to/gohighlevel-mcp-skills/ghl-mcp-server/dist/index.js"],
      "env": {
        "GHL_API_KEY": "your-private-integration-token",
        "GHL_LOCATION_ID": "your-location-id"
      }
    }
  }
}
```

Or run in development mode with hot reload:

```json
{
  "mcpServers": {
    "ghl": {
      "command": "npx",
      "args": ["tsx", "/path/to/gohighlevel-mcp-skills/ghl-mcp-server/src/index.ts"],
      "env": {
        "GHL_API_KEY": "your-private-integration-token",
        "GHL_LOCATION_ID": "your-location-id"
      }
    }
  }
}
```

### 3. Install the skill

Copy the skills for your agent:

**Claude Code:**

```bash
cp -r gohighlevel-mcp-skills/.claude/skills/ghl your-project/.claude/skills/
```

**Hermes Agent:**

```bash
cp -r gohighlevel-mcp-skills/.hermes/skills/ghl your-project/.hermes/skills/
```

**OpenClaw:**

```bash
cp -r gohighlevel-mcp-skills/.openclaw/skills/ghl your-project/.openclaw/skills/
```

Or clone the whole repo and work inside it. Your agent picks up the skills automatically from the matching directory.

### 4. Start using it

Once the MCP server is connected and the skill is installed, just talk to your agent:

```
Add a new contact: John Smith, john@example.com, +15551234567, tag them as "new-lead"
```

```
Book an appointment for John Smith next Tuesday at 2pm
```

```
Create an invoice for $1,500 for website design and send it to the client
```

```
Move the Smith deal to the "Proposal Sent" stage
```

```
Send John a text: "Your appointment is confirmed for Tuesday at 2pm"
```

---

## Architecture

```
┌─────────────────────────────────────────┐
│  AI Agent                                │
│  (Claude Code / Hermes / OpenClaw)       │
│  ┌─────────────────────────────────────┐ │
│  │  GHL Skill (SKILL.md)              │ │
│  │  Teaches agent how to use tools     │ │
│  └──────────────┬──────────────────────┘ │
└─────────────────┼───────────────────────┘
                  │ (MCP protocol via stdio)
┌─────────────────▼───────────────────────┐
│  GHL MCP Server                          │
│  66 tools, auth, retry, rate limiting    │
└─────────────────┬───────────────────────┘
                  │ (HTTPS)
┌─────────────────▼───────────────────────┐
│  GoHighLevel API                         │
│  https://services.leadconnectorhq.com   │
└─────────────────────────────────────────┘
```

## Things to know

- **Email requires `html` field.** When sending email via `ghl_send_message`, use `html` (not `message`) for the body, plus `subject`. The `message` field is for SMS/WhatsApp.
- **Invoice amounts are in cents.** $99.99 = `9999`. $1,500 = `150000`.
- **Funnels are read-only.** The GHL API can list funnels and pages but can't create or edit pages. Use the GHL drag-and-drop builder for that.
- **Phone numbers need country code.** Use `+15551234567` format for US numbers.
- **Get IDs before creating.** Call `ghl_get_pipelines` before creating opportunities, `ghl_list_calendars` before booking appointments, `ghl_list_workflows` before enrolling contacts.

## Compatibility

This repo ships the same skill in three directory formats:

| Agent | Skills directory | Format notes |
|-------|-----------------|--------------|
| Claude Code | `.claude/skills/` | Standard AgentSkills spec |
| Hermes Agent | `.hermes/skills/` | Same spec, different path |
| OpenClaw | `.openclaw/skills/` | Adds `metadata.openclaw` block in frontmatter |

The skill logic is identical across all three. The only differences are the directory name and minor frontmatter fields.

### AgentSkills standard

All three formats follow the AgentSkills convention:

- YAML frontmatter with `name`, `description`, `version`
- Markdown body with instructions
- Optional `references/` subdirectory for supporting docs

## File structure

```
gohighlevel-mcp-skills/
  .claude/skills/             # Claude Code
    ghl/
      SKILL.md                # Main skill file
      references/
        api-reference.md      # Complete GHL API documentation
  .hermes/skills/             # Hermes Agent (same structure)
    ghl/
      SKILL.md
      references/
        api-reference.md
  .openclaw/skills/           # OpenClaw (same structure, metadata frontmatter)
    ghl/
      SKILL.md
      references/
        api-reference.md
  ghl-mcp-server/             # MCP server
    src/
      index.ts                # Entry point
      client.ts               # HTTP client with auth & retry
      tools/                  # 16 tool modules (66 tools)
    package.json
    tsconfig.json
    .env.example
    README.md
  README.md
  LICENSE
```

## Requirements

- **Node.js** 18+ (for the MCP server)
- **GoHighLevel** account with API access
- One of: Claude Code, Hermes Agent, or OpenClaw

## Contributing

If another agent framework adopts the AgentSkills spec, adding support is straightforward. Create a new dotfile directory with the same SKILL.md files and adjust the frontmatter to match. PRs welcome.

## License

MIT - do whatever you want with it.

---

Built by [Angela Ai Specialist](https://www.facebook.com/groups/814195164542542/user/61574356028671) for people who want their AI agent to run their GHL CRM.

[Join the Facebook group](https://www.facebook.com/groups/814195164542542) for tips, new skills, and updates.
