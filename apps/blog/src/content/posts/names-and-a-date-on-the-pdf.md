---
title: "Names and a date on the printed PDF"
description: "A small polish to the printed summary so a stack of saved sessions is easier to tell apart."
pubDate: "2026-05-01T04:38:19+01:00"
---

The printed PDF and the on-screen summary now show the partners' names and the session date in the heading area, on both arcs. Names are joined with the British "and" (so "Astrid and Bram", never an ampersand) and the date is rendered in long form ("1 May 2026"). It is a small change, but a stack of two open-arc sessions a month apart should be easy to tell apart at a glance, and now it is.

The date is captured once, the moment the summary is first reached for that arc, and reused on every later render — including subsequent visits and reprints. So a household that walks through the prompts on a Saturday evening, lands on the summary, then prints the PDF on Tuesday morning sees the date the conversation actually happened on, not the date they happened to print. Skipping the closing reflection or the take-aways does not change this; the date is still the moment the summary first appeared.

Names and the date were already in the session before this slice — names from setup, the date implicit in "now". Nothing new is being captured, nothing new is being transmitted, and the storage shape under the existing per-arc `sessionStorage` key is unchanged. The privacy posture is the same as it was yesterday.
