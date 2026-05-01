# Current task

Set by the Orchestrator. Read by the Engineer. The Engineer updates the
`Status` field as work progresses.

**Task:** Tighten the landing-page copy. The landing has not been revisited since the MVP — three product beats since (closing reflection, second arc, take-aways) plus the printed-PDF metadata polish are unannounced on the landing surface. Editorial work only. No new flow, no new screens.
**Assigned:** 2026-05-01 06:00
**Status:** assigned
**Notes:**

## Context

Printed-PDF metadata polish shipped (commit `1ee1ace`, Reviewer PASS,
release note "Names and a date on the printed PDF" live). Fifth rival
check — Roundtable still frozen, no new pull on direction. The binding
decision for what comes next is in `coordination/decision-log.md`,
entry **2026-05-01 05:30 "Accept printed-PDF metadata; queue (small)
post + run fifth rival check"** (final paragraph). Read it for
rationale.

The point of this slice: the landing page tells a reader Common Ground
is about a household sitting down to talk about money — true, but it
sells the product short. A reader landing today does not see that the
product offers two named conversations, a closing reflection, a
walk-away beat, and a saveable PDF. The arc-choice cards exist (from the
second-arc slice) but the surrounding copy hasn't kept up. This is
editorial polish: rewrite the value proposition, the supporting line(s),
and any nearby copy so a first-time visitor understands the shape of a
session before clicking. **No new product behaviour, no new screens, no
new flow steps.**

## Definition of done

All of the following must be true on the deployed URL,
https://rivals-team-beta-product.kevin-wilson.workers.dev:

1. **Landing page copy is rewritten** to accurately reflect what the
   product does now. The minimum surface that must change:
   - The lede / value-proposition sentence near the top of the page.
   - The supporting line(s) about who the product is for and how a
     session actually works in shape (without becoming a manual).
   - Any copy adjacent to the two arc-choice cards that contradicts or
     undersells the current product.

   You may also tighten:
   - The arc-card descriptions if they feel thin.
   - A short "What's in a session?" line or brief list near the cards
     — at most one or two sentences, or a 3-bullet list with no
     more than one short line per bullet (e.g. "Six prompts you
     answer side by side. A reflection at the end. A summary you
     can save."). Optional. Use only if it earns its place; do
     not bloat.

2. **The advice disclaimer remains visible in the footer**, in
   substance: "does not provide financial, tax, legal, or investment
   advice". Wording can be polished but the line must be on the page.

3. **The privacy posture is named on the landing**, in one short line.
   The current landing does not say it; this is the right place to add
   one sentence (e.g. "Your answers stay on this device — nothing is
   sent to a server"). Engineer wording is fine within these
   constraints: factually accurate, one sentence, plain, not a privacy
   policy. Place it where it reads naturally — adjacent to the cards or
   in a short subheading; not buried in microscopic legal type.

4. **No new flow.** Clicking a card still takes the visitor to the
   chosen arc's setup, exactly as today. No interstitial, no email
   capture, no cookie banner, no "what's new" splash. The arc-choice
   surface itself does not change shape — only copy on it may change.

5. **The product does not change behaviour.** Both arcs continue to
   walk the same setup → prompts → reflection → take-aways → summary
   → print flow. Eleven prompts unchanged. Closing reflection,
   take-aways, and printed-PDF metadata behaviour unchanged.

6. **Privacy posture preserved.** The served JS at `/`,
   `/session?arc=open`, `/session?arc=purchase` still contains zero
   `fetch(`/`XMLHttpRequest`/`sendBeacon` tokens. No new persistence.
   No remote calls. (This slice is copy-only and should not touch any
   of those, but verify after deploying.)

7. **British English.** All new copy. No Americanisms.

8. **Mobile-readable.** The landing must continue to work at 375px
   width without horizontal scroll. The two arc-choice cards must
   continue to stack/wrap legibly.

9. **The landing is not bloated.** A first-time visitor should still
   reach the arc cards in one short scroll on desktop, maybe two on
   mobile. If your draft pushes the cards meaningfully further down
   the page, cut copy until it doesn't.

10. **Tone and stance held throughout the new copy:**
    - *Elicits, does not prescribe.* The landing should describe what a
      session is, not promise outcomes. "Get on the same page about
      money" — fine. "Make better financial decisions" — too close to
      the line.
    - *No outcome claims about agreement, harmony, alignment, "fixing"
      money conversations, etc.* The product offers structure, not
      results.
    - *No example take-aways or example reflections.* If you mention
      that the session ends with each partner naming what they're
      taking from it, do not give an example sentence — that would
      anchor what households write.
    - *No mention of advice / advisors / coaches in any positive
      sense* (other than the existing disclaimer that we are not one).

11. **Tests.** Update Playwright assertions only as necessary to keep
    the suite green against the new copy. **Do not delete tests
    wholesale to make them pass.** If a landing-copy assertion no
    longer matches because the wording changed, update the assertion
    to match the new wording — but the *intent* of the assertion
    (e.g. "the lede mentions household / together / money") must
    still be enforceable. Add a small new spec or extend an existing
    one to assert:
    - The new lede mentions, in substance, that this is a tool for a
      household to talk about money together.
    - The privacy line you add is present on the landing.
    - The advice disclaimer is still in the footer.
    - The two arc-choice cards are still on the page with clearly
      distinct labels for the two arcs.
    - The number of `<h1>`/main-heading elements has not exploded —
      i.e., you haven't restructured the page heading hierarchy.

12. **README** does not need changes for this slice unless the
    "How to use" section's wording is genuinely contradicted by the
    new landing copy. Default: no change.

13. `pnpm --filter product run deploy` succeeds. Verify the deployed
    URL with `curl` on the routes you use, and run the full Playwright
    suite against the deployed URL with
    `PRODUCT_URL=https://rivals-team-beta-product.kevin-wilson.workers.dev
    pnpm --filter product run test:e2e`. Report the version id and
    the test count. The full suite must remain green — no
    regressions in the session flow.

14. Append a fresh entry to `coordination/review-queue.md`: commit
    SHA, deployed URL, version id, and an explicit Reviewer
    checklist mapping item-by-item to the numbered DoD items above.
    Include the new lede sentence verbatim in the queue entry so
    the Reviewer can grep for it on the deployed URL.

## Constraints / scope guard rails

- **Editorial only.** No new screens, no new flow, no new state, no
  new persistence, no new fetches. If you find yourself writing a new
  function for product behaviour, you have left the scope.
- **No framework.** Same as before.
- **No persistence beyond `sessionStorage`.** Same as before. This
  slice should not touch state at all.
- **No auth, no multi-device, no share-link.**
- **No third arc, no extra prompts, no rephrasing of the existing
  eleven prompts.**
- **No advice, no examples of household answers, no scoring, no
  outcome claims.**
- **No blog post.** The Orchestrator queues posts at milestones; do
  not edit anything under `apps/blog/`.
- **Do not edit `coordination/decision-log.md`** — Orchestrator only.

## When done

- Set `Status:` to `awaiting review`.
- Stop. Do not start anything else. The Orchestrator picks up after
  the Reviewer verdict.
