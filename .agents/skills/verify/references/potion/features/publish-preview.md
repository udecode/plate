# Publish and preview

A page's owner publishes it from the navbar share control
(`src/components/navbar/document-share.tsx`); anyone can then read it at
`/preview/<documentId>` without signing in.

## Sub-features

- Publish and unpublish (`Document.isPublished`).
- Public read-only preview.
- Anonymous read-only collaboration socket on a published page.

## How to get to it (user POV)

Open a page, use the share control in the navbar, copy the preview link.

## Driving it with the built-in browser

1. Sign in, open `/<id>`, open the share control, publish.
2. Proof: `select "isPublished" from "Document" where id = '<id>'` is true,
   and `/preview/<id>` renders the page in a tab without the session cookie
   (clear it, or use a second sign-in-free tab on `127.0.0.1`).
3. Unpublish and check `/preview/<id>` no longer shows it.

## Gotchas

- Not yet driven by this recipe; the first run fills in the share control's
  selectors.
