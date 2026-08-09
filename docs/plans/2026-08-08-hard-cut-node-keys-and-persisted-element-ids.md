# Hard-cut node keys and persisted element IDs

Objective:
Execute the `NodeKey` and persisted `ElementId` hard cut; done when source
sweeps, package and strict Plite checks, browser routes, docs/skills/releases,
and P2 review pass; plan
`docs/plans/2026-08-08-hard-cut-node-keys-and-persisted-element-ids.md`.

Flow mode:
one-shot execution

Goal plan:
docs/plans/2026-08-08-hard-cut-node-keys-and-persisted-element-ids.md

Template:
docs/plans/templates/plite-plan.md

Primary template:
docs/plans/templates/plite-plan.md

Applied packs:
- none

Mode:
- `standard`

Completion threshold:
- All seven execution slices are complete; old identity API/protocol source
  sweeps are clean; focused and strict package proof, required Browser routes,
  docs/releases/skills adoption, P2 autoreview, and `check-complete` pass.

Verification surface:
- Live public-type, runtime-owner, exported-symbol, caller, test, docs, and
  generated-contract audits for `RuntimeId`, runtime identity access, and
  `ElementIdPlugin`.
- Focused Plite/Core/feature tests and typechecks, public declaration builds,
  `pnpm check:plite`, source hard-cut searches, Browser proof on the named
  registry/docs routes, P2 autoreview, and the final plan checker.

Constraints:
- The user accepted this exact plan and authorized full implementation.
- No public compatibility aliases or runtime shims.
- Keep one plan as the default artifact; add a machine-readable artifact only
  when it materially improves a large audit.
- The normal live-identity call is `editor.key(node)`, with `tx.key(...)` for
  transaction-current resolution; do not retain `editor.read.runtime.id` or
  introduce `read.nodes.key` as an alternative.
- Runtime keys remain editor-owned, apply to elements and text, and never enter
  schema, JSON, clipboard, history serialization, or collaboration payloads.
- Persisted element identity remains optional, schema-owned, and distinct from
  runtime keys.

Boundaries:
- In scope: the public `NodeKey` type, `editor.key` / `tx.key`, generic node
  targets, snapshot/commit/DOM/React identity vocabulary, `ElementIdPlugin`
  direct property access, exports, tests, docs, examples, changesets, and
  reusable API doctrine.
- Source owners: `packages/plite`, `packages/plite-dom`, `packages/plite-react`,
  `packages/core`, and direct feature/app consumers proven by the caller audit.
- Non-goals: changing path or anchor semantics, persisting runtime keys, adding
  IDs to text JSON, forcing UUID encoding, changing the element-ID generator,
  broad schema redesign, or unrelated package colocation.
- Direct Plate/collaboration adoption owners: Core React/static, Yjs/history
  serialization contracts, feature packages using live identity, Markdown and
  app owners using persisted element identity, and current docs/examples.

Output budget strategy:
- Read named owners first; expand by evidence; count or artifact large audits
  instead of streaming them.

Blocked condition:
- Block only if live source cannot establish one safe lifecycle law for
  transaction-local keys, undo/redo revival, named roots, or collaboration
  serialization and no focused owner/test can resolve it. Do not block while a
  bounded source or test audit remains.

Plite Plan state:
- status: complete
- phase: complete
- next: none
- handoff: implementation-and-proof-complete

Start Gates:
| Gate | Applies | Evidence |
| --- | --- | --- |
| Prompt requirements captured | yes | Constraints and boundaries above record `editor.key`, `NodeKey`, optional persisted IDs, schema separation, and planning-only scope. |
| Active goal and plan verified | yes | Active goal names this exact plan path. |
| Current owners read | yes | `packages/plite/src/interfaces/editor.ts`, `packages/plite/src/utils/runtime-ids.ts`, `packages/core/src/lib/plugins/element-id/ElementIdPlugin.ts`, and current editor docs read from live checkout. |
| Best API target resolved | yes | Accepted review target: `editor.key(node): NodeKey`, `tx.key(...)`, `element.id`, and retained `ElementIdPlugin`; no aliases. |
| Mode and execution boundary resolved | yes | One-shot accepted-plan execution; the user explicitly said `go all`. |

Work Checklist:
- [x] Outcome, scope, non-goals, constraints, and owners are concrete.
- [x] Current API/docs/tests/exports/behavior claims cite live source.
- [x] Reusable public call shape has one `best-api` verdict before target lock.
- [x] Every concept-level decision row has owner, adoption, proof, risk, and verdict.
- [x] Public breaks and any private bridge have complete adoption/deletion answers.
- [x] Execution slices and focused proof matrix are concrete.
- [x] Conditional work and final handoff are resolved without generic N/A matrices.
- [x] Slice 1 locks root/state/transaction, snapshot, commit, root-view, and declaration contracts for the target shape.
- [x] Slice 2 hard-cuts Plite public/kernel identity vocabulary without changing allocator or serialization behavior.
- [x] Slice 3 migrates DOM, React, and browser protocols atomically and proves
  Core static output omits editor-local keys.
- [x] Slice 4 adopts `NodeKey` across every proven feature/app live-identity consumer without renaming domain IDs.
- [x] Slice 5 canonicalizes persisted element IDs and removes property-key overrides while retaining target overrides.
- [x] Slice 6 updates exports, barrels, current docs, pending changesets, Vision, and source skill rules, then regenerates skills.
- [x] Slice 7 passes focused, strict, declaration, Browser, source-sweep, lint, diff, and P2 autoreview gates.

Completion Gates:
| Gate | Applies | Required action | Evidence |
| --- | --- | --- | --- |
| Binary readiness | yes | Complete the accepted implementation | Slices 1-6 are implemented; package, declaration, barrel, lint, and strict Plite gates pass. |
| Fresh source evidence | yes | Recheck decision-changing current claims | Live Plite, DOM, React, Core, feature, docs, test, and changeset owners were read on 2026-08-08. |
| Best API review | yes | Resolve/reject every P0/P1 call-shape finding | One target is locked below; no aliases or unresolved P0/P1 choices remain. |
| Conditional risk and adoption | yes | Complete triggered risk/browser/docs/release work | Current docs/releases/rules are adopted. Browser was attempted and is blocked before route code by the known CI-generated registry import of deleted `plate-types.ts`; strict Chromium proof passed 698 tests with 6 intentional skips. Physical-device proof remains deferred. |
| Verification recorded | yes | Record fresh implementation proof | Focused, package, integrated, published-declaration, API-reference, lint, source-sweep, and strict Plite proof is recorded below. |
| Handoff prepared | yes | Prepare concise implementation ownership, breaks, proof, and residual risks | Ownership, exact public shape, adoption, proof, Browser blocker, and deferred device boundary are recorded. |
| P2 autoreview | yes | Run with `--max-priority P2`, repair accepted findings, and rerun affected proof | Four review cycles repaired every accepted P0-P2 finding. The final cycle repeated one invalid legacy `tableCellHeader` claim; current Table v54 source proves `tableCell + header: true`. No accepted actionable finding remains. |
| Goal plan complete | yes | Run `node .agents/skills/autogoal/scripts/check-complete.mjs docs/plans/2026-08-08-hard-cut-node-keys-and-persisted-element-ids.md` after every other gate closes | Passed on the final ledger. |

Phase / pass table:
| Phase | Status | Evidence | Next |
| --- | --- | --- | --- |
| Ground | completed | Live owners, callers, tests, docs, changesets, and prior audit artifact inspected. | Decide |
| Decide | completed | Public grammar, identity laws, naming, schema boundary, and rejected alternatives locked. | Execute |
| Execute slices 1-2 | completed | Public contracts, kernel ownership, root/view law, snapshots, commits, and declaration ABI are implemented and proven. | Host and feature adoption |
| Execute slices 3-6 | completed | DOM/React/browser protocol, feature consumers, Element ID/schema cut, exports, docs, changesets, Vision, and generated skills are adopted. | Integrated closure |
| Execute slice 7 | completed | Focused, affected, strict, declaration, lint, hard-cut, Browser-attempt, and converged P2 review evidence is green/recorded. | Final handoff |

Decision brief:
- outcome: one short runtime-key primitive and one explicit optional persisted
  element-ID capability, with no overlapping identity vocabulary.
- chosen shape: `editor.key(node): NodeKey`, contextual `state.key(...)` and
  `tx.key(...)`, `NodeKey` in generic targets, direct `element.id` in exact
  generated application types, and scoped `ElementIdPlugin.read.id(element)` /
  `.read.entry(id)` at generic package boundaries.
- strongest rejected alternative: `editor.read.nodes.key(node)` preserves read
  taxonomy but taxes the dominant identity call and duplicates the root live-
  handle role already established by `editor.anchor(...)`.
- consequence: a repo-wide public hard cut across Plite, DOM/React, Plate
  consumers, docs, tests, and release prose; runtime behavior must remain
  unchanged.

## Final public shape

```ts
export type NodeKey = string & {
  readonly '~nodeKey': true;
};

export type EditorKeyApi = {
  (node: Descendant): NodeKey;
  (at: Location): NodeKey | null;
};

interface BaseEditor {
  /** Resolve one editor-owned live descendant key. */
  key: EditorKeyApi;
}
```

Use the root method for current live state and the contextual method when a
coherent state or active transaction matters:

```ts
const key = editor.key(element);
const path = editor.read.nodes.path(key); // Path | undefined

editor.read((state) => {
  const key = state.key([0]);
  const path = key ? state.nodes.path(key) : undefined;
});

editor.update((tx) => {
  tx.nodes.insert(paragraph, { at: [1] });

  const key = tx.key([1]);
  if (key) tx.nodes.move({ at: key, to: [0] });
});
```

There is no `editor.read.key`, `editor.read.runtime.id`,
`editor.read.runtime.path`, `read.nodes.key`, or compatibility alias.
`state.runtime.snapshot()` remains because it is a real runtime snapshot API,
not a node-identity synonym. Pure `state.transaction(...)` spec builders do not
publish `key`: detached serializable specs may consume an existing `NodeKey` as
a `NodeTarget`, but they must not allocate or promise transaction-live keys.

Persisted identity stays a separate opt-in Core plugin:

```ts
const EditorKit = [ElementIdPlugin] as const;

ElementIdPlugin.configure({
  initialState: {
    generateId: () => uuidv7(),
  },
});

const id = element.id; // exact generated/editor-kit element type
const entry = editor.plugin(ElementIdPlugin).read.entry(id);
entry?.key; // NodeKey
```

Generic library code cannot truthfully assume every `Element` carries `id`.
It uses the installed capability as the assertion and schema-aware boundary:

```ts
const elementId = editor.plugin(ElementIdPlugin);

if (elementId.installed) {
  const id = elementId.read.id(element);
}
```

That is not a competing everyday API. Direct property access is for an exact
schema-derived element; the scoped read is for an erased or optional element
boundary. Removing it would replace one honest check with casts.

## Governing laws

1. A `NodeKey` identifies one live descendant in one editor runtime. It covers
   elements and text, but not the editor root. Passing a detached or foreign
   descendant to the non-null node overload throws instead of allocating a
   misleading key.
2. A node retains its key across ordinary updates and moves. A true copy,
   split-created node, cross-editor import, or unrelated replacement gets a
   fresh key.
3. A removed key does not resolve in the current state. Undo/redo may revive
   the original in-memory key only when the restored node is the same logical
   node under the existing history law.
4. Active transactions resolve against their current draft. A rejected or
   rolled-back transaction publishes no new key or key-to-path mapping.
5. Keys are scoped by the editor and unique across that editor's roots, so
   identical opaque strings in two editors do not collide. Generic key targets
   can resolve across roots, but `nodes.path(key)` is current-root-only because
   `Path` does not encode a root. Base-editor path inputs mean the main root;
   view path inputs mean that view's root. A live node object passed to
   `editor.key` can resolve from any root in the same editor. Cross-editor
   protocols carry the source editor identity beside the source key.
6. Keys never enter schema, document JSON, content slices, clipboard payloads,
   history serialization, Yjs/collaboration payloads, Markdown, HTML, or DB
   data.
7. Paths remain the structural address for local tree work; anchors remain the
   live text/location primitive. `NodeKey` joins `NodeTarget` for durable
   in-memory lookup instead of replacing either concept.
8. `ElementIdPlugin` owns optional persisted IDs for every element, including
   inline elements, and never text. Its canonical persisted property is `id`.
9. The default persisted-ID generator remains `nanoid`. Consumers needing
   sortable/global IDs may provide UUIDv7 or another string generator. Encoding
   does not rename the capability.
10. Plugin-authored property keys are invariant after definition. A closed
    editor may change property targets, but a storage-key rename is a data
    migration, not a runtime schema alias.

## Complete breaking migration

| Before | After | Notes |
| --- | --- | --- |
| `RuntimeId` | `NodeKey` | Keep a public string-literal brand so declaration emit can name it. |
| `editor.read.runtime.id(nodeOrLocation)` | `editor.key(nodeOrLocation)` | Descendant overload is non-null; location overload returns `null` when unresolved. |
| `state.runtime.id(nodeOrLocation)` | `state.key(nodeOrLocation)` | Coherent immutable state view. |
| `tx.runtime.id(nodeOrLocation)` | `tx.key(nodeOrLocation)` | Resolves the active draft, including newly inserted nodes. |
| `editor.read.runtime.path(runtimeId)` | `editor.read.nodes.path(key)` | Existing generic node lookup returns `undefined` when unresolved. |
| `state.runtime.path(runtimeId)` | `state.nodes.path(key)` | No second reverse-lookup owner. |
| `tx.runtime.path(runtimeId)` | `tx.nodes.path(key)` | Uses the active draft. |
| `NodeTarget = Location \| Node \| RuntimeId` | `NodeTarget = Location \| Node \| NodeKey` | Every generic node read/update adopts the key automatically. |
| `SnapshotIndex.idAt(path)` | `SnapshotIndex.keyAt(path)` | `entries()` becomes `[NodeKey, Path][]`; `pathOf(key)` keeps its name. |
| `changed.runtimeIds(...)` | `changed.nodeKeys(...)` | Rename `runtimeIdsAll` to `nodeKeysAll` and `hasRuntime` to `hasNodeKey`. |
| `ProjectedRangeSegment.runtimeId` | `.key` | Use `.nodeKey` only in wider objects where plain `key` would collide. |
| `NodeRuntimeIdContext` | `NodeKeyContext` | React context still carries one `NodeKey`. |
| `data-plite-runtime-id` | `data-plite-node-key` | Hard-cut editable selectors, clipboard selection, and browser harnesses together; static output omits editor-local keys. |
| exported/internal `*RuntimeId*` identity helpers | `*NodeKey*` | Rename semantic identity symbols; retain unrelated editor/runtime/snapshot names. |
| feature state storing live `*Id` / `*Ids` | `*Key` / `*Keys` | Only when the value is proven to be `NodeKey`; persisted IDs, editor IDs, request IDs, and domain IDs remain unchanged. |
| `ElementIdEntry.runtimeId` | `ElementIdEntry.key` | The `NodeKey` type removes ambiguity without the verbose field name. |
| `MigrateElementIdsOptions.key` | `.sourceKey` | Reads a legacy property and always writes canonical `id`, deleting the old property when different. |
| `schema.override(Plugin, { properties: { x: { key } } })` | delete | Keep `target` override; define a new property plus an explicit migration for a true persisted rename. |

The hard cut deliberately leaves `editor.id`, persisted `element.id`, domain
IDs, extension/plugin `name`, element `type`, property `key`, schema identity,
React's JSX `key`, and non-identity uses of the word `runtime` untouched.

Decision ledger:
| Surface | Current | Target | Owner | Reason | Adoption | Proof | Risk | Verdict |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| Runtime primitive | Branded `RuntimeId` in `packages/plite/src/interfaces/editor.ts:1514-1517` | Branded `NodeKey` | Plite public interfaces | `key` names editor-local live identity; `id` implies persistence/global identity | Public exports and every typed consumer | Declaration smoke rejects plain strings and accepts `NodeKey` | Declaration portability | accept |
| Common lookup | `editor.read.runtime.id(...)` | `editor.key(...)` | Plite editor construction/public state | This is a first-class live editor handle like `anchor`, not a nested query family | Root editor, root-scoped views, docs | Node and location overload type/runtime tests | Root/view drift | accept |
| Contextual lookup | `state.runtime.id`, `tx.runtime.id` | `state.key`, `tx.key` | Plite state and transaction views | Snapshot and draft coherence remain explicit | State callback and active transaction callers | Insert/move/rollback/named-root tests | Draft leakage | accept |
| Spec builder | Inherits runtime ID lookup | No key allocator on detached spec builder | Plite transaction-spec types | Serializable specs may target an existing key but cannot own runtime lifecycle | Remove inherited identity allocator only | Compile contract plus spec replay tests | Accidental capability loss | accept |
| Reverse lookup | Dedicated `runtime.path` | Existing `nodes.path(NodeKey)` | Plite node target resolver | One generic node lookup already owns location resolution | All direct/state/tx callers | Missing, move, removal, root tests | `null` to `undefined` migration | accept |
| Snapshot index | `RuntimeId`, `idAt`, `pathOf` | `NodeKey`, `keyAt`, `pathOf` | Plite snapshots | The frozen index maps live keys, not persisted IDs | Snapshot/commit callers | Lazy/frozen/index mapping tests | Query-order determinism | accept |
| Commit identity | `runtimeIds`, `runtimeIdsAll`, `hasRuntime` | `nodeKeys`, `nodeKeysAll`, `hasNodeKey` | Plite commit metadata | The values are node keys; generic “runtime” obscures that | React, Core, feature subscribers | Exact changed-kind and root tests | Missed feature-store field | accept |
| Allocation internals | `runtime-ids.ts` and `*RuntimeId*` helpers | `node-keys.ts` and semantic `*NodeKey*` names | Plite kernel | Align owner vocabulary without changing counter/WeakMap algorithms | Internal imports and tests | Lifecycle parity plus no serialization | Blind global rename | accept |
| DOM protocol | `data-plite-runtime-id` | `data-plite-node-key` | Plite DOM/React; Core static omission | Attribute identifies an editable rendered node key | Editable renderers, selectors, clipboard, browser tests, static omission | Editable DOM assertions plus static omission | Partial protocol migration or static key leakage | accept |
| React protocol | `NodeRuntimeIdContext` and `runtimeId` props/options | `NodeKeyContext` and contextual `key`/`nodeKey` | Plite React | React bindings consume NodeKey directly | Editable rendering, projection, selection, repair, hooks | Provider/render/selection/repair suites | JSX `key` confusion | accept with contextual naming |
| Browser protocol | Runtime-ID handles and test bridge fields | Node-key handles and fields | `packages/browser`, Plite app harness | Browser proof must speak the public concept | Handle codecs and browser tests | Chromium strict suite plus DOM inspection | External test break | accept |
| Feature live state | AI, DnD, list, media, selection, table, toggle store fields and helpers | `NodeKey` plus `*Key(s)` names only for live identity | Owning feature packages | Prevent persisted/runtime identity mixing | Per-owner semantic audit, no mechanical rename | Focused type/tests and demos | Domain IDs renamed by mistake | accept with owner audit |
| Runtime persistence boundary | Runtime keys are WeakMap/counter-owned in `runtime-ids.ts:4-17` | Same algorithms and zero serialized keys | Plite, history, Yjs, codecs | This is a vocabulary/API cut, not a persistence redesign | JSON/slice/history/collab/clipboard tests | Absence scans and round trips | Accidental data leak | accept |
| Persisted capability | Optional `ElementIdPlugin` with `id` and `nanoid` | Keep name, field, scope, generator default | Core Element ID owner | `ElementIdPlugin` says exactly what persists; `NodeId` falsely includes text, `Uuid` names an encoding | No rename; update docs to contrast NodeKey | Core lifecycle/index tests | User conflates key and ID | accept |
| Persisted direct read | Scoped `.read.id` everywhere | `element.id` for exact generated types; `.read.id` for erased/optional generic boundaries | Core types and direct consumers | One cannot safely promise `id` on generic `Element`; casts are worse than a scoped assertion | Migrate exact app/components; retain generic package calls | Compile-only exact/generic examples | Fake type precision | accept |
| Persisted reverse index | `ElementIdEntry.runtimeId` | `ElementIdEntry.key: NodeKey` | Core Element ID owner | Entry bridges durable ID to live node key | Markdown, TOC, app callers as applicable | Multi-root incremental index tests | Stale entry after commit | accept |
| Property-key overrides | Closed editor may override a plugin property key | Delete property `key` overrides; keep `target` overrides | Plite schema compiler and Core model compiler | Direct typed property access requires one canonical owner key; storage rename is migration | Remove API/compiler branches and four live override test families | Type rejection, compiler tests, Element ID migration tests | Broader public break | accept as prerequisite |
| Element-ID migration | `key` is both source and destination | `sourceKey` imports legacy data into canonical `id` | Core Element ID owner | Migration is the honest boundary for persisted renames | Update migration callers/docs | Numeric, duplicate, missing, old-key removal tests | Silent duplicate/collision | accept |
| Docs and release | Runtime ID terminology across current docs and eight pending changesets | One NodeKey/Element ID vocabulary | Docs/release owners | A hard cut with stale prose is not complete | EN/CN docs, API examples, pending changesets | Search gates and browser docs route | Generated registry noise | accept; source only |
| Doctrine | Current rules still name runtime identity generically | Record NodeKey root/context grammar and generic Element ID exception | Best API + smallest Plite/Plate Vision owners | Prevent the next package from rebuilding the old split | Edit source rules, then `pnpm install` | Generated skill diff and rule searches | Contradictory worker wording | accept |
| Compatibility | Old public names could alias new names | No aliases, overload shims, deprecated exports, or dual DOM attributes | Every owner | This is a breaking window; two identity dialects would be worse than migration | Delete old symbols after adoption | Source hard-cut checker | Downstream break | accept |

Execution slices:
| Slice | Owner | Scope | Entry | Exit | Proof |
| --- | --- | --- | --- | --- | --- |
| 1. Lock contracts | Plite tests/types | Add target-shape compile/runtime assertions and old-shape removal through current behavior tests, not dead-code string tests | Accepted public shape above | Tests fail for the right missing APIs before implementation | Focused state/tx, snapshot, commit, root-view, declaration tests |
| 2. Plite public/kernel cut | `packages/plite` | Add `NodeKey`/`EditorKeyApi`; wire root/state/tx; route reverse lookup through nodes; rename snapshot/commit/internal identity symbols and files; keep allocator algorithms | Slice 1 failures | No runtime identity API or semantic symbol remains in Plite public/current source | Plite source-first typecheck, focused tests, package build |
| 3. Host cut | `packages/plite-dom`, `packages/plite-react`, `packages/browser`, Core static | Rename editable DOM attributes, contexts, props, selectors, and browser handles atomically; prove static output omits runtime keys | Plite NodeKey compiles | One editable DOM/React/browser protocol uses NodeKey end to end; static output stays runtime-free | DOM/React/browser focused tests, static omission, and Chromium smoke |
| 4. Feature adoption | AI, DnD, list, list-classic, media, selection, table, toggle, Core/app callers | Classify every live-identity value and migrate only proven runtime fields/calls; preserve persisted/domain/editor/request IDs | Host surface compiles | All feature packages consume NodeKey and no semantic live `*Id` field remains | Per-package typecheck/test plus registry demos |
| 5. Persisted-ID/schema cut | Plite schema compiler, Core model compiler, Element ID, Markdown, TOC, app persisted-ID callers | Remove property-key override, add `sourceKey` canonical migration, rename entry field, migrate exact direct reads while keeping generic scoped reads | Runtime-key adoption stable | Canonical property is `id`; overrides cannot rename it; migration handles legacy storage | Schema compiler/types, Core Element ID, Markdown, TOC tests |
| 6. Public adoption and doctrine | Exports, barrels, current docs EN/CN, pending changesets, Vision and source skill rules | Update examples and release prose; remove old API; run `pnpm brl`; run `pnpm install` after rule edits; never edit generated skills/templates directly | Product source settled | Published source contains one vocabulary and generated skills match source rules | Hard-cut searches, docs/app typecheck, generated skill diff |
| 7. Integrated closure | All modified owners | Lint, strict Plite proof, package declaration proof, browser routes, P2 autoreview, repair loop | Slices 1-6 green | All binary exit gates pass with no accepted P0-P2 finding | Commands and browser assertions below |

Proof matrix:
| Claim | Planning evidence | Execution proof | Status |
| --- | --- | --- | --- |
| Runtime identity is editor-owned, not node data | Per-editor WeakMaps and counter in `packages/plite/src/utils/runtime-ids.ts:4-17` | Element/text, same-object/two-editor, and JSON absence tests | passed |
| Root API is implementable without a second owner | `BaseEditor.anchor` already establishes a root live-handle precedent at `packages/plite/src/interfaces/editor.ts:1371-1392`; current ID resolver is one overload set in `public-state.ts:2560-2575` | Root/editor-view parity and compile surface tests | passed |
| Reverse lookup needs no dedicated identity namespace | `EditorStateNodesApi.path` already accepts `NodeTarget` at `editor.ts:702-732` | Direct/state/tx path tests using `NodeKey` | passed |
| Transaction key sees draft state | Existing `tx.runtime.id/path` contract covers insertion and moves in `state-tx-public-api-contract.ts:603-710` | Port same behavior to `tx.key`/`tx.nodes.path`, add rollback non-publication | passed |
| Snapshot and commit identity stay stable | Current snapshot index and changed-runtime contracts are extensive in Plite snapshot/commit tests | Rename assertions plus lifecycle parity | passed |
| Named roots stay isolated | Current root-view contracts resolve runtime IDs per view | Main/header/footer key and path isolation tests | passed after owner repair |
| No serialization leak | Current architecture explicitly keeps RuntimeId out of values/slices/history/collab | JSON, slice, clipboard, history, Yjs round trips plus old/new attribute distinction | passed |
| DOM/React protocols migrate atomically | Editable renderers and selectors use `data-plite-runtime-id`; React owns `NodeRuntimeIdContext` | Editable DOM/selection/provider/repair tests assert only `data-plite-node-key`; static rendering asserts omission | passed |
| Feature stores do not confuse IDs and keys | Caller audit found live identity in AI, DnD, list, media, selection, table, and toggle | Owner-specific type checks and field-name audit; persisted/domain IDs unchanged | passed |
| Persisted element IDs remain optional | `ElementIdPlugin` is opt-in and targets all elements at `ElementIdPlugin.ts:238-253` | Editors without plugin add/scan no `id`; installed plugin covers block+inline, not text | passed |
| Exact direct access is typed, generic access stays honest | Base `Element` remains open/generic while generated application values can include plugin properties | Compile examples accept `element.id` in exact EditorKit and require scoped read for generic `Element` | passed |
| Property storage identity is canonical | Live `EditorSchemaPropertyOverrideInput.key` exists at `packages/plite/src/interfaces/schema.ts:498-502` despite fixed-key doctrine | Old override fails types; target override passes; canonical `id` migration tests pass | passed |
| Public declarations remain finite and portable | Existing string-literal RuntimeId brand repaired prior declaration emit; new shape is equally shallow | Plite/Core/feature builds and EditorKit TS2589 regression fixture | passed |
| Docs and release prose match the shipped API | Eight pending changesets currently mention RuntimeId/ElementId behavior | Current source scans, docs type/render route, changeset audit | source passed; live docs route blocked by stale generated registry import |

Conditional evidence:
- High-risk scenarios: required. Runtime lifecycle, transaction rollback, named
  roots, undo/redo revival, cross-editor transfer, snapshot/commit mapping, DOM
  hydration, and serialization exclusion have explicit rows above.
- External research: no new research. The accepted architecture audit at
  `docs/plans/artifacts/node-identity-architecture-audit/final-recommendation.md`
  already compared Lexical, ProseMirror, Wordgard, Slate, and other editors.
  This plan changes the local public noun and call grammar, not the behavior
  conclusion, so reopening the external audit would add noise.
- Issue/PR provenance: no public issue or PR owns this user-directed breaking
  architecture cut. No external comment or mutation is authorized.
- Browser: required during implementation because DOM attributes, React
  rendering, registry UI, and docs change. Verify `/blocks/dnd-demo`,
  `/blocks/block-selection-demo`, `/blocks/table-demo`, `/blocks/toggle-demo`,
  `/blocks/playground`, and `/docs/editor` with Browser. Inspect
  `data-plite-node-key`, absence of `data-plite-runtime-id`, interactions, and
  console errors. Raw physical-device proof remains deferred because the cut
  makes no device-specific claim.
- Benchmark: not required. The accepted implementation keeps the existing
  WeakMap/counter and direct index algorithms. If implementation adds a tree
  walk or changes allocation/index complexity, this gate flips to required and
  must compare large-document key/path lookup before and after.
- Docs/release: required. Update current EN/CN editor/runtime/React docs and the
  pending identity-bearing changesets
  `plite-canonical-architecture.md`, `plugin-portal-scoped-api.md`,
  `ai-v54-runtime.md`, `dnd-cross-editor-drop.md`,
  `selection-plite-runtime.md`, `toggle-v54-runtime.md`,
  `toc-v54-runtime.md`, and `markdown-plite-runtime.md`.
- Behavior law: Plite owns mandatory ephemeral keys; Core owns optional
  persisted element IDs. No schema or plugin controls NodeKey lifecycle.

Findings:
- `RuntimeId` currently appears in the public `NodeTarget`, runtime read API,
  snapshots, commits, React/DOM protocols, and feature packages. A local alias
  would leave two public identity dialects; the only clean change is repo-wide.
- The current implementation is already architecturally sound: editor-scoped
  WeakMaps and counters give constant-time identity without serialized fields.
  The plan changes vocabulary and surface placement, not the allocator.
- `EditorStateNodesApi.path` already accepts every `NodeTarget`; keeping
  `runtime.path` duplicates the same read under a worse noun.
- The state/transaction split matters. Root `editor.key` is the common path,
  while `state.key` and `tx.key` preserve coherent snapshot/draft reads.
- The runtime namespace still legitimately owns snapshots. Deleting or moving
  `state.runtime.snapshot()` is unrelated churn.
- A generic `Element` does not prove `ElementIdPlugin` is installed or targeted
  to that element. Therefore direct `element.id` cannot replace the scoped
  read at every package boundary without casts or fake global typing.
- Property-key overrides contradict the current invariant that plugin-owned
  property keys are fixed. They also make direct typed access dishonest. The
  narrow prerequisite is to delete key overrides while retaining target
  overrides and an explicit data-migration boundary.
- The caller inventory found identity-bearing source across Plite (41 files),
  Plite React (58), Plite DOM (7), Core (7), browser (6), app registry (16),
  docs (15), and AI/DnD/list/media/selection/table/toggle packages. These are
  execution audit groups, not permission for a blind text replacement.

Decisions and tradeoffs:
- Choose `NodeKey`, not `RuntimeId`: the value is ephemeral editor-local node
  identity and is used like Lexical's node key. `RuntimeId` sounds serializable
  and forces callers to care about implementation lifecycle.
- Choose `editor.key`, not `editor.read.nodes.key`: the hot path deserves one
  word and has the same first-class live-handle status as `editor.anchor`.
- Keep `NodeKey` rather than public `Key`: the exported type must remain
  searchable and distinguish node identity from schema/property/React keys.
- Use `.key` on narrow public records such as `ElementIdEntry`, but use
  `nodeKey` in broad options/locals where plain `key` collides with JSX,
  storage keys, or map keys.
- Keep `ElementIdPlugin`: `NodeIdPlugin` falsely implies persisted text IDs;
  `IdPlugin` is vague and search-hostile; `UuidPlugin` bakes one encoding into
  a capability that accepts any non-empty string generator.
- Do not create `ElementId` or `Uuid` branded types in this cut. The current
  schema property is `string`; branding it without a refined-string schema law
  would be a cast disguised as safety.
- Keep paths and anchors. Keys are best for durable in-memory node retrieval,
  paths for local structure, and anchors for rebasing text/range locations.
- Keep cross-editor key strings allowed to repeat. The editor is part of the
  identity scope; global uniqueness would spend CPU and bytes on a promise the
  runtime does not need.
- Reject compatibility aliases and dual DOM attributes. They prolong the exact
  identity confusion this cut fixes.

Review fixes:
- Corrected the over-broad proposal to delete `ElementIdPlugin.read.id`.
  Source proves generic and optional plugin callers cannot safely use
  `element.id`; the scoped read remains only for those boundaries.
- Chose `ElementIdEntry.key` instead of `nodeKey`: the record is narrow and the
  `NodeKey` type is explicit.
- Kept `state.runtime.snapshot()` and excluded non-identity runtime names from
  the rename.
- Added deletion of closed-schema property-key overrides as the narrow
  prerequisite for canonical direct property access; property target overrides
  remain supported.
- Guarded history-carried keys with cached source paths so a restored duplicate
  cannot steal the key of a node that survived the intervening edit.
- Made generic `replaceChildren.at` a `NodeTarget` and routed it through the
  document target owner, so one key can address the correct named root without
  leaking a rootless path.
- Made AI replacement keys authoritative instead of assuming output block
  counts remain fixed; table aliases resolve against their effective root,
  reset between requests, replace by key, and preserve persisted cell-child
  IDs.
- Rejected the repeated review request to restore `tableCellHeader`. Table v54
  deliberately represents headers as `tableCell` with `header: true`, and the
  migration owner converts the legacy type.

Error attempts:
| Error / failed attempt | Count | Next different move | Resolution |
| --- | ---: | --- | --- |
| `bun test packages/plite/test/state-tx-public-api-contract.ts` treated the path as a name filter | 1 | Prefix the path with `./` | Corrected command ran the intended file. |
| Published Plite declarations erased `PropertyValueDescriptor` and `PropertyBuilderApi` to bare `Readonly` aliases | 1 | Repair the declaration owner instead of annotating downstream consumers | Exported stable interfaces/type carriers, added the artifact checker regression, and passed Plite/Core/basic-styles published builds. |
| Early package tests still expected `null` from `nodes.path` and mocked the removed nested runtime API | 1 | Port the current contract and mocks to `undefined`/`editor.key` | Repaired Plite snapshot/transaction expectations and Selection's editor mock; affected suites pass. |
| A key from another named root returned a rootless path and base path lookup followed a view's active root | 1 | Define and enforce the root law at the lookup owner | `nodes.path(key)` is current-root-only, base path inputs use main, view path inputs use the view root, and live node-object lookup remains editor-wide; focused 61/61 and full Plite 1432/1432 pass. |
| Browser registry/docs routes fail before route code on a generated import of deleted `registry/components/editor/plate-types.ts` | 2 | Confirm the source owner and preserve the no-local-registry-build policy | Source registry intentionally excludes `plate-types`; the stale CI-generated `__registry__` artifact is outside this cut. Browser proof is explicitly blocked, while strict Chromium passes 698 tests. |
| Artifact checker was first invoked with the wrong `.spec.ts` filename | 1 | Locate the actual checked-in test owner | `bun test ./tooling/scripts/check-package-build-artifacts.test.mjs` passed 7/7. |
| Absolute-path metadata revived wrong node keys after a skipped sibling edit | 1 | Move identity ownership into the inverse change's inserted token slices so compose/transform carry it with content | Runtime-only slice metadata now survives compose/transform, stays out of `DocumentChange` JSON, and passes basic, skipped-edit, named-root, AI exact-source, undo, and redo proofs. |

Verification evidence:
- Slice 1 red proof: `bun test ./packages/plite/test/state-tx-public-api-contract.ts`
  ran 30 tests with 23 passing and 7 expected failures because `editor.key`,
  `state.key`, and `tx.key` do not exist yet.
- Read live public types and owners in
  `packages/plite/src/interfaces/editor.ts`,
  `packages/plite/src/core/public-state.ts`,
  `packages/plite/src/utils/runtime-ids.ts`,
  `packages/plite/src/editor-runtime-view.ts`, and
  `packages/core/src/lib/plugins/element-id/ElementIdPlugin.ts`.
- Read live schema override types/compiler owners in
  `packages/plite/src/interfaces/schema.ts`,
  `packages/plite/src/core/schema-compiler.ts`,
  `packages/core/src/lib/plugin/PluginDefinition.ts`, and Core model compiler
  tests.
- Audited current source/docs/changeset callers with `rg` for `RuntimeId`,
  `runtimeId`, `.runtime.id`, `.runtime.path`, `getRuntimeId`,
  `getPathByRuntimeId`, `ElementIdPlugin`, `.read.id`, and `generateId`.
- Confirmed the prior completed identity architecture and proof record in
  `docs/plans/2026-08-07-implement-node-identity-architecture.md`; this plan
  preserves its behavior law while hard-cutting the public vocabulary.
- Plite full package suite passed 1433/1433 after the history-key repair. The
  focused root/view/key contract passed 61/61.
- The 16-package integrated typecheck/build graph passed 54 tasks. Published
  declaration builds passed for Plite, Core, and downstream basic-styles.
- The final `pnpm check:plite:dev` passed in 129326 ms across 52 typecheck
  owners, all affected package-test owners, browser core, contracts, public
  package declarations, and Chromium smoke 3/3.
- The final `pnpm check:plite` passed in 373272 ms, including the full strict Chromium
  matrix: 698 passed, 6 intentional skips, 78 bounded batches.
- Feature proof passed: Table 243/243, Selection 94/94, AI 77/77, DnD 19/19,
  Toggle 12/12, plus every affected package in the integrated gate.
- Plite History passed 131/131. Its owner contract proves in-memory undo/redo
  revives element and text `NodeKey`s across skipped structural rebasing and a
  named root, resolves carried-key collisions in favor of the surviving live
  node, while `History.toJSON` contains none of those keys. AI's final focused
  exact-source/table-alias suite passed 22/22.
- `pnpm brl` passed 56/56. `pnpm lint:fix` checked 4092 files with only the 15
  pre-existing oversized artifact warnings. `git diff --check` passed.
- The owned API reference manifest was regenerated after `replaceChildren.at`
  widened to `NodeTarget`; `pnpm --filter www api-reference:check` then passed.
  The manifest contains `NodeKey` and excludes the removed RuntimeId surface.
- `bun test ./tooling/scripts/check-package-build-artifacts.test.mjs` passed
  7/7, including rejection of declaration aliases erased to bare `Readonly`.
- The current-source hard-cut scan has no old identity API/protocol hit. Its
  only lexical matches are the unrelated local boolean `hasRuntimeScope` and
  assertions comparing an editor's real `id` to its runtime-view `id`.
- `pnpm install` regenerated skills from source rules. Plate Next doctrine v67
  validates with 42 active and 1 retired package.
- Browser attempted `/blocks/dnd-demo`, `/blocks/playground`, and
  `/docs/editor`. Next fails before route code because the CI-generated
  `apps/www/src/__registry__/index.tsx` imports the deliberately deleted manual
  `apps/www/src/registry/components/editor/plate-types.ts`. Repo policy forbids
  local registry generation or patching generated output. The affected runtime
  remains covered by the strict Chromium matrix above. Physical-device testing
  stays deferred because no device-specific behavior changed.
- P2 autoreview converged after four repair cycles with no accepted actionable
  P0-P2 finding. The final repeated header-type claim was rejected against the
  current Table v54 schema and migration owners.

### Exact implementation verification

Run focused proof after each owning slice, then the closure gates:

```bash
pnpm turbo typecheck \
  --filter=./packages/plite \
  --filter=./packages/plite-dom \
  --filter=./packages/plite-react \
  --filter=./packages/browser \
  --filter=./packages/core

bun test \
  packages/plite/test/state-tx-public-api-contract.ts \
  packages/plite/test/editor-runtime-view-contract.ts \
  packages/plite/test/snapshot-contract.ts \
  packages/plite/test/commit-metadata-contract.ts \
  packages/plite/test/native-transaction-spec-contract.test.ts \
  packages/core/src/lib/plugins/element-id/ElementIdPlugin.spec.tsx

pnpm check:plite:dev
```

For every modified feature owner, run its source-first typecheck and focused
tests. Then run:

```bash
pnpm brl
pnpm install
pnpm lint:fix
git diff --check
pnpm check:plite
```

Build the public declaration owners (`plite`, `plite-dom`, `plite-react`,
`core`, and any feature package whose exported identity type changes) and run
the existing large EditorKit type fixture to reject TS2589. Use Browser for the
routes listed under Conditional evidence. Finish with P2 `autoreview`, repair
accepted findings, rerun affected proof, and repeat until clean.

Hard-cut source gates must find no current API or protocol use outside
historical changelogs/plans that intentionally document an earlier state:

```bash
rg -n "RuntimeId|runtimeId|runtimeIds|runtimeIdsAll|hasRuntime|NodeRuntimeIdContext|data-plite-runtime-id|read\\.runtime\\.(id|path)|runtime\\.(id|path)" \
  packages apps/www/src content .changeset \
  --glob '!**/dist/**' --glob '!apps/www/src/generated/**'
```

Review every residual manually. A non-identity runtime term may remain; an old
identity type, call, DOM attribute, or feature-state noun may not.

Final handoff prepared:
- Ownership and target API/runtime: Plite owns `NodeKey`, root/context lookup,
  targeting, snapshots, commits, and host protocols; Core owns optional
  persisted `ElementIdPlugin`.
- Public breaks and Plate/collaboration adoption: the complete migration table
  covers API, types, DOM/React/browser protocol, feature stores, persisted-ID
  bridge, schema override deletion, docs, and changesets. No bridge survives.
- Applicable browser/benchmark/docs/provenance decisions: browser and docs are
  required; benchmark is conditional on algorithmic change; no public issue/PR
  mutation or new external research is required.
- Proof and execution risks: highest risks are draft key publication,
  root/cross-editor scope, identity-name over-renaming, DOM protocol partial
  adoption, property migration collisions, and declaration depth. Each has a
  focused proof owner.
- Execution result and user attention: all seven slices and P2 review are
  complete. The only live-app caveat is the
  pre-route stale generated registry import recorded above; do not restore the
  deleted manual type mirror or locally regenerate CI-owned registry output.

Timeline:
- 2026-08-08T20:28:49.902Z Plite Plan created.
- 2026-08-08 Requirements, accepted API target, ownership boundary, and
  planning-only constraint captured before broad caller audit.
- 2026-08-08 Live public/kernel/schema/consumer audit completed; final API,
  migration, slices, risks, proof, and handoff locked.
- 2026-08-08 User accepted the plan with `go all`; created a new one-shot
  execution goal and reopened this artifact as the implementation ledger.
- 2026-08-09 Slices 1-6 completed. Root/view semantics and published
  declaration ABI were repaired at their owners; full Plite passed 1432/1432.
- 2026-08-09 Development and strict handoff gates passed, including 698 strict
  Chromium tests. Browser registry/docs routes were attempted and hit the
  known stale CI-generated `plate-types.ts` import before feature code.
- 2026-08-09 P2 review exposed AI stale-path/global-scan/table-reference risks.
  The repair removed path fallback, uses exact node keys and request-local cell
  aliases, and moved undo/redo key revival into Plite's non-serialized change
  slices. Plite 1433/1433, History 130/130, AI 74/74, and focused AI 24/24 pass.
- 2026-08-09 Follow-up review repaired surviving-key collisions, named-root
  `replaceChildren` routing, variable AI output counts, alias reset, and
  persisted table-cell child IDs. Final proof passed History 131/131, AI 77/77,
  focused AI 22/22, affected closure, and strict Chromium 698/6 across 78
  batches. Review converged with no accepted actionable P0-P2 finding.
- 2026-08-09 API reference regeneration/check, hard-cut scan, diff check,
  package-artifact contract, Plate Next resource sync, and final autogoal
  completion checker passed. Goal closed.

Reboot status:
| Question | Answer |
| --- | --- |
| Where am I? | Complete |
| Where am I going? | Hand off the finished hard cut |
| What is the goal? | Ship the accepted `NodeKey`, `editor.key`, and optional persisted element-ID hard cut. |
| What have I learned? | See Findings |
| What have I done? | Implemented all seven slices, repaired every accepted P0-P2 finding, and passed affected plus strict closure; see Timeline and Verification evidence. |

Open risks:
- Live registry/docs rendering remains blocked until CI regenerates the
  intentionally stale registry artifact; strict browser proof is otherwise
  green. Raw physical-device proof remains deliberately deferred because this
  cut makes no device-specific claim.
