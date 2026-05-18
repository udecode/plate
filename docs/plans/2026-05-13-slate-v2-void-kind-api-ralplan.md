# Slate v2 Void Kind API Ralplan

## Current Verdict

Score: `0.93`. Status: `implemented; verification green`.

Hard take: cut `boolean` from `EditorElementVoidKind` and do not keep a hidden
runtime shim for `EditorElementSpec.void`. The project is still pre-1.0/beta,
and the current docs/examples already teach explicit string kinds. A shim would
only preserve a vague public habit before it hardens.

Current live source:

```ts
export type EditorElementVoidKind =
  | boolean
  | 'block'
  | 'editable-island'
  | 'inline'
  | 'markable-inline'
```

Source owner:

- `../slate-v2/packages/slate/src/interfaces/editor.ts:386`
- `../slate-v2/packages/slate/src/interfaces/editor.ts:413`
- `../slate-v2/packages/slate/src/create-editor.ts:151`
- `../slate-v2/packages/slate/src/create-editor.ts:209`

Recommended target:

```ts
export type EditorElementVoidKind =
  | 'block'
  | 'editable-island'
  | 'inline'
  | 'markable-inline'

export type EditorElementSpec = {
  type: string
  void?: EditorElementVoidKind
  inline?: boolean
  markableVoid?: boolean
  atom?: boolean
  // existing behavior flags stay explicit
}
```

`void: true` should be cut from the public type. If runtime compatibility is
needed for old oracle tests, keep that as a fixture matcher that maps arbitrary
element data to an explicit string spec. Do not parse `spec.void === true` in
the schema runtime.

## Intent / Boundary

- intent: make Slate v2 element behavior specs obvious to humans and agents.
- desired outcome: app authors choose explicit void presets instead of relying
  on boolean shorthand.
- in scope: public `EditorElementVoidKind`, docs/examples/tests, schema
  contracts, migration notes.
- non-goals: changing document JSON shape, changing `state.schema.isVoid`, or
  adding current-version Plate/slate-yjs adapters.
- decision boundary: Slate Ralplan can decide the target API and proof rows, but
  `ralph` owns any code changes.
- unresolved user-decision point: none. Recommendation is hard cut because this
  is still beta/pre-1.0 and the string API is already the docs/examples shape.

## Decision Brief

Principles:

- absence means not void.
- explicit string means behavior preset.
- composable flags remain flags.
- raw Slate stays unopinionated; Plate may package friendlier presets.
- no public boolean whose meaning changes based on neighboring flags.

Drivers:

- DX: `void: 'block'` is teachable; `void: true` forces users to know defaults.
- correctness: void behavior feeds selection, delete, mark, clipboard, and
  editable-island routing.
- migration: Plate maps `isVoid + isInline + isMarkableVoid` into explicit
  presets cleanly.

Options:

| Option | Verdict | Why |
| --- | --- | --- |
| Keep current union including `boolean` | reject | Smallest migration cost, but public API keeps an ambiguous legacy shorthand. |
| Cut `boolean`, keep four string presets | choose | Explicit, Slate-close, minimal, and already matches current docs/examples. |
| Split into `void?: boolean`, `voidKind?: ...` | reject | More props, worse shadcn-style minimalism, and still teaches boolean voidness. |
| Use fully orthogonal flags only: `void?: true`, `inline`, `markableVoid`, `editableIsland` | reject | Mechanically clean but worse for common mention/image authoring and easier to configure contradictory policy. |

Chosen option: cut public `boolean`, keep four string presets.

Consequences:

- docs/examples use `void: 'block'`, not `void: true`.
- tests that currently use `EditorElementSpec.void: true` become explicit
  `void: 'block'`.
- legacy-oracle tests may keep arbitrary element data such as `void: true` only
  when a test extension `match` maps that fixture marker to `void: 'block'` or
  `void: 'inline'`. That is not the public schema API.
- TypeScript catches vague config.
- existing `inline?: boolean` and `markableVoid?: boolean` remain advanced
  composition, not the primary path.

## Current Source Evidence

- `EditorElementSpec.void` is public and typed from
  `EditorElementVoidKind` at `../slate-v2/packages/slate/src/interfaces/editor.ts:424`.
- `isInlineVoidKind` treats only `'inline'` and `'markable-inline'` as inline
  at `../slate-v2/packages/slate/src/create-editor.ts:151`.
- `isVoidKind` currently accepts every truthy value at
  `../slate-v2/packages/slate/src/create-editor.ts:154`.
- `editable-island` intentionally makes the element void but not atom, proven
  by `../slate-v2/packages/slate/test/schema-contract.ts:177` and
  `../slate-v2/packages/slate/test/schema-contract.ts:204`.
- docs already teach strings, not boolean, in
  `../slate-v2/docs/concepts/08-plugins.md:217` and
  `../slate-v2/docs/libraries/slate-react/editable.md:255`.
- real examples use strings for first-party surfaces:
  `../slate-v2/site/examples/ts/images.tsx:67`,
  `../slate-v2/site/examples/ts/mentions.tsx:187`,
  and `../slate-v2/site/examples/ts/editable-voids.tsx:45`.
- tests still use `void: true` in compatibility-like rows, e.g.
  `../slate-v2/packages/slate/test/transforms-contract.ts:537` and
  `../slate-v2/packages/slate/test/query-contract.ts:126`.
- live re-check found no `void: true` in `../slate-v2/packages/slate/src`,
  `../slate-v2/docs`, or `../slate-v2/site/examples`; remaining hits are in
  package tests and are mostly document-fixture markers consumed by explicit
  `match` specs such as `defineVoidFlag` and `defineInlineVoidFlag` in
  `../slate-v2/packages/slate/test/query-contract.ts:24`.
- `../slate-v2/README.md:42` says Slate is beta and some APIs are not finalized;
  package versions are still `0.x` (`slate@0.124.1`,
  `slate-react@0.124.0`). This is exactly when to remove the public boolean.

## Ecosystem Strategy Synthesis

| System | Source | Mechanism | Avoids | Steal | Reject | Slate target | Verdict |
| --- | --- | --- | --- | --- | --- | --- | --- |
| ProseMirror | `../prosemirror-model/src/schema.ts:390-445` | Orthogonal node spec flags: `inline`, `atom`, `selectable`, `draggable`, `isolating`. | String enums that hide too many independent semantics. | Keep `atom`, `selectable`, and `isolating` as separate Slate flags. | Raw ProseMirror content-expression complexity as Slate authoring syntax. | `void` string presets plus separate advanced flags. | partial |
| Lexical | `../lexical/packages/lexical/src/nodes/LexicalDecoratorNode.ts:23-44` | Decorator nodes expose methods for inline, isolated, and keyboard-selectable policy. | One overloaded property pretending to cover every behavior. | Explicit runtime behavior buckets for embedded UI. | Class subclassing as the raw Slate extension API. | Keep named schema policy and runtime-owned shells. | partial |
| Tiptap | `../tiptap/packages/extension-image/src/image.ts:76-96`; `../tiptap/packages/extension-emoji/src/emoji.ts:97-105` | Extension authors set concise node flags/options that compile to ProseMirror specs. | Making app authors write low-level schema repeatedly. | Nice extension DX over explicit schema flags. | Product-like node presets in raw Slate core. | Plate packages friendly presets; raw Slate exposes explicit behavior presets. | agree |
| Plate | `packages/mention/src/lib/BaseMentionPlugin.ts:34-39`; `packages/media/src/lib/image/BaseImagePlugin.ts:35-39`; `packages/footnote/src/lib/BaseFootnoteReferencePlugin.ts:98-102` | Plugins currently express `isVoid`, `isInline`, and `isMarkableVoid` as separate booleans. | Raw API forcing Plate into custom predicate wrappers. | Deterministic mapping from booleans to `void` string presets. | Current Plate API as raw Slate syntax. | Adapter maps image -> `block`, mention -> `markable-inline`, footnote -> `inline`. | agree |

## Public API Target

Keep:

- `void: 'block'`
- `void: 'inline'`
- `void: 'markable-inline'`
- `void: 'editable-island'`

Cut from public type:

- `void: true`
- `void: false`

Keep as explicit advanced flags:

- `inline?: boolean`
- `markableVoid?: boolean`
- `atom?: boolean`
- `selectable?: boolean`
- `keyboardSelectable?: boolean`
- `readOnly?: boolean`
- `isolating?: boolean`

No public alias like `voidKind`. The key `void` is already Slate-close and
short. Adding a second name is API noise.

## Internal Runtime Target

Hard cut. The runtime should not normalize `spec.void === true`.

```ts
const isVoidKind = (kind: EditorElementSpec['void']) =>
  kind === 'block' ||
  kind === 'editable-island' ||
  kind === 'inline' ||
  kind === 'markable-inline'
```

No dev warning, no compatibility parser, no exported boolean. JavaScript
callers passing `void: true` are outside the typed contract and should not get a
special path before 1.0. If a legacy oracle test wants a boolean marker in node
data, it should use a matcher extension that maps the marker into an explicit
string spec.

## Hook / Component / Render DX Target

Void kind should stay schema-level, not renderer-level:

- renderers should not decide whether an element is void.
- `renderVoid` remains content-only.
- editable islands stay a schema policy plus browser proof family, not a React
  component convention.

## Plate Migration Backbone

Mapping:

| Plate node config | Slate v2 spec |
| --- | --- |
| `isVoid: true` only | `void: 'block'` |
| `isVoid: true`, `isInline: true` | `void: 'inline'` |
| `isVoid: true`, `isInline: true`, `isMarkableVoid: true` | `void: 'markable-inline'` |
| editable nested widget | `void: 'editable-island'` |

Plate can keep its existing product-level booleans. Raw Slate should not.

## slate-yjs Migration Backbone

The change is schema/config-only. Document JSON still has `type` and `children`;
voidness stays derived from shared schema policy. Collab risk is schema mismatch
between peers, not operation shape.

Required proof before implementation closure:

- both peers with same schema classify void kinds identically;
- remote operations do not encode `void` kind into document nodes;
- migration docs say schema must be shared by collaborators.

## Issue Ledger Accounting

ClawSweeper status: reused existing ledgers; no broad GitHub discovery.

Reason: this plan changes public API shape but makes no new issue-fix claim.
Void-related ledgers and dossier sections already cover the touched issue
families. This pass cites those existing rows and leaves PR/fixed counts
unchanged.

Touched issue families to cite, not auto-close:

| Issue | Cluster | Claim | Why | Proof route | V2 sync ledger | PR line |
| --- | --- | --- | --- | --- | --- | --- |
| #3991 | inline-void-and-void-selection | Related | Explicit `block` kind preserves block void delete semantics; no new fix claim. | `../slate-v2/playwright/integration/examples/images.test.ts` | existing fixed row | unchanged |
| #4301 | inline-void-and-void-selection | Related | Explicit `block` kind preserves selected block void Enter semantics; no new fix claim. | `../slate-v2/playwright/integration/examples/images.test.ts` | existing fixed row | unchanged |
| #4802 | clipboard-html-fragment-serialization | Related | Explicit inline kind helps clipboard policy stay clear; no exact inter-editor proof. | `../slate-v2/packages/slate-dom/test/clipboard-boundary.ts` | existing improves row | unchanged |
| #4806 | clipboard-html-fragment-serialization | Related | Same inline-void clipboard family; no new closure. | `../slate-v2/packages/slate-dom/test/clipboard-boundary.ts` | existing improves row | unchanged |
| #5183 | android-inline-void-keyboard | Related | `inline` and `markable-inline` must keep mobile proof family; no Android device proof in this pass. | `../slate-v2/packages/slate-browser/test/core/scenario.test.ts` | existing related row | unchanged |
| #5391 | android-inline-void-keyboard | Related | iOS inline void selection remains device-proof owner. | `../slate-v2/packages/slate-browser/test/core/scenario.test.ts` | existing related row | unchanged |
| #3482 | void-element-contract-and-data-model-shape | Related | API removes boolean ambiguity but does not remove required empty children. | data-model/schema proof | existing roadmap row | unchanged |

PR reference: updated by the `ralph` implementation pass. No fixed issue count
changes.

## Legacy Regression Proof Matrix

Required before implementation closure:

| Contract | Command owner |
| --- | --- |
| schema rejects/does not expose public boolean void kind | `../slate-v2/packages/slate/type-tests` or package typecheck |
| `void: 'block'` preserves `isVoid=true`, `isInline=false`, `atom=true` | `../slate-v2/packages/slate/test/schema-contract.ts` |
| `void: 'inline'` preserves inline void behavior | `../slate-v2/packages/slate/test/query-contract.ts` |
| `void: 'markable-inline'` preserves add/remove mark behavior | `../slate-v2/packages/slate/test/snapshot-contract.ts` |
| `void: 'editable-island'` preserves non-atom editable child policy | `../slate-v2/packages/slate/test/schema-contract.ts` plus editable-void browser row |
| public source/docs/examples do not use `void: true` | `rg "void:\\s*true" ../slate-v2/packages/slate/src ../slate-v2/docs ../slate-v2/site/examples` |
| package tests use `void: true` only as fixture data, not `EditorElementSpec.void` | review `../slate-v2/packages/slate/test/query-contract.ts:24` and matching rows |

## Applicable Implementation-Skill Review Matrix

| Lens | Applicability | Finding | Plan delta |
| --- | --- | --- | --- |
| Vercel React | skipped | No React subscription or render loop changed by this API-only review. | none |
| performance-oracle | applied | Public `void` kind feeds hot selection/delete/clipboard predicates; avoid runtime branching on vague boolean in authored specs. | hard cut boolean at schema registration; no hidden shim. |
| performance | skipped | No benchmark claim in this pass. | none |
| tdd | applied | API hard cut needs type-level and behavior-level tests before implementation. | add proof matrix. |
| shadcn | applied | Minimal prop API wins: one `void` string preset beats split `voidKind` or object shape. | reject `voidKind` / object shape. |
| react-useeffect | skipped | No effects. | none |

## High-Risk Deliberate Mode

Trigger: public API and schema behavior surface.

Pre-mortem:

1. A hidden shim lets `void: true` JS configs silently keep working while TS
   says no, causing docs confusion.
2. Cutting boolean without updating legacy tests loses coverage for block void
   default semantics.
3. Plate adapter maps every `isVoid` to `block` and accidentally loses inline
   voids.

Proof plan:

- type-level public-surface test for no boolean in `EditorElementVoidKind`;
- schema tests for every string kind;
- source/docs/examples grep proving no public `void: true`;
- targeted review that remaining package-test `void: true` is fixture data
  routed through explicit `match` specs, not `EditorElementSpec.void`;
- Plate mapping note in docs or migration plan;
- browser rows for image, mention, editable-void examples;
- no runtime compatibility parser for `spec.void === true`.

Verdict: keep. The target is ready for execution only with a hard cut.

## Maintainer Objection Ledger

| Change | Objection | Steelman | Tradeoff | Rejected alternative | Migration answer | Proof | Verdict |
| --- | --- | --- | --- | --- | --- | --- | --- |
| Cut `boolean` from `EditorElementVoidKind` | "`void: true` is the obvious Slate shorthand." | The shorthand is familiar and easy for tiny demos. | More explicit config for simple block voids. | Keep boolean forever or hide a runtime shim. Both preserve ambiguity and let docs drift. | Use `void: 'block'`; this is pre-1.0/beta, so no shim. Legacy test fixtures may map arbitrary node data to explicit string specs. | typecheck, schema contracts, docs/source grep, fixture review. | keep |
| Keep `markable-inline` as preset | "Markability is not a void kind." | Orthogonal flags are cleaner in theory. | Preset duplicates `markableVoid?: true`. | Force `void: 'inline', markableVoid: true`. That is noisier for the canonical mention case. | Advanced users can still set explicit flags; docs lead with preset. | markable void snapshot tests. | keep |
| Keep `editable-island` under `void` | "`void: 'editable-island'` sounds contradictory." | It is weird: void but editable. | Name needs docs. | Use separate `editableIsland: true`. More public props and easier contradictions. | Explain as void shell/render policy with cursor projection into children. | editable-void browser family. | keep |

## Pass Schedule / State Ledger

| Pass | Status | Evidence added | Plan delta | Open issues | Next owner |
| --- | --- | --- | --- | --- | --- |
| Current-state read and initial score | complete | live Slate v2 source/tests/docs, Plate source, ProseMirror/Lexical/Tiptap source reads | initial verdict: cut public boolean, keep four string presets | none | done |
| Related issue discovery | complete | existing void issue ledgers and live generated rows reused | no new issue claims | none | done |
| Issue-ledger pass | complete | touched issue families listed, no fixed count changes | ledger writes deferred until implementation claims API shape | none | done |
| Intent/boundary and decision brief | complete | hard-cut decision recorded; no shim | open decision closed | none | done |
| Research/ecosystem refresh | complete | source rows present; string preset strategy kept | no new research gap | none | done |
| Objection/high-risk revision | complete | objection ledger revised against hidden-shim alternative | final verdict hard cut | none | done |
| Closure score | complete | score raised to 0.93 | ready for user review before `ralph` | none | ralph implementation |
| Ralph implementation | complete | Slate v2 type/runtime/test hard cut, PR reference update, full `bun check` | boolean cut implemented; stale slate-react force-render audit inventory corrected | none | done |

## Plan Deltas From Review

- added target to cut `boolean` from exported `EditorElementVoidKind`.
- kept all four existing string presets.
- rejected `voidKind` and object-shaped alternatives.
- added migration mapping for Plate booleans.
- added no-claim issue accounting for void-related issue families.
- closed the hard-cut vs hidden-shim decision: hard cut, no runtime shim.
- narrowed the implementation grep gate so legacy-oracle document fixture
  markers are reviewed, not blindly deleted.
- implemented the hard cut in `../slate-v2/packages/slate/src/interfaces/editor.ts`
  and `../slate-v2/packages/slate/src/create-editor.ts`.
- wired `../slate-v2/packages/slate/test/public-element-void-kind-contract.ts`
  into the `slate` package typecheck gate.
- added a schema contract proving `spec.void === true` is not normalized as a
  void kind.
- updated `docs/slate-v2/references/pr-description.md` with the accepted
  string-only void-kind shape.

## Ralph Implementation Result

Changed in `../slate-v2`:

- `EditorElementVoidKind` is now string-only.
- Runtime `isVoidKind` recognizes only `block`, `editable-island`, `inline`,
  and `markable-inline`.
- `slate` package typecheck now runs `test/tsconfig.generic-types.json`.
- `public-element-void-kind-contract.ts` rejects boolean void kinds from the
  package root public type surface.
- `schema-contract.ts` proves a casted `void: true` schema spec is not treated
  as void.
- `kernel-authority-audit-contract.ts` count for
  `keyboard-input-strategy.ts` was corrected from `5` to `1` after `bun check`
  exposed stale force-render inventory.

Verification:

- Red: `bun --filter slate typecheck` failed on the new public void-kind
  contract while `boolean` was still assignable.
- Green: `bun --filter slate typecheck`.
- Green: `bun test ./packages/slate/test/schema-contract.ts ./packages/slate/test/query-contract.ts ./packages/slate/test/snapshot-contract.ts --bail 1`
  with `289 pass`.
- Green: `rg "void:\\s*true" site docs packages/slate/src` returned no public
  source/docs/example hits.
- Reviewed remaining `void: true` hits in tests as fixture node data mapped by
  explicit `match` specs, plus the negative runtime contract.
- Green: Chromium Playwright rows for `editable-voids`, `images`, and
  `mentions` with `38 passed`.
- Green: `bun check`.

## Open Questions

None. Hard cut `EditorElementSpec.void: true`; do not keep a hidden runtime
shim.

## Implementation Phases

1. Cut public boolean from `EditorElementVoidKind`.
2. Replace any `EditorElementSpec.void: true` test/source usage with explicit
   string kinds. Do not blindly remove document-fixture markers that are mapped
   by `match` to explicit string specs.
3. Tighten `isVoidKind` so it only sees the string/undefined public type; do
   not add a boolean compatibility branch.
4. Add type-level no-boolean test.
5. Re-run schema/query/snapshot and example browser rows.
6. Update PR reference after implementation changes accepted API shape.

## Fast Driver Gates

From `../slate-v2`:

```bash
bun --filter slate typecheck
bun test ./packages/slate/test/schema-contract.ts ./packages/slate/test/query-contract.ts ./packages/slate/test/snapshot-contract.ts --bail 1
rg "void:\\s*true" site docs packages/slate/src
rg "void:\\s*true" packages/slate/test packages/slate-react/test packages/slate-dom/test
```

From `plate-2`:

```bash
bun run completion-check
```

## Completion Gates

- no public `boolean` in `EditorElementVoidKind`;
- no runtime parser or dev warning for `spec.void === true`;
- docs/examples teach only string presets;
- all current `EditorElementSpec.void: true` tests become explicit string
  specs; remaining `void: true` package-test hits must be documented as
  arbitrary fixture data matched by explicit string specs, or renamed if that is
  simpler;
- issue ledgers unchanged unless implementation claims new behavior;
- PR reference updated only if accepted API shape changes.

## Closure Score

| Dimension | Score | Evidence |
| --- | ---: | --- |
| React 19.2 runtime performance | 0.92 | Hard cut removes runtime shim branching from schema behavior; React layer unaffected. |
| Slate-close unopinionated DX | 0.95 | `void: 'block'` is explicit while keeping the Slate-close `void` key; no extra `voidKind` prop. |
| Plate and slate-yjs migration backbone | 0.90 | Plate booleans map deterministically to string presets; slate-yjs stays schema-derived and document JSON unchanged. |
| Regression-proof testing strategy | 0.92 | Type-level no-boolean contract, schema/query/snapshot rows, public source/docs grep, and browser rows are named. |
| Research evidence completeness | 0.90 | ProseMirror/Lexical/Tiptap/Plate strategies are synthesized into a concrete hard-cut target. |
| shadcn-style composability and minimalism | 0.95 | One public string preset union beats boolean shorthand, `voidKind`, or object-shaped config. |

Weighted score: `0.93`.

## Final User-Review Handoff

- Public API: cut `boolean` from `EditorElementVoidKind`; absence means
  non-void, `void: 'block'` means block void.
- Runtime: no hidden shim for `spec.void === true`; `isVoidKind` should operate
  on string/undefined only.
- Presets: keep `block`, `inline`, `markable-inline`, and `editable-island`.
- Advanced flags: keep `inline`, `markableVoid`, `atom`, `selectable`,
  `keyboardSelectable`, `readOnly`, and `isolating` as explicit composition.
- Tests: convert spec-level boolean usage to strings; preserve or rename
  legacy-oracle document markers only when `match` maps them to explicit specs.
- Docs/examples: keep teaching string kinds only.
- Issue accounting: no new `Fixes` claims; existing void/inline-void issue rows
  remain the proof family.
- Next owner: `ralph` implementation in `../slate-v2`.
