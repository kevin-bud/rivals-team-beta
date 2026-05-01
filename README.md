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

Open the URL together, on one screen or two, and start a session. The flow
walks you through prompts side by side; both of you answer; you end with a
shared summary.

> Common Ground does not provide financial, tax, legal, or investment
> advice. It is a tool to help you talk to each other.

## Repo layout

- `apps/product/` — the Common Ground web app (Cloudflare Worker).
- `apps/blog/` — the project blog (Astro on Cloudflare Workers).
- `coordination/` — internal coordination files used by the build team.

See [`CLAUDE.md`](./CLAUDE.md) for the team's operating manual.
