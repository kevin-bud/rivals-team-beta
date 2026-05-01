# Common Ground

A tool a household uses *together* to have a productive conversation about
their joint finances.

## What it is

Common Ground is a guided sitting for two or more people in a household.
Both partners step through structured prompts about near-term decisions,
priorities, and concerns, and finish with a shared summary they can keep.

It is **not** a budgeting app, an accounting tool, or a financial adviser.
It surfaces what your household already thinks. It does not tell you what
to do with your money.

## Who it is for

Two or more adults who share some or all of their finances and want to
talk about money more deliberately than they currently do. Not for crisis
situations, and not for solo planners.

## Public URL

<https://rivals-team-beta-product.kevin-wilson.workers.dev>

(URL provisional until the first deploy lands; update if the public hostname
changes.)

## How to use

1. Open the URL together on one device. The landing page now offers two
   conversations side by side — pick the one that fits the sitting:
   - **An open conversation** (six prompts). The original arc — broad
     prompts about near-term decisions, what feels good and uncertain, a
     hypothetical windfall, a recurring expense, the year ahead, and how
     each of you grew up with money.
   - **A big upcoming purchase** (five prompts). A focused arc for a
     household weighing a specific buy — what it is and roughly costs,
     what it would change about your day-to-day, what you'd trade for
     it, what would make it feel comfortable, and where you'd each like
     to be in twelve months.
2. Pop in each partner's name so the prompts and summary can address
   each of you. Two to four of you can sit at one device for the
   conversation — the setup screen starts with two name rows and you
   can **add a partner** for a third or fourth. Each arc keeps its
   own answers — switching between them from the landing page does
   not mix the two.
3. Step through the chosen arc's prompts. Each prompt has one labelled
   answer box per partner, and you can leave any of them empty.
   **Back** and **Next** carry your answers with you; nothing is final
   until you say so.
4. After the final prompt of either arc, take a moment together on the
   **"Anything to come back to?"** screen. Each of you can tag any of
   that arc's prompts as worth revisiting later — with an optional
   one-line note — or skip the reflection entirely. Tagged prompts then
   appear in a **Worth coming back to** section at the top of the
   summary.
5. Then a short **"Anything you're each taking from this?"** screen
   gives each of you one line to capture whatever you want to walk away
   with — a thought, a small thing to do this week, anything at all.
   Skipping is fine; if you do write something, it appears in a
   **Taking forward** section near the top of the summary.
6. End on a shared summary of the chosen arc, headed with its name. Use
   **Save as PDF** to trigger your browser's print dialogue and choose
   "Save as PDF" as the destination — that's how you keep a copy.
   Skipped prompts stay in the summary marked *(skipped)* so you can see
   what you passed over.

The whole sitting takes ten to fifteen minutes for two people.

**Privacy.** Common Ground runs entirely in your browser. Answers live in
`sessionStorage` only — they are never sent to a server. Closing the tab
clears everything, and the saved PDF stays on your device.

> Common Ground does not provide financial, tax, legal, or investment
> advice. It is a tool to help you talk to each other.

## Repo layout

- `apps/product/` — the Common Ground web app (Cloudflare Worker).
- `apps/blog/` — the project blog (Astro on Cloudflare Workers).
- `coordination/` — internal coordination files used by the build team.

See [`CLAUDE.md`](./CLAUDE.md) for the team's operating manual.
