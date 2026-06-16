import assert from "node:assert/strict";
import test from "node:test";
import { generateMessage, groupSlots } from "../src/message.mjs";

test("groups slots by start time", () => {
  const grouped = groupSlots([
    { startTime: "19:30", courtName: "Pista 4" },
    { startTime: "18:00", courtName: "Pista 2" },
    { startTime: "19:30", courtName: "Pista 1" },
  ]);

  assert.deepEqual(grouped, [
    { time: "18:00", courts: ["Pista 2"] },
    { time: "19:30", courts: ["Pista 1", "Pista 4"] },
  ]);
});

test("generates copy-ready message", () => {
  const message = generateMessage({
    clubName: "Club X",
    groupedSlots: [
      { time: "18:00", courts: ["Pista 2"] },
      { time: "19:30", courts: ["Pista 1", "Pista 4"] },
    ],
  });

  assert.equal(
    message,
    [
      "Disponibilidad de ultimo minuto hoy en Club X",
      "",
      "18:00 - Pista 2",
      "19:30 - Pista 1 y Pista 4",
      "",
      "Escribinos para reservar.",
    ].join("\n"),
  );
});
