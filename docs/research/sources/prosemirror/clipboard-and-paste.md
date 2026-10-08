# ProseMirror: clipboard and paste

## Paste during composition and slice metadata

- ProseMirror skips its JavaScript paste handling while a composition is active, except on Android, and otherwise parses the clipboard and dispatches a paste transaction (`src/input.ts:590-667`). Rich paste carries explicit slice metadata: the `data-pm-slice` attribute with open depths and context, WebKit space restoration, and a wrapper map for content such as table rows (`src/clipboard.ts:1-260`). Source: `c70bacbd4a:docs/plite/research/2026-06-12-oss-clipboard-paste-architecture/README.md:18-21`, `read-log.tsv:2-3`. Limit: unpinned local `prosemirror-view` checkout read on 2026-06-12.

## Clipboard hooks

- prosemirror-view's clipboard hooks: `transformCopied` and `clipboardSerializer` shape a copy, `transformPastedText` and `transformPastedHTML` rewrite pasted text and HTML before parsing, and `transformPasted` rewrites the parsed slice (`ProseMirror/prosemirror-view@ca4c78e9:src/clipboard.ts:6`, `:17`, `:49`, `:68`, `:52`, `:108`). On paste, the `data-pm-slice` attribute a copy wrote (`:34`) rebuilds the slice's open depths and context (`:73-74`), so the metadata steers parsing and never appears as content, and `normalizeSiblings` fits parsed nodes to the paste position (`:122`). Source: `c70bacbd4a:docs/plite/research/2026-06-13-oss-rich-html-paste-clipboard-invariants/read-log.tsv:5`.

## ProseMirror test families

- **PM-11 clipboard.** The harvest reads `view/test/webtest-clipboard.ts` and `model/test/test-dom.ts` as checking that clipboard HTML and text carry slice context, wrappers, attributes, comments, custom serializers and safe fallbacks (the clipboard test list is under 'View test corpus' on `docs/research/sources/prosemirror/testing-and-proof.md`). Plite counterparts: `packages/plitejs/test/dom/clipboard-boundary.test.ts`, `packages/plitejs/test/clipboard-contract.ts` and `apps/plite/tests/plite-browser/donor/examples/paste-html.test.ts`. Source: `docs/editor-test-harvester/prosemirror/report.md:150`.

## Paste entry points

- ProseMirror's `EditorView` exposes `pasteHTML(html, event?)` and `pasteText(text, event?)`, which run the editor's own paste handling on a given payload without the browser clipboard, so paste logic can be tested without clipboard permissions or flake. Evidence: `ProseMirror/prosemirror-view@c752c6ef7225199f73cb433dd3179e7d69b840d8:src/index.ts:439-446`, checked 2026-10-08.

## Custom views

- A canvas-based editor built on ProseMirror's state and plugin system still reuses ProseMirror's schema-based HTML parsing and serialization at the model boundary for copy and paste instead of inventing a separate clipboard model (https://discuss.prosemirror.net/t/building-a-canvas-based-editor-on-top-of-prosemirror-s-state-and-plugin-system/8982, 2026-03, read 2026-06-13).
