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

**Reviewer verdict:** PASS — verified against the deployed URL on 2026-05-01.

Evidence:
- Routes: `curl -sI` returned `HTTP/2 200` with `content-type: text/html; charset=utf-8` for `/` and `/session`; `/nope` returned `HTTP/2 404`.
- New Playwright suite added at `apps/product/tests/session-flow.spec.ts` (10 tests). Full product suite now 21/21 passing in 2.3s against `PRODUCT_URL=https://rivals-team-beta-product.kevin-wilson.workers.dev`.
- Landing CTA: `<a class="cta" href="/session" role="button">Start a session</a>`. `aria-disabled` is absent and clicking the CTA navigates to `/session`. Asserted by `landing CTA navigates to /session and is no longer disabled`.
- Three-screen render: on `/session`, only `#step-setup` has `data-active="true"` on initial load; `#step-prompt` and `#step-summary` are present in the DOM but hidden via `.step { display: none }` until activated. Asserted by `setup is the default active step on /session`.
- Names-entered flow: filled `Alex` / `Bea`, advanced through Begin → See summary. `#label-a` rendered "Alex's answer", `#label-b` "Bea's answer". On the summary, `#summary-name-a`/`#summary-name-b` rendered the entered names and the answers were echoed verbatim into `#summary-answer-a`/`#summary-answer-b`. The prompt text "What's one money decision coming up in the next three months that affects both of you?" is restated on the summary screen.
- Empty-answers flow: with names blank and both textareas empty, Begin and See summary still advance the flow. Labels fall back to "You's answer" / "Your partner's answer" and summary blocks show `(no answer)`. No blocking dialog or validation gate.
- Restart: clicking `#restart-link` returns to `#step-setup`, all four input/textarea values are empty strings, and any residual `sessionStorage["common-ground.session.v1"]` value contains only `step:"setup"` (the answer/name fields are cleared in storage). The engineer's claim of "key removed" is technically slightly off — `clearState()` removes the key, then `show("setup")` immediately re-creates it with `{step:"setup"}`. No answer text persists, so this is cosmetic, not a defect.
- Disclaimer: `<footer>` containing "does not provide financial, tax, legal, or investment advice" is visible on `/` and remains visible on `/session` across all three step states (setup, prompt, summary). The footer sits outside the step containers so it is not affected by step toggling.
- No-network-write guarantee: served `/session` source contains zero `fetch(`, `XMLHttpRequest`, or `sendBeacon` tokens (regex-asserted). Live network capture during a full flow (load → setup → prompt with answer text → summary → restart) recorded no `POST`/`PUT`/`PATCH`/`DELETE` requests of any kind, and no request URL or post-data ever contained the typed answer text. The only persistence is `sessionStorage` under the key `common-ground.session.v1`, confirmed both in the served JS and at runtime.
- Smoke test no longer asserts the stale "coming soon" string; it now confirms `/` and `/session` both return HTML 200 with "Common Ground" in the body. Both checks pass.
- British English: `<html lang="en-GB">` on `/session`; copy uses "summarise"-style phrasing (no Americanisms in visible copy spotted on inspection).
- Mobile readability: `<meta name="viewport" content="width=device-width, initial-scale=1" />`; `main { max-width: 38rem }`; at a 375px viewport the `main` bounding box is ≤375px (single column confirmed). Answers grid is single-column below 36rem and two-column above (CSS `@media (min-width: 36rem)`).

---

## 2026-05-01 — Six-prompt session arc + saveable summary shipped

**Commit:** 38e2d5588f81bcfa8056aef2db1f17fa6d7f6c63 (with predecessor 66d3e12)
**Deployed URL:** https://rivals-team-beta-product.kevin-wilson.workers.dev
**Wrangler version ID:** 59972d66-01f9-4d6f-a260-e0128009f161

**Claim:** The single-prompt session has been expanded to a curated six-prompt arc with progress indicator and back/next preserving previously entered answers. The summary screen lists all six prompts with named answers and renders skipped pairs with a subdued "(skipped)" treatment. A "Save as PDF" button triggers `window.print()`; a print stylesheet hides chrome (header eyebrow, nav, restart link, privacy notes, advisory footer) and surfaces a print-only header with product name + partners + date plus a single legible advisory footer line. State remains in `sessionStorage` only — no `fetch`/`XMLHttpRequest`/`sendBeacon` tokens in the served `/session` JS. Root README "How to use" rewritten to describe the real flow (open URL → enter names → six prompts → save summary) with a one-line privacy reiteration in British English.

**Engineer evidence (already-verified preconditions):**
- `pnpm --filter product run deploy` succeeded — version ID `59972d66-01f9-4d6f-a260-e0128009f161`.
- `curl` against `/` and `/session` both returned HTTP 200.
- `curl -s https://rivals-team-beta-product.kevin-wilson.workers.dev/session | grep -E 'fetch\(|XMLHttpRequest|sendBeacon'` returned no matches (clean). Same for `/`.
- `curl -s .../session | grep -c "money decision coming up"` returned `1` (prompt 1 wording present verbatim).
- Local Playwright run against the deployed URL: **26/26 passing in 3.3s** (`PRODUCT_URL=https://rivals-team-beta-product.kevin-wilson.workers.dev pnpm --filter product run test:e2e`). Suite includes new tests covering verbatim six-prompt order, back-button preservation, edit-then-back preservation, advancing with empty answers, named summary, no `fetch`/`XHR`/`sendBeacon` in source, no network writes during a full flow, print emulation hiding chrome, and the print stylesheet being part of the served document.

**What to verify on the deployed URL (Reviewer checklist):**

Six prompts in order (verbatim wording — no rephrasing):
1. "What's one money decision coming up in the next three months that affects both of you?"
2. "When you think about money in your household right now, what feels good — and what feels uncertain?"
3. "If a windfall of one month's take-home pay turned up tomorrow, no strings attached, what would each of you want to do with it?"
4. "What's a recurring expense you'd like to talk about — bigger, smaller, or just understood differently — but haven't?"
5. "Looking twelve months ahead, what's one thing about your money you'd like to feel more settled about?"
6. "Is there something about money you wish your partner understood about how you grew up with it?"

Confirm they appear in this exact order, advanced via the Next button, with a progress indicator reading "Prompt N of 6" at each step.

Back/next preserves previously entered answers:
- On prompt 1, the Back button is hidden. On prompts 2–6, Back is visible and returns to the previous prompt with both partners' previously typed answer text intact in the textareas.
- Editing an answer on prompt N, advancing to N+1, then pressing Back, should still show the edited (post-edit) value — not a stale earlier value.
- On prompt 6, the Next button reads "See summary" and routes to the summary screen.

Skipped treatment on summary:
- A prompt where both partner answers are empty must still appear on the summary, with a clearly subdued "(skipped)" tag in the heading row, the prompt text de-emphasised (`.summary-prompt.skipped`), and each empty answer cell rendered as `(skipped)` in italic muted text.
- A prompt where one partner answered and the other did not should NOT be globally marked skipped; only the empty cell shows `(skipped)`.

Print path produces a clean A4 PDF (suggest verifying with `await page.emulateMedia({ media: 'print' })` and asserting visibility):
- The "Save as PDF" button (`#print-btn`) calls `window.print()`. Pressing it should not navigate or trigger any network request.
- Under `print` media: the setup and prompt steps are hidden (`#step-setup`, `#step-prompt` set to `display: none`); the summary step is forced visible. Navigation chrome (`.no-print`, `.nav-row`, `.progress`, `.progress-bar`, `.privacy-note`, `.restart`, the header eyebrow, the on-screen advisory `<footer>`) is hidden.
- A print-only header (`.print-only`) becomes visible and shows: the product name "Common Ground", an `<h1>` "A household money conversation", and a meta line of `partner names · date` (e.g. "Alex and Bea · 1 May 2026"). Date format is en-GB long form.
- All six prompts render in the print output with both answers (or "(skipped)") and read cleanly on A4 (`@page { size: A4; margin: 18mm 16mm }`). Long answers wrap (`overflow-wrap: anywhere`) — no clipped text.
- The advice disclaimer appears once, legibly (9pt, muted), as `.print-footer` at the end of the summary — NOT as the on-screen advisory `<footer>`, which is hidden in print.

No-network-write guarantee under load:
- `curl -s https://rivals-team-beta-product.kevin-wilson.workers.dev/session | grep -E 'fetch\(|XMLHttpRequest|sendBeacon'` returns zero matches.
- During a complete flow (load `/session` → fill names → step through all six prompts with realistic answer text on at least 2 of them → click "See summary" → click "Save as PDF") record live network traffic. There must be zero `POST`/`PUT`/`PATCH`/`DELETE` requests, no request URL or body containing typed answer text, and no third-party requests of any kind. The only persistence is `sessionStorage` under key `common-ground.session.v1`.
- The `Save as PDF` click in particular must not fire any request.

Other:
- Footer disclaimer on `/` unchanged. On `/session`, the on-screen advisory footer is visible across setup, prompt, and summary states (only hidden when print media is emulated).
- `<html lang="en-GB">` on both routes; British English in copy ("dialogue", "summary", etc.).
- Root README "How to use" reflects the new flow (open URL → enter names → six prompts → save summary) with a one-line privacy reiteration. Mention of browser print as the save mechanism present.
- Mobile readability preserved: at 375px viewport the answers grid is single-column; at ≥36rem it goes two-column.
