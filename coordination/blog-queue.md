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
