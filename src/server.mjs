import http from "node:http";
import { buildAvailabilityMessage } from "./availability.mjs";
import { getClubById } from "./club-config.mjs";

const port = Number(process.env.PORT ?? 3000);

const server = http.createServer(async (request, response) => {
  try {
    const url = new URL(request.url ?? "/", `http://${request.headers.host}`);

    if (request.method === "GET" && url.pathname === "/health") {
      sendJson(response, 200, { ok: true });
      return;
    }

    if (request.method === "GET" && url.pathname === "/availability-message") {
      const clubId = url.searchParams.get("clubId");

      if (!clubId) {
        sendJson(response, 400, { error: "clubId is required" });
        return;
      }

      const club = getClubById(clubId);

      if (!club) {
        sendJson(response, 404, { error: "club not found" });
        return;
      }

      const payload = await buildAvailabilityMessage({ club });
      sendJson(response, 200, payload);
      return;
    }

    sendJson(response, 404, { error: "not found" });
  } catch (error) {
    sendJson(response, 500, {
      error: "internal error",
      message: error instanceof Error ? error.message : "unknown error",
    });
  }
});

server.listen(port, () => {
  console.log(`Padel availability API listening on http://localhost:${port}`);
});

function sendJson(response, statusCode, payload) {
  response.writeHead(statusCode, {
    "content-type": "application/json; charset=utf-8",
  });
  response.end(JSON.stringify(payload, null, 2));
}

