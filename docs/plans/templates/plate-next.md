# {{TITLE}}

Objective:
TODO: Write the short Plate Next objective, under 240 characters.

Goal plan:
{{PLAN_PATH}}

Template:
{{TEMPLATE_PATH}}

Primary template:
{{TEMPLATE_PATH}}

Applied packs:
- none

Plate Next source:
- prompt / link: pending
- mode: pending
- target surface: pending
- review target: best Plate v2 migration on top of Plite, not legacy
  compatibility
- broad Core sweep: pending
- correction-triggered related scoped sweep: pending
- package review mode: pending
- package review target: pending
- package file checklist gate: pending
- completion threshold summary: pending

First checkpoint:
- Copy every explicit prompt requirement into this plan before implementation:
  target, duration, non-goals, stop condition, proof commands, final handoff,
  and whether the user asked for `sweep`, `all core`, `full-loop`, or an
  equivalent broad Core review.
- If broad Core sweep is in scope, fill the Core drift ledger rows in this
  plan before closing any packet. Keep this template-only.
- If package review mode is in scope, generate the package file manifest and
  materialize one checkbox per reviewed file in this plan before
  implementation. A file checkbox may be checked only when its score is `100`.

Timed checkpoint:
- requested duration: pending
- semantics: pending
- initial confidence score: pending
- improvement loop: pending
- final score / loop closure: pending

Completion threshold:
- TODO: Define the exact Plate Next done state.
- Named file/API work may close from a scoped source map and focused proof.
- One-by-one review work may close only after the best Plate v2 recommendation
  is recorded, legacy/backcompat hacks are rejected, any Plite/Plate gaps are
  named, and every correction has a related scoped sweep row.
- Broad Core sweep may close only when every Core source file has a valid row
  in this plan's Core drift ledger section or a linked plan artifact summarized
  in this plan.
- Package review mode may close only when every package file row is either
  checked at score `100` or explicitly deferred for user review with reason,
  owner, proof needed, and next action. Do not move to the next package while
  unchecked package rows remain.
- Core-adjacent package review may close only after
  `tooling/scripts/check-core.mjs` is updated to include that package, or the
  plan records why the package is product-only and does not belong in
  `check:core`.
- The plan records manifest command, expected row count, actual row count,
  missing row count, extra row count, and top drift rows before closeout.
- Any drift score `>=2` has an owner, evidence, and next action.
- Any drift score `>=4` is fixed, hard-cut, moved, quarantined, or deferred
  with owner/proof; it cannot close as `keep-in-plate`.
- Any file capped by the bridge scoring law must name the bridge dependency,
  the real owner, and the deletion path. It cannot be raised to 100 from
  `check:core` alone.
- `node .agents/skills/autogoal/scripts/check-complete.mjs {{PLAN_PATH}}`
  passes after final evidence is recorded.

Verification surface:
- focused tests / commands: pending
- package proof: pending
- shared Core gate: pending
- source audits: pending
- related scoped sweep query / active scope / match count / patched count / deferred count:
  pending
- package file manifest / row count / checked count / deferred count: pending
- Plite/Plate gap ledger: pending
- broad Core drift ledger gate: pending
- final plan check: `node .agents/skills/autogoal/scripts/check-complete.mjs {{PLAN_PATH}}`

Constraints:
- Review mode targets the best Plate v2 shape: clean Plate product layer on top
  of Plite, no legacy compatibility goal.
- Plate owns product composition; Plite owns editor substrate.
- Core must not wrap Plite editor APIs under Plate names.
- No public compat aliases, old Slate shims, or docs for old API names.
- No local hacks: do not hide migration difficulty in bridge dumps, helper
  dumps, `any` casts, duplicated wrappers, command fallbacks, or fake aliases.
- If clean migration is blocked, record a `Plite gap` or `Plate gap` instead of
  inventing a compatibility workaround.
- After every correction, run a related sweep only inside the active mode
  scope. Package review mode is scoped to the named package plus the smallest
  Plite/Core owner needed to unblock that package. Broader matches become
  deferred rows or next-package candidates, not edits.
- In package review mode, do not update docs, examples, package callers outside
  the named package, unrelated packages, generated registries, or broad repo
  surfaces unless the user explicitly broadens scope with `all packages`,
  `current tree`, `full-loop`, `sweep`, or the broader owner name.
- Review-mode rename freeze: keep current `HEAD` names/paths while behavior and
  API drift are under review. Put desirable later renames in
  `docs/plans/pre-renaming.md`; do not turn the active diff into Added/Deleted
  rename soup unless the user explicitly asks for a rename pass.
- Extracted-file recovery gate: every untracked/extracted Core/Plate source,
  spec, type-test, and config file in scope must be inventoried and classified
  as `recover-main-owner`, `merge-existing-owner`, `move-to-plite`,
  `justify-new-proof-tooling`, or `delete-duplicate`.
- No file or packet can score `100` while an extracted/untracked file in scope
  lacks a ledger row and one of those buckets.
- Private bridges require owner, deletion gate, and proof.
- Private bridges cannot collect displaced product/plugin behavior. A bridge
  file that centralizes input-rules, node-id, affinity, DOM, command, or change
  listener behavior scores `0` until deleted.
- Any file importing or installing a forbidden bridge is capped at `25`.
- Owner files whose runtime behavior lives in a forbidden bridge are capped:
  `InputRulesPlugin` `<=5`, `NodeIdPlugin` `<=45`, `AffinityPlugin` `<=55`,
  `PliteExtensionPlugin` `<=45`.
- Public type/plugin/editor files touched while a forbidden bridge remains are
  capped at `75`.
- If a helper exists only because migration was hard, cut it.
- Do not use a narrow representative file to close a broad Core sweep.
- Package review mode is review-first, not migration-first. Freeze scope to the
  named package plus the smallest Plite/Core owner needed to remove a blocker.
- Package hard cuts land package by package. A broad audit can discover
  outside-scope callers, but the plan must record them as deferred rows instead
  of patching them in the current package packet.
- Package file rows can be checked `[x]` only at score `100`: no behavior
  regression versus `origin/main`, no type regression, inline inference
  preserved, no inferred local type annotations, no fake casts/local helper
  types, no compat sludge, correct Plite/Plate ownership, accepted
  owner/name/path drift, and focused proof or justified source audit.
- Green package tests alone do not score a file `100`.
- Do not move to the next package until every package file row is checked at
  `100` or explicitly deferred for user review.
- Core-adjacent package review must update `check:core` coverage before
  closeout, or explicitly classify the package as not belonging in that gate.
- For Core-only targets, ignore non-Core package errors unless the package is
  named, touched by the packet, or the failure proves a Core public API
  regression.
- Direct one-shot Plite API law: prefer `editor.update.foo.bar(...)` and
  `editor.read.foo(...)` over callback wrappers for one-line reads/writes.
  Callback form is only for grouped transaction/snapshot logic, shared
  intermediate state, branching/looping, or missing direct API that is recorded
  as a Plite gap.
- Optional public-read law: Plate feature-package source handles unresolved
  Plite reads with an early return/no-op. `{ required: true }` is reserved for
  Plite internals with a proven runtime invariant; fixture assertions are the
  test-only exception.
- Active transaction law: no `editor.update.*` call may appear inside an
  `editor.update(...)`, `editor.update.withoutNormalizing(...)`, transform
  middleware, or other active transaction callback. The callback must receive
  and use the active `tx`; `withoutNormalizing` callbacks should be
  `({ tx }) => { ... }`.
- Plugin export inference law: plugin constants should infer from
  `createBasePlugin`, `createPlatePlugin`, `toPlatePlugin`, and chained
  `.extend*` methods. Do not annotate exports as `BasePlugin<Config>` /
  `PlatePlugin<Config>` or cast chained plugin results unless the annotation is
  a true external boundary. If inference fails, fix the builder/generic owner.
- Empty config inference law: do not create `type FooConfig =
  PluginConfig<'foo'>` only to call `createBasePlugin<FooConfig>({ key:
  'foo' })`. Manual plugin config types are only for real options, API, tx,
  selectors, state, or external public contracts.
- Plugin editor extension law: plugin-owned editor extension options should be
  returned directly from `extendExtension`. Do not wrap them in
  `defineEditorExtension({ name: pluginKey, ... })` just to satisfy types.
  `extendExtension` must accept both built extensions and raw options; raw
  options without `name` default to the owning plugin key. Keep explicit names
  only for genuinely separate extension identities.
- Inferred local type law: do not annotate local variables whose initializer
  should infer the type. Smells like `const entries: NodeEntry<T>[] =
  editor.read...` or `const value: Value = [...]` hide type regressions at the
  owner API. Remove the annotation and fix the source API if inference is weak.
  Keep annotations only for uninferrable locals such as empty arrays,
  deliberate narrowing/widening, exported/public signatures, or external
  boundary callbacks.
- Plugin option law: root plugin option helpers are forbidden public API. Do
  not use or re-add `editor.getOption(...)`, `editor.getOptions(...)`,
  `editor.setOption(...)`, or `editor.setOptions(...)`. Package code should use
  scoped plugin portals by default (`editor.plugin(FooPlugin).getOption(...)`,
  `editor.plugin(FooPlugin).getOptions()`,
  `editor.plugin(FooPlugin).setOption(...)`,
  `editor.plugin(FooPlugin).setOptions(...)`). `usePluginOption(FooPlugin, ...)`
  remains the render-subscription path. Key+generic fallbacks need an owner
  reason: plugin self-definition cycle, React hook/component imported by the
  plugin itself, non-React layer that must not import a React plugin, or
  intentionally decoupled cross-package code. Plugin-owned helper graphs should
  receive plugin context (`api`, `getOption`, `getOptions`, `setOption`, `tx`)
  or be thin wrappers over the typed plugin API/tx group.

Boundaries:
- allowed edit scope: pending
- package/API surfaces: pending
- docs/browser surfaces: pending
- non-goals: pending
- out-of-scope package errors: pending

Output budget strategy:
- For broad Core sweep, use manifest counts and ledger artifacts instead of
  streaming every file path into chat.
- For named file/API work, use targeted `sed`/`rg` reads and capped output.

Blocked condition:
- pending

Current verdict:
- verdict: pending
- confidence: pending
- next owner: plate-next
- keep / revert / quarantine call: pending
- reason: pending

Start Gates:
| Gate | Applies | Evidence |
|------|---------|----------|
| Prompt requirements captured before work | pending | pending |
| `plate-next` skill/rule read | pending | pending |
| Active goal checked or created | pending | pending |
| Mode classified as named packet vs broad Core sweep | pending | pending |
| Review target recorded as best Plate v2 / Plite-fit / no legacy compat | pending | pending |
| Broad Core drift ledger initialized when in scope | pending | pending |
| Source of truth and allowed workspace recorded | pending | pending |
| Output budget strategy recorded | pending | pending |
| Public API fork routing checked | pending | pending |
| Gap policy checked | pending | pending |
| Related scoped sweep policy checked | pending | pending |
| Review-mode rename freeze checked | pending | pending |
| Package review checklist initialized when in scope | pending | pending |

Work Checklist:
- [ ] First checkpoint complete: every explicit prompt requirement, scope
      boundary, timing constraint, stop condition, deliverable, final handoff
      section, verification surface, and success criterion is copied into this
      plan before implementation.
- [ ] Mode classified: named file/API packet, broad Core sweep, package sweep,
      docs/API mismatch, or public API plan.
- [ ] Best Plate v2 call recorded for every reviewed target: `cut`,
      `move-to-plite`, `keep-in-plate`, `private-bridge-with-deletion-gate`,
      `Plite gap`, `Plate gap`, or `blocker`.
- [ ] Legacy/backcompat decision recorded: no public compat alias, shim,
      duplicate Plate wrapper around Plite, old command fallback, or old docs
      path is kept unless explicitly accepted with deletion gate.
- [ ] Hack check recorded: no bridge/helper dump, broad `any` cast, fake
      alias, or displaced product/plugin behavior is kept as a shortcut.
- [ ] Gap ledger updated for every blocker: exact missing Plite or Plate
      capability, why local workaround is wrong, smallest owner, and proof.
- [ ] After every correction, related scoped sweep row is added with query,
      active scope, match count, patched count, deferred count, and remaining
      risk. In package review mode, broader matches are deferred, not patched.
- [ ] For broad Core sweep, the Core drift ledger in this plan, or linked from
      this plan, has one row per Core source file before closeout.
- [ ] For broad Core sweep, every Core file row has `path`, `drift_score`,
      `verdict`, `owner`, `evidence`, and `next`.
- [ ] For broad Core sweep, the plan records manifest command, expected row
      count, actual row count, missing row count, extra row count, and confirms
      missing/extra are zero.
- [ ] For broad Core sweep, the drift score gate is closed in this plan:
      score `>=2` rows have owner/evidence/next, and score `>=4` rows are not
      closed as `keep-in-plate`.
- [ ] For package review mode, the package file checklist is generated before
      implementation, with one checkbox per reviewed file.
- [ ] For package review mode, every package file row is either checked at
      score `100` with evidence or left unchecked with deferral reason, owner,
      proof needed, and next action for user review.
- [ ] For package review mode, no next package is started before the current
      package checklist closes or the user explicitly redirects.
- [ ] For Core-adjacent package review, `tooling/scripts/check-core.mjs` is
      updated to include the package, or the plan records why the package is
      product-only and outside `check:core`.
- [ ] Direct one-shot API audit closed: single-operation
      `editor.update((tx) => tx.*)` and single-read
      `editor.read((state) => state.*)` wrappers are replaced with direct
      methods when available, or each remaining callback is justified as grouped
      transaction/snapshot logic.
- [ ] Optional public-read audit closed: feature-package production code does
      not use `{ required: true }` or non-null assertions to hide unresolved
      Plite reads; each match handles `undefined` or records a Plite-internal
      invariant reason.
- [ ] Plugin export inference audit closed: plugin export annotations/casts
      such as `: BasePlugin<Config>`, `: PlatePlugin<Config>`, and
      `as BasePlugin<Config>` are removed when inference should own the result,
      or each remaining annotation is justified as a real external boundary.
- [ ] Empty config inference audit closed: `PluginConfig<'key'>` aliases and
      `createBasePlugin<Config>` generics are removed when the config has no
      typed options, API, tx, selectors, state, or external public contract.
- [ ] Plugin extension options audit closed: plugin-owned extension options are
      returned directly from `extendExtension`; `defineEditorExtension` remains
      only for standalone Plite extensions, existing built extensions, or
      explicit non-plugin extension identities.
- [ ] Bridge scoring law applied: forbidden bridges score `0`, direct bridge
      imports/installers are capped, displaced owner files are capped, and no
      capped file is raised to 100 from green checks alone.
- [ ] Review matrix is filled for every inspected file/API/helper.
- [ ] Public API forks are routed to `plate-plan` before implementation.
- [ ] Review-mode rename freeze applied: Added/Deleted rename noise is either
      restored to current `HEAD` names or mapped in `docs/plans/pre-renaming.md`
      with an explicit reason it cannot be restored in this packet.
- [ ] Extracted-file recovery gate closed: every untracked/extracted file in
      scope has an inventory row and bucket, with `origin/main` owner checked
      before keeping any new path/name.
- [ ] Safe cleanup packets are kept, reverted, or quarantined with proof.
- [ ] Focused package proof is run after meaningful code changes.
- [ ] `pnpm brl` is run when exports/barrels change.
- [ ] Old compatibility names are source-audited when cut.
- [ ] Changed list, top drift rows, needs-attention rows, and next owner are
      filled before final response.
- [ ] Output budget discipline followed.

Completion Gates:
| Gate | Applies | Required action | Evidence |
|------|---------|-----------------|----------|
| Named verification threshold | pending | Run the proof commands named in this plan | pending |
| Broad Core drift ledger coverage | pending | Record manifest command, expected row count, actual row count, missing row count, and extra row count when broad Core sweep applies | pending |
| Score gate | pending | Prove all scores are valid and high drift is owned/fixed/deferred in the plan ledger | pending |
| Best Plate v2 recommendation | pending | Record the recommended current shape and rejected legacy/hack alternatives for the reviewed target | pending |
| Plite/Plate gap ledger | pending | Record blockers or N/A when no gap blocks the target | pending |
| Related scoped sweep after correction | pending | For each correction, run and record same-class search/review results inside the active scope | pending |
| Package file checklist | pending | Record manifest command, row counts, score-100 rows, unchecked/deferred rows, and proof per file when package review applies | pending |
| Package/API proof | pending | Run focused typecheck/test/build or record N/A | pending |
| Shared Core gate coverage | pending | Add Core-adjacent reviewed packages to `tooling/scripts/check-core.mjs`, or record why N/A | pending |
| Non-Core package error triage | pending | If a proof command reports non-Core failures, classify as named/touched/Core-regression or out-of-scope package drift | pending |
| Source audit | pending | Run exact audit for removed compatibility names or record N/A | pending |
| Rename ledger | pending | Update `docs/plans/pre-renaming.md` when a rename is postponed or intentionally kept | pending |
| Extracted-file inventory | pending | Record untracked/extracted file command, row count, and bucket for every file in scope | pending |
| Autoreview / review | pending | Run review gate for non-trivial implementation diffs or record N/A | pending |
| Final lint/check | pending | Run scoped lint/check or record N/A | pending |
| Changed list / top drift / needs attention | pending | Fill handoff ledgers | pending |
| Goal plan complete | yes | Run `node .agents/skills/autogoal/scripts/check-complete.mjs {{PLAN_PATH}}` | pending |

Review matrix:
| Path / API | Drift score | Verdict | Owner | Evidence | Next |
|------------|-------------|---------|-------|----------|------|
| pending | pending | pending | pending | pending | pending |

Best Plate v2 recommendation:
| Target | Recommended shape | Rejected legacy/hack alternatives | Reason | User-review need |
|--------|-------------------|-----------------------------------|--------|------------------|
| pending | pending | pending | pending | pending |

Plite / Plate gap ledger:
| Gap type | Missing capability | Why local workaround is a hack | Smallest owner | Proof needed | Decision |
|----------|--------------------|-------------------------------|----------------|--------------|----------|
| pending | pending | pending | pending | pending | pending |

Related scoped sweep ledger:
| Trigger correction | Active scope | Sweep query / method | Matches | Patched | Deferred | Remaining risk |
|--------------------|--------------|----------------------|---------|---------|----------|----------------|
| pending | pending | pending | pending | pending | pending | pending |

Core drift ledger:
- Applies: pending
- Manifest command: pending
- Manifest owner: `packages/core/src/**/*.{ts,tsx,mts,cts}`
- Optional type-test owner: `packages/core/type-tests/**/*.{ts,tsx,mts,cts}`
- Ledger location: this table or a linked artifact summarized here
- Expected row count: pending
- Actual row count: pending
- Missing row count: pending
- Extra row count: pending
- Score gate: pending
- Top drift rows: pending

Core file drift rows:
| Path | Drift score | Verdict | Owner | Evidence | Next |
|------|-------------|---------|-------|----------|------|
| pending | pending | pending | pending | pending | pending |

Package file checklist:
- Applies: pending
- Package: pending
- Manifest command: pending
- Manifest owner:
  `packages/<package>/src/**/*.{ts,tsx,mts,cts}` plus package-local specs,
  test-utils, type-tests, fixtures, examples, and docs only when touched.
- Expected row count: pending
- Actual row count: pending
- Checked score-100 count: pending
- Unchecked/deferred count: pending
- Missing row count: pending
- Extra row count: pending
- Score gate: `[x]` only when score is `100`.
- Next package blocked until: pending

Package file rows:
- [ ] `pending` — score: pending — verdict: pending — owner: pending —
      evidence: pending — next: pending

Packet ledger:
| Packet | Owner | Hypothesis / smell | Files / commands | Decision | Next |
|--------|-------|--------------------|------------------|----------|------|
| pending | pending | pending | pending | pending | pending |

Extracted file ledger:
| Path | Bucket | Origin/main owner check | Decision | Proof |
|------|--------|-------------------------|----------|-------|
| pending | pending | pending | pending | pending |

Out-of-scope package drift:
| Package / command | Error summary | Why not blocking this run | Owner / next |
|-------------------|---------------|---------------------------|--------------|
| pending | pending | pending | pending |

Out-of-scope matches discovered:
| Pattern / API | Outside-scope owners | Why not patched now | Next package / owner |
|---------------|----------------------|---------------------|----------------------|
| pending | pending | pending | pending |

Changed list:
| Group | Current-run changes |
|-------|---------------------|
| code/runtime/API | pending |
| tests/proof | pending |
| docs/templates/skills | pending |
| reverted/quarantined packets | pending |

Needs your attention:
| Rank | Item | Why | Anchor | Recommendation |
|------|------|-----|--------|----------------|
| pending | pending | pending | pending | pending |

Findings:
- None yet.

Decisions and tradeoffs:
- None yet.

Error attempts:
| Error / failed attempt | Count | Next different move | Resolution |
|------------------------|-------|---------------------|------------|
| None yet | 0 | | |

Verification evidence:
- Pending.

Final handoff contract:
- target surface and mode: pending
- files/APIs reviewed: pending
- broad Core drift score coverage: pending
- package file checklist coverage: pending
- best Plate v2 recommendation: pending
- verdict matrix summary: pending
- Plite/Plate gaps or blockers: pending
- related scoped sweep query/active scope/matches/patched/deferred: pending
- out-of-scope matches discovered: pending
- changes made: pending
- tests/proof commands: pending
- old compatibility names audited: pending
- needs attention: pending
- next best Plate Next packet: pending

Reboot status:
| Question | Answer |
|----------|--------|
| Where am I? | Checkpoint zero |
| Where am I going? | Drift-scored Plate Next closure |
| What is the goal? | TODO: Fill from Objective |
| What have I learned? | See Findings |
| What have I done? | See Timeline |

Timeline:
- {{CREATED_AT}} Goal plan created.

Open risks:
- Pending.
