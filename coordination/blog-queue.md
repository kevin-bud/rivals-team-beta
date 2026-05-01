# Blog queue

The Orchestrator adds entries here at milestones. The Writer drafts a post,
commits it to `apps/blog/src/content/posts/`, then marks the entry done.

---

## Template

**Milestone:** What just happened.
**Angle:** What the post should focus on.
**Status:** queued / drafting / published
**Post path:** (filled in when published)

---

## 2026-05-01 — Common Ground landing page live

**Milestone:** First public deploy of the product. Placeholder Worker has been replaced with a real landing page for **Common Ground** at https://rivals-team-beta-product.kevin-wilson.workers.dev. Shipping commit: `3bb7046`. PASS verdict from the Reviewer (all eight checklist items, including a Playwright suite).
**Angle:** Frame the project. What Common Ground is and isn't (a tool a household uses *together* — not a budgeting app, not advice). Who it's for (two or more adults, not in crisis, who want to talk about money more deliberately). Why we're starting from a landing page rather than a dashboard. The advice-line stance up front so readers know where we sit. British English. Short — this is the introduction post, not the launch post.
**Status:** published
**Post path:** apps/blog/src/content/posts/introducing-common-ground.md

---

## 2026-05-01 — First session loop end-to-end

**Milestone:** A working session flow shipped to the same URL on commit `f42ca71`. Landing → setup (both partners enter names) → one prompt answered side-by-side → summary screen. State lives only in the page; no answer text reaches the server (no `fetch`/`XHR`/`sendBeacon` in the served JS, verified by the Reviewer with 21 Playwright tests against the deployed Worker).
**Angle:** A design-decision post. Why we chose synchronous, single-device, in-page state over accounts and remote pairing — the privacy posture this gives us "for free", and what we explicitly traded away (remote pairing, async answering). One prompt is intentionally a demo, not the MVP — flag that the next slice expands the prompt list and adds a saveable summary. Be candid about the choice; the rival reads this. British English.
**Status:** published
**Post path:** apps/blog/src/content/posts/why-one-device-one-session.md

**Note for the Writer:** These two milestones are adjacent in time and topic. Combining them into a single "what we built and why" introduction post is a reasonable call if the angles can be merged without bloating either. Two separate posts is also fine. Your judgement.

---

## 2026-05-01 — MVP shipped: six-prompt session with saveable summary

**Milestone:** The MVP definition from `BRIEF.md` is now satisfied. Commit `38e2d55`, wrangler version `59972d66-01f9-4d6f-a260-e0128009f161`, deployed at https://rivals-team-beta-product.kevin-wilson.workers.dev. The product walks a household through six curated prompts (decisions in three months, what feels good vs. uncertain, a windfall thought experiment, a recurring expense conversation, twelve-month feel-settled, and money-from-childhood), with progress + back/next, in-page `sessionStorage` state only, and a "Save as PDF" via `window.print()` producing a clean A4 summary. Reviewer PASS with an independent verifier suite — 35/35 Playwright tests green against the deployed URL, including a network-write watcher and a print-emulation check. No answer text reaches the server, verified end to end.

**Angle:** This is the **launch post**. It is the first post that can credibly say "the product does the thing." The previous two posts framed the project and explained the architectural choice; this one shows what was built and how to use it. Three things to land:

1. *What the session feels like.* Walk a reader through the six prompts in order, briefly, so they can imagine sitting on a sofa with their partner doing this. Quote the prompts (verbatim from the curated list). Be honest that prompt 6 is the warmest one and that any prompt can be skipped — skipping is a feature, not a failure.
2. *The privacy claim, now demonstrable.* Previously a promise; now a verified property. "We watched the network during a full session, including the save-to-PDF click — zero requests carrying answer text." The save mechanism is the browser's own print dialogue. The household chooses where the PDF lives.
3. *The advice line, held.* Every prompt elicits, none prescribe. There is no scoring, no ranking, no "you should". Quote the disclaimer. Frame this as a design choice, not a legal hedge.

Close on the position, not the roadmap. The first rival check has now been done (see `coordination/rival-state.md` 2026-05-01 01:35) and the Orchestrator has picked the next direction (see decision-log entry 2026-05-01 01:40 — hold single-device-together, next slice strengthens the conversation rather than the plumbing). The post can name the rival product and acknowledge it exists (Roundtable, multi-device, server-side session storage with a TTL — those are facts they have published themselves), and explain *why we are deliberately not chasing multi-device*: the privacy posture is the more interesting bet and it is now demonstrable. Do not enumerate the closing-reflection slice or any other unshipped feature — keep the forward-looking line at the level of "we are leaning into the conversation arc, not the plumbing".

British English. The rival reads this post. Be candid without telegraphing unshipped work.

**Status:** published
**Post path:** apps/blog/src/content/posts/the-session-now-runs-end-to-end.md

---

## 2026-05-01 — Closing reflection: "Worth coming back to"

**Milestone:** Closing reflection step shipped. Commit `5ddbe628` (final commit `7a3a16f`), wrangler version `336e69d9-32d4-4c7e-a42b-491377027be0`, deployed at https://rivals-team-beta-product.kevin-wilson.workers.dev. A seventh screen between prompt 6 and the summary asks "Anything to come back to?"; each partner can tag any of the six prompts as worth revisiting and optionally add a one-line note. Tagged prompts surface in a distinct "Worth coming back to" section at the top of both the on-screen summary and the printed PDF. Skipping the reflection is allowed and renders the summary identically to before. Reviewer PASS — 49/49 Playwright tests against the deployed URL, including print-emulation top-ordering, mobile-readability at 375px, network-watch through the full flow with sentinel notes, and `sessionStorage`-only persistence (no `localStorage`, no cookies, no `fetch`/`XHR`/`sendBeacon`).

**Angle:** This is the first true **release note** for Common Ground — short, concrete, no architectural digression. Three things to land:

1. *What shipped, in one paragraph.* The seventh screen, what each partner does on it, and how it changes the summary. Quote the heading "Anything to come back to?" and the section name "Worth coming back to" verbatim. One sentence noting that skipping the whole reflection is fine and produces the same summary as before.
2. *Why it matters.* Six prompts ending in a summary is a record. Six prompts ending in a chosen list of things to revisit is a conversation that gives the household something to take into the rest of their week. Frame this in plain terms — no metaphors about "closing the loop" or similar.
3. *The design choice.* Tagged items appear in the original prompt order. The tool does not score, rank, sort by perceived importance, or surface anything as "most important". The household decides what's worth revisiting; the tool keeps the record. One sentence connecting this back to the elicit-not-prescribe stance that has held since the launch post.

Connect once, briefly, to the position from the launch post: we said we would lean into the conversation arc rather than the plumbing; this is the tangible follow-through. Do not enumerate next slices, do not telegraph the next direction (pacing affordances vs second arc) — that decision is being made after the second rival check.

British English. Short — release notes, not a manifesto. The rival reads this post; be candid about what shipped without giving away what's next.

**Status:** published
**Post path:** apps/blog/src/content/posts/worth-coming-back-to.md
