export const daysBetween = (d1: Date, d2: Date) =>
  Math.ceil((d2.getTime() - d1.getTime()) / (1000 * 60 * 60 * 24));

export const addDays = (date: Date, days: number) =>
  new Date(date.getTime() + days * 24 * 60 * 60 * 1000);
