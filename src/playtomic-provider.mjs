const BASE_URL = "https://api.playtomic.io/v1";

const HEADERS = {
  "User-Agent": "iOS 18.3.1",
  "X-Requested-With": "com.playtomic.app 6.13.0",
};

/**
 * Fetches court name mapping for a tenant.
 * Returns Map<resource_id, courtName>
 */
async function fetchCourtNames(tenantId) {
  const response = await fetch(`${BASE_URL}/tenants/${tenantId}`, {
    headers: HEADERS,
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch tenant info: ${response.status}`);
  }

  const tenant = await response.json();
  const map = new Map();

  for (const resource of tenant.resources ?? []) {
    map.set(resource.resource_id, resource.name);
  }

  return map;
}

/**
 * Fetches availability slots for a given tenant and date.
 * Returns normalized array matching internal format:
 *   { provider, courtName, startDate, startTime, duration, price }
 */
export async function getPlaytomicAvailability({ tenantId, date }) {
  const startMin = `${date}T00:00:00`;
  const startMax = `${date}T23:59:59`;

  const url = new URL(`${BASE_URL}/availability`);
  url.searchParams.set("sport_id", "PADEL");
  url.searchParams.set("tenant_id", tenantId);
  url.searchParams.set("start_min", startMin);
  url.searchParams.set("start_max", startMax);

  const [availResponse, courtNames] = await Promise.all([
    fetch(url.toString(), { headers: HEADERS }),
    fetchCourtNames(tenantId),
  ]);

  if (!availResponse.ok) {
    throw new Error(`Playtomic availability error: ${availResponse.status}`);
  }

  const resources = await availResponse.json();

  const slots = [];

  for (const resource of resources) {
    const courtName = courtNames.get(resource.resource_id) ?? resource.resource_id;

    for (const slot of resource.slots) {
      slots.push({
        provider: "playtomic",
        courtName,
        startDate: resource.start_date,
        startTime: slot.start_time.slice(0, 5), // "18:00:00" -> "18:00"
        duration: slot.duration,
        price: slot.price,
      });
    }
  }

  return slots;
}
