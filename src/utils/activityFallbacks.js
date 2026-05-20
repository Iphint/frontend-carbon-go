export function withHomeFallback(activities) {
  const hasHome = activities.some((activity) => activity.category === "home");
  if (hasHome) return activities;

  const homeActivities = activities
    .filter((activity) => activity.category === "transportation")
    .map((activity) => ({
      ...activity,
      category: "home",
      displayKey: `home:${activity.id}`
    }));

  return [
    ...activities.map((activity) => ({ ...activity, displayKey: `${activity.category}:${activity.id}` })),
    ...homeActivities
  ];
}
