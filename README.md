# Padel last-minute availability

MVP to help padel clubs generate copy-ready messages with free courts for a
specific date or date range.

The first version should stay intentionally small:

- A tiny API surface.
- A curated list of configured clubs.
- Mock/manual availability first.
- Playtomic behind an adapter.
- No WhatsApp automation until the product is validated.

## Local usage

Start the API:

```bash
npm run dev
```

The server listens on:

```text
http://localhost:3000
```

Quick health check:

```bash
curl http://localhost:3000/health
```

## Mini API guide

### `GET /health`

Use this to confirm the server is up.

Example:

```bash
curl http://localhost:3000/health
```

Response:

```json
{
  "ok": true
}
```

### `GET /clubs`

Use this to discover valid `clubId` values.

Example:

```bash
curl http://localhost:3000/clubs
```

Response excerpt:

```json
{
  "clubs": [
    {
      "id": "canal-isabel-ii",
      "name": "FMP Canal De Isabel II",
      "city": "Madrid",
      "timezone": "Europe/Madrid",
      "openingTime": "09:00",
      "closingTime": "22:00"
    },
    {
      "id": "euroindoor-alcorcon",
      "name": "Euroindoor Alcorcon",
      "city": "Alcorcon",
      "timezone": "Europe/Madrid",
      "openingTime": "07:00",
      "closingTime": "23:00"
    }
  ]
}
```

The configured MVP `clubId` values are:

```text
canal-isabel-ii
euroindoor-alcorcon
madrid-central-padel
dreamfit-alcorcon
las-rozas-padel-center
duin-las-rozas
la-vida-padel-alcobendas
pozuelo-padel-club
x7-padel-madrid-fuenlabrada
nexus-padel-majadahonda
x7-padel-madrid-pinto
clipadel-leganes-indoor-padel
padel-sport-indoor-getafe
vim-padel-madrid
cet-majadahonda
```

That value comes from [src/club-config.mjs](/c:/Users/NahuelTarricone/OneDrive%20-%20Capitole%20Consulting/Escritorio/Nahuel/Developments/Proyecto%20aprendizaje%20personal/padel-last-minute-availability/src/club-config.mjs).

### `GET /endpoints`

Returns every available `GET` endpoint plus the query params each one expects.

Example:

```bash
curl http://localhost:3000/endpoints
```

Example response:

```json
{
  "endpoints": [
    {
      "method": "GET",
      "path": "/health",
      "description": "Confirms the API is running.",
      "queryParams": [],
      "example": "/health"
    },
    {
      "method": "GET",
      "path": "/clubs",
      "description": "Lists the available clubs and the clubId values you can use.",
      "queryParams": [],
      "example": "/clubs"
    },
    {
      "method": "GET",
      "path": "/availability-message",
      "description": "Returns grouped availability and copy-ready messages for a date or date range.",
      "queryParams": [
        {
          "name": "clubId",
          "required": false,
          "description": "Club identifier. Use GET /clubs to discover valid values."
        },
        {
          "name": "tenantId",
          "required": false,
          "description": "Raw Playtomic tenant identifier. Used when clubId is not provided."
        },
        {
          "name": "date",
          "required": false,
          "description": "Single date to check, using YYYY-MM-DD. Defaults to today."
        },
        {
          "name": "startDate",
          "required": false,
          "description": "Range start date, using YYYY-MM-DD. Must be used with endDate."
        },
        {
          "name": "endDate",
          "required": false,
          "description": "Range end date, using YYYY-MM-DD. Must be used with startDate."
        },
        {
          "name": "lang",
          "required": false,
          "default": "es",
          "allowedValues": ["es", "en", "de"],
          "description": "Response language."
        }
      ],
      "example": "/availability-message?clubId=canal-isabel-ii&startDate=2026-06-16&endDate=2026-06-18&lang=es"
    },
    {
      "method": "GET",
      "path": "/endpoints",
      "description": "Documents every GET endpoint and the query params they accept.",
      "queryParams": [],
      "example": "/endpoints"
    }
  ]
}
```

### `GET /availability-message`

Returns grouped availability plus ready-to-send messages.

Query params:

- `clubId` optional
- `tenantId` optional
- provide at least one of `clubId` or `tenantId`
- `date` optional: single date in `YYYY-MM-DD`
- `startDate` optional: range start date in `YYYY-MM-DD`
- `endDate` optional: range end date in `YYYY-MM-DD`
- `lang` optional: `es`, `en`, `de`
- if no date params are sent, the API checks today
- use either `date` or `startDate` plus `endDate`
- date ranges are inclusive and can cover up to 14 days

Example in Spanish:

```http
GET /availability-message?clubId=canal-isabel-ii&date=2026-06-16&lang=es
```

Example for a date range:

```http
GET /availability-message?clubId=canal-isabel-ii&startDate=2026-06-16&endDate=2026-06-18&lang=es
```

Example using a raw Playtomic tenant:

```http
GET /availability-message?tenantId=0e49df0b-6cd7-4459-b98f-80666079714d&lang=de
```

Example with `curl`:

```bash
curl "http://localhost:3000/availability-message?clubId=canal-isabel-ii&date=2026-06-16&lang=en"
```

Single-date response shape:

```json
{
  "club": "FMP Canal de Isabel II",
  "date": "2026-06-16",
  "language": "en",
  "availableSlots": [
    { "time": "18:00", "courts": ["Pista 2"] },
    { "time": "19:30", "courts": ["Pista 1", "Pista 4"] }
  ],
  "message": "Last-minute availability today at FMP Canal de Isabel II\n\n18:00 - Pista 2\n19:30 - Pista 1 and Pista 4\n\nMessage us to book.",
  "results": [
    {
      "date": "2026-06-16",
      "availableSlots": [
        { "time": "18:00", "courts": ["Pista 2"] },
        { "time": "19:30", "courts": ["Pista 1", "Pista 4"] }
      ],
      "message": "Last-minute availability today at FMP Canal de Isabel II\n\n18:00 - Pista 2\n19:30 - Pista 1 and Pista 4\n\nMessage us to book."
    }
  ]
}
```

Date-range response shape:

```json
{
  "club": "FMP Canal de Isabel II",
  "startDate": "2026-06-16",
  "endDate": "2026-06-18",
  "language": "en",
  "results": [
    {
      "date": "2026-06-16",
      "availableSlots": [
        { "time": "18:00", "courts": ["Pista 2"] }
      ],
      "message": "Last-minute availability today at FMP Canal de Isabel II\n\n18:00 - Pista 2\n\nMessage us to book."
    },
    {
      "date": "2026-06-17",
      "availableSlots": [
        { "time": "19:30", "courts": ["Pista 1", "Pista 4"] }
      ],
      "message": "Last-minute availability on 2026-06-17 at FMP Canal de Isabel II\n\n19:30 - Pista 1 and Pista 4\n\nMessage us to book."
    },
    {
      "date": "2026-06-18",
      "availableSlots": [],
      "message": "We do not see any free courts at FMP Canal de Isabel II on 2026-06-18.\n\nWe will let you know if one opens up."
    }
  ]
}
```

### Common errors

Missing `clubId` and `tenantId`:

```json
{
  "error": "clubId or tenantId is required"
}
```

Unknown `clubId`:

```json
{
  "error": "club not found"
}
```

Invalid `lang`:

```json
{
  "error": "lang must be one of: es, en, de"
}
```

Invalid date:

```json
{
  "error": "date must be a valid date"
}
```

## Tests

```bash
npm test
```

## Deploy on Render

This repo includes [render.yaml](./render.yaml), so Render can create the web
service from the repository settings.

Recommended path:

1. Push the repo to GitHub.
2. In Render, choose **New > Blueprint**.
3. Connect this repository.
4. Let Render use the detected `render.yaml`.
5. After deploy, open `/health` to confirm the API is running.

Manual Render settings, if you do not use Blueprint:

```text
Runtime: Node
Build Command: npm install && npm test
Start Command: npm start
Health Check Path: /health
Plan: Free
```

Render provides the `PORT` environment variable automatically, and
[src/server.mjs](./src/server.mjs) already uses it.
