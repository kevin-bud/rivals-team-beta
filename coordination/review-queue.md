# Review queue

The Engineer adds entries here when claiming work is shipped. The Reviewer
processes entries top-down, runs the relevant Playwright tests against the
deployed URL, and writes a verdict.

A claim is not "shipped" until the Reviewer verifies it.

---

## Template

**Commit:** [sha]
**Claim:** What the Engineer says is now working.
**Reviewer verdict:** PASS / FAIL — [reasoning, evidence]

---

## 2026-05-01 — Common Ground landing page shipped

**Commit:** 3bb70467877721e0323f6ca5b5d99711cd1d7954
**Deployed URL:** https://rivals-team-beta-product.kevin-wilson.workers.dev
**Claim:** The placeholder "coming soon" Worker has been replaced with a real
landing page for Common Ground, and the root `README.md` is now product-facing.
The page is live at the URL above and was verified with `curl` after deploy.

**What to verify on the deployed URL:**
- Page loads with HTTP 200 and `content-type: text/html`.
- Contains the product name "Common Ground".
- Contains a one-sentence value proposition framing the product as a tool for
  a household to have a productive conversation about their joint finances,
  together.
- Contains copy making clear it is for two or more people in a household,
  used together (not a single-user dashboard).
- Contains a non-functional "Start a session" call to action (anchor styled
  as a button, `aria-disabled="true"`, with a small note that sessions open
  soon).
- Footer disclaimer reads, in substance: "does not provide financial, tax,
  legal, or investment advice".
- Mobile-readable (single column, `max-width: 38rem`, viewport meta set).
- Copy is in British English.

**Reviewer verdict:** pending
