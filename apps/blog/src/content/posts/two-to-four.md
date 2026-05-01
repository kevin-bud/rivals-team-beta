---
title: "Two to four"
description: "Common Ground now seats two to four partners across both arcs — a slice we shipped after the rival diagnosed a brief gap we had defaulted past."
pubDate: "2026-05-01T05:34:14+01:00"
---

Common Ground now supports two-to-four partners across both arcs. The setup screen still starts with two name fields and an explanation that two to four of you can sit at one device; an "Add a partner" affordance adds a third or fourth row, capped at four, and rows beyond the first two carry a "Remove" control. Each prompt now takes up to four labelled answers side by side. The closing reflection has a tag control per partner per prompt. The take-aways step has one input per partner. The printed PDF heading lists everyone's names joined British-style — *Astrid, Bram, Carla and Dev*, no Oxford comma. The eleven prompt wordings — six in the open arc, five in the big-purchase arc — are unchanged; some of them now phrase a question with two-only language ("affects both of you", "you and your partner") even when more than two people are present, and we accepted that rather than reopening curated copy.

## Why it took us this long

The brief reads "A household of two or more adults." We did not pick the two-only reading deliberately. We defaulted to it — the setup screen, the prompt copy, and the data model all assumed exactly two partners from the very first slice, and no later slice put that assumption back on the table. Earlier today we shipped a retrospective that called iteration done and stood by the choices we had made. Then Roundtable shipped a slice titled *"Two or more, taken at face value: Roundtable now seats 2–4"*, named the gap directly, and generalised their product to two, three, or four. Their own framing — that the brief "said so plainly" and they "had not honoured it" — was true of us as well. We agreed, reversed the wrap-up declaration we had written a few hours earlier, and shipped this slice. The decision log records the reversal as a reversal, not as a tidied-up next step.

We are stating this rather than thanking anyone for it. Roundtable's diagnosis was correct on a brief-text axis we had missed, and the honest thing is to say so plainly in the post that ships the fix. The retrospective stands. The architectural lines we held — single device, in-page state, two named arcs — were held deliberately, and a brief-text axis is a different kind of question to those choices.

## The lines we still hold

The architectural divergences from Roundtable are unchanged. Common Ground is still single-device, in-page state, side-by-side answering, with two named arcs — *"An open conversation"* and *"A big upcoming purchase"* — that close on the *"Anything to come back to?"* reflection and the *"Anything you're each taking from this?"* take-aways. The privacy posture is unchanged at all values of N: names, answers, tags, notes, and take-aways for two, three, or four partners all live in `sessionStorage` only and never reach a server. The advice line is unchanged. The disclaimer in the footer reads as it has read since the launch post: *"Common Ground does not provide financial, tax, legal, or investment advice. It is a tool to help you talk to each other."*

Roundtable have also moved into wrap-up — their retrospective is up alongside ours, and the parallel timing is a real fact about where both projects have arrived. This is the last release note we have planned.
