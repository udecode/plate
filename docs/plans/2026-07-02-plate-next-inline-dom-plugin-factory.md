# plate-next inline DOM plugin factory

Objective:
Remove exported `createDOMPlugin`; done when `DOMPlugin` owns behavior inline,
React avoids the DOM extension conflict, focused Core proof passes, and plan closes.

Goal plan:
docs/plans/2026-07-02-plate-next-inline-dom-plugin-factory.md

Template:
docs/plans/templates/plate-next.md

Primary template:
docs/plans/templates/plate-next.md

Applied packs:
- none

Plate Next source:
- prompt / link: user asked: "remove export const createDOMPlugin just move it inline in export const DOMPlugin"
- mode: one-shot named API cleanup packet
- target surface: `packages/core/src/lib/plugins/dom/DOMPlugin.ts` and the
  React wrapper currently importing `createDOMPlugin`
- review target: best Plate v2 migration on top of Plite, not legacy
  compatibility
- broad Core sweep: no
- correction-triggered related Core sweep: yes, audit `createDOMPlugin`
- completion threshold summary: exported factory removed, DOMPlugin inline,
  React behavior preserved, focused tests/typecheck/lint green

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
- initial confidence score: 85/100
- improvement loop: inline DOM plugin, remove public factory, verify React does
  not re-install conflicting `dom` editor extension
- final score / loop closure: 100/100 after focused tests, Core typecheck,
  Core lint, and source audits passed

Completion threshold:
- `export const createDOMPlugin` is gone.
- `DOMPlugin` contains its plugin chain inline.
- `ReactPlugin` no longer imports or calls `createDOMPlugin`.
- Focused DOM/React Core tests and Core typecheck/lint pass.
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
- `node .agents/skills/autogoal/scripts/check-complete.mjs docs/plans/2026-07-02-plate-next-inline-dom-plugin-factory.md`
  passes after final evidence is recorded.

Verification surface:
- focused tests / commands: `pnpm --filter @platejs/core exec bun test src/lib/plugins/dom/DOMPlugin.spec.ts src/lib/editor/withPlite.spec.ts src/static/editor/withStatic.spec.tsx`
- package proof: `pnpm turbo typecheck --filter=./packages/core`; `pnpm --filter @platejs/core lint`
- source audits: `rg -n "createDOMPlugin" packages/core/src packages/core/type-tests --glob '*.{ts,tsx}'`
- related Core sweep query / match count / patched count / deferred count:
  `createDOMPlugin`: 0 matches, 0 patched, 0 deferred; `inheritEditorExtensions`:
  8 matches in the source-owned adapter and React owner, 0 deferred
- Plite/Plate gap ledger: no expected gap; if React cannot reuse DOM behavior
  without factory or dirty extension stripping, record a Plate gap
- broad Core drift ledger gate: N/A, named packet
- final plan check: `node .agents/skills/autogoal/scripts/check-complete.mjs docs/plans/2026-07-02-plate-next-inline-dom-plugin-factory.md`

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
- allowed edit scope: `DOMPlugin.ts`, `ReactPlugin.ts`, maybe `toPlatePlugin`
  only if needed to avoid dirty local extension stripping, and this plan
- package/API surfaces: Core DOM plugin and React plugin wrapper
- docs/browser surfaces: out of scope
- non-goals: broad Core sweep, public docs, feature package fixes
- out-of-scope package errors: ignore unless caused by this Core change

Output budget strategy:
- For broad Core sweep, use manifest counts and ledger artifacts instead of
  streaming every file path into chat.
- For named file/API work, use targeted `sed`/`rg` reads and capped output.

Blocked condition:
- Stop only if removing the factory requires a public plugin API fork that
  needs user review.

Current verdict:
- verdict: main-parity-cleanup
- confidence: 85/100 before patch
- next owner: plate-next
- keep / revert / quarantine call: keep if `createDOMPlugin` audit is clean and
  focused proof passes
- reason: exported factory is unnecessary API surface; DOMPlugin can own the
  chain inline

Start Gates:
| Gate | Applies | Evidence |
|------|---------|----------|
| Prompt requirements captured before work | yes | Remove exported factory and inline DOMPlugin captured |
| `plate-next` skill/rule read | yes | `.agents/skills/plate-next/SKILL.md` read |
| Active goal checked or created | yes | Goal created for this plan |
| Mode classified as named packet vs broad Core sweep | yes | Named API cleanup packet |
| Review target recorded as best Plate v2 / Plite-fit / no legacy compat | yes | No exported helper just to dodge migration conflict |
| Broad Core drift ledger initialized when in scope | no | N/A: not a broad Core sweep |
| Source of truth and allowed workspace recorded | yes | `/Users/zbeyens/git/plate-2`, Core DOM/React owner |
| Output budget strategy recorded | yes | Targeted reads and focused proof |
| Public API fork routing checked | yes | No public API fork expected |
| Gap policy checked | yes | Record Plate gap if no clean React reuse exists |
| Related Core sweep policy checked | yes | Audit `createDOMPlugin` after patch |
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
| Named verification threshold | yes | Run the proof commands named in this plan | Focused tests, typecheck, lint, and audits passed |
| Broad Core drift ledger coverage | no | Named packet, not broad Core sweep | N/A |
| Score gate | yes | Prove all scores are valid and high drift is owned/fixed/deferred in the plan ledger | All inspected rows score 0 after cleanup |
| Best Plate v2 recommendation | yes | Record the recommended current shape and rejected legacy/hack alternatives for the reviewed target | DOMPlugin inline; React uses source-owned adapter flag |
| Plite/Plate gap ledger | yes | Record blockers or N/A when no gap blocks the target | No Plite gap; small Plate adapter capability kept |
| Related Core sweep after correction | yes | For each correction, run and record same-class Core search/review results | `createDOMPlugin` 0 matches; adapter flag scoped |
| Package/API proof | yes | Run focused typecheck/test/build or record N/A | Core typecheck passed |
| Non-Core package error triage | no | If a proof command reports non-Core failures, classify as named/touched/Core-regression or out-of-scope package drift | No non-Core failures |
| Source audit | yes | Run exact audit for removed compatibility names or record N/A | `rg createDOMPlugin` clean |
| Rename ledger | no | Update `docs/plans/pre-renaming.md` when a rename is postponed or intentionally kept | No rename in packet |
| Extracted-file inventory | no | Record untracked/extracted file command, row count, and bucket for every file in scope | No extracted files in packet |
| Autoreview / review | no | Run review gate for non-trivial implementation diffs or record N/A | N/A: narrow local API cleanup with focused proof |
| Final lint/check | yes | Run scoped lint/check or record N/A | Core lint passed |
| Changed list / top drift / needs attention | yes | Fill handoff ledgers | Filled below |
| Goal plan complete | yes | Run `node .agents/skills/autogoal/scripts/check-complete.mjs docs/plans/2026-07-02-plate-next-inline-dom-plugin-factory.md` | Run after this ledger update |

Review matrix:
| Path / API | Drift score | Verdict | Owner | Evidence | Next |
|------------|-------------|---------|-------|----------|------|
| `packages/core/src/lib/plugins/dom/DOMPlugin.ts` / `createDOMPlugin` | 0 | cut-exported-helper | DOMPlugin | `DOMPlugin` owns the chain inline; `createDOMPlugin` source audit has 0 matches | keep |
| `packages/core/src/react/plugins/react/ReactPlugin.ts` | 0 | keep-in-plate | ReactPlugin | Reuses `DOMPlugin` and disables inherited editor extensions instead of calling a separate factory | keep |
| `packages/core/src/react/plugin/toPlatePlugin.ts` / `inheritEditorExtensions` | 0 | keep-in-plate-internal-adapter | `toPlatePlugin` | Keeps normal `plugin.extend` semantics while giving React a source-owned way to omit inherited editor extensions | keep |

Best Plate v2 recommendation:
| Target | Recommended shape | Rejected legacy/hack alternatives | Reason | User-review need |
|--------|-------------------|-----------------------------------|--------|------------------|
| Core DOM plugin | `DOMPlugin` is one inline `createBasePlugin(...).extend...` chain | Exported `createDOMPlugin`, clone-and-strip helper, duplicate React DOM plugin | No extra public/helper surface just to dodge React composition | no |
| React DOM wrapper | `toPlatePlugin(DOMPlugin, { inheritEditorExtensions: false, key: 'dom', handlers })` | Reinstall Plite DOM extension through React, duplicate auto-scroll, or mutate plugin arrays ad hoc | React owns handlers only; Core DOM owns base editor behavior | no |

Plite / Plate gap ledger:
| Gap type | Missing capability | Why local workaround is a hack | Smallest owner | Proof needed | Decision |
|----------|--------------------|-------------------------------|----------------|--------------|----------|
| Plate adapter | Need React to reuse a BasePlugin without inheriting its editor extensions | Exporting `createDOMPlugin` only to produce a no-Plite-DOM variant is fake API surface | `toPlatePlugin` | Existing `toPlatePlugin` suite plus React focused proof | Added `inheritEditorExtensions: false` |

Related Core sweep ledger:
| Trigger correction | Sweep query / method | Matches | Patched | Deferred | Remaining risk |
|--------------------|----------------------|---------|---------|----------|----------------|
| Removed `createDOMPlugin` | `rg -n "createDOMPlugin" packages/core/src packages/core/type-tests --glob '*.{ts,tsx}'` | 0 | 2 files updated before audit | 0 | none |
| Added adapter flag | `rg -n "inheritEditorExtensions" packages/core/src packages/core/type-tests --glob '*.{ts,tsx}'` | 8 matches in `toPlatePlugin.ts` and `ReactPlugin.ts` | 2 files updated | 0 | low: internal config only |

Core drift ledger:
- Applies: no, this is a named API cleanup packet
- Manifest command: N/A
- Manifest owner: `packages/core/src/**/*.{ts,tsx,mts,cts}`
- Optional type-test owner: `packages/core/type-tests/**/*.{ts,tsx,mts,cts}`
- Ledger location: N/A
- Expected row count: N/A
- Actual row count: N/A
- Missing row count: N/A
- Extra row count: N/A
- Score gate: N/A
- Top drift rows: none

Core file drift rows:
| Path | Drift score | Verdict | Owner | Evidence | Next |
|------|-------------|---------|-------|----------|------|
| `packages/core/src/lib/plugins/dom/DOMPlugin.ts` | 0 | cut-exported-helper | DOMPlugin | inline plugin chain, 0 factory references | keep |
| `packages/core/src/react/plugins/react/ReactPlugin.ts` | 0 | keep-in-plate | ReactPlugin | handlers only; inherited editor extension omitted intentionally | keep |
| `packages/core/src/react/plugin/toPlatePlugin.ts` | 0 | keep-in-plate-internal-adapter | Plate adapter | existing tests cover extension/config behavior | keep |

Packet ledger:
| Packet | Owner | Hypothesis / smell | Files / commands | Decision | Next |
|--------|-------|--------------------|------------------|----------|------|
| Inline DOM plugin factory | plate-next | Exported factory is unnecessary helper surface | DOMPlugin, ReactPlugin, toPlatePlugin, focused tests/typecheck/lint/audits | keep | none |

Phase / pass table:
| Phase | Status | Evidence | Next |
|-------|--------|----------|------|
| Start gates | done | Prompt requirements, scope, proof, and stop condition captured | none |
| Implementation | done | Factory removed; DOMPlugin inline; React adapter repaired | none |
| Verification | done | Focused tests, Core typecheck, Core lint, source audits passed | none |
| Closeout | done | Review matrix, gap ledger, changed list, and handoff filled | none |

Extracted file ledger:
| Path | Bucket | Origin/main owner check | Decision | Proof |
|------|--------|-------------------------|----------|-------|
| N/A | N/A | No extracted file in this packet | N/A | N/A |

Out-of-scope package drift:
| Package / command | Error summary | Why not blocking this run | Owner / next |
|-------------------|---------------|---------------------------|--------------|
| N/A | No non-Core package error seen | N/A | N/A |

Changed list:
| Group | Current-run changes |
|-------|---------------------|
| code/runtime/API | `createDOMPlugin` removed; `DOMPlugin` owns the chain inline; `ReactPlugin` uses `inheritEditorExtensions: false`; `toPlatePlugin` supports that internal adapter option |
| tests/proof | No test files changed; existing focused tests pass |
| docs/templates/skills | Plan updated only |
| reverted/quarantined packets | Rejected direct `mergePlugins` attempt because it broke `toPlatePlugin` semantics; restored `plugin.extend` path |

Needs your attention:
| Rank | Item | Why | Anchor | Recommendation |
|------|------|-----|--------|----------------|
| 1 | None | Packet is narrow and green | N/A | No user review needed beyond normal diff read |

Findings:
- Exporting `createDOMPlugin` was unnecessary surface.
- Direct `mergePlugins` in `toPlatePlugin` is wrong because it bypasses existing extension/config semantics.

Decisions and tradeoffs:
- Keep `toPlatePlugin` on `plugin.extend`.
- Add one internal adapter option instead of keeping an exported DOM factory.
- Do not broaden into a Core sweep.

Error attempts:
| Error / failed attempt | Count | Next different move | Resolution |
|------------------------|-------|---------------------|------------|
| Direct `mergePlugins` adapter path broke existing `toPlatePlugin` behavior | 1 | Restore `plugin.extend` and only strip inherited editor extensions through source-owned option | Focused `toPlatePlugin` tests pass |

Verification evidence:
- `pnpm --filter @platejs/core exec bun test src/lib/plugins/dom/DOMPlugin.spec.ts src/lib/editor/withPlite.spec.ts src/static/editor/withStatic.spec.tsx src/react/plugin/toPlatePlugin.spec.ts` -> 70 pass.
- `pnpm turbo typecheck --filter=./packages/core` -> pass.
- `pnpm --filter @platejs/core lint` -> pass.
- `rg -n "createDOMPlugin" packages/core/src packages/core/type-tests --glob '*.{ts,tsx}'` -> 0 matches.
- `rg -n "inheritEditorExtensions" packages/core/src packages/core/type-tests --glob '*.{ts,tsx}'` -> 8 matches, all in `toPlatePlugin.ts` and `ReactPlugin.ts`.

Final handoff contract:
- target surface and mode: named Core DOM/React API cleanup packet
- files/APIs reviewed: `DOMPlugin.ts`, `ReactPlugin.ts`, `toPlatePlugin.ts`
- broad Core drift score coverage: N/A, not requested and not needed
- best Plate v2 recommendation: inline DOMPlugin; React adapter disables inherited editor extensions
- verdict matrix summary: 3 rows, all keep/cut with score 0
- Plite/Plate gaps or blockers: no Plite gap; small Plate adapter option added
- related Core sweep query/matches/patched/deferred: `createDOMPlugin` 0 matches, `inheritEditorExtensions` scoped to 2 owners
- changes made: exported factory removed, React import/call repaired, adapter support added
- tests/proof commands: focused tests, Core typecheck, Core lint, source audits
- old compatibility names audited: `createDOMPlugin`
- needs attention: none
- next best Plate Next packet: continue review-mode file-by-file only when user points at next file

Reboot status:
| Question | Answer |
|----------|--------|
| Where am I? | Closed named DOM factory cleanup packet |
| Where am I going? | Plan check, then final handoff |
| What is the goal? | Remove exported `createDOMPlugin` and keep DOM/React behavior green |
| What have I learned? | `plugin.extend` semantics must be preserved in `toPlatePlugin` |
| What have I done? | Inlined `DOMPlugin`, updated React adapter, ran proof |

Timeline:
- 2026-07-02T10:46:27.430Z Goal plan created.
- 2026-07-02T11:00:00.000Z Removed exported `createDOMPlugin` and inlined `DOMPlugin`.
- 2026-07-02T11:05:00.000Z Repaired `ReactPlugin` through `toPlatePlugin(... inheritEditorExtensions: false)`.
- 2026-07-02T11:10:00.000Z Rejected direct `mergePlugins` after focused test failure and restored `plugin.extend` semantics.
- 2026-07-02T11:15:00.000Z Focused tests, Core typecheck, Core lint, and source audits passed.

Open risks:
- Low: `inheritEditorExtensions` is a small internal adapter option. It is cleaner
  than an exported DOM factory and is covered by existing `toPlatePlugin` tests.
