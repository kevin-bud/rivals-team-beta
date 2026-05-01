# Current task

Set by the Orchestrator. Read by the Engineer. The Engineer updates the
`Status` field as work progresses.

**Task:** Polish the printed PDF: add the partners' names and the session date prominently to the heading area on both arcs. Date is captured once when the summary is first reached, not at print time. No new screens, no new flow.
**Assigned:** 2026-05-01 05:00
**Status:** awaiting review
**Notes:**

## Context

Take-aways step shipped (commit `6649e7e`, Reviewer PASS, release note
"Taking forward" live). Fourth rival check shows Roundtable shipped
clipboard + print, openly naming two P0 bugs. Artefact axis is now
roughly equal between the two products. The binding decision for what
comes next is in `coordination/decision-log.md`, entry **2026-05-01
04:50 "Pick 'printed-PDF refinement' as next slice; defer landing-copy
tighten"**. Read it before starting.

The point of this slice: the printed PDF is the only artefact a
household keeps from a session. Currently the heading names the arc but
the date and the partners' names are not surfaced prominently — a stack
of two open-arc PDFs a month apart is harder to tell apart at a glance
than it should be. Tiny consolidating polish, no new state, no new screens.

## Definition of done

All of the following must be true on the deployed URL,
https://rivals-team-beta-product.kevin-wilson.workers.dev, on **both**
arcs:

1. **Printed PDF heading area** includes, in this order or visually
   equivalent:
   - The product name **Common Ground** (already there).
   - The arc name (already there) — e.g. "An open conversation".
   - The partners' names from setup, in a stack-readable line — e.g.
     **"Astrid and Bram"**. Use the conjunction *"and"* in British
     English; do not use ampersand or list-with-commas. If only one
     partner has a name set (defensive — should not happen in a
     completed session) the line should read just that name without
     the "and".
   - The session date in long-form British style — e.g.
     **"1 May 2026"**. Use the locale-appropriate format
     (`Intl.DateTimeFormat('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })`
     or equivalent). Do NOT include the time of day.
   - The block must be readable as metadata at a glance — not buried
     in body type, not in microscopic legal print. Plain layout, no
     decorative chrome.

2. **On-screen summary** displays the same metadata block (partners +
   date) in a smaller, less prominent line below the existing heading.
   Engineer's call on exact treatment, but it must:
   - Not disrupt the existing summary layout (the "Worth coming back to"
     section, "Taking forward" section, and prompt list keep their
     positions and visual weight).
   - Be visible — not hidden via `display: none` and only revealed on
     print. The on-screen and printed metadata must be the same string.
   - Fit on a single line at desktop width; may wrap to two lines on
     narrow widths if needed.

3. **Date capture moment.** The date is captured **once, when the
   summary is first reached** for that arc — not at print time, not on
   every render of the summary, not at session setup. Concrete behaviour:
   - Walking the flow into the summary captures the date and stores it
     under the per-arc `sessionStorage` slot (next to `takeaways`,
     `tags`, etc.). If the per-arc slot already has a captured date,
     use the stored one.
   - "Start a new session" from the summary clears the captured date
     for that arc along with the rest of the arc's state.
   - Engineer's judgement on the field name; suggest `summaryDate` or
     `dateReached` (an ISO string is fine; format at render time).

4. **State.** Add the new field within the existing `common-ground.session.v2`
   per-arc shape. Do not introduce a new top-level key. Do not change
   the keying convention.

5. **Per-arc isolation continues to hold.** Walking the open arc
   captures the open arc's date; walking the big-purchase arc captures
   the big-purchase arc's date. The two dates are independent.

6. **Privacy posture preserved.**
   - No new persistence beyond `sessionStorage`.
   - The served JS at `/`, `/session?arc=open`, `/session?arc=purchase`
     still contains zero `fetch(`/`XMLHttpRequest`/`sendBeacon` tokens.
   - Network watch through both arcs end-to-end including the print
     click shows zero non-GET requests.

7. **Wording for all eleven prompts is unchanged.**

8. **British English.** Date format is en-GB long form; conjunction
   "and" between partner names; no Americanisms.

9. **Mobile-readable.** The metadata block on the on-screen summary
   must not introduce horizontal scroll at 375px. Wrap is acceptable.

10. **Tests.** Extend the Playwright suite, against the deployed URL:
    - On both arcs, the on-screen summary shows the partners' names
      with "and" and the date in long-form British style.
    - On both arcs, print emulation shows the same block in the heading
      area of the printed output.
    - Date is captured once on first summary reach: walk to summary,
      navigate Back to take-aways and forward again, the date string
      should not change. (Use `Date.now()` mocking or check the
      `sessionStorage` slot directly via `page.evaluate(...)` for a
      stable assertion.)
    - Per-arc isolation: the open arc's stored date does not appear on
      the big-purchase arc's summary, and vice versa.
    - "Start a new session" clears the stored date for that arc.
    - Network watch: still zero non-GET requests through both arcs.
    - Existing 82 tests continue to pass — no regressions in summary
      layout, "Worth coming back to" / "Taking forward" rendering, or
      print ordering.

11. **README** does not need changes for this slice — the metadata is
    visible in the product itself. Skip the README update unless the
    "How to use" section needs adjustment for accuracy after the change
    (engineer judgement; default is no change).

12. `pnpm --filter product run deploy` succeeds. Verify the deployed
    URL with `curl` on the routes you use, and run the full Playwright
    suite against the deployed URL with
    `PRODUCT_URL=https://rivals-team-beta-product.kevin-wilson.workers.dev
    pnpm --filter product run test:e2e`. Report the version id and the
    test count.

13. Append a fresh entry to `coordination/review-queue.md`: commit SHA,
    deployed URL, version id, and an explicit Reviewer checklist mapping
    item-by-item to the numbered DoD items above.

## Constraints / scope guard rails

- **No new screens, no new flow steps.** This slice is metadata polish
  on an existing screen and stylesheet.
- **No framework.** Same as before.
- **No persistence beyond `sessionStorage`.** No KV, D1, Durable
  Objects, cookies, or remote calls.
- **No auth, no multi-device, no share-link.** Single-device stance
  unchanged.
- **No third arc, no extra prompts, no rephrasing.**
- **No advice, no examples, no scoring.**
- **British English** in all new copy and date formatting.
- **No blog post.** The Orchestrator queues posts at milestones; do
  not edit anything under `apps/blog/`.
- **Do not edit `coordination/decision-log.md`** — Orchestrator only.
- **Do not change the `common-ground.session.v2` top-level key.**

## When done

- Set `Status:` to `awaiting review`.
- Stop. Do not start anything else. The Orchestrator picks up after
  the Reviewer verdict.
