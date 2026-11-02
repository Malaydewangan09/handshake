export type Site = "us" | "eu";

// Seaside Inn's booking guide requires MM/DD/YYYY whichever site the guest booked on.
export function toHotelDate(iso: string): string {
  const [year, month, day] = iso.split("-");
  return `${month}/${day}/${year}`;
}
