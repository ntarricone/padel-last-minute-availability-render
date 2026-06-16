# MVP plan

## TL;DR

Build the smallest useful thing:

1. API endpoint.
2. One club config.
3. Mock/manual availability.
4. Filtering for today and evening.
5. Grouping by hour.
6. Copy-ready message.

## Phase 1: working API without Playtomic

Create:

- `GET /availability-message?clubId=club-x`
- Static club config.
- Static/mock slot data.
- Message generator.

Rules:

- Only today's slots.
- Only slots after now.
- Only configured promotion window, for example `18:00-22:00`.
- Group courts by start time.

## Phase 2: minimal Playtomic adapter

Create an interface:

```ts
type AvailabilityProvider = {
  getAvailability(input: {
    clubId: string;
    date: string;
  }): Promise<RawAvailabilitySlot[]>;
};
```

Implement providers:

- `MockAvailabilityProvider`
- `ManualAvailabilityProvider`
- `PlaytomicAvailabilityProvider`

Keep informal Playtomic logic isolated so it can be replaced by club credentials later.

## Phase 3: simple UI

Only after the endpoint works:

- Club selector.
- Message preview.
- Copy button.
- Refresh button.

## Not now

- WhatsApp outbound.
- Login.
- Payments.
- Booking engine.
- Complex dashboard.
- Multi-club admin.

## Validation

The MVP works if a club repeatedly copies and sends the generated message.

