# Padel last-minute availability

MVP to help padel clubs generate a copy-ready message with today's free courts.

The first version should stay intentionally small:

- One API endpoint.
- One configured club.
- Mock/manual availability first.
- Playtomic behind an adapter.
- No WhatsApp automation until the product is validated.

## Target endpoint

```http
GET /availability-message?clubId=club-x
```

## Run locally

```bash
node src/server.mjs
```

Then open:

```http
http://localhost:3000/availability-message?clubId=club-x
```

## Test

```bash
node --test
```

## Target response

```json
{
  "club": "Club X",
  "date": "2026-06-16",
  "availableSlots": [
    { "time": "18:00", "courts": ["Pista 2"] },
    { "time": "19:30", "courts": ["Pista 1", "Pista 4"] }
  ],
  "message": "Disponibilidad de ultimo minuto hoy en Club X\n\n18:00 - Pista 2\n19:30 - Pistas 1 y 4\n\nEscribinos para reservar."
}
```
