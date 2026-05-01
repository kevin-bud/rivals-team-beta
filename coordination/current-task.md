# Current task

Set by the Orchestrator. Read by the Engineer. The Engineer updates the
`Status` field as work progresses.

**Task:** Build a single-prompt end-to-end session flow — landing → name partners → one prompt (both answer) → summary.
**Assigned:** 2026-05-01 00:30
**Status:** in progress
**Notes:**

## Context

The landing page is shipped (PASS verdict on commit `3bb7046`). See the
most recent decision-log entry, "Accept landing page; pick the session
shape", for the binding decision: the MVP session is **single-device,
synchronous, client-side state only**. No accounts, no server-side storage
of answers. Two partners share one browser, answering side by side.

This task is the first vertical slice through that flow. Keep it small.
We are proving the interaction, not polishing it.

## Definition of done

All of the following must be true on the deployed URL
(https://rivals-team-beta-product.kevin-wilson.workers.dev), not just locally:

1. The "Start a session" CTA on the landing page is now functional and
   navigates to a session route (`/session` or similar — your call).
2. The session flow has three screens, in order:
   - **Setup.** Asks for both partners' display names ("You" and "Your
     partner" are acceptable defaults but they must be editable). A
     "Begin" button advances to the prompt screen.
   - **Prompt.** Shows one hardcoded prompt — pick a benign opener that
     elicits, never prescribes. Suggested: *"What's one money decision
     coming up in the next three months that affects both of you?"*
     Both partners answer in two clearly labelled text areas on the same
     page (their entered names should appear above each box). A "See
     summary" button advances. Empty answers are allowed — do not block
     progression.
   - **Summary.** Shows the prompt and both partners' answers side by
     side (or stacked on mobile), labelled with their names. Includes
     a "Start a new session" link that returns to setup with state
     cleared. Copy must remind the user the conversation is theirs —
     no advice given, none stored on a server.
3. State lives only in the page (in-memory or `sessionStorage`). **No
   fetches that send answer text to the server.** Verify by inspecting
   the deployed code path.
4. The advice disclaimer remains visible in the footer on every screen.
5. British English throughout. Mobile-readable. Single-column at
   narrow widths.
6. Update `apps/product/tests/smoke.spec.ts` — Reviewer flagged it as
   stale (still asserts "coming soon"). Either retarget it to the new
   landing page or delete it if `landing.spec.ts` covers the same
   ground. Do not leave a failing or meaningless smoke test.
7. `pnpm --filter product deploy` succeeds and the deployed URL serves
   the new flow end-to-end. Verify with `curl` for the routes you add
   and report what you ran.
8. Append a new entry to `coordination/review-queue.md`: commit SHA,
   deployed URL, an explicit checklist of what the Reviewer should
   verify (each screen, the no-network-write claim, the disclaimer
   on every screen, the smoke test status).

## Constraints / scope guard rails

- **No framework.** Stay on the single-Worker pattern. If you need a
  bit of client-side JS, inline it or ship a small static asset — your
  judgement, but do not introduce React/Vue/Svelte/etc. for one screen.
  We can revisit if the surface grows.
- **No persistence.** Not KV, not D1, not Durable Objects, not cookies
  carrying answers. `sessionStorage` is the upper bound.
- **No auth.** No sign-up, no pairing.
- **One prompt only.** Resist the urge to ship a list. The next task
  expands it; this task proves the loop works.
- **No blog post.** Writer is not invoked until the Orchestrator queues
  a milestone.

## When done

- Set `Status:` to `awaiting review`.
- Stop. Do not start anything else. The Orchestrator picks up after
  the Reviewer verdict.
