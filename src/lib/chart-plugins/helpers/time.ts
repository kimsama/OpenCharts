import { Time, isUTCTimestamp, isBusinessDay } from "lightweight-charts";

export function convertTime(t: Time): number {
  if (isUTCTimestamp(t)) return t * 1000;
  if (isBusinessDay(t)) return new Date(t.year, t.month, t.day).valueOf();
  const parts = t.split("-").map(Number);
  return new Date(parts[0]!, parts[1]!, parts[2]!).valueOf();
}

export function displayTime(time: Time): string {
  if (typeof time == "string") return time;
  const date = isBusinessDay(time)
    ? new Date(time.year, time.month, time.day)
    : new Date(time * 1000);
  return date.toLocaleDateString();
}

export function formattedDateAndTime(timestamp: number | undefined): [string, string] {
  if (!timestamp) return ["", ""];
  const dateObj = new Date(timestamp);

  // Format date string
  const year = dateObj.getFullYear();
  const month = dateObj.toLocaleString("default", { month: "short" });
  const date = dateObj.getDate().toString().padStart(2, "0");
  const formattedDate = `${date} ${month} ${year}`;

  // Format time string
  const hours = dateObj.getHours().toString().padStart(2, "0");
  const minutes = dateObj.getMinutes().toString().padStart(2, "0");
  const formattedTime = `${hours}:${minutes}`;

  return [formattedDate, formattedTime];
}

export function formatUtcTradingDate(timestampSeconds: number): string {
  if (!Number.isFinite(timestampSeconds)) return "";
  return new Date(timestampSeconds * 1000).toISOString().slice(0, 10);
}

export function formatUtcTradingDateTime(time: Time): [string, string] {
  if (typeof time === "string") return [time, ""];
  if (isBusinessDay(time)) {
    return [
      `${time.year}-${String(time.month).padStart(2, "0")}-${String(time.day).padStart(2, "0")}`,
      "",
    ];
  }
  return [formatUtcTradingDate(time), ""];
}
