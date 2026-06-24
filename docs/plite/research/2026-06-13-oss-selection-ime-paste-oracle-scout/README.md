# OSS Selection IME Paste Oracle Scout

Date: 2026-06-13

Scope:
- Search and inspect editor sources for browser-oracle patterns around native
  selection, IME/composition, paste/copy, contenteditable boundaries, and
  Playwright-style editor automation.
- Promote only source-backed proof ideas that can become Plite-native tests,
  helpers, benchmark checks, or durable docs.
- Do not copy runtime code from external editors.

Sources:
- Web discovery:
  - https://discuss.prosemirror.net/t/contenteditable-on-android-is-the-absolute-worst/3810
  - https://playwright.dev/docs/input
  - https://giacomocerquone.com/notes/monaco-playwright/
- Local source reads:
  - `/Users/zbeyens/git/prosemirror/view`
  - `/Users/zbeyens/git/codemirror-view`
  - `/Users/zbeyens/git/lexical`
  - `/Users/zbeyens/git/tiptap`
  - `/Users/zbeyens/git/monaco-editor`

Outcome:
- Promote composition DOM-mutation families from CodeMirror. Its tests mutate
  live text nodes during synthetic composition and assert selection focus,
  composition decorations, replacement, Android-style newline, mark/widget
  adjacency, and rapid repeated composition cleanup. Plite already has
  composition guard smoke, but not this full mutation-family matrix.
- Promote paste-as-API helpers from ProseMirror plus DataTransfer contract
  tests from Lexical. ProseMirror exposes `pasteHTML`/`pasteText` paths that run
  editor paste logic without browser clipboard flake. Lexical tests rich paste
  with `DataTransferMock` and includes the iOS prediction edge where identical
  `text/plain` and `text/html` should behave as plain text.
- Promote selectionchange suppression as an explicit proof surface. ProseMirror
  suppresses selection updates during sensitive windows; Plite should keep
  tests that prove temporary DOM-selection manipulation for copy, projected
  selection, or hidden content does not corrupt model selection.
- Keep contenteditable=false command-boundary pressure as inspiration. Plite
  editable voids and hidden/dom-boundary routes should keep command-after-boundary
  oracles without depending on external implementation details.
- Reject Monaco smoke helpers as Plite runtime guidance. Monaco's public smoke
  tests use editor command APIs such as `trigger('type')`, which is correct for
  Monaco but not a replacement for Plite's native browser proof. Keep it only as
  a reminder that API-level smoke and native-event proof are different lanes.

Decision:
- Keep as research/proof leads. No runtime patch in this packet because current
  browser proof and `bun check` are green.

Plite-native follow-up:
- Full CodeMirror-style live-node composition mutation remains deferred until a
  concrete route fails or the real-composition-span policy is accepted. Current
  richtext IME rows define the private-alpha claim width.
- Controlled paste helper/API proof is kept through `plite-browser` clipboard
  helpers and `plite-dom` DataTransfer-style contracts.
- Selectionchange suppression and contenteditable=false-adjacent command
  boundaries are kept through focused route rows around hidden content,
  editable voids, and richtext selectionchange repair.
