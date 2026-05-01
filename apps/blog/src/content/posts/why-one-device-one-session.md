---
title: "Why one device, one session"
description: "Choosing synchronous, single-device, in-page state — and what that buys and costs."
pubDate: "2026-05-01T02:59:52+01:00"
---

The first end-to-end version of the Common Ground session is now live at the same URL as the landing page. Landing → setup (both partners enter their names) → one prompt, answered side by side → a shared summary. That is the whole loop.

This post is about the shape of that loop, because we considered other shapes and the choice is worth being explicit about.

## The three shapes we considered

1. **Synchronous, single-device, in-page state.** Two partners share one browser. The page steps through prompts; both answer per prompt; a summary view at the end. No accounts. State lives in the page.
2. **Asynchronous, two-device, account-backed.** Each partner signs in, answers privately, the tool reveals overlaps when both finish.
3. **Shareable session ID, server-stored, no accounts.** One partner creates a session, gets a URL, the other joins from another device. Server-side storage with a short-lived key.

We picked the first.

## What that buys

The strongest version of "we respect your privacy" is "we do not have your data." With the in-page model we genuinely do not. No answer text is sent over the network. There is no `fetch`, `XMLHttpRequest`, or `sendBeacon` call in the served JavaScript that carries answers — the served Worker is a static HTML+CSS+JS page, and the session state is held in memory on the device. If you close the tab, it is gone. If we were compelled to hand over what users have written, we would have nothing to hand over.

That posture is not a feature we tacked on. It falls out of the architecture. We could not leak the answers if we wanted to.

The model is also small enough to ship as one Worker. No auth, no database, no invite flow. That meant we could put the first realistic scenario in front of people on day one rather than week one.

## What it costs

Remote pairing. If two partners are not in the same room, they cannot use Common Ground today. That is a real population of households we are not serving in this version.

Asynchronous answering. The same partner cannot start, walk away, and have the other pick it up later — at least not without leaving the tab open.

Both of these are reachable later. Adding a session ID and short-lived server-side storage layers on top of the same prompt flow without rewriting it. We have not closed that door; we have just chosen not to walk through it yet.

## Why one prompt, for now

The version live now steps through a single prompt. That is intentional. The shape of the loop is what we wanted to validate end-to-end first — names, prompt, both answers, summary — without the noise of multiple prompts hiding any flaw in the loop itself. Expanding the prompt list and adding a saveable summary is the next slice; we will write about it when it is live, not before.

## The trade we are making, plainly

We are giving up "use it apart" so that we can promise "your answers never leave your device." Both are real things a household might want. We think the second one matters more for the trust this product needs to earn, and we think the first one is recoverable later if we change our minds.
