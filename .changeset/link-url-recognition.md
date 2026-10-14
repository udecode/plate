---
'platejs': major
---

Replace the link options `isUrl`, `getUrlHref` and `transformInput` with one `parseUrl` hook, and check every link the link feature inserts, types, pastes or imports against `allowedSchemes`. A link pasted as an exact editor fragment keeps its URL.

- `parseUrl(text, defaultParseUrl)` returns the href for typed or pasted text, or `undefined` to keep it as text. The default accepts a whole token with an explicit scheme, such as `https://example.com` or `tel:+15551234`, so typed `www.example.com`, `#top` and `/docs` stay text
- `editor.update.link.insert`, `upsert` and `wrap` return `true`, or `undefined` when `allowedSchemes` refuses the URL. `upsert` also returns `undefined` when there is no selection to link, `insert` when the node cannot be inserted, and `wrap` when nothing was wrapped. A URL without a scheme is stored as a relative link
- Keep `tel:` and relative links on HTML import
- Render a refused URL without an `href`, even when `defaultLinkAttributes` sets one
- Type the space or split the block as usual after a URL the app does not allow
- Keep typed Markdown image source, `![alt](src)`, as text
- Insert a pasted URL as text inside a link or after unfinished `[label](` source; other pastes there go through the usual paste, so a pasted `#top` or `/docs` whose clipboard HTML holds a link becomes a link
- Remove `validateUrl` and the `upsert` options `skipValidation`, `insertTextInLink`, `unwrapNodesOptions` and `wrapNodesOptions`. Over selected text, `upsert` links the selection

**Migration:** Map display text to an href with `parseUrl`:

```tsx
LinkPlugin.configure({
  initialState: {
    parseUrl: (text, defaultParseUrl) =>
      text === 'example' ? 'https://example.com' : defaultParseUrl(text),
  },
});
```

Check the result of `upsert` instead of calling `validateUrl` first:

```tsx
if (!editor.update.link.upsert({ url })) {
  // The URL is not allowed, or there is no selection.
}
```

To link another range, select it before calling `upsert`, instead of passing `wrapNodesOptions` or `unwrapNodesOptions`. A selection inside one link updates that whole link.
