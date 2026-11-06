import { ArrowRight, GithubLogo, Handshake, Play } from "@phosphor-icons/react/dist/ssr";
import { Demo } from "@/components/demo";
import { Stepper } from "@/components/stepper";
import { TryTheCard } from "@/components/try-the-card";
import { BillsSheet } from "@/components/bills-sheet";
import { PhotoStage } from "@/components/photo-stage";
import { HeroArgument } from "@/components/hero-argument";
import { REPO_URL, SWITCH_URL } from "@/components/links";

const wrap = "mx-auto max-w-[1200px] px-5 md:px-8";

const SWITCH = [
  ["Each agent works for one side", "RoomFinder can't instruct the hotel's agent, and Sam can't instruct Priya's. Switch enforces it."],
  ["Buttons only the right person can press", "Signing a settlement or holding a release is a button in the chat. Only that side's people can press it. Try it."],
  ["One room, one history", "Both sides see the same conversation, the same results and the same signed agreement."],
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
  ["Does it only work for hotels?", "No. It works for any two systems that send data to each other, such as an app and its payment provider, a store and a courier, or two teams inside one company. It even works for two flatmates settling a bills sheet, where there is no code at all, only records. The hotel just makes the easiest story to follow."],
  ["Does either company see the other's code?", "No. Each agent reads only its own company's code, on its own machine. Only test bookings, results and short notes are shared."],
  ["How does it find the other guests without sharing customer data?", "Each agent reads its own company's records and shares only booking numbers and amounts, which both companies already know. Names, emails and cards stay where they are. Both sides run the comparison and must get the same list."],
  ["Does the agent change our code by itself?", "No. It opens a pull request in your own repo with the fix and a test. Your engineers review it, then merge it or close it."],
  ["When is a bug marked fixed?", "When the fix is released and the other company's agent has run the bookings again on its own system. A merged pull request is not enough."],
  ["Who can press the buttons in the chat?", "Only that company's own people. Switch refuses a button press from anyone else."],
  ["Which chat apps does it work in?", "Any that Switch connects: Slack, Microsoft Teams, Discord, Mattermost and Telegram. The demo runs in Mattermost on one laptop."],
  ["Is it ready for real hotels?", "Not yet. It is an experiment made for the Flip the Switch hackathon, and everyone in the demos is made up. The bugs are real kinds of bugs."],
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
            <a href="#flatmates" className="hover:text-ink">Flatmates</a>
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
        <section className="relative isolate overflow-hidden bg-white">
          <div className={`${wrap} grid grid-cols-1 items-center gap-12 pb-36 pt-14 md:pb-44 md:pt-20 lg:grid-cols-[0.9fr_1.1fr] lg:gap-16`}>
            <HeroArgument
              intro={
                <>
                  <p className="mt-3 max-w-[34rem] text-pretty text-[17px] leading-relaxed text-soft md:text-[18px]">
                    Two companies blaming each other for a bug. Two flatmates who don&apos;t agree on the bills. Handshake gives each side its
                    own AI agent in one shared chat. They check their own records and argue it out until one of them owns it. Nobody has to
                    show their code or their bank statement.
                  </p>
                  <div className="mt-9 flex flex-wrap gap-3">
                    <a href="#demo" className={btnPrimary}>
                      Watch the demo
                    </a>
                    <a href={REPO_URL} className="inline-flex items-center gap-1.5 rounded-[8px] border border-line bg-white px-5 py-3 text-[15px] font-medium transition hover:border-ink/25 active:scale-[0.98]">
                      View source <ArrowRight size={14} />
                    </a>
                  </div>
                </>
              }
            />
          </div>
        </section>

        <section className={`${wrap} relative z-10 -mt-24 md:-mt-32`}>
          <div className="relative overflow-hidden rounded-[18px]">
            {/* Seaside Inn's lobby, out of focus, so the room sits somewhere real. Photo: Aalo Lens on Unsplash. */}
            <img src="/lobby.jpg" alt="" className="absolute inset-0 size-full scale-110 object-cover" />
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

        <section className="border-t border-line py-28 md:py-36">
          <div className={`${wrap} grid grid-cols-1 gap-14 lg:grid-cols-[0.9fr_1.1fr] lg:gap-20`}>
            <div>
            <Heading
              sub={
                <>
                  <a href={SWITCH_URL} className="text-ink underline underline-offset-4">Switch</a> lets two sides&apos; agents and people share one room
                  safely. Without it there is no shared room, no ownership and no approvals.
                </>
              }
            >
              Built on Switch
            </Heading>
            <dl className="mt-10 divide-y divide-line border-y border-line">
              {SWITCH.map(([t, d]) => (
                <div key={t} className="py-5">
                  <dt className="font-display text-[17px] font-medium tracking-tight">{t}</dt>
                  <dd className="mt-1.5 text-[15.5px] leading-relaxed text-soft">{d}</dd>
                </div>
              ))}
            </dl>
            </div>
            <PhotoStage src="/living.jpg" className="self-start">
              <TryTheCard />
            </PhotoStage>
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

        <section id="flatmates" className="border-t border-line py-28 md:py-36">
          <div className={`${wrap} grid grid-cols-1 gap-14 lg:grid-cols-[1fr_1fr] lg:gap-20`}>
            <div>
              <Heading sub="Priya and Sam share a flat. Sam pays the bills and keeps a sheet of what Priya owes. By October the sheet and Priya were ₹7,910 apart, and neither wanted to go through the other's bank statements.">
                Same argument, smaller flat
              </Heading>
              <p className="mt-6 max-w-[42rem] text-[18px] leading-relaxed text-soft">
                So each of them got an agent. Priya&apos;s read her bills and receipts, Sam&apos;s read his sheet, and they compared bill numbers and
                amounts in one shared chat. Sam&apos;s agent said the rent rise was for Priya&apos;s AC, until Priya&apos;s agent quoted the flat agreement.
                Sam fixed his sheet with one button, and they both signed.
              </p>
            </div>
            <PhotoStage src="/flat.jpg" className="self-start">
              <BillsSheet />
            </PhotoStage>
          </div>
        </section>

        <section id="demo" className={`${wrap} py-28 md:py-36`}>
          <Heading sub="A real run in a local Switch room, cut to under 3 minutes.">See it in one go</Heading>
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
          <span>Seaside Inn, RoomFinder, Priya and Sam are made up. The kinds of bugs are real.</span>
        </div>
      </footer>
    </>
  );
}
