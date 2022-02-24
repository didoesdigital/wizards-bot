/** @jsx h */
import {
  h,
  json,
  jsx,
  Routes,
  serve,
  serveStatic,
  validateRequest,
} from "https://deno.land/x/sift@0.4.3/mod.ts";

import { twitterToNitter, mediumToScribe } from "./url.ts";

const routes: Routes = {
  "/": () => jsx(<Home />),
  "/nit": nitSlashCommand,
  "/style.css": serveStatic("style.css", { baseUrl: import.meta.url }),
  404: () => jsx(<NotFound />, { status: 404 }),
};
serve(routes);

async function nitSlashCommand(request: Request) {
  const { error } = await validateRequest(request, {
    POST: {
      headers: ["Authorization", "Content-Type"],
    },
  });
  if (error) {
    return json({ error: error.message }, { status: error.status });
  }

  // Check the token
  const valid = verifyToken(request);
  if (!valid) {
    return json(
      { error: "Invalid request" },
      { status: 401 },
    );
  }

  const formData = await request.formData();
  const formText = formData.get("text");
  if (typeof formText === "string" && !formText.match(/^\s*$/)) {
    const newText = mediumToScribe(twitterToNitter(formText));
    return json({
      "response_type": "in_channel",
      "text": `${newText}`,
    });
  } else {
    return json({
      "response_type": "ephemeral",
      "text": "You need to supply some text",
    });
  }
}

function verifyToken(request: Request): boolean {
  const TOKEN = Deno.env.get("MM_SLASH_TOKEN")!;
  const authorization = request.headers.get("Authorization")!;
  return authorization === ("Token " + TOKEN);
}

function Home() {
  return (
    <html>
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <title>Wizards Bot</title>
        <link rel="stylesheet" href="style.css" />
      </head>
      <body>
        <article>
          <main>
            <h1>🤖 Wizards Bot</h1>
            <h2>Available Commands</h2>

            <ul>
              <li>
                <code>/nit</code> — Convert Twitter links to Nitter links; Medium links to Scribe links.
              </li>
            </ul>
          </main>
          <footer>
            <p>
              <a href="https://github.com/wezm/wizards-bot">Source on GitHub</a>
            </p>
          </footer>
        </article>
      </body>
    </html>
  );
};

function NotFound() {
  return (
    <html>
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <title>Wizards Bot</title>
        <link rel="stylesheet" href="style.css" />
      </head>
      <body>
        <article>
          <main>
            <h1>Not Found</h1>
            <p>🤖 Bleep Bloop. This page could not be found.</p>
          </main>
          <footer>
            <p>
              <a href="https://github.com/wezm/wizards-bot">Source on GitHub</a>
            </p>
          </footer>
        </article>
      </body>
    </html>
  );
};

