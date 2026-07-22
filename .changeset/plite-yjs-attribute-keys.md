---
"@platejs/yjs": major
---

Translate canonical Plite document changes and shared effects through Yjs with
app-owned `YjsProviderLike` adapters. Import remote Yjs events as incremental
canonical changes and merge set-valued text properties by value.

**Migration:** Configure `YjsPlugin` with the Yjs document and provider adapter
from application code. Raw Plite editors can install `createYjsExtension`
directly. Import React cursor and provider-state hooks from
`@platejs/yjs/react`. Serialized adapter metadata uses `plite:*` keys.

Encode exact derived or named schema identities in Yjs schema metadata format
2 and reject older room metadata envelopes.
