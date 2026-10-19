# plate-next input rules before API

Objective:
Move input-rule before matching into Plite and clean Core helpers; done when Plite/Core tests and typecheck pass.

Goal plan:
docs/plans/2026-07-01-plate-next-input-rules-before-api.md

Template:
docs/plans/templates/plate-next.md

Primary template:
docs/plans/templates/plate-next.md

Applied packs:
- none

Plate Next source:
- prompt / link: user said "go" after accepting the review that `getPointBeforeInputRule` is a migration gap and `toggleBlock` is Core drift.
- mode: one-shot execution, named API/file cleanup with a related sweep
- target surface: Plite `editor.read.points.before` and Core input-rules
- review target: best Plate v2 migration on top of Plite, not legacy
  compatibility
- broad Core sweep: no
- correction-triggered related Core sweep: yes, for old `editor.api.before` replacement helpers and local toggle-block drift
- completion threshold summary: Plite owns match-string point-before semantics; Core input-rules has no weak local replacement; focused Plite/Core proof passes.

First checkpoint:
- Copy every explicit prompt requirement into this plan before implementation:
  target, duration, non-goals, stop condition, proof commands, final handoff,
  and whether the user asked for `sweep`, `all core`, `full-loop`, or an
  equivalent broad Core review.
- If broad Core sweep is in scope, fill the Core drift ledger rows in this
  plan before closing any packet. Keep this template-only.

Timed checkpoint:
- requested duration: none
- semantics: N/A
- initial confidence score: N/A
- improvement loop: N/A
- final score / loop closure: N/A

Completion threshold:
- `editor.read.points.before` supports old Slate/Plate match-string semantics needed by input rules: `matchString`, `afterMatch`, `skipInvalid`, and direct predicate `match`.
- Plite has focused tests ported from old `packages/slate/src/internal/editor/getPointBefore.spec.tsx` behavior.
- Core input-rules no longer owns a local `getPointBeforeInputRule` replacement.
- Core input-rules no longer owns a local generic `toggleBlock` reimplementation unless a real Plate gap blocks it and is recorded.
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
- `node .agents/skills/autogoal/scripts/check-complete.mjs docs/plans/2026-07-01-plate-next-input-rules-before-api.md`
  passes after final evidence is recorded.

Verification surface:
- focused tests / commands: Plite point-before tests; Core input-rules tests
- package proof: `pnpm --filter @platejs/plite typecheck`, `pnpm --filter @platejs/core typecheck`
- source audits: `origin/main` old `getPointBefore.ts`, current Plite `before`, Core input-rules callers
- related Core sweep query / match count / patched count / deferred count: record after patch
- Plite/Plate gap ledger: record any remaining toggle-block command gap
- broad Core drift ledger gate: N/A, not a broad Core sweep
- final plan check: `node .agents/skills/autogoal/scripts/check-complete.mjs docs/plans/2026-07-01-plate-next-input-rules-before-api.md`

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
- allowed edit scope: `packages/plite/**`, `packages/core/src/lib/plugins/input-rules/**`, focused tests, this plan
- package/API surfaces: Plite read API and Core input-rule behavior only
- docs/browser surfaces: N/A unless API docs become stale from the patch
- non-goals: broad Core sweep, rename pass, public docs rewrite, feature package fallout
- out-of-scope package errors: non-Core/non-Plite package failures unless caused by the touched public API

Output budget strategy:
- For broad Core sweep, use manifest counts and ledger artifacts instead of
  streaming every file path into chat.
- For named file/API work, use targeted `sed`/`rg` reads and capped output.

Blocked condition:
Blocked only if matching point-before semantics require a broader Plite API fork that cannot be made without changing public API shape beyond `points.before` options. If so, stop with `plite-plan`.

Current verdict:
- verdict: complete
- confidence: high for the named input-rules / Plite-before packet
- next owner: plate-next
- keep / revert / quarantine call: keep
- reason: Plite now owns the match-string point-before semantics and the generic nodes toggle transaction; Core input-rules no longer carries the local weak reimplementations.

Phase / pass table:
| Phase | Status | Evidence |
|-------|--------|----------|
| Checkpoint zero | done | Requirements, scope, non-goals, stop condition, proof commands, and final handoff requirements are copied above. |
| Plite before API | done | `editor.read.points.before` accepts match options and has focused fixture coverage. |
| Plite tx nodes toggle | done | `editor.update.nodes.toggle` has transform-contract coverage. |
| Core input-rules cleanup | done | Local helper drift removed from `createInputRules.ts`. |
| Related source audit | done | Targeted `rg` audits found no leftover scoped helpers or old call sites. |
| Final proof | done | Plite/Core tests and typechecks passed. |

Start Gates:
| Gate | Applies | Evidence |
|------|---------|----------|
| Prompt requirements captured before work | yes | Explicit requirements copied above. |
| `plate-next` skill/rule read | yes | `.agents/skills/plate-next/SKILL.md` read. |
| Active goal checked or created | yes | Goal created for this packet. |
| Mode classified as named packet vs broad Core sweep | yes | Named API/file cleanup, not broad Core. |
| Review target recorded as best Plate v2 / Plite-fit / no legacy compat | yes | Plite owns point-before semantics; Core must not local-wrap it. |
| Broad Core drift ledger initialized when in scope | no | N/A: broad Core sweep not requested. |
| Source of truth and allowed workspace recorded | yes | `origin/main` old Slate/Core files plus current Plite/Core files. |
| Output budget strategy recorded | yes | Targeted file reads and capped `rg` only. |
| Public API fork routing checked | yes | Extending existing `points.before` options is substrate repair; no separate public naming fork. |
| Gap policy checked | yes | Toggle-block may become Plate gap if no tx command owner exists. |
| Related Core sweep policy checked | yes | Required after correction. |
| Review-mode rename freeze checked | yes | No rename pass in scope. |

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
| Named verification threshold | yes | Run the proof commands named in this plan | Plite before fixtures, Plite transform contract, Core input-rules tests, and both package typechecks passed. |
| Broad Core drift ledger coverage | no | Record manifest details only for broad Core sweep | Not applicable: user accepted a named input-rules packet, not all-Core review. |
| Score gate | no | Apply only when broad drift scoring applies | Not applicable for this scoped packet. |
| Best Plate v2 recommendation | yes | Record recommended current shape and rejected legacy/hack alternatives | Plite owns point-before matching and generic nodes toggle; Core owns input-rule product logic only. |
| Plite/Plate gap ledger | yes | Record blockers or N/A when no gap blocks the target | Closed by adding Plite `points.before` match options and `tx.nodes.toggle`. |
| Related Core sweep after correction | yes | Search same-class patterns after corrections | Targeted `rg` searches found no leftover scoped helper/call-site drift. |
| Package/API proof | yes | Run focused typecheck/test commands | `@platejs/plite` typecheck, `@platejs/core` typecheck, Plite/Core tests passed. |
| Non-Core package error triage | no | Classify only if proof reports non-Core failures | No non-Core proof command was part of the packet. |
| Source audit | yes | Audit removed local helpers and old call sites | `rg` found no `getPointBeforeInputRule`, no local `const toggleBlock`, no scoped `editor.api.before`, and no scoped `editor.tf.toggleBlock`. |
| Rename ledger | no | Update pre-renaming when rename is postponed or kept | No renames introduced. |
| Extracted-file inventory | no | Record untracked/extracted file rows when in scope | No extracted Core files were introduced by this packet. |
| Autoreview / review | no | Run review gate for broad/non-trivial tree work | Not run: this is a named mechanical API migration with focused green proof. |
| Final lint/check | yes | Run scoped lint/check or record N/A | Scoped Biome command passed before final proof; no formatting changes followed. |
| Changed list / top drift / needs attention | yes | Fill handoff ledgers | Filled below. |
| Goal plan complete | yes | Run `check-complete.mjs` | Run after this evidence update. |

Review matrix:
| Path / API | Drift score | Verdict | Owner | Evidence | Next |
|------------|-------------|---------|-------|----------|------|
| `packages/plite/src/editor/before.ts` / `editor.read.points.before` | 0 | move-to-plite | Plite | Implements match-string, after-match, block-start, predicate, skip-invalid behavior. | Keep. |
| `packages/plite/src/interfaces/editor.ts` / `EditorBeforeOptions` | 0 | move-to-plite | Plite | Public substrate options describe the behavior Core needs without Core-local wrappers. | Keep. |
| `packages/plite/src/core/public-state.ts` / `tx.nodes.toggle` | 0 | move-to-plite | Plite | Generic node toggle belongs beside set/wrap/unwrap nodes transaction methods. | Keep. |
| `packages/core/src/lib/plugins/input-rules/createInputRules.ts` | 1 | keep-in-plate | Core | File now uses Plite point-before and nodes-toggle APIs while keeping input-rule matching semantics in Core. | Keep. |
| Plite before fixtures and transform contract tests | 0 | keep-proof | Plite | Added coverage for ported before semantics and nodes toggle behavior. | Keep. |

Best Plate v2 recommendation:
| Target | Recommended shape | Rejected legacy/hack alternatives | Reason | User-review need |
|--------|-------------------|-----------------------------------|--------|------------------|
| Input-rule point-before matching | Extend Plite `editor.read.points.before` options. | Core-local `getPointBeforeInputRule`; resurrecting `editor.api.before`; per-plugin string scanning. | This is editor substrate traversal behavior, not Plate product behavior. | Low. |
| Block/list toggle from input rules | Use Plite `editor.update.nodes.toggle`. | Core-local `toggleBlock`; `editor.tf.toggleBlock`; command fallback bridge. | Generic element type toggling belongs in Plite tx nodes, while Plate supplies plugin keys/types. | Medium only if naming of `nodes.toggle` needs taste review. |

Plite / Plate gap ledger:
| Gap type | Missing capability | Why local workaround is a hack | Smallest owner | Proof needed | Decision |
|----------|--------------------|-------------------------------|----------------|--------------|----------|
| Plite gap closed | Match-aware point-before traversal | Core-local helper duplicated old Slate internals and missed multi-leaf behavior. | Plite read points API | Plite before fixtures | Closed. |
| Plite gap closed | Generic node type toggle transaction | Core-local helper made input-rules own a generic editor transform. | Plite tx nodes API | Plite transform contract tests | Closed. |

Related Core sweep ledger:
| Trigger correction | Sweep query / method | Matches | Patched | Deferred | Remaining risk |
|--------------------|----------------------|---------|---------|----------|----------------|
| Remove local point-before helper | `rg -n "getPointBeforeInputRule|const toggleBlock" packages/core/src/lib/plugins/input-rules packages/core/src packages/plite/src -g '*.ts' -g '*.tsx'` | 0 | 0 | 0 | None in scoped target. |
| Cut old scoped call sites | `rg -n "editor\\.api\\.before\\(|editor\\.tf\\.toggleBlock" packages/core/src/lib/plugins/input-rules packages/core/type-tests -g '*.ts' -g '*.tsx'` | 0 | 0 | 0 | Feature packages outside this input-rules packet may still need later Plate migration. |
| Verify new owner paths | `rg -n "nodes\\.toggle|matchString|afterMatch|skipInvalid|matchBlockStart" ...` | 40 | 40 reviewed | 0 | Matches are expected API/test uses. |

Core drift ledger:
- Applies: no, not a broad Core sweep
- Manifest command: scoped packet; no all-Core manifest
- Manifest owner: `packages/core/src/**/*.{ts,tsx,mts,cts}`
- Optional type-test owner: `packages/core/type-tests/**/*.{ts,tsx,mts,cts}`
- Ledger location: scoped review matrix above
- Expected row count: no broad ledger required
- Actual row count: no broad ledger required
- Missing row count: no broad ledger required
- Extra row count: no broad ledger required
- Score gate: scoped rows are under drift score 2
- Top drift rows: none in scope

Core file drift rows:
| Path | Drift score | Verdict | Owner | Evidence | Next |
|------|-------------|---------|-------|----------|------|
| `packages/core/src/lib/plugins/input-rules/createInputRules.ts` | 1 | keep-in-plate | Core | Uses Plite-owned traversal/toggle APIs; no local generic helper remains. | Later package sweep can migrate non-Core feature callers. |

Packet ledger:
| Packet | Owner | Hypothesis / smell | Files / commands | Decision | Next |
|--------|-------|--------------------|------------------|----------|------|
| Plite before API | Plite | Old match-string behavior belongs in substrate traversal. | `before.ts`, `editor.ts`, before fixtures | keep | None. |
| Plite nodes toggle | Plite | Generic block toggle should not live inside input-rules. | `public-state.ts`, `transforms-contract.ts` | keep | None. |
| Core input-rules cleanup | Core | Core should compose Plite APIs, not duplicate them. | `createInputRules.ts`, input-rules tests | keep | Later feature-package migration remains separate. |

Extracted file ledger:
| Path | Bucket | Origin/main owner check | Decision | Proof |
|------|--------|-------------------------|----------|-------|
| No extracted Core file in scope | not applicable | No new Core owner path created. | not applicable | scoped audit plus changed file review |

Out-of-scope package drift:
| Package / command | Error summary | Why not blocking this run | Owner / next |
|-------------------|---------------|---------------------------|--------------|
| Non-Core feature packages | Some old toggle patterns may exist outside this named Core input-rules packet. | The user asked to act on the accepted `getPointBeforeInputRule` / input-rules gap now, not sweep all packages. | Future Plate package migration sweep. |

Changed list:
| Group | Current-run changes |
|-------|---------------------|
| code/runtime/API | Plite `EditorBeforeOptions`; Plite `before`; Plite `tx.nodes.toggle`; Core input-rules calls Plite APIs. |
| tests/proof | Added Plite before fixtures and nodes-toggle transform contract tests. |
| docs/templates/skills | Updated this autogoal plan only. |
| reverted/quarantined packets | No packet reverted or quarantined. |

Needs your attention:
| Rank | Item | Why | Anchor | Recommendation |
|------|------|-----|--------|----------------|
| 1 | `editor.update.nodes.toggle` public shape | It is the new generic Plite owner for this behavior. | `packages/plite/src/interfaces/editor.ts` | Keep unless you want a different tx group name. |

Findings:
- `getPointBeforeInputRule` was a valid Core drift smell: the right fix was Plite traversal capability, not another Core helper.
- `toggleBlock` was also too generic for Core input-rules; the Plite tx nodes API now covers the behavior.

Decisions and tradeoffs:
- Chose a bivariant Plite read option extension instead of a new safe helper name. This keeps app/Core code on `editor.read.points.before`.
- Chose `tx.nodes.toggle` instead of a Plate-only `toggleBlock` helper because the operation is generic node mutation.
- Kept input-rule matching/pattern logic in Core because that is Plate product behavior.

Error attempts:
| Error / failed attempt | Count | Next different move | Resolution |
|------------------------|-------|---------------------|------------|
| Ran Plite single-file test without `./` path prefix | 1 | Use Bun-compatible relative path | Re-ran `pnpm --filter @platejs/plite test ./test/transforms-contract.ts`, passed. |

Verification evidence:
- `pnpm --filter @platejs/plite test ./test/transforms-contract.ts` -> 27 pass, 0 fail.
- `PLITE_FIXTURE_FILTER=interfaces/Editor/before pnpm --filter @platejs/plite test test/index.spec.ts` -> 18 pass, 0 fail.
- `pnpm --filter @platejs/core exec bun test src/lib/plugins/input-rules` -> 7 pass, 0 fail.
- `pnpm --filter @platejs/plite typecheck` -> pass.
- `pnpm --filter @platejs/core typecheck` -> pass.
- `pnpm exec biome check packages/plite/src/editor/before.ts packages/plite/src/interfaces/editor.ts packages/plite/src/core/public-state.ts packages/plite/test/transforms-contract.ts packages/core/src/lib/plugins/input-rules/createInputRules.ts packages/plite/test/interfaces/Editor/before/match-string.tsx packages/plite/test/interfaces/Editor/before/after-match-string.tsx packages/plite/test/interfaces/Editor/before/match-block-start.tsx packages/plite/test/interfaces/Editor/before/after-match-multiple-leaves.tsx` -> pass.
- `rg -n "getPointBeforeInputRule|const toggleBlock" packages/core/src/lib/plugins/input-rules packages/core/src packages/plite/src -g '*.ts' -g '*.tsx'` -> no matches.
- `rg -n "editor\\.api\\.before\\(|editor\\.tf\\.toggleBlock" packages/core/src/lib/plugins/input-rules packages/core/type-tests -g '*.ts' -g '*.tsx'` -> no matches.

Final handoff contract:
- target surface and mode: named Plate Next input-rules / Plite API cleanup packet.
- files/APIs reviewed: Plite `before`, Plite editor interfaces, Plite public tx state, Core input-rules, focused tests.
- broad Core drift score coverage: not applicable; scoped named packet.
- best Plate v2 recommendation: Plite owns point-before matching and generic nodes toggle; Core owns input-rule product logic.
- verdict matrix summary: all scoped rows kept; no bridge/helper workaround remains.
- Plite/Plate gaps or blockers: gaps closed; no blocker.
- related Core sweep query/matches/patched/deferred: recorded above.
- changes made: recorded in changed list.
- tests/proof commands: recorded in verification evidence.
- old compatibility names audited: `getPointBeforeInputRule`, local `toggleBlock`, scoped `editor.api.before`, scoped `editor.tf.toggleBlock`.
- needs attention: optional review of `editor.update.nodes.toggle` naming only.
- next best Plate Next packet: continue feature-package migration off old toggle/transform surfaces, outside this packet.

Reboot status:
| Question | Answer |
|----------|--------|
| Where am I? | Completed named input-rules cleanup packet. |
| Where am I going? | Close the autogoal after `check-complete` passes. |
| What is the goal? | Move point-before matching and generic node toggle behavior to Plite, then keep Core input-rules clean. |
| What have I learned? | The old Core helper was hiding a real Plite read API gap. |
| What have I done? | Added Plite APIs/tests, cleaned Core input-rules, ran focused proof. |

Timeline:
- 2026-07-01T19:28:41.240Z Goal plan created.
- 2026-07-01T19:36:00Z Plite before and tx nodes API patched.
- 2026-07-01T19:39:00Z Core input-rules migrated to Plite APIs.
- 2026-07-01T19:46:00Z Focused proof and source audits passed.

Open risks:
- Feature packages outside this scoped Core input-rules packet may still have old toggle/transform migration debt. That belongs to the next package sweep, not this closure.
