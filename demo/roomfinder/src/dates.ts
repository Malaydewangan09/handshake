export type Site = "us" | "eu";

// Seaside Inn's partner guide wants month first (04/03/2026 is 3 April), whatever the guest's site shows.
export function toHotelDate(iso: string): string {
  const [year, month, day] = iso.split("-");
  return `${month}/${day}/${year}`;
}
