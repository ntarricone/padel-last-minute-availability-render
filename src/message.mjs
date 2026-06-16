export function groupSlots(slots) {
  const byTime = new Map();

  for (const slot of slots) {
    const courts = byTime.get(slot.startTime) ?? [];
    courts.push(slot.courtName);
    byTime.set(slot.startTime, courts);
  }

  return [...byTime.entries()]
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([time, courts]) => ({
      time,
      courts: courts.sort((a, b) => a.localeCompare(b)),
    }));
}

export function generateMessage({ clubName, groupedSlots }) {
  if (groupedSlots.length === 0) {
    return [
      `Hoy no vemos pistas libres en ${clubName} para el horario de tarde/noche.`,
      "",
      "Te avisamos si se libera alguna.",
    ].join("\n");
  }

  const lines = groupedSlots.map((slot) => {
    const courtLabel = joinCourts(slot.courts);
    return `${slot.time} - ${courtLabel}`;
  });

  return [
    `Disponibilidad de ultimo minuto hoy en ${clubName}`,
    "",
    ...lines,
    "",
    "Escribinos para reservar.",
  ].join("\n");
}

function joinCourts(courts) {
  if (courts.length <= 1) {
    return courts.join("");
  }

  return `${courts.slice(0, -1).join(", ")} y ${courts.at(-1)}`;
}
