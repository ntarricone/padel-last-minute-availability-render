export const playtomicDiscovery = {
  baseUrl: "https://api.playtomic.io/v1",
  availabilityPath: "/availability",
  tenantSearchPath: "/tenants",
  resourcePathTemplate: "/tenants/{tenantId}/resources",
  parameters: {
    sport_id: "PADEL",
    tenant_id: "Playtomic tenant id",
    start_min: "YYYY-MM-DDT00:00:00",
    start_max: "YYYY-MM-DDT23:59:59",
  },
  responseShape: {
    resource_id: "Court/resource id",
    start_date: "YYYY-MM-DD",
    slots: [
      {
        start_time: "HH:mm:ss",
        duration: "minutes",
        price: "provider-specific string",
      },
    ],
  },
};

