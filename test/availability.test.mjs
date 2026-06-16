import assert from "node:assert/strict";
import test from "node:test";
import {
  AvailabilityDateError,
  buildAvailabilityMessage,
  resolveAvailabilityDates,
} from "../src/availability.mjs";

test("resolves today when no date params are provided", () => {
  assert.deepEqual(
    resolveAvailabilityDates({
      now: new Date("2026-06-16T10:00:00.000Z"),
    }),
    ["2026-06-16"],
  );
});

test("resolves a single explicit date", () => {
  assert.deepEqual(
    resolveAvailabilityDates({
      date: "2026-06-18",
      now: new Date("2026-06-16T10:00:00.000Z"),
    }),
    ["2026-06-18"],
  );
});

test("resolves an inclusive date range", () => {
  assert.deepEqual(
    resolveAvailabilityDates({
      startDate: "2026-06-16",
      endDate: "2026-06-18",
    }),
    ["2026-06-16", "2026-06-17", "2026-06-18"],
  );
});

test("rejects mixed single date and range params", () => {
  assert.throws(
    () =>
      resolveAvailabilityDates({
        date: "2026-06-16",
        startDate: "2026-06-16",
        endDate: "2026-06-18",
      }),
    AvailabilityDateError,
  );
});

test("builds the legacy single-day response with results array", async () => {
  const payload = await buildAvailabilityMessage({
    club: {
      name: "Club X",
      playtomicTenantId: "tenant-1",
    },
    language: "en",
    now: new Date("2026-06-16T10:00:00.000Z"),
    getAvailability: async ({ date }) => [
      {
        courtName: `Court ${date}`,
        startTime: "18:00",
      },
    ],
  });

  assert.equal(payload.club, "Club X");
  assert.equal(payload.date, "2026-06-16");
  assert.deepEqual(payload.availableSlots, [
    {
      time: "18:00",
      courts: ["Court 2026-06-16"],
    },
  ]);
  assert.equal(payload.results.length, 1);
  assert.equal(payload.results[0].date, "2026-06-16");
  assert.match(payload.message, /today/);
});

test("builds a per-day result for date ranges", async () => {
  const requestedDates = [];
  const payload = await buildAvailabilityMessage({
    club: {
      name: "Club X",
      playtomicTenantId: "tenant-1",
    },
    language: "en",
    startDate: "2026-06-17",
    endDate: "2026-06-18",
    now: new Date("2026-06-16T10:00:00.000Z"),
    getAvailability: async ({ date }) => {
      requestedDates.push(date);

      return [
        {
          courtName: `Court ${date}`,
          startTime: "18:00",
        },
      ];
    },
  });

  assert.deepEqual(requestedDates, ["2026-06-17", "2026-06-18"]);
  assert.equal(payload.club, "Club X");
  assert.equal(payload.startDate, "2026-06-17");
  assert.equal(payload.endDate, "2026-06-18");
  assert.deepEqual(
    payload.results.map(({ date }) => date),
    ["2026-06-17", "2026-06-18"],
  );
  assert.match(payload.results[0].message, /on 2026-06-17/);
  assert.match(payload.results[1].message, /on 2026-06-18/);
});
