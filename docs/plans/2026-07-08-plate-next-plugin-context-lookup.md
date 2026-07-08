# plate-next plugin context lookup

Objective:
Repair Selection plugin lookup shape so plugin object/context is preferred over
key+generic fallbacks, and record that rule in `plate-next`.

Goal plan:
docs/plans/2026-07-08-plate-next-plugin-context-lookup.md

Template:
docs/plans/templates/plate-next.md

Primary template:
docs/plans/templates/plate-next.md

Applied packs:
- none

Plate Next source:
- prompt / link: user asked to "go" after approving plugin-object/context
  shape, and repair `plate-next`
- mode: named package/API packet
- target surface: `packages/selection` plugin lookup calls plus
  `.agents/rules/plate-next.mdc`
- review target: best Plate v2 migration on top of Plite, not legacy
  compatibility
- broad Core sweep: no
- correction-triggered related Core sweep: yes, focused lookup-pattern sweep
- package review mode: no
- package review target: N/A
- package file checklist gate: N/A
- completion threshold summary: safe plugin-object calls use
  `BlockSelectionPlugin`; plugin-owned helper graph uses context parameters
  instead of `editor.plugin<BlockSelectionConfig>(KEYS.blockSelection)`;
  `plate-next` records the rule; focused proof passes

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
- requested duration: none
- semantics: N/A
- initial confidence score: N/A
- improvement loop: N/A
- final score / loop closure: N/A

Completion threshold:
- No unsafe `editor.plugin<BlockSelectionConfig>(KEYS.blockSelection)` or
  matching `getOption` / `setOption` generic fallback remains in Selection
  where plugin object or plugin context is available.
- Helpers imported by `BlockSelectionPlugin` do not import the plugin object
  back; they receive plugin API/options/setters from the extension context.
- Safe external/runtime callers use `BlockSelectionPlugin` directly.
- `plate-next` source rule and generated skill mirror record this as a
  recurring migration rule.
- Focused Selection/Core typecheck/test/lint proof passes.
- Named file/API work may close from a scoped source map and focused proof.
- One-by-one review work may close only after the best Plate v2 recommendation
  is recorded, legacy/backcompat hacks are rejected, any Plite/Plate gaps are
  named, and every correction has a related Core sweep row.
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
- `node .agents/skills/autogoal/scripts/check-complete.mjs docs/plans/2026-07-08-plate-next-plugin-context-lookup.md`
  passes after final evidence is recorded.

Verification surface:
- focused tests / commands: `pnpm turbo typecheck --filter=./packages/core --filter=./packages/selection`,
  `pnpm --filter @platejs/selection test`,
  `pnpm --filter @platejs/selection lint`
- package proof: Selection package focused proof
- shared Core gate: Core typecheck because plugin helper typing lives there
- source audits: `rg` for `plugin<BlockSelectionConfig>(KEYS.blockSelection)`,
  `getOption<BlockSelectionConfig>({ key: KEYS.blockSelection`, and
  `setOption<BlockSelectionConfig`
- related Core sweep query / match count / patched count / deferred count:
  focused Selection/Core lookup-pattern sweep
- package file manifest / row count / checked count / deferred count: N/A
- Plite/Plate gap ledger: none expected
- broad Core drift ledger gate: N/A
- final plan check: `node .agents/skills/autogoal/scripts/check-complete.mjs docs/plans/2026-07-08-plate-next-plugin-context-lookup.md`

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
- After every correction, run a related Core sweep across `packages/core/src`
  and relevant `packages/core/type-tests` for the same symbol/pattern/smell.
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

Boundaries:
- allowed edit scope: `packages/selection/src`, `packages/core/src` only if
  plugin lookup typing requires it, `.agents/rules/plate-next.mdc`,
  generated skill mirror, plan
- package/API surfaces: Selection plugin API call shape
- docs/browser surfaces: none
- non-goals: no broad Selection migration, no runtime behavior redesign, no
  renames
- out-of-scope package errors: ignore unless caused by touched Core/Selection
  API

Output budget strategy:
- For broad Core sweep, use manifest counts and ledger artifacts instead of
  streaming every file path into chat.
- For named file/API work, use targeted `sed`/`rg` reads and capped output.

Blocked condition:
- Stop if passing plugin context into helpers cannot preserve inference without
  a Core plugin typing change; repair Core typing first or route to
  `plate-plan` if it becomes a public API fork.

Current verdict:
- verdict: main-parity-cleanup
- confidence: complete for this narrow packet
- next owner: plate-next
- keep / revert / quarantine call: keep
- reason: Selection now uses plugin-object/context lookup where safe, keeps
  key fallback only at real cycle/non-React boundaries, and focused proof is
  green.

Start Gates:
| Gate | Applies | Evidence |
|------|---------|----------|
| Prompt requirements captured before work | yes | Scope, rule repair, sweep, proof copied above |
| `plate-next` skill/rule read | yes | `.agents/skills/plate-next/SKILL.md` read |
| Active goal checked or created | yes | Active goal matched this packet |
| Mode classified as named packet vs broad Core sweep | yes | Named Selection plugin lookup packet |
| Review target recorded as best Plate v2 / Plite-fit / no legacy compat | yes | Plugin object/context preferred over key+generic fallback |
| Broad Core drift ledger initialized when in scope | no | Broad Core sweep not requested |
| Source of truth and allowed workspace recorded | yes | `packages/selection/src`, `.agents/rules/plate-next.mdc`, template, plan |
| Output budget strategy recorded | yes | Targeted reads and focused `rg` sweeps only |
| Public API fork routing checked | yes | No public API fork |
| Gap policy checked | yes | No Plite/Plate gap blocked this packet |
| Related Core sweep policy checked | yes | Focused lookup-pattern sweeps recorded below |
| Review-mode rename freeze checked | yes | No renames |
| Package review checklist initialized when in scope | no | Not package review mode |

Work Checklist:
- [x] First checkpoint copied prompt requirements, scope, non-goals, proof,
      stop condition, and final-handoff requirements before implementation.
- [x] Mode classified as a named Selection plugin lookup packet.
- [x] Best Plate v2 call recorded: keep Selection as Plate product behavior,
      prefer plugin-object/context lookup, reject key+generic fallback except
      real cycle/non-React boundaries.
- [x] Legacy/backcompat decision recorded: no public alias or shim added.
- [x] Hack check recorded: no bridge dump, broad cast, fake alias, or displaced
      product/plugin behavior kept.
- [x] Gap ledger closed: no Plite or Plate gap remained after using plugin
      context and own-plugin `extendTx`.
- [x] Related sweep rows recorded with query, matches, patched, deferred, and
      remaining risk.
- [x] Broad Core sweep rows are N/A because the user asked for this narrow
      Selection lookup packet, not a full Core sweep.
- [x] Package review checklist is N/A because this is not package review mode.
- [x] Core-adjacent `check:core` update is N/A because Selection is not being
      added to the Core gate in this packet.
- [x] Direct one-shot API audit closed: production/plugin code uses direct API
      where typed; exported legacy helper wrappers use plugin-context
      transaction callbacks because plugin-context `update` narrows `tx`, not
      the direct method namespace.
- [x] Plugin export inference audit closed: no plugin export annotation added.
- [x] Empty config inference audit closed: no empty config alias added.
- [x] Plugin extension options audit closed: no editor extension changes.
- [x] Bridge scoring law applied: no bridge introduced or touched.
- [x] Review matrix filled for inspected files/APIs.
- [x] Public API fork routing checked: no `plate-plan` needed.
- [x] Rename freeze applied: no renames.
- [x] Extracted-file recovery gate N/A: no new extracted Core/Plate helper
      files introduced.
- [x] Cleanup packet kept after proof.
- [x] Focused package proof run after meaningful changes.
- [x] `pnpm brl` N/A: no exports or barrels changed.
- [x] Old compatibility names source-audited through focused lookup patterns.
- [x] Changed list, needs-attention rows, and next owner filled.
- [x] Output budget discipline followed with narrow reads/searches.

Completion Gates:
| Gate | Applies | Required action | Evidence |
|------|---------|-----------------|----------|
| Named verification threshold | yes | Run focused proof commands | `pnpm turbo typecheck --filter=./packages/core --filter=./packages/selection` passed; Selection typecheck/test/lint/build passed |
| Broad Core drift ledger coverage | no | N/A for narrow Selection packet | Broad Core sweep not requested |
| Score gate | no | N/A for narrow Selection packet | No drift score ledger required |
| Best Plate v2 recommendation | yes | Record recommended current shape and rejected alternatives | See recommendation table |
| Plite/Plate gap ledger | yes | Record blocker or N/A | No remaining gap |
| Related Core sweep after correction | yes | Run same-class searches | Lookup sweeps recorded below |
| Package file checklist | no | N/A | Not package review mode |
| Package/API proof | yes | Run focused package proof | Selection typecheck/test/lint/build passed |
| Shared Core gate coverage | yes | Run Core-adjacent typecheck | `pnpm turbo typecheck --filter=./packages/core --filter=./packages/selection` passed |
| Non-Core package error triage | yes | Classify unrelated failures | First Selection test run raced parallel rebuilds and failed module resolution; serial rerun passed |
| Source audit | yes | Run exact lookup audit | Generic fallback audit leaves only `useBlockSelectable` cycle boundary |
| Rename ledger | no | N/A | No renames proposed or applied |
| Extracted-file inventory | no | N/A | No extracted files introduced |
| Autoreview / review | yes | Self-review narrow diff against rule and proof | Source audit plus focused proof; no standalone PR/commit review requested |
| Final lint/check | yes | Run scoped lint/check | `pnpm --filter @platejs/selection lint` passed |
| Changed list / top drift / needs attention | yes | Fill handoff ledgers | Filled below |
| Goal plan complete | yes | Run `node .agents/skills/autogoal/scripts/check-complete.mjs docs/plans/2026-07-08-plate-next-plugin-context-lookup.md` | To run after this update |

Review matrix:
| Path / API | Drift score | Verdict | Owner | Evidence | Next |
|------------|-------------|---------|-------|----------|------|
| `packages/selection/src/react/BlockSelectionPlugin.tsx` own API/tx | 0 | main-parity-cleanup | Selection | Own plugin logic now uses extension `api` context and own-plugin `extendTx`; typecheck/tests pass | keep |
| Selection exported helper wrappers | 1 | main-parity-cleanup | Selection | Wrappers use `editor.plugin(BlockSelectionPlugin)` and inferred plugin-context transaction callback | keep until later public helper hard-cut is requested |
| Selection utility callers | 0 | main-parity-cleanup | Selection | Safe callers use `BlockSelectionPlugin` directly | keep |
| `useBlockSelectable` key fallback | 0 | keep-in-plate | Selection | Hook is imported by `BlockSelectionPlugin` injection path; importing plugin object would be self-cycle risk | keep justified fallback |
| `plate-next` rule/template | 0 | keep-in-plate | Agent workflow | Source rule, generated mirror, and template include plugin lookup law | keep |

Best Plate v2 recommendation:
| Target | Recommended shape | Rejected legacy/hack alternatives | Reason | User-review need |
|--------|-------------------|-----------------------------------|--------|------------------|
| Selection plugin lookup | Use plugin object where import-safe; use plugin extension context inside the plugin; key+generic only with cycle/non-React reason | blanket `editor.plugin<BlockSelectionConfig>(KEYS.blockSelection)`, caller-side narrow editor annotations, `as any` | Preserves inference and keeps package code decoupled only when there is a real owner boundary | none |

Plite / Plate gap ledger:
| Gap type | Missing capability | Why local workaround is a hack | Smallest owner | Proof needed | Decision |
|----------|--------------------|-------------------------------|----------------|--------------|----------|
| none | none | N/A | N/A | focused proof passed | closed |

Related Core sweep ledger:
| Trigger correction | Sweep query / method | Matches | Patched | Deferred | Remaining risk |
|--------------------|----------------------|---------|---------|----------|----------------|
| Replace safe key+generic lookups | `rg -n "plugin<BlockSelectionConfig>\\(|getOptions<BlockSelectionConfig>\\(|getOption<BlockSelectionConfig>\\(|setOption<BlockSelectionConfig" packages/selection/src` | 4 | 8 earlier unsafe call sites patched; 4 remaining all in `useBlockSelectable` | 4 justified | hook self-cycle only |
| Confirm plugin-object adoption | `rg -n "editor\\.plugin\\(BlockSelectionPlugin\\)|getOptions\\(BlockSelectionPlugin\\)|setOption\\(BlockSelectionPlugin|useEditorPlugin\\(BlockSelectionPlugin" packages/selection/src` | 64 | N/A audit | 0 | none |
| Generated skill repair | `rg -n "Prefer plugin-object lookup|Plugin lookup law" .agents/skills/plate-next/SKILL.md .agents/rules/plate-next.mdc docs/plans/templates/plate-next.md` | 3 | 3 | 0 | none |

Core drift ledger:
- Applies: no
- Manifest command: N/A
- Manifest owner: broad Core sweep not requested
- Optional type-test owner: N/A
- Ledger location: N/A
- Expected row count: 0
- Actual row count: 0
- Missing row count: 0
- Extra row count: 0
- Score gate: N/A
- Top drift rows: none

Core file drift rows:
| Path | Drift score | Verdict | Owner | Evidence | Next |
|------|-------------|---------|-------|----------|------|
| N/A | 0 | N/A | N/A | Broad Core sweep not requested | none |

Package file checklist:
- Applies: no
- Package: N/A
- Manifest command: N/A
- Expected row count: 0
- Actual row count: 0
- Checked score-100 count: 0
- Unchecked/deferred count: 0
- Missing row count: 0
- Extra row count: 0
- Score gate: N/A
- Next package blocked until: N/A

Package file rows:
- [x] N/A — score: 100 — verdict: N/A — owner: N/A — evidence: not package review mode — next: none

Phase / pass table:
| Phase | Status | Evidence | Next |
|-------|--------|----------|------|
| Checkpoint zero | complete | Prompt requirements copied into this plan | implement narrow packet |
| Selection lookup repair | complete | Selection plugin/helpers patched | verify |
| Skill repair | complete | Source rule, generated skill, and template contain plugin lookup law | verify |
| Verification | complete | Typecheck/test/lint/build and source audits passed | close goal |

Packet ledger:
| Packet | Owner | Hypothesis / smell | Files / commands | Decision | Next |
|--------|-------|--------------------|------------------|----------|------|
| Selection lookup repair | Selection | Key+generic fallback was leaking into safe runtime callers and wrappers | Selection source, focused audits, typecheck/test/lint/build | keep | continue package review when user names next packet |
| Plate Next rule repair | Agent workflow | Rule did not force plugin-object/context lookup | `.agents/rules/plate-next.mdc`, generated skill, template | keep | use in future reviews |

Extracted file ledger:
| Path | Bucket | Origin/main owner check | Decision | Proof |
|------|--------|-------------------------|----------|-------|
| N/A | N/A | N/A | No extracted files introduced | source audit |

Out-of-scope package drift:
| Package / command | Error summary | Why not blocking this run | Owner / next |
|-------------------|---------------|---------------------------|--------------|
| none | none | N/A | none |

Changed list:
| Group | Current-run changes |
|-------|---------------------|
| code/runtime/API | Selection plugin own API/tx uses context; exported wrappers use plugin-object lookup; DOM selection inputs typed as `globalThis.Element`; `BlockSelectionAfterEditable` uses `useEditorPlugin(BlockSelectionPlugin)` |
| tests/proof | No test files changed |
| docs/templates/skills | `plate-next` source rule, generated `SKILL.md`, and template now include plugin lookup law |
| reverted/quarantined packets | none |

Needs your attention:
| Rank | Item | Why | Anchor | Recommendation |
|------|------|-----|--------|----------------|
| 1 | Legacy helper exports still exist | They are preserved as thin wrappers for current package surface; later Plate v2 can hard-cut them if desired | Selection transform/internal helper files | review in a separate public API cut packet, not here |

Findings:
- `useBlockSelectable` is the only remaining `BlockSelectionConfig` generic
  lookup audit hit. It is imported by `BlockSelectionPlugin` itself, so plugin
  object import would create a self-definition cycle.
- `setSelectedIds` receives DOM selection-area elements, not Plite document
  elements; using `globalThis.Element` is the honest type.

Decisions and tradeoffs:
- Own plugin tx switched from `extendTxGroup('blockSelection', ...)` to
  `extendTx(...)` because the plugin config already owns the `blockSelection`
  tx group. This restored method inference without local callback annotations.
- Exported wrapper helpers use plugin-context `editor.update((tx) => ...)`
  because plugin-context direct update methods do not expose custom tx groups
  as one-shot methods on the narrowed editor. This is kept only in wrappers.

Error attempts:
| Error / failed attempt | Count | Next different move | Resolution |
|------------------------|-------|---------------------|------------|
| Too-strict wrapper editor type forced callers/tests to carry `BlockSelectionConfig` | 1 | Use plugin object inside wrappers | Fixed |
| Parallel `pnpm --filter @platejs/selection test` raced package rebuild outputs and reported missing modules | 1 | Rerun serially after build/typecheck | Serial test passed |

Verification evidence:
- `pnpm install` -> passed.
- `pnpm prepare` -> regenerated `plate-next` skill mirror.
- `pnpm turbo typecheck --filter=./packages/core --filter=./packages/selection` -> passed.
- `pnpm --filter @platejs/selection typecheck` -> passed.
- `pnpm --filter @platejs/selection test` -> 98 pass, 0 fail.
- `pnpm --filter @platejs/selection lint` -> passed.
- `pnpm --filter @platejs/selection build` -> passed.
- Source audits above -> expected remaining key+generic fallback only in `useBlockSelectable`.

Final handoff contract:
- target surface and mode: Selection plugin lookup, named packet.
- files/APIs reviewed: Selection plugin own API/tx, Selection helpers, safe utility callers, `plate-next` rule/template.
- broad Core drift score coverage: N/A.
- package file checklist coverage: N/A.
- best Plate v2 recommendation: plugin object/context by default; key+generic only with owner reason.
- verdict matrix summary: main-parity cleanup kept.
- Plite/Plate gaps or blockers: none.
- related Core sweep query/matches/patched/deferred: see sweep ledger.
- changes made: see changed list.
- tests/proof commands: see verification evidence.
- old compatibility names audited: no public compat names cut; lookup fallback audited.
- needs attention: legacy helper exports remain as thin wrappers.
- next best Plate Next packet: continue the next named package/file review.

Reboot status:
| Question | Answer |
|----------|--------|
| Where am I? | Selection plugin lookup repair complete |
| Where am I going? | Mechanical plan check, then goal closeout |
| What is the goal? | Repair Selection plugin lookup shape and plate-next rule |
| What have I learned? | Plugin object lookup is best where import-safe; wrapper tx needs plugin-context callback |
| What have I done? | Patched Selection, repaired `plate-next`, ran proof |

Timeline:
- 2026-07-08T11:10:21.374Z Goal plan created.
- 2026-07-08 Plugin lookup rule patched and generated skill synced.
- 2026-07-08 Selection lookup/helper repairs applied.
- 2026-07-08 Focused proof passed.

Open risks:
- Legacy helper exports are still present as wrappers. They are not a blocker
  for this packet; decide separately whether Plate v2 should hard-cut them.
