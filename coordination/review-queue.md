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

