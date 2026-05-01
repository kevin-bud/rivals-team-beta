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
