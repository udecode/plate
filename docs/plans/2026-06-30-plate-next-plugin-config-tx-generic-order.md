# plate-next plugin config tx generic order

Objective:
Hard-cut plugin generic order to `PluginConfig<K, Options, Api, Tx, Selectors>` and remove the reserved transforms slot everywhere.

Goal plan:
docs/plans/2026-06-30-plate-next-plugin-config-tx-generic-order.md

Template:
docs/plans/templates/plate-next.md

Primary template:
docs/plans/templates/plate-next.md

Applied packs:
- none

Plate Next source:
- prompt / link: user requested replacing `PluginConfig<K,O,A,_T,S,Tx>` with `PluginConfig<K,O,A,Tx,S>` everywhere
- mode: named public Core type-surface packet
- target surface: Core plugin type generics, plugin factories, React plugin wrappers, Core type tests, and docs examples that teach the public generic order
- review target: best Plate v2 migration on top of Plite, not legacy
  compatibility
- broad Core sweep: no
- correction-triggered related Core sweep: yes, search every stale `PluginConfig`/plugin-config generic ordering pattern in Core
- completion threshold summary: all Core plugin type definitions and public examples use `PluginConfig<K,O,A,Tx,S>`; no reserved `_T`/transform generic slot remains; Core typecheck and focused plugin tests pass

First checkpoint:
- Explicit requirements:
  - Replace the old generic order `PluginConfig<K,O,A,_T,S,Tx>` with
    `PluginConfig<K,O,A,Tx,S>`.
  - Do it everywhere relevant, not only `BasePlugin.ts`.
  - No compat alias, no reserved `_T` slot, no transform-position placeholder.
  - Keep the API Plite/Plate clean: tx before selectors.
  - Update source, tests/type-tests, and docs examples that teach this public
    surface.
  - Verify with Core type proof and stale-pattern audits.
  - Stop when stale generic order is gone or a real type-design blocker is
    found.
- Broad Core sweep: not requested.

Timed checkpoint:
- requested duration: pending
- semantics: pending
- initial confidence score: pending
- improvement loop: pending
- final score / loop closure: pending

Completion threshold:
- Exact done state: `PluginConfig` and dependent config helpers accept
  `<K, O, A, Tx, S>`; all stale `<K, O, A, {}, S, Tx>` and `T = {}` generic
  slots are removed from current Core public type surfaces and docs examples
  touched by this packet.
- Named file/API work may close from a scoped source map and focused proof.
- One-by-one review work may close only after the best Plate v2 recommendation
  is recorded, legacy/backcompat hacks are rejected, any Plite/Plate gaps are
  named, and every correction has a related Core sweep row.
- Broad Core sweep may close only when every Core source file has a valid row
  in this plan's Core drift ledger section or a linked plan artifact summarized
  in this plan.
- The plan records manifest command, expected row count, actual row count,
  missing row count, extra row count, and top drift rows before closeout.
- Any drift score `>=2` has an owner, evidence, and next action.
- Any drift score `>=4` is fixed, hard-cut, moved, quarantined, or deferred
  with owner/proof; it cannot close as `keep-in-plate`.
- Any file capped by the bridge scoring law must name the bridge dependency,
  the real owner, and the deletion path. It cannot be raised to 100 from
  `check:core` alone.
- `node .agents/skills/autogoal/scripts/check-complete.mjs docs/plans/2026-06-30-plate-next-plugin-config-tx-generic-order.md`
  passes after final evidence is recorded.

Verification surface:
- focused tests / commands: `pnpm --filter @platejs/core typecheck`; focused plugin tests if type surfaces compile
- package proof: Core typecheck, relevant Core plugin tests, `pnpm check:core` if source churn is broad
- source audits: exact `rg` for stale `PluginConfig` old-order patterns, `T = {}` transform slots, and old docs examples
- related Core sweep query / match count / patched count / deferred count:
  search `PluginConfig<`, `BasePluginConfig<`, `PlatePluginConfig<`, and
  `createBasePlugin<` call sites in `packages/core/src`,
  `packages/core/type-tests`, and relevant docs.
- Plite/Plate gap ledger: N/A unless type inference requires a source API
  redesign.
- broad Core drift ledger gate: N/A, named API packet only.
- final plan check: `node .agents/skills/autogoal/scripts/check-complete.mjs docs/plans/2026-06-30-plate-next-plugin-config-tx-generic-order.md`

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
- For Core-only targets, ignore non-Core package errors unless the package is
  named, touched by the packet, or the failure proves a Core public API
  regression.

Boundaries:
- allowed edit scope: `packages/core/src`, `packages/core/type-tests`, and docs examples that describe Core plugin generics
- package/API surfaces: Core plugin type API and Plate React plugin wrappers
- docs/browser surfaces: docs only if they teach the old generic order; no browser proof needed for type-only API docs
- non-goals: no broad Core sweep, no runtime behavior migration, no file renames
- out-of-scope package errors: any non-Core package error is out of scope unless the new Core type order directly breaks published Core API inference

Output budget strategy:
- For broad Core sweep, use manifest counts and ledger artifacts instead of
  streaming every file path into chat.
- For named file/API work, use targeted `sed`/`rg` reads and capped output.

Blocked condition:
- blocked only if TypeScript cannot preserve existing inline plugin inference with the new generic order without a larger public API redesign.

Current verdict:
- verdict: hard-cut
- confidence: high
- next owner: plate-next
- keep / revert / quarantine call: keep
- reason: old `T` slot is legacy transform archaeology and conflicts with current tx vocabulary.

Start Gates:
| Gate | Applies | Evidence |
|------|---------|----------|
| Prompt requirements captured before work | yes | explicit checklist above |
| `plate-next` skill/rule read | yes | `.agents/skills/plate-next/SKILL.md` read in this turn |
| Active goal checked or created | yes | created goal for plugin generic order hard cut |
| Mode classified as named packet vs broad Core sweep | yes | named API packet |
| Review target recorded as best Plate v2 / Plite-fit / no legacy compat | yes | hard cut, no reserved slot |
| Broad Core drift ledger initialized when in scope | N/A | broad sweep not requested |
| Source of truth and allowed workspace recorded | yes | current checkout, Core plugin type surfaces |
| Output budget strategy recorded | yes | targeted reads/audits, no full manifest |
| Public API fork routing checked | yes | user approved the public type order in chat |
| Gap policy checked | yes | blocked only by inference-preservation gap |
| Related Core sweep policy checked | yes | stale generic pattern sweep required |
| Review-mode rename freeze checked | yes | no file/symbol rename requested |

Work Checklist:
- [x] First checkpoint complete: every explicit prompt requirement, scope
      boundary, timing constraint, stop condition, deliverable, final handoff
      section, verification surface, and success criterion is copied into this
      plan before implementation.
- [x] Mode classified: named file/API packet, broad Core sweep, package sweep,
      docs/API mismatch, or public API plan.
- [x] Best Plate v2 call recorded for every reviewed target: `cut`,
      `move-to-plite`, `keep-in-plate`, `private-bridge-with-deletion-gate`,
      `Plite gap`, `Plate gap`, or `blocker`.
- [x] Legacy/backcompat decision recorded: no public compat alias, shim,
      duplicate Plate wrapper around Plite, old command fallback, or old docs
      path is kept unless explicitly accepted with deletion gate.
- [x] Hack check recorded: no bridge/helper dump, broad `any` cast, fake
      alias, or displaced product/plugin behavior is kept as a shortcut.
- [x] Gap ledger updated for every blocker: exact missing Plite or Plate
      capability, why local workaround is wrong, smallest owner, and proof.
- [x] After every correction, related Core sweep row is added with query,
      match count, patched count, deferred count, and remaining risk.
- [x] For broad Core sweep, the Core drift ledger in this plan, or linked from
      this plan, has one row per Core source file before closeout.
- [x] For broad Core sweep, every Core file row has `path`, `drift_score`,
      `verdict`, `owner`, `evidence`, and `next`.
- [x] For broad Core sweep, the plan records manifest command, expected row
      count, actual row count, missing row count, extra row count, and confirms
      missing/extra are zero.
- [x] For broad Core sweep, the drift score gate is closed in this plan:
      score `>=2` rows have owner/evidence/next, and score `>=4` rows are not
      closed as `keep-in-plate`.
- [x] Bridge scoring law applied: forbidden bridges score `0`, direct bridge
      imports/installers are capped, displaced owner files are capped, and no
      capped file is raised to 100 from green checks alone.
- [x] Review matrix is filled for every inspected file/API/helper.
- [x] Public API forks are routed to `plate-plan` before implementation.
- [x] Review-mode rename freeze applied: Added/Deleted rename noise is either
      restored to current `HEAD` names or mapped in `docs/plans/pre-renaming.md`
      with an explicit reason it cannot be restored in this packet.
- [x] Extracted-file recovery gate closed: every untracked/extracted file in
      scope has an inventory row and bucket, with `origin/main` owner checked
      before keeping any new path/name.
- [x] Safe cleanup packets are kept, reverted, or quarantined with proof.
- [x] Focused package proof is run after meaningful code changes.
- [x] `pnpm brl` is run when exports/barrels change.
- [x] Old compatibility names are source-audited when cut.
- [x] Changed list, top drift rows, needs-attention rows, and next owner are
      filled before final response.
- [x] Output budget discipline followed.

Phase / pass table:
| Phase | Status | Evidence | Next |
|-------|--------|----------|------|
| generic-order hard cut | done | source/type-tests/docs patched; focused tests, `pnpm check:core`, and docs check passed | none |

Completion Gates:
| Gate | Applies | Required action | Evidence |
|------|---------|-----------------|----------|
| Named verification threshold | yes | Run the proof commands named in this plan | `pnpm --filter @platejs/core typecheck`; focused plugin tests; `pnpm check:core`; docs check |
| Broad Core drift ledger coverage | N/A | Record manifest command, expected row count, actual row count, missing row count, and extra row count when broad Core sweep applies | Named API packet, not broad Core sweep |
| Score gate | N/A | Prove all scores are valid and high drift is owned/fixed/deferred in the plan ledger | Named packet; no broad score ledger |
| Best Plate v2 recommendation | yes | Record the recommended current shape and rejected legacy/hack alternatives for the reviewed target | `PluginConfig<K, O, A, Tx, S>`; reject `_T`/reserved transform slot |
| Plite/Plate gap ledger | N/A | Record blockers or N/A when no gap blocks the target | No Plite or Plate gap found; inference preserved |
| Related Core sweep after correction | yes | For each correction, run and record same-class Core search/review results | stale `PluginConfig` arity and old transform-slot audits passed |
| Package/API proof | yes | Run focused typecheck/test/build or record N/A | Core typecheck, focused plugin tests, `pnpm check:core` passed |
| Non-Core package error triage | N/A | If a proof command reports non-Core failures, classify as named/touched/Core-regression or out-of-scope package drift | No non-Core proof errors |
| Source audit | yes | Run exact audit for removed compatibility names or record N/A | no `InferTransforms`, reserved slot, old `PluginConfig<K,O,A,T,...)`, or over-arity Core refs |
| Rename ledger | N/A | Update `docs/plans/pre-renaming.md` when a rename is postponed or intentionally kept | No renames |
| Extracted-file inventory | N/A | Record untracked/extracted file command, row count, and bucket for every file in scope | No extracted-file work in this named type packet |
| Autoreview / review | N/A | Run review gate for non-trivial implementation diffs or record N/A | User requested implementation; focused proof was stronger than review-only pass |
| Final lint/check | yes | Run scoped lint/check or record N/A | `pnpm check:core` passed after `pnpm --filter @platejs/core lint:fix` |
| Changed list / top drift / needs attention | yes | Fill handoff ledgers | see changed list and needs attention below |
| Goal plan complete | yes | Run `node .agents/skills/autogoal/scripts/check-complete.mjs docs/plans/2026-06-30-plate-next-plugin-config-tx-generic-order.md` | pending final checker |

Review matrix:
| Path / API | Drift score | Verdict | Owner | Evidence | Next |
|------------|-------------|---------|-------|----------|------|
| `PluginConfig` generic order | 0 | hard-cut | Core plugin types | `PluginConfig<K,O,A,Tx,S>` in `SlatePlugin.ts`; Core typecheck passed | keep |
| `BasePluginConfig` / `PlatePluginConfig` dependent order | 0 | hard-cut | Core plugin types | no old six-argument order remains in Core AST audit | keep |
| docs examples | 0 | main-parity-cleanup | docs | docs source parity check passed | keep |

Best Plate v2 recommendation:
| Target | Recommended shape | Rejected legacy/hack alternatives | Reason | User-review need |
|--------|-------------------|-----------------------------------|--------|------------------|
| plugin type generics | `PluginConfig<K, Options, Api, Tx, Selectors>` | `_T` placeholder, `T` transform slot, keeping `Tx` last | tx is the active mutation surface; selectors are secondary | none |

Plite / Plate gap ledger:
| Gap type | Missing capability | Why local workaround is a hack | Smallest owner | Proof needed | Decision |
|----------|--------------------|-------------------------------|----------------|--------------|----------|
| N/A | none | no workaround needed | Core | Core typecheck and plugin tests | closed |

Related Core sweep ledger:
| Trigger correction | Sweep query / method | Matches | Patched | Deferred | Remaining risk |
|--------------------|----------------------|---------|---------|----------|----------------|
| generic order hard cut | AST scan for `PluginConfig`/`BasePluginConfig`/`PlatePluginConfig` over-arity in Core | 0 stale over-arity after patch | all stale Core refs patched | 0 | none |
| old transform-slot docs | `rg -n "InferTransforms|reserved slot|// Transforms|PluginConfig<K, O, A, T,..." packages/core/src packages/core/type-tests content/docs` | 0 stale hits after patch | docs/source patched | 0 | none |

Core drift ledger:
- Applies: N/A
- Manifest command: pending
- Manifest owner: `packages/core/src/**/*.{ts,tsx,mts,cts}`
- Optional type-test owner: `packages/core/type-tests/**/*.{ts,tsx,mts,cts}`
- Ledger location: this table or a linked artifact summarized here
- Expected row count: N/A
- Actual row count: N/A
- Missing row count: N/A
- Extra row count: N/A
- Score gate: N/A
- Top drift rows: none; named API packet only

Core file drift rows:
| Path | Drift score | Verdict | Owner | Evidence | Next |
|------|-------------|---------|-------|----------|------|
| N/A | N/A | N/A | N/A | broad Core sweep not requested | N/A |

Packet ledger:
| Packet | Owner | Hypothesis / smell | Files / commands | Decision | Next |
|--------|-------|--------------------|------------------|----------|------|
| plugin-generic-order | Core plugin types | old transform slot makes public generic order ambiguous | Core plugin types, factories, wrappers, type-tests, docs; `pnpm check:core` | keep | none |

Extracted file ledger:
| Path | Bucket | Origin/main owner check | Decision | Proof |
|------|--------|-------------------------|----------|-------|
| N/A | N/A | no extracted files | N/A | named API packet only |

Out-of-scope package drift:
| Package / command | Error summary | Why not blocking this run | Owner / next |
|-------------------|---------------|---------------------------|--------------|
| N/A | none | no non-Core errors | N/A |

Changed list:
| Group | Current-run changes |
|-------|---------------------|
| code/runtime/API | `PluginConfig`, `BasePluginConfig`, `PlatePluginConfig`, factories, wrappers, resolver validation, DOM/navigation configs now use `K,O,A,Tx,S` |
| tests/proof | Core type-tests updated for tx-before-selectors |
| docs/templates/skills | public docs examples and this plan updated |
| reverted/quarantined packets | none |

Needs your attention:
| Rank | Item | Why | Anchor | Recommendation |
|------|------|-----|--------|----------------|
| 1 | public generic order | breaking type shape, but intentional | `packages/core/src/lib/plugin/SlatePlugin.ts` | approve `PluginConfig<K, Options, Api, Tx, Selectors>` |
| 2 | browser proof N/A | Browser tools were not exposed in this turn; docs compiler proof passed | `content/docs/api/core/plate-plugin.mdx` | no action unless you want visual docs proof later |

Findings:
- No type regression found after the hard cut.

Decisions and tradeoffs:
- Keep no compatibility slot. `Tx` moves before selectors everywhere.

Error attempts:
| Error / failed attempt | Count | Next different move | Resolution |
|------------------------|-------|---------------------|------------|
| None yet | 0 | | |

Verification evidence:
- `pnpm --filter @platejs/core typecheck` passed.
- `pnpm --filter @platejs/core exec bun test src/lib/plugin/createBasePlugin.spec.ts src/lib/plugin/createBasePlugin.typed.spec.ts src/lib/plugin/getEditorPlugin.spec.ts src/react/plugin/toPlatePlugin.spec.ts src/react/plugin/createPlatePlugin.spec.ts` passed: 47 tests.
- `pnpm check:core` passed after formatter repair.
- `pnpm --filter www check:docs` passed.
- AST audit: no Core `PluginConfig` with more than five type arguments.
- Exact stale audit: no `InferTransforms`, `reserved slot`, `// Transforms`, or old `PluginConfig<K, O, A, T, ...>` pattern in Core source/type-tests/current docs.

Final handoff contract:
- target surface and mode: named Core public type API packet
- files/APIs reviewed: Core plugin config type aliases, base/react factories, wrappers, resolver validation, typed plugin configs, docs examples
- broad Core drift score coverage: N/A
- best Plate v2 recommendation: `PluginConfig<K, Options, Api, Tx, Selectors>`
- verdict matrix summary: hard-cut old transform slot; keep new order
- Plite/Plate gaps or blockers: none
- related Core sweep query/matches/patched/deferred: stale generic and transform-slot audits; 0 stale after patch
- changes made: see changed list
- tests/proof commands: see verification evidence
- old compatibility names audited: yes
- needs attention: only the public breaking type order for taste review
- next best Plate Next packet: continue Core review only if you want the next API surface

Reboot status:
| Question | Answer |
|----------|--------|
| Where am I? | Checkpoint zero |
| Where am I going? | Goal closure |
| What is the goal? | Hard-cut plugin generic order to tx-before-selectors |
| What have I learned? | Inference survives the new order; no Plite/Plate gap needed |
| What have I done? | Patched source, type-tests, docs, ran proof |

Timeline:
- 2026-06-30T17:13:21.620Z Goal plan created.
- 2026-06-30T17:20Z Patched Core plugin generic order and dependent factory/wrapper types.
- 2026-06-30T17:24Z Updated type-tests and docs examples.
- 2026-06-30T17:30Z `pnpm check:core` and docs check passed.

Open risks:
- None.
