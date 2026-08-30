---
'platejs': major
---

Export `BaseYjsPlugin` and `YjsPluginState` from `platejs/yjs`, and export `YjsPlugin` from `platejs/yjs/react`.

Translate canonical Plite document changes and shared effects through Yjs with app-owned `YjsProviderLike` adapters. Import remote Yjs events as incremental canonical changes and merge set-valued text properties by value.

Transport registered shared effects exactly once through versioned records, retry unknown effect codecs after registration, compact acknowledged events safely, and preserve fitted slice changes through reconnect and concurrent edits.

**Migration:** Import `BaseYjsPlugin` from `platejs/yjs` or `YjsPlugin` from `platejs/yjs/react`, then configure it with the Yjs document and provider adapter from application code. Raw Plite editors import `yjs` from `platejs/yjs` and install `yjs(options)` through `editor.install(...)`. Import React cursor and provider-state hooks from `platejs/yjs/react`. Serialized adapter metadata uses `plite:*` keys.

Encode exact derived or named schema identities in Yjs schema metadata format 2, require every claimed room to carry that identity, and reject older room metadata envelopes.

Synchronize primary children and named roots as one document, preserve root-qualified awareness selections, and group multi-root commits into one Yjs transaction. Preserve shared character identity across compatible text replacements so remote positions survive canonical history replay.

Declare collaborative cursor metadata with `yjs({ cursorData: { validate } })`. Infer cursor state and React hook results from that installed descriptor, omit invalid remote metadata, and reject invalid local metadata before publishing it. React cursor overlay hooks preserve exact raw-editor extension-tuple inference and infer layered editors from their state-view provider without rebuilding a raw React editor.
