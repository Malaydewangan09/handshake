// Illustrated avatars: people from Notionists (CC0, Zoish), agents from Bottts (Pablo Stanley, free for commercial use).
const FILES = new Set(["maria", "arjun", "priya", "sam", "seaside-inn-agent", "roomfinder-agent", "priya-agent", "sam-agent", "seaside-inn-watcher"]);

export function Avatar({ name, isAgent, size = 32 }: { name: string; isAgent: boolean; size?: number }) {
  const slug = isAgent ? name : name.split(" ")[0].toLowerCase();
  if (!FILES.has(slug)) {
    return (
      <div className="grid shrink-0 place-items-center rounded-full bg-[#ececef] font-semibold text-ink" style={{ width: size, height: size, fontSize: size * 0.4 }}>
        {name[0].toUpperCase()}
      </div>
    );
  }
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={`/avatars/${slug}.svg`}
      alt=""
      width={size}
      height={size}
      className={`shrink-0 ${isAgent ? "rounded-[9px]" : "rounded-full"}`}
      style={{ width: size, height: size }}
    />
  );
}
