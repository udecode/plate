# Links

Page: https://claude.ai/artifact/MRPnTVGHE81xgsYTJYBhzU

How should link detection, editing, paste and navigation share one document contract? A link element stores one `url` that must clear the navigation floor in its schema validator, so no `javascript:`, `data:` or `blob:` destination is ever stored. The link feature checks every destination it inserts, wraps, imports or renders against `allowedSchemes`, and a stored destination the app no longer allows stays stored, renders inactive and exports as stored. One hook, `parseUrl`, decides which typed or pasted text becomes a link. The link input rules decline a refused URL, so the space, Enter or paste goes on as usual. HTML and Markdown import keep a refused link's label and report the lost destination. The package keeps no floating store, and the copied `link.tsx` owns the show, edit and submit flow (`docs/plans/2026-09-04-decouple-link-floating-ui.md`), including the rule that turns a typed draft into an address (`docs/plans/2026-10-12-link-toolbar-draft.md`).

## Public API

The copied Link kit installs the plugin with its floating toolbar and the four input rules.

```tsx
// apps/www/src/registry/components/editor/link.tsx
export const LinkKit = [
  linkPlugin.configure({
    component: LinkElement,
    inputRules: [
      LinkRules.markdown(),
      LinkRules.autolink({ variant: 'paste' }),
      LinkRules.autolink({ variant: 'space' }),
      LinkRules.autolink({ variant: 'break' }),
    ],
    slots: {
      afterEditable: LinkFloatingToolbar,
    },
  }),
] as const;
```

Apps narrow or widen the allowed schemes above the navigation floor.

```tsx
// content/docs/(plugins)/(elements)/link.mdx
LinkPlugin.configure({
  initialState: {
    allowedSchemes: ['http', 'https', 'mailto', 'tel'],
  },
});
```

One recognition hook maps typed or pasted text to an href. It gets the built-in recognizer as its second argument, so an app maps its own words and keeps the default for the rest.

```tsx
// packages/platejs/src/features/link/lib/LinkRules.spec.tsx
parseUrl: (text, defaultParseUrl) =>
  text === 'example' ? 'https://example.com' : defaultParseUrl(text),
```

An insert needs no separate check, because `upsert` refuses an address `allowedSchemes` does not allow and returns `undefined`.

```tsx
// content/docs/(plugins)/(elements)/link.mdx
editor.update.link.upsert({ url });
```

The copied floating toolbar keeps an unchanged address and sends any other draft that reads as an address to one `upsert`.

```tsx
// apps/www/src/registry/components/editor/link.tsx
const { newTab, text, url } = store.get();
const editedLink = editor.read.nodes.above({
  at: selection,
  type: linkPlugin,
});

if (editedLink && url === editedLink[0].url) {
  update.upsertText({ text: text || url, url });
} else {
  const draft = url.trim();

  if (
    !DRAFT_ADDRESS.test(draft) ||
    !update.upsert({
      target: newTab ? '_blank' : undefined,
      text,
      url: draft,
    })
  ) {
    return undefined;
  }
}
```

## What other editors do

Read from each editor's source at the commits below; none was run. Each editor that ships autolink keeps two questions apart: which text counts as a link, and which destination may be stored or rendered.

| Editor | Which text becomes a link | Which destination is allowed | Where the allow check runs |
| --- | --- | --- | --- |
| Tiptap | linkify candidates filtered by `shouldAutoLink(url)` | `isAllowedUri(url, { protocols, defaultProtocol })` | HTML parse, render, `setLink`, `toggleLink`, autolink and paste |
| Lexical | `AutoLinkPlugin` matchers return `{ text, url }` | `validateUrl` on the link plugin; `sanitizeUrl` with a fixed protocol set on render | toggle and paste commands; render; anchor import keeps the href |
| CKEditor 5 | `AutoLink`'s URL pattern, then `defaultProtocol` for a bare address | `ensureSafeUrl(href, allowedProtocols)` | output conversion |

Sources: `ueberdosis/tiptap@91c51be53c4655ef07e29ec489471524debfa0ca:packages/extension-link/src/link.ts`, `facebook/lexical@dd5c41b13193efa9ab1574234d8593d2c9e4f988:packages/lexical-link/src/LexicalLinkExtension.ts`, `facebook/lexical@dd5c41b13193efa9ab1574234d8593d2c9e4f988:packages/lexical-link/src/LexicalLinkNode.ts`, `ckeditor/ckeditor5@14e73cc31b869ce483bd8449f40b9102ac7746da:packages/ckeditor5-link/src/autolink.ts`, `ckeditor/ckeditor5@14e73cc31b869ce483bd8449f40b9102ac7746da:packages/ckeditor5-link/src/utils.ts`.

## Main changes

- `BaseLinkPlugin` owns the link schema, its HTML, Markdown and plain-text mappings, `upsert`, `upsertText`, `insert`, `wrap`, `unwrap`, `exitEnd` and the `LinkRules` input rules.
- One private admission decision, the navigation role decision with `allowedSchemes`, runs at `upsert`, `insert`, `wrap`, every input rule, HTML decode, Markdown decode, render and `api.getAttributes`. Export writes the stored URL.
- Recognition runs only in the link feature's typing and paste rules, through `parseUrl(text, defaultParseUrl)`, whose default links a whole token with an explicit scheme. A rule's `resolve` recognizes, prepares and admits read-only, and a refused write in its `apply` returns `decline()`.
- Inside a link, after unfinished Markdown link source, in a code block or over selected nodes, the paste rule inserts a recognized URL as typed and passes other pastes on.
- `decideUrl` and `isStoredUrl` in `packages/platejs/src/internal/utils/urlPolicy.ts` own the navigation floor that link shares with media's own roles.
- The copied `link.tsx` owns the floating editor's state, show, hide, edit and submit, and its draft rule.

## Open work

- `upsert`'s expanded branch throws in a code block, as it did before this work, and a range that ends inside a link unwraps the wrong half. The spec for these cases checks the return value and the commit, not the resulting document. owner: zbeyens. stop: task_52cc5e25 lands or the owner drops it.
- The DOCX exemption from the `DOMParser` lint covers more than DOCX's own parsing. owner: zbeyens. stop: task_30539621 lands or the owner drops it.
- Cmd+K on a selected word does not open the link form. owner: zbeyens. stop: task_bbdc15e4 lands or the owner drops it.
- The link form refuses a draft without a message. owner: zbeyens. stop: a report of a silent link-form refusal.
- `upsertText` is typed with `UpsertLinkOptions`, so it takes a `url` it does not read. owner: zbeyens. stop: the next link API review.
- No browser test edits only a label through the real link form. owner: zbeyens. stop: a demo page gets a link whose address would change if saved again.
