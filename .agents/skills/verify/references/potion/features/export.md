# Export and print

Export a page to a file, Word included. Server-side exports render
`/print/<documentId>` with puppeteer and pass the user's cookies so the
better-auth session validates. The first run lists the formats the menu
actually offers.

## Sub-features

- Print route `/print/<id>`.
- Puppeteer-rendered exports.
- DOCX export.

## How to get to it (user POV)

Navbar `More actions` (the `…` button) on a page, then the export entry.

## Driving it with the built-in browser

1. Sign in, open `/<id>`, open `More actions`, pick a format.
2. Proof: the downloaded file exists and opens with the page's title and body;
   `/print/<id>` renders the same content in the browser.

## Gotchas

- Not yet driven by this recipe. Downloads need the user's go-ahead in the
  browser; save them under the evidence directory.
- Puppeteer must reach the app on `127.0.0.1:3100`; check `next.log` for its
  requests when an export hangs.
