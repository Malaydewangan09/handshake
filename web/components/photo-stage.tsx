// A real place, out of focus, with the product sharp on top. Photos from Unsplash, free under the Unsplash License.
export function PhotoStage({ src, children, className = "" }: { src: string; children: React.ReactNode; className?: string }) {
  return (
    <div className={`relative overflow-hidden rounded-[18px] ${className}`}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={src} alt="" className="absolute inset-0 size-full scale-110 object-cover" />
      <div className="relative px-3 py-8 sm:px-8 md:px-12 md:py-12">{children}</div>
    </div>
  );
}

export function WindowChrome({ title, right, children }: { title: React.ReactNode; right?: React.ReactNode; children: React.ReactNode }) {
  return (
    <div className="overflow-hidden rounded-[12px] border border-black/5 bg-white shadow-[0_30px_60px_-30px_rgba(11,14,20,0.55)]">
      <div className="flex items-center gap-3 border-b border-line bg-[#f7f7f8] px-4 py-2.5">
        <span className="flex gap-1.5" aria-hidden>
          <span className="size-2.5 rounded-full bg-[#ff5f57]" />
          <span className="size-2.5 rounded-full bg-[#febc2e]" />
          <span className="size-2.5 rounded-full bg-[#28c840]" />
        </span>
        <span className="min-w-0 flex-1 truncate text-[13px] font-medium text-ink">{title}</span>
        {right}
      </div>
      {children}
    </div>
  );
}
