# plate-next PlateTest PlateContent review

Objective:
Review PlateTest and PlateContent drift; done when both are compared to
origin/main, patched or cleared, and focused Core proof passes.

Goal plan:
docs/plans/2026-07-04-plate-next-platetest-platecontent-review.md

Template:
docs/plans/templates/plate-next.md

Primary template:
docs/plans/templates/plate-next.md

Applied packs:
- none

Plate Next source:
- prompt / link: user asked: "deep review it has 0 drift regression vs. from
  main? fully clean ? [$plate-next]"
- mode: named file/API review packet
- target surface:
  `packages/core/src/react/components/PlateTest.tsx` and
  `packages/core/src/react/components/PlateContent.tsx`
- review target: best Plate v2 migration on top of Plite, not legacy
  compatibility
- broad Core sweep: N/A: user named two files, not `sweep`, `all core`, or
  `full-loop`
- correction-triggered related Core sweep: required only if this run patches a
  same-class smell
- completion threshold summary: both files compared against `origin/main`, each
  reviewed for Plite/Plate boundary drift, legacy/hack drift, type drift, and
  behavior regression; safe fixes applied; focused proof recorded

First checkpoint:
- Copy every explicit prompt requirement into this plan before implementation:
  target, duration, non-goals, stop condition, proof commands, final handoff,
  and whether the user asked for `sweep`, `all core`, `full-loop`, or an
  equivalent broad Core review.
- If broad Core sweep is in scope, fill the Core drift ledger rows in this
  plan before closing any packet. Keep this template-only.

Timed checkpoint:
- requested duration: N/A: no duration requested
- semantics: N/A
- initial confidence score: N/A: named-file review uses review matrix instead
- improvement loop: N/A
- final score / loop closure: N/A

Completion threshold:
- `PlateTest.tsx` and `PlateContent.tsx` have review-matrix rows with verdict,
  owner, evidence, and next action.
- Current files are compared to `origin/main` before any cleanup claim.
- Any behavior/API drift is fixed or recorded as an explicit Plite/Plate gap.
- No `any`/compat/bridge/wrapper workaround is kept in those files without a
  named owner and deletion gate.
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
- `node .agents/skills/autogoal/scripts/check-complete.mjs docs/plans/2026-07-04-plate-next-platetest-platecontent-review.md`
  passes after final evidence is recorded.

Verification surface:
- focused tests / commands: source comparison, caller/test search, focused
  Core tests if files changed, then Core typecheck/lint as needed
- package proof: `pnpm --filter @platejs/core typecheck`; lint/test if code
  changes or source findings require it
- source audits: exact audit for local hacks in target files:
  `as any|editor\\.tf|getTransforms|getPluginApi|command fallback`
- related Core sweep query / match count / patched count / deferred count:
  N/A until a correction is made
- Plite/Plate gap ledger: fill `N/A: no gap` or exact gap after source review
- broad Core drift ledger gate: N/A: named-file packet
- final plan check: `node .agents/skills/autogoal/scripts/check-complete.mjs docs/plans/2026-07-04-plate-next-platetest-platecontent-review.md`

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
- allowed edit scope: target files, directly related focused tests, and direct
  source owner if a target-file review exposes a real Plite/Plate gap
- package/API surfaces: `@platejs/core` React component layer
- docs/browser surfaces: N/A unless the files expose docs-facing behavior
- non-goals: no broad Core sweep, no rename pass, no unrelated package cleanup,
  no old-API compatibility preservation
- out-of-scope package errors: ignore non-Core failures unless caused by this
  packet

Output budget strategy:
- For broad Core sweep, use manifest counts and ledger artifacts instead of
  streaming every file path into chat.
- For named file/API work, use targeted `sed`/`rg` reads and capped output.

Blocked condition:
- Stop only if a clean target-file fix requires a public API fork that must be
  planned first, or if focused proof cannot run because the owning toolchain is
  unavailable after one targeted retry.

Current verdict:
- verdict: scoped clean after patch
- confidence: high for the named files; one explicit Plate/Plite adapter gap
  remains documented below
- next owner: plate-next
- keep / revert / quarantine call: keep current packet, defer the
  PlateContent decorate adapter gap to the Plate/Plite editable adapter owner
- reason: both requested files were compared to `origin/main`; unsafe drift was
  patched; focused Core tests, typecheck, lint, and source audits passed

Phase / pass table:
| Phase | Status | Evidence |
|-------|--------|----------|
| Checkpoint zero | complete | Prompt requirements, scope, proof, stop condition, and non-goals recorded before implementation |
| `origin/main` comparison | complete | `git show origin/main:...PlateTest.tsx`, `...PlateContent.tsx`, and `...ContentVisibilityChunk.tsx` reviewed |
| Target cleanup | complete | `PlateTest.tsx`, `PlateContent.tsx`, and related `ContentVisibilityChunk.tsx` patched |
| Related source owner fix | complete | `withPlate.ts` inference patched so `createPlateEditor` includes Plate core plugins |
| Focused proof | complete | Core component tests, editor type specs, package typecheck, package lint, and source audits passed |
| Goal closure | complete | This plan records final matrix, gaps, changed files, risks, and handoff |

Start Gates:
| Gate | Applies | Evidence |
|------|---------|----------|
| Prompt requirements captured before work | yes | exact target, scope, non-goals, and proof contract recorded above |
| `plate-next` skill/rule read | yes | `.agents/skills/plate-next/SKILL.md` read fully |
| Active goal checked or created | yes | `create_goal` active for this plan |
| Mode classified as named packet vs broad Core sweep | yes | named file/API packet |
| Review target recorded as best Plate v2 / Plite-fit / no legacy compat | yes | constraints and source rows above |
| Broad Core drift ledger initialized when in scope | no | N/A: not broad Core sweep |
| Source of truth and allowed workspace recorded | yes | source truth `origin/main`, workspace `/Users/zbeyens/git/plate-2` |
| Output budget strategy recorded | yes | targeted reads/searches only |
| Public API fork routing checked | yes | route to `plate-plan` only if review exposes a public API fork |
| Gap policy checked | yes | gap ledger required below |
| Related Core sweep policy checked | yes | required after any correction |
| Review-mode rename freeze checked | yes | no rename pass in scope |

Work Checklist:
- [x] First checkpoint complete: every explicit prompt requirement, scope
      boundary, timing constraint, stop condition, deliverable, final handoff
      section, verification surface, and success criterion is copied into this
      plan before implementation. Evidence: checkpoint rows above.
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
| Named verification threshold | yes | Run the proof commands named in this plan | focused tests, type specs, typecheck, lint, and audits passed |
| Broad Core drift ledger coverage | no | Record manifest command only when broad Core sweep applies | N/A: user named two files, not a broad Core sweep |
| Score gate | yes | Prove named-file scores are valid and high drift is owned/fixed/deferred | review matrix below; `ContentVisibilityChunk` drift fixed, adapter gap deferred with owner |
| Best Plate v2 recommendation | yes | Record the recommended current shape and rejected legacy/hack alternatives for the reviewed target | recommendation table below |
| Plite/Plate gap ledger | yes | Record blockers or N/A when no gap blocks the target | one Plate editable decoration adapter gap recorded |
| Related Core sweep after correction | yes | For each correction, run and record same-class Core search/review results | sweep rows below |
| Package/API proof | yes | Run focused typecheck/test/build or record N/A | `pnpm --filter @platejs/core typecheck` and lint passed |
| Non-Core package error triage | no | If a proof command reports non-Core failures, classify them | N/A: scoped Core commands only |
| Source audit | yes | Run exact audit for removed compatibility names or record N/A | exact target audit returned no matches |
| Rename ledger | no | Update `docs/plans/pre-renaming.md` when a rename is postponed or intentionally kept | N/A: no rename pass or postponed rename |
| Extracted-file inventory | yes | Record untracked/extracted file command, row count, and bucket for every file in scope | one new proof file inventoried below |
| Autoreview / review | no | Run review gate for non-trivial implementation diffs or record N/A | N/A: user requested `plate-next`; source comparison plus proof is this packet's review gate |
| Final lint/check | yes | Run scoped lint/check or record N/A | `pnpm --filter @platejs/core lint` passed |
| Changed list / top drift / needs attention | yes | Fill handoff ledgers | changed list and attention rows below |
| Goal plan complete | yes | Run `node .agents/skills/autogoal/scripts/check-complete.mjs docs/plans/2026-07-04-plate-next-platetest-platecontent-review.md` | run after this ledger update |

Review matrix:
| Path / API | Drift score | Verdict | Owner | Evidence | Next |
|------------|-------------|---------|-------|----------|------|
| `packages/core/src/react/components/PlateTest.tsx` | 1 | keep-in-plate after cleanup | Plate React test harness | Compared with `origin/main`; removed `any` render/call casts; preserved wrapping of a provided raw editor through `createPlateEditor`; kept `plite-content-editable` current-state test id | none |
| `packages/core/src/react/components/PlateContent.tsx` | 1 | keep-in-plate with one Plate gap | Plate React editable wrapper | Compared with `origin/main`; replaced old `SlateExtensionPlugin`, `editor.tf.focus`, `editor.children`, and `editor.meta.pluginCache` use with current Plite/Plate APIs; focused component tests pass | defer editable decoration adapter gap below |
| `packages/core/src/react/components/ContentVisibilityChunk.tsx` | 2 | recover-main-owner | content-visibility wrapper | Compared with `origin/main`; current drift had moved PlateContent effect state into this file; restored it to content-visibility wrapper role | none |
| `packages/core/src/react/editor/withPlate.ts` | 1 | main-parity type owner fix | `createPlateEditor` typing | `PlateTest` proof exposed that created editors always receive Plate core plugins; `InferPlateEditorPlugins` now includes `PlateCorePlugin` even with user plugins | none |
| `packages/core/src/react/components/PlateTest.spec.tsx` | 0 | justify-new-proof-tooling | focused regression proof | New focused test proves provided `createReactEditor` editor is extended before `PlateTest` renders and gets Plate core plugin list | keep |

Best Plate v2 recommendation:
| Target | Recommended shape | Rejected legacy/hack alternatives | Reason | User-review need |
|--------|-------------------|-----------------------------------|--------|------------------|
| `PlateTest` | Keep it as a small Plate React test harness that accepts a raw Plite React editor and upgrades it through `createPlateEditor` when needed | Do not keep `slate-content-editable`; do not use `createPlateEditor as any`; do not make it the generic plugin-inference proof surface | Plugin inference belongs to `createPlateEditor`/type tests; `PlateTest` should prove render harness behavior | low |
| `PlateContent` | Keep it as Plate's wrapper around Plite React `Editable`, with Plate plugin render slots and store sync colocated | Do not revive `SlateExtensionPlugin`; do not move effects into unrelated helper files; do not hide focus behind `editor.tf` | Plate owns product/plugin composition; Plite owns the editable runtime | review the adapter gap only |
| `ContentVisibilityChunk` | Keep the origin/main content-visibility helper role | Do not reuse this file as a side-effect holder | Name and owner must match; effect state belongs in `PlateContent` | low |

Plite / Plate gap ledger:
| Gap type | Missing capability | Why local workaround is a hack | Smallest owner | Proof needed | Decision |
|----------|--------------------|-------------------------------|----------------|--------------|----------|
| Plate gap | Proper Plate-to-Plite `Editable` prop adapter for `decorate`: Plate exposes `Range[]`, Plite React `Editable` expects decoration objects with `range` plus projection payload shape | Removing the local adapter cast makes Core typecheck fail; silently changing decoration shape inside `PlateContent` risks plugin render regression | `useEditableProps` / Plate editable adapter, with Plite decoration mapping proof | type test plus `PlateContent.spec.tsx` and `pipeDecorate.spec.ts` proving Plate decorate output reaches leaves correctly | defer-with-owner; keep explicit cast as the visible boundary for this packet |

Related Core sweep ledger:
| Trigger correction | Sweep query / method | Matches | Patched | Deferred | Remaining risk |
|--------------------|----------------------|---------|---------|----------|----------------|
| Removed PlateTest casts and old test id | `rg -n "as any|editor\\.tf|getTransforms|getPluginApi|commands|SlateExtensionPlugin|PlateContentStateEditor|createPlateEditor as|data-testid=\"slate-content-editable\"" <target files>` | 0 | target files clean | 0 | none in named target |
| Restored `ContentVisibilityChunk` owner | `rg -n "as unknown|LegacyEditableComponentProps|ContentVisibilityChunk|PlateContentStateEffect|data-testid=\"slate-content-editable\"|createPlateEditor as|pluginList' in|pluginList\\\" in" packages/core/src/react packages/core/src/lib packages/core/type-tests --glob '!**/dist/**'` | expected target matches plus unrelated broader Plate casts | 1 file restored | broader unrelated casts in `withPlate`, `withPlite`, fallback editor, input-rules remain outside this packet | no same-class helper-owner drift remained in components |
| `createPlateEditor` core-plugin inference fix | focused type specs: `TPlateEditor`, `TPlateEditorCore`, `createPlatePlugin` | 23 tests passed | `withPlate.ts` patched | 0 | none for this inference path |

Core drift ledger:
- Applies: no
- Manifest command: not run; user named a two-file packet, not a broad Core
  sweep
- Manifest owner: `packages/core/src/**/*.{ts,tsx,mts,cts}`
- Optional type-test owner: `packages/core/type-tests/**/*.{ts,tsx,mts,cts}`
- Ledger location: N/A for this packet
- Expected row count: 0
- Actual row count: 0
- Missing row count: 0
- Extra row count: 0
- Score gate: named matrix rows only
- Top drift rows: `ContentVisibilityChunk.tsx` was the only score-2 drift and
  was fixed

Core file drift rows:
| Path | Drift score | Verdict | Owner | Evidence | Next |
|------|-------------|---------|-------|----------|------|
| N/A | 0 | broad sweep not requested | plate-next | named packet matrix above is the active ledger | none |

Packet ledger:
| Packet | Owner | Hypothesis / smell | Files / commands | Decision | Next |
|--------|-------|--------------------|------------------|----------|------|
| PlateTest cleanup | Plate React harness | current file had `any` casts and risked losing main behavior for provided raw editors | `PlateTest.tsx`, `PlateTest.spec.tsx` | keep | none |
| PlateContent cleanup | Plate editable wrapper | current file should use Plite APIs without reviving old Slate extension/plugin patterns | `PlateContent.tsx`, `PlateContent.spec.tsx`, `pipeDecorate.spec.ts` | keep with adapter gap | plan adapter later |
| ContentVisibilityChunk recovery | component helper owner | file name had been repurposed away from origin/main behavior | `ContentVisibilityChunk.tsx` | keep restored helper | none |
| createPlateEditor inference | editor type owner | created editors always install Plate core plugins, but inference did not reflect that reliably | `withPlate.ts`, editor type specs | keep | none |

Extracted file ledger:
| Path | Bucket | Origin/main owner check | Decision | Proof |
|------|--------|-------------------------|----------|-------|
| `packages/core/src/react/components/PlateTest.spec.tsx` | justify-new-proof-tooling | no origin/main file; new focused regression proof for recovered `PlateTest` behavior | keep | focused test passes |

Out-of-scope package drift:
| Package / command | Error summary | Why not blocking this run | Owner / next |
|-------------------|---------------|---------------------------|--------------|
| N/A | no non-Core package command was run | scoped Core packet | none |

Changed list:
| Group | Current-run changes |
|-------|---------------------|
| code/runtime/API | `PlateTest.tsx`, `PlateContent.tsx`, `ContentVisibilityChunk.tsx`, `withPlate.ts` |
| tests/proof | new `PlateTest.spec.tsx` |
| docs/templates/skills | this goal plan only |
| reverted/quarantined packets | attempted broad `PlateStore.ts` type-boundary change was reverted before final proof; attempted `PlateContent` cast removal was reverted and recorded as adapter gap |

Needs your attention:
| Rank | Item | Why | Anchor | Recommendation |
|------|------|-----|--------|----------------|
| 1 | `PlateContent` editable decoration adapter | One explicit cast remains because Plate `decorate` and Plite React `Editable` do not share a prop type yet | `packages/core/src/react/components/PlateContent.tsx:128` | accept as a visible temporary boundary, then plan a focused adapter proof |
| 2 | `PlateTest` is intentionally not the generic plugin-inference surface | It is a render harness; plugin inference belongs to `createPlateEditor` and editor type tests | `packages/core/src/react/components/PlateTest.tsx:13` | keep this scope |

Findings:
- `PlateTest` was not fully clean: it had render/call casts and needed the
  origin/main behavior that upgrades a provided raw editor before rendering.
- `PlateContent` is clean for current Plate/Plite runtime usage except for the
  explicit editable props adapter gap.
- `ContentVisibilityChunk` had high-risk owner drift: it was temporarily used
  for PlateContent side effects even though origin/main defines it as a
  content-visibility chunk wrapper.

Decisions and tradeoffs:
- Keep `PlateContent` state/effects colocated in `PlateContent.tsx`.
- Keep `ContentVisibilityChunk` boring and owner-accurate.
- Defer the editable decoration adapter because forcing it locally would hide a
  real Plate/Plite boundary mismatch.

Error attempts:
| Error / failed attempt | Count | Next different move | Resolution |
|------------------------|-------|---------------------|------------|
| Removed `PlateContent` `Editable` cast | 1 | inspect Plite React `Editable` decoration types | reverted cast; recorded adapter gap |
| Rendered `PlateTest` with plain `createEditor` | 1 | use the React editor owner for React render proof | changed proof to `createReactEditor` |
| Tried broad `PlateStore.ts` structural boundary cleanup | 1 | stay scoped to named files | reverted before final proof |

Verification evidence:
- `pnpm --filter @platejs/core exec bun test src/react/components/PlateContent.spec.tsx src/react/components/PlateTest.spec.tsx`:
  6 pass, 0 fail.
- `pnpm --filter @platejs/core exec bun test src/react/editor/TPlateEditor.spec.ts src/react/editor/TPlateEditorCore.spec.ts src/react/plugin/createPlatePlugin.spec.ts`:
  23 pass, 0 fail.
- `pnpm --filter @platejs/core exec bun test src/react/components/PlateContent.spec.tsx src/react/components/PlateTest.spec.tsx src/static/utils/pipeDecorate.spec.ts`:
  8 pass, 0 fail.
- `pnpm --filter @platejs/core typecheck`: pass.
- `pnpm --filter @platejs/core lint`: pass.
- Exact target audit for `as any`, `editor.tf`, `getTransforms`,
  `getPluginApi`, command fallback, `SlateExtensionPlugin`,
  `PlateContentStateEditor`, `createPlateEditor as`, and old
  `slate-content-editable`: no matches.
- Related sweep found only the expected `PlateContent` adapter cast, expected
  `PlateContentStateEffect`, expected `ContentVisibilityChunk` exports, and
  unrelated broader Plate casts outside this named packet.

Final handoff contract:
- target surface and mode: named `plate-next` file review packet
- files/APIs reviewed: `PlateTest.tsx`, `PlateContent.tsx`, related
  `ContentVisibilityChunk.tsx`, and `withPlate.ts` inference owner
- broad Core drift score coverage: N/A; named packet only
- best Plate v2 recommendation: keep Plate React wrapper/harness behavior, use
  Plite APIs directly, restore helper ownership, defer the decoration adapter
  as an explicit Plate gap
- verdict matrix summary: 4 keep/fix rows, 1 new proof row
- Plite/Plate gaps or blockers: one Plate editable decoration adapter gap
- related Core sweep query/matches/patched/deferred: recorded above
- changes made: changed list above
- tests/proof commands: verification evidence above
- old compatibility names audited: exact target audit passed
- needs attention: editable adapter gap
- next best Plate Next packet: focused adapter cleanup for Plate `decorate` to
  Plite React decoration payloads

Reboot status:
| Question | Answer |
|----------|--------|
| Where am I? | Final proof and goal closeout |
| Where am I going? | Close the named `PlateTest` / `PlateContent` review packet |
| What is the goal? | Prove these files have no drift regression vs `origin/main` or document owned gaps |
| What have I learned? | `ContentVisibilityChunk` owner drift was real; `PlateContent` decoration prop mismatch is a real adapter gap |
| What have I done? | Patched target files, added focused proof, ran Core tests/typecheck/lint/source audits |

Timeline:
- 2026-07-04T08:29:24.048Z Goal plan created.
- 2026-07-04 Compared target files with `origin/main`.
- 2026-07-04 Patched `PlateTest`, `PlateContent`,
  `ContentVisibilityChunk`, and `withPlate`.
- 2026-07-04 Added focused `PlateTest` regression proof.
- 2026-07-04 Ran focused Core tests, typecheck, lint, and source audits.

Open risks:
- One known risk remains: the `PlateContent` editable props cast is explicit
  adapter debt. It is not random drift, but it should get a focused cleanup
  when the Plate-to-Plite decoration adapter is designed.
