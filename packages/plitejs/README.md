# plitejs

Core Plite editor runtime.

Plite owns the document model, canonical changes, paths, points, ranges, transactions, state fields, schema extensions, and pure node/location helper namespaces.

```ts
import { createEditor } from 'plitejs';

const editor = createEditor({
  initialValue: [{ type: 'paragraph', children: [{ text: '' }] }],
});
```

Use `isEditor` when library code needs to validate an unknown value before treating it as an editor.

Use `createEditorView(editor, options)` when framework packages need a root-scoped view over a committed editor. React components use `useEditor` from `plitejs/react`.

Read committed state with `editor.read(...)`. Use direct read methods for one-shot reads and the callback form when several reads must share one state view.

```ts
const value = editor.read.value();
const selection = editor.read.selection();
const atBlockStart = editor.read.selection.isAtBlockStart();

const info = editor.read((state) => ({
  text: state.text.string([]),
  value: state.value(),
}));
```

Write document, selection, mark, root, and state-field changes inside `editor.update(...)`. Use direct update methods for one-shot writes and the callback form when a command groups related writes into one commit.

```ts
editor.update.text.insert('Hello');

editor.update((tx) => {
  tx.text.insert(' ');
  tx.text.insert('world');
});
```

Use `defineEditorSchema`, `element`, `schema`, and `property` for declarative document grammar and property laws. Use `defineExtension` and `defineStateField` for state groups, transaction groups, corrections, commit listeners, and mounted runtime APIs.

Declared schemas reject unknown vocabulary by default. Set `unknown: 'preserve'` only when the application intentionally carries undeclared elements and properties; an unknown element must also be admitted by its parent's compiled content grammar.

Closed application content uses `fragment.replace`. Parsed and clipboard content uses `ContentSlice` so structural openness survives fitting.

```ts
editor.update.fragment.replace([
  { type: 'paragraph', children: [{ text: 'Hello' }] },
]);
```

Persist state fields and shared effects through versioned codecs. Primitive values use `valueCodecs`; custom values use `defineValueCodec`. Install each standalone effect descriptor once through an extension's `effects` resource.

```ts
import { defineStateField, valueCodecs } from 'plitejs';

const documentTitle = defineStateField({
  key: 'document.title',
  initial: () => 'Untitled',
  persist: valueCodecs.string,
});
```

```ts
import { defineExtension, defineEffect } from 'plitejs';

const refreshIndex = defineEffect({ key: 'search.refresh-index' });

const searchEffects = defineExtension('search-effects', {
  effectTypes: [refreshIndex],
});
```

Advanced library code can install descriptor-based read middleware and grouped transaction, commit, node, or text listeners through `on`. Diagnostic tooling can configure the debug value scrubber.

Pure data helpers live on namespaces such as `ElementApi`, `NodeApi`, `PathApi`, `PointApi`, `RangeApi`, `SpanApi`, and `TextApi`. Inside a live editor, prefer `editor.read.<group>.<method>()` for one-shot reads, grouped `state.*` reads for custom read logic, `editor.update.<group>.<method>()` for one-shot writes, and grouped `tx.*` writes for composed commands. Extension `read` factories return callable method trees built once per configuration; methods read live state when invoked.

DOM, React, history, hyperscript, layout, diff, and testing APIs live on explicit `plitejs/*` subpaths. There is no public `/internal` entrypoint.
