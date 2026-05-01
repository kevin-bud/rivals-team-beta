# Review queue

The Engineer adds entries here when claiming work is shipped. The Reviewer
processes entries top-down, runs the relevant Playwright tests against the
deployed URL, and writes a verdict.

A claim is not "shipped" until the Reviewer verifies it.

---

## Template

**Commit:** [sha]
**Claim:** What the Engineer says is now working.
**Reviewer verdict:** PASS / FAIL — [reasoning, evidence]

---

## 2026-05-01 — Common Ground landing page shipped

**Commit:** 3bb70467877721e0323f6ca5b5d99711cd1d7954
**Deployed URL:** https://rivals-team-beta-product.kevin-wilson.workers.dev
**Claim:** The placeholder "coming soon" Worker has been replaced with a real
landing page for Common Ground, and the root `README.md` is now product-facing.
The page is live at the URL above and was verified with `curl` after deploy.

**What to verify on the deployed URL:**
- Page loads with HTTP 200 and `content-type: text/html`.
- Contains the product name "Common Ground".
- Contains a one-sentence value proposition framing the product as a tool for
  a household to have a productive conversation about their joint finances,
  together.
- Contains copy making clear it is for two or more people in a household,
  used together (not a single-user dashboard).
- Contains a non-functional "Start a session" call to action (anchor styled
  as a button, `aria-disabled="true"`, with a small note that sessions open
  soon).
- Footer disclaimer reads, in substance: "does not provide financial, tax,
  legal, or investment advice".
- Mobile-readable (single column, `max-width: 38rem`, viewport meta set).
- Copy is in British English.

**Reviewer verdict:** PASS — verified against the deployed URL on 2026-05-01.

Evidence:
- `curl -sI` returned `HTTP/2 200` with `content-type: text/html; charset=utf-8`.
- Playwright suite `apps/product/tests/landing.spec.ts` (9 tests) all green
  against `PRODUCT_URL=https://rivals-team-beta-product.kevin-wilson.workers.dev`
  (1.7s total, chromium).
- Product name: `<title>Common Ground — a household money conversation,
  together</title>`; eyebrow `<p class="eyebrow">Common Ground</p>`; footer
  also names the product.
- Value-prop sentence (`.lede`): "Common Ground helps a household have a
  productive conversation about their joint finances — together, in a single
  sitting."
- Multi-user framing (`.together`): "Built for two or more people in a
  household to use side by side, not a dashboard for one person to log in to
  alone."
- CTA: `<a class="cta" href="#start" role="button" aria-disabled="true">Start
  a session</a>` followed by `<span class="cta-note">Sessions open soon —
  landing page only today.</span>`. `getByRole('button', { name: /start a
  session/i })` matched and the `aria-disabled="true"` assertion passed.
- Disclaimer (`<footer>`): "Common Ground does not provide financial, tax,
  legal, or investment advice. It is a tool to help you talk to each other."
- Mobile readability: `<meta name="viewport" content="width=device-width,
  initial-scale=1" />`; `main { max-width: 38rem }`; at a 375px viewport the
  `main` bounding box width was ≤375px (single column confirmed).
- British English: `<html lang="en-GB">`; copy uses "adviser" (not
  "advisor"); no Americanisms spotted in visible copy.

Note (non-blocking): the existing `tests/smoke.spec.ts` still asserts the
body contains "coming soon" — that assertion is now stale and will fail on
the new page. Not part of this claim's checklist, but the Engineer should
update or delete it on the next pass.

---

## 2026-05-01 — Single-prompt session flow shipped

**Commit:** f42ca71c474991c609e0faba40e4e968c8ed5d64
**Deployed URL:** https://rivals-team-beta-product.kevin-wilson.workers.dev
**Claim:** The "Start a session" CTA on the landing page is now functional and routes to `/session`. The session page steps through three screens — setup (partner names) → one prompt → summary — entirely client-side, with state in `sessionStorage`. No fetches send answer text. The stale `tests/smoke.spec.ts` has been retargeted: it now confirms `/` and `/session` both respond 200 with HTML containing "Common Ground". The deeper landing assertions live unchanged in `tests/landing.spec.ts`, with the CTA test updated for the now-functional anchor (`href="/session"`, no longer `aria-disabled`).

**What to verify on the deployed URL:**

Routes:
- `GET /` returns 200, `content-type: text/html`, body contains "Common Ground" and a working CTA `<a class="cta" href="/session">Start a session</a>` (no `aria-disabled`).
- `GET /session` returns 200, `content-type: text/html`, body contains the three step sections (`#step-setup`, `#step-prompt`, `#step-summary`).
- `GET /anything-else` returns 404.

Setup screen (default `data-active="true"` on load):
- Two text inputs labelled "Your name" and "Your partner's name" with placeholders "You" and "Your partner". Both editable.
- A "Begin" button (`#begin-btn`) advances to the prompt screen.
- Privacy note states answers do not leave the device.

Prompt screen (after Begin):
- Shows a single hardcoded prompt — text contains "What's one money decision coming up in the next three months that affects both of you?".
- Two `<textarea>` boxes, each labelled with the entered names (e.g. "Alex's answer" / "Bea's answer"); falls back to "You" / "Your partner" labels if names are blank.
- "See summary" button (`#see-summary-btn`) advances even when one or both answers are empty.

Summary screen:
- Restates the prompt and shows both answers in named blocks side-by-side at ≥ 36rem viewport, stacked at narrower widths.
- Empty answers render as "(no answer)".
- Lede copy reminds the user the conversation is theirs and Common Ground does not store or interpret it.
- "Start a new session" link (`#restart-link`) returns to the setup screen with all four input fields cleared and `sessionStorage` wiped (`common-ground.session.v1` key removed).

No network writes:
- Stepping through setup → prompt → summary → restart should produce zero `POST`/`PUT`/`PATCH` requests, and no request payload should contain answer text. The page is one Worker-served HTML document with inlined JS and no `fetch`/`XMLHttpRequest`/`navigator.sendBeacon` calls in the source — easy to grep for in `view-source:` of the deployed `/session`.
- `sessionStorage` is the only persistence (key `common-ground.session.v1`).

Disclaimer on every screen:
- Footer on both `/` and `/session` contains "does not provide financial, tax, legal, or investment advice". The footer renders once per page and is visible from any of the three step states.

British English: `<html lang="en-GB">` on both pages; no Americanisms in visible copy.

Mobile readability: viewport meta set; `main { max-width: 38rem }`; the answers grid is single-column below 36rem and two-column at ≥ 36rem.

Smoke test status: `tests/smoke.spec.ts` is now two passing checks, one per route. `tests/landing.spec.ts` had its CTA test updated to assert `href="/session"` instead of `aria-disabled="true"`. All 11 tests pass against `PRODUCT_URL=https://rivals-team-beta-product.kevin-wilson.workers.dev` (verified locally before this entry).

**Engineer evidence:**
- `pnpm --filter product run deploy` succeeded; new version ID `9e311c66-b007-4a94-81c3-c77ed578b0a0`.
- `curl -sI` against `/` and `/session` both returned `HTTP/2 200` with `content-type: text/html; charset=utf-8`. `curl -sI /nope` returned 404.
- `curl -s /` shows `href="/session"` on the CTA anchor (no `aria-disabled`).
- `curl -s /session | grep -E '(step-setup|step-prompt|step-summary|sessionStorage)'` confirmed all three step sections and `sessionStorage` calls are present in the served document.
- Local Playwright run against the deployed URL: 11/11 passing in 1.8s.
- `pnpm --filter product lint` clean; `pnpm --filter product build` clean.

**Reviewer verdict:** _pending_
