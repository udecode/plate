# plate-next pluginInjectNodeProps spec

Objective:
Review and repair `pluginInjectNodeProps.spec.ts` so Plate Core tests keep
main-style inline inference without local helper types or `any` editor wrappers.

Goal plan:
docs/plans/2026-06-29-plate-next-plugininjectnodeprops-spec.md

Template:
docs/plans/templates/plate-next.md

Primary template:
docs/plans/templates/plate-next.md

Applied packs:
- none

Plate Next source:
- prompt / link: user named `packages/core/src/internal/plugin/pluginInjectNodeProps.spec.ts [$plate-next]`
- mode: named-file review packet with related same-class sweep
- target surface: `packages/core/src/internal/plugin/pluginInjectNodeProps.spec.ts`
- review target: best Plate v2 migration on top of Plite, not legacy
  compatibility
- broad Core sweep: N/A; user named one file, not `sweep` / `all core` / `full-loop`
- correction-triggered related Core sweep: required for inferred callback helper and test editor wrapper smells
- completion threshold summary: target spec keeps inline inference, same-class Core tests cleaned, focused tests and Core typecheck pass

First checkpoint:
- Copy every explicit prompt requirement into this plan before implementation:
  target, duration, non-goals, stop condition, proof commands, final handoff,
  and whether the user asked for `sweep`, `all core`, `full-loop`, or an
  equivalent broad Core review.
- If broad Core sweep is in scope, fill the Core drift ledger rows in this
  plan before closing any packet. Keep this template-only.

Timed checkpoint:
- requested duration: N/A
- semantics: N/A
- initial confidence score: 55; target spec had explicit helper types and `as any` editor wrappers
- improvement loop: source typing repaired, target spec cleaned, same-class React utility specs swept
- final score / loop closure: 95; scoped proof green, no broad Core review claimed

Completion threshold:
- Done when the target spec and same-class swept specs rely on source API inference, not local callback option aliases or editor-wrapper `any`, and focused/Core typecheck proof passes.
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
- `node .agents/skills/autogoal/scripts/check-complete.mjs docs/plans/2026-06-29-plate-next-plugininjectnodeprops-spec.md`
  passes after final evidence is recorded.

Verification surface:
- focused tests / commands: `pnpm --filter @platejs/core exec bun test src/internal/plugin/pluginInjectNodeProps.spec.ts src/react/utils/pipeRenderElement.spec.tsx src/react/utils/pluginRenderElement.spec.tsx src/internal/plugin/resolvePlugins.spec.tsx`
- package proof: `pnpm --filter @platejs/core typecheck`; final `pnpm check:core` planned
- source audits: `rg -n "createTestPlateEditor|type QueryOptions|type TransformPropsOptions|: QueryOptions|: TransformPropsOptions|: TransformOptions" packages/core/src ...`
- related Core sweep query / match count / patched count / deferred count:
  same-class query found 2 helper type aliases in `pipeRenderElement.spec.tsx` and 1 `createTestPlateEditor` wrapper in `pluginRenderElement.spec.tsx`; patched 3, deferred 0
- Plite/Plate gap ledger: no Plite gap; Plate typing gap was `createBasePlugin`/editor authoring input too recursive or incomplete
- broad Core drift ledger gate: N/A; named packet only
- final plan check: `node .agents/skills/autogoal/scripts/check-complete.mjs docs/plans/2026-06-29-plate-next-plugininjectnodeprops-spec.md`

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
- allowed edit scope: Core plugin/editor typing and same-class Core specs
- package/API surfaces: `createBasePlugin`, `createBaseEditor`, `createPlateEditor` authoring types
- docs/browser surfaces: N/A
- non-goals: broad Core drift sweep, rename pass, compatibility bridge work
- out-of-scope package errors: none seen

Output budget strategy:
- For broad Core sweep, use manifest counts and ledger artifacts instead of
  streaming every file path into chat.
- For named file/API work, use targeted `sed`/`rg` reads and capped output.

Blocked condition:
- N/A; no blocker remained after source typing repair.

Current verdict:
- verdict: main-parity-cleanup
- confidence: 95
- next owner: plate-next
- keep / revert / quarantine call: keep
- reason: removes migration typing hacks and keeps inline inference green

Phase / pass table:
| Phase | Status | Evidence |
|-------|--------|----------|
| Named file review and same-class sweep | done | Target spec cleaned, same-class React specs patched, focused tests and Core typecheck green |

Start Gates:
| Gate | Applies | Evidence |
|------|---------|----------|
| Prompt requirements captured before work | yes | Exact target copied from prompt; no duration or final handoff section provided |
| `plate-next` skill/rule read | yes | `.agents/skills/plate-next/SKILL.md` read |
| Active goal checked or created | N/A | Scratchpad plan only; no thread goal created |
| Mode classified as named packet vs broad Core sweep | yes | Named-file packet |
| Review target recorded as best Plate v2 / Plite-fit / no legacy compat | yes | Main-parity cleanup, no compat shim |
| Broad Core drift ledger initialized when in scope | N/A | User named one file |
| Source of truth and allowed workspace recorded | yes | Root `VISION.md`, `docs/vision/plate.md`, `docs/vision/common.md`, target source, `origin/main` comparison |
| Output budget strategy recorded | yes | Targeted file reads and focused proof only |
| Public API fork routing checked | yes | No public API fork; authoring type repair only |
| Gap policy checked | yes | Plate typing gap patched at owner |
| Related Core sweep policy checked | yes | Same-class query recorded below |
| Review-mode rename freeze checked | yes | No renames |

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
| Named verification threshold | yes | Run the proof commands named in this plan | Focused tests and Core typecheck passed; `pnpm check:core` planned final |
| Broad Core drift ledger coverage | N/A | Record manifest command, expected row count, actual row count, missing row count, and extra row count when broad Core sweep applies | Named-file packet, no broad sweep |
| Score gate | yes | Prove all scores are valid and high drift is owned/fixed/deferred in the plan ledger | Only score 2 rows; all patched |
| Best Plate v2 recommendation | yes | Record the recommended current shape and rejected legacy/hack alternatives for the reviewed target | Main-parity cleanup: infer at call sites, repair owner types |
| Plite/Plate gap ledger | yes | Record blockers or N/A when no gap blocks the target | Plate typing gap patched |
| Related Core sweep after correction | yes | For each correction, run and record same-class Core search/review results | Query and counts recorded |
| Package/API proof | yes | Run focused typecheck/test/build or record N/A | Core typecheck passed |
| Non-Core package error triage | N/A | If a proof command reports non-Core failures, classify as named/touched/Core-regression or out-of-scope package drift | No non-Core proof run |
| Source audit | yes | Run exact audit for removed compatibility names or record N/A | Same-class helper audit recorded |
| Rename ledger | N/A | Update `docs/plans/pre-renaming.md` when a rename is postponed or intentionally kept | No rename |
| Extracted-file inventory | yes | Record untracked/extracted file command, row count, and bucket for every file in scope | Command returned 0 rows |
| Autoreview / review | N/A | Run review gate for non-trivial implementation diffs or record N/A | Focused type/API packet; no separate autoreview requested |
| Final lint/check | yes | Run scoped lint/check or record N/A | `pnpm check:core` final planned |
| Changed list / top drift / needs attention | yes | Fill handoff ledgers | Filled below |
| Goal plan complete | yes | Run `node .agents/skills/autogoal/scripts/check-complete.mjs docs/plans/2026-06-29-plate-next-plugininjectnodeprops-spec.md` | Final planned |

Review matrix:
| Path / API | Drift score | Verdict | Owner | Evidence | Next |
|------------|-------------|---------|-------|----------|------|
| `packages/core/src/internal/plugin/pluginInjectNodeProps.spec.ts` | 2 | main-parity-cleanup | Plate Core tests | Explicit callback helper types and `as any` editor wrappers differed from main-style inference | Patched |
| `packages/core/src/lib/editor/withPlite.ts#createBaseEditor` | 2 | Plate gap patched | Plate Core editor authoring types | Inline plugin construction hit TS2589 because plugin tuple inference walked method-heavy types | Patched with lightweight authoring plugin input |
| `packages/core/src/react/editor/withPlate.ts#createPlateEditor` | 2 | Plate gap patched | Plate React editor authoring types | Same authoring boundary needed to remove test `createTestPlateEditor(options: any)` wrappers | Patched |
| `packages/core/src/lib/plugin/createBasePlugin.ts` | 2 | Plate gap patched | Plate plugin authoring types | `inject.nodeProps`/`render` callbacks needed contextual typing without test aliases | Patched |
| `packages/core/src/react/utils/pipeRenderElement.spec.tsx` | 2 | main-parity-cleanup | Plate React tests | Same local callback helper types and editor-wrapper smell | Patched |
| `packages/core/src/react/utils/pluginRenderElement.spec.tsx` | 2 | main-parity-cleanup | Plate React tests | Same `createTestPlateEditor(options: any)` smell and explicit render prop type | Patched |

Best Plate v2 recommendation:
| Target | Recommended shape | Rejected legacy/hack alternatives | Reason | User-review need |
|--------|-------------------|-----------------------------------|--------|------------------|
| Plugin/render inject specs | Keep inline `createBasePlugin` / `createBaseEditor` / `createPlateEditor` call sites inferred | Local `QueryOptions`, `TransformPropsOptions`, `createTestPlateEditor(options: any)`, explicit render prop annotations | Tests are API proofs; if inference fails, source owner is wrong | Low |

Plite / Plate gap ledger:
| Gap type | Missing capability | Why local workaround is a hack | Smallest owner | Proof needed | Decision |
|----------|--------------------|-------------------------------|----------------|--------------|----------|
| Plate gap | Editor/plugin authoring input too recursive or incomplete for inline plugin literals | Test aliases hide the public authoring DX regression | `createBaseEditor`, `createPlateEditor`, `createBasePlugin` types | Core typecheck plus affected specs | Patched |

Related Core sweep ledger:
| Trigger correction | Sweep query / method | Matches | Patched | Deferred | Remaining risk |
|--------------------|----------------------|---------|---------|----------|----------------|
| Removed explicit callback helper types from target spec | `rg -n "createTestPlateEditor|type QueryOptions|type TransformPropsOptions|: QueryOptions|: TransformPropsOptions|: TransformOptions" packages/core/src ...` | 3 same-class test workarounds plus legitimate source type definitions | 3 | 0 | Legitimate source `TransformOptions` types remain |

Core drift ledger:
- Applies: N/A
- Manifest command: N/A; named-file packet
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
| N/A | N/A | N/A | N/A | Broad Core sweep not requested | N/A |

Packet ledger:
| Packet | Owner | Hypothesis / smell | Files / commands | Decision | Next |
|--------|-------|--------------------|------------------|----------|------|
| Inference cleanup | Plate Core typing | Tests were shaped around type weakness instead of proving authoring DX | Target spec, same-class React specs, editor/plugin authoring types | keep | Run final Core check |

Extracted file ledger:
| Path | Bucket | Origin/main owner check | Decision | Proof |
|------|--------|-------------------------|----------|-------|
| N/A | N/A | `git ls-files --others --exclude-standard packages/core/src/internal/plugin packages/core/src/lib/plugin` returned 0 rows | No extracted files in target owner scope | Command returned no output |

Out-of-scope package drift:
| Package / command | Error summary | Why not blocking this run | Owner / next |
|-------------------|---------------|---------------------------|--------------|
| N/A | N/A | No non-Core package command run | N/A |

Changed list:
| Group | Current-run changes |
|-------|---------------------|
| code/runtime/API | `createBaseEditor`/`createPlateEditor` authoring option inference; `createBasePlugin` inject/render authoring input |
| tests/proof | Removed local helper types and `any` editor wrappers from target and same-class specs |
| docs/templates/skills | This Plate Next plan |
| reverted/quarantined packets | Reverted failed global `BasePluginInput` lightening; kept local authoring-boundary fix |

Needs your attention:
| Rank | Item | Why | Anchor | Recommendation |
|------|------|-----|--------|----------------|
| 1 | `createBasePlugin` authoring type stays intentionally looser than resolved plugin type | Authoring input needs inference and metadata flexibility; resolved plugin type remains stricter after normalization | `packages/core/src/lib/plugin/createBasePlugin.ts` | Keep unless later Plate v2 type design chooses a separate public builder input type |

Findings:
- Target spec drift was real: explicit helper types hid a Plate authoring typing gap.
- `createBaseEditor`/`createPlateEditor` should infer return plugin APIs from plugin tuples without recursively typing the whole options object from those plugins.
- `createBasePlugin` authoring input needs contextual typing for `inject.nodeProps` and `render.node/as`; tests should not supply local callback option aliases.

Decisions and tradeoffs:
- Keep main-style inline tests. Fix source typing when inline inference fails.
- Keep render cache metadata permissive in authoring input; do not over-type test metadata as final runtime behavior.

Error attempts:
| Error / failed attempt | Count | Next different move | Resolution |
|------------------------|-------|---------------------|------------|
| Lightweight `BasePluginInput` globally | 1 | Scope the light type to `createBaseEditor` authoring input only | Reverted global change; local authoring type kept |
| `BasePlugin['render']` as direct authoring type | 1 | Use a custom authoring render type | Patched to type `node/as` and allow render metadata |

Verification evidence:
- `pnpm --filter @platejs/core typecheck` passed.
- `pnpm --filter @platejs/core exec bun test src/internal/plugin/pluginInjectNodeProps.spec.ts src/react/utils/pipeRenderElement.spec.tsx src/react/utils/pluginRenderElement.spec.tsx src/internal/plugin/resolvePlugins.spec.tsx` passed: 70 tests.
- `pnpm check:core` passed after formatting fix.

Final handoff contract:
- target surface and mode: named-file Plate Next review packet
- files/APIs reviewed: target spec, `createBaseEditor`, `createPlateEditor`, `createBasePlugin`, same-class React render specs
- broad Core drift score coverage: N/A; not requested
- best Plate v2 recommendation: keep inline inferred test/plugin authoring, repair source typing
- verdict matrix summary: main-parity-cleanup plus Plate typing gap patched
- Plite/Plate gaps or blockers: no remaining blocker
- related Core sweep query/matches/patched/deferred: query recorded above; 3 same-class workarounds patched; 0 deferred
- changes made: listed above
- tests/proof commands: listed above plus final `pnpm check:core`
- old compatibility names audited: same-class helper/wrapper audit done
- needs attention: authoring input looseness is intentional but worth later type-design review
- next best Plate Next packet: continue reviewing Core files only when user points at the next file/API

Reboot status:
| Question | Answer |
|----------|--------|
| Where am I? | Checkpoint zero |
| Where am I going? | Named-file Plate Next closure |
| What is the goal? | Keep plugin inject/render specs inference-first without local type cheats |
| What have I learned? | See Findings |
| What have I done? | See Timeline |

Timeline:
- 2026-06-29T10:52:54.734Z Goal plan created.
- Read Plate Next, vision files, target spec, source typing, and origin/main.
- Removed target spec helper aliases and editor `as any` wrappers.
- Patched editor/plugin authoring types so inline tests typecheck.
- Swept same-class helper/wrapper smells in React render specs.

Open risks:
- `createBasePlugin` authoring input is intentionally not identical to the resolved plugin type. That is correct for now, but a later Plate v2 public type pass can make it more explicit if desired.
