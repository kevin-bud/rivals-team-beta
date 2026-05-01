---
title: "How the decisions went"
description: "A retrospective on Common Ground — the bets, how they evolved, where the rival diverged, the advice line in practice, and what the trail shows."
pubDate: "2026-05-01T04:59:26+01:00"
---

We are pausing iteration on Common Ground. Both arcs work end to end,
the close beats land, the printed PDF is useful, the landing reflects
what the product is, and the privacy posture is demonstrable rather
than promised. There is no defensible next slice that is not optional
polish, so this is a retrospective rather than a release note. The
brief said the evaluation would be process-focused — what bets, how
decisions evolved, where the teams diverged, how the advice line was
handled, what the trail shows. Five short sections, in that order.

## The bets

Single device, in the same room, at the same time. Two partners on one
screen, side by side. We turned down the multi-device join handshake on
purpose, knowing the cost — a household in two places cannot use this.

In-page state, nothing leaves the device. No accounts, no server-side
session storage, no `fetch` of answer text. The privacy posture falls
out of the architecture; it is not a policy we promise to keep. The
landing states it plainly now: *"Your answers stay on this device —
nothing is sent to a server."*

The arc as the unit. Not "six prompts" but a curated sitting with a
beginning, a middle, and a close. When we shipped a second sitting it
was a different arc — *"A big upcoming purchase"* — alongside the
original *"An open conversation"*, not a longer single deck. The lede
on the landing is a fair summary: *"Common Ground is a guided sitting
for a household to talk about money together — pick one of two
conversations, work through it side by side, then close with a shared
reflection and a summary you can save."*

Elicit, never prescribe. Every prompt asks each partner what *they*
think; the tool never scores, ranks, sorts, or marks one answer as
more important than another.

## How the decisions evolved

Five inflection points worth singling out.

*Holding the line on single-device.* When the first rival check showed
Roundtable had shipped a multi-device join handshake with server-side
session storage, we had just published the post arguing for one device,
one session. We committed, and wrote the next slice as a content beat
— the closing reflection, *"Anything to come back to?"* — rather than
a plumbing slice.

*Picking a second arc over pacing affordances.* Two candidates were
on the bench: a separately curated short conversation, or read-aloud
and "swap who goes first" cues. The arc won because it generalised
prompt-curation work we had already done and demonstrated a structural
claim — that we treat sittings as plural — rather than decorating one
we already had.

*Overriding that direction once it shipped.* After the second arc
landed we pencilled pacing as the next slice. Re-examining the bench,
we flipped: pacing was decoration; the stronger move was a second
content beat at the close, *"Anything you're each taking from this?"*.
The override is in the log as an override, not backfilled into a
tidier story.

*A small polish after the rival shipped print.* We had print since
the MVP. They shipped clipboard plus print. We polished the same axis
instead of racing them — partners' names and the session date in the
printed heading — so a household with two saved sessions can tell them
apart without opening either.

*Calling iteration done.* After a landing-copy pass brought the
surface up to date with what the product had become, there was no
slice on the bench we believed in. The honest move was to stop and
write this in place of a seventh release note.

## Where the two products diverged

Two teams, the same brief, materially different products.

Roundtable went multi-device with a join handshake, server-side
session storage, and — as their own posts frame it — a fixed deck of
five with simultaneous reveal: each partner answers privately, both
answers surface at once.

Common Ground went single-device, in-page state only, two named arcs
of curated prompts, both partners' answers visible to each other as
they are typed. The conversation is co-created throughout, and ends
on two short close beats — *"Worth coming back to"* and
*"Taking forward"*.

Theirs rests on the theory that privacy between partners — answering
without seeing what the other writes — is what makes the conversation
honest. Ours rests on the theory that being in the same room, watching
each other's words appear, is what makes it a conversation rather than
two parallel monologues. Both can be defended; neither is the
obviously correct reading. One brief produced two products that
disagree about something that fundamental, and that is the interesting
thing the divergence shows.

## The advice line, in practice

The disclaimer is in the footer of every page and on the printed
summary: *"Common Ground does not provide financial, tax, legal, or
investment advice."* One sentence, not load-bearing on its own.

The design choices are what hold the line. The product never scores a
household, never ranks an answer, never flags one as "concerning".
Tagged items in the closing reflection appear in the original prompt
order. The take-aways inputs have no placeholder text, so the
household is never anchored to whatever sentence we would have
written. The arc selector treats both arcs neutrally — no
"recommended", no "popular", no default. None of this needs the
disclaimer to be doing the work.

## What the trail shows

The decision log is the artefact, not this post — but a few patterns
are worth naming.

We picked simple readings over asking for clarifications: when the
brief was ambiguous on shape, the first entry committed to the
simplest reading and moved.

We recorded reversals openly. The pacing-to-take-aways flip was
written up as an override, not re-stated as if the earlier pick had
never happened.

We deferred candidates explicitly rather than dropping them.
Successive entries carried a small bench of provisional next
directions, with rationale for what moved up and what moved down when
fresh data arrived.

We revised provisional picks when the rival shipped something that
warranted a response — the printed-PDF polish after their print slice
— and held the architectural line when no signal warranted a shift.
The multi-device pivot was rejected three times.

We stopped when there was no defensible next slice rather than
shipping for its own sake. Continuing to ship is the easy thing; it
is not always the right thing.

The product is live; the decision log is in the repo; this post is
the synthesis.
