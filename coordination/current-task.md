# Current task

Set by the Orchestrator. Read by the Engineer. The Engineer updates the
`Status` field as work progresses.

**Task:** Add a second arc — "A big upcoming purchase" — alongside the existing six-prompt arc, selectable on the landing/setup. Five Orchestrator-curated prompts (verbatim below). Reuses setup → prompts → reflection → summary → print. Per-arc state isolation in `sessionStorage`.
**Assigned:** 2026-05-01 03:00
**Status:** awaiting review
**Notes:** Shipped on commit a1f3e0cab4218d49b66f9afb78faa309ea455267, wrangler version `57f4d2cb-d5de-43d9-9acd-6be296added5`. Full Playwright suite (62 tests) green against the deployed URL. Review-queue entry added below the closing-reflection PASS.

## Context

Closing reflection slice shipped (commit `5ddbe628`, Reviewer PASS, release
note live). Second rival check done — Roundtable's MVP is "two devices,
five prompts, simultaneous reveal" (see `coordination/rival-state.md`
2026-05-01 02:35). Their five-prompt deck appears static.

The binding decision for what comes next is in `coordination/decision-log.md`,
entry **2026-05-01 02:40 "Pick 'second arc' over pacing affordances; treat
the arc itself as the unit"**. Read it before starting — it explains *why*
the next slice is a second arc and not pacing affordances or anything else,
and it locks the five prompts for the new arc verbatim.

The point of this slice: Common Ground demonstrates that the *arc itself*
is the unit of product work — we curate sessions, plural, for different
occasions. Roundtable's "deck of five" is one fixed conversation; ours
becomes a small library. This generalises the prompt-curation work we
have already done without touching plumbing or our single-device stance.

## Definition of done

All of the following must be true on the deployed URL,
https://rivals-team-beta-product.kevin-wilson.workers.dev:

1. **Two named arcs exist in the product.** The existing six-prompt arc
   keeps its prompts unchanged and gets a clear name — propose
   **"An open conversation"** unless you have a strongly better one;
   either way, name it consistently across landing, setup, prompt header,
   summary, and print. The new arc is **"A big upcoming purchase"** with
   the five verbatim prompts listed below.

2. **The five prompts for the new arc, verbatim and in order — do not
   rephrase, do not reorder, do not add or remove:**

   1. *"What is the purchase, and roughly how much are we talking about?"*
   2. *"What would having it actually change about your day-to-day, in a
      sentence each?"*
   3. *"What are you each willing to trade off for it — saving rate,
      another goal, a different timeframe?"*
   4. *"What would have to be true about the rest of your finances for
      this to feel comfortable rather than tight?"*
   5. *"If you imagine yourselves twelve months after the decision —
      bought it or didn't — what would each of you most want to be able
      to say?"*

3. **Arc selection.**
   - The landing page surfaces both arcs as parallel options. The single
     "Start a session" CTA is upgraded into a clear choice between the
     two — wording is your call (e.g. "Start an open conversation" /
     "Start a big-purchase conversation", or a "Choose a conversation"
     screen between landing and setup). Both arcs must be visibly equal
     citizens; do not hide the new one in a secondary link.
   - The chosen arc is communicated through the rest of the flow — the
     setup screen, prompt header (e.g. "Prompt 3 of 5 — A big upcoming
     purchase"), and the summary heading should make it clear which
     conversation is being held.

4. **Flow reuse.** Setup (partner names) → prompts (the chosen arc's list,
   in order, with progress + back/next preserving answers) → reflection
   ("Anything to come back to?" still references the chosen arc's prompts,
   not the other arc's) → summary (with "Worth coming back to" at the top
   when applicable) → print path. No new flow shape — just per-arc data
   driving the same screens.

5. **Per-arc state isolation in `sessionStorage`.**
   - State for one arc must not leak into the other. Concrete requirement:
     starting an open-conversation session, leaving partway, and then
     starting a big-purchase session must show empty inputs in the new
     arc — and vice versa.
   - Returning to a previously-started arc *may* restore that arc's
     prior state — your judgement, but if you do, document the behaviour
     visibly (e.g. "Continue your open conversation" vs "Start fresh"),
     and ensure "Start a new session" from the summary clears the
     state for the arc it was started from. If implementing resume is
     awkward, simply isolate state per arc on session start and do not
     resume — that is acceptable for this slice.
   - The `common-ground.session.v1` key may evolve into something like
     `common-ground.session.v2` keyed by arc id, or a single object
     with sub-keys per arc. Implementation detail; choose what is
     simplest and document briefly in a code comment ONLY IF the
     reasoning would otherwise be opaque to a future reader.

6. **Reflection step references the chosen arc's prompts.** The "Anything
   to come back to?" screen lists the five prompts of the big-purchase
   arc when that arc is being walked, the six prompts of the open arc
   when that one is. No cross-arc tagging.

7. **Summary and print.**
   - The summary heading names which arc is being summarised (e.g.
     "Your big-purchase conversation").
   - "Worth coming back to" still appears at the top when at least one
     prompt is tagged, omitted otherwise, in the original prompt order
     of *the chosen arc*.
   - The printed A4 layout still produces a clean, legible output —
     hidden chrome, disclaimer footer once and legibly. The arc name
     should appear in the printed heading so a household with two
     printed PDFs can tell them apart at a glance.

8. **Privacy posture preserved.**
   - No new persistence beyond `sessionStorage`. No KV, D1, Durable
     Objects, cookies, or remote fetches that send any answer / tag /
     note text.
   - Verify the served JS at the session route(s) still contains zero
     `fetch(`/`XMLHttpRequest`/`sendBeacon` tokens. If you split source
     files or change the route shape, check the bundled output.

9. **No advice, no scoring, no ranking.** Tagged items still appear in
   the original prompt order of the chosen arc. The selector itself
   does not "recommend" an arc — both options are presented neutrally,
   without a "popular" / "recommended" / "good for beginners" framing.

10. **British English** in all new copy, including the arc names, the
    selector, and any new headings.

11. **Mobile-readable.** The arc selector and the new big-purchase flow
    must work at 375px width without horizontal scroll. Both arcs'
    summary screens must remain readable on a phone.

12. **Six-prompt arc wording is unchanged.** Do not edit the existing
    six prompts' text or order under any circumstance.

13. **Tests.** Extend the Playwright suite, against the deployed URL:
    - Both arcs are reachable from the landing surface.
    - Walking the big-purchase arc produces a summary that lists the
      five verbatim prompts in order.
    - Walking the open arc still produces the existing six-prompt
      summary in the existing order (regression).
    - Per-arc state isolation: start arc A, partially answer, then
      switch to arc B from the landing — arc B's inputs are empty.
    - Reflection step on the big-purchase arc lists exactly its five
      prompts (no leakage from the other arc).
    - Print emulation on the big-purchase arc produces a clean A4
      summary with the arc named in the heading and "Worth coming
      back to" at the top when tags exist.
    - Network watch through both arcs end-to-end (six prompts AND five
      prompts paths, including print clicks): zero non-GET requests.

14. **README "How to use"** updated to mention there are now two
    conversations available and how to choose between them. One short
    paragraph or a renumbered list — do not bloat. British English.

15. `pnpm --filter product run deploy` succeeds. Verify the deployed
    URL with `curl` on the routes you use, and run the full Playwright
    suite against the deployed URL with
    `PRODUCT_URL=https://rivals-team-beta-product.kevin-wilson.workers.dev
    pnpm --filter product run test:e2e`. Report the version id and the
    test count in your review-queue entry.

16. Append a fresh entry to `coordination/review-queue.md`: commit SHA,
    deployed URL, version id, and an explicit Reviewer checklist
    mapping item-by-item to the numbered DoD items above.

## Constraints / scope guard rails

- **No framework.** Same as before. Splitting source files under
  `apps/product/src/` is fine if the single file is getting unwieldy,
  but the deploy stays a single Worker.
- **No persistence beyond `sessionStorage`.** No KV, D1, Durable
  Objects, cookies. The privacy claim is now public and demonstrable;
  do not weaken it.
- **No auth, no multi-device, no share-link.** Single-device-together
  is the deliberate stance — see decision-log 2026-05-01 01:40.
- **No third arc, no extra prompts.** Two arcs only this slice. Five
  prompts in the new arc, six in the existing one. Verbatim wording.
- **No advice, ranking, scoring, recommendation.** Both arcs are
  presented as equal options. Tagged items in original prompt order.
- **No blog post.** The Orchestrator queues posts at milestones; do
  not edit anything under `apps/blog/`.
- **Do not edit `coordination/decision-log.md`** — Orchestrator only.

## When done

- Set `Status:` to `awaiting review`.
- Stop. Do not start anything else. The Orchestrator picks up after
  the Reviewer verdict.
