---
'platejs': major
---

Expose the native Yjs contracts from `platejs/yjs` and the parameterized `YjsPlugin` factory from `platejs/yjs/react`.

Translate canonical Plite document changes and shared effects through Yjs with app-owned `YjsProviderLike` adapters. Import remote Yjs events as incremental canonical changes and merge set-valued text properties by value.

Transport registered shared effects exactly once through versioned records, retry unknown effect codecs after registration, compact acknowledged events safely, and preserve fitted slice changes through reconnect and concurrent edits.

**Migration:** Import `YjsPlugin` from `platejs/yjs/react`, create a complete descriptor with `YjsPlugin.create(options)`, and install that descriptor. Raw Plite editors import `yjs` from `plitejs/yjs` and install `yjs(options)` through `editor.install(...)`. Import raw React cursor and provider-state hooks from `plitejs/yjs/react`; Plate consumers use `platejs/yjs/react`. The default root is `document`, and serialized adapter metadata uses the reserved `yjs:*` keys, so an application field may not start with `yjs:`.

Encode exact derived or named schema identities in Yjs schema metadata format 3, require every claimed room to carry that identity, and reject room metadata envelopes in any other format.

Synchronize primary children and named roots as one document, preserve root-qualified awareness selections, and group multi-root commits into one Yjs transaction. Preserve shared character identity across compatible text replacements so remote positions survive canonical history replay.

Declare collaborative cursor metadata with `yjs({ cursorData: { validate } })`. Infer cursor state and React hook results from that installed descriptor, omit invalid remote metadata, and reject invalid local metadata before publishing it. React cursor overlay hooks preserve exact raw-editor plugin-tuple inference and infer layered editors from their state-view provider without rebuilding a raw React editor.
