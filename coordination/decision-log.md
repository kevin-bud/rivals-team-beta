# Decision log

Append-only record of decisions made by the Orchestrator. Each entry follows
the format below. Never edit past entries. If a decision is reversed, write a
new entry that references the previous one.

---

## YYYY-MM-DD HH:MM — [Decision title]

**Context:** What situation prompted this decision.
**Options considered:** What alternatives were on the table.
**Choice:** What was decided.
**Rationale:** Why this over the alternatives.
**Reversible?** Yes / No / Costly to reverse.

---

## 2026-05-01 07:05 — Reverse 06:40 wrap-up; honour the brief's "two or more adults"

**Context:** Out-of-cycle seventh rival check (`coordination/rival-state.md` 07:00) verified a Roundtable post the Writer surfaced on hand-back: *"Two or more, taken at face value: Roundtable now seats 2–4."* They have generalised their product from two to two-three-or-four partners. Their own framing: *"Plurality went first because the brief said so plainly and we had not honoured it."* That is also true of Common Ground. The brief reads "A household of two or more adults"; our setup, prompt copy ("you and your partner"), and entire data model assume exactly two. We did not deliberately pick the two-only reading — we defaulted to it.

**Choice:** Reverse the 06:40 "stop iterating" stance for one more slice. Generalise Common Ground to support **2 to 4 partners** at setup, with the existing flow (prompts, closing reflection, take-aways, summary, print) generalising to N-partner. Cap at 4 to match Roundtable's own bound and to keep the in-room experience tractable.

**Rationale:**
- *The brief's wording is plain and we did not honour it.* This is not a question of competing readings — "two or more adults" is unambiguous. A retrospective that did not address this would be incomplete; a product that does not address this *can* be incomplete and the retrospective will then read as confidence we have not earned. Honouring the brief is the higher commitment.
- *The reversibility note in 06:40 was not rhetorical.* It said "if Roundtable ships something that genuinely calls for a response, iteration can resume." This is that case. Honouring the reversibility note is itself part of the decision trail the brief evaluates.
- *We are not chasing on architecture.* Single-device, in-page state, side-by-side answering, two-arc library — all unchanged. Partner-count is a separate axis from the architectural divergences we have explicitly held. Generalising to 4 partners on one device is consistent with single-device-together; it is not a multi-device pivot.
- *Cap at 4, not "unlimited".* Roundtable picked 2–4. Matching that bound is honest (we are not visibly outdoing them on a contrived axis), keeps the prompt-screen and reflection-screen layouts tractable, and reflects the practical bound of how many adults realistically sit around one device for a money conversation.
- *The retrospective post stays as-is.* It was correct when it was written. The next post (after this slice ships) is where the partner-count work and the rival's role in surfacing the gap get acknowledged.

**Reversible?** Yes — the partner-count parameter is data-driven; reverting to two-only is mechanically straightforward. We are not betting the architecture on this choice.

**Working spec for the next task** (final shape locked in `current-task.md`):
- *Setup screen.* Two name inputs by default, with an "Add a partner" button that adds a third / fourth name input (and removes via a per-row "Remove" affordance until count hits 2 again). Partner names remain editable. Empty names still allowed (current behaviour).
- *Prompt screens.* `N` answer textareas per prompt, labelled with each partner's name (or a fallback like "Partner 1" if blank), arranged side-by-side at desktop width and stacking vertically at narrow widths. Existing skip-as-feature behaviour retained.
- *Closing reflection.* `N` tag controls per prompt row (one per partner). Engineering judgement on layout when N > 2 — wrap to two columns is fine; do not collapse names or reduce visual weight.
- *Take-aways step.* `N` single-line inputs, one per partner. Same skip-allowed behaviour.
- *Summary screen.* Each prompt's row shows up to N answers labelled by name; empty answers still skipped per partner. "Worth coming back to" lists tagged-by names with British "and" / Oxford-comma-discretion handling for N=3 and N=4 (e.g. "Astrid and Bram", "Astrid, Bram and Carla", "Astrid, Bram, Carla and Dev"). "Taking forward" shows one row per partner with non-empty take-away. Tagged items remain in original prompt order; no scoring or ranking.
- *Print path.* Heading metadata block uses the same name-joining logic. Layout still A4-clean at all N.
- *Per-arc isolation.* Switching arcs from the landing still resets that arc's setup. Partner count is per-arc.
- *State.* Generalise the per-arc `common-ground.session.v2` shape to N-partner: arrays of length N for `answers`, `tags`, `notes`, `takeaways`; the `partners` line becomes a list. No new top-level key.
- *Eleven prompts unchanged.* The existing wording works at N partners as-is — *"What would each of you most want to be able to say?"* generalises naturally; *"What's one money decision coming up in the next three months that affects both of you?"* — the phrase "both of you" is a wording risk at N=3 or 4. **Acceptable risk for this slice — do not edit the locked prompt wording.** Engineer notes the phrase still parses sensibly; the brief's "or more" wording does not require us to rewrite all eleven prompts.
- *Privacy posture, advice line, British English, mobile-readable, no framework, no persistence beyond `sessionStorage`* — all unchanged.
- *No third arc, no pacing affordances, no other expansion in this slice.*

**This will be the largest slice since the MVP.** Tests need broad updates. Set the engineer's expectation accordingly when writing the task: this is bigger than the recent consolidating slices.

---

## 2026-05-01 06:40 — Move from iteration to wrap-up; queue a retrospective post

**Context:** Sixth rival check (`coordination/rival-state.md` 06:35) confirms Roundtable frozen for three consecutive rival-check windows. The 06:30 entry's provisional read — that the strongest remaining artefact is a retrospective engaging the brief's evaluation criteria, rather than a seventh code slice — now stands without competing pull from rival data.

**Choice:**
1. **Stop iterating on the product** for the rest of this run, unless the rival ships something that materially changes the picture. Both arcs work end-to-end, both close cleanly, the printed PDF is informative, the landing reflects the product, the privacy posture is demonstrable. There is no defensible next product slice that is not optional polish.
2. **Queue a retrospective post**, separately from the small landing-copy release-note entry that is already in the queue. This is an Orchestrator-driven queue entry (not a PASS-triggered one — those only fire on Reviewer PASS). The retrospective is an editorial slot, not a code milestone.
3. **Let the Writer choose** between (a) shipping both queue entries as separate posts (small release note + retrospective), (b) deferring the small one and shipping the retrospective alone, or (c) combining the small release note's content into the retrospective. The queue entries themselves spell out the options.

**Rationale:**
- *The brief's evaluation prompt is explicit.* "Not on which product is 'better'. The evaluation is comparative and process-focused: what bets, how decisions evolved, where you and the rival diverged, how you handled the regulated-advice line, what your decision trail shows." A retrospective post written *specifically* into those criteria is the strongest single artefact remaining. The decision log and rival-state are the raw material; the retrospective is the synthesis.
- *Marginal value of further code slices is low.* Pacing affordances are cosmetic, a third arc would feel proliferative against the current two, and any further polish is below the threshold that justifies a Reviewer cycle. Continuing to ship for its own sake risks running into our own version of Roundtable's "two bugs that taught the same lesson" — quality posture has been load-bearing since the launch post and is not worth risking for a feature we don't believe in.
- *We hold the headroom we said we'd hold.* The 05:35 rival-state entry noted: "if the next slice ships and Roundtable still hasn't moved, we have headroom for one or two more consolidating moves before re-examining whether to expand or call the project done." We have shipped two consolidating moves since then (printed-PDF metadata + landing-copy tighten). The reasonable read of the current state is now "call the project done" rather than "expand".

**Reversible?** Yes — if Roundtable ships something that genuinely calls for a response, iteration can resume. The decision is "stop now", not "stop forever".

**Retrospective post — angle, for the queue entry:** Engages the brief's four evaluation prompts in turn, briefly and honestly. What bets we made and why (single-device-together; in-page state only; arc as the unit; elicit-not-prescribe). How decisions evolved (the 01:40 hold-the-line on multi-device after the first rival check; the 02:40 second-arc pick over pacing; the 04:00 override of pacing in favour of take-aways; the 04:50 reactive small polish after Roundtable shipped print + clipboard; the 06:40 stop). Where Roundtable and Common Ground diverged and what it suggests (multi-device + simultaneous reveal vs. single-device + side-by-side; ephemeral-server vs. zero-server-text; static deck of five vs. arc-as-unit; their two acknowledged P0s vs. our PASS-streak). The advice line, in practice (no advice copy anywhere; no scoring or ranking; tagged items in original prompt order; no example take-aways). The decision trail — what it shows about reasoning under ambiguity (we picked simple-readings over clarifications, recorded reversals openly, deferred candidate features explicitly rather than dropping them, and revised provisional picks when the rival data warranted but held the architectural line when it didn't).

**Not for the post:** Numbers we'd cherry-pick (test counts, post counts, timestamps). The point of the retrospective is reasoning, not scoreboard.

---

## 2026-05-01 06:30 — Accept landing-copy tighten; queue (small) post + run sixth rival check

**Context:** Reviewer returned PASS on the landing-copy tighten (commit `240ac199`, wrangler version `dc56ac98-ce26-4002-9d42-94ae5d3b4bca`). 103/103 Playwright passing. Tests updated, not deleted (verified by diff against the prior commit: +43/-1 on `landing.spec.ts`, four new tests — privacy line, outcome/advice framing guard, heading hierarchy guard, plus the lede assertion preserved by *intent* rather than literal wording). New lede verbatim: *"Common Ground is a guided sitting for a household to talk about money together — pick one of two conversations, work through it side by side, then close with a shared reflection and a summary you can save."* Privacy line on the landing for the first time: *"Your answers stay on this device — nothing is sent to a server."*

**Choice:** Accept. Queue a small release note. Run the sixth rival check. Hand to Writer.

**Angle for the queued post:** Small. The landing now reflects what the product actually does — quote the new lede, name the new privacy line as a first-class statement on the landing rather than a buried claim. The Writer may judge this small enough to combine with whatever comes next, or to ship standalone. Pattern matches the printed-PDF metadata post.

**Reversible?** N/A — release note records what happened.

**Where we are vs. the brief:** Re-reading `BRIEF.md` against the current state. The MVP definition was met at 01:30. Since then we have shipped four extensions: closing reflection ("Worth coming back to"), second arc ("A big upcoming purchase"), take-aways ("Taking forward"), printed-PDF metadata polish, and now landing-copy tighten. Six published blog posts. Six product slices total. Roundtable has shipped three slices and four posts and has been frozen for two consecutive rival-check windows. The brief's evaluation criteria (decisions evolved, divergence with rival, advice-line handling, decision-trail under ambiguity) are well-served by the current decision log and post stream.

**Provisional next directions, to refine after the sixth rival check:**
- *A retrospective / project log post.* Not a slice — a Writer-driven post that engages the brief's evaluation criteria directly: how decisions evolved, where the divergence with Roundtable suggests something, the advice-line stance held in practice. This would be the strongest single artefact for the brief's own evaluation prompt. Could be queued without a corresponding code slice.
- *Pacing affordances (the long-deferred candidate).* Small read-aloud cue or "going first" indicator. Defensible but cosmetic.
- *Call the project done after the next consolidating move.* The brief invited "after MVP, you decide what to build next" and we have built four extension slices that all earn their place. There is a credible case for stopping iteration on the product and letting the decision trail and blog posts do the evaluation work.

Default expectation: queue a retrospective post (no code slice), then sit on iteration unless the rival check forces a response. The rule "every PASS gets a post queued" only fires on Reviewer PASS — a retrospective post is not a PASS-triggered queue. Hold the call until the sixth rival check is in.

---

## 2026-05-01 05:30 — Accept printed-PDF metadata; queue (small) post + run fifth rival check

**Context:** Reviewer returned PASS on the printed-PDF metadata polish (commit `1ee1ace`, source `c8caaee`, wrangler version `292b565b-84d8-48e7-8a96-5b4c139eed29`). 100/100 Playwright passing, including 11 new tests for this slice. Independent reviewer source review confirmed: `captureSummaryDateIfNeeded` only writes when the slot is unset; called solely from the take-aways → summary handler (not on print, not on every render); date format is en-GB long form; partner names joined with " and "; storage stays under the single `common-ground.session.v2` top-level key; the `.print-only` heading block is the first child of `#step-summary` (so print heading-area positioning is structural, not stylesheet-dependent).

**Choice:** Accept. Queue a release-note entry — flag explicitly to the Writer that this slice is small and a one-paragraph post is appropriate; if their judgement is that the slice doesn't independently warrant a post, combining with the *next* slice's release note is acceptable. Run the fifth rival check before assigning the next task.

**Reversible?** N/A — release note records what happened.

**Provisional next direction (refine after fifth rival check):** **Landing-copy tighten** is the deferred candidate from the 04:50 entry. The landing page has not been revisited since the MVP and now sells the product short — three new product beats (closing reflection, second arc, take-aways) plus the printed-PDF polish are unannounced on the landing surface. A tight editorial slice that updates the value-prop paragraph, the CTA copy (now selecting between two arcs), and the supporting copy to reflect what the product actually does. Small, defensible, no flow changes. Pacing affordances and a third arc remain on the bench but neither has stronger pull than landing-copy at this point. Hold the call until rival data is in.

---

## 2026-05-01 04:50 — Pick "printed-PDF refinement" as next slice; defer landing-copy tighten

**Context:** Fourth rival check (`coordination/rival-state.md` 04:45) shows Roundtable shipped clipboard copy + print since the third check, with their post title openly naming two P0 bugs. The artefact axis is now roughly equal between the two products. The 04:40 entry listed four candidates with a default lean toward printed-PDF refinement *or* landing-copy tighten. The new rival data tilts the call toward the former — they just stepped onto our turf on this axis and a small consolidating polish raises the bar without expanding scope.

**Choice:** Next slice is a printed-PDF refinement on both arcs: add the **session date** and the **partners' names** prominently to the printed heading area, so a household with a stack of saved sessions can tell at a glance whose conversation, when, and which arc. No new state, no new screens — pure summary + print stylesheet work.

**Rationale:**
- *Direct response to a moved rival.* Roundtable just shipped print. We've had print since the MVP. A small polish on the same axis demonstrates that we keep iterating on what we already have rather than ignoring it once it ships.
- *Genuine user value.* The current printed PDF names the arc in the heading but does not show the date or the partners' names anywhere prominent — a stack of two open-arc sessions a month apart is harder to tell apart than it should be.
- *Tiny scope.* No new screens, no new sessionStorage fields, no new flow. The session already knows the partners' names (from setup) and a date can be derived at print time. A bit of layout and stylesheet work on the existing summary screen and print rules.
- *Holds the privacy line.* Names already exist in `sessionStorage` per session; nothing new is being captured or transmitted.
- *Quality posture maintained.* Roundtable just published two P0 bugs alongside their slice. We've held green PASSes across five Reviewer cycles. Picking a small slice now keeps that clean run going.

**Working spec for the next task** (final shape locked in `current-task.md`):
- On the printed PDF, the heading area names: the product name, the arc name (already there), the partners' names (e.g. "Astrid and Bram"), and the session date in long-form British style (e.g. "1 May 2026"). One stack-readable block of metadata, not a paragraph.
- On the on-screen summary, the same metadata can appear in a smaller, less prominent line below the existing heading — engineer's call on whether to keep it or only print it. If on-screen, it must read sensibly without disrupting the existing layout.
- The date is computed at the moment the summary is *first reached* (not at print time), so a household that views the summary, walks away, and prints later sees the same date that was on screen. Derive once, store in the per-arc `sessionStorage` slot.
- Same constraints as before: no framework, no persistence beyond `sessionStorage`, no fetches, British English, mobile-readable.

**Reversible?** Yes — purely additive metadata; can be revised or dropped without disturbing flow.

**Defer:** Landing-copy tighten. Now genuinely worth doing (the landing has not been revisited since the MVP and now sells the product short with three new beats unannounced), but stacking it with this slice raises scope risk. Bring it back as the slice after this one if no new rival signal forces a change.

---

## 2026-05-01 04:40 — Accept take-aways; queue release note + run fourth rival check

**Context:** Reviewer returned PASS on the take-aways slice (commit `6649e7e`, source `ce2f0fb`, wrangler version `5de5be4c-e026-4b3d-a050-12897c0ffda0`). 82/82 Playwright passing, plus an independent 7-test reviewer suite confirming the load-bearing claims (single `sessionStorage` top-level key, per-arc isolation across actual landing navigation, empty input placeholders with no anchoring example text, heading-ends-with-`?`, helper copy contains "skip" and no "e.g./for example/such as", print-DOM ordering strictly `#revisit-section` → `#takeaways-section` → `#summary-list`, zero non-GET requests through full purchase-arc flow). Section heading the engineer chose: **"Taking forward"** — plain, symmetrical with "Worth coming back to", in keeping with the brief.

**Choice:** Accept the milestone. Queue a release-note style post. Run the fourth rival check before assigning the next task.

**Angle for the queued post:** Release note. The session now has *two* household-authored beats at the close — "Worth coming back to" (things to return to) and "Taking forward" (things to walk away with). Frame this as a session that ends somewhere rather than ending at a record. Quote the new heading and section name verbatim. Keep the elicit-not-prescribe stance visible (no examples in the inputs, no scoring, partner-fixed order). Do not telegraph the next direction.

**Reversible?** N/A — release notes record what happened.

**Provisional next directions, to refine after the fourth rival check:**
- *A short one-line "from this conversation" subtitle on the printed PDF.* If a household prints two PDFs (one open, one big-purchase), the heading already names the arc; a date and a short subtitle from the take-aways or worth-coming-back-to would make a stack of printed sessions more useful as a reference. Tiny slice; mostly print stylesheet work.
- *Pacing affordances revisited.* The deferred candidate from the 03:30 / 04:00 entries. Smaller felt impact than the content beats already landed.
- *A third arc for a recurring monthly check-in.* Doubles down on "arcs are the unit". Risk of feeling proliferative if the existing two are not yet well exercised.
- *Tighten the landing copy.* The landing has not been revisited since the MVP. With three new product beats (closing reflection, second arc, take-aways), the value prop on the landing page is mildly understated. Could be a small editorial slice.
Default expectation: lean toward the printed-PDF refinement or the landing-copy tighten — both small, both consolidating moves rather than expanding ones. Hold the call until the rival check is done.

---

## 2026-05-01 04:00 — Override pacing; pick "anything you're each taking from this?" as the next slice

**Context:** The 03:30 entry pencilled pacing affordances (read-aloud cues, "swap who goes first") as the likely next pick over a third arc. Third rival check (`coordination/rival-state.md` 03:35) shows Roundtable has not shipped since their MVP — no new pull on direction. Re-examining the candidate list before assigning, pacing is decoration; the stronger move is to add a new *content* beat to the session.

**Choice:** Add an eighth/seventh screen (open arc / big-purchase arc) between the closing reflection and the summary, asking *"Anything you're each taking from this?"*. One single-line input per partner, labelled with their setup names. Each partner writes one thing they are taking from the conversation — a thought, a small commitment, a thing to do this week. The summary surfaces these in a new section near the top, alongside "Worth coming back to" when present. Skippable; empty is fine.

**Rationale:**
- *Adds a content beat, not polish.* "Worth coming back to" answers "what should we return to?". This new step answers "what are we walking away with?" Together they form a satisfying close: things to revisit *and* small things to take forward. The session stops feeling like a record and starts feeling like a conversation that ends somewhere.
- *Holds the elicit-not-prescribe line cleanly.* The tool offers no examples, no suggested commitments, no "people often take this forward" copy. Two empty inputs, one per partner. The household authors the take-aways. Order on the summary follows partners' own ordering, never imputed.
- *Reuses the existing infrastructure.* `sessionStorage`-only state per arc, the same setup → prompts → reflection → (new step) → summary → print shape. Per-arc isolation already exists from the second-arc slice. The print path gets one more section near the top.
- *Distinguishes us further from Roundtable's "deck of five, simultaneous reveal" framing.* Theirs ends at the reveal. Ours now ends at "and what are you each taking from this?". Different theory of what makes the conversation work, deepened further.
- *Pacing affordances can come later or never.* Nothing about this decision precludes them. If, after this slice, the session still feels missing-something-physical-about-being-on-one-device, pacing becomes the natural follow-up. If not, we leave them un-built.

**Reversible?** Yes — the new step is additive and can be removed without disturbing the rest of the flow.

**Working spec for the next task** (final scope to be locked in `current-task.md`):
- New screen between the closing reflection and the summary, applied to *both* arcs identically.
- Heading: provisional **"Anything you're each taking from this?"** (engineer may refine if a tighter equivalent exists, but the framing must be a question that elicits, not a directive).
- Body: one short helper sentence (provisional: "A thought, a small thing to do this week, anything you each want to keep in mind. Skipping is fine.") and two single-line inputs labelled with the partners' names.
- Back returns to the closing reflection with all prior state preserved. **Next** advances to the summary; on this last input step the button label can read **"See summary"** for symmetry with the prior pattern.
- Summary section: a new block near the top, *below* "Worth coming back to" when both are present, *above* the prompt list. Section heading is the engineer's call — should be plain and symmetrical with "Worth coming back to" (e.g. "Taking forward", "Walking away with"). Each partner's take-away appears labelled with their name; if both are blank the section is omitted.
- Print path mirrors the on-screen ordering; both new top sections appear above the prompt list when present, with hidden chrome and the disclaimer footer once and legibly as before.
- Privacy posture, advice line, British English, mobile readability, single-device, no persistence beyond `sessionStorage` — all unchanged.
- Six-prompt arc wording unchanged. Big-purchase five-prompt wording unchanged.

---

## 2026-05-01 03:30 — Accept second arc; queue release note + run third rival check

**Context:** Reviewer returned PASS on the second-arc slice (commit `a1f3e0ca`, wrangler version `57f4d2cb-d5de-43d9-9acd-6be296added5`). 68/68 Playwright tests passing against the deployed URL (62 engineer + 6 independent reviewer). Storage migrated to `common-ground.session.v2` keyed by arc id; per-arc isolation confirmed; zero `fetch`/`XHR`/`sendBeacon` on any of the three served routes. README updated. The product now has two named conversations: **"An open conversation"** (six prompts, the original) and **"A big upcoming purchase"** (five prompts, the new arc), surfaced as parallel options on the landing page.

**Choice:** Accept the milestone. Queue a release note. Run the third rival check before assigning the next task.

**Angle for the queued post:** Release note — what shipped, why having a *second* arc is qualitatively different from having a longer single arc, and a brief connection back to the elicit-not-prescribe stance (both arcs equal citizens, no "recommended" framing, no scoring). The Writer can name Roundtable in passing if useful — their public "deck of five" framing makes it natural — but the post should not crow. The interesting move is structural ("arcs are now plural"), not competitive.

**Reversible?** N/A — release notes record what happened.

**Next direction (provisional, refine after third rival check):** Two candidates worth weighing.
- *Pacing affordances on the existing arcs* — the original deferred candidate from 02:40. Read-aloud cues, an explicit "pass the device" step before the partner switches focus, soft "swap who answers first" toggle. Reinforces single-device-together as a deliberate physical mechanic. Smaller and faster than another arc.
- *A third arc — something around recurring expenses or annual review.* Doubles down on "arcs are the unit" but begins to feel like proliferation rather than depth.
Pacing is the more likely pick — it deepens what we have rather than widening it — but the rival check might shift the call.

---

## 2026-05-01 02:40 — Pick "second arc" over pacing affordances; treat the arc itself as the unit

**Context:** Second rival check just landed (`coordination/rival-state.md` 2026-05-01 02:35). Roundtable shipped their MVP as "two devices, five prompts, simultaneous reveal" — each partner answers privately, then both answers are revealed at once. Different conversational dynamic to ours. Their landing page surface is unchanged; the new signal is in the blog post. Both teams now have shipped MVPs, with closing-reflection just shipped on our side.

The previous decision-log entry deferred a choice between two next-slice candidates: a *second arc* (a short alternative session for a different occasion, same tagging + summary mechanism) or *pacing affordances* (read-aloud cues, "swap who types first" affordances, soft pause-and-come-back state). This entry resolves it.

**Choice:** Build a **second arc** — a separately curated, shorter conversation arc for a specific occasion, accessed from the landing/setup screen as a session-type selector. The "Big upcoming purchase" arc is the working candidate; final prompt list to be confirmed in the task brief.

**Rationale:**
- *Direct response to "deck of five".* Roundtable's MVP positions a fixed five-prompt deck as the product. The right counterpunch is not a longer deck but a different *kind* of move: demonstrating that Common Ground treats the arc itself as the unit of work — we curate sessions, plural, for different occasions. That generalises a thing we have already invested heavily in (prompt curation) rather than racing them on plumbing we have already chosen not to build.
- *The mechanic generalises cleanly.* Setup → prompts → reflection ("Worth coming back to") → summary → save. The reflection step works for any arc because it just references "any of these prompts". We get to demonstrate the architecture is doing real work, not specific to the original six.
- *Distinguishes on a different axis.* Their differentiation is "simultaneous reveal". Ours becomes "we have a vocabulary of conversations, not one fixed question set". These can coexist in the market without converging.
- *Pacing affordances are weaker for this slot.* Read-aloud cues are text-only nudges; they do not visibly add to the product the way a second arc does. Pass-the-device or swap-who-types-first features ride the same in-room pairing axis but require more state-tracking for less observable value. They can come later or never; nothing about this decision precludes them.
- *Curating "Big upcoming purchase" is in character for a non-crisis household (per the brief).* It is concrete and decision-oriented, narrower than the original six, and elicits without prescribing. A different vibe to the broad reflective opener arc.

**Reversible?** Yes — adding a second arc does not constrain future moves. If the second arc lands and pacing turns out to matter, we can revisit then.

**Working spec for the next task (to be tightened when current-task.md is written):**
- A landing/setup-level *session type* selector with two named arcs: the existing six-prompt arc (provisional name to confirm in task — perhaps "A money conversation" or "An open conversation") and the new "A big upcoming purchase" arc (5 prompts, curated by the Orchestrator and locked verbatim like the first six).
- The new arc reuses the existing setup → prompt → reflection → summary → print flow, with the prompt list and the "current arc" name swapping based on selection.
- Cross-arc state isolation in `sessionStorage` so resuming or restarting one arc does not leak into the other. Explicitly: each arc has its own answers/tags/notes; choosing a session type at setup is the entry point to either.
- The second arc must be visible on the landing page as a parallel option, not buried — both the landing CTA and the setup screen reflect the choice.
- Privacy posture, advice line, British English, mobile readability, single-device-only — all unchanged.

**Pending hand-offs to close before assigning the task:** Closing-reflection post is queued (`coordination/blog-queue.md`). Per the role rules, the Orchestrator's next action is to hand to the Writer. Engineering on the second arc waits for the next cycle.

**Curated prompts for the second arc (orchestrator-locked; the task will require these verbatim):**
1. *"What is the purchase, and roughly how much are we talking about?"*
2. *"What would having it actually change about your day-to-day, in a sentence each?"*
3. *"What are you each willing to trade off for it — saving rate, another goal, a different timeframe?"*
4. *"What would have to be true about the rest of your finances for this to feel comfortable rather than tight?"*
5. *"If you imagine yourselves twelve months after the decision — bought it or didn't — what would each of you most want to be able to say?"*

These follow the same elicit-not-prescribe rule: each asks the household what *they* think or are willing to do, with no prescription about what the right answer looks like. Order is concrete (what + how much) → felt (what changes) → values (what to trade) → conditions (what would make it comfortable) → forward-looking (twelve months out). All five are skippable.

---

## 2026-05-01 02:30 — Accept closing reflection; queue post + run second rival check

**Context:** Reviewer returned PASS on the closing reflection slice (commit `5ddbe628`, final commit `7a3a16f`, wrangler version `336e69d9-32d4-4c7e-a42b-491377027be0`). 49/49 Playwright tests passing against the deployed URL, including a fresh 14-test suite covering each DoD-8 sub-item: per-partner tagging, persistence across Back/Next, distinct on-screen "Worth coming back to" rendering, print-emulation top-ordering, network-watch through the full flow with sentinel notes, mobile readability at 375px. Privacy posture intact — same `sessionStorage` key, no `localStorage`/cookies/fetch/XHR/sendBeacon in the served `/session` source.

**What shipped (concretely):** A seventh screen between prompt 6 and the summary asking "Anything to come back to?". Each partner can tag any of the existing six prompts as worth revisiting and add a one-line note. Tagged prompts surface in a "Worth coming back to" section at the top of both the on-screen summary and the printed PDF. Skipping the reflection entirely is allowed and renders the summary identically to the pre-reflection layout. Wording of the six prompts is untouched.

**Choice:** Accept the milestone. Queue a release-notes-style blog post. Run the second rival check before assigning the next task, per the role rules.

**Rationale for the queued post angle:** This is not a launch post and not a design-decision post — it is the first true *release note* for Common Ground. The angle should be short and concrete: what shipped, what it feels like in a session, the design choice that tagged order matches original prompt order (no scoring, no ranking, no "you should revisit this"), and one line connecting it to the position established in the launch post — we said we would lean into the conversation arc rather than the plumbing, this is the tangible follow-through. The Writer can decide whether to bundle it with anything else queued; the Orchestrator's job is just to ensure nothing ships silently.

**Reversible?** N/A — the post records what happened.

**Next direction (provisional, refine after second rival check):** Two candidates worth weighing once we see what Roundtable has done since 01:35:
- *Second arc.* A short alternative session for a different occasion — annual review, big purchase decision, or onboarding a new shared expense. Same tagging + summary mechanism, different curated prompts. Strengthens the "the session is a thing, not just six questions" framing without touching plumbing.
- *Pacing affordances.* "Pass the device" cues, optional read-aloud framing for prompts, a soft pause-and-come-back state — features that only make sense for two people on one device. Distinguishes the product on its own terms rather than in opposition to Roundtable.
Hold the choice until after the rival check.

---

## 2026-05-01 01:40 — Hold single-device line; next slice strengthens the conversation, not the plumbing

**Context:** First rival check just landed (see `coordination/rival-state.md` 2026-05-01 01:35). Rival product is **Roundtable**, same brief, materially different choices: multi-device join handshake, server-side session storage on Cloudflare KV with a 24-hour TTL, no PII. Their landing page and RSS show no prompt content — we cannot tell what they ask households to discuss without walking their two-device session. The previous decision-log entry deferred the next-task choice to "after rival check + a fresh look at the brief"; this entry resolves it.

**Choice:** Do not chase multi-device. Hold single-device-together as the deliberate stance. The next slice strengthens **what the conversation does**, not the plumbing — specifically a closing reflection step that surfaces what the household might want to revisit, without prescribing.

**Rationale:**
- *We already published the position.* The "why-one-device-one-session" post argued the case in public. Pivoting to multi-device a few hours later would read as reactive, not deliberate, and would hand our most defensible claim — "no answer text leaves the device, by construction" — back over for nothing the brief actually rewards. The brief evaluates "what does your decision trail show about how you reasoned under ambiguity"; reversing under no real pressure is a worse trail than holding under observed pressure.
- *Roundtable's surfaced materials don't show the arc.* Their landing page and RSS do not describe what their session asks. Common Ground's six-prompt curation is doing real product work that they may or may not have. Compounding our advantage there is cheaper than catching up on plumbing they have and we don't.
- *A closing reflection is in scope and in character.* Six prompts that end with a summary is a session; six prompts that end with "what's worth revisiting?" is a conversation that gives the household something to take into the rest of their week. The line "elicit, never prescribe" still applies — the closing prompts ask the household to decide what to revisit, the tool does not flag, score, or recommend.
- *Reversibility.* Multi-device can be reconsidered later if signal forces it. Adding a closing reflection now does not preclude that.

**Reversible?** Yes. The closing reflection is additive; it does not constrain future architectural moves.

**Next slice (to be scoped properly when assigned, not pre-committed here in detail):**
- Add a final step after prompt 6 (so a *seventh* screen, not a seventh prompt) titled something like "Anything to come back to?". Both partners can each tag any of the previous six prompts as "worth revisiting" and optionally add a one-line note. The summary then highlights tagged prompts at the top, with notes if present. Skipping is still allowed.
- Same constraints as before: in-page state only, no framework, no persistence, British English, mobile-readable, print path still produces a clean A4 with the tagged items at the top.

**Pending hand-offs to close before assigning the next task:**
- Launch post for the MVP is queued (`coordination/blog-queue.md`, "MVP shipped: six-prompt session with saveable summary"). The Orchestrator's next move is to hand to the Writer for that post; engineering on the closing-reflection slice waits until after the Writer cycle returns.
- Update the queued angle on that post: the line "the next move is to take a look at what the rival has shipped" is now stale (the check is done). I will refine the queue entry's angle so the Writer's draft is accurate without telegraphing the closing-reflection slice.

---

## 2026-05-01 01:30 — MVP shipped; queue launch post

**Context:** Reviewer returned PASS on the six-prompt arc + saveable summary (commit `38e2d55`, wrangler version `59972d66-01f9-4d6f-a260-e0128009f161`). Independent verifier suite added by the Reviewer; 35/35 Playwright tests passing against the deployed URL. All MVP-definition criteria from `BRIEF.md` are now true: deployed at a public URL, self-serve entry, core interaction works end-to-end for a realistic scenario (a household sitting down for ~15 minutes through six prompts with a saveable summary at the end), and a real root README. No financial advice given, no answer text reaches the server (verified — zero non-GET requests across the full flow, including the print click), `sessionStorage` is the only persistence.

**Choice:** Declare MVP shipped. Queue a launch post to the blog. Hand to Writer next per the role rules.

**Rationale:** This is the milestone the brief defines, not a release note. The previous two posts were *introduction* and *design-decision*; this one is *launch* — the product now does the thing it promised. Worth a standalone post even if the Writer judges the previous two as adjacent. The launch post is also the strongest place to plant our flag on the privacy posture and the advice line, both of which are now demonstrable claims rather than promises.

**Reversible?** N/A — shipping a milestone is a fact, not a decision to reverse.

**What comes after the launch post:**
- A first rival check (`/check-rival`). We have a real product now, so observation is informative rather than reactive.
- Iteration based on what we see — likely candidates: a way to *resume* a session in progress (still client-side, e.g. a copy-link-with-state mechanism if it can be done without storing answers server-side), a "what shifted" reflection step that surfaces alignments and divergences without prescribing, or a second curated arc for a different occasion (annual review, big purchase). Pick after rival check + a fresh look at the brief.

---

## 2026-05-01 01:05 — Reverse "no blog post yet"; queue both PASSes

**Context:** The orchestrator role file's hand-off conditions were updated mid-flight. New rule: after every Reviewer PASS, append an entry to `coordination/blog-queue.md` describing what shipped *before* assigning the next task. The previous entry's "not yet, hold the launch post" stance is no longer compatible.

**Choice:** Queue two blog entries now — one for the landing-page PASS (commit `3bb7046`) and one for the session-flow PASS (commit `f42ca71`) — and hand to the Writer. Park the next engineering task (curated prompt list + saveable summary, scoped in the previous decision-log entry) until the Writer hand-off cycles back.

**Rationale:** The new rule is explicit ("every PASS gets a post queued"), and the role file itself notes that the Writer decides whether to combine adjacent entries — so the previous concern about "two thin posts" is handled at the Writer's discretion, not by withholding milestones from the queue. Coherence with the rule beats my prior preference.

**Reversible?** Yes — the queue can be edited, and individual entries can be combined or deferred by the Writer.

---

## 2026-05-01 01:00 — Accept session slice; curate prompts and push to MVP

**Context:** Reviewer returned PASS on the single-prompt session flow (commit `f42ca71`). All 21 Playwright tests green against the deployed Worker; the no-network-write guarantee holds (zero `fetch`/`XHR`/`sendBeacon` tokens in served JS, zero write requests during a full session). The interaction loop works. What's missing for the MVP definition is (a) more than one prompt — one prompt is a demo, not a "realistic scenario", and (b) something the household can keep at the end. Persistence model is unchanged: in-page only.

**MVP gap analysis vs. `BRIEF.md`:**
- *Deployed at a public URL.* ✅ Done.
- *Sign-up without manual intervention.* ✅ No accounts; opening the URL is the entry.
- *Core interaction works end-to-end for at least one realistic scenario.* ⚠️ Loop works but one prompt is not a scenario.
- *Short README at repo root.* ⚠️ Exists, but the "how to use" section is a placeholder; needs updating once the flow is real.

**Choice:** Next slice expands to a curated list of six prompts with progress + back/next navigation, and adds a saveable summary (browser print to PDF via `window.print()` and a print stylesheet). Same in-page state model. After this lands and a Reviewer PASS confirms it, the MVP is shipped and we queue the launch post for the Writer.

**Curated prompt list (orchestrator-owned product call):**
1. "What's one money decision coming up in the next three months that affects both of you?"
2. "When you think about money in your household right now, what feels good — and what feels uncertain?"
3. "If a windfall of one month's take-home pay turned up tomorrow, no strings attached, what would each of you want to do with it?"
4. "What's a recurring expense you'd like to talk about — bigger, smaller, or just understood differently — but haven't?"
5. "Looking twelve months ahead, what's one thing about your money you'd like to feel more settled about?"
6. "Is there something about money you wish your partner understood about how you grew up with it?"

**Why these six:**
- All elicit, none prescribe — they ask each partner what *they* think, not what they *should* do. Keeps us clearly on the right side of the regulated-advice line.
- They move from concrete-and-near (decisions in three months) → felt experience → playful (windfall) → quietly difficult (recurring expense) → forward-looking → personal/historical. The arc gives a session a shape rather than a flat list.
- Six fits a single sitting (~10–15 minutes for two people) without feeling like homework.
- All are benign for non-crisis households per the brief, and answerable by people with no financial expertise.
- Skippable (empty answers allowed) so a household can step over anything that doesn't land.

**Saveable summary:** browser-native print is the smallest defensible option — works offline, no servers touch the answers, the household chooses where the PDF lives. Reinforces the privacy posture rather than undermining it.

**Reversible?** Yes — the prompt list is data; we can revise wording, reorder, add/remove, after seeing the rival's product or our own first run-through.

**Not yet:** Still no rival check, still no blog post. After this slice ships and PASSes, queue the launch post and *then* poll the rival once — having a real product first means the rival check informs iteration, not initial framing.

---

## 2026-05-01 00:30 — Accept landing page; pick the session shape

**Context:** Reviewer returned PASS on the Common Ground landing page (commit `3bb7046`, live at https://rivals-team-beta-product.kevin-wilson.workers.dev). All eight checklist items verified, including a new Playwright suite at `apps/product/tests/landing.spec.ts`. Reviewer flagged the legacy `apps/product/tests/smoke.spec.ts` as stale (still asserts "coming soon"). With the landing page accepted, the question is what the *core interaction* actually is — we need to commit before scoping the next slice.

**Options considered for the session shape:**
1. **Single-device, synchronous, client-side state.** Two partners share one browser. The page steps through prompts; both answer per prompt; a summary view at the end. No accounts, no server-side storage of answers — state lives in the page (and optionally `sessionStorage`).
2. **Async, two-device, account-backed.** Each partner signs in, answers privately, the tool reveals overlaps when both finish. Needs auth, persistence, an invite/pairing flow.
3. **Shareable session ID, server-stored, no accounts.** One partner creates a session, gets a URL, the other joins from another device. KV with short TTL holds answers.

**Choice:** Option 1 for the MVP. Synchronous, single-device, in-memory only.

**Rationale:**
- *Brief fit.* "Multi-user by nature" is satisfied at the UX layer — both partners are clearly named in the flow and answer separately. The brief never requires accounts.
- *Privacy by construction.* Nothing leaves the device. The strongest possible privacy posture is "we don't store anything," and we get it free.
- *Shippable.* No auth, no DB, no invite/pairing logic. The first realistic scenario can ship as one Worker serving HTML+JS.
- *Defensible in a blog post.* "We chose the smallest product that meets the brief and explicitly trades remote-pairing for zero data collection" is a clean narrative the rival cannot copy without giving up something.
- *Reversible.* Adding async/remote later means layering in a session ID + KV/D1; the in-memory flow stays the same on a single device. We do not back ourselves into a corner.

**Reversible?** Yes — the storage and pairing model can be swapped in later without rewriting the prompt flow.

**Next concrete goal:** A vertical slice that takes a user from the landing page through *one* prompt answered by both partners and into a summary screen. This is the smallest end-to-end thing that proves the interaction. Subsequent tasks expand the prompt list, polish, and add a saveable summary.

**Not yet:** Blog post. Landing page alone is not "a meaningful change shipped" — hold the launch post until the first usable session is live, so the Writer ships one strong post rather than two thin ones. Also no rival check yet — we have nothing to react to.

---

## 2026-05-01 00:00 — Initial reading of the brief

**Context:** T+0 of the hackathon. Brief is `BRIEF.md`. Repo currently has a placeholder "coming soon" Worker for the product and an Astro blog skeleton. No prior decisions logged. No rival activity yet to react to.

**The brief in my own words:** Build a deployed web app that a household (two or more adults sharing finances) uses *together* to have a more deliberate conversation about their joint money. It is not a budgeting app, not advice, not a single-user dashboard. The shape of "the conversation" is ours to define. MVP requires: public URL, self-serve sign-up (no manual onboarding), the core interaction working end-to-end for one realistic scenario, and a root README. Public blog posts (launch + release notes + design rationale) are part of the deliverable and are visible to the rival.

**Initial product framing (provisional, revisable):** A guided "money conversation" session that two partners step through together. Structured prompts cover near-term decisions, priorities, and concerns; both partners answer; the session ends with a shared summary they can save. Targeted at a single sitting. No financial advice — the tool surfaces what the household already thinks, it does not recommend. Working name: **Common Ground**. Re-examine after MVP.

**First concrete goal toward shipping:** Replace the placeholder Worker with a real landing page that names the product and frames the value prop, plus a root README that satisfies the MVP requirement. This forces us to commit to framing on day one and gives the Writer something concrete to launch around. Persistence, auth, and the actual session flow come next, in that order.

**Constraints that jumped out:**
- *Regulated-advice line.* Prompts must elicit, never prescribe. No suggestions about what to do with money, no calculators that imply optimal answers. Disclaimer in footer from day one.
- *Multi-user must be evident from the UX, not just the data model.* A single-user dashboard fails the brief.
- *Privacy.* Household financial data is sensitive — minimise what we store server-side. Prefer session-scoped state (KV with short TTL, or client-side) over user accounts unless the product clearly needs them.
- *Public blog is adversarial-ish.* The rival reads our posts. Be candid about decisions but don't telegraph unshipped work.
- *Deploy target is fixed* (Cloudflare Workers). Stack inside `apps/product/` is ours.

**Reversible?** Yes — framing and product name are explicitly provisional.
