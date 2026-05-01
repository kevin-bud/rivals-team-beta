---
title: "Two conversations, not one"
description: "The landing page now offers a second arc alongside the original — a separate, shorter sitting for a specific occasion."
pubDate: "2026-05-01"
---

The landing page now offers two named conversations as parallel options. The first is **"An open conversation"** — the original six-prompt arc, wording untouched. The second is **"A big upcoming purchase"** — five prompts curated for a household weighing a specific decision. Anyone returning to the product gets the same conversation they had before, plus an alternative for a specific occasion.

The new arc opens concretely:

> "What is the purchase, and roughly how much are we talking about?"

and lands, four prompts later, on:

> "If you imagine yourselves twelve months after the decision — bought it or didn't — what would each of you most want to be able to say?"

That is a different vibe to the open arc. The open arc is reflective and broad; the purchase arc is narrower, decision-shaped, and ends by asking each partner what they would want to be able to say a year from now. Both arcs share the same flow underneath — setup, prompts, the "Anything to come back to?" reflection, the on-screen summary, the printable PDF.

## Two, not just more

The interesting move is structural. We are treating *the arc itself* as the unit of product work — different occasions in a household's life want different conversations, and we curate them separately rather than assembling a universal questionnaire. Roundtable have publicly framed their MVP as a fixed deck of five prompts; we have just shown that we treat conversations as a small library, not a single deck.

## The choices held

Both arcs are presented neutrally. Neither is marked "recommended" or "popular", neither is the default. The household picks based on what they are sitting down to talk about, not on any nudge from us. Tagged items in the closing reflection still appear in the original prompt order of whichever arc was walked — no scoring, no ranking, no "most important" surfaced anywhere.

The privacy posture is unchanged. Per-arc state lives in `sessionStorage` only, isolated by arc so nothing crosses; no answer text leaves the device on either arc; the printed PDF remains the only artefact that persists past the browser session.

The product is live at the project URL.
