import type { SubscriptionFrequency } from "@/lib/database.types";

export const FREQUENCY_DAYS: Record<SubscriptionFrequency, number> = {
  weekly: 7,
  biweekly: 14,
  monthly: 30,
  bimonthly: 60,
  semester: 180,
  custom: 30,
};

export function addFrequencyInterval(date: Date, frequency: SubscriptionFrequency) {
  const next = new Date(date);
  next.setDate(next.getDate() + FREQUENCY_DAYS[frequency]);
  return next;
}

export function toDateInputValue(date: Date) {
  return date.toISOString().slice(0, 10);
}
