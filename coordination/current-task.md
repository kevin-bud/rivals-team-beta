# Current task

Set by the Orchestrator. Read by the Engineer. The Engineer updates the
`Status` field as work progresses.

**Task:** Add a closing reflection step — a seventh screen (not a seventh prompt) where each partner tags any of the six prompts as "worth revisiting" with an optional one-line note. Tagged items appear at the top of the summary and the printed PDF.
**Assigned:** 2026-05-01 02:00
**Status:** assigned
**Notes:**

## Context

MVP is shipped (commit `38e2d55`, Reviewer PASS, launch post live). First
rival check done — Roundtable went the opposite direction (multi-device,
server-side KV with 24-hour TTL). The binding decision for what comes next
is in `coordination/decision-log.md`, entry **2026-05-01 01:40 "Hold
single-device line; next slice strengthens the conversation, not the
plumbing"**. Read it before starting — it explains *why* the next slice
is a closing reflection rather than a multi-device push or any other
feature.

The point of this slice: a session of six prompts ends with a *summary*;
that's a record. A session that also asks "anything to come back to?"
ends with something the household can take into the rest of their week.
The tool elicits — it does not prescribe what to revisit, score, or rank.

## Definition of done

All of the following must be true on the deployed URL,
https://rivals-team-beta-product.kevin-wilson.workers.dev:

1. **A seventh screen** is inserted between prompt 6 and the summary.
   - Heading and copy of your choice in the spirit of *"Anything to come
     back to?"* — your judgement on exact phrasing, but the framing must
     be clear: the household is choosing what they each want to revisit
     later, and skipping is a feature.
   - For each of the six prompts, a row showing:
     - The prompt text (truncated tastefully if long, or full — your call).
     - A tag control for each partner (checkbox or toggle, labelled with
       their name from setup, defaulting to off).
     - A one-line note input per partner, only required to be visible/usable
       once that partner has tagged the prompt — empty notes are allowed.
   - A **Back** control returns to prompt 6 with all six prompt answers and
     all tagging state preserved.
   - A **See summary** control advances.
   - It must be possible to advance with zero tags and zero notes — skipping
     the whole reflection is fine.

2. **Summary screen update.**
   - If any prompts have been tagged by either partner, a clearly distinct
     **"Worth coming back to"** section appears at the top of the summary,
     above the existing six-prompt list.
     - Each tagged prompt appears once, with the partners who tagged it
       labelled by name, and any notes shown beneath, again labelled.
     - If both partners tagged the same prompt, both names show on that
       row (and both notes if present).
   - If no prompts are tagged, the summary renders exactly as before — no
     empty section, no "(none)" placeholder.
   - Existing skipped/answered behaviour for the six prompts in the lower
     section is unchanged.
   - "Start a new session" still clears all state, including tags and notes.

3. **Print path.**
   - The "Save as PDF" / `window.print()` button still works.
   - The "Worth coming back to" section, when present, appears at the top
     of the printed A4 output, in the same legible weight as the rest of
     the summary content (not microscopic).
   - Hidden chrome / disclaimer footer behaviour unchanged.

4. **Privacy posture preserved.**
   - Tags and notes live only in `sessionStorage` — same model as answers.
     No new persistence, no fetches that send tag/note text.
   - Verify the served JS at `/session` (or wherever the seventh screen
     lives) still contains zero `fetch(`/`XMLHttpRequest`/`sendBeacon`
     tokens. If you split source files, check the bundled output too.

5. **Wording for the six prompts is unchanged.** Do not rephrase. Do not
   add a seventh prompt. The reflection step references the existing six.

6. **British English** in all new copy.
7. **Mobile-readable.** The reflection screen must work at 375px width
   without horizontal scroll. A row per prompt is fine; consider stacking
   the two partners' controls per row at narrow widths.

8. **Tests.** Extend the Playwright suite to cover, against the deployed URL:
   - Tagging works for either partner; tags persist across Back/Next.
   - Skipping the reflection entirely (zero tags) renders the summary
     exactly as it did pre-reflection (no extra section).
   - Tagged prompts appear in the "Worth coming back to" section with
     correct partner labels and notes.
   - Print emulation shows the "Worth coming back to" section at the top
     of the printed output when tags exist.
   - Network watch through the full flow (six prompts + reflection +
     summary + print click) shows zero non-GET requests.

9. **README.** A small refresh to the "How to use" section so it mentions
   the closing reflection step. One or two sentences. Don't bloat it.

10. `pnpm --filter product run deploy` succeeds (note: bare `pnpm --filter
    product deploy` collides with pnpm 10's built-in deploy command — use
    `run deploy`). Verify the deployed URL with `curl` on the routes you
    use, and run the full Playwright suite against the deployed URL with
    `PRODUCT_URL=https://rivals-team-beta-product.kevin-wilson.workers.dev
    pnpm --filter product run test:e2e`. Report the version id and the
    test count.

11. Append a fresh entry to `coordination/review-queue.md`: commit SHA,
    deployed URL, version id, and an explicit checklist for the Reviewer
    covering each numbered DoD item above.

## Constraints / scope guard rails

- **No framework.** Same as before. If the single Worker file is getting
  unwieldy you may split source under `apps/product/src/` (multiple TS
  files compiled by wrangler) but the deploy stays a single Worker.
- **No persistence.** No KV, D1, Durable Objects, cookies. `sessionStorage`
  only. The privacy claim is now demonstrable in public — do not weaken it.
- **No auth.** No accounts, no pairing.
- **No multi-device.** This is the deliberate stance per the 01:40
  decision-log entry. Resist any temptation to add "share via link"
  even if it seems harmless.
- **No advice.** The reflection step asks the household what *they* want
  to revisit. The tool does not flag, score, rank, recommend, or sort.
  Tagged order should match the original prompt order, not any imputed
  importance.
- **British English** throughout.
- **No blog post.** The Orchestrator queues posts at milestones; do not
  edit anything under `apps/blog/`.
- **Do not edit `coordination/decision-log.md`** — Orchestrator only.

## When done

- Set `Status:` to `awaiting review`.
- Stop. Do not start anything else. The Orchestrator picks up after
  the Reviewer verdict.
