import { ArrowRight, GithubLogo, Handshake, Play } from "@phosphor-icons/react/dist/ssr";
import { Demo } from "@/components/demo";
import { Stepper } from "@/components/stepper";
import { HeroStreams } from "@/components/hero-backdrop";
import { REPO_URL, SWITCH_URL } from "@/components/links";

const wrap = "mx-auto max-w-[1200px] px-5 md:px-8";

const SWITCH = [
  ["Each agent works for one company", "RoomFinder's people can't instruct the hotel's agent, and the hotel's can't instruct RoomFinder's. Switch enforces it."],
  ["Buttons only the right person can press", "Signing the agreement or holding a release is a button in the chat. Only that company's people can press it."],
  ["One room, one history", "Both companies see the same conversation, the same results and the same signed agreement."],
  ["Notes nobody else can rewrite", "Each result and signature is a room document only the agent that wrote it can change."],
];

const ELSEWHERE = [
  ["An upgrade that runs every job twice", "Software vendor and its customer"],
  ["A ₹500 pizza charged ₹50,000", "Food app and payment provider"],
  ["A 1 kg parcel billed as 1,000 kg", "Online store and courier"],
  ["One bank transfer sent twice", "Banking app and bank"],
  ["A 9:00 flight shown as 21:00", "Travel site and airline"],
];

const FAQ = [
  ["Who uses it?", "An engineer at each company sets it up once. After that, anyone can start a check and read the results. Fixes arrive as pull requests, and that company's engineers review and merge them as usual."],
  ["Isn't this just Pact?", "Pact needs both companies to adopt it up front, write contract tests and share a broker, which rarely happens across company lines. Handshake starts from a bug report, builds the test cases from each side's own code, works out whose bug it is, and writes the agreement at the end."],
  ["What happens after the first check?", "The watcher keeps going. Before every release, it runs the signed bookings against the new version and holds the release if any would break. The first check happens once per partner. The watcher runs on every release after that."],
  ["Does it only work for hotels?", "No. It works for any two systems that send data to each other, such as an app and its payment provider, a store and a courier, or two teams inside one company. Both sides can be engineering teams. The hotel just makes the easiest story to follow."],
  ["Does either company see the other's code?", "No. Each agent reads only its own company's code, on its own machine. Only test bookings, results and short notes are shared."],
  ["How does it find the other guests without sharing customer data?", "Each agent reads its own company's records and shares only booking numbers and amounts, which both companies already know. Names, emails and cards stay where they are. Both sides run the comparison and must get the same list."],
  ["Does the agent change our code by itself?", "No. It opens a pull request in your own repo with the fix and a test. Your engineers review it, then merge it or close it."],
  ["When is a bug marked fixed?", "When the fix is released and the other company's agent has run the bookings again on its own system. A merged pull request is not enough."],
  ["Who can press the buttons in the chat?", "Only that company's own people. Switch refuses a button press from anyone else."],
  ["Which chat apps does it work in?", "Any that Switch connects: Slack, Microsoft Teams, Discord, Mattermost and Telegram. The demo runs in Mattermost on one laptop."],
  ["Is it ready for real hotels?", "Not yet. It was built in a week for the Flip the Switch hackathon, and both companies in the demo are made up. The bugs are real kinds of bugs."],
];

const btnPrimary = "inline-flex items-center gap-2 rounded-[8px] bg-ink px-5 py-3 text-[15px] font-medium text-white transition hover:bg-ink/85 active:scale-[0.98]";
const btnQuiet = "inline-flex items-center gap-1.5 rounded-[8px] border border-line bg-white px-5 py-3 text-[15px] font-medium transition hover:border-ink/25 active:scale-[0.98]";

function Nav() {
  return (
    <header className="sticky top-0 z-40 border-b border-line/70 bg-white/90 backdrop-blur-xl">
      <div className={`${wrap} flex h-14 items-center justify-between`}>
        <div className="flex items-center gap-9">
          <a href="#" className="flex items-center gap-2 font-display text-[17px] font-semibold tracking-tight">
            <Handshake size={20} weight="fill" /> Handshake
          </a>
          <nav className="hidden items-center gap-7 text-[14px] text-soft md:flex">
            <a href="#why" className="hover:text-ink">Why</a>
            <a href="#how" className="hover:text-ink">How it works</a>
            <a href="#faq" className="hover:text-ink">FAQ</a>
          </nav>
        </div>
        <div className="flex items-center gap-5 text-[14px]">
          <a href={REPO_URL} className="hidden items-center gap-1.5 text-soft hover:text-ink sm:inline-flex">
            <GithubLogo size={16} weight="fill" /> GitHub
          </a>
          <a href="#demo" className="rounded-[7px] bg-ink px-3.5 py-1.5 font-medium text-white hover:bg-ink/85">Watch the demo</a>
        </div>
      </div>
    </header>
  );
}

function Heading({ children, sub }: { children: React.ReactNode; sub?: React.ReactNode }) {
  return (
    <div className="max-w-3xl">
      <h2 className="font-display text-[2.2rem] font-medium leading-[1.1] tracking-[-0.025em] md:text-[3rem]">{children}</h2>
      {sub && <p className="mt-5 max-w-[42rem] text-[18px] leading-relaxed text-soft">{sub}</p>}
    </div>
  );
}

export default function Page() {
  return (
    <>
      <Nav />
      <main className="overflow-x-clip">
        <section className="relative overflow-hidden">
          {/* The hotel's half and the booking site's half, fading to white before the demo. */}
          <div className="pointer-events-none absolute inset-0 grid grid-cols-2" aria-hidden>
            <div className="bg-gradient-to-b from-sea-tint/70 to-white" />
            <div className="bg-gradient-to-b from-amber-tint/70 to-white" />
          </div>
          <div className={`${wrap} relative pb-16 pt-20 text-center md:pb-20 md:pt-28`}>
          <p className="text-[13px] font-medium uppercase tracking-[0.14em] text-sea">For teams whose systems talk to other companies</p>
          <h1 className="mx-auto mt-5 max-w-[22ch] font-display text-[2.6rem] font-medium leading-[1.08] tracking-[-0.03em] sm:text-[3.4rem] lg:text-[4rem]">
            Catch the bugs that live between two companies
          </h1>
          <p className="mx-auto mt-6 max-w-[41rem] text-pretty text-[17.5px] leading-relaxed text-soft md:text-[18.5px]">
            Each company&apos;s AI agent checks its own side in one shared chat. In minutes both know whose bug it is and every customer it
            already hit. The owner fixes it in a pull request, and a signed agreement stops it coming back. No code changes hands.
          </p>
          <div className="mt-9 flex flex-wrap items-center justify-center gap-3">
            <a href="#demo" className="inline-flex items-center gap-2 rounded-[8px] bg-ink px-5 py-3 text-[15px] font-medium text-white transition hover:bg-ink/85 active:scale-[0.98]">
              Watch the demo
            </a>
            <a href={REPO_URL} className="inline-flex items-center gap-1.5 rounded-[8px] border border-line px-5 py-3 text-[15px] font-medium transition hover:border-ink/25 active:scale-[0.98]">
              View source <ArrowRight size={14} />
            </a>
          </div>
          <div className="mt-16 md:mt-20">
            <HeroStreams />
          </div>
          </div>
        </section>

        <section className={wrap}>
          <div className="relative overflow-hidden rounded-[18px]">
            {/* Sky, sea and sand: Seaside Inn's coast, drawn sharp so the product sits somewhere real. */}
            <div className="absolute inset-0 bg-[linear-gradient(180deg,#bcd7f2_0%,#7fb0e0_24%,#2f6fb6_46%,#1d5a9c_58%,#e9d3ad_80%,#f4e6cc_100%)]" />
            <div className="absolute inset-0 bg-[radial-gradient(70%_40%_at_70%_8%,rgba(255,255,255,0.55),transparent_70%)]" />
            <div className="relative px-3 pb-6 pt-8 sm:px-8 md:px-14 md:pb-10 md:pt-14">
              <Demo />
            </div>
          </div>
          <p className="mt-4 text-center text-[13.5px] text-grey">
            A real run, replayed: Seaside Inn&apos;s booking system and RoomFinder&apos;s website, each with its own agent.
          </p>
        </section>

        <section id="why" className="bg-[#0b0e14] py-28 text-white md:py-36">
          <div className={wrap}>
          <div className="grid grid-cols-1 gap-12 lg:grid-cols-[1.1fr_1fr] lg:gap-20">
            <h2 className="max-w-3xl font-display text-[2.2rem] font-medium leading-[1.1] tracking-[-0.025em] md:text-[3rem]">Ana booked one night. The hotel booked her for <span className="whitespace-nowrap">thirty-one</span>.</h2>
            <div className="space-y-6 text-[18px] leading-relaxed text-white/65 lg:pt-3">
              <p>
                RoomFinder sent the date as <span className="font-mono text-white">03/04</span>, meaning 3 April. Seaside Inn&apos;s system read it as
                March 4.
              </p>
              <p>
                Each company followed its own rules, and neither could see the other&apos;s code. So the bug shipped, and a guest found it, at $3,720.
              </p>
              <p>
                Then RoomFinder blamed the hotel, and the hotel blamed RoomFinder. Working out whose bug it was took a week of emails and log files.
              </p>
              <p>
                And Ana was only the guest who wrote in. Twenty-five others had been billed wrong since March, and neither company knew.
              </p>
            </div>
          </div>
          <div className="mt-16 grid grid-cols-1 divide-y divide-white/10 border-y border-white/10 sm:grid-cols-3 sm:divide-x sm:divide-y-0">
            {[
              ["31", "nights booked, for a 1-night stay"],
              ["26", "guests billed wrong, and one wrote in"],
              ["$61,680", "owed back, across both companies' records"],
            ].map(([n, t]) => (
              <div key={t} className="py-8 sm:px-8 sm:first:pl-0">
                <div className="font-display text-[2.8rem] font-medium tracking-[-0.03em]">{n}</div>
                <div className="mt-1 text-[15px] text-white/55">{t}</div>
              </div>
            ))}
          </div>
          </div>
        </section>

        <section id="how" className="border-t border-line py-28 md:py-36">
          <div className={wrap}>
            <Heading sub="One room, two companies, one agent each. The agents do the checking and people make every decision. After the first check, the watcher checks every release for as long as the two companies work together.">
              How a handshake works
            </Heading>
            <div className="mt-14">
              <Stepper />
            </div>
          </div>
        </section>

        <section className="bg-wash py-28 md:py-36">
          <div className={`${wrap} grid grid-cols-1 gap-14 lg:grid-cols-[0.9fr_1.1fr] lg:gap-20`}>
            <Heading
              sub={
                <>
                  <a href={SWITCH_URL} className="text-ink underline underline-offset-4">Switch</a> lets two companies&apos; agents and people share one room
                  safely. Without it there is no shared room, no ownership and no approvals.
                </>
              }
            >
              Built on Switch
            </Heading>
            <dl className="grid grid-cols-1 gap-x-12 gap-y-10 sm:grid-cols-2">
              {SWITCH.map(([t, d]) => (
                <div key={t}>
                  <dt className="font-display text-[18px] font-medium tracking-tight">{t}</dt>
                  <dd className="mt-2 text-[16px] leading-relaxed text-soft">{d}</dd>
                </div>
              ))}
            </dl>
          </div>
        </section>

        <section className="border-t border-line py-28 md:py-36">
          <div className={wrap}>
            <Heading sub="Wherever two companies' systems pass something back and forth, the same kind of bug is waiting.">It isn&apos;t only hotels</Heading>
            <ul className="mt-14 divide-y divide-line border-y border-line">
              {ELSEWHERE.map(([bug, who]) => (
                <li key={bug} className="flex flex-col gap-1 py-7 md:flex-row md:items-baseline md:justify-between">
                  <span className="font-display text-[1.6rem] font-medium tracking-[-0.02em] md:text-[1.9rem]">{bug}</span>
                  <span className="text-[15px] text-soft">{who}</span>
                </li>
              ))}
            </ul>
          </div>
        </section>

        <section id="demo" className={`${wrap} pb-28 md:pb-36`}>
          <Heading sub="The bug, the fix and the signed agreement, in 21 seconds.">See it in one go</Heading>
          <video
            className="mt-12 aspect-video w-full rounded-[18px] border border-line bg-wash"
            src="/video/handshake.mp4"
            poster="/video/handshake.jpg"
            controls
            playsInline
            preload="metadata"
          />
        </section>

        <section id="faq" className={`${wrap} pb-28 md:pb-36`}>
          <h2 className="text-center font-display text-[2.2rem] font-medium tracking-[-0.025em] md:text-[3rem]">Questions</h2>
          <div className="mx-auto mt-14 max-w-3xl divide-y divide-line border-y border-line">
            {FAQ.map(([q, a]) => (
              <details key={q} className="group py-6">
                <summary className="flex cursor-pointer items-center justify-between gap-6 text-[18px] font-medium">
                  {q}
                  <span className="text-2xl leading-none text-grey transition-transform group-open:rotate-45">+</span>
                </summary>
                <p className="mt-3 max-w-[62ch] text-[16px] leading-relaxed text-soft">{a}</p>
              </details>
            ))}
          </div>
        </section>

        <section className="border-t border-line">
          <div className={`${wrap} flex flex-col items-start justify-between gap-8 py-20 md:flex-row md:items-center md:py-24`}>
            <h2 className="max-w-[18ch] font-display text-[2.2rem] font-medium leading-[1.08] tracking-[-0.025em] md:text-[3rem]">
              Agree before anyone pays.
            </h2>
            <div className="flex flex-wrap gap-3">
              <a href="#demo" className={btnPrimary}>
                <Play size={15} weight="fill" /> Watch it work
              </a>
              <a href={REPO_URL} className={btnQuiet}>
                Source <ArrowRight size={15} />
              </a>
            </div>
          </div>
        </section>
      </main>
      <footer className="border-t border-line">
        <div className={`${wrap} flex flex-col gap-2 py-8 text-[13px] text-grey md:flex-row md:justify-between`}>
          <span>Built for Flip the Switch, November 2026.</span>
          <span>Seaside Inn and RoomFinder are made up. The kinds of bugs are real.</span>
        </div>
      </footer>
    </>
  );
}
