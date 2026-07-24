# @platejs/yjs

Yjs collaboration bindings for Plate and Plite editors.

`@platejs/yjs` maps Plite document changes, selection state, awareness, and
provider lifecycle onto a Yjs document. Plite History owns undo and redo; its
canonical replay lowers through the same Yjs bridge as any editor change.
Provider packages stay at the application edge: wrap your Hocuspocus,
WebSocket, WebRTC, or custom provider as a `YjsProviderLike`.

## Plate

Configure `YjsPlugin` with the app-owned document and provider.

```tsx
import { YjsPlugin } from "@platejs/yjs/react";
import { createPlateEditor } from "platejs/react";

const editor = createPlateEditor({
  schema: { id: 'yjs-example', version: 1 },
  plugins: [
    YjsPlugin.configure({
      options: {
        clientId: "local-user",
        doc,
        provider,
        rootName: "room-id",
      },
    }),
  ],
  initialValue,
});
```

`BaseYjsPlugin` provides the same extension for non-React Plate editors.

## Plite

Install `createYjsExtension` directly in a Plite editor.

```tsx
import { createEditor } from "@platejs/plite";
import { createYjsExtension } from "@platejs/yjs";
import { history } from "@platejs/plite-history";

const editor = createEditor({
  extensions: [
    history(),
    createYjsExtension({
      clientId: "local-user",
      doc,
      provider,
      rootName: "@platejs/plite",
    }),
  ],
  initialValue,
});
```

Each shared root records the compiled schema identity that owns its document.
Peers must agree on the schema ID, version, and fingerprint. A nonempty Yjs
root without schema metadata and a root with mismatched schema semantics both
fail closed; the application must perform an explicit versioned document
migration before joining with the new schema.

React apps can render remote cursor decorations and provider state through the
React subpath.

```tsx
import {
  useYjsProviderStatus,
  useYjsProviderSynced,
  useYjsRemoteCursors,
} from "@platejs/yjs/react";
```

State fields with `collab: "shared"` sync automatically. Standalone shared
effect descriptors belong to an editor extension's `effects` resource. Yjs
discovers installed descriptors automatically; each shared descriptor requires
a versioned codec whose output is JSON-compatible.

```tsx
import {
  createEditor,
  defineEditorExtension,
  defineEffect,
  valueCodecs,
} from '@platejs/plite'

const incrementCounter = defineEffect<number>({
  codec: valueCodecs.number,
  collab: 'shared',
  collabReplay: 'live',
  key: 'counter.increment',
})

const counterEffects = defineEditorExtension({
  effects: [incrementCounter],
  name: 'counter-effects',
})

const editor = createEditor({
  extensions: [counterEffects, createYjsExtension({ doc })],
})
```

Every standalone shared effect declares its replay contract. Use `live` for an
event delivered once to active peers. Use `latest` only for an absolute,
idempotent restore value. Shared state-field transitions use `latest`
automatically and checkpoint the field's current absolute value. A `live`
effect must not be the sole source of durable shared state. A custom `latest`
effect must define `collabSnapshot(state)` to capture that absolute value;
compaction never treats the last event as a state snapshot.

One peer may compact a checkpoint-safe effect-log prefix.

```tsx
createYjsExtension({
  doc,
  sharedEffectCompaction: {
    authorityId: 'collaboration-service',
    threshold: 256,
  },
})
```

Configure exactly one stable authority identity for each shared Yjs root and
reuse it when that authority restarts with a new Y.Doc client generation. The
persisted authority record binds that stable identity to its active generation,
so a restart reclaims ownership and the previous generation fails closed. Each
`live` event records the peers active in its causal Yjs state; durable
acknowledgements keep unknown-codec retries eligible across reconnects without
admitting late joiners. Once every live recipient acknowledges a prefix, the
authority publishes the checkpoint, per-source watermarks, and prefix deletion
in one Yjs transaction. Late joiners restore `latest` values before the remaining
tail; expired `live` events do not replay. A checkpoint is atomic: a peer
missing any checkpoint codec keeps the checkpoint and its tail pending until
every descriptor is installed. Installing the missing descriptor retries the
pending checkpoint without waiting for more Yjs traffic.

Compaction preserves delivery rather than guessing that a silent peer is dead.
Graceful teardown publishes an inactive acknowledgement. When the host knows a
peer crashed permanently, the authority can retire that Y.Doc client
generation explicitly:

```tsx
editor.update((tx) => {
  tx.yjs.retireSharedEffectPeer(crashedYDocClientId)
})
```

The durable tombstone releases only that generation's delivery obligation. A
returning collaborator joins with a fresh Y.Doc client generation, restores
`latest` state from the checkpoint, and never receives the retired live tail.
The persisted authority identity rejects a different authority. Intentional
ownership transfer requires an explicit host-fenced document migration.

## Boundaries

- `@platejs/yjs` owns the Plite/Yjs adapter, awareness model, provider lifecycle
  bridge, and document-change lowering.
- Remote Yjs event batches compile against a cached document mirror into
  disjoint root-scoped `DocumentChange` ranges. Routine imports decode only
  the touched top-level nodes; unsupported virtual projections and root
  metadata use an explicit `full-diff-fallback` trace.
- Outbound `DocumentChange` sections lower only their affected Yjs regions.
  Compatible nodes and uniquely derived relocated subtrees keep their Yjs
  identities.
- Canonical split changes lower through bounded affected ranges; routine
  structural commits never scan the full document.
- `BaseYjsPlugin` and `YjsPlugin` install that adapter through Plate's plugin
  composition layer.
- Collaboration binds to the editor view root that installs the extension.
  Changes and selections from sibling Plite roots stay outside that Yjs
  document.
- App code owns transport packages, authentication, persistence, room naming,
  server scaling, and provider-specific options.
- Provider integrations are peer application code. The package does not depend
  on Hocuspocus, `y-websocket`, IndexedDB, WebRTC, or another transport
  package.
- Public imports are `@platejs/yjs`, `@platejs/yjs/core`, and
  `@platejs/yjs/react`.

## Related Docs

- [Plite Yjs](../../content/docs/plite/libraries/plite-yjs.mdx)
- [Canonical Change Substrate](../../content/docs/plite/walkthroughs/07-canonical-change-substrate.mdx)
- [Plite Release](../../docs/releases/plite.md)
