---
review_scopes:
  - model
review_basis:
  - 2026-10-04-model-document-admission
work_kind: implementation
---

# Admit document fields by input kind

Status: Done: Phase 1 and Phase 2 built, uncommitted for the owner.
Playbook: plan

The owner said "go model", then cut the pause between a verdict and its plan: "we would pursue after the plan, not before". Review 2026-10-03-model-document-admission-3 recorded Pursue, because nothing decides unknown top-level document keys. Architect's arena, with Opus, gpt-6-astra and gpt-6.1-sol as runners and an Opus cross-judge, picked closed document admission in Plite and a typed `legacy` channel that carries historical top-level fields through Plate migrations. Two plan panel rounds then cut the arena's admission table down to typed field lists and Plite's existing JSON record reader, and closed the document-bound view cache. Every loading path refuses an unknown top-level key on the caller's raw object. `selection` stays legal on a snapshot. A migration step can still lift a legacy field into `meta`, and completion refuses one that no step lifted.

## Public API

Each before fence is a call at plate-2 `fe0e9599a6`, from the review's probes and its contract test. Each after fence is the same call under this plan.

`assertDocument` narrows to a document, so it refuses a key a document lacks.

```ts before
// docs/research/probes/2026-10-03-model-document-boundary/unknown-keys.ts
editor.read.schema.assertDocument({ children, extra: 1 }); // accepts
```

```ts after
editor.read.schema.assertDocument({ children, extra: 1 }); // throws invalid-document: Editor document field "extra" is not supported. Store application data in meta.
```

Direct replacement takes a snapshot, which admits `selection` and nothing else beyond a document's fields.

```ts before
// packages/plitejs/test/schema-identity-contract.test.ts
editor.update.value.replace({ children, document: { application: true } }); // accepts, drops document
```

```ts after
editor.update.value.replace({ children, document: { application: true } }); // throws inside the replace; the value is unchanged
```

Plate construction reads its raw value as a document, so a selection goes in the `selection` option.

```ts before
// docs/research/probes/2026-10-03-model-document-boundary/snapshot-and-plate.ts
createEditor({ initialValue: { children, selection } }); // accepts, selection becomes null
```

```ts after
createEditor({ initialValue: { children }, selection });
```

A schema migration callback returns structure, checked before the editor rebuilds it.

```ts before
// docs/research/probes/2026-10-03-model-document-boundary/snapshot-and-plate.ts
editor.update.plugins.reconfigure(slot, next, { migrate: ({ document }) => ({ ...document, extra: 1 }) }); // accepts, drops extra
```

```ts after
editor.update.plugins.reconfigure(slot, next, { migrate: ({ document }) => ({ ...document, extra: 1 }) }); // throws; publication rolls back
```

A migration step reads a legacy top-level field from `legacy` and passes on the rest; its document types admit only document fields.

```ts before
// docs/research/probes/2026-10-03-model-document-boundary/snapshot-and-plate.ts
2: ({ document }) => {
  const { title, ...rest } = document as typeof document & { title?: string };
  return { document: title === undefined ? rest : { ...rest, meta: { ...rest.meta, title } } };
},
```

```ts after
2: ({ document, legacy: { title, ...legacy } }) => ({
  document: title === undefined ? document : { ...document, meta: { ...document.meta, title } },
  legacy,
}),
```

Completion refuses a historical field that no step lifted, where it strips the field today.

```ts before
// docs/research/probes/2026-10-03-model-document-boundary/snapshot-and-plate.ts
migrateDocument({ children, stray: 1 }, { migrations, source: 1 }); // strips stray
```

```ts after
migrateDocument({ children, stray: 1 }, { migrations, source: 1 }); // throws at completion: Migrated document field "stray" was not lifted by any migration step.
```

## What other editors do

Read from source at prosemirror-model `6264de0` and prosemirror-state `ffad5d9`, Lexical `dd5c41b13`, Slate `945a484df`, the slate-v2 fork `f0e5ad1ae` and Tiptap `91c51be53`; Lexical and slate-v2 were also probed on source, while ProseMirror, Slate and Tiptap were read but not run. None of them refuses an unknown top-level key. ProseMirror, Lexical, slate-v2 and Tiptap drop it silently, Slate has no top-level document object, and Lexical keeps unknown keys only in its `$` node-state bag. None routes every load path through one reader.

| Editor | Load call | Validates the document | Unknown top-level or node keys | One reader for every path | Selection and version |
| --- | --- | --- | --- | --- | --- |
| ProseMirror | `Node.fromJSON`, `EditorState.fromJSON` | Throws on unknown types, required attrs and bad text; content rules only through opt-in `check()` | Dropped; state JSON reads only `doc`, `selection` and named plugin fields | One JSON reader, no single validator | Selection beside the doc in the state envelope; no version |
| Lexical | `editor.parseEditorState`, node `importJSON` | Unknown types hit an invariant, reported through `onError` with a partial state | Top level reads only `root`; undeclared node fields dropped; the `$` state bag keeps unknown keys on purpose | One JSON reader; Yjs bypasses it | Selection never serialized; per-node `version` never read |
| Slate | `editor.children = value` | Shallow node-list check in `<Slate>` only | Kept as node properties; the value is the children array, so there is no top-level key | No reader | Selection on the editor object; no envelope or version |
| slate-v2 fork | `createEditor({ initialValue })`, `tx.value.replace` | Shape checks at construction only; replace has none | Unknown top-level keys dropped on both paths; node fields and `state` keys kept | No; construction and replace diverge | `initialSelection` beside the document; no schema version |
| Tiptap | `new Editor({ content })`, `setContent` | Default turns a bad document into an empty one; `enableContentCheck` adds `check()` | Same as ProseMirror: dropped | One helper, a different policy per caller | Selection from `autofocus`; no version |

Plite refuses where these editors drop, because it has a slot for application data (`meta`) and a migration chain to lift legacy fields, and its persisted envelope already refuses unknown keys. Silent loss is the failure the comparison shows most often, as in Tiptap's empty document. The cost is forward compatibility. Once raw readers refuse unknown keys, a new top-level document field breaks every older reader of raw documents, so Plite adds one only with a doctrine change and a migration.

## Document shape

Every load path reads the stored document. An application that saved a field at the top level moves it into `meta`, through `migrateDocument` or before it calls the editor.

```json before
{ "children": [{ "type": "paragraph", "children": [{ "text": "Hello" }] }], "title": "Draft" }
```

```json after
{ "children": [{ "type": "paragraph", "children": [{ "text": "Hello" }] }], "meta": { "title": "Draft" } }
```

## Layer and owner

| Change | Layer | Package | Why |
| --- | --- | --- | --- |
| Field-list constants, `readDocumentRecord`, open `assertEditorDocumentContainers`, closed `assertEditorDocumentShape`, `isEnvelopeInput`, `readPersistedSchemaIdentity` | Plite | `plitejs` root (`core/document-shape.ts`, on `core/value-codec.ts`'s `getEditorJsonRecordEntries`), exported to Plate through `plitejs/internal` | Top-level admission is neutral model law |
| Construction, snapshot replace, envelope load, document-bound views, the root-bound view and reconfigure read the caller's raw object | Plite | `plitejs` root (`core/initial-value.ts`, `core/public-state.ts`, `core/editor-schema.ts`, `core/slice-fit/compiled-slice-fitter.ts`, `editor-runtime-view.ts`, `core/plugin.ts`) | These are the paths that rebuild or cache the object before any check |
| Plate construction reads its raw `initialValue` through Plite before adding `selection` | Plate | `platejs` root (`lib/editor/withPlite.ts`) | Plate keeps its selection precedence and nonempty-root policy |
| Migration `legacy` channel, closed step document types, source-intent routing and completion refusal; Plate's copied checks deleted | Plate | `platejs/migrations` (`documentMigrations.ts`) | Migration lineage and steps are Plate's; container and record law is Plite's |
| `plate migrate run` passes `source` whenever `--from` is set | Plate | `@platejs/cli` (`src/run-migration.ts`) | The CLI must route the way `migrateDocument` does |

`plitejs/internal` is a headless entry over the root in `tooling/entrypoints/entrypoint-dag.mjs`, already imported by eight platejs files and `packages/platejs/src/facade.ts`, so the graph does not change.

## Hard cuts and app migration

No public export is removed and no public type changes shape. These calls start throwing where they accepted or silently dropped a field:

- A top-level field other than `children`, `meta` and `roots` passed to `assertDocument`, any `fitDocument` variant, Plite or Plate `createEditor`, `useCreateEditor`, `createStaticEditor`, `createEditorView(editor, { document })`, `<EditorStatic document>` and `PlateView` (they throw during render), plain-text serialization, `renderStaticHtml({ document })` and DOCX export of a document, `Editor.reset`, `parseAuthoredDocument`, detached Markdown or HTML serialization of a document and `compare`.
- Any field other than those and `selection` passed to `value.replace` or `tx.value.replace`, including `marks`, which `SnapshotInput` never declared, or returned by a complete-editor snapshot transform. A snapshot that is a class instance, has an accessor `children` or a non-enumerable extra key is refused too. A root-bound view's `value.replace` admits only `children` and `selection`.
- A field other than `children` and `roots` returned by a `plugins.reconfigure` or `install` `migrate` callback.
- A raw `selection` inside `initialValue`.
- A migration step typed or written to read a legacy field from its document, with or without a cast, a step that returns a document still carrying one, and a historical document whose legacy field no step lifts. A generic helper written as `<D extends EditorDocumentValue>() => DocumentMigration<D>` no longer compiles. `PlateV54Migration`'s context gains `legacy`.
- `plate migrate run --from <version>` reads every file as raw historical input and refuses an envelope in that run; run envelopes without `--from`.
- A document-bound view of a mutable caller document is validated on every `createEditorView` call instead of once.

An own key holding `undefined` counts as absent for an optional field at every Plite ingress and Plate construction, so today's `{ children, meta: undefined }` stays accepted there and `assertDocument` and `fitDocument` start accepting it. `migrateDocument` keeps refusing it, because it snapshots its input as JSON first. The build widened this: any field holding `undefined` counts as absent, because it carries no data (see Close).

Unchanged:

- `History.fromJSON` keeps its own wire decoder, which rebuilds the history record; its document assertions run on editor documents, not the caller's history object.
- `projectAuthoredDocument` and `projectAuthoredReview` keep treating their input as trusted typed documents.
- `DocumentChange.apply` keeps operating on a JSON value and keeps its extra top-level keys.

In this repository, a census run put markers in the shape owner, the snapshot reader, the root view, the document-bound view, reconfigure and Plate construction, over every Plite partition and Plate's turbo runner. Only the shape and snapshot markers fired, in three tests: the `cyclic.self` fixture in `packages/plitejs/test/create-editor-value-contract.ts`, the `marks: null` replace in `packages/plitejs/test/snapshot-contract.ts`, and the contract test "does not confuse direct snapshots with application document metadata". The expected message in `documentMigrations.spec.ts` "rejects invalid boundaries" also changes, and the type tests change for `legacy`. The census did not run Plate's `.slow` files, apps, the registry or `@platejs/test`, and its marker patch was not saved; Phase 1's exit runs all of them.

Application code changes like this:

```ts
// before: an application field at the top level
createEditor({ initialValue: { children, title } });
// after: application data lives in meta
createEditor({ initialValue: { children, meta: { title } } });

// before: a selection inside the value
createEditor({ initialValue: { children, selection } });
// after: the selection option
createEditor({ initialValue: { children }, selection });
```

A saved document with legacy top-level fields gets a migration step that lifts them from `legacy`, as in Public API above.

## Main changes

- `core/document-shape.ts` holds one field-list constant per input kind: document, snapshot, root snapshot, structure and envelope. A two-way key-equality assertion checks each against `keyof EditorDocumentValue`, `SnapshotInput`'s direct member or `PersistedDocumentInput`, so a new document field fails to compile until admission agrees; no public type changes shape.
- One reader, `readDocumentRecord(value, fields, required, reject)`, is built on `core/value-codec.ts`'s `getEditorJsonRecordEntries`. It reads a plain JSON record once, drops an optional field holding `undefined`, and reports `{ kind: 'field', field }` through the existing `EditorDocumentShapeIssue` reject callback that every ingress already maps. `assertEditorDocumentShape` is that reader plus `assertEditorDocumentContainers`, today's open container check. `assertDocument` and `fitDocument` run it before strict JSON validation, so a refusal is `invalid-document` and a class-instance or accessor document keeps its JSON wording. `readExactDataRecord` is deleted, leaving one prototype rule for document records; `isReadMethodRecord` stays, because read-group method trees still use it. The build changed the reader's signature and composition; see Close.
- An own `document` field routes an input to the envelope reader in Plite load and Plate construction. Plate migrations route by source intent: `MigrationOptions` gains a branch where an explicit `source` accepts raw historical input even when it is envelope-shaped, and the reader treats it as raw. An older envelope's inner document is split the same way as raw input, and a step result that omits `legacy` passes it on unchanged.
- A document-bound view reuses its cached schema validation only for a frozen document Plite owns, the rule `value-codec.ts`'s `rememberFrozenJsonValue` already encodes and the documents `editor.read.value()` returns. A mutable caller document gets full validation on every `createEditorView` call. This fixes a shipped defect. Today a document validated once is accepted by every later view after any mutation, whether `children` becomes `7`, a child's type changes or `meta` gains a function.
- `initial-value.ts` loses the loop that JSON-checked and dropped unknown keys, `public-state.ts` loses `isPersistedDocumentEnvelope` and its identity key lists, the root view and `plugin.ts` lose their own `meta` checks, and Plate loses `assertOwnedDocument`, `ownDocument`, `assertExactKeys`, its construction envelope sniff and the CLI's per-file envelope check.
- Migration step documents are closed in their types and at runtime. `DocumentMigration`'s `FromDocument` and `ToDocument` map every key outside `children`, `meta` and `roots` to the message type `Read top-level field "${K}" from legacy`, so an extra key fails to compile with that message while narrowing inside the three fields still works. Legacy top-level fields travel in `legacy`, a `Record<string, EditorJsonValue>`. The v54 suggestions step and any step that calls `target.schema.fitDocument` never see a field their type denies, and `migratePlateV54.ts` does not change.

## Three realistic failures

- An application loads saved documents with top-level fields and they stop loading. The error names the field and points to `meta`; the changeset and the document-model guide show the migration step; rollback is reverting Phase 1.
- A producer this repository's suites do not exercise, in an app or the registry at runtime, hands an editor a document with an extra key. `pnpm --filter www typecheck` checks the registry source, but only running the app finds a runtime producer; the error names the field.
- A static page re-renders a view of a large mutable caller document and pays full validation each render. The scale gate measures it; the fix for the caller is passing an owned document such as `editor.read.value()`.

## Defaults

| Decision | Pick | Alternative | Word |
| --- | --- | --- | --- |
| Unknown top-level document keys | Refuse at every load path | Drop them silently, as ProseMirror, Lexical, slate-v2 and Tiptap do | drop keys |
| How migrations carry legacy fields | A typed `legacy` channel beside a closed document | Open documents through every step, with the v54 step fitting closed projections (the gpt-6-astra design) | open migrations |
| Admission shape | Field-list constants and `readDocumentRecord` on `getEditorJsonRecordEntries`, composed by each ingress | The arena's `INPUT_RULES` table with one generic reader | admission table |
| Migration input routing | By source intent, with an explicit-source branch in `MigrationOptions` | An own `document` field means an envelope everywhere | document routing |
| A step result without `legacy` | Passes `legacy` on unchanged | Empties it | empty legacy |
| An own key holding `undefined` | Absent for an optional field at Plite ingress and Plate construction (built: absent for any field; see Close) | Refused like any other key | strict undefined |
| A raw historical `selection` | Refused at completion like any field no step lifts | Read as the envelope selection | raw selection |
| Document-bound view cache | Reused only for frozen Plite-owned documents; caller documents revalidated each call | Deep-freeze the caller's document on first admission and cache it | freeze view documents |
| `plate migrate run --from` | Passes `source` to every file and refuses envelopes in that run | Keeps per-file envelope detection, so the CLI cannot lift a legacy `document` key | per-file envelopes |
| `setEditorSnapshotInputTransform` | Unchanged: `@internal`, still exported, its output admitted like any snapshot (built: the caller's raw input is admitted before it runs, too; see Close) | Taken off the public root in this plan | drop transform |
| Phase exits while `pnpm check` fails on other sessions' work | Keep both phases; the decision log attributes each failing step | Revert the phases until `pnpm check` passes on this tree | revert build |

## Decision ledger

| Surface | Current | Target | Owner | Reason | Adoption | Proof | Risk | Verdict |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| Top-level field admission | Each path decides; most rebuild and drop | Typed field lists read on the raw object at each ingress | Plite `core/document-shape.ts` | No ingress may drop or accept a field others refuse | Plite ingresses, Plate construction, migrations | Phase 1 tests and probes | Saved documents outside the repository with top-level fields | rearchitect |
| Record and envelope readers | Two Plite readers and a Plate copy | One `readDocumentRecord` on `getEditorJsonRecordEntries`, shared through `plitejs/internal` | Plite | One prototype rule; Plite wins over a Plate duplicate | Plate construction and migrations | Migration envelope tests | Changed error wording | merge |
| Historical migration fields | Open keys inside objects typed as documents | Typed `legacy` channel; closed step document types; source-intent routing | Plate `platejs/migrations` and `@platejs/cli` | A step calling a closed primitive cannot trip on a legacy key | Docs, best-api rule, application migrations | Lift, completion, envelope and type tests; CLI run; v54 differential | Public step contract change | rearchitect |
| Document-bound view cache | Skips every check for a seen object | Cached validation only for frozen owned documents | Plite `editor-runtime-view.ts` | Any mutation of a caller object bypasses validation today | `<EditorStatic document>`, `PlateView` | View regression tests and the view scale cohort | Re-render cost for mutable caller documents | rearchitect |
| Root view and reconfigure checks | Own `meta` checks after a rebuild | Root-snapshot and structure field lists on the raw object | Plite | Refusal before the rebuild | None outside Plite | Root view and reconfigure tests | None found | merge |
| Construction unknown-key loop | JSON-checks and drops unknown keys | Deleted; the field list refuses | Plite | Silent loss | None | Malformed-container test rows | None found | cut |

The view cache row was `gate` until Phase 1's view cohort passed the scale gate; `docs/research/probes/2026-10-03-model-document-boundary/admission-build-receipt.txt` holds that receipt.

## Execution

Authority: the owner answered Build now on 2026-10-04 to the plan's build question. The packet is Phase 1 then Phase 2 of Steps, run by the lead in this checkout on `next` from base `fe0e9599a6`, with commits left to the owner.

## Completion Gates

| Gate | Applies | Evidence |
| --- | --- | --- |
| `pstack:blast-radius` on the public change before code moves | yes | done: census v2 proves no package producer passes an extra key; `isReadMethodRecord` stays for read groups (public-state.ts:3530); the registry's discussion view passes `authored`, not `document`; static views revalidate caller documents, which the view cohort gates; logged in the decision log |
| `pstack:thermo-nuclear-code-quality-review` on each slice touching shared Plite code | yes | done: one review over the whole Phase 1 diff after the slices; its findings and dispositions are decision-log rows under phase `build` |
| Hard-cut sweep of callers, exports, tests, docs and examples, and `best-api repair` | yes | done: `git grep` finds no caller of the deleted helpers outside plans and research; the registry migration demo and perf workloads already pass envelopes without `source` and raw input with it; doctrine repaired through v258 |
| `plate-docs` on every docs page Phase 2 names | yes | done: `pnpm --filter www check:docs` exit 0; the decision log lists each page |
| Scale contract rerun on the final production path | yes | done: `docs/research/probes/2026-10-03-model-document-boundary/admission-build-receipt.txt` |
| Changesets for `plitejs`, `platejs` and `@platejs/cli` | yes | done: `.changeset/plite-document-admission.md`, `.changeset/plate-document-admission.md` and the amended `.changeset/persistence-detached-conversion.md` |
| Writing passes: `deslop` and `no-comments` on code, `unslop` on docs and this plan | yes | done: `pstack:deslop`, `pstack:no-comments` and two `pstack:unslop` passes, each a decision-log row |
| Panel on the diff | yes | done: two rounds under the `api-build` review rule (the planned skip was wrong), decision-log rows under phase `panel`; round 2's additive warnings are deferred in `docs/plans/topics/model.md` Open work |
| Decision-trail review | yes | done: two gpt-6.1-sol passes through `cross.mjs`; answers in the session scratch, dispositions as decision-log rows under phases `trail`, `build` and `panel` |
| Execution record and decision page reconcile | yes | done: `docs/research/review-records/2026-10-04-model-document-admission-execution.json` and the decision page's `reconciled_executions` |
| `pnpm lint:fix` on the task's files | yes | done: `pnpm exec ultracite fix` then `check` on this run's files, exit 0 |

## Steps

Phase 1, admission in Plite, Plate construction and the migration channel, as one adoption unit because closing `fitDocument` breaks open migration documents until the channel lands. Exit: keep when `pnpm --filter plitejs test`, `pnpm --filter platejs test`, `pnpm check` (which runs Plate's `.slow` lane), `pnpm --filter www typecheck`, both probes, the CLI run, the v54 differential and the scale gate pass; revert the whole phase otherwise.

- [x] Record a superseding `best-api-review` verdict for `model` that adopts this plan's target, before the first code change. Proof: the new record under `docs/research/review-records/` and the decision page's `current_review`. Done: `docs/research/review-records/2026-10-04-model-document-admission.json`; the decision page's `current_review` names it.
- [x] Plite owner: the field-list constants with their key-equality assertions, `readDocumentRecord`, the open and closed container checks, `isEnvelopeInput` and `readPersistedSchemaIdentity` in `packages/plitejs/src/core/document-shape.ts`; delete `readExactDataRecord`. Proof: `pnpm --filter plitejs typecheck`. Done: `packages/plitejs/src/core/document-shape.ts`; one `fields` record maps each key to `required` (deviation row in the decision log); `pnpm --filter plitejs typecheck` exit 0.
- [x] Plite ingresses: `core/initial-value.ts`, `core/public-state.ts`, `core/editor-schema.ts` and `core/slice-fit/compiled-slice-fitter.ts` (the reader before strict JSON validation), `editor-runtime-view.ts` (the owned-document cache rule and the root-bound view before its rebuild) and `core/plugin.ts`; export the readers through `src/internal/index.ts` and run `pnpm brl`. Proof: both probes under `docs/research/probes/2026-10-03-model-document-boundary/` rerun and show each refusal. Done: the unknown-keys probe refuses `extra` at all five ingresses in raw and closed editors and loads both controls (scratch `build-unknown-keys.txt`); the internal entry is hand-written, so `pnpm brl` has nothing to generate (`plitejs` `brl` script).
- [x] Plite tests, one per failure mode, each seen failing first: replace the contract test "does not confuse direct snapshots with application document metadata" with selection accepted and a `document` key refused; give the `cyclic.self` fixture a child and keep it a cycle in the container; drop `marks: null` from `snapshot-contract.ts`; add unknown JSON and non-JSON field rows to "rejects malformed document containers at every document ingress"; `assertDocument` and `fitDocument` accept `{ children, meta: undefined }`; a root-view replace with an extra field throws before any transform runs; a reconfigure `migrate` that returns content valid under the target schema plus `extra` throws and rolls back, while the same result without `extra` publishes; after a document's first `createEditorView`, mutating `children` to `7`, a child's type to an uninstalled one, or `meta` to hold a function is refused by the next view. Proof: `pnpm --filter plitejs test`. Done: `packages/plitejs/test/schema-identity-contract.test.ts` and `plugin-configuration.test.ts`; six cases fail at `fe0e9599a6` in a detached worktree; `docs/plans/artifacts/model-probe/view-mutation-probe.ts` shows each view mutation alone; `pnpm --filter plitejs test` exit 0.
- [x] Plate construction: `readPlateInitialValue` in `withPlite.ts` replaces `normalizeBaseInitialValue`'s classification. Tests: a raw `initialValue.selection` throws, with the `selection` option as control; a non-enumerable or accessor field on the raw `initialValue` throws. Proof: `pnpm --filter platejs test -- ./src/lib/editor/withPlite.slow.ts`, each case seen failing first. Done: `packages/platejs/src/lib/editor/withPlite.ts` and two `withPlite.slow.ts` tests that fail at `fe0e9599a6`; five other failures in that file fail the same way at `fe0e9599a6`.
- [x] Plate migrations: the `legacy` channel, the message-typed `FromDocument` and `ToDocument`, the explicit-source branch of `MigrationOptions`, Plite's readers and the completion refusal, whose message names the field and, for `source: 'current'`, says the field is not supported; delete `assertOwnedDocument`, `ownDocument` and `assertExactKeys`. Tests: a two-step chain lifts `legacy.title` into `meta.title` with no cast; a first step that returns only `{ document }` and a second that lifts `legacy.title`; a source-version-1 envelope whose inner `title` a step lifts; a step written to the old contract fails at completion naming the field; an unlifted field throws at completion naming it; a raw `{ children, document, schema }` with `source` puts both in `legacy`; the envelope error expectation takes the shared wording; type tests with `@ts-expect-error` for an extra key on `FromDocument` and on `ToDocument`, for a non-JSON `legacy` value, and a cast-free explicit-source call on an envelope-shaped raw document. Proof: `pnpm --filter platejs test -- ./src/migrations` and `pnpm --filter platejs typecheck`, each case seen failing first. Done: `packages/platejs/src/migrations/documentMigrations.ts`, its spec (84 migration tests pass) and `type-tests/document-migrations-contracts.ts` (`typecheck:contracts` exit 0); the six planned runtime cases share three tests (decision log); base failure of the migration and type tests is inferred from base source, logged partial.
- [x] CLI: `src/run-migration.ts` passes `source` whenever `--from` is set and refuses an envelope in that run. In a disposable consumer, per `verify`'s CLI recipe, the built `plate migrate run --from` lifts a legacy `document` key through a step, refuses an envelope with its message, and fails on an unlifted top-level field while writing nothing. Proof: its output and the untouched fixtures. Done: `packages/cli/src/run-migration.ts`; `packages/cli/test/run-migration.test.ts` 9 pass; the built CLI in a scratch consumer lifted a legacy `document` key, refused an envelope and an unlifted field, and left refused files byte-identical (decision log).
- [x] v54 differential: run the v54 suggestion fixtures at `fe0e9599a6` and on the final source and compare the complete serialized accepted and proposed documents. Proof: a byte-identical diff. Done: `docs/plans/artifacts/model-probe/make-v54-dump.py`; seven records cmp-identical between `fe0e9599a6` and the build with `crypto.randomUUID` pinned.
- [x] Scale gate: `docs/research/probes/2026-10-03-model-document-boundary/admission-probe.ts`, copied into a final-source checkout and a `fe0e9599a6` one, rerun with the budget frozen in the decision log and its `--skip-replace` control failing; add a view cohort: repeated `createEditorView` of an owned 10,000-paragraph document stays inside the same budget, and the per-call cost for a mutable caller document is recorded beside it. Proof: the paired receipt. Done: `docs/research/probes/2026-10-03-model-document-boundary/admission-build-receipt.txt` and `view-probe.ts`; the post-panel rerun passes every budgeted cohort (construct and replace at 100 and 10,000 paragraphs, owned view at 10,000), both guard controls exit 1, and a mutable caller document costs a 21.7 ms paired median per view at 10,000 paragraphs.

Phase 2, doctrine, docs and release. Exit: keep when the docs checks, `sync-resources --check` and `pnpm check` pass; quarantine a docs page that fails its check and fix it before release.

- [x] Doctrine: one law line in `docs/vision/plite.md` on admission by input kind and its forward-compatibility rule; the migration line in `docs/vision/plate.md`; the Document Migration Gate in `.agents/rules/best-api/rules/schema-and-identity.md`, plus `.agents/rules/plate-plugins/rules/capabilities.md` and `.agents/rules/plate-docs/references/api-examples.md`, gain `legacy`; rewrite the October target in `docs/research/decisions/model-document-boundary.md` to this plan's; append a Plate Next doctrine version in `.agents/rules/plate-next/versions.json`; run `pnpm install`. Proof: `node .agents/rules/plate-next/scripts/sync-resources.mjs --check`. Done: the rule edits and `.agents/rules/plate-next/versions.json` v258; `pnpm install`; `sync-resources.mjs --check` and `version.mjs validate` exit 0.
- [x] Docs: one `plate-docs` step per page, each with its example coverage audit, edits, Chinese twin, docs checks and preview proof: `content/docs/(guides)/document-model.mdx`, `document-meta.mdx` (undeclared `meta` keys are kept), `editor.mdx`, `schema.mdx`, `controlled.mdx`, `form.mdx`, `static.mdx` and `serializing.mdx`, and `content/docs/api/core.mdx`, `editor-api.mdx`, `editor-transforms.mdx` (`SnapshotInput`) and `core/plate-editor.mdx`. Proof: the `plate-docs` checks and previews. Done: the eleven English pages and their twins that carry a changed passage; `serializing.mdx` needs no edit; `apps/www/api-reference.config.json` includes the two new migration types; `pnpm --filter www build:source` and `check:docs` exit 0. No preview changed, so no preview proof applies.
- [x] Release: changesets for `plitejs`, `platejs` and `@platejs/cli` per `changeset`, the regenerated `apps/www/src/generated/api-reference-manifest.json`, then `pnpm check` once on the settled change. Proof: `pnpm check` exit 0, with each failure attributed. Done: `.changeset/plite-document-admission.md`, `.changeset/plate-document-admission.md`, the amended `.changeset/persistence-detached-conversion.md` and the regenerated manifest; `pnpm check` does not pass on this tree because of other sessions' work, and the decision log attributes every failing step.

## Proof

- Phase 1 is library and CLI work. No browser, native input, IME, clipboard or focus behavior changes, so no browser proof applies.
- The scale probe passed before acceptance for construction and replace. A disposable candidate with the design's descriptor scan and frozen snapshot record ran against `fe0e9599a6` in five alternating rounds per cohort. Every median paired delta stayed inside the budget frozen beforehand, max(0.5 ms, 3% of the baseline median): construction moved -0.008 ms at 100 paragraphs and -0.037 ms at 10,000, and `value.replace` moved -0.047 ms and -10.4 ms. Those timings predate the probe's content guard; `docs/research/probes/2026-10-03-model-document-boundary/admission-probe-guard-receipt.txt` holds the guarded single runs and the failing `--skip-replace` control.
- The build's receipt, `docs/research/probes/2026-10-03-model-document-boundary/admission-build-receipt.txt`, covers the document-bound view cohort, so its ledger row moved from `gate` to `rearchitect`. An owned document keeps its cached validation; a mutable caller document pays a full validation per view, about 22 ms at 10,000 paragraphs.
- Limits: saved documents outside this repository were not surveyed; the census skipped Plate's `.slow` files, apps, the registry and `@platejs/test`, and its marker patch was not saved. The build ran the v54 differential and the CLI drive; the Close names their scope.

## Challenge delta

Improved, then cut. The verdict checked each input kind at its raw ingress and kept historical documents open through every migration step. The arena replaced the open documents with a typed channel. The first panel round cut the arena's admission table to field lists, and the second moved the reader onto Plite's existing JSON record reader and closed the view cache. This plan reverses four points of review 2026-10-03-model-document-admission-3 and the decision page, each with its own decision-log row; Phase 1's first step records the superseding verdict and Phase 2 rewrites the decision page:

- The review kept historical input open "through every step". Step documents are now closed, and legacy fields travel in `legacy`.
- The review left document closure with each caller. The field lists and record reader now live in Plite, and each caller composes them.
- The review said "Plite's envelope reader is not shared". `readDocumentRecord` and the identity reader are now shared, and schema matching stays with each caller.
- The review said the v54 step "must stop" fitting mid-chain. It keeps fitting, because its input documents are now closed.

Deleted or merged, each with what it carried and its replacement:

- `initial-value.ts`'s unknown-key loop (dropped unknown keys): the document field list refuses; the malformed-container rows prove it.
- `readExactDataRecord` (a second prototype rule for document records), `isPersistedDocumentEnvelope` and the identity key lists in `public-state.ts` (envelope reading): `readDocumentRecord`, `isEnvelopeInput` and `readPersistedSchemaIdentity`; the envelope tests prove it.
- The root view's and `plugin.ts`'s `meta` checks (refusing metadata): the root-snapshot and structure field lists; the root view and reconfigure tests prove it.
- Plate's `assertOwnedDocument`, `ownDocument`, `assertExactKeys`, its construction envelope sniff and the CLI's per-file envelope check (container, record and routing law): Plite's readers and source-intent routing; the migration specs and the CLI run prove it.

## Close

Reversals and deviations from the approved plan, each with its decision-log row:

- The panel on the build diff ran. The plan's gate row said to skip it, but the `api-build` review rule requires it; the decision-trail review caught the wrong skip.
- `readDocumentRecord` takes one map of fields to `required` or `optional`, returns the caller's object unless it drops a field, and treats any field holding `undefined` as absent. The plan named separate field and required lists, a copy, and absence only for optional fields.
- Plite owns two composed readers, `readEditorDocument` and `readPersistedEnvelope`, so each ingress makes one call. The plan had each ingress compose the reader and the container check, and exported `readPersistedSchemaIdentity`, which is now private. Round 1 swapped it for `readEditorSchemaIdentity`; round 2 restored it, because that decoder refuses cross-realm records.
- A host snapshot transform runs only after Plite admits the caller's raw snapshot or envelope. The plan said the snapshot is checked after `setEditorSnapshotInputTransform`; the panel showed a transform could hide a field.
- `MigrationOptions` gives an envelope without `children` `source?: never` and requires `source` for envelope-shaped input with `children`, `migrateDocument` treats only a record with `document` and no `children` as an envelope, and it refuses an envelope under explicit `source` with its own message. The plan typed `source` as optional for every envelope.
- `defineDocumentMigrations` refuses an inferred step whose returned document carries an extra key, a check the plan's generic constraints did not reach.
- `parseAuthoredDocument` refuses unknown top-level fields while projection and checkpoint admission stay open, as the plan's hard cuts and Unchanged list say. The build had closed both until its code-quality review.
- The CLI and migration release notes amend the unreleased `.changeset/persistence-detached-conversion.md` instead of adding a `@platejs/cli` changeset.
- Six planned migration test cases share three tests, and the view mutation test keeps one mutation with a control.
- Both phases stay although `pnpm check` fails on other sessions' work, against the phase exits' revert clause; the Defaults row "revert build" records the pick.
- The build removed a stale sentence from the editor guide that said the editor runs configured migrations on load.
- A host transform that returns nothing leaves the snapshot as it was, as at `fe0e9599a6`; round 2 restored that fallback.

What landed, uncommitted for the owner:

- Plite refuses a top-level field other than `children`, `meta` and `roots` at construction, `assertDocument`, `fitDocument`, `value.replace` (which adds `selection`), envelopes, the root-bound view, reconfigure and install `migrate`, document views and `parseAuthoredDocument`. A document view caches validation only for a document Plite owns.
- Plate construction reads `initialValue` as a document or envelope, and Plate migrations carry stored top-level fields in `legacy`, and refuse an unlifted one. Explicit step document types and inline steps with one returned shape fail to compile on an extra key. `plate migrate run --from` reads every file as raw and names the file in each error.
- Doctrine v258, the legacy rule in three agent rules, eleven docs pages with their Chinese twins, the API reference manifest, regenerated registry output, and changesets for `plitejs`, `platejs` and `@platejs/cli`.

Proof, with each run's scope in the decision log:

- `pnpm --filter plitejs test` passes all 21 tasks and its typecheck passes. The Plate migration specs pass (85 tests), the `withPlite.slow.ts` tests pass except five that fail the same way at `fe0e9599a6`, and the migrations, core, root and contract typechecks pass. The CLI migration tests pass (9).
- Every new or changed test fails at `fe0e9599a6` or on the tree before its fix, checked in detached worktrees, except the migration runtime and type tests, whose base failure is inferred from base source.
- The built CLI drive, the v54 differential (byte-identical on the five suggestion fixtures with `crypto.randomUUID` pinned) and the scale receipt all ran on the post-panel code.
- Two panel rounds (Opus, gpt-6-astra, gpt-6.1-sol) and a code-quality review ran on the diff; a gpt-6.1-sol decision-trail review ran on the log.

Limits:

- `pnpm check` does not pass on this tree. Its lint step fails on other sessions' files only, and every remaining `test:all` failure matches `fe0e9599a6` by name or comes from another session's export changes; the decision log attributes each. `pnpm --filter www editor:check` reports registry editor artifacts stale for a `summary` placement change this build did not make.
- The v54 differential covers five fixtures, and saved documents outside this repository were not surveyed.
- Round 2's additive warnings stay unfixed and listed below; runtime still refuses each input they describe. Among them, a step with a conditional return or an annotated standalone step still compiles with an extra key, so the plan's promise of a compile error for every extra key is only partly met.
- The type-aware lint errors in two of this run's files sit on lines it did not change; that attribution was not rerun at `fe0e9599a6`. owner: zbeyens.

Counts: 24 items, the owner's Build now ask plus 12 steps and 11 gates; 24 done, 0 skipped, 0 blocked, 0 open.

Next in the review ledger (`review-ledger.mjs next`): `reads`, Reads, snapshots and subscriptions, whose Pursue verdict on copy-on-write snapshot index branch recovery has no bound adoption.

Open work, each with owner zbeyens and tracked in `docs/plans/topics/model.md` Open work:

- Decide whether `setEditorSnapshotInputTransform` is public or internal.
- Round 2's deferred fixes: a union-aware `MigrationClosure`, routing for `document: undefined`, a test for a wrongly typed identity, `fitDocument`'s base JSON error for non-objects, file paths for CLI parse errors, and an envelope that needs `schema`.
- One identity decoder that accepts cross-realm records.
- Per-field message hints, a `readStepResult` helper and typed `readDocumentRecord` results.
- A document view that snapshots its caller's document.
- Envelope-versus-document messages outside `migrateDocument`.
- The meta `__proto__` loss that predates this build.
- The stale registry editor artifacts.

## Open work

- `setEditorSnapshotInputTransform` is marked `@internal` but exported from Plite's public root and Plate's facade. owner: zbeyens, tracked in `docs/plans/topics/model.md` Open work.

## Evidence

- Reviews `docs/research/review-records/2026-10-03-model-document-admission-3.json` and the superseding `2026-10-04-model-document-admission.json`; execution `2026-10-03-model-document-boundary-execution-3`.
- Build receipt `docs/research/probes/2026-10-03-model-document-boundary/admission-build-receipt.txt` and probe `view-probe.ts`; the build's other probes live in the ignored `docs/plans/artifacts/model-probe/`.
- Probes, census files, the scale probe, its stand-in candidate patch and its guard receipt under `docs/research/probes/2026-10-03-model-document-boundary/`.
- Arena runners, cross-judge, synthesis, both censuses, the reproductions and the panel answers live in the session scratch `modelplan/` directory, summarized in this plan's decision log.
- Editor comparison: source reads at the revisions named in What other editors do.
