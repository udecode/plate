# Slate delta public API review

## Verdict

Keep Plite's current public API. The Slate delta contains no accepted public
call-shape change.

- PR #6083 weakens mutation intent by making `null` mean property deletion in
  `setNodes`. Plite keeps `nodes.set` and `nodes.unset` separate.
- PR #6091 documents ad hoc editor augmentation. Plite keeps typed,
  descriptor-owned commands and one transaction dispatch path.
- PR #6003 is not reviewable as one API proposal. Its 167-file open diff must
  be split into exact public type questions before another Best API pass.

## Property removal, PR #6083

### Ideal call sites

The normal path says whether the caller is setting or removing a property:

```ts
import { createEditor } from '@platejs/plite';

const editor = createEditor();

editor.update((tx) => {
  tx.nodes.set({ target: '_blank' }, { at: [0] });
  tx.nodes.unset('target', { at: [0] });
});
```

The direct one-shot path uses the same verbs:

```ts
editor.update.nodes.set({ target: '_blank' }, { at: [0] });
editor.update.nodes.unset('target', { at: [0] });
```

There is no advanced null sentinel. Schema-owned code may pass an exact
`SchemaPropertyHandle` to `nodes.unset`.

### Current evidence

- Public contract: `packages/plite/src/interfaces/editor.ts:746-821` exposes
  typed `set` and `unset` methods.
- Transaction owner: `packages/plite/src/core/public-state.ts:3524-3547`
  resolves the target and schema handle before lowering the write.
- Internal representation: `packages/plite/src/transforms-node/unset-nodes.ts:4-17`
  may use `null` as a private lowering sentinel. The sentinel never becomes the
  caller's property value.
- Production consumer: `packages/link/src/lib/BaseLinkPlugin.ts:461-467` sets a
  link target when present and explicitly unsets it when absent.
- Reference pressure: `../slate-audit/packages/slate/src/interfaces/transforms/node.ts:86-99`
  accepts nullable properties for `setNodes` while retaining
  `unsetNodes` at lines 119-130.

### Why this model wins

Set and remove are different document mutations. Separate verbs preserve the
property value domain, inference, autocomplete, schema-handle routing, and
caller intent. Allowing both `set({ key: null })` and `unset('key')` creates two
common paths while teaching every property type about a mutation sentinel.

Rejected:

- nullable `nodes.set` values;
- keeping both deletion spellings for compatibility;
- a second property-mutation namespace;
- exposing the private lowering sentinel.

### Ownership, adoption, and proof

- Owner: Plite transaction node API and node-transform lowering.
- Runtime laws: one synchronous transaction, typed targets, schema-handle
  resolution, canonical operation output, and no persisted null sentinel.
- Adoption impact: none. Current callers stay on `set`/`unset`.
- Deletion impact: none in local code; reject the donor type widening.
- Verification: source and production-consumer audit plus focused runtime
  target tests.
- Next owner: none. This is a terminal `reject-reference / keep-local`
  decision, not a `plite-plan` packet.

## Semantic commands, PR #6091

### Ideal call sites

Define one typed command and dispatch it through the update boundary:

```ts
import { createEditor, defineCommand } from '@platejs/plite';

const insertLabel = defineCommand<{ text: string }>('label.insert', {
  build: ({ input, state }) =>
    state.transaction((tx) => tx.text.insert(input.text)),
});

const editor = createEditor();

editor.update.command(insertLabel, { text: 'Draft' });
editor.update((tx) => tx.command(insertLabel, { text: ' reviewed' }));
```

A reusable customization remains extension-owned:

```ts
import { defineExtension } from '@platejs/plite';

const labelCommands = defineExtension('label.commands', {
  commands: ({ around }) => [
    around(insertLabel, ({ input, next }) =>
      next({ text: input.text.trim() })
    ),
  ],
});
```

### Current evidence

- Public imports: `packages/plite/src/index.ts:1-6` exports `defineExtension`
  and `defineCommand`; lines 81-84 export `createEditor`.
- Descriptor owner: `packages/plite/src/core/command-definition.ts:73-108`
  owns typed identity, input preparation, and pure transaction-spec building.
- Normal dispatch: `packages/plite/test/command-spec.test.ts:65-127` proves the
  exact call above and one committed change.
- Customization: `packages/plite/test/command-spec.test.ts:153-181` proves
  ordered handler chains and explicit input rewrites.
- Transaction composition: `packages/plite/test/command-spec.test.ts:445-463`
  proves multiple command calls stay inside one update and one command tag.
- Reference pressure: PR #6091 is an open docs-only proposal with no Slate
  runtime or test change, recorded in the issue ledger.

### Why this model wins

The command descriptor is the honest owner for identity and input inference.
The update boundary owns dispatch, rollback, history tags, recursion guards,
decline semantics, and transaction composition. Editor augmentation would make
the same behavior depend on app-local method names and untyped installation.

Rejected:

- ad hoc methods assigned to an editor object;
- a second custom-command helper grammar;
- root-merged command methods;
- nested one-shot updates from active command handlers.

### Ownership, adoption, and proof

- Owner: Plite command descriptor, extension command registrations, and update
  transaction.
- Runtime laws: typed input, frozen descriptors, deterministic handler order,
  recursion failure, decline without publication, and one atomic commit.
- Adoption impact: none.
- Deletion impact: none locally; do not copy the donor walkthrough shape.
- Verification: the 44-test semantic command suite passed in the source audit.
- Next owner: none. Keep `PLITE-COMMAND-001`; no layer plan.

## Broad type surface, PR #6003

PR #6003 mixes type tests and unrelated corrections across 167 files. It has no
single normal call site, owner, invariant, deletion consequence, or adoption
boundary. Treating it as one API packet would be fake precision.

Terminal route: `defer`. A future harvest must split it into decision-atomic
rows. Invoke `best-api review` only for a row that names one public import,
current and proposed calls, exact types/owner, affected consumers, and negative
inference proof.

## Best API closure

| Thread | Verdict | Public change | Next owner |
| --- | --- | --- | --- |
| #6083 | Reject nullable set values; keep explicit unset | none | none |
| #6091 | Reject editor augmentation; keep semantic commands | none | none |
| #6003 | Defer until split into atomic API questions | none | `best-api` only after split |

No reusable API doctrine changed, so `best-api repair` is not triggered.
