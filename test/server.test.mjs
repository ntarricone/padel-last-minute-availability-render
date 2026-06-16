import assert from "node:assert/strict";
import http from "node:http";
import test from "node:test";
import { server } from "../src/server.mjs";

async function withTestServer(callback) {
  const testServer = http.createServer(server.listeners("request")[0]);

  await new Promise((resolve) => {
    testServer.listen(0, resolve);
  });

  const { port } = testServer.address();

  try {
    await callback(port);
  } finally {
    await new Promise((resolve, reject) => {
      testServer.close((error) => {
        if (error) {
          reject(error);
          return;
        }

        resolve();
      });
    });
  }
}

test("GET /endpoints returns the available GET routes and their params", async () => {
  await withTestServer(async (port) => {
    const response = await fetch(`http://127.0.0.1:${port}/endpoints`);
    const payload = await response.json();

    assert.equal(response.status, 200);
    assert.equal(Array.isArray(payload.endpoints), true);
    assert.deepEqual(
      payload.endpoints.map(({ path }) => path),
      ["/health", "/clubs", "/availability-message", "/endpoints"],
    );

    const availabilityEndpoint = payload.endpoints.find(
      ({ path }) => path === "/availability-message",
    );

    assert.deepEqual(availabilityEndpoint.queryParams, [
      {
        name: "clubId",
        required: true,
        description: "Club identifier. Use GET /clubs to discover valid values.",
      },
      {
        name: "lang",
        required: false,
        default: "es",
        allowedValues: ["es", "en", "de"],
        description: "Response language.",
      },
    ]);
  });
});

test("GET /clubs returns curated clubs without provider internals", async () => {
  await withTestServer(async (port) => {
    const response = await fetch(`http://127.0.0.1:${port}/clubs`);
    const payload = await response.json();

    assert.equal(response.status, 200);
    assert.equal(payload.clubs.length, 15);
    assert.deepEqual(Object.keys(payload.clubs[0]), [
      "id",
      "name",
      "city",
      "timezone",
      "openingTime",
      "closingTime",
    ]);
    assert.equal(payload.clubs[0].id, "canal-isabel-ii");
    assert.equal(payload.clubs[0].playtomicTenantId, undefined);
  });
});
