export function jakartaDay(value = new Date()) {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: "Asia/Jakarta",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    hourCycle: "h23"
  }).formatToParts(new Date(value));

  const get = (type) => parts.find((part) => part.type === type)?.value;
  const surveyDate = new Date(`${get("year")}-${get("month")}-${get("day")}T12:00:00.000Z`);

  if (Number(get("hour") || 0) < 5) {
    surveyDate.setUTCDate(surveyDate.getUTCDate() - 1);
  }

  return surveyDate.toISOString().slice(0, 10);
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
