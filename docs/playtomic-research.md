# Playtomic research

Research date: 2026-06-16.

## Official findings

- Playtomic publicly offers a player app to find and book racket sport courts.
- Playtomic Manager is the club-side product for booking management, occupancy, payments, reporting, and analytics.
- The public app page redirects users toward the native app experience.
- Playtomic's public `robots.txt` disallows `/api`, `/wl`, `/search`, and URLs with query parameters such as `?sport=` and `?date=`.
- Playtomic's privacy policy confirms that reservations, club-manager access, notifications, WhatsApp communications, and user contact data are consent-sensitive flows.

## Forum/community findings

General search results were weak, but GitHub public search surfaced several useful unofficial projects:

- `joshp123/padel-cli`: CLI for checking Playtomic court availability and booking.
- `rafa-garcia/go-playtomic-api`: Go client for selected Playtomic API endpoints.
- `ypk46/playtomic-scheduler`: Python scheduler that logs in and tries to reserve courts.
- `domanmat/playtomic_monitor`: small monitor that fetches venues and availability.
- `philipp-eisen/padel-tui`: TypeScript TUI/CLI with auth, tenant search, availability, and payment intent flows.
- `rafa-garcia/padel-alert`: alerting service for Playtomic matches/classes.

There is also a useful public article:

- https://mattrighetti.com/2025/03/03/reverse-engineering-playtomic

That article reports the following availability endpoint:

```http
GET https://api.playtomic.io/v1/availability?sport_id=PADEL&tenant_id={tenantId}&start_min=YYYY-MM-DDT00:00:00&start_max=YYYY-MM-DDT23:59:59
```

It also reports that, as of 2025-03-03, the endpoint returned `200 OK` without `Authorization` when using minimal app-like headers.

Multiple unofficial clients confirm the same general shape:

```json
[
  {
    "resource_id": "court-resource-id",
    "start_date": "2025-03-06",
    "slots": [
      {
        "start_time": "18:00:00",
        "duration": 90,
        "price": "72 EUR"
      }
    ]
  }
]
```

Useful endpoints found in unofficial clients:

```http
GET  https://api.playtomic.io/v1/tenants?sport_id=PADEL&coordinate={lat},{lon}&radius={meters}
GET  https://api.playtomic.io/v1/tenants/{tenantId}
GET  https://api.playtomic.io/v1/tenants/{tenantId}/resources
GET  https://api.playtomic.io/v1/availability?sport_id=PADEL&tenant_id={tenantId}&start_min={localDateTime}&start_max={localDateTime}
POST https://api.playtomic.io/v3/auth/login
POST https://api.playtomic.io/v3/auth/token
```

Some projects use `local_start_min` / `local_start_max` instead of `start_min` / `start_max`, and some older code uses `https://playtomic.io/api/v1` instead of `https://api.playtomic.io/v1`. For the MVP, prefer `api.playtomic.io/v1` and make the parameter names configurable.

Reported limits:

- Availability requests over more than roughly 25 hours can return `400 INCORRECT_PARAMETERS`.
- Booking/payment flows require auth and should not be part of this MVP.

## Technical implication

The informal availability path looks feasible for a demo, but it must stay isolated and replaceable.

Use this strategy:

1. Build the product with a mock/manual provider.
2. Put Playtomic behind an `AvailabilityProvider` adapter.
3. For demos, try unauthenticated availability only for one club and with low request volume.
4. For pilots, prefer credentials or explicit authorization from the club.
5. For production, pursue official/partner access or club-authorized access.
6. Never implement booking automation unless the club explicitly authorizes it and the legal/payment flow is clear.

## Sources

- https://playtomic.com/
- https://playtomic.com/clubs
- https://playtomic.com/playtomic-manager
- https://app.playtomic.io/
- https://playtomic.com/robots.txt
- https://app.playtomic.io/legal/privacy-policy
- https://github.com/joshp123/padel-cli
- https://github.com/rafa-garcia/go-playtomic-api
- https://github.com/ypk46/playtomic-scheduler
- https://github.com/domanmat/playtomic_monitor
- https://github.com/philipp-eisen/padel-tui
- https://mattrighetti.com/2025/03/03/reverse-engineering-playtomic
