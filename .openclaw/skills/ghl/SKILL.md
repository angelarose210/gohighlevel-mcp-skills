---
name: ghl
description: "GoHighLevel CRM management via MCP tools. Use when the user asks about contacts, pipelines, calendars, messaging, invoicing, workflows, or anything related to GoHighLevel/GHL."
version: 1.0.0
platforms: [all]
metadata: { "openclaw": { "requires": {} } }

---

# ghl

Manage GoHighLevel CRM through 66 MCP tools across 16 categories: contacts, pipelines, calendars, conversations, workflows, funnels, forms, surveys, payments, invoices, products, media, locations, users, blogs, social media, and custom objects.

## Triggers

Alternate expressions and non-obvious activations (primary phrases are matched automatically from the skill description):

- "add a lead" -> ghl_create_contact or ghl_upsert_contact
- "move the deal" -> ghl_update_opportunity (change stageId)
- "book an appointment" -> ghl_create_appointment
- "send them a text" -> ghl_send_message (type: SMS)
- "email the client" -> ghl_send_message (type: Email, use html field)
- "enroll in automation" -> ghl_enroll_in_workflow
- "check availability" -> ghl_get_free_slots
- "create an invoice" -> ghl_create_invoice (amounts in cents)
- "post to social" -> ghl_create_social_post
- "tag the contact" -> ghl_add_contact_tags
- "list my pipeline" -> ghl_get_pipelines then ghl_search_opportunities
- "schedule a post" -> ghl_create_social_post with scheduledAt
- "find the contact" -> ghl_search_contacts
- "publish a blog post" -> ghl_create_blog_post

## Critical Rules

These will cause failures if you get them wrong:

### 1. Email requires the `html` field
When sending email via `ghl_send_message` with `type: "Email"`:
- You MUST provide `html` (not `message`) for the email body
- You MUST provide `subject`
- The `message` field is for SMS/WhatsApp only
- Example: `html: "<p>Hello, here is your quote.</p>"`, `subject: "Your Quote"`

### 2. Invoice and payment amounts are in CENTS
All monetary values in `ghl_create_invoice` use cents, not dollars:
- $99.99 = `9999`
- $250.00 = `25000`
- $1,500.00 = `150000`

### 3. Funnels are READ-ONLY
The GHL API cannot create or edit funnel pages. You can only:
- List funnels and their pages
- Create URL redirects
- Tell the user to use the GHL drag-and-drop builder for page creation

### 4. Always get IDs before creating
Before creating records that reference other objects, fetch the IDs first:
- **Opportunities**: Call `ghl_get_pipelines` to get `pipelineId` and `stageId`
- **Appointments**: Call `ghl_list_calendars` to get `calendarId`
- **Workflow enrollment**: Call `ghl_list_workflows` to get `workflowId`
- **Custom records**: Call `ghl_get_custom_object_schema` to get field definitions

### 5. Phone numbers need country code
Always use `+1` prefix for US numbers: `+15551234567`

### 6. Date formats
Use ISO 8601 for all dates: `2025-01-15T10:00:00Z`

## Behavior

When triggered, this skill:

1. **Identifies what the user needs** from their request
2. **Checks prerequisites** (do we need IDs from a list/get call first?)
3. **Calls the appropriate MCP tool(s)** in the right order
4. **Formats the response** clearly for the user
5. **Suggests next actions** when appropriate

## Tool Quick Reference

### Contacts (9 tools)

| Tool | What it does | Key params |
|------|-------------|------------|
| `ghl_list_contacts` | List contacts with search | `query` (search text), `limit`, `startAfterId` |
| `ghl_get_contact` | Get single contact | `contactId` (required) |
| `ghl_create_contact` | Create new contact | `email`, `phone`, `firstName`, `lastName`, `tags[]`, `customFields[]` |
| `ghl_update_contact` | Update contact fields | `contactId` (required), any field to update |
| `ghl_delete_contact` | Delete contact permanently | `contactId` (required) |
| `ghl_search_contacts` | Advanced search with filters | `filters[]` (field, operator, value), `sort`, `sortDirection` |
| `ghl_upsert_contact` | Create or update by email/phone | `email` or `phone` (required), other fields |
| `ghl_add_contact_tags` | Add tags to contact | `contactId` (required), `tags[]` (required) |
| `ghl_remove_contact_tag` | Remove a tag | `contactId` (required), `tag` (required) |

### Opportunities / Deals (5 tools)

| Tool | What it does | Key params |
|------|-------------|------------|
| `ghl_get_pipelines` | List all pipelines & stages | none (call first to get IDs) |
| `ghl_search_opportunities` | Search deals | `pipelineId`, `stageId`, `status`, `contactId`, `query` |
| `ghl_create_opportunity` | Create a deal | `pipelineId`, `stageId`, `name`, `contactId`, `monetaryValue` |
| `ghl_update_opportunity` | Update deal | `opportunityId`, `stageId`, `status` (open/won/lost/abandoned), `monetaryValue` |
| `ghl_delete_opportunity` | Delete deal | `opportunityId` (required) |

### Calendars (6 tools)

| Tool | What it does | Key params |
|------|-------------|------------|
| `ghl_list_calendars` | List calendars | none (call first to get IDs) |
| `ghl_get_free_slots` | Check available time slots | `calendarId`, `startDate`, `endDate` (ISO 8601) |
| `ghl_list_calendar_events` | List appointments | `calendarId`, `startTime`, `endTime` |
| `ghl_create_appointment` | Book appointment | `calendarId`, `contactId`, `startTime`, `endTime`, `title` |
| `ghl_update_appointment` | Reschedule or update | `eventId`, `startTime`, `endTime`, `status` |
| `ghl_delete_appointment` | Cancel appointment | `eventId` (required) |

### Conversations (4 tools)

| Tool | What it does | Key params |
|------|-------------|------------|
| `ghl_list_conversations` | List message threads | `contactId`, `status` |
| `ghl_get_messages` | Get message history | `conversationId` (required) |
| `ghl_send_message` | Send SMS/Email/WhatsApp | `type`, `contactId`, `message` (SMS) or `html`+`subject` (Email) |
| `ghl_create_conversation` | Start new thread | `contactId` (required) |

### Workflows (3 tools)

| Tool | What it does | Key params |
|------|-------------|------------|
| `ghl_list_workflows` | List automations | none (call first to get IDs) |
| `ghl_enroll_in_workflow` | Enroll contact | `contactId`, `workflowId` |
| `ghl_remove_from_workflow` | Remove from workflow | `contactId`, `workflowId` |

### Funnels (4 tools) - READ-ONLY for pages

| Tool | What it does | Key params |
|------|-------------|------------|
| `ghl_list_funnels` | List all funnels | `limit`, `offset` |
| `ghl_get_funnel_pages` | Get pages in funnel | `funnelId` (required) |
| `ghl_list_funnel_redirects` | List URL redirects | `funnelId` |
| `ghl_create_funnel_redirect` | Create URL redirect | `target`, `action` |

### Forms & Surveys (4 tools)

| Tool | What it does | Key params |
|------|-------------|------------|
| `ghl_list_forms` | List forms | `type` (optional filter) |
| `ghl_get_form_submissions` | Get form entries | `formId`, `startAt`, `endAt`, `limit` |
| `ghl_list_surveys` | List surveys | none |
| `ghl_get_survey_submissions` | Get survey responses | `surveyId`, `startAt`, `endAt`, `limit` |

### Payments (5 tools)

| Tool | What it does | Key params |
|------|-------------|------------|
| `ghl_list_orders` | List orders | `contactId`, `status`, `startAt`, `endAt` |
| `ghl_get_order` | Get order details | `orderId` (required) |
| `ghl_list_subscriptions` | List subscriptions | `contactId`, `status` |
| `ghl_list_transactions` | List payment events | `contactId`, `startAt`, `endAt` |
| `ghl_list_coupons` | List discount codes | none |

### Invoices (4 tools) - amounts in CENTS

| Tool | What it does | Key params |
|------|-------------|------------|
| `ghl_list_invoices` | List invoices | `status`, `contactId`, `startAt`, `endAt` |
| `ghl_get_invoice` | Get invoice details | `invoiceId` (required) |
| `ghl_create_invoice` | Create invoice | `contactId`, `name`, `items[]` (amounts in cents), `businessDetails` |
| `ghl_send_invoice` | Email invoice | `invoiceId` (required) |

### Products (4 tools)

| Tool | What it does | Key params |
|------|-------------|------------|
| `ghl_list_products` | List catalog | `limit`, `offset` |
| `ghl_get_product` | Get product details | `productId` (required) |
| `ghl_create_product` | Create product | `name`, `productType` (PHYSICAL/DIGITAL/SERVICE) |
| `ghl_list_product_prices` | Get price variants | `productId` (required) |

### Media (3 tools)

| Tool | What it does | Key params |
|------|-------------|------------|
| `ghl_list_media` | List media files | `sortBy`, `sortOrder`, `limit` |
| `ghl_upload_media_url` | Upload from URL | `url`, `name` |
| `ghl_delete_media` | Delete file | `fileId` (required) |

### Locations (3 tools)

| Tool | What it does | Key params |
|------|-------------|------------|
| `ghl_get_location` | Get sub-account details | none (uses configured location) |
| `ghl_list_custom_fields` | Get custom field definitions | `model` (contact/opportunity) |
| `ghl_list_tags` | Get all tags | none |

### Users (2 tools)

| Tool | What it does | Key params |
|------|-------------|------------|
| `ghl_list_users` | List team members | none |
| `ghl_get_user` | Get user details | `userId` (required) |

### Blogs (3 tools)

| Tool | What it does | Key params |
|------|-------------|------------|
| `ghl_list_blog_posts` | List posts | `status` (published/draft/scheduled), `limit` |
| `ghl_create_blog_post` | Create post | `title`, `content` (HTML), `status`, `categoryId`, `seoTitle`, `seoDescription` |
| `ghl_list_blog_categories` | List categories | none |

### Social Media (3 tools)

| Tool | What it does | Key params |
|------|-------------|------------|
| `ghl_list_social_accounts` | List connected platforms | none |
| `ghl_create_social_post` | Post or schedule | `accountIds[]`, `content`, `mediaUrls[]`, `scheduledAt` |
| `ghl_list_social_posts` | List posts | `accountId`, `status` |

### Custom Objects (4 tools)

| Tool | What it does | Key params |
|------|-------------|------------|
| `ghl_list_custom_objects` | List schemas | none |
| `ghl_get_custom_object_schema` | Get schema with fields | `schemaId` (required) |
| `ghl_search_custom_records` | Search records | `schemaId`, `query`, `filters[]` |
| `ghl_create_custom_record` | Create record | `schemaId`, `fields` (key-value object) |

## Common Workflows

### Add a lead and enroll in a nurture sequence

```
1. ghl_upsert_contact
   - email, firstName, lastName, phone, tags: ["new-lead"]
2. ghl_list_workflows
   - Find the nurture workflow ID
3. ghl_enroll_in_workflow
   - contactId (from step 1), workflowId (from step 2)
```

### Book an appointment

```
1. ghl_list_calendars
   - Get the calendarId
2. ghl_get_free_slots
   - calendarId, startDate, endDate
3. ghl_create_appointment
   - calendarId, contactId, startTime, endTime, title
```

### Create and send an invoice

```
1. ghl_get_contact (or ghl_search_contacts)
   - Get the contactId
2. ghl_create_invoice
   - contactId, name: "Website Design"
   - items: [{ name: "Landing Page", amount: 150000, quantity: 1 }]
   - (Remember: 150000 = $1,500.00)
3. ghl_send_invoice
   - invoiceId (from step 2)
```

### Move a deal through the pipeline

```
1. ghl_get_pipelines
   - Get pipeline stages and their IDs
2. ghl_search_opportunities
   - Find the deal by contact or name
3. ghl_update_opportunity
   - opportunityId, stageId (new stage), monetaryValue, status
```

### Send a multi-channel message

```
SMS:
  ghl_send_message
  - type: "SMS", contactId, message: "Your appointment is tomorrow at 2pm"

Email:
  ghl_send_message
  - type: "Email", contactId
  - html: "<h1>Appointment Reminder</h1><p>Your appointment is tomorrow at 2pm.</p>"
  - subject: "Appointment Reminder"

WhatsApp:
  ghl_send_message
  - type: "WhatsApp", contactId, message: "Your appointment is tomorrow at 2pm"
```

### Publish a blog post with SEO

```
1. ghl_list_blog_categories
   - Find or note the categoryId
2. ghl_create_blog_post
   - title, content (HTML), status: "published"
   - categoryId, seoTitle, seoDescription
```

### Post to social media

```
1. ghl_list_social_accounts
   - Get connected account IDs (Facebook, Instagram, LinkedIn, etc.)
2. ghl_create_social_post
   - accountIds: ["acc1", "acc2"], content: "Check out our new feature!"
   - mediaUrls: ["https://example.com/image.png"]
   - scheduledAt: "2025-01-20T14:00:00Z" (optional, for scheduling)
```

## Error Handling

### Authentication errors (401)
The API key is invalid or expired. Tell the user to:
1. Go to GHL Settings > Integrations > API Key
2. Copy their Private Integration Token
3. Update the `GHL_API_KEY` environment variable

### Rate limiting (429)
The MCP server automatically retries with exponential backoff (3 attempts). If it still fails, wait a few seconds and try again.

### Validation errors (422)
The API returns field-level details. Common causes:
- Missing required field (contactId, email, etc.)
- Invalid phone format (needs +1 prefix)
- Invalid date format (needs ISO 8601)
- Amount not in cents

### Not found (404)
The ID doesn't exist. Double-check by listing the parent resource first.

## API Reference

See `references/api-reference.md` for the complete GoHighLevel API documentation including:
- OAuth 2.0 flow and Private Integration Tokens
- All 50+ API scopes
- Webhook events reference
- Rate limiting details (100 req/10s burst, 200k/day)
- SDK references (Node.js, Python, PHP)
