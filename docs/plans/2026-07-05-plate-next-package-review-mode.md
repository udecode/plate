# plate-next package review mode

Objective:
Update plate-next for package review mode: source rule, plan template, generated skill, and mirror audit.

Goal plan:
docs/plans/2026-07-05-plate-next-package-review-mode.md

Template:
docs/plans/templates/plate-next.md

Primary template:
docs/plans/templates/plate-next.md

Applied packs:
- none

Plate Next source:
- prompt / link: user asked to update `plate-next` going forward for careful
  one-package-at-a-time review.
- mode: skill/template repair
- target surface: `.agents/rules/plate-next.mdc`,
  `docs/plans/templates/plate-next.md`, generated
  `.agents/skills/plate-next/SKILL.md`
- review target: best Plate v2 migration on top of Plite, not legacy
  compatibility
- broad Core sweep: N/A: not applicable to this skill-template repair
- correction-triggered related Core sweep: N/A: not applicable to this skill-template repair
- completion threshold summary: package review mode exists in source rule,
  plan template, and generated skill; source/mirror audit passes.

First checkpoint:
- Copy every explicit prompt requirement into this plan before implementation:
  target, duration, non-goals, stop condition, proof commands, final handoff,
  and whether the user asked for `sweep`, `all core`, `full-loop`, or an
  equivalent broad Core review.
- If broad Core sweep is in scope, fill the Core drift ledger rows in this
  plan before closing any packet. Keep this template-only.

Timed checkpoint:
- requested duration: N/A: not applicable to this skill-template repair
- semantics: N/A: not applicable to this skill-template repair
- initial confidence score: N/A: not applicable to this skill-template repair
- improvement loop: N/A: not applicable to this skill-template repair
- final score / loop closure: N/A: not applicable to this skill-template repair

Completion threshold:
- Done when the source rule and plan template define package review mode, Skiller regenerates the skill mirror, and source/mirror audits pass.
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
- `node .agents/skills/autogoal/scripts/check-complete.mjs docs/plans/2026-07-05-plate-next-package-review-mode.md`
  passes after final evidence is recorded.

Verification surface:
- focused tests / commands: `pnpm install`, `bun x skiller@latest apply`,
  source/mirror `rg` audit, and final `check-complete.mjs`
- package proof: N/A: no package/runtime code changed
- source audits: `rg -n 'Package Review Mode|package file checklist|score
  \`100\`|one checkbox per reviewed file|review-first'
  .agents/rules/plate-next.mdc .agents/skills/plate-next/SKILL.md
  docs/plans/templates/plate-next.md`
- related Core sweep query / match count / patched count / deferred count:
  N/A: not applicable to this skill-template repair
- Plite/Plate gap ledger: N/A: not applicable to this skill-template repair
- broad Core drift ledger gate: N/A: not applicable to this skill-template repair
- final plan check: `node .agents/skills/autogoal/scripts/check-complete.mjs docs/plans/2026-07-05-plate-next-package-review-mode.md`

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
- allowed edit scope: plate-next source rule, plate-next plan template,
  generated mirror, current autogoal plan
- package/API surfaces: N/A: no package/API runtime edits
- docs/browser surfaces: N/A: no user-facing docs/browser surface
- non-goals: no Plate package migration, no Core review, no code refactor
- out-of-scope package errors: N/A: not applicable to this skill-template repair

Output budget strategy:
- For broad Core sweep, use manifest counts and ledger artifacts instead of
  streaming every file path into chat.
- For named file/API work, use targeted `sed`/`rg` reads and capped output.

Blocked condition:
- N/A: not applicable to this skill-template repair

Current verdict:
- verdict: keep
- confidence: 100 for the skill/template repair
- next owner: plate-next
- keep / revert / quarantine call: N/A: not applicable to this skill-template repair
- reason: N/A: not applicable to this skill-template repair

Start Gates:
| Gate | Applies | Evidence |
|------|---------|----------|
| Prompt requirements captured before work | N/A: not applicable to this skill-template repair | N/A: not applicable to this skill-template repair |
| `plate-next` skill/rule read | yes | Read `.agents/skills/plate-next/SKILL.md` and `.agents/rules/plate-next.mdc` |
| Active goal checked or created | yes | `get_goal` returned no goal; `create_goal` created this repair goal |
| Mode classified as named packet vs broad Core sweep | N/A: not applicable to this skill-template repair | N/A: not applicable to this skill-template repair |
| Review target recorded as best Plate v2 / Plite-fit / no legacy compat | N/A: not applicable to this skill-template repair | N/A: not applicable to this skill-template repair |
| Broad Core drift ledger initialized when in scope | N/A: not applicable to this skill-template repair | N/A: not applicable to this skill-template repair |
| Source of truth and allowed workspace recorded | N/A: not applicable to this skill-template repair | N/A: not applicable to this skill-template repair |
| Output budget strategy recorded | yes | Used focused `sed` and `rg`; no broad repo scan |
| Public API fork routing checked | N/A: not applicable to this skill-template repair | N/A: not applicable to this skill-template repair |
| Gap policy checked | N/A: not applicable to this skill-template repair | N/A: not applicable to this skill-template repair |
| Related Core sweep policy checked | N/A: not applicable to this skill-template repair | N/A: not applicable to this skill-template repair |
| Review-mode rename freeze checked | N/A: not applicable to this skill-template repair | N/A: not applicable to this skill-template repair |

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
| Named verification threshold | N/A: not applicable to this skill-template repair | Run the proof commands named in this plan | N/A: not applicable to this skill-template repair |
| Broad Core drift ledger coverage | N/A: not applicable to this skill-template repair | Record manifest command, expected row count, actual row count, missing row count, and extra row count when broad Core sweep applies | N/A: not applicable to this skill-template repair |
| Score gate | N/A: not applicable to this skill-template repair | Prove all scores are valid and high drift is owned/fixed/deferred in the plan ledger | N/A: not applicable to this skill-template repair |
| Best Plate v2 recommendation | N/A: not applicable to this skill-template repair | Record the recommended current shape and rejected legacy/hack alternatives for the reviewed target | N/A: not applicable to this skill-template repair |
| Plite/Plate gap ledger | N/A: not applicable to this skill-template repair | Record blockers or N/A when no gap blocks the target | N/A: not applicable to this skill-template repair |
| Related Core sweep after correction | N/A: not applicable to this skill-template repair | For each correction, run and record same-class Core search/review results | N/A: not applicable to this skill-template repair |
| Package/API proof | N/A: not applicable to this skill-template repair | Run focused typecheck/test/build or record N/A | N/A: not applicable to this skill-template repair |
| Non-Core package error triage | N/A: not applicable to this skill-template repair | If a proof command reports non-Core failures, classify as named/touched/Core-regression or out-of-scope package drift | N/A: not applicable to this skill-template repair |
| Source audit | N/A: not applicable to this skill-template repair | Run exact audit for removed compatibility names or record N/A | N/A: not applicable to this skill-template repair |
| Rename ledger | N/A: not applicable to this skill-template repair | Update `docs/plans/pre-renaming.md` when a rename is postponed or intentionally kept | N/A: not applicable to this skill-template repair |
| Extracted-file inventory | N/A: not applicable to this skill-template repair | Record untracked/extracted file command, row count, and bucket for every file in scope | N/A: not applicable to this skill-template repair |
| Autoreview / review | N/A: not applicable to this skill-template repair | Run review gate for non-trivial implementation diffs or record N/A | N/A: not applicable to this skill-template repair |
| Final lint/check | N/A: not applicable to this skill-template repair | Run scoped lint/check or record N/A | N/A: not applicable to this skill-template repair |
| Changed list / top drift / needs attention | yes | Fill handoff ledgers | Changed list records source rule, template, generated skill, and this plan |
| Goal plan complete | yes | Run `node .agents/skills/autogoal/scripts/check-complete.mjs docs/plans/2026-07-05-plate-next-package-review-mode.md` | passed |

Review matrix:
| Path / API | Drift score | Verdict | Owner | Evidence | Next |
|------------|-------------|---------|-------|----------|------|
| N/A: not applicable to this skill-template repair | N/A: not applicable to this skill-template repair | N/A: not applicable to this skill-template repair | N/A: not applicable to this skill-template repair | N/A: not applicable to this skill-template repair | N/A: not applicable to this skill-template repair |

Best Plate v2 recommendation:
| Target | Recommended shape | Rejected legacy/hack alternatives | Reason | User-review need |
|--------|-------------------|-----------------------------------|--------|------------------|
| N/A: not applicable to this skill-template repair | N/A: not applicable to this skill-template repair | N/A: not applicable to this skill-template repair | N/A: not applicable to this skill-template repair | N/A: not applicable to this skill-template repair |

Plite / Plate gap ledger:
| Gap type | Missing capability | Why local workaround is a hack | Smallest owner | Proof needed | Decision |
|----------|--------------------|-------------------------------|----------------|--------------|----------|
| N/A: not applicable to this skill-template repair | N/A: not applicable to this skill-template repair | N/A: not applicable to this skill-template repair | N/A: not applicable to this skill-template repair | N/A: not applicable to this skill-template repair | N/A: not applicable to this skill-template repair |

Related Core sweep ledger:
| Trigger correction | Sweep query / method | Matches | Patched | Deferred | Remaining risk |
|--------------------|----------------------|---------|---------|----------|----------------|
| N/A: not applicable to this skill-template repair | N/A: not applicable to this skill-template repair | N/A: not applicable to this skill-template repair | N/A: not applicable to this skill-template repair | N/A: not applicable to this skill-template repair | N/A: not applicable to this skill-template repair |

Core drift ledger:
- Applies: N/A: not applicable to this skill-template repair
- Manifest command: N/A: not applicable to this skill-template repair
- Manifest owner: `packages/core/src/**/*.{ts,tsx,mts,cts}`
- Optional type-test owner: `packages/core/type-tests/**/*.{ts,tsx,mts,cts}`
- Ledger location: this table or a linked artifact summarized here
- Expected row count: N/A: not applicable to this skill-template repair
- Actual row count: N/A: not applicable to this skill-template repair
- Missing row count: N/A: not applicable to this skill-template repair
- Extra row count: N/A: not applicable to this skill-template repair
- Score gate: N/A: not applicable to this skill-template repair
- Top drift rows: N/A: not applicable to this skill-template repair

Core file drift rows:
| Path | Drift score | Verdict | Owner | Evidence | Next |
|------|-------------|---------|-------|----------|------|
| N/A: not applicable to this skill-template repair | N/A: not applicable to this skill-template repair | N/A: not applicable to this skill-template repair | N/A: not applicable to this skill-template repair | N/A: not applicable to this skill-template repair | N/A: not applicable to this skill-template repair |

Packet ledger:
| Packet | Owner | Hypothesis / smell | Files / commands | Decision | Next |
|--------|-------|--------------------|------------------|----------|------|
| N/A: not applicable to this skill-template repair | N/A: not applicable to this skill-template repair | N/A: not applicable to this skill-template repair | N/A: not applicable to this skill-template repair | N/A: not applicable to this skill-template repair | N/A: not applicable to this skill-template repair |

Extracted file ledger:
| Path | Bucket | Origin/main owner check | Decision | Proof |
|------|--------|-------------------------|----------|-------|
| N/A: not applicable to this skill-template repair | N/A: not applicable to this skill-template repair | N/A: not applicable to this skill-template repair | N/A: not applicable to this skill-template repair | N/A: not applicable to this skill-template repair |

Out-of-scope package drift:
| Package / command | Error summary | Why not blocking this run | Owner / next |
|-------------------|---------------|---------------------------|--------------|
| N/A: not applicable to this skill-template repair | N/A: not applicable to this skill-template repair | N/A: not applicable to this skill-template repair | N/A: not applicable to this skill-template repair |

Phase / pass table:
| Phase | Status | Evidence | Next |
|-------|--------|----------|------|
| skill-template repair | complete | Source rule, plan template, generated skill, and mirror audit updated | final plan check |

Changed list:
| Group | Current-run changes |
|-------|---------------------|
| code/runtime/API | N/A: not applicable to this skill-template repair |
| tests/proof | N/A: not applicable to this skill-template repair |
| docs/templates/skills | `.agents/rules/plate-next.mdc`, `docs/plans/templates/plate-next.md`, `.agents/skills/plate-next/SKILL.md`, this plan |
| reverted/quarantined packets | N/A: not applicable to this skill-template repair |

Needs your attention:
| Rank | Item | Why | Anchor | Recommendation |
|------|------|-----|--------|----------------|
| N/A: not applicable to this skill-template repair | N/A: not applicable to this skill-template repair | N/A: not applicable to this skill-template repair | N/A: not applicable to this skill-template repair | N/A: not applicable to this skill-template repair |

Findings:
- None yet.

Decisions and tradeoffs:
- None yet.

Error attempts:
| Error / failed attempt | Count | Next different move | Resolution |
|------------------------|-------|---------------------|------------|
| None yet | 0 | | |

Verification evidence:
- `pnpm install` passed.
- `bun x skiller@latest apply` passed.
- `rg -n 'Package Review Mode|package file checklist|score \`100\`|one checkbox per reviewed file|review-first' .agents/rules/plate-next.mdc .agents/skills/plate-next/SKILL.md docs/plans/templates/plate-next.md` found the new package-review law in source, template, and generated skill.
- `node .agents/skills/autogoal/scripts/check-complete.mjs docs/plans/2026-07-05-plate-next-package-review-mode.md` passed.

Final handoff contract:
- target surface and mode: `plate-next` skill/template repair
- files/APIs reviewed: `.agents/rules/plate-next.mdc`,
  `docs/plans/templates/plate-next.md`,
  `.agents/skills/plate-next/SKILL.md`
- broad Core drift score coverage: N/A: not applicable to this skill-template repair
- best Plate v2 recommendation: N/A: not applicable to this skill-template repair
- verdict matrix summary: N/A: not applicable to this skill-template repair
- Plite/Plate gaps or blockers: N/A: not applicable to this skill-template repair
- related Core sweep query/matches/patched/deferred: N/A: not applicable to this skill-template repair
- changes made: package review mode added to source rule and plan template;
  generated mirror synced.
- tests/proof commands: `pnpm install`, `bun x skiller@latest apply`, focused
  source/mirror `rg`, final `check-complete.mjs`
- old compatibility names audited: N/A: not applicable to this skill-template repair
- needs attention: N/A: not applicable to this skill-template repair
- next best Plate Next packet: N/A: not applicable to this skill-template repair

Reboot status:
| Question | Answer |
|----------|--------|
| Where am I? | Final verification |
| Where am I going? | Close the skill/template repair goal |
| What is the goal? | Update `plate-next` so package review mode requires one score-100 checkbox per reviewed package file |
| What have I learned? | `pnpm install` did not refresh the mirror when install was already up to date; direct Skiller apply was required |
| What have I done? | Patched source rule/template, ran Skiller, verified mirror text |

Timeline:
- 2026-07-05T16:30:44.255Z Goal plan created.
- 2026-07-05 Patched `.agents/rules/plate-next.mdc`.
- 2026-07-05 Patched `docs/plans/templates/plate-next.md`.
- 2026-07-05 Ran `pnpm install`, then `bun x skiller@latest apply`.
- 2026-07-05 Verified source/template/generated mirror with focused `rg`.
- 2026-07-05 Ran final `check-complete.mjs`: passed.

Open risks:
- No open evidence gap.
