// Seaside Inn reads dates month first: 3 April 2026 is 04/03/2026.
export function toHotelDate(iso: string): string {
  const [year, month, day] = iso.split("-");
  return `${month}/${day}/${year}`;
}
