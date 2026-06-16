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

test("generates copy-ready message in english", () => {
  const message = generateMessage({
    clubName: "Club X",
    language: "en",
    groupedSlots: [
      { time: "18:00", courts: ["Court 2"] },
      { time: "19:30", courts: ["Court 1", "Court 4"] },
    ],
  });

  assert.equal(
    message,
    [
      "Last-minute availability today at Club X",
      "",
      "18:00 - Court 2",
      "19:30 - Court 1 and Court 4",
      "",
      "Message us to book.",
    ].join("\n"),
  );
});

test("generates copy-ready message in german", () => {
  const message = generateMessage({
    clubName: "Club X",
    language: "de",
    groupedSlots: [
      { time: "18:00", courts: ["Platz 2"] },
      { time: "19:30", courts: ["Platz 1", "Platz 4"] },
    ],
  });

  assert.equal(
    message,
    [
      "Last-Minute-Verfuegbarkeit heute bei Club X",
      "",
      "18:00 - Platz 2",
      "19:30 - Platz 1 und Platz 4",
      "",
      "Schreib uns, um zu buchen.",
    ].join("\n"),
  );
});

test("generates no availability message in requested language", () => {
  const message = generateMessage({
    clubName: "Club X",
    language: "en",
    groupedSlots: [],
  });

  assert.equal(
    message,
    [
      "We do not see any free courts at Club X today.",
      "",
      "We will let you know if one opens up.",
    ].join("\n"),
  );
});
