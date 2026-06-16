import http from "node:http";
import { pathToFileURL } from "node:url";
import { buildAvailabilityMessage } from "./availability.mjs";
import { clubs, getClubById } from "./club-config.mjs";
import { normalizeLanguage, supportedLanguages } from "./message.mjs";

const port = Number(process.env.PORT ?? 3000);
const documentedEndpoints = [
  {
    method: "GET",
    path: "/health",
    description: "Confirms the API is running.",
    queryParams: [],
    example: "/health",
  },
  {
    method: "GET",
    path: "/clubs",
    description: "Lists the available clubs and the clubId values you can use.",
    queryParams: [],
    example: "/clubs",
  },
  {
    method: "GET",
    path: "/availability-message",
    description: "Returns today's grouped availability and a copy-ready message.",
    queryParams: [
      {
        name: "clubId",
        required: true,
        description: "Club identifier. Use GET /clubs to discover valid values.",
      },
      {
        name: "lang",
        required: false,
        default: "es",
        allowedValues: supportedLanguages,
        description: "Response language.",
      },
    ],
    example: "/availability-message?clubId=canal-isabel-ii&lang=es",
  },
  {
    method: "GET",
    path: "/endpoints",
    description: "Documents every GET endpoint and the query params they accept.",
    queryParams: [],
    example: "/endpoints",
  },
];

export const server = http.createServer(async (request, response) => {
  try {
    const url = new URL(request.url ?? "/", `http://${request.headers.host}`);

    if (request.method === "GET" && url.pathname === "/health") {
      sendJson(response, 200, { ok: true });
      return;
    }

    if (request.method === "GET" && url.pathname === "/clubs") {
      sendJson(response, 200, {
        clubs: clubs.map((club) => ({
          id: club.id,
          name: club.name,
          city: club.city,
          timezone: club.timezone,
          openingTime: club.openingTime,
          closingTime: club.closingTime,
        })),
      });
      return;
    }

    if (request.method === "GET" && url.pathname === "/endpoints") {
      sendJson(response, 200, {
        endpoints: documentedEndpoints,
      });
      return;
    }

    if (request.method === "GET" && url.pathname === "/availability-message") {
      const clubId = url.searchParams.get("clubId");
      const languageParam = url.searchParams.get("lang") ?? "es";

      if (!clubId) {
        sendJson(response, 400, { error: "clubId is required" });
        return;
      }

      let language;

      try {
        language = normalizeLanguage(languageParam);
      } catch {
        sendJson(response, 400, {
          error: `lang must be one of: ${supportedLanguages.join(", ")}`,
        });
        return;
      }

      const club = getClubById(clubId);

      if (!club) {
        sendJson(response, 404, { error: "club not found" });
        return;
      }

      const payload = await buildAvailabilityMessage({ club, language });
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

export function startServer() {
  return server.listen(port, () => {
    console.log(`Padel availability API listening on http://localhost:${port}`);
  });
}

function sendJson(response, statusCode, payload) {
  response.writeHead(statusCode, {
    "content-type": "application/json; charset=utf-8",
  });
  response.end(JSON.stringify(payload, null, 2));
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  startServer();
}
