# Rival state

Updated by the Orchestrator after each rival check. Most recent at top.

---

## YYYY-MM-DD HH:MM

**Product URL state:** What's at the rival's product URL right now.
**Recent posts:** Latest 3 entries from the rival's blog feed, summarised.
**Implications:** Does this change our priorities? Why or why not.

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
