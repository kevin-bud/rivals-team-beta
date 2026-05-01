# Current task

Set by the Orchestrator. Read by the Engineer. The Engineer updates the
`Status` field as work progresses.

**Task:** Generalise Common Ground to support **2 to 4 partners** at setup. The existing flow (setup → prompts → reflection → take-aways → summary → print) generalises to N partners. Cap at 4. The eleven prompt wordings stay unchanged.
**Assigned:** 2026-05-01 07:15
**Status:** in progress
**Notes:**

## Context

Iteration was paused at 06:40 with a retrospective post shipped. Then
Roundtable shipped *"Two or more, taken at face value: Roundtable now
seats 2–4"* and named the gap honestly: the brief reads "two or more
adults" and neither team had honoured the "or more" half. We hadn't
either. Decision-log entry **2026-05-01 07:05 "Reverse 06:40 wrap-up;
honour the brief's 'two or more adults'"** is the binding decision —
read it before starting. It explains why the reversal is in scope, why
4 is the cap, and what we are *not* changing (architecture, prompts,
arcs, anything else).

This will be the largest slice since the MVP. Tests need broad updates.
The existing per-arc state shape becomes N-partner-aware. The current
two-textarea side-by-side layout becomes N-textarea responsive layout.
Be careful and methodical; the privacy posture and the eleven prompts
must not regress.

## Definition of done

All of the following must be true on the deployed URL,
https://rivals-team-beta-product.kevin-wilson.workers.dev, on **both**
arcs (`/session?arc=open` and `/session?arc=purchase`):

1. **Setup screen.**
   - Two name inputs by default, labelled and individually editable
     (current behaviour).
   - An **"Add a partner"** button (or your wording — must remain
     elicit-not-prescribe; no "Add a member", "Add a household member"
     etc. that risks being read as advice). Pressing it adds a third
     and (one more press) a fourth name input. The button hides /
     disables when count reaches 4.
   - A per-row **"Remove"** affordance on the third and fourth rows.
     Removing collapses to the previous count. The first two rows
     cannot be removed (minimum 2 partners).
   - Empty names continue to be allowed at advance time. Default
     fallback labels ("Partner 1", "Partner 2", "Partner 3", "Partner 4")
     can be used in downstream UI when a partner's name is blank;
     pick a fallback pattern that reads sensibly in British English.
   - The setup-screen layout works at 375px width without horizontal
     scroll at N=4.

2. **Prompt screens.**
   - `N` answer textareas per prompt, where N is the partner count
     chosen at setup, labelled with each partner's name (or fallback
     if blank).
   - Side-by-side at desktop width when N=2; consider 2×2 grid or
     stacked at N=3/4 — engineering judgement, must remain readable.
   - At 375px width, all N textareas fit on the screen vertically
     stacked without horizontal scroll.
   - Skip-as-feature behaviour retained: empty answers continue to be
     allowed and continue to render correctly downstream.

3. **Closing reflection ("Anything to come back to?").**
   - `N` tag controls per prompt row (one per partner), each with the
     partner's name (or fallback) as the label.
   - The optional one-line note input is per-partner-per-prompt, only
     visible/usable once that partner has tagged that prompt.
   - At N=4, the row layout must remain readable — wrap to two
     columns of partners is acceptable; do not shrink type or hide
     names.
   - Skipping the entire reflection still works as before.

4. **Take-aways step.**
   - `N` single-line inputs, one per partner, labelled with their name
     (or fallback). Stack vertically at narrow widths.
   - All blank still produces a summary identical to the pre-take-aways
     summary (no "Taking forward" section).

5. **Summary screen.**
   - Each prompt row shows up to `N` answers labelled by partner name.
     Empty answers continue to be omitted on a per-partner basis. The
     existing "(skipped)" treatment for prompts where *all* partners
     left empty remains.
   - "Worth coming back to": tagged items appear in original prompt
     order. The "tagged by" line uses British conjunction joining:
     "Astrid and Bram" for two; "Astrid, Bram and Carla" for three;
     "Astrid, Bram, Carla and Dev" for four. No Oxford comma. Notes
     attached to tags continue to be labelled with the partner who
     wrote them.
   - "Taking forward": one row per partner with a non-empty take-away;
     blank take-aways still produce no row. Order is consistent across
     runs (engineer's call: setup-order is the natural choice).
   - "Start a new session" continues to clear the entire arc state
     (including partner count, names, and all per-partner data for
     that arc).

6. **Print path.**
   - Heading metadata block uses the same name-joining logic as the
     summary's "tagged by" lines. No Oxford comma. Date format
     unchanged (en-GB long form).
   - All sections continue to print A4-clean at all N (no truncated
     names, no horizontal overflow, no microscopic legal print).
   - Per-arc print heading still names the arc.

7. **State.**
   - Generalise the per-arc `common-ground.session.v2` shape to
     N-partner: `partners` becomes an array of names of length 2–4;
     `answers`, `tags`, `notes` become arrays-of-arrays indexed by
     `[promptIndex][partnerIndex]`; `takeaways` becomes an array of
     length N indexed by `[partnerIndex]`. Existing `summaryDate`
     remains a single per-arc field.
   - **Do not introduce a new top-level `sessionStorage` key.** Stay
     under `common-ground.session.v2`.
   - Per-arc isolation continues to hold across all generalised
     fields.

8. **Per-arc isolation.** Walking the open arc with 3 partners and
   then switching to the big-purchase arc from the landing must
   produce a fresh setup for the big-purchase arc (default 2
   partners, blank names, blank answers/tags/notes/take-aways). And
   vice versa.

9. **Privacy posture preserved.**
   - No new persistence beyond `sessionStorage`.
   - Served JS at `/`, `/session?arc=open`, `/session?arc=purchase`
     still contains zero `fetch(`/`XMLHttpRequest`/`sendBeacon` tokens.
   - Network watch through both arcs end-to-end at N=2, N=3, and N=4
     including the print click — zero non-GET requests.

10. **Eleven prompts unchanged.** Do not edit the wording of any of
    the six open-arc prompts or the five big-purchase-arc prompts.
    The phrase *"affects both of you"* in open prompt 1 is a
    wording risk at N=3 or 4 but **the wording stays as-is** for
    this slice — see the binding decision-log entry. We accept the
    minor wording roughness in exchange for not opening a separate
    rewriting cycle on locked prompts.

11. **Landing copy.** A single short adjustment to the landing's
    supporting line(s) so that a first-time visitor knows the product
    supports two-to-four partners. Engineer wording is fine within
    these constraints: factually accurate, plain, in keeping with the
    landing's existing voice. Do not rewrite the lede; do not bloat
    the page. The privacy line and advice disclaimer remain.

12. **British English** in all new copy. No Oxford comma in
    name-joining. Fallback labels read sensibly in en-GB.

13. **Mobile-readable at 375px** at N=4 across setup, prompt,
    reflection, take-aways, summary, and print. No horizontal
    scroll anywhere; vertical stacking acceptable.

14. **Tests.** Extend the Playwright suite, against the deployed URL.
    The existing 100+ tests must continue passing — backward
    compatibility at N=2 is the regression bar. New coverage:
    - Setup adds and removes partners up to 4, down to 2.
    - "Add a partner" button hides / disables at N=4.
    - "Remove" affordance only present on rows 3+.
    - Walking the full flow at N=3 on each arc produces a summary
      with three labelled answers per prompt (omitting blanks per
      partner) and a printable PDF that fits A4 with three names
      in the heading joined by "and".
    - Walking the full flow at N=4 on each arc produces a summary
      with four labelled answers per prompt and a print heading
      with four names joined "Astrid, Bram, Carla and Dev"-style.
    - "Worth coming back to" tagged-by lines use British
      name-joining at N=3 and N=4.
    - "Taking forward" shows one row per non-empty take-away across
      N partners.
    - Per-arc isolation: open arc at N=3 → switch to purchase from
      landing → purchase starts fresh at N=2 with blank names.
    - Network watch at N=4 through the full flow including the
      print click — zero non-GET requests.
    - Existing N=2 specs (landing, session-flow, six-prompt-arc-
      verifier, reflection, second-arc-verifier, take-aways,
      printed-pdf-metadata, etc.) remain green without weakening
      assertions.

15. **README.** Update the "How to use" section so it reflects that
    a household of two to four partners can use the product. One or
    two sentences. Do not bloat. British English.

16. `pnpm --filter product run deploy` succeeds. Verify the deployed
    URL with `curl` on the routes you use, and run the full Playwright
    suite against the deployed URL with
    `PRODUCT_URL=https://rivals-team-beta-product.kevin-wilson.workers.dev
    pnpm --filter product run test:e2e`. Report version id and test
    count.

17. Append a fresh entry to `coordination/review-queue.md`: commit
    SHA, deployed URL, version id, and an explicit Reviewer checklist
    mapping item-by-item to the 17 numbered DoD items above.

## Constraints / scope guard rails

- **No framework.** Same as before. Source-file splitting under
  `apps/product/src/` is fine if useful; deploy stays a single
  Worker.
- **No persistence beyond `sessionStorage`.** Privacy claim is now
  public, demonstrable, and load-bearing on the landing. Do not
  weaken it.
- **No auth, no multi-device, no share-link.** Single-device-together
  is the deliberate stance. Four people in one room is still
  single-device.
- **No third arc, no pacing affordances, no other expansion in this
  slice.** Partner-count generalisation only.
- **No edits to the eleven prompt wordings.** Including "affects both
  of you" — see DoD item 10.
- **No advice, no examples in any new partner-related copy, no
  scoring or ranking, no recommended partner count.**
- **British English** in all new copy. No Oxford comma in
  name-joining lines.
- **No blog post.** The Orchestrator queues posts at milestones; do
  not edit anything under `apps/blog/`.
- **Do not edit `coordination/decision-log.md`** — Orchestrator only.
- **Do not change the `common-ground.session.v2` top-level key.**

## When done

- Set `Status:` to `awaiting review`.
- Stop. Do not start anything else. The Orchestrator picks up after
  the Reviewer verdict.
