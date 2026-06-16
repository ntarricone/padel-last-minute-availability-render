# Padel last-minute availability

MVP to help padel clubs generate a copy-ready message with today's free courts.

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
      "description": "Returns today's grouped availability and a copy-ready message.",
      "queryParams": [
        {
          "name": "clubId",
          "required": true,
          "description": "Club identifier. Use GET /clubs to discover valid values."
        },
        {
          "name": "lang",
          "required": false,
          "default": "es",
          "allowedValues": ["es", "en", "de"],
          "description": "Response language."
        }
      ],
      "example": "/availability-message?clubId=canal-isabel-ii&lang=es"
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

Returns today's grouped availability plus a ready-to-send message.

Query params:

- `clubId` required
- `lang` optional: `es`, `en`, `de`

Example in Spanish:

```http
GET /availability-message?clubId=canal-isabel-ii&lang=es
```

Example with `curl`:

```bash
curl "http://localhost:3000/availability-message?clubId=canal-isabel-ii&lang=en"
```

Example response shape:

```json
{
  "club": "FMP Canal de Isabel II",
  "date": "2026-06-16",
  "language": "en",
  "availableSlots": [
    { "time": "18:00", "courts": ["Pista 2"] },
    { "time": "19:30", "courts": ["Pista 1", "Pista 4"] }
  ],
  "message": "Last-minute availability today at FMP Canal de Isabel II\n\n18:00 - Pista 2\n19:30 - Pista 1 and Pista 4\n\nMessage us to book."
}
```

### Common errors

Missing `clubId`:

```json
{
  "error": "clubId is required"
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
