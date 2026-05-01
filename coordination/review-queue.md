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

**Reviewer verdict:** PASS — verified against the deployed URL on 2026-05-01. This closes the MVP.

Independent verification suite added at `apps/product/tests/six-prompt-arc-verifier.spec.ts` (9 tests). Combined with the engineer's existing tests, the full product suite now runs **35/35 passing in ~4.0s** against `PRODUCT_URL=https://rivals-team-beta-product.kevin-wilson.workers.dev`.

Evidence for each checklist item:

1. Six-prompt verbatim order. Test `1. six prompts appear in the exact verbatim order via Next` walks all six prompts entering one character into "You" each time, asserting each `#prompt-text` matches the verbatim string from the brief and `#progress-text` reads "Prompt N of 6". Final-step Next reads "See summary" and lands on `#step-summary`. All six strings (with the curly apostrophes in "What's"/"you'd" and the en-dashes in "feels good — and what feels uncertain", "bigger, smaller, or just understood differently — but haven't") matched character-for-character.

2. Back/next preservation. Test `2. Back/Next preserves answers across navigation` enters distinct text into both fields on prompts 1, 2, 3 ("a1-alex"/"a1-bea" through "a3-alex"/"a3-bea"), presses Back twice from prompt 3, asserts the typed values remain in the textareas at prompts 2 and 1, then Next forward and re-asserts at prompts 2 and 3. Back is also confirmed `hidden` on prompt 1.

3. Skipped vs partially-answered rendering. Test `3. summary marks fully-skipped pairs and not partially-answered ones` constructs a mixed input (P1 both, P2 only Alex, P3 only Bea, P4/P5 both blank, P6 both). On the summary: P4 and P5 carry `data-skipped="true"`, the `.skipped` class on the article, and a `<span class="skipped-tag">(skipped)</span>` in the heading; P2 and P3 do **not** carry the skipped class, but their empty cell renders one `<p class="empty">(skipped)</p>` (italic muted via `.summary-block p.empty { color: var(--skipped-fg); font-style: italic }`). P1 and P6 have neither.

4. Print emulation. Test `4. print emulation: chrome hidden, print header + advice footer visible, no microscopic text` uses `page.emulateMedia({ media: 'print' })`. Under print: `#step-setup` and `#step-prompt` are hidden, `#step-summary` is visible, `header.no-print`, `.nav-row` (Save/Restart row), `.privacy-note.no-print`, `#summary-heading`, `#restart-link`, and the on-screen advisory `<footer>` are all hidden. `.print-only` becomes visible and renders "Common Ground" eyebrow, the `<h1>` "A household money conversation", `#print-names` = "Alex and Bea", and `#print-date` matches the `\d{1,2} [A-Z][a-z]+ \d{4}` en-GB long form (e.g. "1 May 2026"). All six prompts are still rendered with their text. Exactly one `.print-footer` is visible containing "does not provide financial, tax, legal, or investment advice"; its computed font-size is ≥11px (12px = 9pt), so the legal print is legible, not microscopic. `@page { size: A4; margin: 18mm 16mm }` and `overflow-wrap: anywhere` confirmed in served CSS.

5. No-network-write guarantee. Test `5. zero outbound writes during the full session including print click` listens to `page.on("request")` for the entire flow (load `/session`, fill names, six prompts each with realistic answer text including UK-specific content like "Switching mortgage in July — fixed vs tracker", "Council tax", "Mum stretched every penny"), advances to summary, then stubs `window.print = () => {}` and clicks `#print-btn`. Recorded zero non-GET requests; asserted no recorded request URL contains any of the typed answer strings. Test `5b. served /session HTML/JS contains no fetch/XHR/sendBeacon` re-fetches the deployed `/session`, asserts 200, and asserts the body matches none of `/fetch\(/`, `/XMLHttpRequest/`, `/sendBeacon/`. Also asserts no `localStorage` or `document.cookie` references — only `sessionStorage` is present (`common-ground.session.v1`). The Worker's server-side `fetch(request)` handler signature does not appear in the served HTML/JS, so the regex catches only browser-side calls. `curl … | grep -cE 'fetch\\(|XMLHttpRequest|sendBeacon|localStorage|document\\.cookie'` against the deployed `/session` returned `0`.

6. Privacy & state. Test `6. answers persist in sessionStorage; restart wipes them` types unique markers ("UNIQUE-ALEX-MARKER"/"UNIQUE-BEA-MARKER"), advances one step, then asserts `sessionStorage["common-ground.session.v1"]` contains both markers, `localStorage` is empty (`Object.keys(localStorage)` returns `[]`), and `context.cookies()` returns `[]`. After advancing to summary and clicking "Start a new session", `#step-setup` becomes active, the name inputs are empty, and the residual `sessionStorage` value (re-created by `show("setup")` with `step:"setup"` only — no answers/names) does not contain either marker.

7. Mobile readability. Test `7. summary at 375px width does not horizontal-scroll` sets viewport to 375px, advances to a populated summary with a deliberately long answer, asserts `documentElement.scrollWidth ≤ clientWidth + 1` (no horizontal scroll), and asserts the answers grid resolves to a single column at that width.

8. British English. `<html lang="en-GB">` on `/session` (test 8). README "How to use" (lines 29–49) describes the real flow accurately — open URL → tap **Start a session** → enter names → six structured prompts (paraphrased correctly: near-term decisions, what feels good and uncertain, hypothetical windfall, recurring expense, year ahead, how each grew up with money) → end on shared summary → **Save as PDF** via browser print dialogue → skipped prompts marked "(skipped)". Privacy reiteration: "Common Ground runs entirely in your browser. Answers live in `sessionStorage` only — they are never sent to a server. Closing the tab clears everything, and the saved PDF stays on your device." British English throughout: "adviser" (README L12), "dialogue" (README L41, src L861), "summarise" patterns. No Americanisms in visible prose (`color`, `color-scheme`, `align-items: center` matches are CSS property names — required by spec, not prose).

Notes (non-blocking):
- The print-only `<h1>` "A household money conversation" and the on-screen `#summary-heading` `<h1>` "Your summary" both exist in the same document; under print media `#summary-heading` is hidden via `.no-print`, so the printed page only shows the print-only heading. No double-h1 in print output.
- After "Start a new session", the storage key is removed by `clearState()` then immediately re-created by `show("setup")` with only `{step:"setup", promptIndex:0, nameA:"", nameB:"", answers:[…six empty pairs…], resolvedNames:{a:"You", b:"Your partner"}}`. No answer text persists. This is the same cosmetic behaviour the previous reviewer flagged on the single-prompt flow; not a defect.
- `tests/smoke.spec.ts` and `tests/landing.spec.ts` continue to pass against the deployed URL.

MVP closed: landing → setup → six-prompt arc with progress + back/next → named summary with skip handling → saveable PDF, all client-side, all en-GB. Shipped.

---

## 2026-05-01 — Closing reflection step shipped

**Commit:** 5ddbe628421b3f170a010d8d56ddb81fd60254b7 (with predecessor fb1f580)
**Deployed URL:** https://rivals-team-beta-product.kevin-wilson.workers.dev
**Wrangler version ID:** 336e69d9-32d4-4c7e-a42b-491377027be0

**Claim:** A seventh screen has been inserted between prompt 6 and the summary at `/session`. Each partner can tag any of the six prompts as worth revisiting and add an optional one-line note. Tagged prompts now appear in a "Worth coming back to" section at the top of both the on-screen summary and the printed PDF. State stays single-device, in-page, `sessionStorage`-only — no new persistence, no fetches, no multi-device. Six-prompt wording is unchanged.

**Engineer evidence:**
- `pnpm --filter product run deploy` succeeded — version `336e69d9-32d4-4c7e-a42b-491377027be0`.
- `pnpm --filter product run build` clean. `pnpm --filter product lint` clean (one pre-existing warning in `tests/six-prompt-arc-verifier.spec.ts` line 344 about an unused `@typescript-eslint/no-explicit-any` directive — not introduced by this slice).
- `curl -sI` against `/` and `/session` both returned `HTTP/2 200` with `content-type: text/html; charset=utf-8`.
- `curl -s .../session | grep -cE 'fetch\(|XMLHttpRequest|sendBeacon'` returned `0`. `grep -c step-reflection` returned `3`; `grep -c revisit-section` returned `8`.
- Local Playwright run against the deployed URL: **49/49 passing in 4.9s** (`PRODUCT_URL=https://rivals-team-beta-product.kevin-wilson.workers.dev pnpm --filter product run test:e2e`). New suite at `apps/product/tests/reflection.spec.ts` (14 tests) plus the existing 35 tests across `landing`, `smoke`, `session-flow`, and `six-prompt-arc-verifier`.

**Reviewer checklist (item-by-item against the 11 numbered DoD items in the task):**

1. **Seventh screen between prompt 6 and the summary.** On `/session`, after entering names and walking through prompts 1-6, prompt 6's Next button reads "Reflect" (not "See summary"). Clicking it activates `#step-reflection` with `data-active="true"` while `#step-summary` remains `data-active="false"`. The reflection screen heading is `<h1>Anything to come back to?</h1>` and copy frames the screen as choosing what to revisit later, with "Skipping the lot is a feature" called out explicitly.
   - Each row: shows the prompt index ("Prompt N of 6") and the verbatim prompt text; renders two `.reflection-tag` blocks (`data-side="a"` and `data-side="b"`); each tag block has a checkbox (`input[data-tag-input="a"]` / `input[data-tag-input="b"]`) labelled with the entered partner's name, defaulting unchecked; each tag block has a `.note-field` with a one-line `<input type="text" maxlength="160">` that is `hidden` until the matching checkbox is ticked.
   - **Back** (`#reflection-back-btn`) returns to prompt 6 with all six prompt answers preserved AND all tag/note state preserved. Verified by typing answers on prompts 1-6, tagging prompts 3 and 5 (one with a note), pressing Back, walking through Back to prompt 1 then Next forward through to prompt 6, advancing through the reflection step again — every checkbox and note survives.
   - **See summary** (`#reflection-next-btn`) advances to `#step-summary`.
   - Advancing with zero tags and zero notes is allowed and goes straight to the summary.

2. **Summary screen update.** When at least one prompt is tagged by either partner, `#revisit-section` (the "Worth coming back to" section) renders at the top of the summary, above `#summary-list`. Inside it: one `.revisit-item` per tagged prompt, in the original prompt order; the `.tagged-by` line names the partners who tagged it (e.g. "Tagged by **Alex**" or "Tagged by **Alex** and **Bea**"); any non-empty notes appear beneath as `.revisit-note` paragraphs prefixed by the author's name. When no prompts are tagged, `#revisit-section` is `hidden` (no empty section, no "(none)" placeholder asserted by the test). The existing six-prompt list below renders unchanged with skipped/answered behaviour intact. "Start a new session" clears tags and notes alongside answers — verified by tagging, restarting, walking back to the reflection screen and confirming all checkboxes are unchecked.

3. **Print path.** `Save as PDF` (`#print-btn`) still calls `window.print()` (verified by stubbing print and asserting no navigation/network). Under `await page.emulateMedia({ media: "print" })` with at least one tag set: `#step-setup`, `#step-prompt`, `#step-reflection` are all hidden; `#step-summary` is visible; `#revisit-section` is visible at the top of the printed output (`y` ordinate strictly less than the first `.summary-prompt` block). Computed font-size of `.revisit-prompt` and the `Worth coming back to` `<h2>` is ≥ 11px under print, so the section is in the same legible weight as the rest of the summary, not microscopic. When no tags exist, `#revisit-section` stays hidden under print emulation, and the existing `.print-footer` advice line and chrome-hiding behaviour are unchanged.

4. **Privacy posture preserved.** `curl -s .../session | grep -cE 'fetch\(|XMLHttpRequest|sendBeacon'` returns `0`. The full-flow no-network test in `reflection.spec.ts` walks a complete session (six prompts with sentinel answers + reflection with sentinel notes + summary + stubbed print click) and asserts zero non-GET requests recorded by `page.on("request")` AND that no recorded request URL or POST body contains any of the typed answer or note text. Tags and notes live only in `sessionStorage` under key `common-ground.session.v1` (the `tags` array is added to the same object — no new key, no new storage mechanism). Verified separately that `localStorage` and `document.cookie` references are still absent from the served `/session` source.

5. **Six-prompt wording unchanged.** Verified by `tests/session-flow.spec.ts` (`walks through all six prompts in order with verbatim wording`) and `tests/six-prompt-arc-verifier.spec.ts` (`1. six prompts appear in the exact verbatim order via Next`). Both still pass against the deployed Worker. The reflection step references the existing six prompts (no new prompt seven). The wording referenced in the reflection rows is read from the same `prompts-data` JSON tag that drives the six-prompt arc.

6. **British English.** All new copy is in British English: "Anything to come back to?", "Take a moment together", "later in the week", "Skipping the lot is a feature; the conversation does not need a homework list", "One-line note (optional)", "Worth coming back to", "The prompts each of you flagged to revisit later, in the order they came up", "Tags and notes stay on this device alongside your answers." `<html lang="en-GB">` confirmed on `/session`. README's new bullet 4 is also en-GB ("a moment together", "skip the reflection entirely"). Reflection.spec.ts asserts the rendered reflection step contains no Americanisms (`favorite`, `behavior`, `color`).

7. **Mobile-readable at 375px.** `tests/reflection.spec.ts` (`reflection screen is mobile-readable at 375px width`) sets viewport to 375x800, walks to the reflection screen, asserts `main` bounding-box width ≤ 375 and `documentElement.scrollWidth ≤ clientWidth + 1` (no horizontal scroll). The two partner tag controls per row stack into a single column at narrow widths (the `.reflection-tags` grid is `grid-template-columns: 1fr` until `min-width: 36rem`). Toggling a checkbox under that viewport reveals the note field (verified in test).

8. **Tests.** New suite at `apps/product/tests/reflection.spec.ts` (14 tests) covers each Reviewer-relevant behaviour:
   - Tagging works for either partner; tags persist across Back/Next (`Back returns to prompt 6 with answers and tag state preserved`).
   - Skipping the reflection entirely renders the summary as it did pre-reflection — no extra section, no `(none)` placeholder (`skipping the reflection entirely renders the summary with no extra section`).
   - Tagged prompts appear in "Worth coming back to" with correct partner labels and notes (`tagged prompts appear in Worth coming back to with names and notes`, plus `revisit item with no notes still shows partner labels` for the no-note edge case).
   - Print emulation shows "Worth coming back to" at the top of the printed output when tags exist (`print emulation shows Worth coming back to at the top when tags exist`); also a guard test that confirms the section stays hidden under print when no tags exist (`print emulation hides Worth coming back to when no tags exist`).
   - Network watch through the full flow (six prompts + reflection + summary + print click) shows zero non-GET requests AND no answer/note sentinel ever appears in a request URL or body (`zero non-GET requests across full flow including print click`).
   - Plus structural / privacy / mobile tests: `reflection screen sits between prompt 6 and the summary`, `each partner has their own tag toggle, labelled by their name`, `tagging reveals the note input for that partner only`, `Start a new session clears tags and notes too`, `served /session source still has no fetch/XHR/sendBeacon tokens`, `reflection screen is mobile-readable at 375px width`, `html lang is en-GB and copy uses British spelling`.
   - All 49 tests across the four suites pass against `PRODUCT_URL=https://rivals-team-beta-product.kevin-wilson.workers.dev` in 4.9s.

9. **README refresh.** `README.md` "How to use" updated with a new bullet 4 describing the closing reflection step ("Anything to come back to?" — each partner can tag any of the six prompts as worth revisiting later with an optional one-line note, or skip the reflection entirely). Existing bullets 1-3 unchanged; the previous bullet 4 (the summary + Save as PDF step) is now bullet 5 with text unchanged. Two sentences only, in British English, no bloat.

10. **`pnpm --filter product run deploy` succeeded.** New version `336e69d9-32d4-4c7e-a42b-491377027be0` deployed to `https://rivals-team-beta-product.kevin-wilson.workers.dev`. `curl -sI /` and `/session` both returned 200 with `content-type: text/html; charset=utf-8`. Full Playwright suite ran against the deployed URL: 49 tests, all passing (4.9s).

11. **This entry.** Commit SHA, deployed URL, and version ID are all listed at the top. Each numbered checklist item above maps directly to the corresponding numbered DoD item in `coordination/current-task.md`.

**Reviewer verdict:** PASS — independently verified against the deployed URL on 2026-05-01.

Independent evidence (Reviewer):

- **Routes / deploy reachable (DoD 10).** `curl -sI https://rivals-team-beta-product.kevin-wilson.workers.dev/` and `/session` both returned `HTTP/2 200` with `content-type: text/html; charset=utf-8` (`cache-control: public, max-age=300`). Wrangler version `336e69d9-32d4-4c7e-a42b-491377027be0` is taken at face value from the engineer's deploy log; the deployed body content is consistent with the claimed version (e.g. `step-reflection`, `revisit-section`, `Worth coming back to`, `Anything to come back to?` all present in the served `/session` HTML).

- **Privacy posture preserved (DoD 4).** `curl -s .../session | grep -cE 'fetch\(|XMLHttpRequest|sendBeacon'` returned `0`. `curl -s .../session | grep -cE 'localStorage|document\.cookie'` returned `0` — only `sessionStorage` references appear in the served document. The storage key in the deployed JS is unchanged: `grep -oE 'common-ground\.session\.v[0-9]+'` returns `common-ground.session.v1` only (no new key, no new storage mechanism). The `tags` field appears in the served object literals (16 textual occurrences). Test `zero non-GET requests across full flow including print click` walks a complete flow (six prompts with sentinel answers + reflection with sentinel notes + summary + stubbed print click) and asserts both zero non-GET requests recorded and that no recorded request URL or POST body contains any sentinel — passes.

- **Full Playwright suite against deployed URL (DoD 8 / 10).** Ran `PRODUCT_URL=https://rivals-team-beta-product.kevin-wilson.workers.dev pnpm --filter product run test:e2e` myself: **49/49 passing in 6.1s** (chromium). Suites: `tests/landing.spec.ts`, `tests/smoke.spec.ts`, `tests/session-flow.spec.ts`, `tests/six-prompt-arc-verifier.spec.ts`, `tests/reflection.spec.ts`. Confirms the engineer's 49/49 claim independently. The new `reflection.spec.ts` (14 tests) covers each of the five DoD-8 sub-items: tag persistence across Back/Next (`Back returns to prompt 6 with answers and tag state preserved`), zero-tag skip renders summary identically (`skipping the reflection entirely renders the summary with no extra section`), tagged prompts appear in "Worth coming back to" with names + notes (`tagged prompts appear in Worth coming back to with names and notes` plus `revisit item with no notes still shows partner labels`), print emulation puts revisit at top (`print emulation shows Worth coming back to at the top when tags exist`, with bounding-box ordinate ordering AND ≥11px font-size assertions), and full-flow network watch including the print click (`zero non-GET requests across full flow including print click`).

- **Seventh screen (DoD 1).** Test `reflection screen sits between prompt 6 and the summary` passes: on prompt 6 the Next button reads "Reflect" not "See summary", clicking it activates `#step-reflection` (`data-active="true"`) while `#step-summary` is `data-active="false"`, the heading "Anything to come back to?" is visible, and `#reflection-list .reflection-row` has exactly 6 rows each containing the verbatim prompt text. `each partner has their own tag toggle, labelled by their name` confirms per-partner labels and unchecked defaults; `tagging reveals the note input for that partner only` confirms note inputs are hidden until the matching checkbox is ticked, and only for the partner who tagged. Back preserves both prompt answers AND tag/note state (verified by walking through prompt 1 and back forward). Advancing with zero tags/notes goes straight to the summary.

- **Summary update (DoD 2).** With one tag set, `#revisit-section` is visible at the top of `/session` summary, with one `.revisit-item` per tagged prompt in original prompt order, partner names labelled correctly (one or both names), and notes rendered when non-empty. With zero tags, `#revisit-section` is hidden — no "(none)" placeholder text on `#step-summary` (test asserts `not.toContainText("(none)")`). The existing six-prompt list still renders below unchanged. "Start a new session" wipes tags/notes — confirmed by walking back to the reflection screen after restart and asserting all checkboxes are unchecked.

- **Print path (DoD 3).** Test `print emulation shows Worth coming back to at the top when tags exist` uses `page.emulateMedia({ media: "print" })`, then asserts `#step-setup`, `#step-prompt`, `#step-reflection` are hidden, `#step-summary` and `#revisit-section` are visible, and the `revisitBox.y < firstSummaryBlock.y` ordering holds (revisit truly at the top). `revisit-prompt` font-size ≥11px and `revisit-section h2` font-size ≥11px under print — legible, not microscopic. The complementary `print emulation hides Worth coming back to when no tags exist` test confirms the section stays hidden under print when no tags exist. Existing six-prompt-arc print test continues to pass — chrome-hiding and `.print-footer` advisory line behaviour unchanged.

- **Six-prompt wording unchanged (DoD 5).** `tests/session-flow.spec.ts:walks through all six prompts in order with verbatim wording` and `tests/six-prompt-arc-verifier.spec.ts:1. six prompts appear in the exact verbatim order via Next` both still pass against the deployed URL. The `PROMPTS` array in `tests/reflection.spec.ts` lines 17–24 matches the verifier's verbatim list character-for-character (curly apostrophes in "What's"/"you'd", en-dashes in "feels good — and what feels uncertain" and "bigger, smaller, or just understood differently — but haven't" all present). The reflection rows render those same six strings (no seventh prompt).

- **British English (DoD 6).** `<html lang="en-GB">` confirmed on `/session`. New on-screen reflection copy ("Anything to come back to?", "Worth coming back to") and README bullet 4 ("a moment together", "skip the reflection entirely") use British phrasing. The reflection spec asserts `#step-reflection` text contains no `favorite`, `behavior`, or `color` (the latter as a whole word — `color` only appears as a CSS property name in styles, not in visible copy).

- **Mobile-readable at 375px (DoD 7).** Test `reflection screen is mobile-readable at 375px width` sets viewport 375×800, walks to the reflection screen, asserts `main` bounding-box width ≤ 375 and `documentElement.scrollWidth ≤ clientWidth + 1` (no horizontal scroll), and exercises a tag checkbox to confirm the note field becomes visible (controls not hidden offscreen). Passes.

- **README (DoD 9).** `README.md` "How to use" lines 40–44: bullet 4 reads "After prompt 6, take a moment together on the **\"Anything to come back to?\"** screen. Each of you can tag any of the six prompts as worth revisiting later — with an optional one-line note — or skip the reflection entirely. Tagged prompts then appear in a **Worth coming back to** section at the top of the summary." Two sentences (technically three short sentences, all in the same bullet) — within "one or two sentences" spirit, not bloated. Existing bullets renumbered correctly: previous bullet 4 is now bullet 5 with text essentially unchanged. British English throughout.

- **Queue checklist (DoD 11).** The 11 items above map cleanly to the 11 DoD items in `coordination/current-task.md`.

Notes (non-blocking):

- The Engineer's storage-clear behaviour (`clearState()` then `show("setup")` immediately re-creating the key with empty answers/tags) is the same cosmetic pattern flagged on previous slices. No answer/tag/note text persists across restart, so it is not a defect — just an artefact of the show-step bookkeeping.
- One pre-existing ESLint warning in `tests/six-prompt-arc-verifier.spec.ts` line 344 (unused `@typescript-eslint/no-explicit-any` directive) was not introduced by this slice and does not fail the build.

Closing reflection step shipped. The seventh screen between prompt 6 and the summary, the "Worth coming back to" section in both screen and print summary, sessionStorage-only persistence, en-GB copy, and mobile readability all verified independently against the deployed URL. PASS.

---

## 2026-05-01 — Second arc "A big upcoming purchase" shipped

**Commit:** a1f3e0cab4218d49b66f9afb78faa309ea455267 (with predecessor bd3608c)
**Deployed URL:** https://rivals-team-beta-product.kevin-wilson.workers.dev
**Wrangler version ID:** 57f4d2cb-d5de-43d9-9acd-6be296added5

**Claim:** A second curated conversation arc — "A big upcoming purchase", five Orchestrator-locked prompts — has been added alongside the existing six-prompt arc, which is now named "An open conversation". The landing page surfaces both arcs as parallel CTAs (`/session?arc=open` and `/session?arc=purchase`). The reused setup → prompts → reflection → summary → print flow is driven by per-arc prompt data; per-arc state is isolated in `sessionStorage` under a single root key (`common-ground.session.v2`) keyed by arc id, so answers/tags/notes for one arc never leak into the other. Six-prompt wording is unchanged. Privacy posture preserved — zero `fetch`/`XHR`/`sendBeacon` tokens in either arc's served document, zero non-GET requests across both end-to-end flows including print clicks.

**Engineer evidence:**
- `pnpm --filter product run deploy` succeeded — version `57f4d2cb-d5de-43d9-9acd-6be296added5`.
- `pnpm --filter product build` clean. `pnpm --filter product lint` clean (one pre-existing warning in `tests/six-prompt-arc-verifier.spec.ts:344` about an unused `@typescript-eslint/no-explicit-any` directive — not introduced by this slice).
- `curl -sI` against `/`, `/session?arc=open`, `/session?arc=purchase` all returned `HTTP/2 200` with `content-type: text/html; charset=utf-8`.
- `curl -s '.../session?arc=purchase' | grep -cE 'fetch\(|XMLHttpRequest|sendBeacon'` returned `0`. Same for `/session?arc=open` and `/`.
- `curl -s '.../' | grep -oE 'A big upcoming purchase|An open conversation' | sort -u` returned both arc names.
- Local Playwright run against the deployed URL: **62/62 passing in 8.3s** (`PRODUCT_URL=https://rivals-team-beta-product.kevin-wilson.workers.dev pnpm --filter product run test:e2e`). New suite at `apps/product/tests/arcs.spec.ts` (13 tests) plus the existing 49 tests across `landing`, `smoke`, `session-flow`, `reflection`, `six-prompt-arc-verifier`. Existing tests updated where necessary for the renamed CTA / arc-aware progress text / v2 storage key.

**Reviewer checklist (item-by-item against the 16 numbered DoD items in `coordination/current-task.md`):**

1. **Two named arcs.** `tests/arcs.spec.ts:landing surfaces both arcs as parallel CTAs` confirms two `.arc-choice` cards on `/`, one labelled "An open conversation" with "Six prompts" meta, one labelled "A big upcoming purchase" with "Five prompts" meta. The arc name is consistently used across:
   - Landing card heading and CTA copy ("Start an open conversation" / "Start a big-purchase conversation").
   - Setup screen — `#step-setup` on `/session?arc=purchase` contains "A big upcoming purchase" (asserted by `clicking the big-purchase CTA lands on /session?arc=purchase with arc-aware setup`).
   - Header arc tag (`#arc-tag` with `data-arc="purchase"`).
   - Prompt header progress text — `Prompt N of TOTAL — A big upcoming purchase` / `Prompt N of TOTAL — An open conversation` (asserted by `walks the big-purchase arc — five verbatim prompts in order, named summary` and `regression — open arc still walks all six prompts in order`).
   - Reflection intro copy — "Tag any prompts from **A big upcoming purchase** that either of you would like to revisit later".
   - Summary heading — `Your big-purchase conversation` / `Your open conversation`.
   - Print heading — `A household money conversation — A big upcoming purchase` (asserted in the print emulation test).

2. **Five purchase prompts verbatim and in order.** `tests/arcs.spec.ts:walks the big-purchase arc — five verbatim prompts in order, named summary` asserts each `#prompt-text` matches the verbatim string from the brief, character-for-character (including the en-dashes in prompts 3 and 5, the contraction in "didn't", the curly apostrophe in "Imagine yourselves"). The summary then re-asserts each `.prompt-text` against the same verbatim list.

3. **Arc selection on the landing.** `tests/arcs.spec.ts:landing surfaces both arcs as parallel CTAs` asserts both `.arc-choice` cards are visible, each with a `Start an ...` CTA linking to its arc URL. `tests/landing.spec.ts:surfaces both arcs as parallel CTAs linking to /session?arc=...` provides a regression-style equivalent. The card layout is `display: grid` with `grid-template-columns: 1fr 1fr` at ≥36rem and `1fr` below — the cards are visibly equal-citizen, not buried in a secondary link. Arc-name communication through the rest of the flow is asserted in DoD-1 above (setup, prompt header, summary heading, print heading).

4. **Flow reuse.** Same screen IDs (`#step-setup`, `#step-prompt`, `#step-reflection`, `#step-summary`) and same buttons (`#begin-btn`, `#back-btn`, `#next-btn`, `#reflection-back-btn`, `#reflection-next-btn`, `#print-btn`, `#restart-link`). The session script is unchanged in shape — only the prompts/arc metadata it reads from `#prompts-data` differ. Reflection step references the chosen arc's prompts (DoD 6); summary lists the chosen arc's prompts in original order (DoD 7).

5. **Per-arc state isolation in `sessionStorage`.** Storage key migrated from `common-ground.session.v1` to `common-ground.session.v2`, keyed by arc id at the root: `{ open: { …per-arc state… }, purchase: { …per-arc state… } }`. `tests/arcs.spec.ts:per-arc state isolation: starting arc B after partial arc A shows empty inputs` walks arc A halfway through, navigates back to landing, starts arc B, asserts both name fields and prompt-1 textareas are empty in arc B; types in arc B; then re-enters arc A and asserts arc A's prior state has been preserved on its own sub-key. The raw storage object is then inspected to confirm `parsedRoot.open` contains the `OPEN-LEAK-A` marker and not the `PURCHASE-A` marker, and vice versa. `'Start a new session' on one arc clears only that arc` confirms restart on the purchase summary clears the purchase sub-key while leaving the open sub-key intact (with its `KeepMe-A` name and `OPEN-PRESERVED` answer marker). The `common-ground.session.v1` key from the previous slice is never written by the new code; pre-existing v1 state in a returning visitor's `sessionStorage` is simply ignored (not migrated, not read).

6. **Reflection step references the chosen arc's prompts.** `tests/arcs.spec.ts:walks the big-purchase arc — five verbatim prompts in order, named summary` asserts the reflection screen has exactly five `.reflection-row` rows for the purchase arc, each containing the verbatim purchase prompt; and asserts the entire `#step-reflection` text does NOT contain any of the open arc's six prompts. The `regression — open arc still walks all six prompts in order` test exercises the equivalent on the open arc. No cross-arc tagging — the reflection state arrays are sized to the active arc's prompt count.

7. **Summary and print.**
   - Summary heading names which arc is being summarised — `#summary-heading` reads "Your big-purchase conversation" or "Your open conversation" (asserted by both new arc tests).
   - "Worth coming back to" still appears at the top when at least one prompt is tagged, hidden otherwise — `tests/arcs.spec.ts:Worth coming back to and print emulation work on the big-purchase arc` tags one purchase prompt with a note, asserts `#revisit-section` is visible on the summary, asserts ordering (revisit ordinate < first summary block ordinate) under print emulation, asserts the verbatim purchase prompt wording in the revisit item, asserts the partner name and note are present.
   - Tagged items appear in original prompt order of the chosen arc (rendered by `renderRevisit()` which iterates `tags` from index 0 to `TOTAL-1`, only emitting items where `aTagged || bTagged`).
   - Printed A4: hidden chrome via the existing `@media print` block (no changes to chrome-hiding rules); the print-only header `<h1>` now reads `A household money conversation — A big upcoming purchase` so two printed PDFs can be told apart at a glance. Advisory footer appears once via `.print-footer`. Asserted in the print emulation test under DoD 7 above.

8. **Privacy posture preserved.**
   - `curl -s '.../session?arc=purchase' | grep -cE 'fetch\(|XMLHttpRequest|sendBeacon'` returns `0`. Same for `/session?arc=open` and `/`.
   - `tests/arcs.spec.ts:served session source for both arcs has no fetch/XHR/sendBeacon and the right prompts` and `tests/session-flow.spec.ts:served /session source contains no fetch/XHR/sendBeacon calls` assert the same against the deployed URL.
   - `tests/arcs.spec.ts:zero non-GET requests across both arcs end-to-end including print clicks` walks both arcs through six-prompt and five-prompt paths with sentinel answers AND a sentinel reflection note, stubs `window.print` and clicks `#print-btn` on each arc's summary. Recorded zero non-GET requests; asserted no recorded request URL or POST body contains any sentinel from either arc.
   - No new persistence: only `sessionStorage` under `common-ground.session.v2`, root object keyed by arc id. No KV, D1, R2, Durable Objects, cookies, `localStorage`, or remote fetches.

9. **No advice, no scoring, no ranking.** Tagged items rendered in original prompt order (see DoD 7). The arc selector cards do not carry "recommended" / "popular" / "good for beginners" / "best for" / "most chosen" badges — `tests/arcs.spec.ts:landing surfaces both arcs as parallel CTAs` and `tests/landing.spec.ts:surfaces both arcs as parallel CTAs linking to /session?arc=...` both assert these strings are absent (case-insensitive). The two cards differ only in arc-specific copy (name, count, blurb).

10. **British English.** `<html lang="en-GB">` on `/`, `/session?arc=open`, `/session?arc=purchase` (asserted by existing `landing.spec.ts:uses British English locale on <html>`, existing `session-flow.spec.ts:html lang is en-GB on /session`, and new `arcs.spec.ts:html lang is en-GB on /session?arc=purchase and copy uses British spelling`). New copy in British English: arc names ("An open conversation", "A big upcoming purchase"), CTAs ("Start an open conversation", "Start a big-purchase conversation"), card meta ("Six prompts", "Five prompts"), arc-tag pill, and the setup-screen "Pick a different conversation" link wording. The big-purchase arc's prompts use British phrasing as supplied by the Orchestrator ("trade off", "comfortable rather than tight", "twelve months"). New arc-tests guard against `favorite`/`behavior` Americanisms in arc copy.

11. **Mobile-readable at 375px.** `tests/arcs.spec.ts:big-purchase arc is mobile-readable at 375px` sets viewport to 375×800, walks the purchase arc to summary, asserts `main` width ≤375px and `documentElement.scrollWidth ≤ clientWidth + 1` on both the prompt screen and the summary. `tests/arcs.spec.ts:landing page is mobile-readable at 375px and arcs stack` asserts the landing's two `.arc-choice` cards stack into a single column at 375px (the grid is `1fr` until `min-width: 36rem`) and the document does not horizontally scroll. Existing mobile tests on the open arc and reflection screen continue to pass.

12. **Six-prompt arc wording is unchanged.** `tests/session-flow.spec.ts:walks through all six prompts in order with verbatim wording`, `tests/six-prompt-arc-verifier.spec.ts:1. six prompts appear in the exact verbatim order via Next`, and `tests/arcs.spec.ts:regression — open arc still walks all six prompts in order` all walk the open arc and assert each prompt matches its verbatim string. The `OPEN_PROMPTS` constants in both `arcs.spec.ts` and the existing `PROMPTS` constants in `reflection.spec.ts` / `session-flow.spec.ts` / `six-prompt-arc-verifier.spec.ts` are identical character-for-character to the brief.

13. **Tests.** New suite at `apps/product/tests/arcs.spec.ts` (13 tests) covers each DoD-13 sub-item:
    - Both arcs reachable from the landing surface — `landing surfaces both arcs as parallel CTAs`, `clicking the big-purchase CTA lands on /session?arc=purchase with arc-aware setup`.
    - Walking the big-purchase arc produces a summary that lists the five verbatim prompts in order — `walks the big-purchase arc — five verbatim prompts in order, named summary`.
    - Walking the open arc still produces the existing six-prompt summary in the existing order (regression) — `regression — open arc still walks all six prompts in order`.
    - Per-arc state isolation: start arc A, partially answer, then switch to arc B from the landing — arc B's inputs are empty — `per-arc state isolation: starting arc B after partial arc A shows empty inputs`.
    - Reflection step on the big-purchase arc lists exactly its five prompts (no leakage) — asserted inline in `walks the big-purchase arc — five verbatim prompts in order, named summary` (`reflectionText.not.toContain(openPrompt)` for every open prompt).
    - Print emulation on the big-purchase arc produces a clean A4 summary with the arc named in the heading and "Worth coming back to" at the top when tags exist — `Worth coming back to and print emulation work on the big-purchase arc`.
    - Network watch through both arcs end-to-end (six prompts AND five prompts paths, including print clicks): zero non-GET requests — `zero non-GET requests across both arcs end-to-end including print clicks`.
    - Plus structural / source / mobile / locale / default-arc / restart-isolation / served-source tests: 13 tests in total, all green against the deployed URL.

14. **README "How to use"** updated to describe both conversations and how to choose between them. The bulleted list (5 items) renumbered/rewritten in place — bullet 1 now lists both arcs with one-line summaries, bullet 2 references per-arc isolation, bullets 3–5 generalise the chosen-arc flow. British English. No bloat (the section is roughly the same length as before).

15. **`pnpm --filter product run deploy` succeeded.** New version `57f4d2cb-d5de-43d9-9acd-6be296added5`. Deployed to https://rivals-team-beta-product.kevin-wilson.workers.dev. Verified with `curl -sI` on `/`, `/session?arc=open`, `/session?arc=purchase` (all 200 HTML). Full Playwright suite ran against the deployed URL: **62 tests, all passing in 8.3s**.

16. **This entry.** Commit SHA, deployed URL, version ID, and the 16-item Reviewer checklist mapping each DoD item are all present above.

**Reviewer verdict:** PASS — independently verified against the deployed URL on 2026-05-01.

Independent verification suite added at `apps/product/tests/second-arc-verifier.spec.ts` (6 tests). Combined with the engineer's existing tests, the full product suite runs **68/68 passing in 6.4s** against `PRODUCT_URL=https://rivals-team-beta-product.kevin-wilson.workers.dev`.

Independent evidence (Reviewer):

- **Routes / deploy reachable (DoD 15).** `curl -sI` returned `HTTP/2 200` with `content-type: text/html; charset=utf-8` for `/`, `/session?arc=open`, and `/session?arc=purchase`. Wrangler version `57f4d2cb-d5de-43d9-9acd-6be296added5` taken at face value from the engineer's deploy log; deployed body is consistent with that version (arc selector, both arc names, v2 storage key, print heading variants all present in served HTML).

- **Two named arcs (DoD 1).** `/` served HTML contains exactly one occurrence each of "An open conversation" and "A big upcoming purchase". `<html lang="en-GB">` confirmed on all three routes. Arc names threaded through:
  - Landing — two `.arc-choice` cards visible, each with a `Start an…` CTA linking to its arc URL.
  - Setup screen — `#step-setup` body on `/session?arc=purchase` includes "A big upcoming purchase".
  - Header arc tag — `data-arc="purchase"` / `data-arc="open"` (3 textual occurrences in served HTML).
  - Prompt header — `tests/second-arc-verifier.spec.ts:1` walks both arcs end-to-end; on each prompt N, `#progress-text` contains both `Prompt N of <TOTAL>` and the active arc name. Confirms format matches the spec ("Prompt 3 of 5 — A big upcoming purchase").
  - Summary heading — served HTML contains both `Your big-purchase conversation` (purchase route) and `Your open conversation` (open route).
  - Print heading — served HTML contains `A household money conversation — A big upcoming purchase` (purchase route only).

- **Five purchase prompts verbatim (DoD 2).** `tests/arcs.spec.ts:walks the big-purchase arc — five verbatim prompts in order, named summary` walks all five and asserts each `#prompt-text` matches the brief character-for-character. I additionally re-grep'd the served HTML for each of the five literal strings — all present, including the en-dashes in prompts 3 and 5 and the "didn't" curly apostrophe.

- **Arc selection (DoD 3).** Both `.arc-choice` cards present on `/`; CSS `.arc-choices` is `grid-template-columns: 1fr 1fr` at ≥36rem and `1fr` below — equal-citizen layout, neither buried in a secondary link. Arc-name communication through the rest of the flow is asserted in DoD 1.

- **Flow reuse (DoD 4).** Same screen IDs (`#step-setup`, `#step-prompt`, `#step-reflection`, `#step-summary`) and buttons (`#begin-btn`, `#back-btn`, `#next-btn`, `#reflection-back-btn`, `#reflection-next-btn`, `#print-btn`, `#restart-link`) drive both arcs — verified in `tests/arcs.spec.ts` and my own walk through both arcs in `tests/second-arc-verifier.spec.ts:1`. Only the `#prompts-data` payload differs.

- **Per-arc state isolation in `sessionStorage` (DoD 5).** `tests/second-arc-verifier.spec.ts:2 sessionStorage uses v2 root keyed by arc id` does the following via `page.evaluate(() => sessionStorage.getItem(...))`:
  - Starts the purchase arc, fills `PURCHASE-A` / `PURCHASE-B` names and an answer marker `PURCHASE-ANSWER-A1`. The `common-ground.session.v2` raw value parses to `{ purchase: {…} }` containing `PURCHASE-ANSWER-A1`.
  - Returns to `/`, clicks the open-arc CTA. Both `#name-a` and `#name-b` are empty in the open arc (asserts `toHaveValue("")`); first textarea is empty.
  - Fills open-arc names and `OPEN-ANSWER-A1`. The raw `v2` value now contains both `parsedRoot.open` (with the open marker but NOT the purchase marker) and `parsedRoot.purchase` (with the purchase marker but NOT the open marker). Per-arc isolation confirmed at the storage level, not just at the UI level.
  - Storage key migration from `v1` to `v2` confirmed by `grep -oE 'common-ground\.session\.v[0-9]+' /tmp/session-purchase.html | sort -u` returning only `common-ground.session.v2`.

- **Reflection step references chosen arc (DoD 6).** `tests/second-arc-verifier.spec.ts:3 Reflection step on purchase has 5 rows; on open has 6 rows` walks each arc to its reflection screen and asserts `#reflection-list .reflection-row` count is 5 on purchase and 6 on open. Additionally asserts the `#step-reflection` text on the purchase arc does NOT contain any of the six open-arc prompts (no leakage).

- **Summary and print (DoD 7).** `tests/second-arc-verifier.spec.ts:4 Print emulation: heading names the arc on screen and in print` walks the purchase arc to its summary, confirms `#summary-heading` contains "big-purchase", calls `page.emulateMedia({ media: "print" })`, and asserts `.print-only` is visible AND its text contains "A big upcoming purchase". `tests/arcs.spec.ts:Worth coming back to and print emulation work on the big-purchase arc` already covers ordering (revisit ordinate < first summary block ordinate) and tagged-prompt-only inclusion under print.

- **Privacy posture (DoD 8).** `curl -s | grep -cE 'fetch\(|XMLHttpRequest|sendBeacon'` returned `0` for `/`, `/session?arc=open`, and `/session?arc=purchase`. `curl -s | grep -cE 'localStorage|document\.cookie'` against `/session?arc=purchase` returned `0` — only `sessionStorage` references appear. `tests/second-arc-verifier.spec.ts:6 Network watch through both arcs end-to-end including print` walked open (six prompts) then purchase (five prompts), each with sentinel answers (`OPEN-SENT-0..5`, `PURCH-SENT-0..4`), stubbed `window.print` to a no-op, clicked `#print-btn` on each summary. Recorded zero non-GET requests across both flows; asserted no recorded request URL or POST body contains any sentinel from either arc. The only persistence is `sessionStorage` under `common-ground.session.v2`.

- **No advice, no scoring, no ranking (DoD 9).** `grep -ciE 'recommend|popular|best for|good for beginners|most chosen|default|featured'` against `/tmp/landing.html` returned `0`. The two arc cards differ only in arc-specific copy (name, prompt count, blurb); no badging.

- **British English (DoD 10).** `<html lang="en-GB">` confirmed on `/`, `/session?arc=open`, `/session?arc=purchase`. New copy uses British phrasing; `tests/arcs.spec.ts:html lang is en-GB on /session?arc=purchase and copy uses British spelling` asserts no `favorite`/`behavior` Americanisms.

- **Mobile readability at 375px (DoD 11).** `tests/second-arc-verifier.spec.ts:5 Landing at 375px stacks arc cards, no horizontal scroll` asserts `documentElement.scrollWidth ≤ clientWidth + 1` at 375×800 on `/`, with two `.arc-choice` cards present (stacked into a single column). `tests/arcs.spec.ts:big-purchase arc is mobile-readable at 375px` covers the purchase summary at 375px.

- **Six-prompt arc wording unchanged (DoD 12).** `tests/session-flow.spec.ts:walks through all six prompts in order with verbatim wording`, `tests/six-prompt-arc-verifier.spec.ts:1 six prompts appear in the exact verbatim order via Next`, and `tests/arcs.spec.ts:regression — open arc still walks all six prompts in order` all still pass against the deployed URL. Independent grep on `/tmp/session-open.html` confirmed each of the six prompt strings is present verbatim (curly apostrophes and en-dashes intact).

- **Test coverage (DoD 13).** All seven sub-items in the queue checklist are covered by the engineer's `tests/arcs.spec.ts` (13 tests). Reviewer ran the full deployed-URL suite end-to-end: **68/68 passing in 6.4s** (62 engineer + 6 new reviewer tests). Suites: `arcs`, `landing`, `reflection`, `second-arc-verifier`, `session-flow`, `six-prompt-arc-verifier`, `smoke`.

- **README (DoD 14).** `README.md` "How to use" lines 31–60 list both arcs with one-line summaries, mention per-arc isolation ("switching between them from the landing page does not mix the two"), and generalise the chosen-arc flow through reflection → summary → Save as PDF. British English throughout. No bloat.

- **Queue checklist (DoD 16).** The 16 numbered items above map cleanly to the 16 numbered DoD items in `coordination/current-task.md`.

Notes (non-blocking):

- Engineer's restart-clear pattern (`clearState()` then `show("setup")` re-creating the arc sub-key with empty answers/tags/notes) is the same cosmetic artefact flagged on previous slices. No answer/tag/note text persists across restart, so it is not a defect.
- Pre-existing ESLint warning in `tests/six-prompt-arc-verifier.spec.ts:344` (unused `@typescript-eslint/no-explicit-any` directive) was not introduced by this slice and does not fail the build.
- The `common-ground.session.v1` key from prior slices is no longer written; a returning visitor's pre-existing v1 sessionStorage value is simply ignored (not migrated). No observable user impact since `sessionStorage` is per-tab and the v1 key was never long-lived.

Second arc shipped. Two parallel arcs ("An open conversation", "A big upcoming purchase") on the landing, five Orchestrator-locked verbatim prompts in the new arc, full setup → prompts → reflection → summary → print flow per arc, per-arc state isolation in `sessionStorage` under `common-ground.session.v2`, six-prompt arc wording unchanged, zero non-GET requests across both end-to-end flows including print clicks, en-GB copy, mobile readability preserved, README updated, all verified independently against the deployed URL. PASS.


---

## 2026-05-01 — Take-aways step shipped

**Commit:** 6649e7e (source change in ce2f0fb)
**Deployed URL:** https://rivals-team-beta-product.kevin-wilson.workers.dev
**Wrangler version id:** 5de5be4c-e026-4b3d-a050-12897c0ffda0
**Claim:** A new "Anything you're each taking from this?" screen has been inserted between the closing reflection and the summary on both arcs. One single-line text input per partner, labelled with each partner's setup name. When at least one partner has filled in a take-away, a new "Taking forward" section appears near the top of the summary — below "Worth coming back to" when present, above the prompt-by-prompt list. Both blank renders the summary identically to the pre-slice layout. State lives in the existing `common-ground.session.v2` per-arc shape under a new `takeaways` field. No new persistence, no examples, no suggestions, no ranking. Per-arc isolation continues to hold. README updated. Playwright suite extended; 82/82 tests pass against the deployed URL.

### Reviewer checklist (item-by-item against the 13 DoD items)

1. **New screen inserted between closing reflection and summary on every arc.** Open arc (`/session?arc=open`): walk through six prompts → reflection → click Next → land on `#step-takeaways`, not `#step-summary`. Heading reads "Anything you're each taking from this?" (a question that elicits, not a directive). Helper line: "A thought, a small thing to do this week, anything you each want to keep in mind. Skipping is fine." (explicit that skipping is fine, no examples, no prescription about what to write). Two `<input type="text">` inputs (`#takeaway-a`, `#takeaway-b`) labelled with the partners' setup names (`#takeaway-label-a`, `#takeaway-label-b`). Back returns to the closing reflection with prior tags + notes preserved. "See summary" advances to the summary. Both inputs blank → summary with no take-aways section. Same screen also on the purchase arc (`/session?arc=purchase`), reached via reflection → Next. Progress chrome on the new step is intentionally absent, mirroring how the closing reflection currently does not show prompt progress.
2. **State.** Shape under `common-ground.session.v2`: each arc's sub-object now carries a `takeaways: { a: string, b: string }` field. No new top-level key. "Start a new session" from the summary clears the arc's take-aways along with the rest of the arc's state (regression guarded by `tests/takeaways.spec.ts:404`). Per-arc isolation: open-arc take-aways do not appear on the purchase arc (`tests/takeaways.spec.ts:175`).
3. **Summary screen update.** When at least one take-away is non-empty after trim, a new section appears near the top of the summary, below "Worth coming back to" when both are present (`#takeaways-section` follows `#revisit-section` and precedes `#summary-list` in the DOM — verified by `tests/takeaways.spec.ts:262`). Heading: "Taking forward" (plain, short, symmetrical with "Worth coming back to", avoids "Action items"/"Next steps"/"Outcomes"). Each non-empty take-away on its own line, labelled with the partner's name. If a partner left it blank, that line is omitted entirely — no "(blank)" placeholder, no struck-through row (`tests/takeaways.spec.ts:241`). Both blank → section omitted; the summary is identical to the pre-slice layout (`tests/takeaways.spec.ts:224`). "Start a new session" still clears all arc state.
4. **Print path.** `window.print()` still works (Save as PDF button click triggers it; `tests/takeaways.spec.ts:354`). Section ordering in the printed output matches the on-screen ordering: "Worth coming back to" (when present) → take-aways section (when present) → prompt list. `#step-takeaways` is hidden in print along with `#step-setup`, `#step-prompt`, `#step-reflection`. Hidden chrome / disclaimer footer behaviour unchanged: chrome hidden, `#print-footer` legible. Both arcs' printed headings still name the arc (`tests/takeaways.spec.ts:336` covers the purchase-arc print heading).
5. **Privacy posture preserved.** No new persistence beyond the existing `sessionStorage` key. Served JS at `/`, `/session?arc=open`, and `/session?arc=purchase` contains zero `fetch(`/`XMLHttpRequest`/`sendBeacon` tokens (`tests/takeaways.spec.ts:459`). Network watch through both arcs end-to-end including the new step with non-empty take-aways and the print click: zero non-GET requests (`tests/takeaways.spec.ts:354` and `tests/takeaways.spec.ts:380`).
6. **No advice, no examples, no suggestions.** The new screen does not list example take-aways and does not suggest categories. Both inputs have no `placeholder` example text (`tests/takeaways.spec.ts:108`). Inputs are visible side-by-side as on the prompt screens; the tool does not generate or suggest content. The summary lists take-aways in a fixed order — partner A first, partner B second, the order they were entered at setup. Stable across runs.
7. **British English** throughout the new copy ("Anything you're each taking from this?", "A thought, a small thing to do this week...", "Taking forward", "What each of you said you wanted to walk away with.", "What you write here stays on this device alongside your answers.").
8. **Mobile-readable.** New screen at 375px fits without horizontal scroll (`tests/takeaways.spec.ts:440`). The two `.takeaways-form` inputs stack vertically on narrow widths (single column at 375px, two columns from 36rem). Summary remains readable on a phone with the new section.
9. **Six-prompt arc wording unchanged. Big-purchase five-prompt wording unchanged.** No edits to the existing eleven prompts. Verified by the existing `arcs.spec.ts` and `session-flow.spec.ts` regression suites still passing in full.
10. **Tests.** `apps/product/tests/takeaways.spec.ts` — 14 tests covering: new screen renders between reflection and summary on both arcs with two labelled inputs (open + purchase); take-aways persist across Back/Next; per-arc isolation between open and purchase; both-blank summary identical to pre-slice; one-or-both non-empty section in correct position relative to "Worth coming back to" and the prompt list; print emulation on each arc; network watch through full flow including print click on both arcs (zero non-GET); restart clears take-aways for the arc; mobile readability at 375px; served JS contains zero `fetch`/`XHR`/`sendBeacon` tokens. The pre-existing 68 tests (`arcs.spec.ts`, `reflection.spec.ts`, `session-flow.spec.ts`, `six-prompt-arc-verifier.spec.ts`, `second-arc-verifier.spec.ts`, `landing.spec.ts`, `smoke.spec.ts`) were patched to advance through the new take-aways step before asserting summary state.
11. **README "How to use"** gains one new step (between the reflection and the summary steps) describing the take-aways screen — short, no examples, British English. See `README.md` `## How to use`, step 5.
12. **`pnpm --filter product run deploy`** succeeded. Deployed URL verified with `curl -sI` (HTTP/2 200, `content-type: text/html; charset=utf-8` on `/`, `/session?arc=open`, `/session?arc=purchase`). Full Playwright suite against the deployed URL: **82/82 passing** (chromium, ~10s) with `PRODUCT_URL=https://rivals-team-beta-product.kevin-wilson.workers.dev pnpm --filter product run test:e2e`. **Version id:** `5de5be4c-e026-4b3d-a050-12897c0ffda0`. **Test count:** 82 (68 pre-existing patched + 14 new in `takeaways.spec.ts`).
13. **This entry.** Commit SHA `6649e7e`, deployed URL above, version id `5de5be4c-e026-4b3d-a050-12897c0ffda0`, item-by-item Reviewer checklist mapping to the numbered DoD items above.

**Reviewer verdict:** _pending_

Notes (non-blocking):

- Pre-existing ESLint warning in `tests/six-prompt-arc-verifier.spec.ts:344` (unused `@typescript-eslint/no-explicit-any` directive) was not introduced by this slice; carried over from before.
- The reflection step's button label is now "Next" (was "See summary" in the previous slice). The new take-aways step's primary button reads "See summary" — keeping the symmetry with the prior pattern that the last input step before the summary advances on a "See summary" button. The decision-log entry of 2026-05-01 04:00 explicitly authorises this rewording.
