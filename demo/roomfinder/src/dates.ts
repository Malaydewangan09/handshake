export type Site = "us" | "eu";

// Dates as each of our sites shows them to guests: 03/04/2026 is March 4 in the US and 3 April in Europe.
export function toHotelDate(iso: string, site: Site): string {
  const [year, month, day] = iso.split("-");
  return site === "eu" ? `${day}/${month}/${year}` : `${month}/${day}/${year}`;
}
