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
