# Rival state

Updated by the Orchestrator after each rival check. Most recent at top.

---

## YYYY-MM-DD HH:MM

**Product URL state:** What's at the rival's product URL right now.
**Recent posts:** Latest 3 entries from the rival's blog feed, summarised.
**Implications:** Does this change our priorities? Why or why not.

---

## 2026-05-01 08:05 — Eighth check (rivals-team-alpha / "Roundtable")

**Product URL state:** Landing page copy *still* unchanged. They shipped the 2–4 product change at the seventh check and have not yet tightened the landing copy to reflect it. Same single CTA, same KV/no-PII privacy stance, same disclaimer.

**Three new posts since the seventh check (verbatim from RSS):**
1. **"One last thing — together: a single shared sentence after the deck"** — 2026-05-01. They added a *closing-collaboration beat* after their five-prompt deck: a single shared sentence "anyone present can write or revise." This is the conceptual axis our closing reflection ("Worth coming back to") and take-aways ("Taking forward") have been on since the second slice — Roundtable has now caught up to that axis with a different mechanic (collaborative shared sentence vs. per-partner inputs). Different theory of the close-of-session dynamic; same recognition that ending at a record alone is not enough.
2. **"Retrospective: what we built today, what we didn't, and why"** — 2026-05-01. *Their* retrospective. RSS description references "deliberate non-choices and two shipped bugs, plus how Roundtable diverged from a competing product." They have also moved into wrap-up mode.
3. **"The advice line, audited and locked in"** — 2026-05-01. They added *automated testing* for the advice-line boundary, citing "implicit evidence" approach.

**Total post count:** Roundtable now at eight; Common Ground at seven published with one queued (pre-this-check; the partner-count post is being handed to the Writer next, taking us to eight on parity).

**Implications — does this trigger another reversal?**
- *Closing-collaboration beat.* Roundtable catching up to the close-of-session axis is significant but does not call for a response. We are *ahead* on this axis (two close beats — reflection + take-aways — vs. their one shared sentence). Building a third close beat to stay ahead would be expanding for expansion's sake. Hold.
- *Their retrospective.* Parallel work. Both teams have now produced a retrospective. Their having one does not require us to revise ours. Hold.
- *Their advice-line automated audit.* Worth considering. We do hold the advice line through design choices (no scoring, no ranking, no examples in inputs, neutral arc selection) and our test suite already enforces several specific guards (the landing-copy outcome-claims/advice-framing guard from the 240ac199 slice, the no-fetch grep, the no-example-placeholder assertions in the take-aways spec). We do *not* have a single named "advice-line guard" spec that consolidates these. Could add one in a small slice. **But:** what they describe is "implicit evidence" + automated testing, which is roughly what we have without the consolidation. The marginal value of a consolidating slice is low and would be motivated entirely by visible parity rather than by any actual gap. Hold.
- *Their landing still doesn't mention partner count.* Mirror of our own gap (engineer's commit added a tight in-paragraph mention but did not rewrite the lede). Symmetric. Not a trigger.

**Net read:** No reversal. The partner-count slice was the one extension justified by a brief-text gap; nothing in this check meets that bar. Re-close wrap-up.

---

## 2026-05-01 07:00 — Seventh check (rivals-team-alpha / "Roundtable") — out-of-cycle, triggered by Writer hand-back

**Trigger:** The Writer flagged on hand-back that Roundtable's RSS now lists a fifth post that did not exist at the sixth check (06:35). Out-of-cycle rival check ran to verify before reversing decisions.

**Product URL state:** Landing page copy *unchanged* from prior checks — they have shipped the product surface change but not yet tightened the landing copy to mention party size. Same single CTA, same KV/no-PII privacy stance, same disclaimer.

**New post (verified verbatim from RSS):**
- **"Two or more, taken at face value: Roundtable now seats 2–4"** — 2026-05-01. *New.*
  Description (verbatim from feed): *"We've generalised Roundtable from a tool for two to a tool for two, three, or four — the first product axis we've picked"* (description text appears truncated in the feed). Their post's framing as relayed by the Writer who read it: *"the first product axis we've picked entirely on our own terms"* and *"Plurality went first because the brief said so plainly and we had not honoured it."*

**Posts now total five** for Roundtable (versus our seven plus the just-shipped retrospective).

**Implications — material:**
- *Roundtable correctly diagnosed an axis we missed.* `BRIEF.md` reads: "A household of two or more adults who share some or all of their finances." Common Ground's setup screen, prompt copy ("you and your partner"), and entire data model all assume *exactly two*. We did not deliberately pick the two-only reading — we defaulted to it. Roundtable's diagnosis is honest and correct.
- *This meets the bar set in decision-log entry 06:40.* That entry's reversibility note read: *"if Roundtable ships something that genuinely calls for a response, iteration can resume. The decision is 'stop now', not 'stop forever'."* This is that signal. It is not a re-litigation of architecture (where we hold the line); it is a brief-text axis we have not honoured. Resuming for one more slice is the right move.
- *The retrospective post stands.* Written before this signal landed, the retrospective does not commentate on this Roundtable slice and is correct as it reads. The next blog post (after the next PASS) is where the partner-count slice and the rival's role in surfacing it get acknowledged.
- *We are not chasing.* The architectural difference (single-device vs. multi-device, in-page vs. server-ephemeral, two-arc library vs. fixed deck) all hold. The partner-count extension is generalising along the brief's wording, not adopting Roundtable's design.

---

## 2026-05-01 06:35 — Sixth check (rivals-team-alpha / "Roundtable")

**Product URL state:** Unchanged. Frozen across three consecutive rival-check windows now (fourth → fifth → sixth). Same product surface, same copy, same single CTA, same KV/no-PII privacy stance, same disclaimer. No second arc, no post-session capture beyond what landed at the fourth check.

**Recent posts (RSS):** **No new entries** since the fourth check. Still four posts.

**Implications:**
- *Roundtable has visibly stopped iterating, at least for now.* Three frozen rival-check windows in a row is a stronger signal than one — they're either done or paused. Our move does not depend on which.
- *No new pull on direction.* The 06:30 provisional pick (retrospective post over more iteration) holds and is in fact strengthened by another frozen window. No decision-log entry strictly required for this check, but a brief entry confirming the move from iteration to wrapping-up is useful for the decision trail.
- *Position summary at end of sixth check:* Common Ground has shipped 7 PASS verdicts (landing → single-prompt → MVP six-prompt → closing reflection → second arc → take-aways → printed-PDF metadata → landing-copy tighten — that's 7 since the very first deploy, with the MVP at the third), 6 published blog posts and one small landing-copy post queued, 0 acknowledged P0s. Roundtable: 4 posts, 1 acknowledged-P0-paragraph in their fourth post, frozen for three rival windows. The brief's evaluation criteria (decisions evolved, divergence with rival, advice-line handling, decision-trail under ambiguity) are well-populated by our coordination files and posts. The strongest remaining single artefact would be a retrospective that engages those criteria explicitly — not a code slice.

---

## 2026-05-01 05:35 — Fifth check (rivals-team-alpha / "Roundtable")

**Product URL state:** Unchanged from the 04:45 check. Same product surface, same copy, same single CTA, same KV/no-PII privacy stance, same disclaimer. No new framing, no new screens hinted at, no second arc, no post-session capture beyond what landed in their 04:45-era post. Verbatim tagline still: "It walks you through the topics together, keeps the conversation balanced, and captures what you decide. It is not a budget tool, not an advisor — just a structured way to have the talk you have been meaning to have."

**Recent posts (RSS):** **No new entries since the fourth check.** Still four posts: "Project under way" (Apr 29), "Roundtable, and the join handshake that follows" (May 1), "MVP shipped: the deck of five and a working conversation" (May 1), and "A take-away on our terms, and two bugs that taught the same lesson" (May 1).

**Implications:**
- *Roundtable is now frozen for two consecutive rival-check windows* (between the third and fifth checks). In the same span we shipped the second arc, the take-aways step, and the printed-PDF metadata polish, with three release notes published and a fourth queued. Six product slices in total versus their three; six published posts in total versus their four.
- *No new pull on direction.* The 05:30 provisional pick (landing-copy tighten) holds. No fresh rival data to weigh against it. No decision-log entry needed for this check.
- *Possible reads of Roundtable's stall:* unchanged from the third-check note — either mid-build or done. Either way our move (consolidate by tightening the landing copy to reflect what we now have) is the right one regardless of which is true.
- *Optionality kept:* if the next slice ships and Roundtable still hasn't moved, we have headroom for one or two more consolidating moves before re-examining whether to expand (a third arc, pacing affordances) or to call the project done.

---

## 2026-05-01 04:45 — Fourth check (rivals-team-alpha / "Roundtable")

**Product URL state:** Landing page unchanged from prior checks. Same copy, same single CTA, same KV/no-PII privacy stance, same disclaimer. Still no surface hints of multiple session types or post-session capture features.

**Recent posts (RSS):** *One new post since the third check.*
1. **"A take-away on our terms, and two bugs that taught the same lesson"** — 2026-05-01. *New.* Per the description, they shipped clipboard copying and print functionality and then hit two P0 bugs that "taught the same lesson" about their development process. The title's phrasing ("on our terms") implies they had to engineer around their KV storage model to produce a save-the-conversation artefact — a privacy challenge we did not have because of our `sessionStorage`-only stance.
2. **"MVP shipped: the deck of five and a working conversation"** — 2026-05-01. *Seen previously.*
3. **"Roundtable, and the join handshake that follows"** — 2026-05-01. *Seen previously.*
4. **"Project under way"** — 2026-04-29. *Seen previously.*

**Key new observations:**
- *Artefact axis caught up.* Roundtable now has print + clipboard copy of the session record. We have print-to-PDF as the save mechanism since the MVP. We are roughly equal on this axis now.
- *Quality cost on their side.* Their post title openly names two P0 bugs landed during the artefact slice. Common Ground has held green PASS verdicts across five Reviewer cycles (35 → 49 → 62 → 68 → 82 Playwright tests, with independent reviewer suites added every time). Quiet differentiator; do not crow about it.
- *No content-arc moves.* They still have the static deck of five, no post-session capture beyond export, no second arc. Our two content beats at the close (closing reflection + take-aways, both shipped today) remain differentiating on the conversational dynamic axis.

**Implications:**
- *Reprioritise the next slice.* The 04:40 decision-log entry left four candidates open with a default lean toward printed-PDF refinement OR landing-copy tighten, both consolidating moves. Roundtable's artefact shipment makes the printed-PDF refinement the more directly relevant of the two — they have just stepped onto our turf on this axis, and a small, defensible polish (date + partners' names visible in the printed heading) raises the bar on the same axis without expanding scope. Logging this in a fresh decision-log entry.
- *Hold all other lines.* No pull on multi-device, no pull on a third arc, no pull on pacing. Privacy posture remains the cleanest single architectural difference between the two products.
- *Possible blind spots still:* Roundtable's actual prompts (the deck of five) remain unseen by us — would require a two-device walkthrough. Defer; nothing about our next pick depends on knowing them.

---

## 2026-05-01 03:35 — Third check (rivals-team-alpha / "Roundtable")

**Product URL state:** Unchanged from the 02:35 check. Same copy ("A guided money conversation for households", "It walks you through the topics together, keeps the conversation balanced, and captures what you decide. It is not a budget tool, not an advisor — just a structured way to have the talk you have been meaning to have."), same single "Start a session" CTA, same KV/no-PII privacy stance, same disclaimer. No multiple-arc framing on their landing surface. No new copy. No new routes hinted at.

**Recent posts (RSS):** No new entries since the second check. Still three posts: "Project under way" (Apr 29), "Roundtable, and the join handshake that follows" (May 1), and "MVP shipped: the deck of five and a working conversation" (May 1).

**Implications:**
- *Roundtable has not shipped since their MVP post.* In the same window we have shipped two slices (closing reflection, second arc), have a third release-note post queued for publishing, and now have four published posts to their three.
- *No new pull on direction.* The previously provisional next slice (pacing affordances on the existing arcs) still looks correct — the rival check produces no signal that would reprioritise. No decision-log entry needed for this check; the prior 03:30 entry stands.
- *Possible read of Roundtable's pause:* either they are mid-build on something larger (multi-prompt deck, a second arc of their own, an export feature), or they are done. Either way, our move is unchanged — deepen what we have rather than chase a phantom they may or may not be building.

---

## 2026-05-01 02:35 — Second check (rivals-team-alpha / "Roundtable")

**Product URL state:** Same product page as the first check. Landing copy unchanged ("a guided money conversation for households", "walks you through the topics together, keeps the conversation balanced, and captures what you decide"), single "Start a session" CTA, same advice disclaimer, same privacy stance ("Sessions are stored on Cloudflare KV for 24 hours, then deleted. We do not collect accounts, names, or emails."). No new copy, no secondary routes hinted at from the landing surface. Visual style still minimal/utilitarian. We did not walk the session itself this round either — would need two devices.

**Recent posts (RSS, most recent first):**
1. **"MVP shipped: the deck of five and a working conversation"** — 2026-05-01. *New since last check.* Describes their shipped MVP as "two devices, five prompts, simultaneous reveal" with stated tool boundaries.
2. **"Roundtable, and the join handshake that follows"** — 2026-05-01. *Seen previously.*
3. **"Project under way"** — 2026-04-29. *Seen previously.*

**Key new observation: "simultaneous reveal".** This was not visible on the first check. Roundtable's mechanic appears to be: each partner answers a prompt privately on their own device, then both answers are revealed at the same time. That is a meaningfully different conversational dynamic from ours — Common Ground has both partners answering side-by-side, each seeing the other's words as they type. Theirs isolates first then surfaces; ours co-creates throughout. Both are defensible interpretations of "having a productive conversation about money together"; they emerge from very different theories of what makes the conversation work.

**State of play, by axis:**
- *Pairing model.* Common Ground = single-device, in-room. Roundtable = multi-device, can be remote.
- *Storage.* Common Ground = `sessionStorage`, in-page only. Roundtable = KV with 24-hour TTL, no PII.
- *Prompt arc.* Common Ground = six curated prompts + closing reflection ("Worth coming back to") that surfaces tagged items. Roundtable = "deck of five" with simultaneous reveal. Their post does not surface prompt content.
- *Closing artefact.* Common Ground = printable A4 PDF, household-controlled. Roundtable = unclear from the post; "captures what you decide" implies some persisted summary on KV until 24h expiry.
- *Tone signal.* Both teams holding the same advice-line copy. Both shipping at similar cadence (we have 3 posts published + 1 queued; they have 3).

**Implications:**
- *No drift on architecture.* The simultaneous-reveal mechanic is the most interesting thing they've shipped, and it is *only* possible with multi-device + private answering. We don't have it and we won't — pivoting to copy it would require throwing out the privacy posture we've now demonstrably shipped and built two posts around. Hold the line.
- *The "deck of five" framing tightens our differentiation strategy.* Their five-prompt set is presumably static. The next slice should demonstrate that Common Ground treats *the arc itself* as a thing — i.e., not "six fixed prompts" but "we curate sessions, plural, for different occasions." This generalises our prompt-curation work and answers their static-deck framing on its own ground.
- *Reflection step we just shipped is well-positioned.* "Worth coming back to" is the post-prompt beat that *only* makes sense when both partners are in the room together, deciding which threads to pull. It is to our pairing model what simultaneous reveal is to theirs.
- *No advice-line risk.* Both teams holding the line. Nothing to monitor here yet.
- *Follow-up ideas (not next-task commitments — see decision-log 2026-05-01 02:40 for the chosen direction):*
  - We still haven't seen Roundtable's actual prompts. A two-device walk of their session would inform our next-arc curation. Cost: requires opening it on two browsers/contexts. Defer until the next slice ships.
  - Their summary's persistence model is a possible weak point — a household that wanted to keep the record beyond 24h on Roundtable cannot, where Common Ground produces a household-controlled PDF on the spot.

---

## 2026-05-01 01:35 — First check (rivals-team-alpha / "Roundtable")

**Product URL state:** Live at https://rivals-team-alpha-product.kevin-wilson.workers.dev. Product is named **Roundtable**, framed as "a structured conversation tool" for households to discuss shared finances together. Landing page presents the value prop ("walks you through the topics together, keeps the conversation balanced, and captures what you decide"), a **"Start a session"** CTA suggesting a functional flow, and an explicit no-advice disclaimer. Visual style is minimal, utilitarian. Privacy stance is stated on the landing page itself: **sessions are stored on Cloudflare KV with a 24-hour TTL, no accounts, no names, no emails**. We did not click through the session itself on this check (the join mechanic on a multi-device flow is harder to inspect via single fetch); their RSS post 1 implies a two-device "join handshake".

**Recent posts (RSS, most recent first):**
1. **"Roundtable, and the join handshake that follows"** — 2026-05-01. Covers the move from initial framing to a working *two-connected-devices* mechanic. They are doing remote/multi-device pairing.
2. **"Project under way"** — 2026-04-29. Project announcement / framing post.
*(Only two items in the feed at present.)*

**Key divergences (us → them):**
- *Storage model.* Common Ground: zero server-side storage of answer text, `sessionStorage` only. Roundtable: KV with 24-hour TTL, no PII. Both defensible, ours stronger.
- *Pairing model.* Common Ground: synchronous, single-device, two partners on one screen. Roundtable: multi-device, async-capable via a join handshake. Theirs supports households not sitting together; ours does not.
- *Prompt content.* Common Ground: a curated six-prompt arc with explicit wording that elicits-not-prescribes. Roundtable's RSS and landing page do not surface prompt content; we cannot tell what they actually ask households to discuss without doing the join flow on two devices ourselves. **Possible blind spot — worth a follow-up check** that walks the session.
- *Cadence.* Roughly even. They have 2 posts (4 days, 2 days ago); we have 2 published + 1 launch post queued. Both teams shipping at roughly the same rhythm.

**Implications:**
- *Do not chase multi-device.* Roundtable picked the opposite of our binding architectural choice. Pivoting now would mean abandoning the privacy posture we explicitly framed in the published "why-one-device-one-session" post. The right move is to lean further into single-device-together as the deliberate stance, not to react.
- *Lean into prompt and arc quality.* Roundtable's surfaced material does not show what their conversation arc is. Our six curated prompts and end-of-session summary are likely a real differentiator — the next slice should strengthen *what the conversation does*, not the plumbing.
- *No new pressure on advice line.* Both teams are holding the same disclaimer language. No risk to monitor here yet.
- *Follow-up rival check.* After the next slice ships, walk Roundtable's session on two devices to learn what they actually ask, so we have content-level intelligence rather than just architectural. Cheap, informative, and we can copy nothing from prompts under copyright concern but their *approach* to a conversation arc is fair signal.
