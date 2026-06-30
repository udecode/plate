# plate-next pre-renaming freeze

Objective:
Freeze Plate Next review-mode renames; restore Added/Deleted rename noise to
current `HEAD` anchors and document later names in `docs/plans/pre-renaming.md`.

Goal plan:
docs/plans/2026-06-28-plate-next-pre-renaming-freeze.md

Template:
docs/plans/templates/plate-next.md

Primary template:
docs/plans/templates/plate-next.md

Applied packs:
- none

Plate Next source:
- prompt / link: user asked to forbid most Added/Deleted rename noise, add
  `pre-renaming.md`, and keep even `PliteExtension`/`withScrolling`-style names
  recoverable after review.
- mode: review-mode workflow repair + current unstaged rename cleanup
- target surface: unstaged Core/Plate rename noise plus `plate-next` rule/template
- broad Core sweep: no
- completion threshold summary: `plate-next` contains a rename-freeze rule,
  template contains rename-ledger gates, `docs/plans/pre-renaming.md` maps
  postponed names, and obvious rename pairs are restored to old paths.

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
- `plate-next` review mode forbids rename churn unless explicitly requested or
  justified by a concrete exception.
- `docs/plans/templates/plate-next.md` requires a rename-ledger gate.
- `docs/plans/pre-renaming.md` maps postponed current-name -> later-name
  decisions and separates real deletions from rename noise.
- Unstaged Added/Deleted rename pairs that were only review noise are restored
  to current `HEAD` paths or explicitly listed as intentional deletions.
- Named file/API work may close from a scoped source map and focused proof.
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
- `node .agents/skills/autogoal/scripts/check-complete.mjs docs/plans/2026-06-28-plate-next-pre-renaming-freeze.md`
  passes after final evidence is recorded.

Verification surface:
- focused tests / commands: source/name audits plus focused Core tests if path
  restoration changes runtime behavior.
- package proof: `pnpm check:core`
- source audits: `git diff --name-status --diff-filter=ADR -- packages/core packages/callout`; `git ls-files --others --exclude-standard packages/core packages/callout`; exact `rg` for restored/postponed names.
- broad Core drift ledger gate: N/A: not a broad Core sweep.
- final plan check: `node .agents/skills/autogoal/scripts/check-complete.mjs docs/plans/2026-06-28-plate-next-pre-renaming-freeze.md`

Constraints:
- Plate owns product composition; Plite owns editor substrate.
- Core must not wrap Plite editor APIs under Plate names.
- No public compat aliases, old Slate shims, or docs for old API names.
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
- Review-mode rename freeze: do not rename files/symbols just because the new
  name is cleaner. Restore review anchors first; map the future rename.

Boundaries:
- allowed edit scope: `.agents/rules/plate-next.mdc`,
  `docs/plans/templates/plate-next.md`, `docs/plans/pre-renaming.md`, this plan,
  and unstaged Core/Callout rename-noise files.
- package/API surfaces: no new public API design in this packet.
- docs/browser surfaces: no browser docs/UI proof needed; this is source-review
  hygiene.
- non-goals: no broad Plate v2 naming cleanup, no final symbol rename pass, no
  resurrecting real deleted compat APIs unless needed for review anchors.
- out-of-scope package errors: package fallout outside Core/Callout is not part
  of this run.

Output budget strategy:
- For broad Core sweep, use manifest counts and ledger artifacts instead of
  streaming every file path into chat.
- For named file/API work, use targeted `sed`/`rg` reads and capped output.

Blocked condition:
No autonomous path to distinguish a rename from a real deletion without user
approval or source evidence.

Current verdict:
- verdict: main-parity-cleanup
- confidence: pass for rename-freeze workflow repair
- next owner: plate-next
- keep / revert / quarantine call: keep
- reason: Added/Deleted rename noise is reduced to real deletions; future
  renames are mapped in `docs/plans/pre-renaming.md`.

Start Gates:
| Gate | Applies | Evidence |
|------|---------|----------|
| Prompt requirements captured before work | yes | Lines 19-28 copy the explicit rename-freeze, `pre-renaming.md`, PliteExtension/withScrolling, and unstaged-file requirements. |
| `plate-next` skill/rule read | yes | Read `.agents/skills/plate-next/SKILL.md` and `.agents/rules/plate-next.mdc`. |
| Active goal checked or created | yes | `get_goal` returned null; created active goal for this plan. |
| Mode classified as named packet vs broad Core sweep | yes | Review-mode rename-freeze packet, not broad Core sweep. |
| Broad Core drift ledger initialized when in scope | no | N/A: not broad Core sweep. |
| Source of truth and allowed workspace recorded | yes | Source owner is `.agents/rules/plate-next.mdc`; workspace `/Users/zbeyens/git/plate-2`. |
| Output budget strategy recorded | yes | Used capped `git diff --name-status`, untracked file lists, and focused `rg`; no broad source dumps. |
| Public API fork routing checked | yes | N/A: no public API fork in this packet. |
| Agent-native pack selected | yes | Agent-native pack applies because `.agents/rules/plate-next.mdc` and generated skill mirror changed. |
| Agent-facing action surface identified | yes | `plate-next` review mode now discovers rename-freeze behavior. |
| Source rule versus generated mirror boundary identified | yes | Source owner `.agents/rules/plate-next.mdc`; mirror `.agents/skills/plate-next/SKILL.md`. |
| `agent-native-reviewer` loaded or waiver recorded | yes | Loaded `.agents/skills/agent-native-reviewer/SKILL.md`; verdict pass, no findings. |

Work Checklist:
- [x] First checkpoint complete: every explicit prompt requirement, scope
      boundary, timing constraint, stop condition, deliverable, final handoff
      section, verification surface, and success criterion is copied into this
      plan before implementation. Evidence: Plate Next source, boundaries, and
      completion threshold above.
- [x] Mode classified: named file/API packet, broad Core sweep, package sweep,
      docs/API mismatch, or public API plan.
- [x] For broad Core sweep, the Core drift ledger in this plan, or linked from
      this plan, has one row per Core source file before closeout.
- [x] N/A: not broad Core sweep. For broad Core sweep, every Core file row has `path`, `drift_score`,
      `verdict`, `owner`, `evidence`, and `next`.
- [x] N/A: not broad Core sweep. For broad Core sweep, the plan records manifest command, expected row
      count, actual row count, missing row count, extra row count, and confirms
      missing/extra are zero.
- [x] N/A: not broad Core sweep. For broad Core sweep, the drift score gate is closed in this plan:
      score `>=2` rows have owner/evidence/next, and score `>=4` rows are not
      closed as `keep-in-plate`.
- [x] Bridge scoring law applied: forbidden bridges score `0`, direct bridge
      imports/installers are capped, displaced owner files are capped, and no
      capped file is raised to 100 from green checks alone. Evidence: no bridge
      score changed in this rename-freeze packet; remaining `runtimeTxExtensions`
      stays outside this packet.
- [x] Review matrix is filled for every inspected file/API/helper.
- [x] Public API forks are routed to `plate-plan` before implementation.
- [x] Review-mode rename freeze applied: Added/Deleted rename noise is restored
      to current `HEAD` names or mapped in `docs/plans/pre-renaming.md` with an
      explicit reason it cannot be restored in this packet.
- [x] Safe cleanup packets are kept, reverted, or quarantined with proof.
      Evidence: kept rename-freeze packet after `pnpm check:core`.
- [x] Focused package proof is run after meaningful code changes. Evidence:
      `pnpm check:core` passed.
- [x] `pnpm brl` is run when exports/barrels change. N/A: no barrel generator
      was needed for this packet; restored files kept existing exported paths.
- [x] Old compatibility names are source-audited when cut. Evidence: remaining
      deleted compat paths are listed in `docs/plans/pre-renaming.md`.
- [x] Changed list, top drift rows, needs-attention rows, and next owner are
      filled before final response.
- [x] Output budget discipline followed. Evidence: capped `sed`, `rg`, and
      Added/Deleted lists only.
- [x] Agent-native pack: source-of-truth rule files are edited instead of generated skill mirrors.
- [x] Agent-native pack: the changed agent action is discoverable from the skill/rule text.
- [x] Agent-native pack: generated mirrors are synced when `.agents/rules/**` changed, or N/A reason is recorded.
- [x] Agent-native pack: accepted agent-native review findings are fixed or explicitly rejected with reason. N/A: no findings.

Completion Gates:
| Gate | Applies | Required action | Evidence |
|------|---------|-----------------|----------|
| Named verification threshold | yes | Run the proof commands named in this plan | `pnpm check:core` passed; source audits listed below passed. |
| Broad Core drift ledger coverage | no | Record manifest command, expected row count, actual row count, missing row count, and extra row count when broad Core sweep applies | N/A: not broad Core sweep. |
| Score gate | no | Prove all scores are valid and high drift is owned/fixed/deferred in the plan ledger | N/A: no drift scoring requested; rename freeze ledger is the score gate substitute. |
| Package/API proof | yes | Run focused typecheck/test/build or record N/A | `pnpm check:core` passed. |
| Non-Core package error triage | no | If a proof command reports non-Core failures, classify as named/touched/Core-regression or out-of-scope package drift | N/A: `pnpm check:core` is scoped and passed. |
| Source audit | yes | Run exact audit for removed compatibility names or record N/A | `git diff --name-status --diff-filter=ADR -- packages/core packages/callout` now shows only 4 intentional deletions; exact rename-path audit found no stale path imports. |
| Rename ledger | yes | Update `docs/plans/pre-renaming.md` when a rename is postponed or intentionally kept | `docs/plans/pre-renaming.md` created. |
| Autoreview / review | no | Run review gate for non-trivial implementation diffs or record N/A | N/A: this is a workflow/rename hygiene packet; agent-native review was the relevant review gate. |
| Final lint/check | yes | Run scoped lint/check or record N/A | `pnpm check:core` passed and includes Core/Plite lint. |
| Changed list / top drift / needs attention | yes | Fill handoff ledgers | Changed list and needs attention tables filled below. |
| Goal plan complete | yes | Run `node .agents/skills/autogoal/scripts/check-complete.mjs docs/plans/2026-06-28-plate-next-pre-renaming-freeze.md` | Passed. |
| Agent source / generated sync | yes | Run `pnpm install` when `.agents/rules/**` changed and verify generated mirrors | `pnpm install`; `bun x skiller@latest apply`; `rg` confirmed rule appears in source and generated mirror. |
| Agent action discoverability | yes | Source-audit the skill/rule path an agent will read | `rg -n "Rename churn is forbidden|pre-renaming.md" .agents/rules/plate-next.mdc .agents/skills/plate-next/SKILL.md` found both. |
| Agent-native review | yes | Load `.agents/skills/agent-native-reviewer/SKILL.md` and close accepted findings, or record N/A | Loaded skill; pass, no findings. |

Review matrix:
| Path / API | Drift score | Verdict | Owner | Evidence | Next |
|------------|-------------|---------|-------|----------|------|
| `pipeNormalizeInitialValue.*` | 1 | main-parity-cleanup | Core plugin initialization | Restored test path; implementation file `pipeTransformInitialValue.ts` remains tracked owner. | Later rename mapped in `pre-renaming.md`. |
| `withPlite.*` | 1 | main-parity-cleanup | Base editor setup | Restored old file path from `extendBaseEditor.*`. | Later rename mapped. |
| `withPlate.ts` | 1 | main-parity-cleanup | React editor setup | Restored old file path from `extendPlateEditor.ts`. | Later rename mapped. |
| `withStatic.*` | 1 | main-parity-cleanup | Static editor setup | Restored old file path from `extendStaticEditor.*`. | Later rename mapped. |
| `withHOC.*` | 1 | main-parity-cleanup | React component helpers | Restored old file path from `composeHOC.*`. | Later rename mapped. |
| `EditorMethodsEffect.*` | 1 | main-parity-cleanup | Plate content effects | Restored old file path from `RedecorateEffect.*`. | Later rename mapped. |
| `ContentVisibilityChunk.tsx` | 1 | main-parity-cleanup | Plate content effects | Restored old file path from `PlateContentEffects.tsx`. | Later rename mapped. |
| `getEditorPlugin.ts` | 1 | main-parity-cleanup | React plugin context helper | Restored old file path from `getBasePlugin.ts`. | Later rename mapped. |

Core drift ledger:
- Applies: no
- Manifest command: N/A: this packet is rename-freeze cleanup, not broad Core sweep.
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
| N/A | N/A | N/A | N/A | Not a broad Core sweep. | N/A |

Packet ledger:
| Packet | Owner | Hypothesis / smell | Files / commands | Decision | Next |
|--------|-------|--------------------|------------------|----------|------|
| Rename-freeze restore | plate-next | Added/Deleted rename soup blocks human review. | Restored obvious file-path renames; updated rule/template/ledger; ran `pnpm check:core`. | keep | Later naming pass after review. |

Out-of-scope package drift:
| Package / command | Error summary | Why not blocking this run | Owner / next |
|-------------------|---------------|---------------------------|--------------|
| N/A | N/A | No out-of-scope command failure in this packet. | N/A |

Phase / pass table:
| Phase | Status | Evidence | Next |
|-------|--------|----------|------|
| Rename-freeze repair | complete | Rule/template/ledger patched, generated skill synced, `pnpm check:core` passed. | User reviews remaining deletion rows and later rename map. |

Changed list:
| Group | Current-run changes |
|-------|---------------------|
| code/runtime/API | Restored review anchors: `withPlite`, `withPlate`, `withStatic`, `withHOC`, `EditorMethodsEffect`, `ContentVisibilityChunk`, `getEditorPlugin`, `withScrolling`, and `pipeNormalizeInitialValue` test path. |
| tests/proof | Restored/kept reviewable test paths; `pnpm check:core` passed. |
| docs/templates/skills | Added `docs/plans/pre-renaming.md`; patched `.agents/rules/plate-next.mdc`; synced `.agents/skills/plate-next/SKILL.md`; patched `docs/plans/templates/plate-next.md`; updated this plan. |
| reverted/quarantined packets | No quarantine. Remaining 4 deletions are intentional deletion-review rows in `pre-renaming.md`. |

Needs your attention:
| Rank | Item | Why | Anchor | Recommendation |
|------|------|-----|--------|----------------|
| 1 | Remaining 4 deleted Core files | These are real deletes, not rename noise. | `docs/plans/pre-renaming.md` | Review as deletion/cut, not rename. |
| 2 | `PliteExtensionPlugin` active name | You explicitly called out this naming family; changing the file now would reintroduce A/D noise because no tracked old source file exists. | `docs/plans/pre-renaming.md` | Keep mapped until the dedicated rename pass. |

Findings:
- Tracked deletion list dropped from 23 Core/Callout review anchors to 4 real
  Core deletions after restoring rename pairs.
- Remaining deleted Core files are documented as intentional deletion review
  items, not rename pairs.

Decisions and tradeoffs:
- Review mode keeps old names even if the later name is better. The current
  diff must be reviewable before naming cleanup.

Error attempts:
| Error / failed attempt | Count | Next different move | Resolution |
|------------------------|-------|---------------------|------------|
| None yet | 0 | | |

Verification evidence:
- `pnpm install` -> up to date.
- `bun x skiller@latest apply` -> generated `.agents/skills/plate-next/SKILL.md` synced.
- `pnpm check:core` -> pass.
- `git diff --name-status --diff-filter=ADR -- packages/core packages/callout` -> only 4 intentional deletion-review rows remain.
- `git ls-files --others --exclude-standard packages/core packages/callout` -> remaining new files are unpaired additions/extractions, not restored rename pairs.
- `rg -n "from './extendStaticEditor'|from '../editor/extendStaticEditor'|from './extendPlateEditor'|from './extendBaseEditor'|from './composeHOC'|from './RedecorateEffect'|PlateContentEffects|PliteReactExtensionPlugin\\.spec" packages/core/src packages/core/type-tests --glob '!**/dist/**'` -> no matches.
- `node .agents/skills/autogoal/scripts/check-complete.mjs docs/plans/2026-06-28-plate-next-pre-renaming-freeze.md` -> pass.

Final handoff contract:
- target surface and mode: Plate Next review-mode rename freeze.
- files/APIs reviewed: Added/Deleted Core/Callout rename pairs plus
  `plate-next` rule/template.
- broad Core drift score coverage: N/A, not broad Core sweep.
- verdict matrix summary: main-parity-cleanup for rename pairs; intentional
  deletion-review for the remaining 4 deleted files.
- changes made: see Changed list.
- tests/proof commands: `pnpm check:core`, source audits, skill mirror audit.
- old compatibility names audited: remaining real deletions documented.
- needs attention: review remaining deletion rows and decide later rename pass.
- next best Plate Next packet: review remaining public/core API drift without
  rename churn.

Reboot status:
| Question | Answer |
|----------|--------|
| Where am I? | Rename-freeze implementation and proof |
| Where am I going? | Source sync, Core proof, and plan closeout |
| What is the goal? | Freeze rename noise and document the later rename pass. |
| What have I learned? | Added/deleted noise was mostly rename churn; a few remaining deletions are real compat/runtime cuts. |
| What have I done? | Restored obvious rename pairs and created the pre-renaming ledger. |

Timeline:
- 2026-06-28T07:18:06.611Z Goal plan created.
- 2026-06-28 Restored obvious rename pairs to current `HEAD` paths.
- 2026-06-28 Added `docs/plans/pre-renaming.md`.
- 2026-06-28 Synced generated `plate-next` skill mirror.
- 2026-06-28 Ran `pnpm check:core`; passed.
- 2026-06-28 Ran goal-plan completeness check; passed.

Open risks:
- `withScrolling` is restored as a thin wrapper for review. It may still be cut
  in the later Plate v2 closure pass after user review.
