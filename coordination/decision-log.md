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
