export const clubs = [
  {
    id: "club-x",
    name: "Club X",
    timezone: "Europe/Madrid",
    playtomicTenantId: "replace-with-playtomic-tenant-id",
    openingTime: "08:00",
    closingTime: "23:00",
    slotDurationMinutes: 90,
    promotionWindow: {
      from: "18:00",
      to: "22:00",
    },
    minLeadTimeMinutes: 30,
  },
];

export function getClubById(clubId) {
  return clubs.find((club) => club.id === clubId);
}

