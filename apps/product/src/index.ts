// Common Ground — single-Worker product. Routes:
//   GET /                       → landing page (two arcs surfaced)
//   GET /session?arc=open       → six-prompt arc ("An open conversation")
//   GET /session?arc=purchase   → five-prompt arc ("A big upcoming purchase")
//   GET /session                → defaults to the open arc
// State lives entirely in the browser (sessionStorage) under the key
// `common-ground.session.v2`, an object keyed by arc id so each arc has its
// own answers/tags/notes — no leakage between arcs. There is no other
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
      "Pop in your names so the prompts and summary can address each of you. Both partners share this device for the sitting.",
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
      "Pop in your names so the prompts and summary can address each of you. Both partners share this device for the sitting.",
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
  section.about {
    margin-top: 3rem;
    padding-top: 2rem;
    border-top: 1px solid var(--rule);
  }
  section.about p {
    margin: 0 0 0.75rem;
    color: var(--fg);
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
  .answers {
    display: grid;
    grid-template-columns: 1fr;
    gap: 1.25rem;
  }
  @media (min-width: 36rem) {
    .answers {
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
    .reflection-tags {
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
    #step-reflection {
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
      content="Common Ground helps a household have a productive conversation about their joint finances — together, in a single sitting."
    />
    <style>${sharedStyles}</style>
  </head>
  <body>
    <main>
      <header>
        <p class="eyebrow">Common Ground</p>
        <h1>A household money conversation, together.</h1>
        <p class="lede">
          Common Ground helps a household have a productive conversation about
          their joint finances — together, in a single sitting.
        </p>
        <p class="together">
          Built for two or more people in a household to use side by side, not
          a dashboard for one person to log in to alone.
        </p>
      </header>

      <section aria-labelledby="choose-heading">
        <h2 id="choose-heading">Choose a conversation</h2>
        <p class="together">
          Two arcs to pick from, both single-device and self-paced. Pick the
          one that fits the sitting you're about to have.
        </p>
        <div class="arc-choices">
          ${ARCS.map(arcChoiceCard).join("\n")}
        </div>
        <p class="cta-note">One device, two people, no sign-up.</p>
      </section>

      <section class="about">
        <h2>What it is</h2>
        <p>
          A guided sitting for a couple or household. You step through a small
          set of structured prompts together, tag what you'd like to revisit,
          and end with a shared summary you can save as a PDF.
        </p>
        <h2>What it isn't</h2>
        <p>
          Not a budgeting app, not an accountant, not an adviser. Common Ground
          surfaces what your household already thinks. It does not tell you
          what to do with your money.
        </p>
      </section>

      ${advisoryFooter}
    </main>
  </body>
</html>
`;

// The session page is one HTML document with four sections (.step). A
// small inlined script swaps which section is active, walks through the
// chosen arc's prompts with progress + back/next preserving answers, then
// the reflection screen (tag prompts as "worth revisiting" with optional
// one-line notes), then the summary. State persists in sessionStorage
// under `common-ground.session.v2`, an object keyed by arc id so the two
// arcs never share answers/tags/notes. No network calls. No third-party JS.
const sessionScript = `
  (function () {
    var STORAGE_KEY = "common-ground.session.v2";
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
      summary: document.getElementById("step-summary")
    };
    var nameAEl = document.getElementById("name-a");
    var nameBEl = document.getElementById("name-b");
    var answerAEl = document.getElementById("answer-a");
    var answerBEl = document.getElementById("answer-b");
    var labelAEl = document.getElementById("label-a");
    var labelBEl = document.getElementById("label-b");
    var promptTextEl = document.getElementById("prompt-text");
    var progressTextEl = document.getElementById("progress-text");
    var progressBarFillEl = document.getElementById("progress-bar-fill");
    var beginBtn = document.getElementById("begin-btn");
    var backBtn = document.getElementById("back-btn");
    var nextBtn = document.getElementById("next-btn");
    var reflectionListEl = document.getElementById("reflection-list");
    var reflectionBackBtn = document.getElementById("reflection-back-btn");
    var reflectionNextBtn = document.getElementById("reflection-next-btn");
    var restartLink = document.getElementById("restart-link");
    var printBtn = document.getElementById("print-btn");
    var summaryListEl = document.getElementById("summary-list");
    var revisitSectionEl = document.getElementById("revisit-section");
    var revisitListEl = document.getElementById("revisit-list");
    var summaryNamesEl = document.getElementById("summary-names");
    var summaryDateEl = document.getElementById("summary-date");
    var printDateEl = document.getElementById("print-date");
    var printNamesEl = document.getElementById("print-names");

    // promptIndex is the zero-based pointer into PROMPTS. answers is a
    // sparse array of { a, b } objects, one per prompt index. Empty entries
    // are allowed at every step — skipping is a feature.
    // tags is one entry per prompt index: { a: { tagged: bool, note: string },
    // b: { tagged: bool, note: string } }. Both partners default to off.
    var promptIndex = 0;
    var answers = [];
    var tags = [];
    function emptyArcSlots() {
      var newAnswers = [];
      var newTags = [];
      for (var i = 0; i < TOTAL; i++) {
        newAnswers.push({ a: "", b: "" });
        newTags.push({
          a: { tagged: false, note: "" },
          b: { tagged: false, note: "" }
        });
      }
      return { answers: newAnswers, tags: newTags };
    }
    var initial = emptyArcSlots();
    answers = initial.answers;
    tags = initial.tags;

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

    function writeArcState(extraStep) {
      var root = readRoot();
      var stepName = extraStep || ((root[ARC_ID] && root[ARC_ID].step) || "setup");
      root[ARC_ID] = {
        step: stepName,
        promptIndex: promptIndex,
        nameA: nameAEl.value || "",
        nameB: nameBEl.value || "",
        answers: answers,
        tags: tags,
        resolvedNames: currentNames()
      };
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

    function currentNames() {
      var a = (nameAEl.value || "").trim() || "You";
      var b = (nameBEl.value || "").trim() || "Your partner";
      return { a: a, b: b };
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

    function rehydrate() {
      var state = readArcState();
      if (!state) {
        return;
      }
      if (typeof state.nameA === "string") {
        nameAEl.value = state.nameA;
      }
      if (typeof state.nameB === "string") {
        nameBEl.value = state.nameB;
      }
      if (Array.isArray(state.answers)) {
        for (var i = 0; i < TOTAL; i++) {
          var entry = state.answers[i];
          if (entry && typeof entry === "object") {
            answers[i] = {
              a: typeof entry.a === "string" ? entry.a : "",
              b: typeof entry.b === "string" ? entry.b : ""
            };
          }
        }
      }
      if (Array.isArray(state.tags)) {
        for (var t = 0; t < TOTAL; t++) {
          var tagEntry = state.tags[t];
          if (tagEntry && typeof tagEntry === "object") {
            var aSide = tagEntry.a && typeof tagEntry.a === "object" ? tagEntry.a : {};
            var bSide = tagEntry.b && typeof tagEntry.b === "object" ? tagEntry.b : {};
            tags[t] = {
              a: {
                tagged: Boolean(aSide.tagged),
                note: typeof aSide.note === "string" ? aSide.note : ""
              },
              b: {
                tagged: Boolean(bSide.tagged),
                note: typeof bSide.note === "string" ? bSide.note : ""
              }
            };
          }
        }
      }
      if (typeof state.promptIndex === "number" && state.promptIndex >= 0 && state.promptIndex < TOTAL) {
        promptIndex = state.promptIndex;
      }
      // Default to setup on reload — restarting the page should not skip ahead.
    }

    function updateLabelsFromNames() {
      var names = currentNames();
      labelAEl.textContent = names.a + "'s answer";
      labelBEl.textContent = names.b + "'s answer";
    }

    function captureCurrentAnswers() {
      answers[promptIndex] = {
        a: answerAEl.value || "",
        b: answerBEl.value || ""
      };
    }

    function loadPromptAtIndex() {
      promptTextEl.textContent = PROMPTS[promptIndex];
      progressTextEl.textContent = "Prompt " + (promptIndex + 1) + " of " + TOTAL + " — " + arcMeta.name;
      var pct = TOTAL > 0 ? ((promptIndex + 1) / TOTAL) * 100 : 0;
      progressBarFillEl.style.width = pct + "%";
      var entry = answers[promptIndex] || { a: "", b: "" };
      answerAEl.value = entry.a || "";
      answerBEl.value = entry.b || "";
      // Back button: hidden on prompt 1.
      if (promptIndex === 0) {
        backBtn.setAttribute("hidden", "");
        backBtn.disabled = true;
      } else {
        backBtn.removeAttribute("hidden");
        backBtn.disabled = false;
      }
      // Next button reads "Reflect" on the final prompt — the reflection
      // screen sits between the last prompt and the summary.
      if (promptIndex === TOTAL - 1) {
        nextBtn.textContent = "Reflect";
      } else {
        nextBtn.textContent = "Next";
      }
      updateLabelsFromNames();
    }

    function formatToday() {
      var d = new Date();
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
        var tagEntry = tags[i] || {
          a: { tagged: false, note: "" },
          b: { tagged: false, note: "" }
        };
        var aTagged = Boolean(tagEntry.a && tagEntry.a.tagged);
        var bTagged = Boolean(tagEntry.b && tagEntry.b.tagged);
        var aNote = (tagEntry.a && tagEntry.a.note) || "";
        var bNote = (tagEntry.b && tagEntry.b.note) || "";
        html += '<article class="reflection-row" data-index="' + i + '">' +
          '<p class="row-prompt">' +
            '<span class="row-index">Prompt ' + (i + 1) + ' of ' + TOTAL + '</span>' +
            escapeHtml(PROMPTS[i]) +
          '</p>' +
          '<div class="reflection-tags">' +
            '<div class="reflection-tag" data-side="a">' +
              '<label class="toggle">' +
                '<input type="checkbox" data-tag-input="a" data-index="' + i + '"' + (aTagged ? ' checked' : '') + ' />' +
                '<span data-tag-label="a">Worth revisiting for ' + escapeHtml(names.a) + '</span>' +
              '</label>' +
              '<div class="note-field" data-note-field="a"' + (aTagged ? '' : ' hidden') + '>' +
                '<label for="note-a-' + i + '">One-line note (optional)</label>' +
                '<input id="note-a-' + i + '" type="text" data-note-input="a" data-index="' + i + '" maxlength="160" value="' + escapeHtml(aNote) + '" />' +
              '</div>' +
            '</div>' +
            '<div class="reflection-tag" data-side="b">' +
              '<label class="toggle">' +
                '<input type="checkbox" data-tag-input="b" data-index="' + i + '"' + (bTagged ? ' checked' : '') + ' />' +
                '<span data-tag-label="b">Worth revisiting for ' + escapeHtml(names.b) + '</span>' +
              '</label>' +
              '<div class="note-field" data-note-field="b"' + (bTagged ? '' : ' hidden') + '>' +
                '<label for="note-b-' + i + '">One-line note (optional)</label>' +
                '<input id="note-b-' + i + '" type="text" data-note-input="b" data-index="' + i + '" maxlength="160" value="' + escapeHtml(bNote) + '" />' +
              '</div>' +
            '</div>' +
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
      var side = target.getAttribute("data-tag-input");
      var idxStr = target.getAttribute("data-index");
      if (!side || idxStr === null) {
        return;
      }
      var idx = parseInt(idxStr, 10);
      if (isNaN(idx) || idx < 0 || idx >= TOTAL) {
        return;
      }
      var tagEntry = tags[idx];
      if (!tagEntry || !tagEntry[side]) {
        return;
      }
      tagEntry[side].tagged = Boolean(target.checked);
      // Show/hide the note field based on tag state. Existing note text is
      // preserved in memory and storage even when hidden, so re-tagging
      // restores it.
      var row = target.closest(".reflection-row");
      if (row) {
        var noteField = row.querySelector(
          '[data-note-field="' + side + '"]'
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
      var side = target.getAttribute("data-note-input");
      var idxStr = target.getAttribute("data-index");
      if (!side || idxStr === null) {
        return;
      }
      var idx = parseInt(idxStr, 10);
      if (isNaN(idx) || idx < 0 || idx >= TOTAL) {
        return;
      }
      var tagEntry = tags[idx];
      if (!tagEntry || !tagEntry[side]) {
        return;
      }
      tagEntry[side].note = target.value || "";
      writeArcState();
    }

    function renderRevisit() {
      var names = currentNames();
      var anyTagged = false;
      var html = "";
      for (var i = 0; i < TOTAL; i++) {
        var tagEntry = tags[i] || {
          a: { tagged: false, note: "" },
          b: { tagged: false, note: "" }
        };
        var aTagged = Boolean(tagEntry.a && tagEntry.a.tagged);
        var bTagged = Boolean(tagEntry.b && tagEntry.b.tagged);
        if (!aTagged && !bTagged) {
          continue;
        }
        anyTagged = true;
        var taggedNames = [];
        if (aTagged) {
          taggedNames.push(escapeHtml(names.a));
        }
        if (bTagged) {
          taggedNames.push(escapeHtml(names.b));
        }
        var notesHtml = "";
        var aNote = aTagged ? ((tagEntry.a.note || "").trim()) : "";
        var bNote = bTagged ? ((tagEntry.b.note || "").trim()) : "";
        if (aNote !== "") {
          notesHtml += '<p class="revisit-note">' +
            '<span class="note-by">' + escapeHtml(names.a) + ':</span>' +
            escapeHtml(aNote) +
          '</p>';
        }
        if (bNote !== "") {
          notesHtml += '<p class="revisit-note">' +
            '<span class="note-by">' + escapeHtml(names.b) + ':</span>' +
            escapeHtml(bNote) +
          '</p>';
        }
        html += '<div class="revisit-item" data-index="' + i + '">' +
          '<p class="revisit-prompt">' +
            '<span class="revisit-index">Prompt ' + (i + 1) + '</span>' +
            escapeHtml(PROMPTS[i]) +
          '</p>' +
          '<p class="tagged-by">Tagged by <strong>' + taggedNames.join("</strong> and <strong>") + '</strong></p>' +
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

    function renderSummary() {
      var names = currentNames();
      var dateText = formatToday();
      summaryNamesEl.textContent = names.a + " and " + names.b;
      summaryDateEl.textContent = dateText;
      if (printNamesEl) {
        printNamesEl.textContent = names.a + " and " + names.b;
      }
      if (printDateEl) {
        printDateEl.textContent = dateText;
      }
      renderRevisit();
      var html = "";
      for (var i = 0; i < TOTAL; i++) {
        var entry = answers[i] || { a: "", b: "" };
        var aText = (entry.a || "").trim();
        var bText = (entry.b || "").trim();
        var isSkipped = aText === "" && bText === "";
        var blockClass = isSkipped ? "summary-prompt skipped" : "summary-prompt";
        var skippedTag = isSkipped
          ? ' <span class="skipped-tag">(skipped)</span>'
          : "";
        var aCell = aText === ""
          ? '<p class="empty">(skipped)</p>'
          : '<p>' + escapeHtml(aText) + '</p>';
        var bCell = bText === ""
          ? '<p class="empty">(skipped)</p>'
          : '<p>' + escapeHtml(bText) + '</p>';
        html += '<article class="' + blockClass + '" data-skipped="' + (isSkipped ? "true" : "false") + '">' +
          '<h2>Prompt ' + (i + 1) + ' of ' + TOTAL + skippedTag + '</h2>' +
          '<p class="prompt-text">' + escapeHtml(PROMPTS[i]) + '</p>' +
          '<div class="answers">' +
            '<div class="summary-block">' +
              '<h3>' + escapeHtml(names.a) + '</h3>' +
              aCell +
            '</div>' +
            '<div class="summary-block">' +
              '<h3>' + escapeHtml(names.b) + '</h3>' +
              bCell +
            '</div>' +
          '</div>' +
        '</article>';
      }
      summaryListEl.innerHTML = html;
    }

    [nameAEl, nameBEl].forEach(function (el) {
      el.addEventListener("input", function () {
        writeArcState();
        updateLabelsFromNames();
      });
    });

    [answerAEl, answerBEl].forEach(function (el) {
      el.addEventListener("input", function () {
        captureCurrentAnswers();
        writeArcState();
      });
    });

    beginBtn.addEventListener("click", function () {
      promptIndex = 0;
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
      var fresh = emptyArcSlots();
      answers = fresh.answers;
      tags = fresh.tags;
      nameAEl.value = "";
      nameBEl.value = "";
      answerAEl.value = "";
      answerBEl.value = "";
      updateLabelsFromNames();
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
        // Return to the final prompt with all answers and tagging state preserved.
        promptIndex = TOTAL - 1;
        writeArcState();
        loadPromptAtIndex();
        show("prompt");
      });
    }

    if (reflectionNextBtn) {
      reflectionNextBtn.addEventListener("click", function () {
        writeArcState();
        renderSummary();
        show("summary");
      });
    }

    if (printBtn) {
      printBtn.addEventListener("click", function () {
        // Re-render before printing in case names/answers changed since
        // the summary was first opened.
        renderSummary();
        window.print();
      });
    }

    rehydrate();
    updateLabelsFromNames();
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
        <div class="field">
          <label for="name-a">Your name</label>
          <input id="name-a" type="text" autocomplete="off" placeholder="You" />
        </div>
        <div class="field">
          <label for="name-b">Your partner's name</label>
          <input id="name-b" type="text" autocomplete="off" placeholder="Your partner" />
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
          you can leave either box empty. This is a conversation starter,
          not a form.
        </p>
        <div class="answers">
          <div class="field">
            <label id="label-a" for="answer-a">Your answer</label>
            <textarea id="answer-a" rows="6"></textarea>
          </div>
          <div class="field">
            <label id="label-b" for="answer-b">Your partner's answer</label>
            <textarea id="answer-b" rows="6"></textarea>
          </div>
        </div>
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
          <strong>${arc.name}</strong> that either of you would like to revisit
          later in the week — and add a one-line note if it helps. Skipping
          the lot is a feature; the conversation does not need a homework
          list.
        </p>
        <p class="reflection-hint">
          Each of you decides for yourselves. The other partner's tag does
          not change yours.
        </p>
        <div id="reflection-list"></div>
        <div class="nav-row">
          <button id="reflection-back-btn" class="secondary" type="button">Back</button>
          <button id="reflection-next-btn" class="cta" type="button">See summary</button>
        </div>
        <p class="privacy-note">
          Tags and notes stay on this device alongside your answers. Nothing
          is sent anywhere.
        </p>
      </section>

      <section id="step-summary" class="step" data-active="false" aria-labelledby="summary-heading">
        <div class="print-only">
          <p class="eyebrow">Common Ground</p>
          <h1>${printHeading}</h1>
          <p class="summary-meta">
            <span id="print-names"></span> · <span id="print-date"></span>
          </p>
        </div>
        <h1 id="summary-heading" class="no-print">${summaryHeading}</h1>
        <p class="summary-meta no-print">
          <span id="summary-names"></span> · <span id="summary-date"></span>
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
