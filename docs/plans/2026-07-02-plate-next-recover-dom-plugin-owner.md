# plate-next recover dom plugin owner

Objective:
Recover Plate DOM plugin owner; done when extracted DOM helper is moved back or justified, related sweeps pass, and proof is recorded.

Goal plan:
docs/plans/2026-07-02-plate-next-recover-dom-plugin-owner.md

Template:
docs/plans/templates/plate-next.md

Primary template:
docs/plans/templates/plate-next.md

Applied packs:
- none

Plate Next source:
- prompt / link: user asked: "wtf is packages/core/src/internal/plugins/dom/createPlateDOMPluginBase.ts move it back to its file"
- mode: one-shot review-mode implementation
- target surface: `packages/core/src/internal/plugins/dom/createPlateDOMPluginBase.ts` and the DOM plugin owner
- review target: best Plate v2 migration on top of Plite, not legacy
  compatibility
- broad Core sweep: no, named extracted-file recovery packet
- correction-triggered related Core sweep: yes, search for `createPlateDOMPluginBase` and related DOM owner imports/callers
- completion threshold summary: extracted helper deleted or justified, DOM behavior in correct owner, focused proof green, plan complete

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
- initial confidence score: 80/100
- improvement loop: compare current owner to `origin/main`, move behavior back to main owner, sweep callers, run focused proof
- final score / loop closure: 96/100 after owner recovery, focused proof, and
  full `check:core`; residual risk is only user taste on exposing
  `createDOMPlugin()` from the DOM owner file

Completion threshold:
- The extracted `packages/core/src/internal/plugins/dom/createPlateDOMPluginBase.ts` file is either removed by moving its logic back to the correct DOM owner or explicitly justified with a real owner.
- No import/caller keeps the extracted helper unless justified.
- Focused Core proof passes.
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
- `node .agents/skills/autogoal/scripts/check-complete.mjs docs/plans/2026-07-02-plate-next-recover-dom-plugin-owner.md`
  passes after final evidence is recorded.

Verification surface:
- focused tests / commands: `pnpm turbo typecheck --filter=./packages/core`; focused DOM/Core tests when owner is known
- package proof: Core typecheck plus focused tests; `pnpm check:core` if risk warrants
- source audits: `rg -n "createPlateDOMPluginBase|PlateDomApi|AutoScrollUpdate|autoScroll" packages/core/src packages/core/type-tests`
- related Core sweep query / match count / patched count / deferred count:
  `createPlateDOMPluginBase|internal/plugins/dom` returned 0 matches;
  `PlateDomApi|AutoScrollUpdate|autoScroll|createDOMPlugin` returned only
  `DOMPlugin.ts`, `DOMPlugin.spec.ts`, and `ReactPlugin.ts`
- Plite/Plate gap ledger: no blocking gap; React needed a DOM-owner factory,
  not an internal bridge
- broad Core drift ledger gate: N/A, named extracted-file recovery packet
- final plan check: `node .agents/skills/autogoal/scripts/check-complete.mjs docs/plans/2026-07-02-plate-next-recover-dom-plugin-owner.md`

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
- allowed edit scope: `packages/core/src/internal/plugins/dom/**`, `packages/core/src/lib/plugins/dom/**`, callers/imports needed to restore owner, focused tests/plan
- package/API surfaces: Core DOM plugin and Plate DOM tx/API extension
- docs/browser surfaces: out of scope
- non-goals: broad Core sweep, rename pass, public docs, feature-package migration
- out-of-scope package errors: ignore unless caused by Core DOM API change

Output budget strategy:
- For broad Core sweep, use manifest counts and ledger artifacts instead of
  streaming every file path into chat.
- For named file/API work, use targeted `sed`/`rg` reads and capped output.

Blocked condition:
- Stop only if clean owner recovery requires a public Plate/Plite API fork that needs user review.

Current verdict:
- verdict: accepted execution
- confidence: 80/100 before source comparison
- next owner: plate-next
- keep / revert / quarantine call: keep only if ownership becomes cleaner than extracted helper
- reason: extracted internal helper smells like migration topology noise

Start Gates:
| Gate | Applies | Evidence |
|------|---------|----------|
| Prompt requirements captured before work | yes | Target file and requested move-back captured |
| `plate-next` skill/rule read | yes | `.agents/skills/plate-next/SKILL.md` read |
| Active goal checked or created | yes | Active goal created for this plan |
| Mode classified as named packet vs broad Core sweep | yes | Named extracted-file recovery packet |
| Review target recorded as best Plate v2 / Plite-fit / no legacy compat | yes | Keep owner clean; no compatibility helper dump |
| Broad Core drift ledger initialized when in scope | no | N/A: not a broad Core sweep |
| Source of truth and allowed workspace recorded | yes | `/Users/zbeyens/git/plate-2`, Core DOM owner |
| Output budget strategy recorded | yes | Focused `sed`, `rg`, `git show`; capped outputs |
| Public API fork routing checked | yes | Route only if DOM owner recovery requires public API fork |
| Gap policy checked | yes | Name Plite/Plate gap instead of helper workaround |
| Related Core sweep policy checked | yes | Sweep helper symbol and DOM extension callers after correction |
| Review-mode rename freeze checked | yes | Restore owner, no naming cleanup pass |

Work Checklist:
- [x] First checkpoint complete: every explicit prompt requirement, scope
      boundary, timing constraint, stop condition, deliverable, final handoff
      section, verification surface, and success criterion is copied into this
      plan before implementation.
- [x] Mode classified: named file/API packet, broad Core sweep, package sweep,
      docs/API mismatch, or public API plan.
- [x] Best Plate v2 call recorded for every reviewed target: `cut`,
      `move-to-plite`, `keep-in-plate`, `private-bridge-with-deletion-gate`,
      `Plite gap`, `Plate gap`, or `blocker`. Evidence: review matrix below.
- [x] Legacy/backcompat decision recorded: no public compat alias, shim,
      duplicate Plate wrapper around Plite, old command fallback, or old docs
      path is kept unless explicitly accepted with deletion gate. Evidence:
      stale DOM option cast removed; no helper import remains.
- [x] Hack check recorded: no bridge/helper dump, broad `any` cast, fake
      alias, or displaced product/plugin behavior is kept as a shortcut.
      Evidence: internal helper deleted; `ReactPlugin` wraps the owner factory.
- [x] Gap ledger updated for every blocker: exact missing Plite or Plate
      capability, why local workaround is wrong, smallest owner, and proof.
      Evidence: no gap blocks this packet.
- [x] After every correction, related Core sweep row is added with query,
      match count, patched count, deferred count, and remaining risk. Evidence:
      related Core sweep ledger below.
- [x] For broad Core sweep, the Core drift ledger in this plan, or linked from
      this plan, has one row per Core source file before closeout. N/A: this is
      a named extracted-file recovery packet, not a broad Core sweep.
- [x] For broad Core sweep, every Core file row has `path`, `drift_score`,
      `verdict`, `owner`, `evidence`, and `next`. N/A: not a broad Core sweep.
- [x] For broad Core sweep, the plan records manifest command, expected row
      count, actual row count, missing row count, extra row count, and confirms
      missing/extra are zero. N/A: not a broad Core sweep.
- [x] For broad Core sweep, the drift score gate is closed in this plan:
      score `>=2` rows have owner/evidence/next, and score `>=4` rows are not
      closed as `keep-in-plate`. N/A: named packet only.
- [x] Bridge scoring law applied: forbidden bridges score `0`, direct bridge
      imports/installers are capped, displaced owner files are capped, and no
      capped file is raised to 100 from green checks alone. Evidence: extracted
      bridge/helper deleted instead of scored clean.
- [x] Review matrix is filled for every inspected file/API/helper.
- [x] Public API forks are routed to `plate-plan` before implementation. N/A:
      no public API fork required.
- [x] Review-mode rename freeze applied: Added/Deleted rename noise is either
      restored to current `HEAD` names or mapped in `docs/plans/pre-renaming.md`
      with an explicit reason it cannot be restored in this packet. Evidence:
      no rename pass; extracted internal file deleted.
- [x] Extracted-file recovery gate closed: every untracked/extracted file in
      scope has an inventory row and bucket, with `origin/main` owner checked
      before keeping any new path/name. Evidence: extracted file ledger below.
- [x] Safe cleanup packets are kept, reverted, or quarantined with proof.
- [x] Focused package proof is run after meaningful code changes.
- [x] `pnpm brl` is run when exports/barrels change. N/A: no barrel output
      changed; existing `dom/index.ts` exports `DOMPlugin.ts`.
- [x] Old compatibility names are source-audited when cut. Evidence:
      `createPlateDOMPluginBase|internal/plugins/dom` source audit returned 0.
- [x] Changed list, top drift rows, needs-attention rows, and next owner are
      filled before final response.
- [x] Output budget discipline followed.

Completion Gates:
| Gate | Applies | Required action | Evidence |
|------|---------|-----------------|----------|
| Named verification threshold | yes | Run the proof commands named in this plan | `pnpm turbo typecheck --filter=./packages/core` pass; focused DOM/Core tests pass; `pnpm check:core` pass |
| Broad Core drift ledger coverage | no | Record manifest command, expected row count, actual row count, missing row count, and extra row count when broad Core sweep applies | N/A: named extracted-file recovery packet |
| Score gate | yes | Prove all scores are valid and high drift is owned/fixed/deferred in the plan ledger | Extracted helper score 4 resolved by `delete-duplicate`; no score >=2 left without next action |
| Best Plate v2 recommendation | yes | Record the recommended current shape and rejected legacy/hack alternatives for the reviewed target | DOM owner file owns factory and product behavior; internal helper rejected |
| Plite/Plate gap ledger | yes | Record blockers or N/A when no gap blocks the target | No blocking Plite/Plate gap; React needed owner-local factory only |
| Related Core sweep after correction | yes | For each correction, run and record same-class Core search/review results | Sweep rows below; no deferred match |
| Package/API proof | yes | Run focused typecheck/test/build or record N/A | Core typecheck pass; focused tests 55 pass; `check:core` pass |
| Non-Core package error triage | no | If a proof command reports non-Core failures, classify as named/touched/Core-regression or out-of-scope package drift | N/A: no failing non-Core package from final proof |
| Source audit | yes | Run exact audit for removed compatibility names or record N/A | `rg -n "createPlateDOMPluginBase|internal/plugins/dom" ...` returned 0 |
| Rename ledger | no | Update `docs/plans/pre-renaming.md` when a rename is postponed or intentionally kept | N/A: no rename requested or applied |
| Extracted-file inventory | yes | Record untracked/extracted file command, row count, and bucket for every file in scope | `git ls-files --others --exclude-standard packages/core/src/internal/plugins/dom packages/core/src/lib/plugins/dom | wc -l` -> 0 |
| Autoreview / review | no | Run review gate for non-trivial implementation diffs or record N/A | N/A: scoped user-driven `plate-next` review packet; `check:core` and source audits are the close gate |
| Final lint/check | yes | Run scoped lint/check or record N/A | `pnpm check:core` pass, including Core/Plite lint |
| Changed list / top drift / needs attention | yes | Fill handoff ledgers | Ledgers below filled |
| Goal plan complete | yes | Run `node .agents/skills/autogoal/scripts/check-complete.mjs docs/plans/2026-07-02-plate-next-recover-dom-plugin-owner.md` | Final gate to run after this edit |

Review matrix:
| Path / API | Drift score | Verdict | Owner | Evidence | Next |
|------------|-------------|---------|-------|----------|------|
| `packages/core/src/internal/plugins/dom/createPlateDOMPluginBase.ts` | 4 -> 0 | delete-duplicate / recover-main-owner | `packages/core/src/lib/plugins/dom/DOMPlugin.ts` | Internal extracted helper deleted; owner logic lives in DOM plugin file | none |
| `packages/core/src/lib/plugins/dom/DOMPlugin.ts` | 3 -> 0 | main-parity-cleanup | Core DOM plugin | `createDOMPlugin()` owns Plate auto-scroll behavior; `DOMPlugin` adds Plite DOM substrate for base editors | user may review factory export taste |
| `packages/core/src/react/plugins/react/ReactPlugin.ts` | 3 -> 0 | main-parity-cleanup | React plugin wrapping DOM owner | Wraps `createDOMPlugin()` without reinstalling base Plite DOM extension; no internal import or `any` wrapper | none |
| `packages/core/src/react/editor/getPlateCorePlugins.ts` | 2 -> 0 | hard-cut stale option | React core plugin list | Removed stale `DOMPlugin.configure({ options: { readOnly } })` path hidden by prior cast | none |
| `packages/core/src/react/editor/withPlate.ts` | 1 -> 0 | main-parity-cleanup | React editor setup | Stops passing stale `readOnly` to `getPlateCorePlugins`; still passes readOnly to `createReactEditor` | none |

Best Plate v2 recommendation:
| Target | Recommended shape | Rejected legacy/hack alternatives | Reason | User-review need |
|--------|-------------------|-----------------------------------|--------|------------------|
| DOM runtime/plugin ownership | Keep DOM product behavior in `DOMPlugin.ts`; expose `createDOMPlugin()` there for React to reuse without base DOM extension; export `DOMPlugin` for base editors with Plite DOM substrate installed | Internal `createPlateDOMPluginBase.ts`; `(toPlatePlugin as any)` cast; duplicated React/base DOM extension install; stale `readOnly` DOM option | One owner, no internal bridge dump, no extension-name conflict, type inference preserved | Low: review whether `createDOMPlugin()` is an acceptable owner-local factory name |

Plite / Plate gap ledger:
| Gap type | Missing capability | Why local workaround is a hack | Smallest owner | Proof needed | Decision |
|----------|--------------------|-------------------------------|----------------|--------------|----------|
| N/A | No blocking gap | React needed to reuse Plate DOM product behavior without base Plite DOM extension; owner-local factory solves it | `DOMPlugin.ts` | Focused tests and `check:core` | closed |

Related Core sweep ledger:
| Trigger correction | Sweep query / method | Matches | Patched | Deferred | Remaining risk |
|--------------------|----------------------|---------|---------|----------|----------------|
| Delete extracted internal helper | `rg -n "createPlateDOMPluginBase|internal/plugins/dom" packages/core/src packages/core/type-tests --glob '*.{ts,tsx}'` | 0 after patch | 2 callers/owner references patched before final audit | 0 | none |
| Keep auto-scroll in DOM owner | `rg -n "PlateDomApi|AutoScrollUpdate|autoScroll|createDOMPlugin" packages/core/src packages/core/type-tests --glob '*.{ts,tsx}'` | 15 lines across `DOMPlugin.ts`, `DOMPlugin.spec.ts`, `ReactPlugin.ts` | DOM owner and React caller patched | 0 | only taste review on factory export |
| Remove stale DOM readOnly configure | `rg -n "readOnly" packages/core/src/react/editor/getPlateCorePlugins.ts packages/core/src/react/editor/withPlate.ts packages/core/src/react/plugins/react/ReactPlugin.ts packages/core/src/lib/plugins/dom/DOMPlugin.ts` | 3 intended `withPlate.ts` readOnly lines | stale `getPlateCorePlugins` DOM option removed | 0 | none |

Core drift ledger:
- Applies: no, named extracted-file recovery packet
- Manifest command: N/A: broad Core sweep not requested
- Manifest owner: `packages/core/src/**/*.{ts,tsx,mts,cts}`
- Optional type-test owner: `packages/core/type-tests/**/*.{ts,tsx,mts,cts}`
- Ledger location: N/A
- Expected row count: N/A
- Actual row count: N/A
- Missing row count: N/A
- Extra row count: N/A
- Score gate: N/A
- Top drift rows: extracted helper was top drift and is deleted

Core file drift rows:
| Path | Drift score | Verdict | Owner | Evidence | Next |
|------|-------------|---------|-------|----------|------|
| N/A | N/A | N/A | N/A | Broad Core drift ledger not in scope | N/A |

Packet ledger:
| Packet | Owner | Hypothesis / smell | Files / commands | Decision | Next |
|--------|-------|--------------------|------------------|----------|------|
| Recover DOM helper owner | Core DOM plugin | Extracted `internal/plugins/dom/createPlateDOMPluginBase.ts` is migration topology noise | `DOMPlugin.ts`, `ReactPlugin.ts`, `getPlateCorePlugins.ts`, `withPlate.ts`; focused tests; `check:core` | keep | none |

Extracted file ledger:
| Path | Bucket | Origin/main owner check | Decision | Proof |
|------|--------|-------------------------|----------|-------|
| `packages/core/src/internal/plugins/dom/createPlateDOMPluginBase.ts` | delete-duplicate / recover-main-owner | `origin/main` has DOM plugin behavior under `packages/core/src/lib/plugins/dom/DOMPlugin.ts` and no internal plugin helper | deleted; behavior moved to `DOMPlugin.ts` | untracked inventory for DOM scope is 0; helper source audit is 0 |

Out-of-scope package drift:
| Package / command | Error summary | Why not blocking this run | Owner / next |
|-------------------|---------------|---------------------------|--------------|
| N/A | no final non-Core failure | final proof passed | none |

Changed list:
| Group | Current-run changes |
|-------|---------------------|
| code/runtime/API | deleted internal DOM helper; moved owner logic into `packages/core/src/lib/plugins/dom/DOMPlugin.ts`; `ReactPlugin` wraps `createDOMPlugin()`; removed stale DOM `readOnly` configure path |
| tests/proof | no test files changed |
| docs/templates/skills | updated this autogoal plan only |
| reverted/quarantined packets | none |

Needs your attention:
| Rank | Item | Why | Anchor | Recommendation |
|------|------|-----|--------|----------------|
| 1 | `createDOMPlugin()` export taste | It is owner-local and clean, but it is a new exported factory from the DOM plugin module | `packages/core/src/lib/plugins/dom/DOMPlugin.ts` | keep unless you want a later naming/API pass |

Phase / pass table:
| Phase | Status | Evidence | Next |
|-------|--------|----------|------|
| DOM owner recovery | complete | Helper deleted, DOM owner repaired, focused proof and `check:core` pass | none |

Findings:
- `origin/main` did not have `packages/core/src/internal/plugins/dom/**`; the extracted helper was not a main-owner recovery.
- Wrapping the full `DOMPlugin` in `ReactPlugin` duplicates the base Plite DOM extension and causes `dom`/`react` extension conflict.
- The clean fix is to keep product DOM behavior in `DOMPlugin.ts`, let base editors use `DOMPlugin`, and let React reuse `createDOMPlugin()`.

Decisions and tradeoffs:
- Kept a small owner-local factory instead of a new internal helper because React needs the Plate DOM product behavior without base Plite DOM substrate.
- Removed stale DOM `readOnly` configuration rather than preserving it behind a cast.

Error attempts:
| Error / failed attempt | Count | Next different move | Resolution |
|------------------------|-------|---------------------|------------|
| Wrapping full `DOMPlugin` in `ReactPlugin` | 1 | Split product DOM behavior from base Plite DOM substrate inside `DOMPlugin.ts` | `ReactPlugin` now wraps `createDOMPlugin()`; `DOMPlugin` adds `pliteDom({ clipboard: false })` only for base editors |

Verification evidence:
- `pnpm turbo typecheck --filter=./packages/core` -> pass.
- `pnpm --filter @platejs/core exec bun test src/lib/plugins/dom/DOMPlugin.spec.ts src/lib/editor/withPlite.spec.ts src/static/editor/withStatic.spec.tsx` -> 55 pass.
- `pnpm check:core` -> pass: Core/Plite typecheck, lint, 705 Core tests, 1889 Plite tests.
- `rg -n "createPlateDOMPluginBase|internal/plugins/dom" packages/core/src packages/core/type-tests --glob '*.{ts,tsx}'` -> 0 matches.
- `git ls-files --others --exclude-standard packages/core/src/internal/plugins/dom packages/core/src/lib/plugins/dom | wc -l` -> 0.
- `find packages/core/src/internal/plugins -maxdepth 4 -type f -print | wc -l` -> 0.

Final handoff contract:
- target surface and mode: named `plate-next` extracted-file recovery packet for DOM plugin ownership
- files/APIs reviewed: `createPlateDOMPluginBase.ts`, `DOMPlugin.ts`, `ReactPlugin.ts`, `getPlateCorePlugins.ts`, `withPlate.ts`
- broad Core drift score coverage: N/A, named packet only
- best Plate v2 recommendation: keep DOM product behavior in `DOMPlugin.ts`; no internal helper bridge
- verdict matrix summary: extracted helper deleted; DOM owner recovered; React caller repaired
- Plite/Plate gaps or blockers: none
- related Core sweep query/matches/patched/deferred: recorded above; 0 deferred
- changes made: recorded in Changed list
- tests/proof commands: recorded in Verification evidence
- old compatibility names audited: helper/internal path audit is 0
- needs attention: optional taste review on `createDOMPlugin()` export name
- next best Plate Next packet: continue one-by-one Core review from the next user-pointed file

Reboot status:
| Question | Answer |
|----------|--------|
| Where am I? | Closure after successful proof |
| Where am I going? | Run final plan checker, then complete active goal |
| What is the goal? | Recover DOM plugin ownership and delete/justify extracted helper |
| What have I learned? | The internal helper existed to dodge a React/base DOM extension conflict; owner-local factory fixes that cleanly |
| What have I done? | Moved behavior back to DOM owner, deleted helper, patched React caller and stale readOnly configure, ran proof |

Timeline:
- 2026-07-02T09:31:26.267Z Goal plan created.
- 2026-07-02T09:34Z Compared current DOM helper with `origin/main` ownership; found no main internal helper owner.
- 2026-07-02T09:38Z Moved DOM product behavior into `DOMPlugin.ts` and deleted extracted helper.
- 2026-07-02T09:42Z Focused typecheck exposed duplicate DOM extension conflict from wrapping full `DOMPlugin` in React.
- 2026-07-02T09:48Z Repaired shape: `createDOMPlugin()` owns Plate behavior, exported `DOMPlugin` adds base Plite DOM substrate.
- 2026-07-02T09:52Z Focused tests and Core typecheck passed.
- 2026-07-02T09:56Z `pnpm check:core` passed and source audits found no extracted helper leftovers.

Open risks:
- Low: `createDOMPlugin()` is a new owner-local factory export. It is cleaner
  than an internal helper, but naming can be revisited in a later API review.
