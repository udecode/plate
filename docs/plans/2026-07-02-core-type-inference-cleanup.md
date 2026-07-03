# core type inference cleanup

Objective:
Maximize `packages/core` type inference; done when avoidable callback parameter annotations are removed or justified and Core proof passes.

Goal plan:
docs/plans/2026-07-02-core-type-inference-cleanup.md

Template:
docs/plans/templates/plate-next.md

Primary template:
docs/plans/templates/plate-next.md

Applied packs:
- none

Plate Next source:
- prompt / link: user asked: "repair maximize type inference in packages/core , find all places"
- mode: one-shot execution
- target surface: `packages/core`
- review target: best Plate v2 migration on top of Plite, not legacy
  compatibility
- broad Core sweep: no, this is a same-class inference audit across Core, not file-by-file drift scoring
- correction-triggered related Core sweep: yes, audit explicit callback parameter annotations and local inference substitutes
- completion threshold summary: zero avoidable explicit callback parameter annotations in `packages/core`; remaining annotations justified; `pnpm check:core` passes

First checkpoint:
- Copy every explicit prompt requirement into this plan before implementation:
  target, duration, non-goals, stop condition, proof commands, final handoff,
  and whether the user asked for `sweep`, `all core`, `full-loop`, or an
  equivalent broad Core review.
- If broad Core sweep is in scope, fill the Core drift ledger rows in this
  plan before closing any packet. Keep this template-only.

Timed checkpoint:
- requested duration: none
- semantics: not timed
- initial confidence score: 78/100 before audit
- improvement loop: scan, classify, patch owner typing, rerun proof
- final score / loop closure: 96/100 after Core proof and inference audits

Completion threshold:
- `packages/core` callback sites no longer annotate inferred callback parameters merely to silence TypeScript.
- Explicit annotations that remain are justified as exported signatures, public helper signatures, external-library callback boundaries, or unavoidable test type assertions.
- Same-class searches cover `EditorUpdateTransaction`, typed callback params, local `Parameters<>`/fixture/helper substitutions, broad `as any` around callback inference, and `unknown` callback shims in `packages/core`.
- `pnpm check:core` passes after changes.
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
- `node .agents/skills/autogoal/scripts/check-complete.mjs docs/plans/2026-07-02-core-type-inference-cleanup.md`
  passes after final evidence is recorded.

Verification surface:
- focused tests / commands: `pnpm check:core`
- package proof: Core/Plite typecheck, lint, and tests through `pnpm check:core`
- source audits: `rg` searches for explicit inferred callback annotations and local inference substitutes under `packages/core`
- related Core sweep query / match count / patched count / deferred count:
  recorded below
- Plite/Plate gap ledger: no API gap found; owner typing patched directly
- broad Core drift ledger gate: not applicable: same-class inference audit, not full Core drift review
- final plan check: `node .agents/skills/autogoal/scripts/check-complete.mjs docs/plans/2026-07-02-core-type-inference-cleanup.md`

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
- allowed edit scope: `packages/core/**`; Plite owner types may be touched only if required to make Core inference work correctly
- package/API surfaces: Core plugin/editor/update callback typing
- docs/browser surfaces: not in scope unless public API docs are made false by a type/API change
- non-goals: broad Plate package migration, public API redesign, rename pass, browser route proof
- out-of-scope package errors: ignore non-Core packages unless caused by this Core/API change

Output budget strategy:
- For broad Core sweep, use manifest counts and ledger artifacts instead of
  streaming every file path into chat.
- For named file/API work, use targeted `sed`/`rg` reads and capped output.

Blocked condition:
- Stop only if clean inference requires a public Plate/Plite API fork that needs user review; otherwise patch the owner typing and continue.

Current verdict:
- verdict: accepted execution
- confidence: 0.78 before audit
- next owner: plate-next
- keep / revert / quarantine call: keep only changes that improve inference and keep Core proof green
- reason: explicit callback params in inferred APIs are type regression and hide broken owner generics

Start Gates:
| Gate | Applies | Evidence |
|------|---------|----------|
| Prompt requirements captured before work | yes | `packages/core` type-inference cleanup, find all places |
| `plate-next` skill/rule read | yes | `.agents/skills/plate-next/SKILL.md` read |
| Active goal checked or created | yes | Active goal created for this plan |
| Mode classified as named packet vs broad Core sweep | yes | Same-class inference audit across Core, not broad drift scoring |
| Review target recorded as best Plate v2 / Plite-fit / no legacy compat | yes | Fix owner typing, no local callback annotations to silence TS |
| Broad Core drift ledger initialized when in scope | no | Not applicable: not a full file-by-file Core sweep |
| Source of truth and allowed workspace recorded | yes | `/Users/zbeyens/git/plate-2`, `packages/core` |
| Output budget strategy recorded | yes | Use focused `rg` and capped reads |
| Public API fork routing checked | yes | Route only if clean inference needs API fork |
| Gap policy checked | yes | Name Plite/Plate gap instead of local workaround |
| Related Core sweep policy checked | yes | Same-class searches across `packages/core/src` and `packages/core/type-tests` |
| Review-mode rename freeze checked | yes | No rename pass |

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

Completion Gates:
| Gate | Applies | Required action | Evidence |
|------|---------|-----------------|----------|
| Named verification threshold | yes | Run the proof commands named in this plan | `pnpm check:core` passed |
| Broad Core drift ledger coverage | no | Record manifest only for broad file-by-file drift sweeps | N/A: same-class inference audit only |
| Score gate | no | Prove all scores only for broad drift sweeps | N/A: no broad drift scoring in scope |
| Best Plate v2 recommendation | yes | Record recommended current shape and rejected legacy/hack alternatives | Use owner generic inference; reject call-site tx annotations and `ReturnType<typeof createBasePlugin>` helper broadening |
| Plite/Plate gap ledger | yes | Record blockers or N/A when no gap blocks the target | No API gap found; patched Core owner types |
| Related Core sweep after correction | yes | Run and record same-class Core search/review results | See related Core sweep ledger |
| Package/API proof | yes | Run focused typecheck/test/build or record N/A | `pnpm turbo typecheck --filter=./packages/core`; focused Bun tests; `pnpm check:core` |
| Non-Core package error triage | yes | Classify non-Core failures when reported | No failing non-Core package after final proof |
| Source audit | yes | Run exact audit for removed compatibility names or record N/A | Source audits listed below |
| Rename ledger | no | Update `docs/plans/pre-renaming.md` when a rename is postponed or intentionally kept | N/A: no rename packet |
| Extracted-file inventory | no | Record untracked/extracted file inventory for extraction work | N/A: no extracted-file recovery packet |
| Autoreview / review | no | Run review gate for non-trivial implementation diffs or record N/A | N/A: scoped type-system repair with full Core proof |
| Final lint/check | yes | Run scoped lint/check or record N/A | `pnpm check:core` passed |
| Changed list / top drift / needs attention | yes | Fill handoff ledgers | Changed list and risks recorded below |
| Goal plan complete | yes | Run `node .agents/skills/autogoal/scripts/check-complete.mjs docs/plans/2026-07-02-core-type-inference-cleanup.md` | Ready to run after this update |

Review matrix:
| Path / API | Drift score | Verdict | Owner | Evidence | Next |
|------------|-------------|---------|-------|----------|------|
| `extendPlateEditor` / `CreatePlateEditorOptions` | 1 | keep | Core React editor typing | Plugin tuples now infer through existing editor plugins and new plugin inputs; no explicit generics in touched specs | keep |
| Base plugin config state slot | 1 | keep | Core plugin typing | `InferState` and state-preserving `PluginConfig` let history/runtime state survive plugin wrapping | keep |
| `getInjectMatch` | 1 | keep | Core utility | Helper only depends on `inject`, so it no longer forces full plugin variance | keep |
| React `NavigationFeedbackPlugin` | 1 | keep | React plugin adapter | Removed `(toPlatePlugin as any)` and kept `duration` option inference green | keep |
| `editor.update` / `extendTx` callback sites | 0 | cut annotation smell | Core codebase | zero matches for explicit `EditorUpdateTransaction` annotations in inferred callback sites | keep clean |

Best Plate v2 recommendation:
| Target | Recommended shape | Rejected legacy/hack alternatives | Reason | User-review need |
|--------|-------------------|-----------------------------------|--------|------------------|
| Core plugin/editor inference | Infer from plugin tuples, `__config`, and extension state groups | Manual callback annotations, helper return-type broadening, `as any` adapters in user-facing plugin wrappers | Inference should prove owner types are right; call-site annotations hide broken owner generics | no |

Plite / Plate gap ledger:
| Gap type | Missing capability | Why local workaround is a hack | Smallest owner | Proof needed | Decision |
|----------|--------------------|-------------------------------|----------------|--------------|----------|
| none | none | no local workaround needed | Core owner types | Core typecheck and focused tests | closed |

Related Core sweep ledger:
| Trigger correction | Sweep query / method | Matches | Patched | Deferred | Remaining risk |
|--------------------|----------------------|---------|---------|----------|----------------|
| tx callback annotations | `rg -n "extendPlateEditor<|editor\\.update<|\\((tx|transaction):\\s*EditorUpdateTransaction|extendTx...` | 0 | 7 earlier call-site annotations removed | 0 | none in target pattern |
| factory return-type broadening | `rg -n "ReturnType<typeof createBasePlugin>|ReturnType<typeof createPlatePlugin>|ReturnType<typeof extendPlateEditor>"` | 0 | `getInjectMatch.spec.ts` helper patched | 0 | none |
| unsafe plugin adapter casts | `rg -n "toPlatePlugin as any|createPlatePlugin as any|createBasePlugin as any|extendPlateEditor<"` | 3 | `NavigationFeedbackPlugin` cast removed | 3 justified boundary casts remain | React DOM base plugin, root plugin factory, generic getPlugin fallback still need separate boundary cleanup if desired |
| callback any annotations | `rg -n "\\((editor|state|tx|transaction):\\s*any\\)|\\((editor|state|tx|transaction):\\s*unknown\\)"` | 1 | user-facing cases removed | 1 justified internal factory boundary | `createBasePlugin` implementation still invokes config through erased runtime shape |

Core drift ledger:
- Applies: no
- Manifest command: N/A for this same-class inference audit
- Manifest owner: `packages/core/src/**/*.{ts,tsx,mts,cts}`
- Optional type-test owner: `packages/core/type-tests/**/*.{ts,tsx,mts,cts}`
- Ledger location: this table or a linked artifact summarized here
- Expected row count: N/A
- Actual row count: N/A
- Missing row count: N/A
- Extra row count: N/A
- Score gate: N/A
- Top drift rows: N/A

Core file drift rows:
| Path | Drift score | Verdict | Owner | Evidence | Next |
|------|-------------|---------|-------|----------|------|
| N/A | N/A | not a broad drift sweep | N/A | same-class inference audit only | N/A |

Packet ledger:
| Packet | Owner | Hypothesis / smell | Files / commands | Decision | Next |
|--------|-------|--------------------|------------------|----------|------|
| Remove inferred tx annotations | Core | Explicit tx annotations masked weak owner inference | `withPlite.ts`, `pipeInsertFragment.ts`, `resolvePlugins.ts`, input rules, length, DOM base | keep | done |
| Preserve plugin state/api/tx inference | Core plugin types | Plate wrapping lost extension state and plugin tuple inference | `SlatePlugin.ts`, `BasePlugin.ts`, `createBasePlugin.ts`, `PlatePlugin.ts`, `SlateEditor.ts`, `withPlate.ts` | keep | done |
| Fix helper/test inference loss | Core utility/tests | `ReturnType<typeof createBasePlugin>` and full-plugin helper variance erased concrete configs | `getInjectMatch.ts`, `getInjectMatch.spec.ts` | keep | done |
| Remove navigation plugin adapter erasure | React Core plugin | `(toPlatePlugin as any)` erased `duration` option inference | `NavigationFeedbackPlugin.ts`, spec | keep | done |

Phase / pass table:
| Phase | Status | Evidence |
|-------|--------|----------|
| Prompt checkpoint | done | Explicit target, scope, stop condition, proof, and non-goals copied into this plan |
| Inference audit | done | Focused `rg` sweeps recorded above |
| Type owner repair | done | Core plugin/editor/helper types patched |
| Focused tests | done | 50 tests passed across 6 touched files |
| Core proof | done | `pnpm check:core` passed |

Verification evidence:
- `pnpm turbo typecheck --filter=./packages/core` passed.
- `pnpm --filter @platejs/core exec bun test src/lib/editor/withPlite.spec.ts src/react/editor/TPlateEditor.spec.ts src/react/editor/TPlateEditorCore.spec.ts src/lib/plugin/createBasePlugin.typed.spec.ts src/lib/utils/getInjectMatch.spec.ts src/react/plugins/navigation-feedback/NavigationFeedbackPlugin.spec.tsx` passed: 50 tests, 183 expects.
- `pnpm check:core` passed: Core + Plite typecheck and lint, Core tests 705 pass, Plite tests 1889 pass / 85 skip.
- Source audit: inferred tx callback annotation query returned 0 matches.
- Source audit: `ReturnType<typeof createBasePlugin>` / `createPlatePlugin` / `extendPlateEditor` helper broadening query returned 0 matches.
- Source audit: unsafe factory adapter query has 3 remaining matches, all implementation boundaries not introduced as user-facing callback inference.
- Source audit: callback `any` annotation query has 1 remaining match in `createBasePlugin` implementation boundary.

Reboot status:
- Fresh continuation should start from `packages/core` type owner cleanup already green under `pnpm check:core`. No running command remains.

Open risks:
- Three factory-boundary casts remain in Core: React DOM plugin adapter, root plugin factory, and generic plugin fallback. They are not callback-inference leaks, but they are future type-cleanup candidates.
- Broad React/test `as any` usage remains outside this scoped inference packet.

Extracted file ledger:
| Path | Bucket | Origin/main owner check | Decision | Proof |
|------|--------|-------------------------|----------|-------|
| N/A | N/A | N/A | N/A | No extracted-file recovery packet in scope |

Out-of-scope package drift:
| Package / command | Error summary | Why not blocking this run | Owner / next |
|-------------------|---------------|---------------------------|--------------|
| N/A | No out-of-scope package failure after final proof | N/A | N/A |

Changed list:
| Group | Current-run changes |
|-------|---------------------|
| code/runtime/API | Core plugin/editor inference types, state-preserving plugin configs, `extendPlateEditor` plugin tuple inference, `getInjectMatch` structural helper boundary, React navigation plugin adapter typing |
| tests/proof | Removed inference-killing helper types/generics in touched specs and kept focused tests green |
| docs/templates/skills | This autogoal plan updated with proof and audits |
| reverted/quarantined packets | None |

Needs your attention:
| Rank | Item | Why | Anchor | Recommendation |
|------|------|-----|--------|----------------|
| 1 | Remaining factory-boundary casts | Not user-facing inference leaks, but still type debt | `ReactPlugin`, root plugin factory, generic getPlugin fallback | Separate boundary cleanup packet if desired |
| 2 | Broad React/test `as any` usage | Outside this scoped callback-inference cleanup | many React/test utility files | Do not mix into this packet; run a dedicated strict-test cleanup later |

Findings:
- Core owner types were the real problem. Call-site tx annotations and `ReturnType<typeof createBasePlugin>` helper types were hiding weak inference.

Decisions and tradeoffs:
- Keep exported helper signatures where they define a public boundary.
- Cut inferred callback parameter annotations at call sites.
- Do not chase broad historical React/test `as any` in this packet.

Error attempts:
| Error / failed attempt | Count | Next different move | Resolution |
|------------------------|-------|---------------------|------------|
| `Pick<BasePlugin, 'inject'>` still dragged generic variance into `getInjectMatch` | 1 | Use an exact structural `inject` shape | Fixed |
| `check:core` first failed on formatter/import cleanup after typecheck passed | 1 | Apply formatter shape and remove unused imports | Fixed |

Verification evidence:
- `pnpm turbo typecheck --filter=./packages/core` passed.
- Focused Bun tests passed: 50 tests across 6 touched files.
- `pnpm check:core` passed.

Final handoff contract:
- target surface and mode: `packages/core` same-class type inference cleanup
- files/APIs reviewed: Core plugin/editor/update callback typing, `extendPlateEditor`, base plugin config/state, `getInjectMatch`, navigation feedback adapter
- broad Core drift score coverage: N/A, not a broad drift sweep
- best Plate v2 recommendation: owner generic inference first; no call-site tx annotations to hide broken owner types
- verdict matrix summary: keep current inference repairs
- Plite/Plate gaps or blockers: none
- related Core sweep query/matches/patched/deferred: recorded in sweep ledger
- changes made: recorded in changed list
- tests/proof commands: Core typecheck, focused Bun tests, `pnpm check:core`
- old compatibility names audited: N/A, no compatibility-name cut
- needs attention: remaining factory-boundary casts if you want a follow-up
- next best Plate Next packet: optional boundary-cast cleanup, not required for this goal

Reboot status:
| Question | Answer |
|----------|--------|
| Where am I? | Inference cleanup complete |
| Where am I going? | Optional boundary-cast cleanup only if requested |
| What is the goal? | Maximize Core inference without hiding owner type bugs |
| What have I learned? | Core owner generics, not local call-site annotations, needed repair |
| What have I done? | See Timeline |

Timeline:
- 2026-07-02T08:49:54.172Z Goal plan created.
- 2026-07-02 Core inference audit, owner type repair, focused tests, and `check:core` completed.

Open risks:
- Remaining type debt is outside this scoped inference goal: factory-boundary casts and broad React/test `as any` usage.
