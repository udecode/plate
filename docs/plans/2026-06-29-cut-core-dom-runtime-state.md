# cut core dom runtime state

Objective:
Cut Core domRuntimeState; done when Core readOnly uses Plite view state and check:core passes; plan docs/plans/2026-06-29-cut-core-dom-runtime-state.md.

Goal plan:
docs/plans/2026-06-29-cut-core-dom-runtime-state.md

Template:
docs/plans/templates/plate-next.md

Primary template:
docs/plans/templates/plate-next.md

Applied packs:
- none

Plate Next source:
- prompt / link: user accepted the recommendation to cut `packages/core/src/internal/plugin/domRuntimeState.ts`
- mode: one-shot execution
- target surface: Core DOM read-only runtime state side-channel
- review target: best Plate v2 migration on top of Plite, not legacy
  compatibility
- broad Core sweep: no, named boundary cut only
- correction-triggered related Core sweep: required for `domRuntimeState`, `setDomRuntimeReadOnly`, and read-only DOM API callers
- completion threshold summary: Core WeakMap file deleted, Core callers use Plite view read-only state, stale imports gone, focused tests and `check:core` pass

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
- initial confidence score: N/A
- improvement loop: N/A
- final score / loop closure: N/A

Completion threshold:
- Delete `packages/core/src/internal/plugin/domRuntimeState.ts` instead of moving the WeakMap to Plite.
- `DOMPlugin` and edit-only Core callers must read Plite's existing view read-only state.
- No public compat alias, no Core side-channel state, no duplicate read-only namespace.
- Focused Core tests and `pnpm check:core` pass.
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
- `node .agents/skills/autogoal/scripts/check-complete.mjs docs/plans/2026-06-29-cut-core-dom-runtime-state.md`
  passes after final evidence is recorded.

Verification surface:
- focused tests / commands: `DOMPlugin.spec.ts`, `PlateContent.spec.tsx`, `pipeOnChange.spec.ts`, `pipeNormalizeInitialValue.spec.tsx`
- package proof: `pnpm --filter @platejs/core typecheck`, `pnpm --filter @platejs/core test`, `pnpm --filter @platejs/core lint`, `pnpm check:core`
- source audits: no `domRuntimeState`, `setDomRuntimeReadOnly`, or `isDomRuntimeReadOnly` imports remain
- related Core sweep query / match count / patched count / deferred count:
  record after patch
- Plite/Plate gap ledger: N/A unless Plite cannot expose current view read-only state to Core
- broad Core drift ledger gate: N/A; broad Core sweep not requested
- final plan check: `node .agents/skills/autogoal/scripts/check-complete.mjs docs/plans/2026-06-29-cut-core-dom-runtime-state.md`

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
- allowed edit scope: `packages/core/**`, `packages/plite/**` only if an actual Plite gap blocks deletion, and this plan
- package/API surfaces: Core DOM plugin API and callers relying on read-only state
- docs/browser surfaces: N/A
- non-goals: no broad Core sweep, no public API redesign, no rename pass, no Plate feature-package migration
- out-of-scope package errors: ignore unless caused by this Core API change

Output budget strategy:
- For broad Core sweep, use manifest counts and ledger artifacts instead of
  streaming every file path into chat.
- For named file/API work, use targeted `sed`/`rg` reads and capped output.

Blocked condition:
- Stop only if Plite has no usable current view read-only source and adding one would require a public API fork.

Current verdict:
- verdict: done
- confidence: high after focused tests, stale-symbol audit, and `check:core`
- next owner: plate-next
- keep / revert / quarantine call: keep
- reason: Core no longer owns a separate read-only WeakMap; DOM read-only flows through the DOM plugin owner and installed Plite/DOM runtime state.

Start Gates:
| Gate | Applies | Evidence |
|------|---------|----------|
| Prompt requirements captured before work | yes | Cut `domRuntimeState.ts`; no timed checkpoint; proof and no-side-channel rule recorded |
| `plate-next` skill/rule read | yes | `.agents/skills/plate-next/SKILL.md` read |
| Active goal checked or created | yes | `create_goal` created this goal |
| Mode classified as named packet vs broad Core sweep | yes | Named boundary cut, not full Core sweep |
| Review target recorded as best Plate v2 / Plite-fit / no legacy compat | yes | Delete Core side-channel, use Plite view state |
| Broad Core drift ledger initialized when in scope | no | N/A: broad sweep not requested |
| Source of truth and allowed workspace recorded | yes | `/Users/zbeyens/git/plate-2`; Core + Plite-if-gap only |
| Output budget strategy recorded | yes | Focused source reads and exact `rg` audits |
| Public API fork routing checked | yes | Route to `plate-plan` only if public API fork appears |
| Gap policy checked | yes | Plite gap only if current view read-only cannot be used |
| Related Core sweep policy checked | yes | Sweep `domRuntimeState`, setter/getter, and read-only callers |
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
| Named verification threshold | yes | Run the proof commands named in this plan | Focused 7-file Bun run: 43 pass, 0 fail |
| Broad Core drift ledger coverage | no | Named boundary cut only | N/A |
| Score gate | no | Named boundary cut only | N/A |
| Best Plate v2 recommendation | yes | Record current shape and rejected alternatives | Cut Core WeakMap; keep DOM owner path |
| Plite/Plate gap ledger | yes | Record blockers or N/A | No blocker; dynamic React read-only comes from installed DOM runtime, base initial read-only is plugin option |
| Related Core sweep after correction | yes | Run same-class Core search/review | Stale symbol audit returned 0 matches |
| Package/API proof | yes | Run focused typecheck/test/lint/check | `pnpm --filter @platejs/core typecheck/test/lint` and `pnpm check:core` passed |
| Non-Core package error triage | no | No non-Core package failures | N/A |
| Source audit | yes | Audit removed compatibility names | `rg -n "domRuntimeState|setDomRuntimeReadOnly|isDomRuntimeReadOnly" packages/core/src packages/core/type-tests --glob '!**/dist/**'` returned 0 matches |
| Rename ledger | no | No rename pass | N/A |
| Extracted-file inventory | no | No new extracted file in scope | N/A |
| Autoreview / review | no | Narrow cut with proof | N/A |
| Final lint/check | yes | Run scoped lint/check | `pnpm --filter @platejs/core lint` and `pnpm check:core` passed |
| Changed list / top drift / needs attention | yes | Fill handoff ledgers | Done below |
| Goal plan complete | yes | Run `node .agents/skills/autogoal/scripts/check-complete.mjs docs/plans/2026-06-29-cut-core-dom-runtime-state.md` | To run after this update |

Phase / pass table:
| Pass | Status | Evidence | Next |
|------|--------|----------|------|
| Checkpoint zero | done | Requirements, scope, proof, and stop conditions copied into this plan | none |
| Source cut | done | Core side-channel removed; read-only routed through DOMPlugin / Plite runtime path | none |
| Focused proof | done | 43 focused tests passed | none |
| Closure proof | done | `pnpm check:core` passed | none |

Review matrix:
| Path / API | Drift score | Verdict | Owner | Evidence | Next |
|------------|-------------|---------|-------|----------|------|
| `packages/core/src/internal/plugin/domRuntimeState.ts` | 100 | cut | none | Core WeakMap side-channel deleted; stale-symbol audit 0 matches | none |
| `packages/core/src/lib/plugins/dom/DOMPlugin.ts` `api.dom.isReadOnly` | 95 | keep-in-plate | DOMPlugin | Reads installed DOM API first, then initial DOM plugin option, then Plite view state when present | no action |
| `packages/core/src/lib/plugins/getCorePlugins.ts` | 95 | keep-in-plate | Core plugin composition | Passes boolean `readOnly` into DOMPlugin config | no action |
| `packages/core/src/react/editor/getPlateCorePlugins.ts` / `withPlate.ts` | 95 | keep-in-plate | React plugin composition | React `dom` wrapper now receives the same initial `readOnly`, preventing replacement drift | no action |
| Read-only edit-only tests | 95 | keep | Core test owners | Tests use editor creation options instead of private setter | no action |

Best Plate v2 recommendation:
| Target | Recommended shape | Rejected legacy/hack alternatives | Reason | User-review need |
|--------|-------------------|-----------------------------------|--------|------------------|
| Core DOM read-only state | Delete Core WeakMap and route through DOMPlugin/installed DOM runtime | Moving the WeakMap to Plite; keeping `setDomRuntimeReadOnly`; adding another Core bridge | Read-only belongs to the DOM/view runtime owner, not a hidden Core side channel | Low |

Plite / Plate gap ledger:
| Gap type | Missing capability | Why local workaround is a hack | Smallest owner | Proof needed | Decision |
|----------|--------------------|-------------------------------|----------------|--------------|----------|
| none blocking | none for this packet | N/A | N/A | Focused tests + `check:core` | No public Plite API fork needed |
| possible future design | Mutable read-only on raw non-React editors without plugin option | Would be a design choice, not needed to cut this Core side-channel | Plite plan if reopened | New Plite API docs/tests | Defer until a real caller needs it |

Related Core sweep ledger:
| Trigger correction | Sweep query / method | Matches | Patched | Deferred | Remaining risk |
|--------------------|----------------------|---------|---------|----------|----------------|
| Delete Core read-only side-channel | `rg -n "domRuntimeState|setDomRuntimeReadOnly|isDomRuntimeReadOnly" packages/core/src packages/core/type-tests --glob '!**/dist/**'` | 0 after patch | 6 stale call sites/tests patched before audit | 0 | none |
| React DOM wrapper replaced configured Core DOM plugin | Runtime probe with `createPlateEditor({ readOnly: true })` | 1 failing path before patch | `getPlateCorePlugins` + `extendPlateEditor` patched | 0 | none |

Core drift ledger:
- Applies: no
- Manifest command: N/A: named boundary cut only
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
| N/A | N/A | named packet only | N/A | broad Core sweep not requested | N/A |

Packet ledger:
| Packet | Owner | Hypothesis / smell | Files / commands | Decision | Next |
|--------|-------|--------------------|------------------|----------|------|
| Cut read-only side-channel | plate-next | Core duplicated DOM/view read-only state in a hidden WeakMap | DOMPlugin, getCorePlugins, getPlateCorePlugins, withPlate, withPlite, PlateContent, read-only tests | keep | none |

Extracted file ledger:
| Path | Bucket | Origin/main owner check | Decision | Proof |
|------|--------|-------------------------|----------|-------|
| N/A | no extracted files in this packet | N/A | N/A | N/A |

Out-of-scope package drift:
| Package / command | Error summary | Why not blocking this run | Owner / next |
|-------------------|---------------|---------------------------|--------------|
| N/A | no out-of-scope package failures | N/A | N/A |

Changed list:
| Group | Current-run changes |
|-------|---------------------|
| code/runtime/API | Deleted Core read-only side-channel; DOMPlugin read-only reads installed DOM API / plugin option / Plite view; React DOM wrapper now preserves read-only config |
| tests/proof | Updated read-only tests to pass `readOnly` through editor creation options instead of private setter |
| docs/templates/skills | Updated this autogoal plan |
| reverted/quarantined packets | none |

Needs your attention:
| Rank | Item | Why | Anchor | Recommendation |
|------|------|-----|--------|----------------|
| 1 | Raw base-editor mutable read-only | This packet supports initial `readOnly`; dynamic React read-only is still owned by mounted DOM runtime. A mutable raw-editor read-only API is a separate Plite design choice. | `packages/core/src/lib/plugins/dom/DOMPlugin.ts` | Defer unless a raw non-React caller needs runtime toggling |

Findings:
- `createBaseEditor({ readOnly: true })` already works through Core plugin options after the side-channel cut.
- `createPlateEditor({ readOnly: true })` initially failed because `ReactPlugin` wraps `DOMPlugin` with the same `dom` key and replaced the configured Core DOM plugin.

Decisions and tradeoffs:
- Do not move the old WeakMap into Plite. That would preserve the hack under a cleaner package name.
- Keep `DOMPlugin.api.dom.isReadOnly()` as the Plate-facing API because Plate render/edit-only code already asks the DOM plugin for mounted editor state.
- No public Plite API fork for raw mutable read-only in this packet.

Error attempts:
| Error / failed attempt | Count | Next different move | Resolution |
|------------------------|-------|---------------------|------------|
| Focused tests failed after first cut: React read-only remained false and edit-only tests rendered | 1 | Probe base vs React editor options | Patched `getPlateCorePlugins` and `extendPlateEditor` so React DOM wrapper receives `readOnly` |

Verification evidence:
- `pnpm --filter @platejs/core exec bun --print "...createBaseEditor({ readOnly: true })..."` showed DOM options `readOnly: true` and `editor.api.dom.isReadOnly()` true.
- `pnpm --filter @platejs/core exec bun --print "...createPlateEditor({ readOnly: true })..."` showed DOM options `readOnly: true` and `editor.api.dom.isReadOnly()` true after patch.
- `pnpm --filter @platejs/core exec bun test src/lib/plugins/dom/DOMPlugin.spec.ts src/react/components/PlateContent.spec.tsx src/react/utils/pipeOnChange.spec.ts src/react/utils/pipeRenderElement.spec.tsx src/lib/utils/pipeOnTextChange.spec.ts src/lib/utils/pipeOnNodeChange.spec.ts src/internal/plugin/pipeNormalizeInitialValue.spec.tsx`: 43 pass, 0 fail.
- `rg -n "domRuntimeState|setDomRuntimeReadOnly|isDomRuntimeReadOnly" packages/core/src packages/core/type-tests --glob '!**/dist/**'`: 0 matches.
- `pnpm --filter @platejs/core typecheck`: pass.
- `pnpm --filter @platejs/core test`: 689 pass, 0 fail.
- `pnpm --filter @platejs/core lint`: pass.
- `pnpm check:core`: pass; Core 689 pass, Plite 1872 pass / 85 skip, 0 fail.

Final handoff contract:
- target surface and mode: named Core/Plite boundary cut for DOM read-only state
- files/APIs reviewed: DOMPlugin read-only API, Core plugin composition, React DOM wrapper composition, read-only edit-only tests
- broad Core drift score coverage: N/A, not requested
- best Plate v2 recommendation: cut Core WeakMap side-channel; do not move it into Plite
- verdict matrix summary: all reviewed targets keep after proof
- Plite/Plate gaps or blockers: no blocker; optional future raw mutable read-only API deferred
- related Core sweep query/matches/patched/deferred: stale-symbol audit 0 matches after 6 patched call sites/tests
- changes made: Core side-channel removed; read-only routed through DOMPlugin configuration/runtime path
- tests/proof commands: focused Bun test, stale-symbol audit, Core typecheck/test/lint, `pnpm check:core`
- old compatibility names audited: `domRuntimeState`, `setDomRuntimeReadOnly`, `isDomRuntimeReadOnly`
- needs attention: raw non-React mutable read-only only if a real caller appears
- next best Plate Next packet: continue file-by-file Core review; no action required for this packet

Reboot status:
| Question | Answer |
|----------|--------|
| Where am I? | Completed named boundary cut |
| Where am I going? | Close the goal after plan checker passes |
| What is the goal? | Delete Core `domRuntimeState` and prove read-only still works through the DOM/Plite runtime path |
| What have I learned? | React `dom` plugin replacement was the only real trap |
| What have I done? | See Timeline |

Timeline:
- 2026-06-29T20:53:21.891Z Goal plan created.
- Cut Core read-only WeakMap side-channel.
- Patched DOMPlugin, getCorePlugins, getPlateCorePlugins, withPlate/withPlite, PlateContent, and read-only tests.
- Reproduced and fixed React read-only option loss.
- Ran focused proof, stale-symbol audit, Core package proof, and `check:core`.

Open risks:
- Optional future Plite design: mutable raw-editor read-only API. Not required for this cut.
