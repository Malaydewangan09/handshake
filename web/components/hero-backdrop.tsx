import { Handshake } from "@phosphor-icons/react/dist/ssr";

// What the two systems really send each other in the story, streaming toward the point where Handshake sits.
const HOTEL = ["Reservation r_0001", "Read as Mar 4 → Apr 4", "31 nights", "$3,720.00", "reservation_not_found", "2 rooms booked", "check_in 03/04/2026"];
const SITE = ["Booking RF-1001", "03/04/2026 → 04/04/2026", "1 night", "$120.00", "cancel RF-1003", "retrying after 10s", "Ana Silva"];

function Row({ items, side, d, offset }: { items: string[]; side: "left" | "right"; d: number; offset: number }) {
  const list = [...items.slice(offset), ...items.slice(0, offset)];
  const chip = side === "left" ? "border-sea/25 text-sea" : "border-amber/30 text-amber";
  return (
    <div className="overflow-hidden">
      <div className={`flex w-max gap-2.5 ${side === "left" ? "flow-left" : "flow-right"}`} style={{ ["--d" as string]: `${d}s` }}>
        {[...list, ...list].map((t, i) => (
          <span key={i} className={`whitespace-nowrap rounded-md border bg-white px-2.5 py-1 font-mono text-[12px] ${chip}`}>
            {t}
          </span>
        ))}
      </div>
    </div>
  );
}

/** Two streams of booking messages, hotel from the left, booking site from the right, meeting at Handshake. */
export function HeroStreams() {
  const rows = [34, 28, 40];
  const fade = "[mask-image:linear-gradient(to_right,transparent,black_18%,black_80%,transparent)]";
  return (
    <div className="relative" aria-hidden>
      <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-0">
        <div className={`min-w-0 space-y-3 ${fade}`}>
          {rows.map((d, i) => (
            <div key={i} className={i === 2 ? "hidden sm:block" : ""}>
              <Row items={HOTEL} side="left" d={d} offset={i * 2} />
            </div>
          ))}
        </div>
        <div className="relative z-10 mx-3 flex flex-col items-center sm:mx-5">
          <span className="seam-glow absolute -inset-6 rounded-full bg-[radial-gradient(closest-side,rgba(20,99,216,0.18),rgba(192,106,10,0.12),transparent)]" />
          <span className="relative flex items-center gap-2 rounded-full border border-line bg-white px-4 py-2.5 shadow-[0_10px_30px_-12px_rgba(15,23,42,0.35)]">
            <Handshake size={18} weight="fill" />
            <span className="font-display text-[14.5px] font-semibold">Handshake</span>
          </span>
        </div>
        <div className={`min-w-0 space-y-3 ${fade}`}>
          {rows.map((d, i) => (
            <div key={i} className={i === 2 ? "hidden sm:block" : ""}>
              <Row items={SITE} side="right" d={d + 4} offset={i * 2} />
            </div>
          ))}
        </div>
      </div>
      <div className="mt-4 grid grid-cols-2 text-[12.5px] font-medium">
        <span className="text-left text-sea">Seaside Inn<span className="hidden sm:inline">&apos;s booking system</span></span>
        <span className="text-right text-amber">RoomFinder<span className="hidden sm:inline">&apos;s website</span></span>
      </div>
    </div>
  );
}
