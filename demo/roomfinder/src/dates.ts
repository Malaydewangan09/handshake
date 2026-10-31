// Dates as our site shows them to guests: 03/04/2026 is 3 April.
export function toHotelDate(iso: string): string {
  const [year, month, day] = iso.split("-");
  return `${day}/${month}/${year}`;
}
