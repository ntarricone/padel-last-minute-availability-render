# Playtomic research

Research date: 2026-06-16.

## Official findings

- Playtomic publicly offers a player app to find and book racket sport courts.
- Playtomic Manager is the club-side product for booking management, occupancy, payments, reporting, and analytics.
- The public app page redirects users toward the native app experience.
- Playtomic's public `robots.txt` disallows `/api`, `/wl`, `/search`, and URLs with query parameters such as `?sport=` and `?date=`.
- Playtomic's privacy policy confirms that reservations, club-manager access, notifications, WhatsApp communications, and user contact data are consent-sensitive flows.

## Forum/community findings

Searches for public community examples did not reveal a reliable documented API client or stable public availability endpoint.

Queries checked included:

- `Playtomic API GitHub availability`
- `api.playtomic.io`
- `Playtomic mobile API reverse engineered`
- `Playtomic API foro`
- `reddit Playtomic API`
- `site:stackoverflow.com Playtomic`
- `site:github.com Playtomic`

The useful conclusion is absence of reliable public guidance, not proof that no private/internal API exists.

## Technical implication

Do not couple the product to an informal Playtomic endpoint.

Use this strategy:

1. Build the product with a mock/manual provider.
2. Put Playtomic behind an `AvailabilityProvider` adapter.
3. For demos, only use public availability if the flow is compliant and stable.
4. For pilots, prefer credentials or explicit authorization from the club.
5. For production, pursue official/partner access or club-authorized access.

## Sources

- https://playtomic.com/
- https://playtomic.com/clubs
- https://playtomic.com/playtomic-manager
- https://app.playtomic.io/
- https://playtomic.com/robots.txt
- https://app.playtomic.io/legal/privacy-policy

