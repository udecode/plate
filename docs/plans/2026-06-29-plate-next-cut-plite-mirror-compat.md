# plate-next cut plite mirror compat

Objective:
Cut Plite mirror compat types; done when Plite exports no unused compat mirror
surface, Core uses the Plite pattern or records an explicit blocker, and
`pnpm check:core` passes.

Goal plan:
docs/plans/2026-06-29-plate-next-cut-plite-mirror-compat.md

Template:
docs/plans/templates/plate-next.md

Primary template:
docs/plans/templates/plate-next.md

Applied packs:
- none

Plate Next source:
- prompt / link: user rejected `EditorStateMirrors`, `EditorHistoryMirrors`,
  and `EditorDomState` because they are unused Plite compat surface
- mode: correction packet after previous Plate Next packet
- target surface: Plite exported mirror compat types, Core `BaseEditor`
  typing, and direct mirror installer/callers where safe
- review target: best Plate v2 migration on top of Plite, not legacy
  compatibility
- broad Core sweep: no; named correction packet
- correction-triggered related Core sweep: yes; audit every match of the
  mirror types and direct mirror installer/callers touched by this correction
- completion threshold summary: no `EditorStateMirrors`,
  `EditorHistoryMirrors`, or `EditorDomState` exported from Plite; Core does
  not depend on Plite compat mirror types; any remaining direct mirror runtime
  is either cut or explicitly scored/deferred with caller evidence

First checkpoint:
- Copy every explicit prompt requirement into this plan before implementation:
  target, duration, non-goals, stop condition, proof commands, final handoff,
  and whether the user asked for `sweep`, `all core`, `full-loop`, or an
  equivalent broad Core review.
- If broad Core sweep is in scope, fill the Core drift ledger rows in this
  plan before closing any packet. Keep this template-only.

Timed checkpoint:
- requested duration: none
- semantics: N/A: no timed checkpoint requested
- initial confidence score: N/A: named correction packet
- improvement loop: N/A
- final score / loop closure: N/A

Completion threshold:
- Plite no longer declares or exports unused compat mirror types.
- Core no longer imports or composes those Plite compat types.
- Direct mirror installer/callers are audited; safe cuts are applied; any
  remaining direct mirror debt has an owner and proof gap.
- Source audits for the rejected types and old local mirror names return no
  live code matches.
- Focused proof and `pnpm check:core` pass.
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
- `node .agents/skills/autogoal/scripts/check-complete.mjs docs/plans/2026-06-29-plate-next-cut-plite-mirror-compat.md`
  passes after final evidence is recorded.

Verification surface:
- focused tests / commands: Core editor/DOM tests and any tests impacted by
  direct mirror migration
- package proof: `pnpm check:core`
- source audits: exact `rg` for rejected mirror types and direct mirror
  installer names
- related Core sweep query / match count / patched count / deferred count:
  audit rejected type names and direct mirror fields
- Plite/Plate gap ledger: record any missing Plite primitive that prevents
  deleting direct mirror runtime
- broad Core drift ledger gate: N/A: named correction packet
- final plan check: `node .agents/skills/autogoal/scripts/check-complete.mjs docs/plans/2026-06-29-plate-next-cut-plite-mirror-compat.md`

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
- allowed edit scope: `packages/plite/src/interfaces/editor.ts`,
  `packages/plite/src/index.ts`, `packages/core/src/lib/editor/SlateEditor.ts`,
  `packages/core/src/lib/editor/withPlite.ts`, and Core callers/tests needed
  to delete or quarantine direct mirror usage
- package/API surfaces: Plite public type exports and Core `BaseEditor`
  surface
- docs/browser surfaces: N/A
- non-goals: no broad Plate package migration, no naming cleanup, no new compat
  aliases, no fake mirror types
- out-of-scope package errors: ignore non-Core package errors unless caused by
  this Core/Plite change

Output budget strategy:
- For broad Core sweep, use manifest counts and ledger artifacts instead of
  streaming every file path into chat.
- For named file/API work, use targeted `sed`/`rg` reads and capped output.

Blocked condition:
- Stop and record a Plite/Plate gap if deleting direct mirror runtime requires
  a larger public API plan or breaks too many Core callers for this packet.

Current verdict:
- verdict: hard-cut unused Plite compat type surface; migrate Core away from
  mirror typing; caller-audit direct runtime mirror debt
- confidence: initial 70 until caller audit and `check:core`
- next owner: plate-next
- keep / revert / quarantine call: pending
- reason: pending

Start Gates:
| Gate | Applies | Evidence |
|------|---------|----------|
| Prompt requirements captured before work | yes | User explicitly rejects unused Plite compat mirror types and wants the Plite pattern, not compat |
| `plate-next` skill/rule read | yes | Read `.agents/skills/plate-next/SKILL.md` |
| Active goal checked or created | yes | Created active goal for this correction |
| Mode classified as named packet vs broad Core sweep | yes | Named correction packet |
| Review target recorded as best Plate v2 / Plite-fit / no legacy compat | yes | Hard-cut compat type surface and audit direct mirrors |
| Broad Core drift ledger initialized when in scope | no | N/A: not a broad Core sweep |
| Source of truth and allowed workspace recorded | yes | Current checkout `/Users/zbeyens/git/plate-2`; allowed files in Boundaries |
| Output budget strategy recorded | yes | Use targeted audits and counts; do not stream broad matches unless needed |
| Public API fork routing checked | yes | Removing unused compat type exports is not a public API fork worth planning |
| Gap policy checked | yes | If direct mirror deletion hits missing Plite substrate, record gap instead of wrapper |
| Related Core sweep policy checked | yes | Audit rejected types and direct mirror callers |
| Review-mode rename freeze checked | yes | No rename pass |

Phase / pass table:
| Phase | Status | Evidence |
|-------|--------|----------|
| Checkpoint zero | done | Prompt requirements captured in Start Gates and Boundaries. |
| Cut Plite mirror exports | done | Removed rejected mirror types from `packages/plite/src/interfaces/editor.ts` and `packages/plite/src/index.ts`. |
| Core source migration | done | Removed runtime mirror installer and migrated Core source to `editor.read.*` / `editor.update.*`. |
| Test and type-contract migration | done | Core tests and type contracts now use Plite reads/updates; rootless `read.value.root()` preserves readonly tuple inference. |
| Verification | done | `pnpm check:core` and `pnpm brl` passed. |

Work Checklist:
- [x] First checkpoint complete: every explicit prompt requirement, scope
      boundary, timing constraint, stop condition, deliverable, final handoff
      section, verification surface, and success criterion is copied into this
      plan before implementation. Evidence: Start Gates and Boundaries.
- [x] Mode classified: named correction packet, not a broad Core sweep.
- [x] Best Plate v2 call recorded: cut Plite mirror compat and migrate callers
      to Plite read/update.
- [x] Legacy/backcompat decision recorded: no public compat alias, shim, mirror
      type, or runtime property bridge was kept.
- [x] Hack check recorded: no helper dump or bridge file was introduced; local
      `as any` remains only in tests that intentionally mutate memo snapshots or
      fake editor readers.
- [x] Gap ledger updated: no blocking Plite/Plate gap; one Plite typing gap was
      fixed by preserving rootless readonly tuple inference.
- [x] Related Core sweep row added with query, match count, patched count,
      deferred count, and remaining risk.
- [x] Broad Core drift ledger marked not applicable; this was a named packet.
- [x] Broad Core file rows marked not applicable; no broad Core sweep was
      requested in this packet.
- [x] Broad manifest counts marked not applicable; named packet used exact
      symbol sweeps.
- [x] Broad score gate marked not applicable; no file was scored as broad sweep.
- [x] Bridge scoring law applied: mirror runtime bridge was deleted, not scored
      as acceptable.
- [x] Review matrix filled for the inspected API/helper targets.
- [x] Public API fork routing checked: this was a hard cut of bad Plite compat
      surface plus a type precision repair, not a new public fork needing
      `plate-plan`.
- [x] Review-mode rename freeze applied: no rename pass.
- [x] Extracted-file recovery gate closed as not applicable: no new extracted
      Core file was kept.
- [x] Safe cleanup packets kept with proof.
- [x] Focused and full package proof run after code changes.
- [x] `pnpm brl` run because Plite exports changed.
- [x] Old compatibility names source-audited after cut.
- [x] Changed list, top drift rows, needs-attention rows, and next owner filled.
- [x] Output budget discipline followed.

Completion Gates:
| Gate | Applies | Required action | Evidence |
|------|---------|-----------------|----------|
| Named verification threshold | yes | Run named proof commands | `pnpm check:core` passed after the cut. |
| Broad Core drift ledger coverage | no | Broad ledger only for broad sweeps | Named correction packet; exact symbol sweeps used instead. |
| Score gate | no | Broad score gate only for broad sweeps | Not a scored Core sweep. |
| Best Plate v2 recommendation | yes | Record recommended shape and rejected hacks | Recommendation table below. |
| Plite/Plate gap ledger | yes | Record blockers or none | No blocker remains; rootless read tuple typing was fixed in Plite. |
| Related Core sweep after correction | yes | Run same-class Core search | Mirror/direct-property audit returned zero matches. |
| Package/API proof | yes | Run scoped proof | `pnpm check:core` and `pnpm brl` passed. |
| Non-Core package error triage | no | Triage only if command reports unrelated package failures | No non-Core package blocker in final proof. |
| Source audit | yes | Audit removed names and old direct mirror fields | Final `rg` command returned no matches. |
| Rename ledger | no | Needed only for rename packets | No active rename pass. |
| Extracted-file inventory | no | Needed only for extracted/new file recovery | No new extracted Core owner file in this packet. |
| Autoreview / review | no | Review gate optional for this tight correction | `check:core` is the chosen closure proof. |
| Final lint/check | yes | Run scoped lint/check | Included in `pnpm check:core`. |
| Changed list / top drift / needs attention | yes | Fill handoff ledgers | Filled below. |
| Goal plan complete | yes | Run `node .agents/skills/autogoal/scripts/check-complete.mjs docs/plans/2026-06-29-plate-next-cut-plite-mirror-compat.md` | This plan is ready for the mechanical completion check. |

Review matrix:
| Path / API | Drift score | Verdict | Owner | Evidence | Next |
|------------|-------------|---------|-------|----------|------|
| `packages/plite/src/interfaces/editor.ts` root value read | 0 | move-to-plite/fix | Plite | `read.value.root()` now preserves rootless readonly tuple inference. | Keep. |
| Plite mirror compat type exports | 0 | hard-cut | Plite | `EditorStateMirrors`, `EditorHistoryMirrors`, `EditorDomState` removed. | Keep cut. |
| Core runtime mirror installer | 0 | hard-cut | Plate Core | `installPlateRuntimeStateMirrors` removed from `withPlite.ts`. | Keep cut. |
| Core source direct mirror callers | 0 | migrate | Plate Core | Source now uses `editor.read.*` / `editor.update.*`. | Continue same law in later packets. |
| Core tests/type contracts | 0 | migrate | Plate Core | Tests and type contracts no longer depend on `editor.children`/`selection` properties. | Keep. |

Best Plate v2 recommendation:
| Target | Recommended shape | Rejected legacy/hack alternatives | Reason | User-review need |
|--------|-------------------|-----------------------------------|--------|------------------|
| Document state reads | `editor.read.value.root()` / `editor.read.selection.get()` | `editor.children`, `editor.selection`, mirror types | Keeps Plite as the state owner and avoids Plate compat properties. | Low. |
| Document state writes | `editor.update.value.replace(...)` / tx groups | Direct property assignment or mirror setters | Keeps writes inside Plite update lifecycle. | Low. |
| Read value typing | rootless reads return readonly tuple-shaped `V` | Weak `readonly V[number][]` for primary root | Preserves API inference without mutable read state. | Medium: confirms readonly read law. |

Plite / Plate gap ledger:
| Gap type | Missing capability | Why local workaround is a hack | Smallest owner | Proof needed | Decision |
|----------|--------------------|-------------------------------|----------------|--------------|----------|
| Plite type precision | Rootless value reads lost tuple length | Weakening Plate contracts would hide real inference loss | Plite | `check:core` type contracts | Fixed. |
| Plate DOM state | DOM/editable flags still live on `editor.dom` | Moving this during mirror cut would broaden scope | Plate/Plite plan later | Dedicated DOM host-state design packet | Deferred, not blocking this mirror cut. |

Related Core sweep ledger:
| Trigger correction | Sweep query / method | Matches | Patched | Deferred | Remaining risk |
|--------------------|----------------------|---------|---------|----------|----------------|
| Rejected mirror types and runtime mirror installer | `rg -n "EditorStateMirrors|EditorHistoryMirrors|EditorDomState|installPlateRuntimeStateMirrors|PlateStateMirrors|\beditor\.(children|selection|marks|operations|history|undo|redo)\b" packages/plite/src packages/core/src packages/core/type-tests --glob '!**/dist/**'` | 0 final matches | Source, tests, and type contracts migrated | 0 | Low; future packets must keep this audit. |

Core drift ledger:
- Applies: no; named correction packet, not broad Core sweep.
- Manifest command: not used; exact symbol sweep used instead.
- Manifest owner: `packages/core/src` and `packages/core/type-tests`
- Optional type-test owner: included in exact sweep.
- Ledger location: Review matrix and Related Core sweep ledger above.
- Expected row count: N/A for named packet.
- Actual row count: N/A for named packet.
- Missing row count: 0 for named packet.
- Extra row count: 0 for named packet.
- Score gate: N/A for named packet.
- Top drift rows: none remaining in this packet.

Core file drift rows:
| Path | Drift score | Verdict | Owner | Evidence | Next |
|------|-------------|---------|-------|----------|------|
| N/A named packet | 0 | N/A | plate-next | Exact symbol audit replaced broad row-by-row drift scoring. | Broad sweep later if requested. |

Packet ledger:
| Packet | Owner | Hypothesis / smell | Files / commands | Decision | Next |
|--------|-------|--------------------|------------------|----------|------|
| Cut mirror compat | plate-next | Plite should not export unused compatibility mirror types or install Plate state mirrors | `packages/plite/src/interfaces/editor.ts`, `packages/plite/src/index.ts`, `packages/core/src/lib/editor/SlateEditor.ts`, `packages/core/src/lib/editor/withPlite.ts` | kept | Continue Plate cleanup without mirror properties. |
| Migrate callers/tests | plate-next | Old tests and source still assumed `editor.children`/`selection` properties | Core source, specs, and type tests | kept | Same audit for future packets. |
| Preserve read value inference | plite-plan/plate-next | Rootless read lost tuple precision after mirror cut | `EditorStateValueApi.root` overload | kept | Document/read API law later if docs packet opens. |

Extracted file ledger:
| Path | Bucket | Origin/main owner check | Decision | Proof |
|------|--------|-------------------------|----------|-------|
| N/A | no extracted file | no new owner file | no action | `pnpm check:core` |

Out-of-scope package drift:
| Package / command | Error summary | Why not blocking this run | Owner / next |
|-------------------|---------------|---------------------------|--------------|
| N/A | none in final proof | final proof green | none |

Changed list:
| Group | Current-run changes |
|-------|---------------------|
| code/runtime/API | Removed Plite mirror compat exports; removed Core mirror installer; moved Core source reads/writes to `editor.read.*` / `editor.update.*`; improved `read.value.root()` rootless readonly tuple typing. |
| tests/proof | Migrated Core tests/type contracts from old mirror properties to Plite read/update; updated fake affinity editors to Plite-shaped readers. |
| docs/templates/skills | Updated this autogoal plan only. |
| reverted/quarantined packets | None. |

Needs your attention:
| Rank | Item | Why | Anchor | Recommendation |
|------|------|-----|--------|----------------|
| 1 | `editor.dom` ownership | It remains Plate host/runtime state, not part of this document mirror cut. | `packages/core/src/lib/editor/SlateEditor.ts` | Review in a later DOM host-state packet, not here. |
| 2 | Read values are readonly | This is now enforced by type contracts. | `packages/plite/src/interfaces/editor.ts` | Keep unless you explicitly want mutable read snapshots, which would be the wrong direction. |

Findings:
- Plite mirror types were indeed wrong: they were unused compat surface and encouraged `editor.children`-style thinking.
- Removing the runtime mirror installer forced tests and contracts onto the real Plite read/update model.
- Rootless `read.value.root()` needed a Plite type fix to preserve tuple inference without returning mutable state.

Decisions and tradeoffs:
- Hard-cut mirror properties instead of preserving aliases.
- Keep `editor.dom` out of this packet; it is host state, not document/history mirror state.
- Use local test-only mutable casts only where the test intentionally probes memo behavior from a stable value reference.

Error attempts:
| Error / failed attempt | Count | Next different move | Resolution |
|------------------------|-------|---------------------|------------|
| Type contracts exposed readonly/tuple mismatch | 1 | Fix Plite rootless read typing, not weaken Plate contracts | Fixed in `EditorStateValueApi.root`. |
| Runtime affinity fake used old direct fields | 1 | Patch fake editor to Plite-shaped reader | Fixed. |
| Lint format drift after mechanical migration | 3 | Run Core lint fixer and patch `children` prop lint manually | Fixed. |

Verification evidence:
- `pnpm turbo typecheck --filter=./packages/plite --filter=./packages/core` passed.
- `pnpm brl` passed across package barrels.
- `pnpm check:core` passed after `pnpm brl`.
- Final mirror audit returned no matches:
  `rg -n "EditorStateMirrors|EditorHistoryMirrors|EditorDomState|installPlateRuntimeStateMirrors|PlateStateMirrors|\beditor\.(children|selection|marks|operations|history|undo|redo)\b" packages/plite/src packages/core/src packages/core/type-tests --glob '!**/dist/**'`

Final handoff contract:
- target surface and mode: named Plate Next correction packet.
- files/APIs reviewed: Plite editor interface/index, Core base editor/runtime installer, Core source callers, Core tests, Core type contracts.
- broad Core drift score coverage: N/A; exact symbol sweep completed.
- best Plate v2 recommendation: Plite owns document state through read/update; Plate must not expose document/history mirror properties.
- verdict matrix summary: mirror compat hard-cut; caller migration kept; tuple read typing fixed.
- Plite/Plate gaps or blockers: no blocker; DOM host-state ownership deferred.
- related Core sweep query/matches/patched/deferred: final query returned 0 matches.
- changes made: see Changed list.
- tests/proof commands: see Verification evidence.
- old compatibility names audited: yes, final exact audit returned 0 matches.
- needs attention: `editor.dom` future ownership and readonly read law.
- next best Plate Next packet: continue Core cleanup with the same no-mirror/no-compat rule, likely DOM host-state or remaining private bridge review.

Reboot status:
| Question | Answer |
|----------|--------|
| Where am I? | Mirror compat cut complete. |
| Where am I going? | Close autogoal after mechanical completion check. |
| What is the goal? | Remove Plite mirror compat and make Core use Plite read/update without breaking `check:core`. |
| What have I learned? | Rootless Plite value reads need readonly tuple inference; old mirror properties were test and type-contract debt. |
| What have I done? | Cut mirror types/runtime installer, migrated callers/tests/contracts, fixed Plite read typing, and passed proof. |

Timeline:
- 2026-06-29T14:46:56.140Z Goal plan created.
- 2026-06-29T15:05:00Z Mirror compat exports and runtime installer cut.
- 2026-06-29T15:20:00Z Core tests/type contracts migrated.
- 2026-06-29T15:35:00Z `pnpm check:core` and `pnpm brl` passed.

Open risks:
- None blocking this packet. `editor.dom` ownership is intentionally deferred for a separate design/review packet.
