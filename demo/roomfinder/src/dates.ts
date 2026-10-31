// Seaside Inn's partner guide asks for MM/DD/YYYY: 04/03/2026 is 3 April.
export function toHotelDate(iso: string): string {
  const [year, month, day] = iso.split("-");
  return `${month}/${day}/${year}`;
}
