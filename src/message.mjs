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

const translations = {
  es: {
    noSlots: (clubName) =>
      `Hoy no vemos pistas libres en ${clubName}.`,
    noSlotsFollowUp: "Te avisamos si se libera alguna.",
    title: (clubName) =>
      `Disponibilidad de ultimo minuto hoy en ${clubName}`,
    callToAction: "Escribinos para reservar.",
    courtJoiner: "y",
  },
  en: {
    noSlots: (clubName) =>
      `We do not see any free courts at ${clubName} today.`,
    noSlotsFollowUp: "We will let you know if one opens up.",
    title: (clubName) => `Last-minute availability today at ${clubName}`,
    callToAction: "Message us to book.",
    courtJoiner: "and",
  },
  de: {
    noSlots: (clubName) =>
      `Heute sehen wir keine freien Plaetze bei ${clubName}.`,
    noSlotsFollowUp: "Wir sagen dir Bescheid, falls etwas frei wird.",
    title: (clubName) =>
      `Last-Minute-Verfuegbarkeit heute bei ${clubName}`,
    callToAction: "Schreib uns, um zu buchen.",
    courtJoiner: "und",
  },
};

export const supportedLanguages = Object.keys(translations);

export function normalizeLanguage(language = "es") {
  const normalized = language.toLowerCase();

  if (!supportedLanguages.includes(normalized)) {
    throw new Error(
      `Unsupported language "${language}". Supported languages: ${supportedLanguages.join(", ")}`,
    );
  }

  return normalized;
}

export function generateMessage({ clubName, groupedSlots, language = "es" }) {
  const copy = translations[normalizeLanguage(language)];

  if (groupedSlots.length === 0) {
    return [
      copy.noSlots(clubName),
      "",
      copy.noSlotsFollowUp,
    ].join("\n");
  }

  const lines = groupedSlots.map((slot) => {
    const courtLabel = joinCourts(slot.courts, copy.courtJoiner);
    return `${slot.time} - ${courtLabel}`;
  });

  return [
    copy.title(clubName),
    "",
    ...lines,
    "",
    copy.callToAction,
  ].join("\n");
}

function joinCourts(courts, joiner) {
  if (courts.length <= 1) {
    return courts.join("");
  }

  return `${courts.slice(0, -1).join(", ")} ${joiner} ${courts.at(-1)}`;
}
