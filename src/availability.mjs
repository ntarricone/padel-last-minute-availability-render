import { getPlaytomicAvailability } from "./playtomic-provider.mjs";
import { generateMessage, groupSlots } from "./message.mjs";

export async function buildAvailabilityMessage({
  club,
  language = "es",
  now = new Date(),
}) {
  const today = now.toISOString().slice(0, 10);

  const slots = await getPlaytomicAvailability({
    tenantId: club.playtomicTenantId,
    date: today,
  });

  const groupedSlots = groupSlots(slots);

  return {
    club: club.name,
    date: today,
    language,
    availableSlots: groupedSlots,
    message: generateMessage({
      clubName: club.name,
      groupedSlots,
      language,
    }),
  };
}
