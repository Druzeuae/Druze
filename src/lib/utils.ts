import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function calculateAge(dob: string): number {
  const birth = new Date(dob);
  const today = new Date();
  let age = today.getFullYear() - birth.getFullYear();
  const monthDiff = today.getMonth() - birth.getMonth();
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
    age--;
  }
  return age;
}

export function initials(name: string): string {
  return name
    .split(" ")
    .map((n) => n[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

export function timeAgo(dateStr: string, locale: "en" | "ar" = "en"): string {
  const date = new Date(dateStr);
  const seconds = Math.floor((Date.now() - date.getTime()) / 1000);
  const intervals: [number, string, string][] = [
    [60, "s", "ث"],
    [3600, "m", "د"],
    [86400, "h", "س"],
    [604800, "d", "ي"],
  ];
  if (seconds < 60) return locale === "ar" ? "الآن" : "now";
  for (let i = intervals.length - 1; i >= 0; i--) {
    const [div, enLabel, arLabel] = intervals[i];
    if (seconds >= div) {
      const value = Math.floor(seconds / div);
      return locale === "ar" ? `${value}${arLabel}` : `${value}${enLabel}`;
    }
  }
  return "";
}
