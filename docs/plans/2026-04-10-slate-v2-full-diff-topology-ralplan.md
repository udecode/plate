---
date: 2026-04-10
topic: slate-v2-full-diff-topology-ralplan
status: active
source_repos:
  - /Users/zbeyens/git/slate-v2
  - /Users/zbeyens/git/plate-2
---

# Slate v2 Full Diff / Topology Ralplan

## Goal

Stop rediscovering the same topology and drift decisions every turn.

This plan is the one durable owner for:

- the remaining fake-owner reexport scan
- the remaining `packages/slate/src/**` topology work
- the remaining keep/revert/justify audit across the live Slate v2 diff
- the maintainer-doc sync rules after each batch

## Scan Summary

### Current diff shape

The live `/Users/zbeyens/git/slate-v2` diff still spans:

- docs API/concepts/walkthrough drift
- `packages/slate/**` source topology and deleted tests
- `packages/slate-react/**` recovered runtime surface plus deleted-family cuts
- `packages/slate-history/**` recovered package surface plus deleted tests
- `packages/slate-dom/**` package residue and deletions
- example/browser drift in `playwright/integration/examples/**` and `site/examples/**`

### Already closed or materially resolved

The roadmap/ledger already treat these as closed:

- `packages/slate/test/**`
- `packages/slate-react/**` deleted-family closure
- `packages/slate-history/**` package closure
- `playwright/integration/examples/**`
- `site/examples/ts/**`
- `site/examples/js/**`

Inside `packages/slate/src/**`, these topology lanes are already materially
fixed:

- `core.ts` dissection
- `transforms-selection/**`
- `transforms-node/**`
- `transforms-text/**`
- `interfaces` foundation slice:
  - `path`
  - `point`
  - `range`
  - `location`
  - `path-ref`
  - `point-ref`
  - `range-ref`
  - `text`
  - `element`
  - `operation`
  - `scrubber`
- `interfaces` heavy slice:
  - `editor`
  - `node`
- `editor/*.ts` public owner restoration

### Remaining fake-owner scan

Fresh scan against `packages/slate/src/**`:

- `0` files under
  [/Users/zbeyens/git/slate-v2/packages/slate/src/editor](/Users/zbeyens/git/slate-v2/packages/slate/src/editor)
  still do `export * from '../editor'`
- `0` heavy interface files still do `export * from '../interfaces'`
- `0` interface barrel files still do aggregate wildcard reexports

## Topology Policy

### Keep

Keep one explicit aggregate surface per domain when it is honest:

- [core.ts](/Users/zbeyens/git/slate-v2/packages/slate/src/core.ts)
- [transforms-selection.ts](/Users/zbeyens/git/slate-v2/packages/slate/src/transforms-selection.ts)
- [transforms-node.ts](/Users/zbeyens/git/slate-v2/packages/slate/src/transforms-node.ts)
- [transforms-text.ts](/Users/zbeyens/git/slate-v2/packages/slate/src/transforms-text.ts)
- [interfaces.ts](/Users/zbeyens/git/slate-v2/packages/slate/src/interfaces.ts)

Rule:

- aggregate surfaces may re-export real owner files
- aggregate surfaces must not secretly own the runtime/namespace body

### Cut

Do not keep fake-owner path files that only point back to the aggregate:

- `editor/*.ts` -> not acceptable
- `interfaces/editor.ts` -> not acceptable
- `interfaces/node.ts` -> not acceptable

### Allow only as explicit low-risk barrels

These can stay only if rewritten as explicit exports, not wildcard wrappers:

- [interfaces/index.ts](/Users/zbeyens/git/slate-v2/packages/slate/src/interfaces/index.ts)
- [interfaces/transforms/general.ts](/Users/zbeyens/git/slate-v2/packages/slate/src/interfaces/transforms/general.ts)
- [interfaces/transforms/index.ts](/Users/zbeyens/git/slate-v2/packages/slate/src/interfaces/transforms/index.ts)
- [interfaces/transforms/node.ts](/Users/zbeyens/git/slate-v2/packages/slate/src/interfaces/transforms/node.ts)
- [interfaces/transforms/selection.ts](/Users/zbeyens/git/slate-v2/packages/slate/src/interfaces/transforms/selection.ts)
- [interfaces/transforms/text.ts](/Users/zbeyens/git/slate-v2/packages/slate/src/interfaces/transforms/text.ts)

## Phase Order

### Phase 1: Finish `interfaces` honestly

Scope:

- [editor.ts](/Users/zbeyens/git/slate-v2/packages/slate/src/interfaces/editor.ts)
- [node.ts](/Users/zbeyens/git/slate-v2/packages/slate/src/interfaces/node.ts)
- [interfaces.ts](/Users/zbeyens/git/slate-v2/packages/slate/src/interfaces.ts)
- [interfaces/index.ts](/Users/zbeyens/git/slate-v2/packages/slate/src/interfaces/index.ts)
- [interfaces/transforms/general.ts](/Users/zbeyens/git/slate-v2/packages/slate/src/interfaces/transforms/general.ts)
- [interfaces/transforms/index.ts](/Users/zbeyens/git/slate-v2/packages/slate/src/interfaces/transforms/index.ts)
- [interfaces/transforms/node.ts](/Users/zbeyens/git/slate-v2/packages/slate/src/interfaces/transforms/node.ts)
- [interfaces/transforms/selection.ts](/Users/zbeyens/git/slate-v2/packages/slate/src/interfaces/transforms/selection.ts)
- [interfaces/transforms/text.ts](/Users/zbeyens/git/slate-v2/packages/slate/src/interfaces/transforms/text.ts)

Target shape:

- `editor.ts` owns the `Editor` interface and editor-adjacent option/entry types
- `node.ts` owns `Node`, `Ancestor`, `NodeEntry`, `NodeMatch`, node option
  types, mutable helpers, and the `Node` namespace
- `interfaces.ts` becomes the honest explicit surface
- `interfaces/index.ts` and `interfaces/transforms/*` become explicit export
  surfaces or get cut if they add no value

Status:

- done

### Phase 2: Dissect `editor.ts` back into method owners

Scope:

- the `56` fake-owner files under
  [/Users/zbeyens/git/slate-v2/packages/slate/src/editor](/Users/zbeyens/git/slate-v2/packages/slate/src/editor)
- [editor.ts](/Users/zbeyens/git/slate-v2/packages/slate/src/editor.ts)

Order inside the lane:

1. query/range/path/point owners
   - `edges`, `start`, `end`, `path`, `point`, `range`, `fragment`, `string`
2. traversal/generator owners
   - `above`, `first`, `last`, `leaf`, `node`, `nodes`, `levels`, `next`,
     `previous`, `parent`
3. predicate/state owners
   - `is-*`, `has-*`, `get-void`, `element-read-only`, `marks`
4. mutation/control owners
   - `add-mark`, `remove-mark`, `insert-*`, `delete-*`, `normalize`,
     `set-normalizing`, `without-normalizing`
5. ref owners
   - `path-ref`, `path-refs`, `point-ref`, `point-refs`, `range-ref`,
     `range-refs`

Target shape:

- public method path = real owner file
- `editor.ts` = explicit aggregate surface only
- shared helper files allowed only when they clearly reduce duplication without
  becoming a second secret omnibus

Status:

- `src/editor/*.ts` public owner files are restored and compiled
- `editor/index.ts` is an explicit barrel now
- remaining cleanup inside `editor.ts` is duplicate inline delegator removal,
  not missing owner restoration

### Phase 3: Reexport cleanup sweep

After phases 1 and 2:

- rerun the wrapper scan
- only these categories may still aggregate:
  - explicit top-level surfaces
  - explicit low-risk barrels
- any remaining `export * from '../editor'` or `export * from '../interfaces'`
  in fake-owner paths gets removed or converted

### Phase 4: Full drift audit outside topology

Scan every remaining modified family and classify each as:

- keep because it is the live current contract
- revert because it is useless drift
- keep as explicit skip because it is deleted residue with no release value

Families to review explicitly:

- docs API/concepts/walkthrough drift
- `packages/slate-dom/**`
- `packages/slate-react/**`
- `packages/slate-history/**`
- `playwright/integration/examples/**`
- `site/examples/ts/**`
- `site/examples/js/**`

Rule:

- if a drift does not strengthen the better-engine direction or current-doc
  truth, revert it
- do not defend junk in `pr-description.md`

### Phase 5: Maintainer-doc sync after each batch

After every completed batch:

- update
  [pr-description.md](/Users/zbeyens/git/plate-2/docs/slate-v2/references/pr-description.md)
  per file or per named family
- update
  [release-file-review-ledger.md](/Users/zbeyens/git/plate-2/docs/slate-v2/release-file-review-ledger.md)
  when disposition or owner truth changed
- update
  [master-roadmap.md](/Users/zbeyens/git/plate-2/docs/slate-v2/master-roadmap.md)
  and
  [overview.md](/Users/zbeyens/git/plate-2/docs/slate-v2/overview.md)
  only when the actual lane status changed

## Verification Policy

### For topology slices

Always run a narrow same-turn compile over:

- touched owner files
- touched aggregate surfaces
- direct callers

Use:

```sh
yarn exec tsc --noEmit --skipLibCheck --target es2022 --module esnext --moduleResolution bundler ...
```

### For broader behavior batches

Escalate from narrow compile to broader package checks when the slice changes
live behavior materially:

- `yarn workspace slate run test`
- other package-specific checks only when that package surface was changed

### For docs-only sweeps

- no fake “done” claim without saying compile/tests were not rerun

## Acceptance Criteria

- no fake-owner `editor/*.ts` wrappers remain
- no fake-owner `interfaces/editor.ts` or `interfaces/node.ts` wrappers remain
- `interfaces.ts`, `core.ts`, `editor.ts`, and `transforms-*.ts` are honest
  aggregate surfaces only
- `pr-description.md` explains surviving drift concretely
- useless drift is reverted instead of justified
- release ledger stays consistent with the live topology
