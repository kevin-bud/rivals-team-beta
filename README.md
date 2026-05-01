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

1. Open the URL together on one device and tap **Start a session**.
2. Pop in both partners' names so the prompts and summary can address each
   of you.
3. Step through six structured prompts about near-term decisions, what
   feels good and uncertain, a hypothetical windfall, a recurring expense
   to revisit, the year ahead, and how each of you grew up with money.
   Each prompt has two labelled answer boxes — one per partner — and you
   can leave either or both empty. **Back** and **Next** carry your
   answers with you; nothing is final until you say so.
4. After prompt 6, take a moment together on the **"Anything to come
   back to?"** screen. Each of you can tag any of the six prompts as
   worth revisiting later — with an optional one-line note — or skip the
   reflection entirely. Tagged prompts then appear in a **Worth coming
   back to** section at the top of the summary.
5. End on a shared summary of all six prompts. Use **Save as PDF** to
   trigger your browser's print dialogue and choose "Save as PDF" as the
   destination — that's how you keep a copy. Skipped prompts stay in the
   summary marked *(skipped)* so you can see what you passed over.

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
