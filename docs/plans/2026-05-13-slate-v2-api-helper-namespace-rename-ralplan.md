# Slate v2 Api Helper Namespace Rename Ralplan

Date: 2026-05-13

Status: `done`

Owner: `slate-ralplan`

Completion:
`.tmp/019e1c53-3e25-78c0-9083-355925be3817/completion-check.md`

## Current Verdict

Yes: hard rename the public value helper namespaces from merged type/value
names to `*Api` names.

Accepted target:

```ts
import {
  ElementApi,
  NodeApi,
  PathApi,
  PointApi,
  RangeApi,
  TextApi,
  type Element,
  type Node,
  type Path,
  type Point,
  type Range,
  type Text,
} from 'slate'

NodeApi.string(node)
ElementApi.isElement(node)
PathApi.next(path)
RangeApi.edges(range)
```

Do not rename model types just to dodge DOM globals. `type Node`,
`type Element`, `type Text`, `type Path`, `type Point`, `type Range`, and
operation/ref/location types stay as the Slate data model vocabulary.

Do not add public compatibility aliases like `export const Node = NodeApi`.
That would keep the global-shadowing footgun and autocomplete noise alive.

Do not resurrect a public `EditorApi` value. The root `Editor` value is already
cut by the live public-surface contract, and editor reads/writes belong to
`editor.read((state) => ...)` and `editor.update((tx) => ...)`.

Closure verdict: ready for Ralph execution.

## Intent Boundary

| Field | Decision |
| --- | --- |
| Intent | Remove DOM-global naming collisions and type/value namespace ambiguity from the Slate v2 public helper surface. |
| Desired outcome | App code can import model types and helper APIs without shadowing browser globals such as `Node`, `Element`, `Text`, and `Range`. |
| In scope | Public `slate` helper value namespaces, docs/examples/tests import shape, changeset, public surface contracts, issue #5400 accounting after implementation. |
| Non-goals | Renaming model type aliases, adding public compat aliases, changing editor transaction/state API, changing DOM/React host helper policy. |
| Decision boundary | Slate Ralplan may decide the target API and proof gates; `ralph` owns source edits later. |
| User decision needed | None for the target. A later release-policy decision may decide whether this is a major changeset if the package is already published from this branch. |

Pressure test:

- If the only reason were "Plate does it", this would be weak.
- The stronger reason is that Slate v2 is a browser-facing library and the
  current `Node` / `Element` / `Text` / `Range` value imports shadow DOM names
  while also relying on TypeScript declaration merging. That is needless
  friction for humans and agents.

## Live Source Evidence

| Surface | Current owner | Current shape | Verdict |
| --- | --- | --- | --- |
| Root exports | `../slate-v2/packages/slate/src/index.ts:92-103` | The root re-exports interface modules for `element`, `node`, `path`, `point`, `range`, `text`, refs, `operation`, and `scrubber`. | Current root exposes merged helper values through wildcard exports. |
| Node | `../slate-v2/packages/slate/src/interfaces/node.ts:18-20`, `:328-330` | `type Node` and `const Node` share the same public identifier. | Rename value to `NodeApi`; keep type `Node`. |
| Element | `../slate-v2/packages/slate/src/interfaces/element.ts:18`, `:130-132` | `type Element` and `const Element` share the same public identifier. | Rename value to `ElementApi`; keep type `Element`. |
| Text | `../slate-v2/packages/slate/src/interfaces/text.ts:29`, `:119-121` | `type Text` and `const Text` share the same public identifier. | Rename value to `TextApi`; keep type `Text`. |
| Path / Range | `../slate-v2/packages/slate/src/interfaces/path.ts:19`, `:184-186`; `../slate-v2/packages/slate/src/interfaces/range.ts:22`, `:115-117` | `Path` and `Range` also merge type/value helper names. | Rename values to `PathApi` and `RangeApi`; keep types. |
| Location / Span / refs / Scrubber | `../slate-v2/packages/slate/src/interfaces/location.ts:12`, `:42`, `:69`, `:79`; `../slate-v2/packages/slate/src/interfaces/path-ref.ts:9`, `:23`; `../slate-v2/packages/slate/src/interfaces/point-ref.ts:10`, `:24`; `../slate-v2/packages/slate/src/interfaces/range-ref.ts:9`, `:23`; `../slate-v2/packages/slate/src/interfaces/scrubber.ts:1`, `:26` | These also merge public type/interface names with helper/config values. | Rename values to `LocationApi`, `SpanApi`, `PathRefApi`, `PointRefApi`, `RangeRefApi`, and `ScrubberApi`. |
| Public-surface contract | `../slate-v2/packages/slate/test/public-surface-contract.ts:133-147` | The current contract requires root `Element`, `Node`, `Operation`, `Path`, `Point`, `Range`, `Scrubber`, and `Text` values. | Ralph must flip this to `*Api` values and assert old value names are absent. |
| Editor value | `../slate-v2/packages/slate/test/public-surface-contract.ts:288-290` | Public root already asserts `'Editor' in Slate` is false. | Do not add `EditorApi` as a root value. |
| Plate precedent | `../plate/packages/slate/src/interfaces/node.ts:38`, `../plate/packages/slate/src/interfaces/element.ts:20`, `../plate/packages/slate/src/interfaces/path.ts:22` | Plate uses `NodeApi`, `ElementApi`, and `PathApi`. | Steal the naming, not Plate's product layer. |
| Legacy Slate | `../slate/packages/slate/src/interfaces/node.ts:11`, `:242`; `../slate/packages/slate/src/interfaces/element.ts:21`, `:94` | Legacy Slate uses merged type/value namespaces. | This is familiar, but it carries the exact global-shadowing problem. |
| Prior v2 research | `docs/research/decisions/slate-v2-state-tx-public-api-and-extension-namespaces.md:147-154` | Prior research said to keep pure data namespaces as `Node`, `Path`, etc. | Revise: keep pure data helpers, but suffix the value objects with `Api`. |

## Issue Ledger Accounting

ClawSweeper status: completed for Ralph execution. The bounded sweep stayed on
cached local ledgers and the exact #5400 dossier; no broad GitHub issue list
refresh was needed.

| Issue | Cluster | Claim | Why | Proof route | V2 sync ledger | PR line |
| --- | --- | --- | --- | --- | --- | --- |
| #5400 | API, Typing, And Extensibility / v2-api-dx | fixed after Ralph | The issue is specifically a `Node` import namespace conflict. Hard-renaming helper values to `NodeApi` removes the collision at the API level, not only in docs. | public-surface contract, docs/examples import census, package typecheck, downstream import smoke | updated to `fixes-claimed` after source proof | `Fixes #5400: Public helper value namespaces use *Api, so importing Slate helpers no longer shadows DOM globals such as Node.` |

Ledger evidence:

- `docs/slate-issues/gitcrawl-live-open-ledger.md:225` lists current open issue
  #5400.
- `docs/slate-issues/open-issues-dossiers/5402-5250.md:67-77` says the repro is
  a Slate `Node` import shadowing the browser `Node` global.
- `docs/slate-issues/gitcrawl-v2-sync-ledger.md:227` now marks #5400 as
  `fixes-claimed` after source proof.

PR reference status: updated under Core Editor API Reset with the accepted
helper namespace shape and issue #5400 claim text.

## Decision Brief

Principles:

1. Model types keep Slate vocabulary.
2. Runtime/helper value imports must not shadow browser globals by default.
3. No public alias that keeps a removed name alive.
4. No editor-state static namespace revival.
5. Migration must be codemodable and contract-proven.

Top drivers:

- DOM globals: `Node`, `Element`, `Text`, and `Range` are real browser names.
- Agent and human DX: merged type/value names are harder to reason about.
- Plate migration: Plate already proved the `*Api` suffix reads well in a rich
  editor ecosystem.

Viable options:

| Option | Pros | Cons | Verdict |
| --- | --- | --- | --- |
| Keep `Node`, `Element`, `Path`, etc. | Legacy Slate familiarity; least churn. | Preserves #5400 and type/value ambiguity. | reject |
| Add `NodeApi` aliases but keep old values | Easy migration. | Worst of both worlds: two spellings, stale docs, autocomplete noise. | reject |
| Hard rename helper values to `*Api`; keep model types | Clears collisions, matches Plate, keeps Slate model vocabulary. | Public break; many imports change. | choose |
| Rename model types too, e.g. `SlateNode` / `SlateElement` | Clears type namespace collisions. | Overcorrects; hurts Slate-close vocabulary and migration. | reject |
| Add public `EditorApi` value too | Superficially consistent. | Violates the accepted state/tx architecture and revives static editor thinking. | reject |

Chosen consequence:

- `NodeApi.string(node)` is slightly more verbose than `Node.string(node)`, but
  the name says "helper object", not "document node" or "DOM Node".
- Existing Slate snippets need a codemod:
  `s/\b(Node|Element|Text|Path|Point|Range|Operation|Location|Span|PathRef|PointRef|RangeRef|Scrubber)\./$1Api./`
  plus import rewrites.

## Public API Target

Rename every public merged type/value helper object to `*Api`.

Primary public helper values:

| Current value | Target value | Type stays |
| --- | --- | --- |
| `Node` | `NodeApi` | `Node` |
| `Element` | `ElementApi` | `Element` |
| `Text` | `TextApi` | `Text` |
| `Path` | `PathApi` | `Path` |
| `Point` | `PointApi` | `Point` |
| `Range` | `RangeApi` | `Range` |
| `Operation` | `OperationApi` | `Operation` |
| `Location` | `LocationApi` | `Location` |
| `Span` | `SpanApi` | `Span` |
| `PathRef` | `PathRefApi` | `PathRef` |
| `PointRef` | `PointRefApi` | `PointRef` |
| `RangeRef` | `RangeRefApi` | `RangeRef` |
| `Scrubber` | `ScrubberApi` | `Scrubber` |

Closure decisions for previously open names:

- `Scrubber` uses `ScrubberApi`, not top-level function pairs. It is a mutable
  global config helper, but the API-family rule is still clearer than keeping a
  merged type/value name.
- `Location` and `Span` stay public if their source modules remain public, and
  their helper values become `LocationApi` and `SpanApi`.
- `PathRef`, `PointRef`, and `RangeRef` helper values become `PathRefApi`,
  `PointRefApi`, and `RangeRefApi`.

Hard cuts:

- No public `Node`, `Element`, `Text`, `Path`, `Point`, `Range`, `Operation`,
  `Location`, `Span`, `PathRef`, `PointRef`, `RangeRef`, or `Scrubber` value
  exports.
- No temporary alias exports.
- Internal source may use local aliases while migrating a file, but final public
  root and public docs must use `*Api`.

## Internal Runtime Target

- Rename implementation constants at their source modules, not only at the root
  barrel.
- Update internal references to use `NodeApi`, `ElementApi`, etc. when they
  import helper values.
- Keep internal-only `Editor` static table under `slate/internal` until the
  existing Editor hard-cut plan finishes its own migration.
- Avoid changing behavior. This is a naming/API contract pass only.

## Hook / Render DX Target

- Public examples that touch DOM should no longer need aliases like
  `Node as SlateNode` for helper calls.
- Type imports remain explicit:

```ts
import { NodeApi, type Node } from 'slate'
```

- Docs should explain that `*Api` names are helper namespaces and bare type
  names are the document model.

## Plate And Slate-Yjs Migration Backbone

Plate:

- Plate already uses `NodeApi` / `ElementApi` / `PathApi`.
- This rename reduces adapter noise for Plate migration instead of forcing Plate
  to translate raw Slate helper names back into its established public shape.

slate-yjs / collaboration:

- No operation shape, path shape, selection shape, runtime id, snapshot, commit,
  or replay behavior changes.
- Operation helper value becomes `OperationApi`, but the `Operation` type and
  serialized operation records stay unchanged.
- Collaboration proof should be import/type surface only, not behavioral.

## Ecosystem Strategy Synthesis

| System | Source | Mechanism | Avoids | Steal | Reject | Slate target | Verdict |
| --- | --- | --- | --- | --- | --- | --- | --- |
| Plate | `../plate/packages/slate/src/interfaces/node.ts:38`; `../plate/packages/slate/src/interfaces/element.ts:20`; `../plate/packages/slate/src/interfaces/path.ts:22` | Suffix helper value objects with `Api`; keep model types separate. | DOM-global collisions and merged type/value ambiguity. | `*Api` value naming. | Product-layer command/editor APIs. | Hard rename Slate helper values to `*Api`. | agree |
| Legacy Slate | `../slate/packages/slate/src/interfaces/node.ts:11`, `:242`; element/range peers | Merged type/value namespace objects. | Familiar docs shape. | Keep model type names. | Merged helper value names in browser-facing imports. | Keep types, rename values. | partial |
| Slate v2 current plan | `docs/research/decisions/slate-v2-state-tx-public-api-and-extension-namespaces.md:147-154` | Keep pure data namespaces public while cutting `Editor` value. | Static editor sprawl. | Keep pure helper APIs outside editor state. | Bare value names for browser-global collisions. | Pure helpers stay public as `*Api`. | revise |

## Regression Proof Matrix

| Contract | Must prove |
| --- | --- |
| Root public surface | Root exports `NodeApi`, `ElementApi`, `TextApi`, `PathApi`, `PointApi`, `RangeApi`, `OperationApi`, `LocationApi`, `SpanApi`, ref APIs, and `ScrubberApi`. |
| Hard cut | Root does not expose old helper value names; contract must reject `Node`, `Element`, `Text`, `Path`, `Point`, `Range`, `Operation`, `Location`, `Span`, `PathRef`, `PointRef`, `RangeRef`, and `Scrubber` as runtime values. |
| Type compatibility | `import type { Node, Element, Text, Path, Point, Range, Operation } from 'slate'` still works. |
| Runtime behavior | Helper APIs return the same results after rename. |
| Docs/examples | Public docs/examples teach `*Api` imports and do not shadow DOM globals. |
| Downstream smoke | At least one app/example imports `NodeApi` and `type Node` together. |
| Issue #5400 | A focused source/docs contract proves the namespace conflict is gone. |

## Applicable Review Matrix

| Lens | Applicability | Finding | Plan delta |
| --- | --- | --- | --- |
| `tdd` | applied | This is a public API break with clear observable contracts. | Ralph must start with public-surface contract changes before source migration. |
| `high-risk-deliberate-pass` | applied | Broad import churn and package API break. | Add pre-mortem and expanded proof plan. |
| `steelman-pass` | applied | Strong objection is legacy Slate familiarity. | Keep model type names; only helper values get `Api`. |
| `intent-boundary-pass` | applied | Scope needed to exclude type renames and EditorApi revival. | Boundary recorded above. |
| `vercel-react-best-practices` | skipped | No React render/subscription behavior changes. | None. |
| `performance-oracle` | skipped | No runtime algorithm or hot-path behavior change. | None. |
| `performance` | skipped | No latency, memory, or production perf claim. | None. |
| `build-web-apps:shadcn` | skipped | No UI chrome/component composition. | None. |
| `react-useeffect` | skipped | No effects or external system synchronization. | None. |

## High-Risk Deliberate Mode

Trigger: public package API rename across root imports.

Blast radius:

- `../slate-v2/packages/slate/src/interfaces/**`
- `../slate-v2/packages/slate/test/**`
- `../slate-v2/packages/slate-react/**` and `slate-history` imports that read
  helper values
- `../slate-v2/docs/**`, `../slate-v2/site/**`
- changeset and PR reference

Pre-mortem:

1. Half-migration leaves both `Node` and `NodeApi` import spellings alive.
2. Docs update but tests/examples still compile through stale old value exports.
3. Type/value rename accidentally touches serialized operation or node shapes.

Expanded proof plan:

- Unit: helper API behavior contracts for node, element, text, path, point,
  range, operation, location, refs, and scrubber.
- Public surface: root export contract requires `*Api` and rejects old value
  exports.
- Type: public type-only imports still compile.
- Integration: `slate-react` and `slate-history` package typechecks.
- Docs/example: docs and site typecheck with `*Api` imports.
- Migration: codemod or migration note in changeset.

Rollback/hard-cut answer:

- This should be a hard cut, not a dual export. If a downstream package cannot
  migrate in one slice, keep temporary local aliases inside that package only,
  not public root aliases.

## Slate Maintainer Objection Ledger

| Change | Likely objection | Steelman antithesis | Tradeoff tension | Answer | Migration answer | Docs/example answer | Regression proof | Verdict |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| `Node` value -> `NodeApi` | "This breaks every Slate snippet for a naming preference." | Legacy `Node.string` is compact and familiar. | Migration churn is real. | The collision is not cosmetic in browser code; #5400 already reports it, Plate has proven `NodeApi`, and v2 is already making bigger API cuts. | Codemod value imports and member calls; type imports stay stable. | Teach `import { NodeApi, type Node } from 'slate'`. | public-surface contract plus docs/examples import census. | keep |
| Keep `type Node` / `type Element` | "If globals are the problem, type names still collide." | Full `SlateNode` / `SlateElement` naming is clearer in DOM-heavy files. | Type rename would be much larger and less Slate-close. | Model types are Slate vocabulary; value helper imports are the painful part. DOM-heavy files can still locally alias types. | No type migration for normal users. | Mention local aliases only for DOM-heavy type files. | type-only import smoke. | keep |
| No public alias exports | "Aliases would make migration easier." | Dual exports reduce breakage. | Dual names rot docs and autocomplete. | v2 should not publish the footgun it is removing. | Use a codemod and changeset migration note. | No stale alias docs. | root contract rejects old values. | keep |
| Rename `Scrubber` to `ScrubberApi` | "`Scrubber` is not a model helper or DOM-global collision." | Top-level `setScrubber` / `stringify` functions could be clearer. | `ScrubberApi` is a little mechanical. | The issue is the whole merged type/value public pattern. A single exception keeps the pattern alive for little benefit. | Codemod `Scrubber.` to `ScrubberApi.`. | Error/privacy docs show `ScrubberApi.setScrubber`. | root contract plus scrubber contract. | keep |

## Scorecard

| Dimension | Score | Evidence |
| --- | ---: | --- |
| React 19.2 runtime performance | 0.92 | No runtime/render behavior changes; React lens skipped with reason. |
| Slate-close unopinionated DX | 0.92 | Keeps Slate model type names, avoids DOM-global helper imports, and rejects aliases. Exact helper set is live-source grounded. |
| Plate and slate-yjs migration-backbone shape | 0.94 | Plate already uses `*Api`; operation/data shapes stay unchanged for collab; `OperationApi` is import-only churn. |
| Regression-proof testing strategy | 0.93 | Red public-surface contract, type-only import smoke, helper behavior contracts, docs/site typecheck, downstream package typechecks, and `bun check` are named. |
| Research evidence completeness | 0.93 | Live source, Plate, legacy Slate, prior v2 research, exact helper export census, and #5400 ledger are recorded. |
| shadcn-style composability and hook/component minimalism | 0.93 | API is explicit without adding wrappers, options, aliases, or product policy. |

Weighted total: `0.928`.

Status: `done`. The plan is ready for user review and later Ralph execution.

## Pass-State Ledger

| Pass | Status | Evidence added | Plan delta | Open issues | Next owner |
| --- | --- | --- | --- | --- | --- |
| Current-state read and initial score | complete | live Slate v2 interface exports, public-surface contract, Plate `*Api`, legacy Slate, prior v2 research, #5400 ledger | verdict changed from prior "keep pure data namespace names" to "keep pure helpers but suffix value objects with `Api`" | closure pass still needed | slate-ralplan |
| Closure score and final gates | complete | exact helper export census; `Scrubber`, `Location`, `Span`, and ref decisions; #5400 manual sync row; PR reference open-debt row; replayable Ralph gates | score raised to `0.928`; plan ready for review | none | ralph after user approval |
| Ralph execution issue sweep | complete | cached #5400 live-ledger row, dossier summary, test-candidate row, and v2 sync ledger row | no issue-list refresh; keep #5400 at `planned-fix` until source proof passes | implementation still needed | ralph |
| Ralph implementation proof | complete | `NodeApi`/peer source rename, public-surface docs/import census, package typechecks, downstream package typechecks, site typecheck | promoted #5400 to `fixes-claimed`; added changeset | final `bun check` still needed | ralph |

## Implementation Phases For Ralph

1. Start with a red public-surface contract:
   - require `NodeApi`, `ElementApi`, `TextApi`, `PathApi`, `PointApi`,
     `RangeApi`, `OperationApi`, `LocationApi`, `SpanApi`, `PathRefApi`,
     `PointRefApi`, `RangeRefApi`, and `ScrubberApi`;
   - reject old value exports.
2. Rename source constants and internal imports by family.
3. Update package tests that import helper values.
4. Update docs, examples, and site code.
5. Add or update the changeset with migration guidance.
6. Update issue #5400 in `docs/slate-issues/gitcrawl-v2-sync-ledger.md`,
   `docs/slate-v2/ledgers/issue-coverage-matrix.md`, and
   `docs/slate-v2/references/pr-description.md` only after proof passes.
7. Verify from `/Users/zbeyens/git/slate-v2`:

```bash
bun --filter slate test:vitest -- public-surface-contract
bun --filter slate test:vitest -- interfaces-contract
bun --filter slate typecheck
bun --filter slate-react typecheck
bun --filter slate-history typecheck
bun x tsc --project site/tsconfig.json --noEmit
bun lint:fix
bun check
```

## Plan Deltas From Review

- Added accepted target: public helper value objects get `*Api` names.
- Revised prior research: pure data helpers stay public, but bare helper value
  names do not.
- Kept model types unchanged.
- Rejected public aliases.
- Rejected public `EditorApi` value.
- Added #5400 as planned issue claim after implementation proof.
- Closed the open questions: `Scrubber`, `Location`, `Span`, and refs all use
  `*Api` helper values when public.
- Updated `docs/slate-issues/gitcrawl-v2-sync-ledger.md` for #5400 from
  `not-claimed` to `planned-fix`.
- Updated `docs/slate-v2/references/pr-description.md` open debt with the
  accepted helper namespace cut.

## Open Questions

None.

## Final Completion Gates

- Closure pass completed.
- Exact rename set is final, with no `maybe`.
- Issue #5400 proof route and ledger wording are final.
- PR reference owner is final.
- Public-surface, typecheck, docs/example, and downstream smoke gates are named.
- Plan score is `0.928`.
