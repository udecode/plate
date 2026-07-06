# plate-next Plate component root editor cleanup

Objective:
Deep-review and repair `Plate.tsx` `PlateRootEditor` drift against main
ownership and Plite-fit Core typing.

Goal plan:
docs/plans/2026-07-04-plate-next-plate-component-root-editor-cleanup.md

Template:
docs/plans/templates/plate-next.md

Primary template:
docs/plans/templates/plate-next.md

Applied packs:
- none

Plate Next source:
- prompt / link: user asked to deep-review whether
  `packages/core/src/react/components/Plate.tsx` has 0 drift regression vs
  `origin/main`, said they dislike `PlateRootEditor`, and invoked
  `plate-next`
- mode: named-file review packet with related Core sweep
- target surface: `packages/core/src/react/components/Plate.tsx`,
  `PlateRootEditor`, direct test/helper consumers, and the owning editor/store
  type if the local alias exists only to patch weak typing
- review target: best Plate v2 migration on top of Plite, not legacy
  compatibility
- broad Core sweep: N/A: the user named one file/API, not `all core` or
  `full sweep`
- correction-triggered related Core sweep: required for `PlateRootEditor`,
  `runtime.uid`, `runtime.key`, and same-class local structural editor aliases
- completion threshold summary: remove or justify `PlateRootEditor`, preserve
  main-style Plate behavior, repair owner typing instead of local workaround,
  audit same-class Core refs, run focused tests and Core typecheck/lint

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
- initial confidence score: N/A
- improvement loop: N/A
- final score / loop closure: N/A

Completion threshold:
- `PlateRootEditor` is deleted or explicitly justified. If deleted, Plate uses
  the source-owned `PlateEditor` type rather than a component-local structural
  type.
- Any runtime key/uid typing gap is fixed at the owning editor type, not by a
  local component alias.
- `PlateTest` no longer depends on `PlateRootEditor` and preserves its job:
  wrap a raw Plite editor with `createPlateEditor`, or keep an existing Plate
  editor.
- Source audit shows no `PlateRootEditor` refs remain unless deliberately
  justified.
- Focused Plate component tests, Core typecheck, Core lint, and final
  autogoal check pass.
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
- `node .agents/skills/autogoal/scripts/check-complete.mjs docs/plans/2026-07-04-plate-next-plate-component-root-editor-cleanup.md`
  passes after final evidence is recorded.

Verification surface:
- focused tests / commands: `pnpm --filter @platejs/core exec bun test
  src/react/components/PlateTest.spec.tsx src/react/hooks/useSlateProps.spec.tsx`
- package proof: `pnpm --filter @platejs/core typecheck`;
  `pnpm --filter @platejs/core lint`
- source audits: `rg -n "PlateRootEditor|runtime\\.uid|runtime\\.key"
  packages/core/src packages/core/type-tests --glob '!**/dist/**'`
- related Core sweep query / match count / patched count / deferred count:
  `PlateRootEditor|isPlateRootEditor|uid?:|meta.uid|runtime.uid|runtime.key`
  audit found 9 current refs after patch; patched 3 files; deferred 0
- Plite/Plate gap ledger: no gap; Core `PlateEditor` already owns the runtime
  shape through `BaseEditor['runtime']`
- broad Core drift ledger gate: N/A: named file/API packet only
- final plan check: `node .agents/skills/autogoal/scripts/check-complete.mjs docs/plans/2026-07-04-plate-next-plate-component-root-editor-cleanup.md`

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
- allowed edit scope: `packages/core/src/react/components/Plate.tsx`,
  `packages/core/src/react/components/PlateTest.tsx`,
  `packages/core/src/react/editor/PlateEditor.ts`, direct test/type owner files
  only if required
- package/API surfaces: Plate component props and Plate editor runtime typing
- docs/browser surfaces: N/A
- non-goals: no broad Core sweep, no rename pass, no package migration, no
  compatibility alias, no public API design fork unless typing exposes one
- out-of-scope package errors: ignore non-Core package failures unless caused by
  this API/type change

Output budget strategy:
- For broad Core sweep, use manifest counts and ledger artifacts instead of
  streaming every file path into chat.
- For named file/API work, use targeted `sed`/`rg` reads and capped output.

Blocked condition:
- Stop if deleting `PlateRootEditor` requires a public Plate editor API fork
  beyond moving `uid` under the already-used `runtime` owner.

Current verdict:
- verdict: complete
- confidence: high
- next owner: plate-next
- keep / revert / quarantine call: keep
- reason: `PlateEditor` already owns runtime shape; local structural alias is
  duplicate typing around that owner

Start Gates:
| Gate | Applies | Evidence |
|------|---------|----------|
| Prompt requirements captured before work | yes | target file, disliked symbol, main-drift question, proof, and non-goals recorded |
| `plate-next` skill/rule read | yes | `.agents/skills/plate-next/SKILL.md` read fully |
| Active goal checked or created | yes | no active goal; new goal created |
| Mode classified as named packet vs broad Core sweep | yes | named file/API packet |
| Review target recorded as best Plate v2 / Plite-fit / no legacy compat | yes | local structural alias is not acceptable final API |
| Broad Core drift ledger initialized when in scope | no | N/A: not broad Core sweep |
| Source of truth and allowed workspace recorded | yes | current checkout vs `origin/main` file evidence |
| Output budget strategy recorded | yes | targeted reads/audits |
| Public API fork routing checked | yes | no fork unless editor runtime typing forces one |
| Gap policy checked | yes | fix owner typing or name gap |
| Related Core sweep policy checked | yes | `PlateRootEditor`, runtime key/uid, same-class alias audit |
| Review-mode rename freeze checked | yes | no rename pass |

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
| Named verification threshold | yes | Run the proof commands named in this plan | passed |
| Broad Core drift ledger coverage | no | Record manifest command, expected row count, actual row count, missing row count, and extra row count when broad Core sweep applies | N/A: named file/API packet |
| Score gate | yes | Prove all scores are valid and high drift is owned/fixed/deferred in the plan ledger | closed: `PlateRootEditor` was drift score 3 and removed |
| Best Plate v2 recommendation | yes | Record the recommended current shape and rejected legacy/hack alternatives for the reviewed target | use `PlateEditor` directly; no local root alias |
| Plite/Plate gap ledger | yes | Record blockers or N/A when no gap blocks the target | no gap |
| Related Core sweep after correction | yes | For each correction, run and record same-class Core search/review results | recorded below |
| Package/API proof | yes | Run focused typecheck/test/build or record N/A | focused tests, Core typecheck, Core lint passed |
| Non-Core package error triage | no | If a proof command reports non-Core failures, classify as named/touched/Core-regression or out-of-scope package drift | N/A |
| Source audit | yes | Run exact audit for removed compatibility names or record N/A | no `PlateRootEditor`, `isPlateRootEditor`, `meta.uid`, or root `uid?:` remain in Core |
| Rename ledger | no | Update `docs/plans/pre-renaming.md` when a rename is postponed or intentionally kept | N/A |
| Extracted-file inventory | yes | Record untracked/extracted file command, row count, and bucket for every file in scope | 0 untracked files in target component/type-test scope |
| Autoreview / review | no | Run review gate for non-trivial implementation diffs or record N/A | N/A: named cleanup packet with focused proof |
| Final lint/check | yes | Run scoped lint/check or record N/A | Core lint passed |
| Changed list / top drift / needs attention | yes | Fill handoff ledgers | filled |
| Goal plan complete | yes | Run `node .agents/skills/autogoal/scripts/check-complete.mjs docs/plans/2026-07-04-plate-next-plate-component-root-editor-cleanup.md` | to run after this update |

Phase / pass table:
| Phase | Status | Evidence | Next |
|-------|--------|----------|------|
| Main comparison | complete | `origin/main` has `PlateProps<E extends PlateEditor>` and no `PlateRootEditor`; current file needed Plite runtime/read updates | keep main owner, not main API compatibility |
| PlateRootEditor cut | complete | local structural alias removed from `Plate.tsx` and `PlateTest.tsx` | keep |
| Owner typing repair | complete | root-level `PlateEditor.uid` removed; actual React usage stays `editor.runtime.uid` | keep |
| Related sweep | complete | source audit recorded below | none |
| Proof | complete | focused tests, typecheck, lint passed | close goal |

Review matrix:
| Path / API | Drift score | Verdict | Owner | Evidence | Next |
|------------|-------------|---------|-------|----------|------|
| `PlateRootEditor` | 3 | hard-cut | `PlateEditor` owns editor runtime typing | duplicate local structural alias only existed to expose `runtime.key/uid`; no main equivalent | keep deleted |
| `packages/core/src/react/components/Plate.tsx` | 1 | main-parity-cleanup | Plate React component | still differs from main only where Plite requires `read.view.isReadOnly()` and `runtime.key/uid`; no `as any` render cast remains | clean |
| `packages/core/src/react/components/PlateTest.tsx` | 1 | main-parity-cleanup | Plate test helper | preserves raw-editor wrapping behavior; guard renamed from root-specific to `isPlateEditor` | clean |
| `packages/core/src/react/editor/PlateEditor.ts` root `uid?: string` | 2 | hard-cut | Plate editor runtime typing | root uid was stale; all Core React consumers read/write `editor.runtime.uid`; Core `BaseEditor` runtime already has `uid?: string` | clean |

Best Plate v2 recommendation:
| Target | Recommended shape | Rejected legacy/hack alternatives | Reason | User-review need |
|--------|-------------------|-----------------------------------|--------|------------------|
| `Plate.tsx` editor prop typing | `PlateProps<E extends PlateEditor<any, AnyPluginConfig>>`, preserving generic inference | `PlateRootEditor`, root-level `uid`, `props as any`, returning to old `meta` API | Plate accepts any inferred Plate editor and should not create a second editor type | none |
| runtime id/key | `editor.runtime.uid` and `editor.runtime.key` | `editor.meta.uid`, `editor.meta.key`, local structural type | Plite/Plate runtime moved runtime identity under `runtime`; React container already uses that owner | none |

Plite / Plate gap ledger:
| Gap type | Missing capability | Why local workaround is a hack | Smallest owner | Proof needed | Decision |
|----------|--------------------|-------------------------------|----------------|--------------|----------|
| N/A | none | `BaseEditor['runtime']` already has `key` and `uid` through Core editor runtime type | N/A | N/A | no gap |

Related Core sweep ledger:
| Trigger correction | Sweep query / method | Matches | Patched | Deferred | Remaining risk |
|--------------------|----------------------|---------|---------|----------|----------------|
| cut `PlateRootEditor` | `rg -n "PlateRootEditor|isPlateRootEditor|uid?:|meta.uid|runtime.uid|runtime.key" packages/core/src packages/core/type-tests --glob '!**/dist/**'` | 9 current refs after patch | 3 files patched | 0 | remaining refs are valid runtime identity users/type owner |

Core drift ledger:
- Applies: no, this is not a broad Core sweep
- Manifest command: N/A
- Manifest owner: `packages/core/src/**/*.{ts,tsx,mts,cts}`
- Optional type-test owner: `packages/core/type-tests/**/*.{ts,tsx,mts,cts}`
- Ledger location: N/A
- Expected row count: N/A
- Actual row count: N/A
- Missing row count: N/A
- Extra row count: N/A
- Score gate: N/A
- Top drift rows: N/A

Core file drift rows:
| Path | Drift score | Verdict | Owner | Evidence | Next |
|------|-------------|---------|-------|----------|------|
| N/A | N/A | N/A | N/A | broad Core file-by-file drift sweep out of scope | use broad `plate-next` only when requested |

Packet ledger:
| Packet | Owner | Hypothesis / smell | Files / commands | Decision | Next |
|--------|-------|--------------------|------------------|----------|------|
| `PlateRootEditor` cleanup | Plate React component/editor typing | local structural editor alias hides owner typing drift | `Plate.tsx`, `PlateTest.tsx`, `PlateEditor.ts`, source audit | keep patch | none |

Extracted file ledger:
| Path | Bucket | Origin/main owner check | Decision | Proof |
|------|--------|-------------------------|----------|-------|
| N/A | N/A | N/A | no extracted files in target scope | `git ls-files --others --exclude-standard packages/core/src/react/components packages/core/type-tests` returned 0 rows |

Out-of-scope package drift:
| Package / command | Error summary | Why not blocking this run | Owner / next |
|-------------------|---------------|---------------------------|--------------|
| N/A | none | no non-Core failures | N/A |

Changed list:
| Group | Current-run changes |
|-------|---------------------|
| code/runtime/API | removed `PlateRootEditor`; `Plate.tsx` uses `PlateEditor` directly; `PlateTest` uses `PlateEditor`; removed stale root `uid?: string` from `PlateEditor` |
| tests/proof | no test files changed |
| docs/templates/skills | updated this plan |
| reverted/quarantined packets | none |

Needs your attention:
| Rank | Item | Why | Anchor | Recommendation |
|------|------|-----|--------|----------------|
| 1 | `PlateProps` uses inline `PlateEditor<any, AnyPluginConfig>` to mean any inferred Plate editor | it is the right type boundary, but visually noisy | `packages/core/src/react/components/Plate.tsx` | keep for now; only extract a local alias if you explicitly prefer readability over alias avoidance |

Findings:
- `PlateRootEditor` was migration drift. It duplicated the existing
  `PlateEditor` runtime owner to work around typing.
- `Plate.tsx` is not byte-identical to `origin/main`, and should not be:
  `editor.read.view.isReadOnly()` and `editor.runtime.key/uid` are the current
  Plite-shaped APIs.
- The old `props as any` render escape is gone.

Decisions and tradeoffs:
- Use `PlateEditor` directly, widened inline to accept any inferred value/plugin
  editor.
- Delete root-level `PlateEditor.uid`; keep identity under `runtime`.
- Keep `PlateTest`'s raw-editor wrapping behavior, but remove the root-specific
  guard/type.

Error attempts:
| Error / failed attempt | Count | Next different move | Resolution |
|------------------------|-------|---------------------|------------|
| None yet | 0 | | |

Verification evidence:
- `pnpm --filter @platejs/core exec bun test src/react/components/PlateTest.spec.tsx src/react/hooks/useSlateProps.spec.tsx` -> 3 pass, 0 fail.
- `pnpm --filter @platejs/core typecheck` -> passed.
- `pnpm --filter @platejs/core lint` -> passed.
- `rg -n "PlateRootEditor|isPlateRootEditor|uid?:|meta.uid|runtime.uid|runtime.key" packages/core/src packages/core/type-tests --glob '!**/dist/**'` -> no `PlateRootEditor`, no `isPlateRootEditor`, no `meta.uid`, no root `uid?:`; remaining refs are valid `runtime.key/uid` users plus the Core runtime type owner.
- `git ls-files --others --exclude-standard packages/core/src/react/components packages/core/type-tests | sort` -> 0 rows.

Final handoff contract:
- target surface and mode: named-file `Plate.tsx` / `PlateRootEditor` review packet
- files/APIs reviewed: `Plate.tsx`, `PlateTest.tsx`, `PlateEditor.ts`, runtime key/uid refs
- broad Core drift score coverage: N/A
- best Plate v2 recommendation: use `PlateEditor` directly; no local root editor type
- verdict matrix summary: one hard-cut alias, one owner typing cleanup, two main-parity component/test cleanups
- Plite/Plate gaps or blockers: none
- related Core sweep query/matches/patched/deferred: 9 remaining valid runtime refs; 3 files patched; 0 deferred
- changes made: see Changed list
- tests/proof commands: see Verification evidence
- old compatibility names audited: yes
- needs attention: inline generic noisiness only
- next best Plate Next packet: `PlateContent.tsx` / `LegacyEditableComponentProps` if not already resolved

Reboot status:
| Question | Answer |
|----------|--------|
| Where am I? | Proof complete |
| Where am I going? | Run check-complete and close goal |
| What is the goal? | Remove `PlateRootEditor` drift and verify `Plate.tsx` is clean |
| What have I learned? | See Findings |
| What have I done? | See Timeline |

Timeline:
- 2026-07-04T09:41:39.663Z Goal plan created.
- 2026-07-04T09:43Z Compared `Plate.tsx` and `PlateTest.tsx` with `origin/main`.
- 2026-07-04T09:45Z Removed `PlateRootEditor` and stale root `uid`.
- 2026-07-04T09:47Z Ran related Core sweep, focused tests, Core typecheck, and Core lint.

Open risks:
- The generic boundary in `Plate.tsx` is correct but visually noisy. A local
  non-exported alias would be shorter, but this packet respected the current
  anti-alias preference.
