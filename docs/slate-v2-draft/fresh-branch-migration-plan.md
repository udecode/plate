---
date: 2026-04-16
topic: slate-v2-fresh-branch-migration-plan
status: active
---

# Slate v2 Fresh-Branch Migration Plan

## Purpose

Canonical execution plan for migrating the draft `slate-v2` rewrite into the
fresh `../slate-v2` clone without reopening broad accidental drift.

This plan treats:

- `../slate-v2` as the live target
- `../slate-v2-draft` as the evidence/value bank
- `docs/slate-v2/**` as the final-state spec stack
- `docs/slate-v2-draft/**` as the archive lane

## Authority

Use this with:

- [deep-interview-slate-v2-fresh-branch-migration-reset.md](/Users/zbeyens/git/plate-2/.omx/specs/deep-interview-slate-v2-fresh-branch-migration-reset.md)
- [pr-description.md](/Users/zbeyens/git/plate-2/docs/slate-v2/references/pr-description.md)
- [2026-04-07-slate-v2-doc-stack-should-separate-live-replacement-truth-from-historical-phase-docs.md](/Users/zbeyens/git/plate-2/docs/solutions/documentation-gaps/2026-04-07-slate-v2-doc-stack-should-separate-live-replacement-truth-from-historical-phase-docs.md)
- [2026-04-12-package-type-publishing-should-sync-lib-declarations-into-dist-in-one-build-step.md](/Users/zbeyens/git/plate-2/docs/solutions/developer-experience/2026-04-12-package-type-publishing-should-sync-lib-declarations-into-dist-in-one-build-step.md)
- [2026-04-09-slate-workspace-packages-should-have-live-root-source-entries-under-pnp.md](/Users/zbeyens/git/plate-2/docs/solutions/developer-experience/2026-04-09-slate-workspace-packages-should-have-live-root-source-entries-under-pnp.md)
- [2026-04-07-slate-v2-react-19-2-cleanup-should-remove-forwardref-not-selection-layout-effects.md](/Users/zbeyens/git/plate-2/docs/solutions/developer-experience/2026-04-07-slate-v2-react-19-2-cleanup-should-remove-forwardref-not-selection-layout-effects.md)

## Core Rules

1. `repair-drift` still governs same-path source and API recovery.
2. Legacy truth is the default for same-path source, types, examples, and docs.
3. Draft-only value is allowed when it is:
   - genuinely useful to the new engine, and
   - non-conflicting in the active tranche.
4. Drift survives only when it is engine-forced or clear current value.
5. Any other drift proposal is recorded as `post RC`.
6. Every draft file gets an explicit disposition. No silent loss.
7. Review stops happen:
   - after each tranche, before package work starts
   - after each package inside an approved tranche

## File Disposition Model

Every file touched by the fresh-vs-draft delta must land in one of these
states:

- `recovered`: close legacy port with only forced current-runtime changes
- `extended`: source-close plus intentional current-only value
- `mixed`: source-close, but proof or ownership still incomplete
- `open`: rewrite-heavy and not yet acceptable
- `post RC`: real value exists, but landing it now would introduce non-engine
  drift or cross the active tranche boundary
- `cut`: no justified value survives

## Package Order

Default package order follows dependency and public-surface risk:

1. `slate`
2. `slate-history`
3. `slate-hyperscript`
4. `slate-dom`
5. `slate-react`

Early low-conflict adoption lane:

- `slate-browser`

Rationale:

- `slate` is the contract root
- `slate-history` and `slate-hyperscript` depend on `slate` but do not own the
  browser/runtime envelope
- `slate-dom` sits between core and React
- `slate-react` carries the largest caller-visible browser/input surface
- `slate-browser` is additive and should land as soon as the root toolchain can
  absorb it without forcing engine drift

## Standard Workflow

### Tranche Workflow

1. Build the exact fresh-vs-draft file inventory for the tranche.
2. Classify each file before editing.
3. Recover root/source/API truth before tests, examples, or docs that depend on
   it.
4. Carry forward non-conflicting draft value.
5. Mark all remaining non-engine drift as `post RC`.
6. Update the docs/spec stack and file ledger in the same tranche.
7. Stop for review before package work begins or before the next tranche opens.

### Package Workflow

For each package:

1. diff the package file set between `../slate-v2` and `../slate-v2-draft`
2. recover same-path package source and exported contracts first
3. recover or adopt tests only after the package source is honest
4. recover or adopt examples/benchmarks only when their owning package contract
   already exists
5. update docs/ledgers for that package
6. stop for review

## Docs Ownership Map

`docs/slate-v2/**` is the final-state spec lane. It is allowed to lead code.

The stack should stay explicit about ownership:

- `overview.md`
  - front door
- `master-roadmap.md`
  - tranche order and package sequence
- `release-readiness-decision.md`
  - RC/readiness claim
- `release-file-review-ledger.md`
  - per-file migration truth
- `true-slate-rc-proof-ledger.md`
  - proof status
- `replacement-gates-scoreboard.md`
  - gate package status
- `references/pr-description.md`
  - maintainer-facing drift justification
- `references/*`
  - architecture and ownership references
- `ledgers/*`
  - package/API/test/example inventories
- `commands/*`
  - operator entrypoints

`docs/slate-v2-draft/**` holds prior plan/spec material that should remain
available for lossless migration review but should not compete with the live
spec stack.

## Tranche 1: Root, Tooling, Docs

### Goal

Port the non-`src` root/package/site/doc machinery from the draft lane into the
fresh clone and establish the final-state spec stack.

### Scope

Root/toolchain files:

- `../slate-v2/.gitignore`
- `../slate-v2/.npmrc`
- `../slate-v2/.yarnrc.yml`
- `../slate-v2/package.json`
- `../slate-v2/pnpm-workspace.yaml`
- `../slate-v2/turbo.json`
- `../slate-v2/tsconfig.json`
- `../slate-v2/biome.jsonc`
- `../slate-v2/eslint.config.mjs`
- `../slate-v2/config/babel/register.cjs`
- `../slate-v2/config/rollup/rollup.config.js`
- `../slate-v2/.github/workflows/ci.yml`
- `../slate-v2/.github/workflows/comment.yml`
- `../slate-v2/.github/workflows/release.yml`
- `../slate-v2/README.md`
- `../slate-v2/Readme.md`
- `../slate-v2/docs/general/contributing.md`

Site/config files required by the root graph:

- `../slate-v2/site/next.config.js`
- `../slate-v2/site/next-env.d.ts`
- `../slate-v2/site/pages/api/index.ts`

Package manifest/script layer:

- `../slate-v2/packages/slate/package.json`
- `../slate-v2/packages/slate-history/package.json`
- `../slate-v2/packages/slate-hyperscript/package.json`
- `../slate-v2/packages/slate-dom/package.json`
- `../slate-v2/packages/slate-react/package.json`

Repo docs reset:

- `docs/slate-v2/**/*`
- `docs/slate-v2-draft/**/*`

### Rules

- no `src` behavior changes
- linter-only fallout is acceptable
- use the tooling drift group in
  [pr-description.md](/Users/zbeyens/git/plate-2/docs/slate-v2/references/pr-description.md)
  as the seed justification set
- recreate the full long-term docs/spec stack, not a placeholder set

### Required Docs Output

The tranche should leave these doc families alive and rewritten for the new
program:

- `docs/slate-v2/overview.md`
- `docs/slate-v2/master-roadmap.md`
- `docs/slate-v2/release-readiness-decision.md`
- `docs/slate-v2/release-file-review-ledger.md`
- `docs/slate-v2/true-slate-rc-proof-ledger.md`
- `docs/slate-v2/replacement-gates-scoreboard.md`
- `docs/slate-v2/references/*.md`
- `docs/slate-v2/ledgers/*.md`
- `docs/slate-v2/commands/*.md`

### Exit

- the fresh root command graph runs on the modern package manager/tooling stack
- docs ownership is clear
- archived docs are moved aside into `docs/slate-v2-draft/**`
- no `src` semantic drift has landed
- package manifests are ready for tranche 2

### Review Packet

- root/tooling diff summary
- doc ownership map
- remaining `post RC` rows opened by tranche 1

## Tranche 2: React 19.2 And Low-Risk Compatibility

### Goal

Land the React 19.2 and compatibility baseline before any engine rewrite.

### Scope

Root/site compatibility surfaces:

- `../slate-v2/package.json`
- `../slate-v2/site/**/*`

Primary package surfaces:

- `../slate-v2/packages/slate-react/package.json`
- `../slate-v2/packages/slate-react/src/**/*`
- `../slate-v2/packages/slate-react/test/**/*`
- `../slate-v2/packages/slate-dom/package.json`
- `../slate-v2/packages/slate-dom/src/**/*`
- `../slate-v2/packages/slate-dom/test/**/*`

Optional early-adopt lane:

- `../slate-v2/packages/slate-browser/**/*`
  from `../slate-v2-draft/packages/slate-browser/**/*`

Forced spillover only if needed by compatibility:

- `../slate-v2/packages/slate/package.json`
- `../slate-v2/packages/slate-history/package.json`
- `../slate-v2/packages/slate-hyperscript/package.json`

### Rules

- allow only forced, behavior-preserving source edits
- remove React 18 compatibility scaffolding that no longer earns its keep
- keep layout/effect/memo seams that still protect correctness or measured
  performance
- do not start engine semantics work here

### Package Order

1. root/site compatibility surface
2. `slate-browser` if it lands cleanly without forcing engine-package drift
3. `slate-react`
4. `slate-dom`
5. spillover manifest/type fallout in the remaining packages only if forced

### Exit

- React 19.2 is the live root and package baseline
- `forwardRef`/ref-compat scaffolding that is pure compatibility debt is gone
- no semantic behavior changes are mixed into the tranche
- additive `slate-browser` work is either landed cleanly or parked with owned
  follow-up rows

### Review Packet

- React 19.2 compatibility diff summary
- list of source files touched under the low-risk rule
- explicit list of anything deferred to engine tranches

## Tranche 3: Core Engine Package `slate`

### Goal

Recover the core engine contract in `slate` and only then widen into dependent
packages.

### Scope

- `../slate-v2/packages/slate/src/**/*`
- `../slate-v2/packages/slate/test/**/*`
- `../slate-v2/packages/slate/type-tests/custom-types/**/*`
- `docs/slate-v2/ledgers/slate-editor-api.md`
- `docs/slate-v2/ledgers/slate-interfaces-api.md`
- `docs/slate-v2/ledgers/slate-transforms-api.md`

### Rules

- recover exported contracts before fixing consumers
- recover missing type/declaration surfaces before example patches
- adopt added-value tests only when they strengthen the new engine without
  hiding core contract drift

### Exit

- `slate` source reads like an honest same-path or engine-justified port
- type tests and package tests are aligned with the recovered contract
- dependent package fallout is identified, not patched blindly

### Review Packet

- `slate` file ledger
- contract drift summary
- carry-forward list of adopted draft-only tests/value

## Tranche 4: Support Packages `slate-history` And `slate-hyperscript`

### Goal

Recover the support packages that depend on `slate` but do not own the full DOM
or React runtime.

### Scope

- `../slate-v2/packages/slate-history/src/**/*`
- `../slate-v2/packages/slate-history/test/**/*`
- `../slate-v2/packages/slate-history/package.json`
- `../slate-v2/packages/slate-hyperscript/src/**/*`
- `../slate-v2/packages/slate-hyperscript/test/**/*`
- `../slate-v2/packages/slate-hyperscript/package.json`
- `docs/slate-v2/ledgers/slate-history-api.md`

### Package Order

1. `slate-history`
2. `slate-hyperscript`

### Exit

- both packages match the recovered core contract
- no DOM/React-runtime drift is solved here with package-local hacks

### Review Packet

- per-package file ledger
- test adoption summary

## Tranche 5: DOM Runtime `slate-dom`

### Goal

Recover the DOM bridge as the runtime owner between core Slate and React.

### Scope

- `../slate-v2/packages/slate-dom/src/**/*`
- `../slate-v2/packages/slate-dom/test/**/*`
- `../slate-v2/packages/slate-dom/package.json`
- `docs/slate-v2/ledgers/slate-react-api.md`
- DOM-related examples and proof rows under:
  - `../slate-v2/site/examples/**/*`
  - `../slate-v2/site/pages/examples/**/*`

### Rules

- recover DOM transport/selection/clipboard ownership before React wrappers
- if a branch was rewritten internally, prove the replacement owner before
  accepting the drift
- only land example or proof files whose owning package seams are already live

### Exit

- DOM/runtime ownership is explicit
- draft-only DOM tests/examples adopted here are classified file by file
- React tranche has a stable DOM base

### Review Packet

- DOM ownership summary
- adopted example/proof file list

## Tranche 6: React Runtime `slate-react`

### Goal

Recover the React runtime last, once core and DOM ownership are already settled.

### Scope

- `../slate-v2/packages/slate-react/src/**/*`
- `../slate-v2/packages/slate-react/test/**/*`
- `../slate-v2/packages/slate-react/package.json`
- `../slate-v2/site/components/**/*`
- `../slate-v2/site/examples/**/*`
- `../slate-v2/site/pages/examples/**/*`
- browser/input proof surfaces and matching docs ledgers

### Rules

- same-path public behavior wins over runtime style preferences
- React 19.2 patterns are allowed only when they preserve the recovered
  behavior contract
- browser/input proof cannot close source drift by itself

### Exit

- the React package reads like an honest same-path or engine-justified port
- browser/input behavior is tied back to package/source truth
- remaining divergences are narrow and explicitly classified

### Review Packet

- `slate-react` file ledger
- browser/input proof summary
- remaining `post RC` rows

## Tranche 7: Examples, Benchmarks, Added-Value Closure

### Goal

Adopt the remaining non-conflicting draft value once the owning package seams
already exist.

### Scope

- `../slate-v2-draft/site/examples/**/*`
- `../slate-v2-draft/site/components/**/*`
- `../slate-v2-draft/site/pages/examples/**/*`
- benchmark surfaces under the draft site and package tests
- any remaining `slate-browser` proof/test files not already landed

### Rules

- examples/benchmarks follow owning package truth
- if a value-add file still needs non-engine drift, keep it `post RC`
- no tranche here is allowed to reopen package contract repair

### Exit

- non-conflicting added-value assets are landed
- remaining value is explicitly parked, not forgotten

### Review Packet

- examples/benchmarks adoption summary
- final value-add carry-forward list

## Tranche 8: RC Ledger And Closure Pass

### Goal

Close the program with honest ledgers, proof, and explicit `post RC` leftovers.

### Scope

- `docs/slate-v2/release-readiness-decision.md`
- `docs/slate-v2/release-file-review-ledger.md`
- `docs/slate-v2/true-slate-rc-proof-ledger.md`
- `docs/slate-v2/replacement-gates-scoreboard.md`
- `docs/slate-v2/references/pr-description.md`

### Exit

- no unresolved broad buckets remain
- every surviving drift has a named justification
- every deferred item is explicitly `post RC`

## Expected Early Deliverables

The plan assumes these artifacts get created or rewritten early:

- this plan
- a per-file migration ledger under `docs/slate-v2/ledgers/**`
- doc ownership pages under `docs/slate-v2/**`
- updated maintainer drift justification in
  [pr-description.md](/Users/zbeyens/git/plate-2/docs/slate-v2/references/pr-description.md)

## Risks To Watch

- lossless migration collapsing back into indiscriminate bulk carry-forward
- tranche 2 hiding semantic runtime work under React compatibility language
- docs leading code without explicit ownership, creating competing truth again
- `slate-browser` or example adoption blocking on package seams they do not own
- test adoption being used to excuse unrecovered source drift

## Success Condition

The migration is on track when:

- the fresh repo absorbs the modern root/toolchain/docs layer cleanly
- React 19.2 compatibility lands without semantic drift
- package recovery proceeds in the declared order
- every file from the draft lane has an explicit outcome
- `post RC` means a named deferred row, not a trash can
