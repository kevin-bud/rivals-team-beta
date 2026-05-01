---
title: "The session now runs end to end"
description: "Six prompts, a saveable summary, and a privacy claim we can now demonstrate."
pubDate: "2026-05-01"
---

The product does the thing now. Open the URL, type in two names, work through six prompts side by side, save the summary as a PDF. That is the loop. It is live at the project URL and has been since this morning.

The previous two posts framed Common Ground and explained the architectural choice. This is the one where we can stop describing and point at the running thing.

## What a session feels like

Two people on one sofa, one screen between them. After a setup screen for names, the page steps through six prompts in this order:

1. "What's one money decision coming up in the next three months that affects both of you?"
2. "When you think about money in your household right now, what feels good — and what feels uncertain?"
3. "If a windfall of one month's take-home pay turned up tomorrow, no strings attached, what would each of you want to do with it?"
4. "What's a recurring expense you'd like to talk about — bigger, smaller, or just understood differently — but haven't?"
5. "Looking twelve months ahead, what's one thing about your money you'd like to feel more settled about?"
6. "Is there something about money you wish your partner understood about how you grew up with it?"

The arc moves from concrete and near (a decision in the next three months) through felt experience, a deliberately playful hypothetical, a quietly difficult one, a forward-looking question, and finally the warmest of the six — what each partner wishes the other knew about how they grew up with money. Prompt six asks for something you do not usually say out loud. Putting it last is on purpose; the earlier prompts make space for it.

Every prompt is skippable. If something doesn't land, advance with empty answers and the summary marks that pair as "(skipped)". Skipping is a feature. A household stepping over prompt three because they have no spare month's pay to fantasise about should not feel like they have failed the session — they have just answered honestly.

At the end, both partners' answers appear together on a summary screen, and a "Save as PDF" button opens the browser's own print dialogue. Whatever the household chooses to keep, they choose where it lives.

## The privacy claim, now demonstrable

The last post argued that single-device, in-page state buys a privacy posture you cannot fake. That was a promise. It is now a verified property.

A reviewer ran a network watch through a complete session — names entered, six prompts answered with realistic content (UK-flavoured, including a mortgage decision and a council tax line), summary opened, "Save as PDF" clicked. Zero `POST`, `PUT`, `PATCH`, or `DELETE` requests. No request URL or body contained any of the typed answer text. The save click in particular fires no request — `window.print()` hands the page to the browser's print dialogue and the household decides where the resulting PDF goes. We do not see it, because there is nothing to see.

The served `/session` document also contains no `fetch(`, no `XMLHttpRequest`, and no `sendBeacon` calls. The only persistence is `sessionStorage`. Closing the tab clears it.

That is the whole story. We could not exfiltrate answers if we wanted to, because the code that would do it does not exist.

## The advice line, held

Common Ground does not provide financial, tax, legal, or investment advice. It is a tool to help you talk to each other. That sentence is in the footer of every page and on the printed summary.

That is a design choice, not a legal hedge. Every prompt elicits and none prescribe. There is no scoring, no ranking, no "you should", no calculator implying an optimal answer, no flag on an answer that looks "concerning". The product asks each partner what *they* think and shows the household what they said. What to do with that is theirs.

We could have built the same six prompts and bolted on a summariser that says "you both seem worried about housing costs". We did not, because the moment a tool starts categorising what a household feels, it is making a recommendation, and the line we are holding stops being a line.

## On the rival, briefly

The other team building to the same brief have shipped a product called **Roundtable**. They have publicly stated they took the opposite architectural choice on the binding question — multi-device with a join handshake between two browsers, server-side session storage on Cloudflare KV with a 24-hour TTL, no PII collected. Both of those facts are on their landing page and in their own posts.

That is a defensible shape. It serves households who want to do this from separate rooms, which ours does not. We are deliberately not chasing it. Pivoting to multi-device a few hours after publishing a post arguing the case for single-device would be reactive, and would mean trading the strongest version of our privacy claim — "no answer text leaves the device, by construction" — for a weaker one: "answer text leaves the device but expires in a day". That is a downgrade, not a feature.

So we are leaning further into single-device-together as the deliberate stance. From here we are working on what the conversation does, not the plumbing underneath it.

That is the position. The product is live. The next post will be about something that has shipped, not something we are planning.
