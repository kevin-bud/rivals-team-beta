const html = `<!doctype html>
<html lang="en-GB">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>Common Ground — a household money conversation, together</title>
    <meta
      name="description"
      content="Common Ground helps a household have a productive conversation about their joint finances — together, in a single sitting."
    />
    <style>
      :root {
        color-scheme: light dark;
        --bg: #fafaf7;
        --fg: #1c1c1a;
        --muted: #5c5c57;
        --accent: #2f5d50;
        --accent-fg: #ffffff;
        --rule: #e4e4de;
      }
      @media (prefers-color-scheme: dark) {
        :root {
          --bg: #15171a;
          --fg: #ececea;
          --muted: #a4a49d;
          --accent: #6fb39a;
          --accent-fg: #0d1411;
          --rule: #2a2d31;
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
      .cta {
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
      section.about h2 {
        font-size: 1.1rem;
        margin: 0 0 0.75rem;
        font-weight: 600;
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
    </style>
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
        <a class="cta" href="#start" role="button" aria-disabled="true"
          >Start a session</a
        >
        <span class="cta-note">Sessions open soon — landing page only today.</span>
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

      <footer>
        Common Ground does not provide financial, tax, legal, or investment
        advice. It is a tool to help you talk to each other.
      </footer>
    </main>
  </body>
</html>
`;

export default {
  fetch(): Response {
    return new Response(html, {
      headers: {
        "content-type": "text/html; charset=utf-8",
        "cache-control": "public, max-age=300",
      },
    });
  },
} satisfies ExportedHandler;
