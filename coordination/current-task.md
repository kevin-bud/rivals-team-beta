# Current task

Set by the Orchestrator. Read by the Engineer. The Engineer updates the
`Status` field as work progresses.

**Task:** Ship a real landing page and root README for the product, replacing the placeholder Worker.
**Assigned:** 2026-05-01 00:00
**Status:** awaiting review
**Notes:**

- Deployed at https://rivals-team-beta-product.kevin-wilson.workers.dev (commit 3bb7046).
- Landing page verified live via `curl`; all required strings present.
- Root `README.md` replaced with a product-facing version covering what/who/URL/how.
- Review-queue entry appended; awaiting Reviewer verdict.

## Context

This is the first task of the project. See the most recent entry in
`coordination/decision-log.md` ("Initial reading of the brief") for product
framing. The product is provisionally named **Common Ground** — a tool a
household uses together to have a productive conversation about their joint
finances.

Right now `apps/product/src/index.ts` is a placeholder Worker serving "coming
soon". There is no root README. Both must change before we can ship anything
that satisfies the MVP definition.

## Definition of done

All of the following must be true:

1. `apps/product/src/index.ts` serves a real HTML landing page that includes:
   - Product name: **Common Ground**
   - A one-sentence value proposition framing what the product is for
     (a household has a productive conversation about their joint
     finances — together).
   - A line making clear it is for two or more people in a household,
     used together.
   - A non-functional **"Start a session"** call to action (an anchor or
     button is fine — wiring comes in the next task).
   - A footer disclaimer: not financial, tax, legal, or investment advice.
   - Reasonable, restrained styling (inline `<style>` is fine — no framework,
     no build step changes). Mobile-readable. British English in copy.
2. A new file `README.md` at the repo root (do not touch any other README)
   covering: what the product is, who it is for, the public product URL
   (placeholder note is acceptable until first deploy lands), and a one-line
   "how to use" placeholder. British English. Keep it short — this will grow.
3. `pnpm --filter product deploy` succeeds locally.
4. The deployed public URL serves the new landing page (verify with
   `curl` and report the URL in your review-queue entry).
5. Append a fresh entry to `coordination/review-queue.md` with: the
   commit SHA, the deployed URL, and what to verify (landing page loads,
   contains the product name, value prop, multi-user framing, CTA, and
   advice disclaimer).
6. Commits are small and signed off normally — no signing, drop GPG if it
   prompts.

## Out of scope (do not do in this task)

- No persistence, auth, sessions, or routes beyond `/`.
- No framework choice yet (keep it a single-file Worker).
- No blog post — the Writer handles that; the Orchestrator queues it.
- No Playwright tests yet — Reviewer will do a smoke check.

## When done

- Set `Status:` to `awaiting review`.
- Stop. Do not start the next task. The Orchestrator picks it up after
  the Reviewer verdict.
