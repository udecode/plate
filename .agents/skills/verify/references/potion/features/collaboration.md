# Collaboration (Yjs)

Real-time editing through the Hocuspocus server (`src/server/yjs/server.ts`)
with the Redis extension. The server authenticates each socket with the same
better-auth session cookie: owners edit, others get read-only on published
pages and are refused on unpublished ones; archived or locked pages are
read-only.

## Sub-features

- Turning collaboration on for a page (navbar `Collaborate`).
- Two clients converging.
- Offline edits merging on reconnect.
- Anonymous read-only access to a published page.

## How to get to it (user POV)

Open a page, press `Collaborate` in the navbar, share the URL.

## Driving it with the built-in browser

One-off per case; no fixed script, because each collaboration bug needs its own
setup, operations, waits and assertions.

1. `"$STACK" login` (and a second `login` for another user if the case needs
   one). Open the same `/<id>` in two tabs (`preview_start` with the URL opens
   a new tab), A and B.
2. Prepare only the document state the repro needs.
3. For offline cases, isolate B alone and prove it: a fetch from A succeeds,
   a fetch from B fails, and B can reconnect without taking A offline. A tool
   that can only take the whole browser offline is the wrong oracle here.
4. Do B's offline edit, A's online edit, reconnect B.
5. Read the document from both tabs and log the result; restore B online.
6. Proof: both tabs show the same content after reload, and
   `select "yjsSnapshot" is not null from "Document" where id = '<id>'` is
   true. `tmp/verify/logs/yjs.log` shows auth errors.

## Gotchas

- Not yet driven by this recipe; the first run fills in the `Collaborate`
  toggle's effect and the selectors.
- The socket URL is `ws://127.0.0.1:4544/yjs`; a page opened on `localhost`
  sends the wrong cookie and the server rejects it as anonymous.
- Compare Plate-level Yjs results against this app as a reference, not as
  automatic proof: check schema, normalization and operation order match.
