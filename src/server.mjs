import http from "node:http";
import { pathToFileURL } from "node:url";
import {
  AvailabilityDateError,
  buildAvailabilityMessage,
} from "./availability.mjs";
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
    description: "Returns grouped availability and copy-ready messages for a date or date range.",
    queryParams: [
      {
        name: "clubId",
        required: false,
        description: "Club identifier. Use GET /clubs to discover valid values.",
      },
      {
        name: "tenantId",
        required: false,
        description: "Raw Playtomic tenant identifier. Used when clubId is not provided.",
      },
      {
        name: "date",
        required: false,
        description: "Single date to check, using YYYY-MM-DD. Defaults to today.",
      },
      {
        name: "startDate",
        required: false,
        description: "Range start date, using YYYY-MM-DD. Must be used with endDate.",
      },
      {
        name: "endDate",
        required: false,
        description: "Range end date, using YYYY-MM-DD. Must be used with startDate.",
      },
      {
        name: "lang",
        required: false,
        default: "es",
        allowedValues: supportedLanguages,
        description: "Response language.",
      },
    ],
    example: "/availability-message?clubId=canal-isabel-ii&startDate=2026-06-16&endDate=2026-06-18&lang=es",
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
      const tenantId = url.searchParams.get("tenantId");
      const date = url.searchParams.get("date");
      const startDate = url.searchParams.get("startDate");
      const endDate = url.searchParams.get("endDate");
      const languageParam = url.searchParams.get("lang") ?? "es";

      if (!clubId && !tenantId) {
        sendJson(response, 400, {
          error: "clubId or tenantId is required",
        });
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

      const club = clubId ? getClubById(clubId) : null;

      if (clubId && !club) {
        sendJson(response, 404, { error: "club not found" });
        return;
      }

      let payload;

      try {
        payload = await buildAvailabilityMessage({
          club,
          tenantId: club?.playtomicTenantId ?? tenantId,
          language,
          date,
          startDate,
          endDate,
        });
      } catch (error) {
        if (error instanceof AvailabilityDateError) {
          sendJson(response, 400, { error: error.message });
          return;
        }

        throw error;
      }

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
