// Common Ground — single-Worker product. Routes:
//   GET /                       → landing page (two arcs surfaced)
//   GET /session?arc=open       → six-prompt arc ("An open conversation")
//   GET /session?arc=purchase   → five-prompt arc ("A big upcoming purchase")
//   GET /session                → defaults to the open arc
// State lives entirely in the browser (sessionStorage) under the key
// `common-ground.session.v2`, an object keyed by arc id so each arc has its
// own per-partner data — no leakage between arcs. There is no other
// server-side route. No fetches carry answer text.

type ArcId = "open" | "purchase";

type Arc = {
  id: ArcId;
  name: string;
  shortName: string;
  ctaLabel: string;
  ledeBlurb: string;
  setupHeading: string;
  setupLede: string;
  prompts: ReadonlyArray<string>;
};

// The two arcs are the single source of truth for prompts and arc-level
// copy. The session script reads them via a JSON tag in the served HTML so
// wording stays verbatim across UI, summary, and print.
const ARCS: ReadonlyArray<Arc> = [
  {
    id: "open",
    name: "An open conversation",
    shortName: "open conversation",
    ctaLabel: "Start an open conversation",
    ledeBlurb:
      "Six broad prompts about how money sits in your household — near-term decisions, what feels good and uncertain, the year ahead.",
    setupHeading: "Who is here?",
    setupLede:
      "Pop in your names so the prompts and summary can address each of you. Two to four of you can sit at one device for the conversation — add a partner if you need a third or fourth row.",
    prompts: [
      "What's one money decision coming up in the next three months that affects both of you?",
      "When you think about money in your household right now, what feels good — and what feels uncertain?",
      "If a windfall of one month's take-home pay turned up tomorrow, no strings attached, what would each of you want to do with it?",
      "What's a recurring expense you'd like to talk about — bigger, smaller, or just understood differently — but haven't?",
      "Looking twelve months ahead, what's one thing about your money you'd like to feel more settled about?",
      "Is there something about money you wish your partner understood about how you grew up with it?",
    ],
  },
  {
    id: "purchase",
    name: "A big upcoming purchase",
    shortName: "big-purchase conversation",
    ctaLabel: "Start a big-purchase conversation",
    ledeBlurb:
      "Five focused prompts for a household weighing a specific purchase — what it costs, what it changes, what you'd trade.",
    setupHeading: "Who is here?",
    setupLede:
      "Pop in your names so the prompts and summary can address each of you. Two to four of you can sit at one device for the conversation — add a partner if you need a third or fourth row.",
    prompts: [
      "What is the purchase, and roughly how much are we talking about?",
      "What would having it actually change about your day-to-day, in a sentence each?",
      "What are you each willing to trade off for it — saving rate, another goal, a different timeframe?",
      "What would have to be true about the rest of your finances for this to feel comfortable rather than tight?",
      "If you imagine yourselves twelve months after the decision — bought it or didn't — what would each of you most want to be able to say?",
    ],
  },
];

function findArc(id: string | null): Arc {
  for (const arc of ARCS) {
    if (arc.id === id) {
      return arc;
    }
  }
  return ARCS[0];
}

const sharedStyles = `
  :root {
    color-scheme: light dark;
    --bg: #fafaf7;
    --fg: #1c1c1a;
    --muted: #5c5c57;
    --accent: #2f5d50;
    --accent-fg: #ffffff;
    --rule: #e4e4de;
    --field-bg: #ffffff;
    --field-border: #cdcdc4;
    --skipped-fg: #8a8a82;
  }
  @media (prefers-color-scheme: dark) {
    :root {
      --bg: #15171a;
      --fg: #ececea;
      --muted: #a4a49d;
      --accent: #6fb39a;
      --accent-fg: #0d1411;
      --rule: #2a2d31;
      --field-bg: #1c1f23;
      --field-border: #3a3f45;
      --skipped-fg: #75756e;
    }
  }
  * {
    box-sizing: border-box;
  }
  html,
  body {
    margin: 0;
    padding: 0;
  }
  body {
    font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", system-ui,
      sans-serif;
    background: var(--bg);
    color: var(--fg);
    line-height: 1.55;
    -webkit-font-smoothing: antialiased;
  }
  main {
    max-width: 38rem;
    margin: 0 auto;
    padding: 4rem 1.5rem 2rem;
  }
  header {
    margin-bottom: 2.5rem;
  }
  .eyebrow {
    text-transform: uppercase;
    letter-spacing: 0.12em;
    font-size: 0.75rem;
    color: var(--muted);
    margin: 0 0 0.75rem;
  }
  h1 {
    font-size: clamp(2rem, 5vw, 2.75rem);
    line-height: 1.15;
    margin: 0 0 1rem;
    font-weight: 600;
    letter-spacing: -0.01em;
  }
  h2 {
    font-size: 1.1rem;
    margin: 0 0 0.75rem;
    font-weight: 600;
  }
  .lede {
    font-size: 1.15rem;
    color: var(--fg);
    margin: 0 0 1rem;
  }
  .together {
    font-size: 1rem;
    color: var(--muted);
    margin: 0 0 2rem;
  }
  .cta,
  button.cta {
    display: inline-block;
    background: var(--accent);
    color: var(--accent-fg);
    text-decoration: none;
    padding: 0.85rem 1.4rem;
    border-radius: 0.5rem;
    font-weight: 500;
    font-size: 1rem;
    border: none;
    cursor: pointer;
    font-family: inherit;
  }
  .cta:focus-visible {
    outline: 2px solid var(--fg);
    outline-offset: 2px;
  }
  .cta-note {
    display: block;
    margin-top: 0.75rem;
    font-size: 0.85rem;
    color: var(--muted);
  }
  .secondary {
    display: inline-block;
    background: transparent;
    color: var(--fg);
    border: 1px solid var(--field-border);
    padding: 0.85rem 1.4rem;
    border-radius: 0.5rem;
    font-weight: 500;
    font-size: 1rem;
    cursor: pointer;
    font-family: inherit;
    text-decoration: none;
  }
  .secondary:focus-visible {
    outline: 2px solid var(--accent);
    outline-offset: 2px;
  }
  [hidden] {
    display: none !important;
  }
  .nav-row {
    display: flex;
    flex-wrap: wrap;
    gap: 0.75rem;
    align-items: center;
    margin-top: 1.5rem;
  }
  .arc-choices {
    display: grid;
    grid-template-columns: 1fr;
    gap: 1.25rem;
    margin: 0 0 2rem;
  }
  @media (min-width: 36rem) {
    .arc-choices {
      grid-template-columns: 1fr 1fr;
    }
  }
  .arc-choice {
    border: 1px solid var(--rule);
    background: var(--field-bg);
    border-radius: 0.6rem;
    padding: 1.1rem 1.2rem 1.3rem;
    display: flex;
    flex-direction: column;
    gap: 0.75rem;
  }
  .arc-choice h2 {
    margin: 0;
    font-size: 1.1rem;
  }
  .arc-choice p {
    margin: 0;
    color: var(--muted);
    font-size: 0.95rem;
    flex: 1;
  }
  .arc-choice .arc-meta {
    font-size: 0.8rem;
    text-transform: uppercase;
    letter-spacing: 0.08em;
    color: var(--muted);
    margin: 0;
  }
  .arc-choice a.cta {
    align-self: flex-start;
  }
  ul.session-shape {
    list-style: none;
    padding: 0;
    margin: 0 0 1.25rem;
    display: grid;
    gap: 0.4rem;
    color: var(--muted);
    font-size: 0.95rem;
  }
  ul.session-shape li {
    padding-left: 1rem;
    position: relative;
  }
  ul.session-shape li::before {
    content: "·";
    position: absolute;
    left: 0.25rem;
    color: var(--muted);
  }
  footer {
    margin-top: 3.5rem;
    padding-top: 1.5rem;
    border-top: 1px solid var(--rule);
    font-size: 0.8rem;
    color: var(--muted);
  }
  .arc-tag {
    display: inline-block;
    margin: 0 0 1.25rem;
    padding: 0.25rem 0.6rem;
    border-radius: 999px;
    background: var(--rule);
    color: var(--fg);
    font-size: 0.78rem;
    text-transform: uppercase;
    letter-spacing: 0.08em;
  }
  .field {
    display: block;
    margin-bottom: 1.25rem;
  }
  .field label {
    display: block;
    font-size: 0.85rem;
    color: var(--muted);
    margin-bottom: 0.35rem;
  }
  .field input,
  .field textarea {
    width: 100%;
    background: var(--field-bg);
    color: var(--fg);
    border: 1px solid var(--field-border);
    border-radius: 0.4rem;
    padding: 0.6rem 0.7rem;
    font-family: inherit;
    font-size: 1rem;
    line-height: 1.45;
  }
  .field textarea {
    min-height: 7rem;
    resize: vertical;
  }
  .field input:focus,
  .field textarea:focus {
    outline: 2px solid var(--accent);
    outline-offset: 1px;
  }
  .partner-row {
    position: relative;
  }
  .partner-row .partner-row-inner {
    display: flex;
    gap: 0.5rem;
    align-items: stretch;
  }
  .partner-row .partner-row-inner .field {
    flex: 1;
    margin-bottom: 0;
  }
  .partner-row .remove-partner-btn {
    align-self: flex-end;
    background: transparent;
    color: var(--muted);
    border: 1px solid var(--field-border);
    border-radius: 0.4rem;
    padding: 0.55rem 0.7rem;
    font-size: 0.85rem;
    font-family: inherit;
    cursor: pointer;
    flex-shrink: 0;
    margin-bottom: 0;
  }
  .partner-row .remove-partner-btn:focus-visible {
    outline: 2px solid var(--accent);
    outline-offset: 1px;
  }
  .add-partner-row {
    margin: 0 0 1.25rem;
  }
  .answers {
    display: grid;
    grid-template-columns: 1fr;
    gap: 1.25rem;
  }
  @media (min-width: 36rem) {
    .answers[data-count="2"] {
      grid-template-columns: 1fr 1fr;
    }
    .answers[data-count="3"],
    .answers[data-count="4"] {
      grid-template-columns: 1fr 1fr;
    }
  }
  .progress {
    font-size: 0.85rem;
    color: var(--muted);
    margin: 0 0 0.5rem;
    letter-spacing: 0.02em;
  }
  .progress-bar {
    width: 100%;
    height: 0.35rem;
    background: var(--rule);
    border-radius: 999px;
    overflow: hidden;
    margin: 0 0 1.5rem;
  }
  .progress-bar > span {
    display: block;
    height: 100%;
    background: var(--accent);
    transition: width 200ms ease-out;
  }
  .prompt {
    background: var(--field-bg);
    border: 1px solid var(--rule);
    padding: 1rem 1.1rem;
    border-radius: 0.5rem;
    margin: 0 0 1.5rem;
    font-size: 1.05rem;
  }
  .summary-prompt {
    margin-top: 2rem;
    padding-top: 1.25rem;
    border-top: 1px solid var(--rule);
  }
  .summary-prompt:first-of-type {
    margin-top: 1rem;
  }
  .summary-prompt h2 {
    font-size: 1rem;
    margin: 0 0 0.25rem;
    font-weight: 600;
  }
  .summary-prompt .prompt-text {
    font-size: 1.05rem;
    margin: 0 0 1rem;
    color: var(--fg);
  }
  .summary-prompt.skipped .prompt-text {
    color: var(--skipped-fg);
  }
  .summary-prompt .skipped-tag {
    display: inline-block;
    margin-left: 0.5rem;
    font-size: 0.8rem;
    color: var(--skipped-fg);
    font-style: italic;
  }
  .summary-block {
    border: 1px solid var(--rule);
    padding: 1rem 1.1rem;
    border-radius: 0.5rem;
    background: var(--field-bg);
  }
  .summary-block h3 {
    margin: 0 0 0.5rem;
    font-size: 0.95rem;
    color: var(--muted);
    font-weight: 500;
    letter-spacing: 0.02em;
  }
  .summary-block p {
    margin: 0;
    white-space: pre-wrap;
  }
  .summary-block p.empty {
    color: var(--skipped-fg);
    font-style: italic;
  }
  .summary-meta {
    color: var(--muted);
    font-size: 0.95rem;
    margin: 0 0 1.5rem;
  }
  .summary-meta .meta-names {
    color: var(--fg);
    font-weight: 600;
  }
  .print-only .print-meta {
    margin: 0.5rem 0 1.5rem;
    font-size: 12pt;
    color: #000000;
    line-height: 1.4;
  }
  .print-only .print-meta .print-meta-names {
    font-weight: 600;
    display: block;
  }
  .print-only .print-meta .print-meta-date {
    color: #444444;
    display: block;
    margin-top: 0.15rem;
  }
  .reflection-intro {
    color: var(--fg);
    margin: 0 0 1rem;
  }
  .reflection-hint {
    color: var(--muted);
    font-size: 0.95rem;
    margin: 0 0 1.75rem;
  }
  .reflection-row {
    border: 1px solid var(--rule);
    background: var(--field-bg);
    border-radius: 0.5rem;
    padding: 1rem 1.1rem;
    margin: 0 0 1rem;
  }
  .reflection-row .row-prompt {
    margin: 0 0 0.85rem;
    font-size: 1rem;
    color: var(--fg);
  }
  .reflection-row .row-prompt .row-index {
    display: block;
    text-transform: uppercase;
    letter-spacing: 0.1em;
    font-size: 0.7rem;
    color: var(--muted);
    margin-bottom: 0.2rem;
  }
  .reflection-tags {
    display: grid;
    grid-template-columns: 1fr;
    gap: 0.85rem;
  }
  @media (min-width: 36rem) {
    .reflection-tags[data-count="2"] {
      grid-template-columns: 1fr 1fr;
    }
    .reflection-tags[data-count="3"],
    .reflection-tags[data-count="4"] {
      grid-template-columns: 1fr 1fr;
    }
  }
  .reflection-tag {
    border: 1px solid var(--field-border);
    border-radius: 0.4rem;
    padding: 0.6rem 0.7rem;
    background: var(--bg);
  }
  .reflection-tag label.toggle {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    font-size: 0.95rem;
    color: var(--fg);
    cursor: pointer;
  }
  .reflection-tag input[type="checkbox"] {
    width: 1.05rem;
    height: 1.05rem;
    accent-color: var(--accent);
    margin: 0;
  }
  .reflection-tag .note-field {
    margin-top: 0.55rem;
  }
  .reflection-tag .note-field label {
    display: block;
    font-size: 0.78rem;
    color: var(--muted);
    margin-bottom: 0.25rem;
  }
  .reflection-tag .note-field input {
    width: 100%;
    background: var(--field-bg);
    color: var(--fg);
    border: 1px solid var(--field-border);
    border-radius: 0.3rem;
    padding: 0.45rem 0.55rem;
    font-family: inherit;
    font-size: 0.95rem;
  }
  .reflection-tag .note-field input:focus {
    outline: 2px solid var(--accent);
    outline-offset: 1px;
  }
  .revisit-section {
    margin: 0 0 2rem;
    padding: 1rem 1.1rem 1.25rem;
    border: 1px solid var(--accent);
    border-radius: 0.5rem;
    background: var(--field-bg);
  }
  .revisit-section h2 {
    margin: 0 0 0.4rem;
    font-size: 1rem;
    color: var(--accent);
    letter-spacing: 0.02em;
  }
  .revisit-section p.section-lede {
    margin: 0 0 1rem;
    color: var(--muted);
    font-size: 0.9rem;
  }
  .revisit-item {
    margin: 0 0 0.9rem;
    padding-bottom: 0.9rem;
    border-bottom: 1px solid var(--rule);
  }
  .revisit-item:last-child {
    margin-bottom: 0;
    padding-bottom: 0;
    border-bottom: none;
  }
  .revisit-item .revisit-prompt {
    margin: 0 0 0.4rem;
    font-size: 1rem;
    color: var(--fg);
  }
  .revisit-item .revisit-prompt .revisit-index {
    display: inline-block;
    text-transform: uppercase;
    letter-spacing: 0.1em;
    font-size: 0.7rem;
    color: var(--muted);
    margin-right: 0.35rem;
  }
  .revisit-item .tagged-by {
    margin: 0 0 0.35rem;
    font-size: 0.85rem;
    color: var(--muted);
  }
  .revisit-item .tagged-by strong {
    color: var(--fg);
    font-weight: 600;
  }
  .revisit-item .revisit-note {
    margin: 0.25rem 0 0;
    font-size: 0.95rem;
    color: var(--fg);
    white-space: pre-wrap;
  }
  .revisit-item .revisit-note .note-by {
    color: var(--muted);
    font-size: 0.85rem;
    margin-right: 0.35rem;
  }
  .privacy-note {
    margin-top: 1.75rem;
    font-size: 0.9rem;
    color: var(--muted);
  }
  .takeaways-form {
    display: grid;
    grid-template-columns: 1fr;
    gap: 1.25rem;
    margin: 0 0 1rem;
  }
  @media (min-width: 36rem) {
    .takeaways-form[data-count="2"] {
      grid-template-columns: 1fr 1fr;
    }
    .takeaways-form[data-count="3"],
    .takeaways-form[data-count="4"] {
      grid-template-columns: 1fr 1fr;
    }
  }
  .takeaways-section {
    margin: 0 0 2rem;
    padding: 1rem 1.1rem 1.25rem;
    border: 1px solid var(--accent);
    border-radius: 0.5rem;
    background: var(--field-bg);
  }
  .takeaways-section h2 {
    margin: 0 0 0.4rem;
    font-size: 1rem;
    color: var(--accent);
    letter-spacing: 0.02em;
  }
  .takeaways-section p.section-lede {
    margin: 0 0 1rem;
    color: var(--muted);
    font-size: 0.9rem;
  }
  .takeaway-item {
    margin: 0 0 0.7rem;
    padding-bottom: 0.7rem;
    border-bottom: 1px solid var(--rule);
  }
  .takeaway-item:last-child {
    margin-bottom: 0;
    padding-bottom: 0;
    border-bottom: none;
  }
  .takeaway-item .takeaway-by {
    display: inline-block;
    margin-right: 0.4rem;
    font-size: 0.85rem;
    color: var(--muted);
  }
  .takeaway-item .takeaway-by strong {
    color: var(--fg);
    font-weight: 600;
  }
  .takeaway-item .takeaway-text {
    margin: 0.25rem 0 0;
    font-size: 1rem;
    color: var(--fg);
    white-space: pre-wrap;
    overflow-wrap: anywhere;
  }
  .step {
    display: none;
  }
  .step[data-active="true"] {
    display: block;
  }
  .restart {
    display: inline-block;
    margin-top: 1.5rem;
    color: var(--accent);
  }
  .print-only {
    display: none;
  }
  @media print {
    :root {
      --bg: #ffffff;
      --fg: #000000;
      --muted: #444444;
      --accent: #000000;
      --accent-fg: #ffffff;
      --rule: #999999;
      --field-bg: #ffffff;
      --field-border: #999999;
      --skipped-fg: #666666;
      color-scheme: light;
    }
    @page {
      size: A4;
      margin: 18mm 16mm;
    }
    body {
      background: #ffffff;
      color: #000000;
      font-size: 11pt;
      line-height: 1.45;
    }
    main {
      max-width: none;
      padding: 0;
      margin: 0;
    }
    header {
      margin-bottom: 1rem;
    }
    /* Hide everything except the summary screen. */
    #step-setup,
    #step-prompt,
    #step-reflection,
    #step-takeaways {
      display: none !important;
    }
    /* Hide interactive chrome inside the summary screen. */
    .no-print,
    .restart,
    .privacy-note,
    .nav-row,
    .progress,
    .progress-bar {
      display: none !important;
    }
    .print-only {
      display: block;
    }
    .step[data-active="true"],
    #step-summary {
      display: block !important;
      page-break-inside: auto;
    }
    .summary-prompt {
      page-break-inside: avoid;
      border-top: 1px solid #999999;
    }
    .answers {
      grid-template-columns: 1fr 1fr;
      gap: 0.75rem;
    }
    .summary-block {
      border: 1px solid #999999;
      background: #ffffff;
      padding: 0.5rem 0.75rem;
      page-break-inside: avoid;
    }
    .summary-block p,
    .summary-prompt .prompt-text {
      overflow-wrap: anywhere;
      word-wrap: break-word;
    }
    .revisit-section {
      border: 1px solid #999999;
      background: #ffffff;
      margin: 0 0 1.25rem;
      padding: 0.65rem 0.85rem 0.85rem;
      page-break-inside: avoid;
    }
    .revisit-section h2 {
      color: #000000;
      font-size: 11pt;
      margin: 0 0 0.35rem;
    }
    .revisit-section p.section-lede {
      color: #444444;
      font-size: 9.5pt;
      margin: 0 0 0.6rem;
    }
    .revisit-item {
      border-bottom: 1px solid #999999;
      page-break-inside: avoid;
    }
    .revisit-item .revisit-prompt,
    .revisit-item .revisit-note {
      color: #000000;
      font-size: 11pt;
      overflow-wrap: anywhere;
      word-wrap: break-word;
    }
    .revisit-item .tagged-by,
    .revisit-item .revisit-note .note-by {
      color: #444444;
      font-size: 10pt;
    }
    .takeaways-section {
      border: 1px solid #999999;
      background: #ffffff;
      margin: 0 0 1.25rem;
      padding: 0.65rem 0.85rem 0.85rem;
      page-break-inside: avoid;
    }
    .takeaways-section h2 {
      color: #000000;
      font-size: 11pt;
      margin: 0 0 0.35rem;
    }
    .takeaways-section p.section-lede {
      color: #444444;
      font-size: 9.5pt;
      margin: 0 0 0.6rem;
    }
    .takeaway-item {
      border-bottom: 1px solid #999999;
      page-break-inside: avoid;
    }
    .takeaway-item .takeaway-text {
      color: #000000;
      font-size: 11pt;
      overflow-wrap: anywhere;
      word-wrap: break-word;
    }
    .takeaway-item .takeaway-by {
      color: #444444;
      font-size: 10pt;
    }
    .print-footer {
      margin-top: 1.5rem;
      padding-top: 0.5rem;
      border-top: 1px solid #999999;
      font-size: 9pt;
      color: #444444;
    }
    footer {
      display: none !important;
    }
  }
`;

const advisoryFooter = `
  <footer>
    Common Ground does not provide financial, tax, legal, or investment
    advice. It is a tool to help you talk to each other. Your answers stay
    on this device — they are never sent to or stored on a server.
  </footer>
`;

function arcChoiceCard(arc: Arc): string {
  const promptCount = arc.prompts.length;
  const countWord = promptCount === 5 ? "Five" : "Six";
  return `
    <article class="arc-choice" data-arc="${arc.id}">
      <p class="arc-meta">${countWord} prompts</p>
      <h2>${arc.name}</h2>
      <p>${arc.ledeBlurb}</p>
      <a class="cta" href="/session?arc=${arc.id}" role="button" data-arc-cta="${arc.id}">${arc.ctaLabel}</a>
    </article>
  `;
}

const landingHtml = `<!doctype html>
<html lang="en-GB">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>Common Ground — a household money conversation, together</title>
    <meta
      name="description"
      content="Common Ground is a guided sitting for a household to talk about money together — two conversations to pick from, a closing reflection, and a summary you can save."
    />
    <style>${sharedStyles}</style>
  </head>
  <body>
    <main>
      <header>
        <p class="eyebrow">Common Ground</p>
        <h1>A household money conversation, together.</h1>
        <p class="lede">
          Common Ground is a guided sitting for a household to talk about money
          together — pick one of two conversations, work through it side by
          side, then close with a shared reflection and a summary you can save.
        </p>
        <p class="together">
          Built for two or more people in a household to use side by side on
          one device — two to four of you can sit at it together, no
          dashboard for one person to log in to alone.
        </p>
        <p class="privacy-note">
          Your answers stay on this device — nothing is sent to a server.
        </p>
      </header>

      <section aria-labelledby="choose-heading">
        <h2 id="choose-heading">Choose a conversation</h2>
        <p class="together">
          Two arcs, both self-paced. Pick the one that fits the sitting you're
          about to have.
        </p>
        <div class="arc-choices">
          ${ARCS.map(arcChoiceCard).join("\n")}
        </div>
        <ul class="session-shape" aria-label="What's in a session">
          <li>A handful of prompts you each answer, side by side.</li>
          <li>A closing reflection — anything to come back to, anything to take forward.</li>
          <li>A shared summary, on screen and saveable as a PDF.</li>
        </ul>
        <p class="cta-note">One device, two to four people, no sign-up.</p>
      </section>

      ${advisoryFooter}
    </main>
  </body>
</html>
`;

// The session page is one HTML document with five sections (.step). A
// small inlined script swaps which section is active, walks through the
// chosen arc's prompts with progress + back/next preserving answers, then
// the reflection screen (tag prompts as "worth revisiting" with optional
// one-line notes), then the take-aways step, then the summary. State
// persists in sessionStorage under `common-ground.session.v2`, an object
// keyed by arc id so the two arcs never share answers/tags/notes/take-aways.
// No network calls. No third-party JS.
//
// Partner count is variable: 2 to 4. The setup screen has an "Add a
// partner" affordance and a per-row remove for rows 3+. Per-arc state
// holds `partners` (length-N array of names), `answers`, `tags`, `notes`
// indexed `[promptIndex][partnerIndex]`, and `takeaways` indexed
// `[partnerIndex]`. The eleven prompt wordings are unchanged across
// partner counts — see decision-log entry 2026-05-01 07:05.
const sessionScript = `
  (function () {
    var STORAGE_KEY = "common-ground.session.v2";
    var MIN_PARTNERS = 2;
    var MAX_PARTNERS = 4;
    var LETTERS = ["a", "b", "c", "d"];
    function letterFor(idx) {
      return LETTERS[idx] || ("p" + idx);
    }
    function indexFor(letter) {
      for (var i = 0; i < LETTERS.length; i++) {
        if (LETTERS[i] === letter) {
          return i;
        }
      }
      return -1;
    }

    var promptsTag = document.getElementById("prompts-data");
    var arcMeta = { id: "open", name: "An open conversation", shortName: "open conversation" };
    var PROMPTS = [];
    try {
      var parsed = JSON.parse(promptsTag.textContent || "{}");
      PROMPTS = Array.isArray(parsed.prompts) ? parsed.prompts : [];
      if (parsed.arc && typeof parsed.arc === "object") {
        arcMeta = {
          id: typeof parsed.arc.id === "string" ? parsed.arc.id : "open",
          name: typeof parsed.arc.name === "string" ? parsed.arc.name : "An open conversation",
          shortName: typeof parsed.arc.shortName === "string" ? parsed.arc.shortName : "open conversation"
        };
      }
    } catch (err) {
      PROMPTS = [];
    }
    var TOTAL = PROMPTS.length;
    var ARC_ID = arcMeta.id;

    var steps = {
      setup: document.getElementById("step-setup"),
      prompt: document.getElementById("step-prompt"),
      reflection: document.getElementById("step-reflection"),
      takeaways: document.getElementById("step-takeaways"),
      summary: document.getElementById("step-summary")
    };

    var partnersListEl = document.getElementById("partners-list");
    var addPartnerBtn = document.getElementById("add-partner-btn");
    var promptTextEl = document.getElementById("prompt-text");
    var progressTextEl = document.getElementById("progress-text");
    var progressBarFillEl = document.getElementById("progress-bar-fill");
    var beginBtn = document.getElementById("begin-btn");
    var backBtn = document.getElementById("back-btn");
    var nextBtn = document.getElementById("next-btn");
    var answersListEl = document.getElementById("answers-list");
    var reflectionListEl = document.getElementById("reflection-list");
    var reflectionBackBtn = document.getElementById("reflection-back-btn");
    var reflectionNextBtn = document.getElementById("reflection-next-btn");
    var takeawaysFormEl = document.getElementById("takeaways-form");
    var takeawayBackBtn = document.getElementById("takeaway-back-btn");
    var takeawayNextBtn = document.getElementById("takeaway-next-btn");
    var takeawaysSectionEl = document.getElementById("takeaways-section");
    var takeawaysListEl = document.getElementById("takeaways-list");
    var restartLink = document.getElementById("restart-link");
    var printBtn = document.getElementById("print-btn");
    var summaryListEl = document.getElementById("summary-list");
    var revisitSectionEl = document.getElementById("revisit-section");
    var revisitListEl = document.getElementById("revisit-list");
    var summaryNamesEl = document.getElementById("summary-names");
    var summaryDateEl = document.getElementById("summary-date");
    var printDateEl = document.getElementById("print-date");
    var printNamesEl = document.getElementById("print-names");

    // Per-arc state. partnerCount is 2..4. partners is the names array.
    // answers/tags/notes are arrays of length TOTAL where each entry is a
    // length-partnerCount array. takeaways is a length-partnerCount array.
    var partnerCount = 2;
    var partners = ["", ""];
    var promptIndex = 0;
    var answers = [];
    var tags = [];
    var notes = [];
    var takeaways = ["", ""];
    var summaryDate = "";

    function emptyArcSlots(count) {
      var n = count || 2;
      var newAnswers = [];
      var newTags = [];
      var newNotes = [];
      for (var i = 0; i < TOTAL; i++) {
        var ansRow = [];
        var tagRow = [];
        var noteRow = [];
        for (var j = 0; j < n; j++) {
          ansRow.push("");
          tagRow.push(false);
          noteRow.push("");
        }
        newAnswers.push(ansRow);
        newTags.push(tagRow);
        newNotes.push(noteRow);
      }
      var newTakeaways = [];
      var newPartners = [];
      for (var k = 0; k < n; k++) {
        newTakeaways.push("");
        newPartners.push("");
      }
      return {
        partnerCount: n,
        partners: newPartners,
        answers: newAnswers,
        tags: newTags,
        notes: newNotes,
        takeaways: newTakeaways,
        summaryDate: ""
      };
    }

    function resetToEmpty(count) {
      var slots = emptyArcSlots(count);
      partnerCount = slots.partnerCount;
      partners = slots.partners.slice();
      answers = slots.answers;
      tags = slots.tags;
      notes = slots.notes;
      takeaways = slots.takeaways.slice();
      summaryDate = slots.summaryDate;
    }

    resetToEmpty(2);

    function readRoot() {
      try {
        var raw = sessionStorage.getItem(STORAGE_KEY);
        if (!raw) {
          return {};
        }
        var parsedRoot = JSON.parse(raw);
        return parsedRoot && typeof parsedRoot === "object" ? parsedRoot : {};
      } catch (err) {
        return {};
      }
    }

    function readArcState() {
      var root = readRoot();
      var entry = root[ARC_ID];
      return entry && typeof entry === "object" ? entry : null;
    }

    function readPartnerNamesFromInputs() {
      var out = [];
      for (var i = 0; i < partnerCount; i++) {
        var input = document.getElementById("name-" + letterFor(i));
        out.push(input ? (input.value || "") : (partners[i] || ""));
      }
      return out;
    }

    function syncPartnersFromInputs() {
      partners = readPartnerNamesFromInputs();
    }

    function writeArcState(extraStep) {
      var root = readRoot();
      var stepName = extraStep || ((root[ARC_ID] && root[ARC_ID].step) || "setup");
      var liveNames = readPartnerNamesFromInputs();
      partners = liveNames;
      var resolved = currentNames();
      var entry = {
        step: stepName,
        promptIndex: promptIndex,
        partnerCount: partnerCount,
        partners: partners.slice(),
        answers: answers,
        tags: tags,
        notes: notes,
        takeaways: takeaways.slice(),
        summaryDate: summaryDate || "",
        resolvedNames: resolved
      };
      // Back-compat aliases for existing N=2 readers/tests. These mirror
      // the canonical fields above; the canonical source of truth is the
      // arrays. Only present when N >= 2 (always true).
      entry.nameA = partners[0] || "";
      entry.nameB = partners[1] || "";
      root[ARC_ID] = entry;
      try {
        sessionStorage.setItem(STORAGE_KEY, JSON.stringify(root));
      } catch (err) {
        // Storage may be disabled; the in-memory page state still works.
      }
    }

    function clearArcState() {
      var root = readRoot();
      if (root && Object.prototype.hasOwnProperty.call(root, ARC_ID)) {
        delete root[ARC_ID];
      }
      try {
        if (Object.keys(root).length === 0) {
          sessionStorage.removeItem(STORAGE_KEY);
        } else {
          sessionStorage.setItem(STORAGE_KEY, JSON.stringify(root));
        }
      } catch (err) {
        // ignore
      }
    }

    // Resolve display names for a given count of partners. Empty inputs
    // fall back to "Partner N". The first two also fall back to legacy
    // "You" / "Your partner" so the existing two-partner copy reads the
    // same when both names are blank — matching prior behaviour.
    function fallbackName(idx) {
      if (partnerCount === 2) {
        if (idx === 0) {
          return "You";
        }
        if (idx === 1) {
          return "Your partner";
        }
      }
      return "Partner " + (idx + 1);
    }

    function currentNames() {
      var resolved = [];
      var live = readPartnerNamesFromInputs();
      for (var i = 0; i < partnerCount; i++) {
        var raw = (live[i] || "").trim();
        resolved.push(raw === "" ? fallbackName(i) : raw);
      }
      return resolved;
    }

    // Build a British-English conjunction list, no Oxford comma.
    //   ["A"]               → "A"
    //   ["A","B"]           → "A and B"
    //   ["A","B","C"]       → "A, B and C"
    //   ["A","B","C","D"]   → "A, B, C and D"
    function joinNames(names) {
      var n = names.length;
      if (n === 0) {
        return "";
      }
      if (n === 1) {
        return names[0];
      }
      if (n === 2) {
        return names[0] + " and " + names[1];
      }
      var head = names.slice(0, n - 1).join(", ");
      return head + " and " + names[n - 1];
    }

    function show(stepName) {
      Object.keys(steps).forEach(function (key) {
        if (steps[key]) {
          steps[key].setAttribute("data-active", key === stepName ? "true" : "false");
        }
      });
      writeArcState(stepName);
      // Move keyboard focus to the new step's heading for accessibility.
      var heading = steps[stepName] && steps[stepName].querySelector("h1, h2");
      if (heading) {
        heading.setAttribute("tabindex", "-1");
        heading.focus({ preventScroll: false });
      }
    }

    // ----- Setup screen: dynamic partner rows. -----

    function renderPartnerRows() {
      var html = "";
      for (var i = 0; i < partnerCount; i++) {
        var letter = letterFor(i);
        var labelText = i === 0
          ? "Your name"
          : (i === 1 ? "Your partner's name" : "Partner " + (i + 1) + "'s name");
        var placeholder = i === 0 ? "You" : (i === 1 ? "Your partner" : "Partner " + (i + 1));
        var removeBtn = i >= 2
          ? '<button type="button" class="remove-partner-btn" data-remove-index="' + i + '" aria-label="Remove ' + escapeHtml(placeholder) + '">Remove</button>'
          : "";
        html += '<div class="partner-row field" data-partner-index="' + i + '">' +
          '<div class="partner-row-inner">' +
            '<div class="field" style="margin-bottom:0;">' +
              '<label for="name-' + letter + '">' + escapeHtml(labelText) + '</label>' +
              '<input id="name-' + letter + '" type="text" autocomplete="off" placeholder="' + escapeHtml(placeholder) + '" data-partner-input="' + i + '" value="' + escapeHtml(partners[i] || "") + '" />' +
            '</div>' +
            removeBtn +
          '</div>' +
        '</div>';
      }
      partnersListEl.innerHTML = html;
      // Wire up listeners on the new inputs and remove buttons.
      var inputs = partnersListEl.querySelectorAll('input[data-partner-input]');
      for (var k = 0; k < inputs.length; k++) {
        (function (input) {
          input.addEventListener("input", function () {
            syncPartnersFromInputs();
            writeArcState();
          });
        })(inputs[k]);
      }
      var removes = partnersListEl.querySelectorAll(".remove-partner-btn");
      for (var r = 0; r < removes.length; r++) {
        (function (btn) {
          btn.addEventListener("click", function () {
            var idx = parseInt(btn.getAttribute("data-remove-index") || "-1", 10);
            removePartnerAtIndex(idx);
          });
        })(removes[r]);
      }
      updateAddPartnerVisibility();
    }

    function updateAddPartnerVisibility() {
      if (!addPartnerBtn) {
        return;
      }
      if (partnerCount >= MAX_PARTNERS) {
        addPartnerBtn.setAttribute("hidden", "");
        addPartnerBtn.disabled = true;
      } else {
        addPartnerBtn.removeAttribute("hidden");
        addPartnerBtn.disabled = false;
      }
    }

    function addPartner() {
      if (partnerCount >= MAX_PARTNERS) {
        return;
      }
      syncPartnersFromInputs();
      partnerCount += 1;
      partners.push("");
      // Extend each per-prompt row by one slot.
      for (var i = 0; i < TOTAL; i++) {
        if (!answers[i]) {
          answers[i] = [];
        }
        if (!tags[i]) {
          tags[i] = [];
        }
        if (!notes[i]) {
          notes[i] = [];
        }
        while (answers[i].length < partnerCount) {
          answers[i].push("");
        }
        while (tags[i].length < partnerCount) {
          tags[i].push(false);
        }
        while (notes[i].length < partnerCount) {
          notes[i].push("");
        }
      }
      while (takeaways.length < partnerCount) {
        takeaways.push("");
      }
      renderPartnerRows();
      writeArcState();
    }

    function removePartnerAtIndex(idx) {
      if (idx < 2 || idx >= partnerCount) {
        return;
      }
      syncPartnersFromInputs();
      partners.splice(idx, 1);
      partnerCount -= 1;
      for (var i = 0; i < TOTAL; i++) {
        if (Array.isArray(answers[i]) && idx < answers[i].length) {
          answers[i].splice(idx, 1);
        }
        if (Array.isArray(tags[i]) && idx < tags[i].length) {
          tags[i].splice(idx, 1);
        }
        if (Array.isArray(notes[i]) && idx < notes[i].length) {
          notes[i].splice(idx, 1);
        }
      }
      if (idx < takeaways.length) {
        takeaways.splice(idx, 1);
      }
      renderPartnerRows();
      writeArcState();
    }

    // ----- Prompt screen: dynamic answer textareas. -----

    function renderAnswerInputs() {
      var html = "";
      var names = currentNames();
      for (var i = 0; i < partnerCount; i++) {
        var letter = letterFor(i);
        html += '<div class="field">' +
          '<label id="label-' + letter + '" for="answer-' + letter + '">' + escapeHtml(names[i]) + "'s answer" + '</label>' +
          '<textarea id="answer-' + letter + '" rows="6" data-answer-index="' + i + '"></textarea>' +
        '</div>';
      }
      answersListEl.innerHTML = html;
      answersListEl.setAttribute("data-count", String(partnerCount));
      var textareas = answersListEl.querySelectorAll("textarea[data-answer-index]");
      for (var t = 0; t < textareas.length; t++) {
        (function (ta) {
          ta.addEventListener("input", function () {
            captureCurrentAnswers();
            writeArcState();
          });
        })(textareas[t]);
      }
    }

    function updatePromptLabels() {
      var names = currentNames();
      for (var i = 0; i < partnerCount; i++) {
        var letter = letterFor(i);
        var labelEl = document.getElementById("label-" + letter);
        if (labelEl) {
          labelEl.textContent = names[i] + "'s answer";
        }
      }
    }

    function captureCurrentAnswers() {
      var row = answers[promptIndex] || [];
      for (var i = 0; i < partnerCount; i++) {
        var ta = document.getElementById("answer-" + letterFor(i));
        row[i] = ta ? (ta.value || "") : (row[i] || "");
      }
      while (row.length < partnerCount) {
        row.push("");
      }
      if (row.length > partnerCount) {
        row.length = partnerCount;
      }
      answers[promptIndex] = row;
    }

    function loadPromptAtIndex() {
      promptTextEl.textContent = PROMPTS[promptIndex];
      progressTextEl.textContent = "Prompt " + (promptIndex + 1) + " of " + TOTAL + " — " + arcMeta.name;
      var pct = TOTAL > 0 ? ((promptIndex + 1) / TOTAL) * 100 : 0;
      progressBarFillEl.style.width = pct + "%";
      var entry = answers[promptIndex];
      if (!Array.isArray(entry)) {
        entry = [];
        answers[promptIndex] = entry;
      }
      while (entry.length < partnerCount) {
        entry.push("");
      }
      for (var i = 0; i < partnerCount; i++) {
        var ta = document.getElementById("answer-" + letterFor(i));
        if (ta) {
          ta.value = entry[i] || "";
        }
      }
      // Back button: hidden on prompt 1.
      if (promptIndex === 0) {
        backBtn.setAttribute("hidden", "");
        backBtn.disabled = true;
      } else {
        backBtn.removeAttribute("hidden");
        backBtn.disabled = false;
      }
      // Next button reads "Reflect" on the final prompt.
      if (promptIndex === TOTAL - 1) {
        nextBtn.textContent = "Reflect";
      } else {
        nextBtn.textContent = "Next";
      }
      updatePromptLabels();
    }

    // ----- Take-aways screen. -----

    function renderTakeawayInputs() {
      var html = "";
      var names = currentNames();
      for (var i = 0; i < partnerCount; i++) {
        var letter = letterFor(i);
        html += '<div class="field">' +
          '<label for="takeaway-' + letter + '"><span id="takeaway-label-' + letter + '">' + escapeHtml(names[i]) + '</span></label>' +
          '<input id="takeaway-' + letter + '" type="text" autocomplete="off" maxlength="240" data-takeaway-index="' + i + '" />' +
        '</div>';
      }
      takeawaysFormEl.innerHTML = html;
      takeawaysFormEl.setAttribute("data-count", String(partnerCount));
      var inputs = takeawaysFormEl.querySelectorAll("input[data-takeaway-index]");
      for (var k = 0; k < inputs.length; k++) {
        (function (inp) {
          inp.addEventListener("input", function () {
            var idx = parseInt(inp.getAttribute("data-takeaway-index") || "-1", 10);
            if (idx >= 0 && idx < partnerCount) {
              takeaways[idx] = inp.value || "";
              writeArcState();
            }
          });
        })(inputs[k]);
      }
    }

    function rehydrateTakeawayInputs() {
      var names = currentNames();
      for (var i = 0; i < partnerCount; i++) {
        var letter = letterFor(i);
        var inp = document.getElementById("takeaway-" + letter);
        if (inp) {
          inp.value = takeaways[i] || "";
        }
        var lbl = document.getElementById("takeaway-label-" + letter);
        if (lbl) {
          lbl.textContent = names[i];
        }
      }
    }

    function captureTakeawaysFromInputs() {
      for (var i = 0; i < partnerCount; i++) {
        var inp = document.getElementById("takeaway-" + letterFor(i));
        if (inp) {
          takeaways[i] = inp.value || "";
        }
      }
      while (takeaways.length < partnerCount) {
        takeaways.push("");
      }
      if (takeaways.length > partnerCount) {
        takeaways.length = partnerCount;
      }
    }

    function formatStoredDate(iso) {
      var d;
      if (iso) {
        d = new Date(iso);
        if (isNaN(d.getTime())) {
          d = new Date();
        }
      } else {
        d = new Date();
      }
      try {
        return d.toLocaleDateString("en-GB", {
          day: "numeric",
          month: "long",
          year: "numeric"
        });
      } catch (err) {
        return d.toDateString();
      }
    }

    function captureSummaryDateIfNeeded() {
      if (!summaryDate) {
        summaryDate = new Date().toISOString();
        writeArcState();
      }
    }

    // Build the partners' names line for the summary metadata block.
    // British English: "and" between names, no Oxford comma. Fallback
    // labels are used when an individual name is blank.
    function partnerNamesLine() {
      var names = currentNames();
      return joinNames(names);
    }

    function escapeHtml(value) {
      return String(value)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#39;");
    }

    function renderReflection() {
      var names = currentNames();
      var html = "";
      for (var i = 0; i < TOTAL; i++) {
        var rowTags = Array.isArray(tags[i]) ? tags[i] : [];
        var rowNotes = Array.isArray(notes[i]) ? notes[i] : [];
        var tagsHtml = "";
        for (var p = 0; p < partnerCount; p++) {
          var letter = letterFor(p);
          var tagged = Boolean(rowTags[p]);
          var note = rowNotes[p] || "";
          tagsHtml += '<div class="reflection-tag" data-side="' + letter + '" data-partner-index="' + p + '">' +
            '<label class="toggle">' +
              '<input type="checkbox" data-tag-input="' + letter + '" data-partner-index="' + p + '" data-index="' + i + '"' + (tagged ? ' checked' : '') + ' />' +
              '<span data-tag-label="' + letter + '">Worth revisiting for ' + escapeHtml(names[p]) + '</span>' +
            '</label>' +
            '<div class="note-field" data-note-field="' + letter + '" data-partner-index="' + p + '"' + (tagged ? '' : ' hidden') + '>' +
              '<label for="note-' + letter + '-' + i + '">One-line note (optional)</label>' +
              '<input id="note-' + letter + '-' + i + '" type="text" data-note-input="' + letter + '" data-partner-index="' + p + '" data-index="' + i + '" maxlength="160" value="' + escapeHtml(note) + '" />' +
            '</div>' +
          '</div>';
        }
        html += '<article class="reflection-row" data-index="' + i + '">' +
          '<p class="row-prompt">' +
            '<span class="row-index">Prompt ' + (i + 1) + ' of ' + TOTAL + '</span>' +
            escapeHtml(PROMPTS[i]) +
          '</p>' +
          '<div class="reflection-tags" data-count="' + partnerCount + '">' +
            tagsHtml +
          '</div>' +
        '</article>';
      }
      reflectionListEl.innerHTML = html;
    }

    function onReflectionTagChange(event) {
      var target = event.target;
      if (!target) {
        return;
      }
      var pIdxStr = target.getAttribute("data-partner-index");
      var idxStr = target.getAttribute("data-index");
      if (pIdxStr === null || idxStr === null) {
        return;
      }
      var pIdx = parseInt(pIdxStr, 10);
      var idx = parseInt(idxStr, 10);
      if (isNaN(pIdx) || pIdx < 0 || pIdx >= partnerCount) {
        return;
      }
      if (isNaN(idx) || idx < 0 || idx >= TOTAL) {
        return;
      }
      if (!Array.isArray(tags[idx])) {
        tags[idx] = [];
      }
      while (tags[idx].length < partnerCount) {
        tags[idx].push(false);
      }
      tags[idx][pIdx] = Boolean(target.checked);
      // Show/hide the note field for that partner only. Existing note
      // text stays in memory and storage; toggling tag back on restores it.
      var row = target.closest(".reflection-row");
      if (row) {
        var noteField = row.querySelector(
          '[data-note-field][data-partner-index="' + pIdx + '"]'
        );
        if (noteField) {
          if (target.checked) {
            noteField.removeAttribute("hidden");
          } else {
            noteField.setAttribute("hidden", "");
          }
        }
      }
      writeArcState();
    }

    function onReflectionNoteInput(event) {
      var target = event.target;
      if (!target) {
        return;
      }
      var pIdxStr = target.getAttribute("data-partner-index");
      var idxStr = target.getAttribute("data-index");
      if (pIdxStr === null || idxStr === null) {
        return;
      }
      var pIdx = parseInt(pIdxStr, 10);
      var idx = parseInt(idxStr, 10);
      if (isNaN(pIdx) || pIdx < 0 || pIdx >= partnerCount) {
        return;
      }
      if (isNaN(idx) || idx < 0 || idx >= TOTAL) {
        return;
      }
      if (!Array.isArray(notes[idx])) {
        notes[idx] = [];
      }
      while (notes[idx].length < partnerCount) {
        notes[idx].push("");
      }
      notes[idx][pIdx] = target.value || "";
      writeArcState();
    }

    function renderRevisit() {
      var names = currentNames();
      var anyTagged = false;
      var html = "";
      for (var i = 0; i < TOTAL; i++) {
        var rowTags = Array.isArray(tags[i]) ? tags[i] : [];
        var rowNotes = Array.isArray(notes[i]) ? notes[i] : [];
        var taggedNames = [];
        var notesHtml = "";
        for (var p = 0; p < partnerCount; p++) {
          if (rowTags[p]) {
            anyTagged = true;
            taggedNames.push(names[p]);
            var note = (rowNotes[p] || "").trim();
            if (note !== "") {
              notesHtml += '<p class="revisit-note">' +
                '<span class="note-by">' + escapeHtml(names[p]) + ':</span>' +
                escapeHtml(note) +
              '</p>';
            }
          }
        }
        if (taggedNames.length === 0) {
          continue;
        }
        // Build "Tagged by <strong>X</strong> and <strong>Y</strong>" using
        // the British conjunction join.
        var taggedByHtml;
        if (taggedNames.length === 1) {
          taggedByHtml = '<strong>' + escapeHtml(taggedNames[0]) + '</strong>';
        } else if (taggedNames.length === 2) {
          taggedByHtml = '<strong>' + escapeHtml(taggedNames[0]) + '</strong> and <strong>' + escapeHtml(taggedNames[1]) + '</strong>';
        } else {
          // Three or more: comma-separate up to the penultimate, then "and".
          var head = "";
          for (var t = 0; t < taggedNames.length - 1; t++) {
            head += '<strong>' + escapeHtml(taggedNames[t]) + '</strong>';
            if (t < taggedNames.length - 2) {
              head += ', ';
            }
          }
          taggedByHtml = head + ' and <strong>' + escapeHtml(taggedNames[taggedNames.length - 1]) + '</strong>';
        }
        html += '<div class="revisit-item" data-index="' + i + '">' +
          '<p class="revisit-prompt">' +
            '<span class="revisit-index">Prompt ' + (i + 1) + '</span>' +
            escapeHtml(PROMPTS[i]) +
          '</p>' +
          '<p class="tagged-by">Tagged by ' + taggedByHtml + '</p>' +
          notesHtml +
        '</div>';
      }
      if (anyTagged) {
        revisitListEl.innerHTML = html;
        revisitSectionEl.removeAttribute("hidden");
      } else {
        revisitListEl.innerHTML = "";
        revisitSectionEl.setAttribute("hidden", "");
      }
    }

    function renderTakeaways() {
      if (!takeawaysSectionEl || !takeawaysListEl) {
        return;
      }
      var names = currentNames();
      var anyText = false;
      var html = "";
      for (var i = 0; i < partnerCount; i++) {
        var text = (takeaways[i] || "").trim();
        if (text === "") {
          continue;
        }
        anyText = true;
        var letter = letterFor(i);
        html += '<div class="takeaway-item" data-side="' + letter + '" data-partner-index="' + i + '">' +
          '<span class="takeaway-by"><strong>' + escapeHtml(names[i]) + '</strong></span>' +
          '<p class="takeaway-text">' + escapeHtml(text) + '</p>' +
        '</div>';
      }
      if (!anyText) {
        takeawaysListEl.innerHTML = "";
        takeawaysSectionEl.setAttribute("hidden", "");
        return;
      }
      takeawaysListEl.innerHTML = html;
      takeawaysSectionEl.removeAttribute("hidden");
    }

    function renderSummary() {
      var names = currentNames();
      var namesLine = partnerNamesLine();
      var dateText = formatStoredDate(summaryDate);
      summaryNamesEl.textContent = namesLine;
      summaryDateEl.textContent = dateText;
      if (printNamesEl) {
        printNamesEl.textContent = namesLine;
      }
      if (printDateEl) {
        printDateEl.textContent = dateText;
      }
      renderRevisit();
      renderTakeaways();
      var html = "";
      for (var i = 0; i < TOTAL; i++) {
        var entry = Array.isArray(answers[i]) ? answers[i] : [];
        var trimmed = [];
        var anyFilled = false;
        for (var p = 0; p < partnerCount; p++) {
          var t = (entry[p] || "").trim();
          trimmed.push(t);
          if (t !== "") {
            anyFilled = true;
          }
        }
        var isSkipped = !anyFilled;
        var blockClass = isSkipped ? "summary-prompt skipped" : "summary-prompt";
        var skippedTag = isSkipped
          ? ' <span class="skipped-tag">(skipped)</span>'
          : '';
        var blocksHtml = "";
        for (var q = 0; q < partnerCount; q++) {
          var cellText = trimmed[q];
          var cell = cellText === ""
            ? '<p class="empty">(skipped)</p>'
            : '<p>' + escapeHtml(cellText) + '</p>';
          blocksHtml += '<div class="summary-block">' +
            '<h3>' + escapeHtml(names[q]) + '</h3>' +
            cell +
          '</div>';
        }
        html += '<article class="' + blockClass + '" data-skipped="' + (isSkipped ? "true" : "false") + '">' +
          '<h2>Prompt ' + (i + 1) + ' of ' + TOTAL + skippedTag + '</h2>' +
          '<p class="prompt-text">' + escapeHtml(PROMPTS[i]) + '</p>' +
          '<div class="answers" data-count="' + partnerCount + '">' +
            blocksHtml +
          '</div>' +
        '</article>';
      }
      summaryListEl.innerHTML = html;
    }

    // ----- Rehydrate from sessionStorage. -----

    function rehydrate() {
      var state = readArcState();
      if (!state) {
        return;
      }
      // partnerCount: prefer the explicit count, fall back to inferring
      // from the partners array (or legacy nameA/nameB pair).
      var hydratedCount = 0;
      if (typeof state.partnerCount === "number" && state.partnerCount >= MIN_PARTNERS && state.partnerCount <= MAX_PARTNERS) {
        hydratedCount = state.partnerCount;
      } else if (Array.isArray(state.partners) && state.partners.length >= MIN_PARTNERS) {
        hydratedCount = Math.min(MAX_PARTNERS, state.partners.length);
      } else {
        hydratedCount = 2;
      }
      partnerCount = hydratedCount;

      // partners array.
      partners = [];
      if (Array.isArray(state.partners)) {
        for (var i = 0; i < partnerCount; i++) {
          var v = state.partners[i];
          partners.push(typeof v === "string" ? v : "");
        }
      } else {
        // Legacy nameA/nameB.
        var legacy0 = typeof state.nameA === "string" ? state.nameA : "";
        var legacy1 = typeof state.nameB === "string" ? state.nameB : "";
        partners.push(legacy0);
        partners.push(legacy1);
        while (partners.length < partnerCount) {
          partners.push("");
        }
      }

      // Re-shape the per-prompt arrays for the chosen count.
      var freshAnswers = [];
      var freshTags = [];
      var freshNotes = [];
      for (var pi = 0; pi < TOTAL; pi++) {
        var a = [];
        var t = [];
        var n = [];
        for (var pj = 0; pj < partnerCount; pj++) {
          a.push("");
          t.push(false);
          n.push("");
        }
        freshAnswers.push(a);
        freshTags.push(t);
        freshNotes.push(n);
      }

      if (Array.isArray(state.answers)) {
        for (var ai = 0; ai < TOTAL && ai < state.answers.length; ai++) {
          var srcA = state.answers[ai];
          if (Array.isArray(srcA)) {
            for (var aj = 0; aj < partnerCount && aj < srcA.length; aj++) {
              if (typeof srcA[aj] === "string") {
                freshAnswers[ai][aj] = srcA[aj];
              }
            }
          } else if (srcA && typeof srcA === "object") {
            // Legacy {a,b} shape.
            if (typeof srcA.a === "string") {
              freshAnswers[ai][0] = srcA.a;
            }
            if (typeof srcA.b === "string" && partnerCount > 1) {
              freshAnswers[ai][1] = srcA.b;
            }
          }
        }
      }

      if (Array.isArray(state.tags)) {
        for (var ti = 0; ti < TOTAL && ti < state.tags.length; ti++) {
          var srcT = state.tags[ti];
          if (Array.isArray(srcT)) {
            for (var tj = 0; tj < partnerCount && tj < srcT.length; tj++) {
              freshTags[ti][tj] = Boolean(srcT[tj]);
            }
          } else if (srcT && typeof srcT === "object") {
            // Legacy {a:{tagged,note}, b:{tagged,note}}.
            if (srcT.a && typeof srcT.a === "object") {
              freshTags[ti][0] = Boolean(srcT.a.tagged);
              if (typeof srcT.a.note === "string") {
                freshNotes[ti][0] = srcT.a.note;
              }
            }
            if (srcT.b && typeof srcT.b === "object" && partnerCount > 1) {
              freshTags[ti][1] = Boolean(srcT.b.tagged);
              if (typeof srcT.b.note === "string") {
                freshNotes[ti][1] = srcT.b.note;
              }
            }
          }
        }
      }

      if (Array.isArray(state.notes)) {
        for (var ni = 0; ni < TOTAL && ni < state.notes.length; ni++) {
          var srcN = state.notes[ni];
          if (Array.isArray(srcN)) {
            for (var nj = 0; nj < partnerCount && nj < srcN.length; nj++) {
              if (typeof srcN[nj] === "string") {
                freshNotes[ni][nj] = srcN[nj];
              }
            }
          }
        }
      }

      answers = freshAnswers;
      tags = freshTags;
      notes = freshNotes;

      // takeaways: array of length partnerCount.
      var freshTakeaways = [];
      for (var k = 0; k < partnerCount; k++) {
        freshTakeaways.push("");
      }
      if (Array.isArray(state.takeaways)) {
        for (var kk = 0; kk < partnerCount && kk < state.takeaways.length; kk++) {
          if (typeof state.takeaways[kk] === "string") {
            freshTakeaways[kk] = state.takeaways[kk];
          }
        }
      } else if (state.takeaways && typeof state.takeaways === "object") {
        // Legacy {a,b}.
        if (typeof state.takeaways.a === "string") {
          freshTakeaways[0] = state.takeaways.a;
        }
        if (typeof state.takeaways.b === "string" && partnerCount > 1) {
          freshTakeaways[1] = state.takeaways.b;
        }
      }
      takeaways = freshTakeaways;

      if (typeof state.promptIndex === "number" && state.promptIndex >= 0 && state.promptIndex < TOTAL) {
        promptIndex = state.promptIndex;
      }
      if (typeof state.summaryDate === "string") {
        summaryDate = state.summaryDate;
      }
      // Default to setup on reload — restarting the page should not skip ahead.
    }

    // ----- Setup screen wiring. -----

    if (addPartnerBtn) {
      addPartnerBtn.addEventListener("click", function () {
        addPartner();
      });
    }

    beginBtn.addEventListener("click", function () {
      syncPartnersFromInputs();
      promptIndex = 0;
      renderAnswerInputs();
      writeArcState();
      loadPromptAtIndex();
      show("prompt");
    });

    backBtn.addEventListener("click", function () {
      captureCurrentAnswers();
      if (promptIndex > 0) {
        promptIndex -= 1;
      }
      writeArcState();
      loadPromptAtIndex();
    });

    nextBtn.addEventListener("click", function () {
      captureCurrentAnswers();
      if (promptIndex < TOTAL - 1) {
        promptIndex += 1;
        writeArcState();
        loadPromptAtIndex();
      } else {
        writeArcState();
        renderReflection();
        show("reflection");
      }
    });

    restartLink.addEventListener("click", function (event) {
      event.preventDefault();
      clearArcState();
      promptIndex = 0;
      resetToEmpty(2);
      renderPartnerRows();
      renderAnswerInputs();
      renderTakeawayInputs();
      show("setup");
    });

    if (reflectionListEl) {
      reflectionListEl.addEventListener("change", function (event) {
        if (event.target && event.target.matches('input[data-tag-input]')) {
          onReflectionTagChange(event);
        }
      });
      reflectionListEl.addEventListener("input", function (event) {
        if (event.target && event.target.matches('input[data-note-input]')) {
          onReflectionNoteInput(event);
        }
      });
    }

    if (reflectionBackBtn) {
      reflectionBackBtn.addEventListener("click", function () {
        promptIndex = TOTAL - 1;
        writeArcState();
        loadPromptAtIndex();
        show("prompt");
      });
    }

    if (reflectionNextBtn) {
      reflectionNextBtn.addEventListener("click", function () {
        writeArcState();
        renderTakeawayInputs();
        rehydrateTakeawayInputs();
        show("takeaways");
      });
    }

    if (takeawayBackBtn) {
      takeawayBackBtn.addEventListener("click", function () {
        captureTakeawaysFromInputs();
        writeArcState();
        renderReflection();
        show("reflection");
      });
    }

    if (takeawayNextBtn) {
      takeawayNextBtn.addEventListener("click", function () {
        captureTakeawaysFromInputs();
        captureSummaryDateIfNeeded();
        writeArcState();
        renderSummary();
        show("summary");
      });
    }

    if (printBtn) {
      printBtn.addEventListener("click", function () {
        renderSummary();
        window.print();
      });
    }

    // ----- Boot. -----

    rehydrate();
    renderPartnerRows();
    renderAnswerInputs();
    renderTakeawayInputs();
    rehydrateTakeawayInputs();
    show("setup");
  })();
`;

function buildSessionHtml(arc: Arc): string {
  const promptsJson = JSON.stringify({
    prompts: arc.prompts,
    arc: { id: arc.id, name: arc.name, shortName: arc.shortName },
  });
  const total = arc.prompts.length;
  const initialPct = total > 0 ? (1 / total) * 100 : 0;
  const summaryHeading = `Your ${arc.shortName}`;
  const printHeading = `A household money conversation — ${arc.name}`;
  return `<!doctype html>
<html lang="en-GB">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>Common Ground — ${arc.name}</title>
    <meta
      name="description"
      content="Step through ${total} money conversation prompts together. State stays on this device."
    />
    <style>${sharedStyles}</style>
  </head>
  <body data-arc="${arc.id}">
    <main>
      <header class="no-print">
        <p class="eyebrow">Common Ground</p>
        <p class="arc-tag" id="arc-tag" data-arc="${arc.id}">${arc.name}</p>
      </header>

      <section id="step-setup" class="step" data-active="true" aria-labelledby="setup-heading">
        <h1 id="setup-heading">${arc.setupHeading}</h1>
        <p class="lede">
          ${arc.setupLede}
        </p>
        <p class="together">You're starting <strong>${arc.name}</strong>. <a href="/">Pick a different conversation</a>.</p>
        <div id="partners-list"></div>
        <div class="add-partner-row">
          <button id="add-partner-btn" class="secondary" type="button">Add a partner</button>
        </div>
        <button id="begin-btn" class="cta" type="button">Begin</button>
        <p class="privacy-note">
          Nothing you type leaves this device. There is no account and
          nothing to save on a server.
        </p>
      </section>

      <section id="step-prompt" class="step" data-active="false" aria-labelledby="prompt-heading">
        <h1 id="prompt-heading" class="visually-hidden" style="position:absolute;left:-9999px;">Prompt</h1>
        <p class="progress" id="progress-text" aria-live="polite">Prompt 1 of ${total} — ${arc.name}</p>
        <div class="progress-bar" aria-hidden="true">
          <span id="progress-bar-fill" style="width: ${initialPct.toFixed(2)}%"></span>
        </div>
        <p class="prompt" id="prompt-text"></p>
        <p class="together">
          Each of you answers in your own box. Short notes are fine — and
          you can leave any box empty. This is a conversation starter,
          not a form.
        </p>
        <div class="answers" id="answers-list" data-count="2"></div>
        <div class="nav-row">
          <button id="back-btn" class="secondary" type="button" hidden>Back</button>
          <button id="next-btn" class="cta" type="button">Next</button>
        </div>
        <p class="privacy-note">
          Going back keeps what you've already typed. Nothing is sent anywhere.
        </p>
      </section>

      <section id="step-reflection" class="step" data-active="false" aria-labelledby="reflection-heading">
        <h1 id="reflection-heading">Anything to come back to?</h1>
        <p class="reflection-intro">
          Before the summary, take a moment together. Tag any prompts from
          <strong>${arc.name}</strong> that any of you would like to revisit
          later in the week — and add a one-line note if it helps. Skipping
          the lot is a feature; the conversation does not need a homework
          list.
        </p>
        <p class="reflection-hint">
          Each of you decides for yourselves. Another partner's tag does
          not change yours.
        </p>
        <div id="reflection-list"></div>
        <div class="nav-row">
          <button id="reflection-back-btn" class="secondary" type="button">Back</button>
          <button id="reflection-next-btn" class="cta" type="button">Next</button>
        </div>
        <p class="privacy-note">
          Tags and notes stay on this device alongside your answers. Nothing
          is sent anywhere.
        </p>
      </section>

      <section id="step-takeaways" class="step" data-active="false" aria-labelledby="takeaways-heading">
        <h1 id="takeaways-heading">Anything you're each taking from this?</h1>
        <p class="reflection-intro">
          A thought, a small thing to do this week, anything you each want
          to keep in mind. Skipping is fine.
        </p>
        <div class="takeaways-form" id="takeaways-form" data-count="2"></div>
        <div class="nav-row">
          <button id="takeaway-back-btn" class="secondary" type="button">Back</button>
          <button id="takeaway-next-btn" class="cta" type="button">See summary</button>
        </div>
        <p class="privacy-note">
          What you write here stays on this device alongside your answers.
          Nothing is sent anywhere.
        </p>
      </section>

      <section id="step-summary" class="step" data-active="false" aria-labelledby="summary-heading">
        <div class="print-only">
          <p class="eyebrow">Common Ground</p>
          <h1>${printHeading}</h1>
          <p class="print-meta">
            <span class="print-meta-names" id="print-names"></span>
            <span class="print-meta-date" id="print-date"></span>
          </p>
        </div>
        <h1 id="summary-heading" class="no-print">${summaryHeading}</h1>
        <p class="summary-meta no-print">
          <span class="meta-names" id="summary-names"></span> · <span id="summary-date"></span>
        </p>
        <p class="lede no-print">
          The conversation is yours. Common Ground does not store this and
          does not interpret it for you. Use <strong>Save as PDF</strong> to
          keep a copy on your device.
        </p>
        <div class="nav-row no-print">
          <button id="print-btn" class="cta" type="button">Save as PDF</button>
          <a id="restart-link" class="secondary" href="#restart">Start a new session</a>
        </div>
        <section id="revisit-section" class="revisit-section" hidden aria-labelledby="revisit-heading">
          <h2 id="revisit-heading">Worth coming back to</h2>
          <p class="section-lede">
            The prompts each of you flagged to revisit later, in the order
            they came up.
          </p>
          <div id="revisit-list"></div>
        </section>
        <section id="takeaways-section" class="takeaways-section" hidden aria-labelledby="takeaways-summary-heading">
          <h2 id="takeaways-summary-heading">Taking forward</h2>
          <p class="section-lede">
            What each of you said you wanted to walk away with.
          </p>
          <div id="takeaways-list"></div>
        </section>
        <div id="summary-list"></div>
        <p class="privacy-note no-print">
          The Save as PDF button uses your browser's print dialogue —
          choose "Save as PDF" as the destination. Nothing is uploaded.
        </p>
        <p class="print-footer">
          Common Ground does not provide financial, tax, legal, or investment
          advice. It is a tool to help you talk to each other.
        </p>
      </section>

      ${advisoryFooter}
    </main>
    <script type="application/json" id="prompts-data">${promptsJson}</script>
    <script>${sessionScript}</script>
  </body>
</html>
`;
}

function htmlResponse(body: string): Response {
  return new Response(body, {
    headers: {
      "content-type": "text/html; charset=utf-8",
      "cache-control": "public, max-age=300",
    },
  });
}

export default {
  fetch(request: Request): Response {
    const url = new URL(request.url);
    if (url.pathname === "/session" || url.pathname === "/session/") {
      const arcParam = url.searchParams.get("arc");
      const arc = findArc(arcParam);
      return htmlResponse(buildSessionHtml(arc));
    }
    if (url.pathname === "/" || url.pathname === "") {
      return htmlResponse(landingHtml);
    }
    return new Response("Not found", {
      status: 404,
      headers: { "content-type": "text/plain; charset=utf-8" },
    });
  },
} satisfies ExportedHandler;
