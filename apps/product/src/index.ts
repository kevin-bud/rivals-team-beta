// Common Ground — single-Worker product. Two routes only:
//   GET /          → landing page
//   GET /session   → three-screen, single-device session flow
// State lives entirely in the browser (sessionStorage). No fetches carry
// answer text. There is no other server-side route.

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
  .prompt {
    background: var(--field-bg);
    border: 1px solid var(--rule);
    padding: 1rem 1.1rem;
    border-radius: 0.5rem;
    margin: 0 0 1.5rem;
    font-size: 1.05rem;
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
          A guided sitting for a couple or household. You answer the same
          structured prompts about near-term decisions, priorities, and
          concerns, and end with a shared summary you can keep.
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
// small inlined script swaps which section is active and persists names
// and answers to sessionStorage. No network calls. No third-party JS.
const sessionScript = `
  (function () {
    var STORAGE_KEY = "common-ground.session.v1";
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
    var summaryNameAEl = document.getElementById("summary-name-a");
    var summaryNameBEl = document.getElementById("summary-name-b");
    var summaryAnswerAEl = document.getElementById("summary-answer-a");
    var summaryAnswerBEl = document.getElementById("summary-answer-b");
    var beginBtn = document.getElementById("begin-btn");
    var seeSummaryBtn = document.getElementById("see-summary-btn");
    var restartLink = document.getElementById("restart-link");

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

    function writeState(state) {
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

    function show(stepName) {
      Object.keys(steps).forEach(function (key) {
        if (steps[key]) {
          steps[key].setAttribute("data-active", key === stepName ? "true" : "false");
        }
      });
      var state = readState() || {};
      state.step = stepName;
      writeState(state);
      // Move keyboard focus to the new step's heading for accessibility.
      var heading = steps[stepName] && steps[stepName].querySelector("h1, h2");
      if (heading) {
        heading.setAttribute("tabindex", "-1");
        heading.focus({ preventScroll: false });
      }
    }

    function currentNames() {
      var a = (nameAEl.value || "").trim() || "You";
      var b = (nameBEl.value || "").trim() || "Your partner";
      return { a: a, b: b };
    }

    function persistFromInputs() {
      var names = currentNames();
      writeState({
        step: (readState() || {}).step || "setup",
        nameA: nameAEl.value || "",
        nameB: nameBEl.value || "",
        answerA: answerAEl.value || "",
        answerB: answerBEl.value || "",
        resolvedNameA: names.a,
        resolvedNameB: names.b
      });
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
      if (typeof state.answerA === "string") {
        answerAEl.value = state.answerA;
      }
      if (typeof state.answerB === "string") {
        answerBEl.value = state.answerB;
      }
      // Default to setup on reload — restarting the page should not skip ahead.
    }

    function updateLabelsFromNames() {
      var names = currentNames();
      labelAEl.textContent = names.a + "'s answer";
      labelBEl.textContent = names.b + "'s answer";
    }

    function renderSummary() {
      var names = currentNames();
      summaryNameAEl.textContent = names.a;
      summaryNameBEl.textContent = names.b;
      summaryAnswerAEl.textContent = (answerAEl.value || "").trim() || "(no answer)";
      summaryAnswerBEl.textContent = (answerBEl.value || "").trim() || "(no answer)";
    }

    [nameAEl, nameBEl, answerAEl, answerBEl].forEach(function (el) {
      el.addEventListener("input", function () {
        persistFromInputs();
        updateLabelsFromNames();
      });
    });

    beginBtn.addEventListener("click", function () {
      persistFromInputs();
      updateLabelsFromNames();
      show("prompt");
    });

    seeSummaryBtn.addEventListener("click", function () {
      persistFromInputs();
      renderSummary();
      show("summary");
    });

    restartLink.addEventListener("click", function (event) {
      event.preventDefault();
      clearState();
      nameAEl.value = "";
      nameBEl.value = "";
      answerAEl.value = "";
      answerBEl.value = "";
      updateLabelsFromNames();
      show("setup");
    });

    rehydrate();
    updateLabelsFromNames();
    show("setup");
  })();
`;

const sessionHtml = `<!doctype html>
<html lang="en-GB">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>Common Ground — your session</title>
    <meta
      name="description"
      content="Step through one money conversation prompt together. State stays on this device."
    />
    <style>${sharedStyles}</style>
  </head>
  <body>
    <main>
      <header>
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
        <h1 id="prompt-heading">One prompt</h1>
        <p class="prompt" id="prompt-text">
          What's one money decision coming up in the next three months that
          affects both of you?
        </p>
        <p class="together">
          Each of you answers in your own box. Short notes are fine — this is
          a conversation starter, not a form.
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
        <button id="see-summary-btn" class="cta" type="button">See summary</button>
        <p class="privacy-note">
          You can leave either box empty. Nothing is sent anywhere.
        </p>
      </section>

      <section id="step-summary" class="step" data-active="false" aria-labelledby="summary-heading">
        <h1 id="summary-heading">Your summary</h1>
        <p class="lede">
          The conversation is yours. Common Ground does not store this and
          does not interpret it for you.
        </p>
        <p class="prompt">
          What's one money decision coming up in the next three months that
          affects both of you?
        </p>
        <div class="answers">
          <div class="summary-block">
            <h3 id="summary-name-a">You</h3>
            <p id="summary-answer-a"></p>
          </div>
          <div class="summary-block">
            <h3 id="summary-name-b">Your partner</h3>
            <p id="summary-answer-b"></p>
          </div>
        </div>
        <a id="restart-link" class="restart" href="#restart">Start a new session</a>
        <p class="privacy-note">
          Take a screenshot or jot it down if you want to keep it. Closing
          this tab clears everything.
        </p>
      </section>

      ${advisoryFooter}
    </main>
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
