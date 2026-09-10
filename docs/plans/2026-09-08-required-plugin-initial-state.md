# Required plugin initial state

Objective:
Reject optional and undefined top-level plugin state fields at the
existing authoring boundary, preserve inference, and adopt the enforced contract.

Goal plan:
docs/plans/2026-09-08-required-plugin-initial-state.md
Template:
docs/plans/templates/task.md
Task source:
User request on 2026-09-08 to prevent optional initial state fields
such as TOC's omitted queryHeading through a type error.
Flow mode:
Local implementation.
Completion threshold:
Negative compile-time cases fail for both constructors
and extension stages; required nullable defaults and partial configuration work;
affected package checks and doctrine verification pass.
Verification surface:
platejs source-first typechecks, existing plugin runtime
tests, typed specs, affected consumers, generated source mirrors and API doctrine.
Constraints:
Preserve callback inference, state resources, and nested domain
optionality. Empty/stateless plugins remain valid. No commit, push or PR.
Boundaries:
Plate plugin authoring types and resulting state declaration fixes;
no broad performance work, substrate change or unrelated cleanup.
Timing:
No deadline.
Blocked condition:
Missing required tool/access after useful local work is exhausted.

Task state:
- current_phase: complete
- next: none
- status: complete

Work Checklist:
- [x] Read Poteto principles and source-ground the store and constructor owners.
- [x] Record user scope and local authority (Task workflow; branch next).
- [x] Name the data shape: complete top-level state record; null means empty.
- [x] Hard-cut counterfactual (Best API): reuse constructors and scoped store;
  no validator API or additional state channel. Retain TOC's documented
  configurable query and initialize it to null.
- [x] Throughput checkpoint (Feature): constructor constraint precedes consumer
  migration; one writer because all steps share type inference owners.
- [x] Prove rejected optional/object/factory/undefined fields and preserved nullable,
  nested, context inference, extension and configuration behavior (Verify Plate).
- [x] Enforce at the shared authoring owner and migrate affected callers (Task).
- [x] Run source-first package types, scoped lint, relevant runtime tests and
  public-consumer declaration proof (Verify Plate and Testing).
- [x] Audit teaching owners; repair Best API source and smallest Vision detail,
  append doctrine version, generate mirrors with pnpm install (Best API repair).
- [x] Run pnpm brl if adding exported-folder files or changing exports (AGENTS).
- [x] Update the append-only decision trail and verify evidence pointers
  (Show Me Your Work); reconcile source checklists before closure (Autogoal).
- [x] Record outcome, proof, limits and completion; check-complete then goal close.

Completion Gates:

| Gate | Applies | Evidence |
| --- | --- | --- |
| Public state contract and inference | Yes, passed | Canonical contract runner passes all 23 negative assertions and positive inference cases. |
| Production and app types | Yes, passed | 79 package tasks and the www source typecheck passed. |
| Runtime behavior | Yes, passed | 19 selected partitions passed: 1701 tests, zero failures or skips. |
| Built declarations | Yes, passed | Public-export consumer compiled with the emitted guard and zero Plate source imports. |
| Lint and barrels | Yes, passed | Scoped Ultracite checks and pnpm brl passed. |
| API doctrine and mirrors | Yes, passed | Doctrine v167 validation and generated mirror parity passed. |
| Browser and registry | No | No visible behavior, route or registry source change; compiler and plugin runtime proof cover this contract. |
| Autoreview | No | next branch; no explicit review or PR request. |
| Maintain Workflow | No | Plate-specific API law; no workflow trigger or routing changed. |
| External research | No | Contract is owned by the inspected local TypeScript source. |
| Publication and release | No | Local implementation authority only. |

Verification evidence:
- `pnpm turbo typecheck --filter=./packages/platejs`: 79/79 tasks passed.
- `pnpm --filter platejs typecheck:contracts`: passed, including 23 negative
  assertions and positive inference/configuration coverage in the new fixture.
- `pnpm exec tsc --noEmit -p apps/www/tsconfig.json --pretty false`: passed
  through the app's package source aliases.
- Existing entrypoint test runners: 19/19 selected partitions passed, 1701 tests,
  zero failures/skips. Indent's expected default object was updated after its
  first run exposed the newly present null field; the original failure is kept.
- `pnpm --filter platejs build`: passed. The same contract fixture passed in a
  NodeNext consumer of built public exports with no source aliases; the loaded
  file inventory includes the emitted private guard and zero Plate source files.
- Scoped `ultracite fix` and `check`: passed for all 33 changed TypeScript files.
- `pnpm brl`: passed; the private helper creates no public barrel export.
- Best API source, Plugin Creator teaching, Vision detail and English/Chinese
  reference prose updated. Doctrine v167 appended; package attestations unchanged.
  `pnpm install`, version validation and mirror parity passed. The generated
  cross-reference resolves to its canonical source.
- Final audit verified 39 source/build/input fingerprints unchanged after the
  final compiler and artifact checks.
- Logs and inventories: docs/plans/artifacts/2026-09-08-required-plugin-initial-state/.
- Decision trail: .audit/required-plugin-initial-state.tsv.
Findings and remaining work:
None within the requested enforcement scope.
The raw flat source contract command hit an existing table inference-depth error;
the canonical declaration-based contract runner passes. The separate broad
legacy spec typecheck reports unrelated mock/API typing errors; it is not claimed
as green. Affected combobox fixture omissions were repaired. Runtime partitions
and the current canonical public contract lane are green.
Final handoff:
Complete locally. Constructors and extension stages reject
optional/undefined top-level state, including factories and callback overload
fallthrough. Concrete defaults, nullable empty values, nested optional domain
properties and partial configuration retain their intended behavior. TOC keeps
its documented configurable query with a null default. No publication occurred.
Open risks:
No unresolved in-scope defect. Enforcement is at the TypeScript
authoring boundary; normal TypeScript escape hatches remain possible.

Final reconciliation:
Task/Autogoal, Best API repair, Poteto Feature, Type System
Discipline, Model the Domain, Verify Plate, Technical Writing and the selected
template obligations are resolved. The change adds no runtime validation owner,
cache, scheduler or public abstraction, so the scale-sensitive probe is N/A.
No workflow trigger or review routing changed, so Agent Native Reviewer and
Maintain Workflow are N/A. Docs changes are reference prose/type text only;
source/link checks apply, with no preview, route or registry changes.
The decision trail and retained command logs were checked against actual actions;
initial failed probes remain preserved and are not reported as passing.
