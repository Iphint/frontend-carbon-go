export function jakartaDay(value = new Date()) {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Jakarta",
    year: "numeric",
    month: "2-digit",
    day: "2-digit"
  }).format(new Date(value));
}

function userScopedKey(userId, key) {
  return `carbon_user_${userId}_${key}`;
}

export function hasSeenTrackerGuide(userId) {
  return localStorage.getItem(userScopedKey(userId, "tracker_guide_seen")) === "true";
}

export function markTrackerGuideSeen(userId) {
  localStorage.setItem(userScopedKey(userId, "tracker_guide_seen"), "true");
}

export function markDailySurveyCompleted(userId, date = jakartaDay()) {
  localStorage.setItem(userScopedKey(userId, "daily_survey_date"), date);
}

export function isDailySurveyCompletedLocally(userId, date = jakartaDay()) {
  return localStorage.getItem(userScopedKey(userId, "daily_survey_date")) === date;
}

export function hasLogForToday(logs, date = jakartaDay()) {
  return logs.some((log) => jakartaDay(log.created_at) === date);
}
