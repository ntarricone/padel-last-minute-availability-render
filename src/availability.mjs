import { getMockAvailability } from "./mock-availability.mjs";
import { generateMessage, groupSlots } from "./message.mjs";

export async function buildAvailabilityMessage({ club, now = new Date() }) {
  const today = now.toISOString().slice(0, 10);
  const slots = getMockAvailability()
    .filter((slot) => slot.startDate === today)
    .filter((slot) => isWithinWindow(slot.startTime, club.promotionWindow));

  const groupedSlots = groupSlots(slots);

  return {
    club: club.name,
    date: today,
    window: club.promotionWindow,
    availableSlots: groupedSlots,
    message: generateMessage({
      clubName: club.name,
      groupedSlots,
    }),
  };
}

function isWithinWindow(time, window) {
  return time >= window.from && time <= window.to;
}

