# GoHighLevel API Complete Documentation
## For MCP Server & Claude/Hermes Skill Development

> **Source:** https://marketplace.gohighlevel.com/docs/  
> **Base URL:** https://services.leadconnectorhq.com  
> **Last Updated:** April 2026

---

## Table of Contents

1. [Overview](#overview)
2. [Authentication](#authentication)
3. [Scopes Reference](#scopes-reference)
4. [Core API Endpoints](#core-api-endpoints)
5. [Contacts API](#contacts-api)
6. [Opportunities API](#opportunities-api)
7. [Conversations API](#conversations-api)
8. [Calendars API](#calendars-api)
9. [Workflows API](#workflows-api)
10. [Payments API](#payments-api)
11. [Webhooks](#webhooks)
12. [SDKs](#sdks)
13. [Rate Limits](#rate-limits)
14. [Error Handling](#error-handling)

---

## Overview

The GoHighLevel API is a RESTful API that provides comprehensive access to the HighLevel CRM platform. It enables developers to:

- Build custom integrations and marketplace apps
- Automate CRM workflows programmatically
- Manage contacts, opportunities, calendars, and communications
- Process payments and subscriptions
- Configure and manage funnels, workflows, and pipelines

### Base Configuration

- **API Base URL:** `https://services.leadconnectorhq.com`
- **Authentication:** OAuth 2.0 (public apps) or Private Integration Tokens (private apps)
- **Data Format:** JSON (RESTful)
- **Versioning:** Header-based (`Version: 2021-07-28`)

### Access Levels

| Level | Description | Token Type |
|-------|-------------|------------|
| **Sub-Account (Location)** | Access within a single location/account | Location Token |
| **Agency (Company)** | Access across all sub-accounts, can create/manage locations | Agency Token |

**Note:** API V1 has reached end-of-support. Migrate to V2 for all new integrations.

---

## Authentication

### OAuth 2.0 (Marketplace Apps)

HighLevel uses OAuth 2.0 Authorization Code Grant flow with PKCE support.

#### App Registration

1. Go to https://marketplace.gohighlevel.com
2. Create an app (Private or Public)
3. Configure scopes, redirect URLs
4. Copy Client ID and Client Secret (store securely)

#### OAuth Flow

1. **Get Installation URL** from App Auth Pane → Advanced Settings
2. **User Authorizes:** Admin visits URL, selects location, approves
3. **Receive Authorization Code:** Redirected to your callback URL with `code` parameter

```
https://myapp.com/oauth/callback/highlevel?code=AUTHORIZATION_CODE
```

#### Exchange Code for Access Token

**Endpoint:** `POST /oauth/token`

**Request:**
```bash
curl -X POST "https://services.leadconnectorhq.com/oauth/token" \
  -H "Content-Type: application/json" \
  -d '{
    "client_id": "YOUR_CLIENT_ID",
    "client_secret": "YOUR_CLIENT_SECRET",
    "grant_type": "authorization_code",
    "code": "AUTHORIZATION_CODE",
    "user_type": "Company",  # or "Location"
    "redirect_uri": "YOUR_REDIRECT_URI"
  }'
```

**Response:**
```json
{
  "access_token": "eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVC...",
  "token_type": "Bearer",
  "expires_in": 86399,
  "refresh_token": "eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVC...",
  "scope": "calendars.readonly calendars/events.readonly contacts.readonly...",
  "userType": "Company",
  "companyId": "GNb7aIv4rQFVb9iwNl5K",
  "locationId": "HjiMUOsCCHCjtxzEf8PR"
}
```

#### Refresh Token

**Request:**
```bash
curl --request POST \
  --url https://services.leadconnectorhq.com/oauth/token \
  --data grant_type=refresh_token \
  --data refresh_token=YOUR_REFRESH_TOKEN \
  --data client_id=YOUR_CLIENT_ID \
  --data client_secret=YOUR_CLIENT_SECRET
```

**Token Lifecycle:**
- Access Token: Expires in ~24 hours (86,399 seconds)
- Refresh Token: Valid for 1 year, single-use (new refresh token issued on use)

#### Generate Location Token from Agency Token

If you have an Agency token, generate a Location token without user login:

```bash
curl -L "https://services.leadconnectorhq.com/oauth/locationToken" \
  -H "Authorization: Bearer AGENCY_ACCESS_TOKEN" \
  -d '{
    "companyId": "YOUR_COMPANY_ID",
    "locationId": "TARGET_LOCATION_ID"
  }'
```

### Private Integration Tokens

For internal tools or single-location integrations. Generated directly in Agency/Sub-account settings.

**Header format:**
```
Authorization: Bearer PRIVATE_INTEGRATION_TOKEN
```

**Use OAuth 2.0 when:**
- Building public or Marketplace apps
- Accessing multiple locations/accounts
- Distributing to other users

---

## Scopes Reference

Scopes define permissions for API access and webhook events. Request only the minimum scopes needed.

### CRM & Contacts

| Scope | Access Type | Endpoints | Webhook Events |
|-------|-------------|-----------|----------------|
| `contacts.readonly` | Sub-Account | GET /contacts | ContactCreate, ContactDelete, ContactTagUpdate |
| `contacts.write` | Sub-Account | POST/PUT/DELETE /contacts | ContactCreate, NoteCreate, TaskCreate |

### Conversations & Messaging

| Scope | Access Type | Description |
|-------|-------------|-------------|
| `conversations.readonly` | Sub-Account | Read conversations, messages, attachments |
| `conversations.write` | Sub-Account | Send messages, manage conversations |
| `conversations/message.readonly` | Sub-Account | Access call recordings and transcriptions |

**Webhook Events:** `InboundMessage`, `OutboundMessage`, `ConversationUnreadWebhook`

### Calendar & Appointments

| Scope | Access Type | Description |
|-------|-------------|-------------|
| `calendars.readonly` | Sub-Account | View calendars, check availability |
| `calendars.write` | Sub-Account | Create/update/delete calendars |
| `calendars/events.readonly` | Sub-Account | View appointments |
| `calendars/events.write` | Sub-Account | Create/update/delete appointments |
| `calendars/groups.readonly/write` | Sub-Account | Manage calendar groups |
| `calendars/resources.readonly/write` | Sub-Account | Manage calendar resources |

### Opportunities & Pipelines

| Scope | Access Type | Description |
|-------|-------------|-------------|
| `opportunities.readonly` | Sub-Account | Read pipeline, opportunities |
| `opportunities.write` | Sub-Account | Create/update/delete opportunities |

### Payments & Products

| Scope | Access Type | Description |
|-------|-------------|-------------|
| `payments/orders.readonly/write` | Sub-Account | Manage order fulfillment |
| `payments/subscriptions.readonly` | Sub-Account | View subscription data |
| `payments/custom-provider.readonly/write` | Sub-Account | Connect/disconnect custom payment providers |
| `invoices.readonly/write` | Sub-Account | Manage invoices |
| `products.readonly/write` | Sub-Account | Manage product catalog, pricing, collections |

### Agency & Location Management

| Scope | Access Type | Description |
|-------|-------------|-------------|
| `locations.readonly` | Sub-Account/Agency | View location details, timezones |
| `locations.write` | **Agency Only** | Create/delete locations |
| `saas/location.read` | Sub-Account/Agency | View SaaS plans |
| `saas/location.write` | **Agency Only** | Update SaaS subscriptions |
| `snapshots.readonly/write` | **Agency Only** | Manage and share snapshots |

### Workflows & Automation

| Scope | Access Type | Description |
|-------|-------------|-------------|
| `workflows.readonly` | Sub-Account | List available workflows |

### Media Storage

| Scope | Access Type | Description |
|-------|-------------|-------------|
| `medias.readonly` | Sub-Account | List files, folders |
| `medias.write` | Sub-Account | Upload/delete files |

### Social Planner

| Scope | Description |
|-------|-------------|
| `socialplanner/account.readonly/write` | Manage social accounts |
| `socialplanner/post.readonly/write` | Create/manage social posts |
| `socialplanner/category.readonly/write` | Manage post categories |

### Custom Objects

| Scope | Description |
|-------|-------------|
| `objects/schema.readonly/write` | Manage custom object schemas |
| `objects/record.readonly/write` | Manage custom object records |

### Voice AI

| Scope | Description |
|-------|-------------|
| `voice-ai-dashboard.readonly` | Access call logs |
| `voice-ai-agents.readonly/write` | Manage AI agents |
| `voice-ai-agent-goals.readonly/write` | Manage AI goals/actions |

### Funnels & Marketing

| Scope | Description |
|-------|-------------|
| `funnels.readonly` | List funnel pages |
| `funnels.write` | Create funnel redirects |
| `forms.readonly` | View form submissions |
| `surveys.readonly` | View survey submissions |

### Documents & Contracts

| Scope | Description |
|-------|-------------|
| `documents_contracts/list.readonly` | List documents |
| `documents_contracts/sendlink.write` | Send document links |
| `documents_contracts_templates/list.readonly` | List templates |

---

## Core API Endpoints

### Standard Headers

All API requests require:

```
Authorization: Bearer YOUR_ACCESS_TOKEN
Content-Type: application/json
```

### Authentication Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/oauth/token` | Exchange code for access token |
| POST | `/oauth/token` (refresh) | Refresh access token |
| POST | `/oauth/locationToken` | Generate location token from agency token |
| GET | `/oauth/installedLocations` | List installed locations (Agency scope) |

---

## Contacts API

**Base:** `https://services.leadconnectorhq.com/contacts/`

### Get Contacts (List)

```http
GET /contacts/
Authorization: Bearer {access_token}
```

**Query Parameters:**
- `locationId` - Filter by location
- `limit` - Max results (default varies)
- `page` - Pagination
- `query` - Search term

### Get Single Contact

```http
GET /contacts/{contactId}
Authorization: Bearer {access_token}
```

### Create Contact

```http
POST /contacts/
Authorization: Bearer {access_token}
Content-Type: application/json

{
  "firstName": "John",
  "lastName": "Doe",
  "email": "john@example.com",
  "phone": "+1234567890",
  "tags": ["lead", "website"],
  "customFields": [
    {
      "id": "field_id",
      "value": "field_value"
    }
  ],
  "source": "API",
  "assignedTo": "user_id"
}
```

### Update Contact

```http
PUT /contacts/{contactId}
Authorization: Bearer {access_token}
Content-Type: application/json

{
  "firstName": "Jane",
  "email": "jane@example.com",
  "tags": ["customer", "vip"]
}
```

### Upsert Contact

```http
POST /contacts/upsert
Authorization: Bearer {access_token}
Content-Type: application/json

{
  "email": "john@example.com",  // For matching
  "phone": "+1234567890",       // Alternative matching
  "firstName": "John",
  "lastName": "Doe",
  "updateIfExists": true
}
```

### Delete Contact

```http
DELETE /contacts/{contactId}
Authorization: Bearer {access_token}
```

### Search Contacts Advanced

```http
POST /contacts/search
Authorization: Bearer {access_token}
Content-Type: application/json

{
  "locationId": "location_id",
  "pageLimit": 50,
  "filters": [
    {
      "field": "email",
      "operator": "contains",
      "value": "example.com"
    }
  ],
  "sort": [
    {
      "field": "dateAdded",
      "direction": "desc"
    }
  ]
}
```

### Contact Sub-resources

| Resource | Endpoints |
|----------|-----------|
| **Tasks** | GET/POST /contacts/{id}/tasks |
| **Appointments** | GET /contacts/{id}/appointments |
| **Tags** | POST /contacts/{id}/tags, DELETE /contacts/{id}/tags/{tagId} |
| **Notes** | GET/POST /contacts/{id}/notes |
| **Campaigns** | GET/POST /contacts/{id}/campaigns |
| **Workflow** | POST /contacts/{id}/workflow/{workflowId} |
| **Followers** | GET/POST /contacts/{id}/followers |

---

## Opportunities API

**Base:** `https://services.leadconnectorhq.com/opportunities/`

### Get Opportunities

```http
GET /opportunities/
Authorization: Bearer {access_token}
```

### Create Opportunity

```http
POST /opportunities/
Authorization: Bearer {access_token}
Content-Type: application/json

{
  "title": "Deal Name",
  "status": "open",
  "stageId": "stage_id",
  "monetaryValue": 5000,
  "contactId": "contact_id",
  "assignedTo": "user_id",
  "pipelineId": "pipeline_id",
  "source": "Website"
}
```

### Update Opportunity

```http
PUT /opportunities/{opportunityId}
Authorization: Bearer {access_token}
Content-Type: application/json

{
  "stageId": "new_stage_id",
  "status": "won",
  "monetaryValue": 7500
}
```

### Get Pipelines

```http
GET /pipelines/
Authorization: Bearer {access_token}
```

### Pipeline Stages

Opportunities are associated with pipeline stages. Use `stageId` from pipeline data to move opportunities.

---

## Conversations API

**Base:** `https://services.leadconnectorhq.com/conversations/`

### Get Conversations

```http
GET /conversations/
Authorization: Bearer {access_token}
```

**Query Parameters:**
- `locationId` - Filter by location
- `contactId` - Filter by contact
- `status` - Filter by status
- `limit` - Pagination limit

### Get Conversation Messages

```http
GET /conversations/{conversationId}/messages
Authorization: Bearer {access_token}
```

### Send Message

```http
POST /conversations/messages
Authorization: Bearer {access_token}
Content-Type: application/json

{
  "conversationId": "conversation_id",
  "contactId": "contact_id",  // or use conversationId
  "type": "SMS",  // SMS, Email, WhatsApp, etc
  "message": "Hello from API!",
  "locationId": "location_id"
}
```

### Create Conversation

```http
POST /conversations/
Authorization: Bearer {access_token}
Content-Type: application/json

{
  "locationId": "location_id",
  "contactId": "contact_id",
  "type": "SMS"
}
```

---

## Calendars API

**Base:** `https://services.leadconnectorhq.com/calendars/`

### Get Calendars

```http
GET /calendars/
Authorization: Bearer {access_token}
```

### Get Calendar Events

```http
GET /calendars/events
Authorization: Bearer {access_token}

# Query params:
# - calendarId
# - startTime (ISO 8601)
# - endTime (ISO 8601)
# - locationId
```

### Create Appointment

```http
POST /calendars/events
Authorization: Bearer {access_token}
Content-Type: application/json

{
  "calendarId": "calendar_id",
  "title": "Meeting with Client",
  "startTime": "2026-04-10T14:00:00Z",
  "endTime": "2026-04-10T15:00:00Z",
  "contactId": "contact_id",
  "assignedUserId": "user_id",
  "locationId": "location_id"
}
```

### Update Appointment

```http
PUT /calendars/events/{eventId}
Authorization: Bearer {access_token}
Content-Type: application/json

{
  "startTime": "2026-04-10T16:00:00Z",
  "status": "confirmed"
}
```

### Delete Appointment

```http
DELETE /calendars/events/{eventId}
Authorization: Bearer {access_token}
```

### Calendar Resources

| Resource | Endpoints |
|----------|-----------|
| **Calendar Groups** | GET/POST /calendars/groups |
| **Resources** (rooms/equipment) | GET/POST /calendars/resources |
| **Blocked Slots** | POST /calendars/blocks |

---

## Workflows API

**Base:** `https://services.leadconnectorhq.com/workflows/`

### Get Available Workflows

```http
GET /workflows/
Authorization: Bearer {access_token}
```

### Enroll Contact in Workflow

```http
POST /contacts/{contactId}/workflow/{workflowId}
Authorization: Bearer {access_token}
Content-Type: application/json

{
  "locationId": "location_id",
  "contactId": "contact_id"
}
```

### Trigger Workflow via Webhook

```http
POST https://hooks.leadconnectorhq.com/v1/hooker/YOUR_HOOK_ID?company_id=YOUR_COMPANY_ID
Content-Type: application/json

{
  "contactId": "contact_id",
  "customData": "your_data"
}
```

---

## Payments API

**Base:** `https://services.leadconnectorhq.com/payments/`

### Get Orders

```http
GET /payments/orders
Authorization: Bearer {access_token}
```

### Get Subscriptions

```http
GET /payments/subscriptions
Authorization: Bearer {access_token}
```

### Get Invoices

```http
GET /invoices/
Authorization: Bearer {access_token}
```

### Create Invoice

```http
POST /invoices/
Authorization: Bearer {access_token}
Content-Type: application/json

{
  "locationId": "location_id",
  "contactId": "contact_id",
  "items": [
    {
      "name": "Product Name",
      "price": 99.99,
      "quantity": 1
    }
  ],
  "status": "unpaid"
}
```

### Products Endpoints

| Endpoint | Description |
|----------|-------------|
| GET /products | List products |
| POST /products | Create product |
| PUT /products/{id} | Update product |
| DELETE /products/{id} | Delete product |
| GET /products/collections | List collections |
| GET /products/prices | List product prices |

---

## Webhooks

Webhooks provide real-time notifications when events occur in HighLevel.

### Configuration

1. Navigate to your app in the Marketplace dashboard
2. Click Advanced Settings → Webhooks
3. Enter your webhook URL
4. Toggle events to subscribe to

### Webhook Security

**Signature Headers:**
- `X-GHL-Signature` (Ed25519) - Current standard
- `X-WH-Signature` (RSA) - Legacy

**Verification Process:**
```
1. Get the signature from header
2. Calculate HMAC using your secret
3. Compare computed vs. received signature
4. Reject if mismatch
```

### Webhook Payload Structure

```json
{
  "type": "ContactCreate",
  "appId": "665c6bb13d4e5364bdec0e2f",
  "locationId": "HjiMUOsCCHCjtxzEf8PR",
  "companyId": "GNb7aIv4rQFVb9iwNl5K",
  "timestamp": "2025-06-25T06:57:06.225Z",
  "data": {
    "id": "contact_id",
    "firstName": "John",
    "email": "john@example.com"
  }
}
```

### Critical Webhook: App Install

Sent when your app is installed, includes tokens:

```json
{
  "type": "INSTALL",
  "appId": "665c6bb13d4e5364bdec0e2f",
  "versionId": "665c6bb13d4e5364bdec0e2f",
  "installType": "Location",
  "locationId": "HjiMUOsCCHCjtxzEf8PR",
  "companyId": "GNb7aIv4rQFVb9iwNl5K",
  "access_token": "eyJhbGc...",
  "refresh_token": "eyJhbGc...",
  "scope": "contacts.readonly contacts.write...",
  "userType": "Company",
  "timestamp": "2025-06-25T06:57:06.225Z"
}
```

### Available Webhook Events

| Category | Events |
|----------|--------|
| **Contact Events** | ContactCreate, ContactDelete, ContactTagUpdate, ContactUpdate |
| **Opportunity Events** | OpportunityCreate, OpportunityUpdate, OpportunityDelete, OpportunityStageUpdate |
| **Task Events** | TaskCreate, TaskComplete, TaskDelete |
| **Appointment Events** | AppointmentCreate, AppointmentUpdate, AppointmentDelete |
| **Message Events** | InboundMessage, OutboundMessage, ConversationUnreadWebhook, VoiceAiCallEnd |
| **Invoice Events** | InvoiceCreate, InvoicePaid, InvoiceSent |
| **Note Events** | NoteCreate |
| **Association Events** | AssociationCreate, AssociationDelete |
| **Location Events** | LocationCreate, LocationUpdate |
| **User Events** | UserCreate, UserUpdate, UserDelete |

---

## SDKs

### Official SDKs

HighLevel provides official SDKs for:

| SDK | Package | Minimum Version |
|-----|---------|-----------------|
| **Node.js** | `@gohighlevel/api-client` | Node.js 18+ |
| **Python** | `gohighlevel-api-client` | Python 3.8+ |
| **PHP** | `gohighlevel/api-client` | PHP 7.4+ |

### Node.js SDK Example

```bash
npm install @gohighlevel/api-client
```

```javascript
const { HighLevel } = require('@gohighlevel/api-client');

const highLevel = new HighLevel({
  clientId: process.env.HIGHLEVEL_CLIENT_ID,
  clientSecret: process.env.HIGHLEVEL_CLIENT_SECRET,
});

// List contacts
async function listContacts() {
  const response = await highLevel.contacts.searchContactsAdvanced({
    locationId: 'your_location_id',
    pageLimit: 5
  });
  console.log(response);
}
```

### Python SDK Example

```bash
pip install gohighlevel-api-client
```

```python
from gohighlevel import HighLevel

client = HighLevel(
    client_id="your_client_id",
    client_secret="your_client_secret"
)

# List contacts
contacts = client.contacts.search_contacts(
    location_id="your_location_id",
    page_limit=50
)
```

### SDK Features

- Automatic token rotation
- Webhook signature validation
- Express/FastAPI webhook middleware
- Bulk installation token management
- Per-location token storage

---

## Rate Limits

HighLevel enforces rate limits to ensure platform stability.

### Current Limits (API 2.0)

| Metric | Limit |
|--------|-------|
| **Burst Limit** | 100 requests per 10 seconds (per resource) |
| **Daily Limit** | 200,000 requests per day (per resource) |

### Best Practices

1. **Implement Request Throttling:** Don't blast 100 calls in 1 second
2. **Use Exponential Backoff:** If receiving 429 errors, implement wait logic
3. **Use Webhooks Instead of Polling:** Reduce API calls by listening for events
4. **Cache Responses:** Cache read-heavy data appropriately

**Retry Strategy:**
- Wait 500ms → 1s → 2s before retrying
- Maximum 3-5 retries
- Log rate limit errors for monitoring

---

## Error Handling

### HTTP Status Codes

| Code | Meaning | Action |
|------|---------|--------|
| 200 | OK | Success |
| 400 | Bad Request | Check request format |
| 401 | Unauthorized | Token expired or invalid |
| 403 | Forbidden | Insufficient permissions/scopes |
| 404 | Not Found | Resource doesn't exist |
| 422 | Unprocessable Entity | Validation errors |
| 429 | Too Many Requests | Rate limit hit, retry with backoff |
| 500 | Server Error | Contact support |

### Error Response Format

```json
{
  "status": "error",
  "message": "Detailed error description",
  "code": "ERROR_CODE",
  "details": {
    "field": "specific field with error"
  }
}
```

---

## Key API Summary for Agents

### Essential Endpoints for Funnel Management

| Action | Endpoint |
|--------|----------|
| List funnels | GET /funnels/ |
| Get funnel pages | GET /funnels/{id}/pages |
| Create redirect | POST /funnels/redirects |

### Essential Endpoints for Contact Management

| Action | Endpoint |
|--------|----------|
| Create contact | POST /contacts/ |
| Update contact | PUT /contacts/{id} |
| Search contacts | POST /contacts/search |
| Add tag | POST /contacts/{id}/tags |
| Remove tag | DELETE /contacts/{id}/tags/{tagId} |
| Add note | POST /contacts/{id}/notes |

### Essential Endpoints for Opportunity Management

| Action | Endpoint |
|--------|----------|
| Create opportunity | POST /opportunities/ |
| Update opportunity | PUT /opportunities/{id} |
| Move pipeline stage | PUT /opportunities/{id} (with stageId) |
| Delete opportunity | DELETE /opportunities/{id} |

### Essential Endpoints for Messaging

| Action | Endpoint |
|--------|----------|
| Send SMS/Email | POST /conversations/messages |
| Get conversations | GET /conversations/ |
| Create conversation | POST /conversations/ |

### Essential Endpoints for Calendar

| Action | Endpoint |
|--------|----------|
| Book appointment | POST /calendars/events |
| Get appointments | GET /calendars/events |
| Update appointment | PUT /calendars/events/{id} |
| Delete appointment | DELETE /calendars/events/{id} |

---

## Additional Resources

### Official Documentation

- **Developer Portal:** https://developers.gohighlevel.com/
- **API Docs:** https://marketplace.gohighlevel.com/docs/
- **GitHub (feature requests):** https://github.com/highlevel/

### Developer Support

- **Developer Support:** https://developers.gohighlevel.com/support
- **Slack Community:** Join via https://developers.gohighlevel.com/
- **Developer Council:** Monthly calls (check events calendar)

### Plan Requirements

| Plan | API Access |
|------|------------|
| $97 Starter | Basic API access (Contacts, Appointments, Calendars, Opportunities, Tasks, Forms) |
| $297 Unlimited | Basic API access |
| $497 Agency Pro | Advanced API access (OAuth 2.0, Agency-level endpoints, Snapshots, User Management, SaaS Configurator) |

---

*Documentation compiled for MCP Server and Claude/Hermes Skill Development*
