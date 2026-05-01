// Common Ground — single-Worker product. Two routes only:
//   GET /          → landing page
//   GET /session   → three-screen, single-device session flow
//                    (setup → six prompts with progress + back/next → summary)
// State lives entirely in the browser (sessionStorage). No fetches carry
// answer text. There is no other server-side route.

// The six curated prompts live here as the single source of truth. The
// session script reads them via a JSON tag in the served HTML, which keeps
// wording verbatim across UI and summary.
const PROMPTS: ReadonlyArray<string> = [
  "What's one money decision coming up in the next three months that affects both of you?",
  "When you think about money in your household right now, what feels good — and what feels uncertain?",
  "If a windfall of one month's take-home pay turned up tomorrow, no strings attached, what would each of you want to do with it?",
  "What's a recurring expense you'd like to talk about — bigger, smaller, or just understood differently — but haven't?",
  "Looking twelve months ahead, what's one thing about your money you'd like to feel more settled about?",
  "Is there something about money you wish your partner understood about how you grew up with it?",
];

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
  .nav-row {
    display: flex;
    flex-wrap: wrap;
    gap: 0.75rem;
    align-items: center;
    margin-top: 1.5rem;
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
    #step-prompt {
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
        <a class="cta" href="/session" role="button">Start a session</a>
        <span class="cta-note">One device, two people, no sign-up.</span>
      </header>

      <section class="about">
        <h2>What it is</h2>
        <p>
          A guided sitting for a couple or household. You answer six
          structured prompts together about near-term decisions, priorities,
          and concerns, and end with a shared summary you can save as a PDF.
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

// The session page is one HTML document with three sections (.step). A
// small inlined script swaps which section is active, walks through the
// six prompts with progress + back/next preserving answers, persists state
// to sessionStorage, and triggers window.print() for the saveable summary.
// No network calls. No third-party JS.
const sessionScript = `
  (function () {
    var STORAGE_KEY = "common-ground.session.v1";
    var promptsTag = document.getElementById("prompts-data");
    var PROMPTS = [];
    try {
      PROMPTS = JSON.parse(promptsTag.textContent || "[]");
    } catch (err) {
      PROMPTS = [];
    }
    var TOTAL = PROMPTS.length;

    var steps = {
      setup: document.getElementById("step-setup"),
      prompt: document.getElementById("step-prompt"),
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
    var restartLink = document.getElementById("restart-link");
    var printBtn = document.getElementById("print-btn");
    var summaryListEl = document.getElementById("summary-list");
    var summaryNamesEl = document.getElementById("summary-names");
    var summaryDateEl = document.getElementById("summary-date");
    var printDateEl = document.getElementById("print-date");
    var printNamesEl = document.getElementById("print-names");

    // promptIndex is the zero-based pointer into PROMPTS. answers is a
    // sparse array of { a, b } objects, one per prompt index. Empty entries
    // are allowed at every step — skipping is a feature.
    var promptIndex = 0;
    var answers = [];
    for (var i = 0; i < TOTAL; i++) {
      answers.push({ a: "", b: "" });
    }

    function readState() {
      try {
        var raw = sessionStorage.getItem(STORAGE_KEY);
        if (!raw) {
          return null;
        }
        return JSON.parse(raw);
      } catch (err) {
        return null;
      }
    }

    function writeState(extra) {
      var state = {
        step: extra && extra.step ? extra.step : ((readState() || {}).step || "setup"),
        promptIndex: promptIndex,
        nameA: nameAEl.value || "",
        nameB: nameBEl.value || "",
        answers: answers,
        resolvedNames: currentNames()
      };
      try {
        sessionStorage.setItem(STORAGE_KEY, JSON.stringify(state));
      } catch (err) {
        // Storage may be disabled; the in-memory page state still works.
      }
    }

    function clearState() {
      try {
        sessionStorage.removeItem(STORAGE_KEY);
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
      writeState({ step: stepName });
      // Move keyboard focus to the new step's heading for accessibility.
      var heading = steps[stepName] && steps[stepName].querySelector("h1, h2");
      if (heading) {
        heading.setAttribute("tabindex", "-1");
        heading.focus({ preventScroll: false });
      }
    }

    function rehydrate() {
      var state = readState();
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
      progressTextEl.textContent = "Prompt " + (promptIndex + 1) + " of " + TOTAL;
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
      // Next button reads "See summary" on the final prompt.
      if (promptIndex === TOTAL - 1) {
        nextBtn.textContent = "See summary";
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
        writeState({});
        updateLabelsFromNames();
      });
    });

    [answerAEl, answerBEl].forEach(function (el) {
      el.addEventListener("input", function () {
        captureCurrentAnswers();
        writeState({});
      });
    });

    beginBtn.addEventListener("click", function () {
      promptIndex = 0;
      writeState({});
      loadPromptAtIndex();
      show("prompt");
    });

    backBtn.addEventListener("click", function () {
      captureCurrentAnswers();
      if (promptIndex > 0) {
        promptIndex -= 1;
      }
      writeState({});
      loadPromptAtIndex();
    });

    nextBtn.addEventListener("click", function () {
      captureCurrentAnswers();
      if (promptIndex < TOTAL - 1) {
        promptIndex += 1;
        writeState({});
        loadPromptAtIndex();
      } else {
        writeState({});
        renderSummary();
        show("summary");
      }
    });

    restartLink.addEventListener("click", function (event) {
      event.preventDefault();
      clearState();
      promptIndex = 0;
      answers = [];
      for (var i = 0; i < TOTAL; i++) {
        answers.push({ a: "", b: "" });
      }
      nameAEl.value = "";
      nameBEl.value = "";
      answerAEl.value = "";
      answerBEl.value = "";
      updateLabelsFromNames();
      show("setup");
    });

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

const promptsJson = JSON.stringify(PROMPTS);

const sessionHtml = `<!doctype html>
<html lang="en-GB">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>Common Ground — your session</title>
    <meta
      name="description"
      content="Step through six money conversation prompts together. State stays on this device."
    />
    <style>${sharedStyles}</style>
  </head>
  <body>
    <main>
      <header class="no-print">
        <p class="eyebrow">Common Ground</p>
      </header>

      <section id="step-setup" class="step" data-active="true" aria-labelledby="setup-heading">
        <h1 id="setup-heading">Who is here?</h1>
        <p class="lede">
          Pop in your names so the prompts and summary can address each of
          you. Both partners share this device for the sitting.
        </p>
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
        <p class="progress" id="progress-text" aria-live="polite">Prompt 1 of 6</p>
        <div class="progress-bar" aria-hidden="true">
          <span id="progress-bar-fill" style="width: 16.66%"></span>
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

      <section id="step-summary" class="step" data-active="false" aria-labelledby="summary-heading">
        <div class="print-only">
          <p class="eyebrow">Common Ground</p>
          <h1>A household money conversation</h1>
          <p class="summary-meta">
            <span id="print-names"></span> · <span id="print-date"></span>
          </p>
        </div>
        <h1 id="summary-heading" class="no-print">Your summary</h1>
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
      return htmlResponse(sessionHtml);
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
