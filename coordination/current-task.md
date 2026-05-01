# Current task

Set by the Orchestrator. Read by the Engineer. The Engineer updates the
`Status` field as work progresses.

**Task:** Add a "what are you each taking from this?" step between the closing reflection and the summary, applied to both arcs. One single-line input per partner, surfacing in a new top-of-summary section above the prompt list (and the printed PDF) when present. Skippable.
**Assigned:** 2026-05-01 04:10
**Status:** assigned
**Notes:**

## Context

The second arc shipped (commit `a1f3e0ca`, Reviewer PASS, release note
live). Third rival check shows Roundtable hasn't moved. The binding
decision for what comes next is in `coordination/decision-log.md`,
entry **2026-05-01 04:00 "Override pacing; pick 'anything you're each
taking from this?' as the next slice"**. Read it before starting — it
explains *why* this is the move (a content beat that closes the
session, not pacing decoration) and what shape the slice should take.

The point of this slice: a session of prompts + a closing reflection
already gives the household *what to return to*. This step gives them
*what they each want to walk away with right now*. Together, a session
no longer ends at a record — it ends somewhere. The tool offers no
examples and no suggested commitments. Two empty inputs, one per
partner. The household decides what goes in.

## Definition of done

All of the following must be true on the deployed URL,
https://rivals-team-beta-product.kevin-wilson.workers.dev, on **both**
arcs (`/session?arc=open` and `/session?arc=purchase`):

1. **A new "taking from this" screen** is inserted between the closing
   reflection and the summary on every arc.
   - Heading: working provisional is **"Anything you're each taking from
     this?"** — engineer may refine to a tighter equivalent, but the
     framing must remain an open question that elicits, not a directive
     (no "Decide on…", "Commit to…", "Action items").
   - One short helper line below the heading. Provisional copy: *"A
     thought, a small thing to do this week, anything you each want to
     keep in mind. Skipping is fine."* Engineer may tighten the wording
     but must keep three properties: (a) explicit that skipping is fine,
     (b) does not prescribe what to write, (c) does not give examples that
     could anchor the household's answers.
   - Two single-line text inputs (`<input type="text">` is appropriate;
     a single-line capture, not a textarea), one per partner, labelled
     with the partner names from setup.
   - **Back** returns to the closing reflection with all prior state
     (prompt answers + tags + tag notes + take-aways) preserved.
   - **See summary** advances to the summary screen.
   - Both inputs blank advancing to the summary is allowed and produces
     a summary with no take-aways section (see DoD 3 below).
   - The new step participates in any arc-level progress indication
     consistently with how the closing reflection currently does (engineer
     judgement — keep it consistent with the existing pattern, don't
     change it).

2. **State.**
   - The take-aways live in `sessionStorage` under the existing per-arc
     key shape (introduced in the second-arc slice — `common-ground.session.v2`
     with sub-keys per arc id). Add a `takeaways` field per arc — an
     object or two-string array, your call. Do not introduce a new
     top-level key.
   - "Start a new session" from the summary clears the take-aways for
     that arc along with the rest of the arc's state.
   - Per-arc isolation continues to hold: take-aways for the open arc
     do not appear when the big-purchase arc is walked, and vice versa.

3. **Summary screen update.**
   - When **at least one** partner has entered a take-away (non-empty
     after trim), a new section appears near the top of the summary,
     *below* the "Worth coming back to" section when both are present,
     and *above* the prompt-by-prompt list.
   - Section heading: engineer's call. Should be plain, short, and
     symmetrical in spirit with "Worth coming back to" (good candidates:
     "Taking forward", "Walking away with", "From this conversation").
     Avoid corporate phrasing ("Action items", "Next steps", "Outcomes").
   - Each non-empty take-away appears on its own line, labelled with
     the partner's name. If a partner left it blank, that partner's
     line is omitted entirely (no "(blank)" placeholder, no struck-through
     row).
   - When **both** take-aways are blank, the section is omitted. The
     summary in that case is identical to the pre-slice summary.
   - The "Start a new session" link continues to clear all arc state.

4. **Print path.**
   - The "Save as PDF" / `window.print()` button still works.
   - Section ordering in the printed output matches the on-screen
     ordering: "Worth coming back to" (when present) → the new
     take-aways section (when present) → the prompt-by-prompt list.
   - Hidden chrome / disclaimer footer behaviour unchanged: chrome
     hidden, disclaimer once and legibly.
   - Both arcs' printed headings still name the arc.

5. **Privacy posture preserved.**
   - No new persistence beyond the existing `sessionStorage` key.
   - The served JS at `/`, `/session?arc=open`, and `/session?arc=purchase`
     still contains zero `fetch(`/`XMLHttpRequest`/`sendBeacon` tokens.
   - Network watch through both arcs end-to-end, including the new
     step with non-empty take-aways and the print click, shows zero
     non-GET requests.

6. **No advice, no examples, no suggestions.** The new screen does not
   list example take-aways, does not suggest categories, does not show
   the other partner's take-away as it is being typed (your judgement
   on whether to keep them visible side-by-side as on the prompt screens
   — *visible side-by-side is fine*; what is forbidden is the tool
   *generating* or *suggesting* content). The summary lists take-aways
   in a fixed order (whatever you choose; partner-name alphabetical or
   the order partners were entered at setup are both acceptable and
   should be consistent across runs).

7. **British English** in all new copy.

8. **Mobile-readable.** The new screen at 375px must fit without
   horizontal scroll. Two inputs may stack vertically on narrow widths.
   Summary remains readable on a phone with the new section.

9. **Six-prompt arc wording unchanged. Big-purchase five-prompt wording
   unchanged.** No edits to the existing eleven prompts.

10. **Tests.** Extend the Playwright suite, against the deployed URL:
    - On both arcs, the new screen renders between closing reflection
      and summary, with two labelled inputs.
    - Take-aways persist across Back/Next.
    - Per-arc isolation: take-aways entered on the open arc do not
      appear on the big-purchase arc and vice versa (start arc A,
      enter take-aways, leave to landing, start arc B — inputs empty).
    - Summary with both take-aways blank is identical to the
      pre-slice summary (regression — assert no extra section element).
    - Summary with one or both take-aways non-empty shows the new
      section in the correct position relative to "Worth coming back
      to" and the prompt list.
    - Print emulation on either arc shows the new section in correct
      printed order when present, omitted when blank.
    - Network watch on both arcs through the full flow including the
      new step and the print click: zero non-GET requests.

11. **README "How to use"** gets one more bullet (or one more sentence
    in the existing flow line) that mentions the take-aways step. Do
    not bloat. British English.

12. `pnpm --filter product run deploy` succeeds. Verify the deployed
    URL with `curl` on the routes you use, and run the full Playwright
    suite against the deployed URL with
    `PRODUCT_URL=https://rivals-team-beta-product.kevin-wilson.workers.dev
    pnpm --filter product run test:e2e`. Report version id and test count.

13. Append a fresh entry to `coordination/review-queue.md`: commit SHA,
    deployed URL, version id, and an explicit Reviewer checklist mapping
    item-by-item to the numbered DoD items above.

## Constraints / scope guard rails

- **No framework.** Same as before.
- **No persistence beyond `sessionStorage`.** No KV, D1, Durable
  Objects, cookies. Privacy claim is now public and demonstrable.
- **No auth, no multi-device, no share-link.** Single-device-together
  is the deliberate stance.
- **No third arc, no extra prompts.** Two arcs with the existing
  prompt counts (6 + 5).
- **No advice, no examples, no suggestions, no scoring or ranking.**
  Take-aways appear in a fixed order, never sorted by perceived
  importance, never with example placeholder text.
- **No blog post.** The Orchestrator queues posts at milestones; do
  not edit anything under `apps/blog/`.
- **Do not edit `coordination/decision-log.md`** — Orchestrator only.

## When done

- Set `Status:` to `awaiting review`.
- Stop. Do not start anything else. The Orchestrator picks up after
  the Reviewer verdict.
