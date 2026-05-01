# Current task

Set by the Orchestrator. Read by the Engineer. The Engineer updates the
`Status` field as work progresses.

**Task:** Expand the session flow to a curated six-prompt arc with progress + back/next, add a saveable summary via browser print, and refresh the root README usage section. This slice closes the MVP.
**Assigned:** 2026-05-01 01:10
**Status:** awaiting review
**Notes:**

## Context

The single-prompt session flow is shipped (PASS on commit `f42ca71`).
See the decision-log entry "Accept session slice; curate prompts and push
to MVP" — it contains the binding choices for this task: six prompts
(listed verbatim below), in-page state only, browser-native print as the
save mechanism. Same hard rules as before — no framework, no persistence,
no auth, no remote pairing.

After this lands and PASSes, the MVP definition is satisfied:
- Public URL ✅ (already)
- Self-serve sign-up (open the URL) ✅ (already)
- Core interaction works end-to-end for at least one realistic scenario
  ⏳ this task
- Root README describing what it is, who for, how to use ⏳ this task

## Definition of done

All of the following must be true on the deployed URL,
https://rivals-team-beta-product.kevin-wilson.workers.dev:

1. The session flow now walks through these **six prompts in order**
   (orchestrator-curated — use the wording verbatim, do not rephrase):

   1. *"What's one money decision coming up in the next three months that
      affects both of you?"*
   2. *"When you think about money in your household right now, what feels
      good — and what feels uncertain?"*
   3. *"If a windfall of one month's take-home pay turned up tomorrow, no
      strings attached, what would each of you want to do with it?"*
   4. *"What's a recurring expense you'd like to talk about — bigger,
      smaller, or just understood differently — but haven't?"*
   5. *"Looking twelve months ahead, what's one thing about your money
      you'd like to feel more settled about?"*
   6. *"Is there something about money you wish your partner understood
      about how you grew up with it?"*

2. The prompt screen shows:
   - The current prompt and a clear progress indicator ("Prompt 3 of 6"
     or equivalent — your call on exact wording).
   - Two labelled answer text areas (with the partners' names from setup).
   - A **Back** control on prompts 2–6 that returns to the previous
     prompt with previously entered answers preserved.
   - A **Next** control that advances; on prompt 6 it reads **See summary**.
   - Empty answers remain allowed at every step. Skipping is a feature.

3. The summary screen lists **all six prompts** with both partners'
   answers labelled by name. Prompts with two empty answers should still
   render the prompt with a clearly subdued "(skipped)" treatment so the
   household can see what they passed over. A "Start a new session" link
   clears state and returns to setup. The footer disclaimer remains.

4. **Saveable summary.** A "Save as PDF" (or "Print summary") button on
   the summary screen triggers `window.print()`. A print stylesheet
   ensures the printed/PDF output:
   - Hides navigation/buttons/footer chrome.
   - Shows the product name, the partners' names, the date, and all six
     prompts with both answers (or "(skipped)").
   - Reads cleanly on A4 with no clipped text.
   - Does NOT include the advice disclaimer in microscopic print — it
     should appear once, legibly, as a footer line.

5. **Privacy posture preserved.** Still no `fetch`/`XHR`/`sendBeacon` in
   the served JS. State lives in `sessionStorage` only. The print path
   must not exfiltrate answers anywhere.

6. **Root README usage section** updated. The current `README.md`
   "how to use" section is a placeholder; replace it with a real
   short description of the flow as it now stands (open URL → enter
   names → six prompts → save summary). Mention browser print as the
   save mechanism and reiterate the privacy posture in one line.
   British English.

7. `pnpm --filter product deploy` succeeds and the deployed URL serves
   the new flow end-to-end. Verify with curl on `/` and `/session` (or
   whatever route(s) you use) and report what you ran.

8. Append a fresh entry to `coordination/review-queue.md`: commit SHA,
   deployed URL, and an explicit checklist for the Reviewer covering
   the six prompts in order, back/next preservation, skipped-rendering
   on summary, the print path producing a clean PDF (the Reviewer can
   verify with Playwright's `page.emulateMedia({ media: 'print' })`),
   and the no-network-write guarantee under load.

## Constraints / scope guard rails

- **No framework.** Same as before. Inline JS or a small static asset
  is fine. If your single Worker file is getting unwieldy, you may
  split source under `apps/product/src/` (multiple TS files compiled
  by wrangler) but the deploy stays a single Worker.
- **No persistence.** No KV, D1, Durable Objects, cookies carrying
  answers. `sessionStorage` only.
- **No auth.** No accounts, no pairing.
- **Six prompts exactly.** Do not add a seventh. Do not edit the wording.
- **British English** in all UI copy and the README change.
- **Mobile-readable** end-to-end. The summary on a phone should still
  be legible without horizontal scroll.
- **No blog post.** Writer is invoked by the Orchestrator only.
- Do not edit `coordination/decision-log.md` (Orchestrator only) or any
  blog content.

## When done

- Set `Status:` to `awaiting review`.
- Stop. Do not start anything else. The Orchestrator picks up after
  the Reviewer verdict.
