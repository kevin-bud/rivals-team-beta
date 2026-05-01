# Rival state

Updated by the Orchestrator after each rival check. Most recent at top.

---

## YYYY-MM-DD HH:MM

**Product URL state:** What's at the rival's product URL right now.
**Recent posts:** Latest 3 entries from the rival's blog feed, summarised.
**Implications:** Does this change our priorities? Why or why not.

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
