---
"@platejs/yjs": major
---

Rebuild Yjs collaboration on Plite operations with app-owned
`YjsProviderLike` adapters.

**Migration:** Configure `YjsPlugin` with the Yjs document and provider adapter
from application code. Raw Plite editors can install `createYjsExtension`
directly. Import React cursor and provider-state hooks from
`@platejs/yjs/react`. Serialized adapter metadata uses `plite:*` keys.
