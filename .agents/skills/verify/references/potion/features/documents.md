# Documents

A signed-in user's pages: the sidebar lists them under `Private`, each opens at
`/<documentId>` with an icon, cover, title and Plate editor body.

## Sub-features

- Create a page (sidebar new-page button, tooltip `Create a new page`).
- Add a child page (row hover, tooltip `Add a page inside`).
- Title, icon (`Add Icon`), cover (`Add cover`).
- Body editing and persistence.
- Trash and restore (sidebar `Trash`, tooltip `Restore deleted pages`).
- Search (sidebar `Search`).

## How to get to it (user POV)

Sign in, land on `/`, pick a page in the sidebar or press the pencil icon at
the top right of the sidebar to make a new one.

## Driving it with the built-in browser

1. `"$STACK" login > tmp/verify/login.json`, run its `setCookieJs` on
   `http://127.0.0.1:3100/login`, open any listed document id.
2. Click the pencil icon right of the workspace name (top of the sidebar, at
   about x=215, y=17 in a 1024-wide viewport). The URL changes to a new
   `/<id>` and an `Untitled` row appears at the top of `Private`.
3. Click the `Untitled` textbox, type the title, press `Enter`, type the body.
4. Wait about 4 s for the save debounce, then reload the same URL.
5. Proof: `get_page_text` shows the body after reload, the sidebar row and
   navbar breadcrumb show the title, and
   `select title, content from "Document" where id = '<id>'` holds both, with
   the body as `[{"type":"p","children":[{"text":…}]}]`.

## Gotchas

- With collaboration off, the body saves to `Document.content`; `yjsSnapshot`
  stays null. With it on, check `yjsSnapshot` instead (see collaboration.md).
- On `localhost` instead of `127.0.0.1` the page reads "This document does
  not exist" because the session cookie is shadowed; see [stack.md](../stack.md)'s Launch.
