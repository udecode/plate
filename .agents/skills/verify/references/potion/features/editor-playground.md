# Editor playground

`/editor` renders the full `PlateEditor` from `src/registry/components/editor`
without a document or sign-in. It is the fastest place to prove a pure editor
behavior (marks, blocks, slash menu, toolbars, tables, AI menu UI).

## Sub-features

- Slash menu, floating toolbar, block menus, tables, media, mentions.
- AI menu and copilot (need `AI_GATEWAY_API_KEY` in `.env.local`).

## How to get to it (user POV)

Sidebar `Editor` while signed in, or open `/editor` directly.

## Driving it with the built-in browser

1. `"$STACK" up`, then open `http://127.0.0.1:3100/editor`.
2. Click into the editor body and drive with `computer` `type` / `key`.
3. Proof is what renders: `read_page` / screenshots. Nothing persists here.

## Gotchas

- Not yet driven by this recipe; the first run fills in concrete steps.
- Nothing persists, so a bug about saving, permissions or collaboration needs
  documents.md or collaboration.md, not this route.
