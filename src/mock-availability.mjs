export function getMockAvailability() {
  const today = new Date().toISOString().slice(0, 10);

  return [
    {
      provider: "mock",
      courtName: "Pista 2",
      startDate: today,
      startTime: "18:00",
      duration: 90,
      price: "mock",
    },
    {
      provider: "mock",
      courtName: "Pista 1",
      startDate: today,
      startTime: "19:30",
      duration: 90,
      price: "mock",
    },
    {
      provider: "mock",
      courtName: "Pista 4",
      startDate: today,
      startTime: "19:30",
      duration: 90,
      price: "mock",
    },
    {
      provider: "mock",
      courtName: "Pista 3",
      startDate: today,
      startTime: "21:00",
      duration: 90,
      price: "mock",
    },
  ];
}

