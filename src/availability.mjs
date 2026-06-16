import { getPlaytomicAvailability, getPlaytomicTenant } from "./playtomic-provider.mjs";
import { generateMessage, groupSlots } from "./message.mjs";

const isoDatePattern = /^\d{4}-\d{2}-\d{2}$/;
const maxRangeDays = 14;

export class AvailabilityDateError extends Error {}

export async function buildAvailabilityMessage({
  club,
  tenantId,
  language = "es",
  now = new Date(),
  date,
  startDate,
  endDate,
  getAvailability = getPlaytomicAvailability,
  getTenant = getPlaytomicTenant,
}) {
  const today = formatDate(now);
  const dates = resolveAvailabilityDates({ date, startDate, endDate, now });
  const resolvedTenantId = tenantId ?? club?.playtomicTenantId;

  if (!resolvedTenantId) {
    throw new Error("tenantId is required to fetch availability");
  }

  let clubName = club?.name;

  if (!clubName) {
    const tenant = await getTenant(resolvedTenantId);
    clubName = tenant.tenant_name;
  }

  const results = await Promise.all(
    dates.map(async (requestedDate) => {
      const slots = await getAvailability({
        tenantId: resolvedTenantId,
        date: requestedDate,
      });

      const groupedSlots = groupSlots(slots);

      return {
        date: requestedDate,
        availableSlots: groupedSlots,
        message: generateMessage({
          clubName,
          groupedSlots,
          language,
          date: requestedDate,
          isToday: requestedDate === today,
        }),
      };
    }),
  );

  if (results.length === 1) {
    const [result] = results;

    return {
      club: clubName,
      date: result.date,
      language,
      availableSlots: result.availableSlots,
      message: result.message,
      results,
    };
  }

  return {
    club: clubName,
    startDate: dates[0],
    endDate: dates.at(-1),
    language,
    results,
  };
}

export function resolveAvailabilityDates({
  date,
  startDate,
  endDate,
  now = new Date(),
}) {
  if (date && (startDate || endDate)) {
    throw new AvailabilityDateError(
      "Use either date or startDate/endDate, not both",
    );
  }

  if (date) {
    return [validateDate(date, "date")];
  }

  if (startDate || endDate) {
    if (!startDate || !endDate) {
      throw new AvailabilityDateError(
        "startDate and endDate must be provided together",
      );
    }

    const rangeStart = validateDate(startDate, "startDate");
    const rangeEnd = validateDate(endDate, "endDate");

    if (rangeStart > rangeEnd) {
      throw new AvailabilityDateError("startDate must be before or equal to endDate");
    }

    return buildDateRange(rangeStart, rangeEnd);
  }

  return [formatDate(now)];
}

function validateDate(value, paramName) {
  if (!isoDatePattern.test(value)) {
    throw new AvailabilityDateError(`${paramName} must use YYYY-MM-DD format`);
  }

  const parsed = new Date(`${value}T00:00:00.000Z`);

  if (Number.isNaN(parsed.getTime()) || formatDate(parsed) !== value) {
    throw new AvailabilityDateError(`${paramName} must be a valid date`);
  }

  return value;
}

function buildDateRange(startDate, endDate) {
  const dates = [];
  const endTime = dateToUtcTime(endDate);

  for (
    let cursor = dateToUtcTime(startDate);
    cursor <= endTime;
    cursor += 24 * 60 * 60 * 1000
  ) {
    dates.push(formatDate(new Date(cursor)));
  }

  if (dates.length > maxRangeDays) {
    throw new AvailabilityDateError(
      `Date range cannot be longer than ${maxRangeDays} days`,
    );
  }

  return dates;
}

function dateToUtcTime(date) {
  const [year, month, day] = date.split("-").map(Number);
  return Date.UTC(year, month - 1, day);
}

function formatDate(date) {
  return date.toISOString().slice(0, 10);
}
