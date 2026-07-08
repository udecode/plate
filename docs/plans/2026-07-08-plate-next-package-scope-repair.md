# plate-next package scope repair

Objective:
Repair `plate-next` so package review mode stays package-by-package and never
turns a package packet into repo-wide caller/docs/package updates unless the
user explicitly broadens scope.

Goal plan:
docs/plans/2026-07-08-plate-next-package-scope-repair.md

Template:
docs/plans/templates/plate-next.md

Primary template:
docs/plans/templates/plate-next.md

Applied packs:
- none

Plate Next source:
- prompt / link: user correction: "stop updating all, we stay in
  `$plate-next` scope pkg by pkg"
- mode: one-shot workflow repair
- target surface: `.agents/rules/plate-next.mdc`,
  `docs/plans/templates/plate-next.md`, generated
  `.agents/skills/plate-next/SKILL.md`
- review target: best Plate v2 migration on top of Plite, but scoped package
  review remains the default wall
- broad Core sweep: no
- correction-triggered related scoped sweep: yes, source/template/generated
  wording audit
- package review mode: rule repair for future package review mode
- package review target: N/A
- package file checklist gate: N/A
- completion threshold summary: source rule, plan template, and generated skill
  all forbid repo-wide updates during package review and require broader
  matches to become deferred rows or next-package candidates.

First checkpoint:
- Explicit requirement captured: stop updating all; future `plate-next`
  package work must stay package-by-package.
- Non-goal captured: do not continue the previous repo-wide docs/caller sweep.
- Stop condition captured: close only after source/template/generated skill
  carry the scope wall and mechanical audit passes.

Timed checkpoint:
- requested duration: N/A
- semantics: N/A
- initial confidence score: N/A
- improvement loop: N/A
- final score / loop closure: N/A

Completion threshold:
- Package review mode freezes scope to the named package plus the smallest
  Plite/Core owner needed to unblock that package.
- Package review mode explicitly forbids updating docs, examples, unrelated
  packages, package callers outside the named package, generated registries, or
  broad repo surfaces.
- A hard-cut found in one package lands package by package unless the user says
  `all packages`, `current tree`, `full-loop`, `sweep`, or names the broader
  owner.
- Broader audit matches are recorded as deferred rows or next-package
  candidates, not patched.
- `plate-next` source rule, template, and generated skill mirror all contain
  this rule.
- `node .agents/skills/autogoal/scripts/check-complete.mjs docs/plans/2026-07-08-plate-next-package-scope-repair.md`
  passes after final evidence is recorded.

Verification surface:
- source audit:
  `rg -n 'Do not silently turn a package review into a repo-wide migration|Do not run a global caller rewrite|Package-mode final handoff|related scoped sweep|out-of-scope matches discovered|do not update docs, examples' .agents/rules/plate-next.mdc docs/plans/templates/plate-next.md .agents/skills/plate-next/SKILL.md`
- stale wording audit:
  `rg -n 'related Core sweep|After every correction, run a related Core|Run focused `rg`/caller searches across `packages/core/src`' .agents/rules/plate-next.mdc docs/plans/templates/plate-next.md .agents/skills/plate-next/SKILL.md`
- sync proof: `pnpm install && pnpm prepare`
- final plan check:
  `node .agents/skills/autogoal/scripts/check-complete.mjs docs/plans/2026-07-08-plate-next-package-scope-repair.md`

Constraints:
- Do not edit current package code in this repair.
- Do not revert prior work unless explicitly asked.
- Do not broaden into docs/package caller cleanup.
- Source of truth is `.agents/rules/plate-next.mdc`; generated skill is synced,
  not hand-edited.
- Keep `plate-next` package review mode strict: package-by-package first,
  deferred ledger for out-of-scope matches.

Boundaries:
- allowed edit scope: `.agents/rules/plate-next.mdc`,
  `docs/plans/templates/plate-next.md`, generated
  `.agents/skills/plate-next/SKILL.md`, this plan.
- package/API surfaces: no package code changes in this repair.
- docs/browser surfaces: N/A, no app/docs content changed.
- non-goals: no repo-wide migration, no global caller rewrite, no code packet.
- out-of-scope package errors: N/A, no package proof needed.

Output budget strategy:
- Report rule change and audit evidence only.

Blocked condition:
- Block only if generated skill cannot sync from `.agents/rules/plate-next.mdc`;
  resolved by `pnpm install && pnpm prepare`.

Current verdict:
- verdict: hard-cut the broad-update behavior from package review mode.
- confidence: 1.0 after source/template/generated audits.
- next owner: plate-next
- keep / revert / quarantine call: keep
- reason: the rule now matches the intended manual review flow.

Phase / pass table:
| Phase | Status | Evidence |
|-------|--------|----------|
| Package scope workflow repair | done | source rule, template, generated skill, and plan checker are closed |

Start Gates:
| Gate | Applies | Evidence |
|------|---------|----------|
| Prompt requirements captured before work | yes | user correction copied into First checkpoint and Completion threshold |
| `plate-next` skill/rule read | yes | read `.agents/rules/plate-next.mdc`, template, and generated skill context |
| Active goal checked or created | yes | no active goal; created this repair goal |
| Mode classified as named packet vs broad Core sweep | yes | workflow repair, not code/package/broad Core sweep |
| Review target recorded as best Plate v2 / Plite-fit / no legacy compat | yes | package-by-package Plate Next workflow retained |
| Broad Core drift ledger initialized when in scope | no | N/A: not broad Core sweep |
| Source of truth and allowed workspace recorded | yes | `.agents/rules/plate-next.mdc` plus template and generated mirror |
| Output budget strategy recorded | yes | concise rule/audit report |
| Public API fork routing checked | yes | N/A: workflow rule, no public API fork |
| Gap policy checked | yes | N/A: no Plite/Plate substrate gap |
| Related scoped sweep policy checked | yes | repaired from broad Core wording to active-scope wording |
| Review-mode rename freeze checked | yes | no rename packet |
| Package review checklist initialized when in scope | no | N/A: repairing the package review rule, not reviewing a package |

Work Checklist:
- [x] First checkpoint complete: every explicit prompt requirement, scope
      boundary, stop condition, verification surface, and success criterion is
      copied into this plan before implementation.
- [x] Mode classified: workflow repair for `plate-next`, not broad Core/package
      migration.
- [x] Best Plate v2 call recorded: package review mode must be package scoped.
- [x] Legacy/backcompat decision recorded: no broad caller rewrite as implicit
      compat cleanup.
- [x] Hack check recorded: no hiding broad work behind a named package packet.
- [x] Gap ledger updated: N/A, no Plite/Plate gap.
- [x] After correction, related scoped sweep row is added with query, active
      scope, match count, patched count, deferred count, and remaining risk.
- [x] Broad Core sweep rows closed as N/A because broad Core sweep is not in
      scope.
- [x] Package review rows closed as N/A because no package code was reviewed.
- [x] Direct one-shot API audit closed as N/A, no package code changed.
- [x] Plugin export inference audit closed as N/A, no package code changed.
- [x] Empty config inference audit closed as N/A, no package code changed.
- [x] Plugin extension options audit closed as N/A, no package code changed.
- [x] Bridge scoring law applied as N/A, no bridge/code packet.
- [x] Review matrix is filled for the inspected workflow surfaces.
- [x] Public API forks are routed to `plate-plan` before implementation:
      N/A, workflow-only repair.
- [x] Review-mode rename freeze applied: no renames.
- [x] Extracted-file recovery gate closed as N/A, no extracted source files.
- [x] Safe cleanup packet kept with proof.
- [x] Focused package proof is N/A, no package code changed.
- [x] `pnpm brl` is N/A, no exports/barrels changed.
- [x] Old compatibility names audited as N/A, workflow rule only.
- [x] Changed list, needs-attention rows, and next owner are filled.
- [x] Output budget discipline followed.

Completion Gates:
| Gate | Applies | Required action | Evidence |
|------|---------|-----------------|----------|
| Named verification threshold | yes | Verify source/template/generated rule text | source audits passed |
| Broad Core drift ledger coverage | no | Record N/A | N/A: not broad Core sweep |
| Score gate | yes | Prove workflow surfaces are clean | review matrix rows are 100 |
| Best Plate v2 recommendation | yes | Record rule | package review mode stays scoped package-by-package |
| Plite/Plate gap ledger | no | Record N/A | N/A: no gap |
| Related scoped sweep after correction | yes | Run and record same-class search/review results | source/template/generated audits passed |
| Package file checklist | no | Record N/A | N/A: no package review |
| Package/API proof | no | Record N/A | N/A: no package code changed |
| Shared Core gate coverage | no | Record N/A | N/A: no package/core proof change |
| Non-Core package error triage | no | Record N/A | N/A: no proof command hit package failures |
| Source audit | yes | Run exact audit for repaired workflow wording | passed |
| Rename ledger | no | Record N/A | N/A: no rename |
| Extracted-file inventory | no | Record N/A | N/A: no extracted files |
| Autoreview / review | yes | Self-review against user correction | passed; no code package changes |
| Final lint/check | yes | Run sync and plan check | `pnpm install && pnpm prepare`; final checker passed |
| Changed list / top drift / needs attention | yes | Fill handoff ledgers | filled below |
| Goal plan complete | yes | Run `node .agents/skills/autogoal/scripts/check-complete.mjs docs/plans/2026-07-08-plate-next-package-scope-repair.md` | passed |

Review matrix:
| Path / API | Drift score | Verdict | Owner | Evidence | Next |
|------------|-------------|---------|-------|----------|------|
| `.agents/rules/plate-next.mdc` package review mode | 100 | keep-in-plate | plate-next | package scope wall added | keep |
| `docs/plans/templates/plate-next.md` package review rows | 100 | keep-in-plate | plate-next template | scoped sweep and out-of-scope rows added | keep |
| `.agents/skills/plate-next/SKILL.md` generated mirror | 100 | keep-in-plate | skiller output | regenerated by `pnpm prepare`; audit found new rule | keep |

Best Plate v2 recommendation:
| Target | Recommended shape | Rejected legacy/hack alternatives | Reason | User-review need |
|--------|-------------------|-----------------------------------|--------|------------------|
| `plate-next` package review mode | package-by-package; broader matches become deferred rows | repo-wide caller/docs/package rewrites from one package packet | matches the manual review flow and prevents surprise diffs | none |

Plite / Plate gap ledger:
| Gap type | Missing capability | Why local workaround is a hack | Smallest owner | Proof needed | Decision |
|----------|--------------------|-------------------------------|----------------|--------------|----------|
| N/A | none | N/A | N/A | N/A | no blocker |

Related scoped sweep ledger:
| Trigger correction | Active scope | Sweep query / method | Matches | Patched | Deferred | Remaining risk |
|--------------------|--------------|----------------------|---------|---------|----------|----------------|
| package scope wall | source/template/generated skill | audit for `repo-wide migration`, `global caller rewrite`, `related scoped sweep`, `out-of-scope matches discovered` | expected hits present in all owners | source/template/generated mirror | 0 | low |
| stale broad wording | source/template/generated skill | audit for stale `related Core sweep` and old `packages/core/src` sweep wording | 0 | stale wording removed | 0 | low |

Core drift ledger:
- Applies: no
- Manifest command: N/A
- Manifest owner: N/A
- Optional type-test owner: N/A
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
| N/A | N/A | N/A | N/A | no Core source review | N/A |

Package file checklist:
- Applies: no
- Package: N/A
- Manifest command: N/A
- Manifest owner: N/A
- Expected row count: N/A
- Actual row count: N/A
- Checked score-100 count: N/A
- Unchecked/deferred count: N/A
- Missing row count: N/A
- Extra row count: N/A
- Score gate: N/A
- Next package blocked until: N/A

Package file rows:
- [x] N/A: no package code review in this repair.

Packet ledger:
| Packet | Owner | Hypothesis / smell | Files / commands | Decision | Next |
|--------|-------|--------------------|------------------|----------|------|
| package scope repair | plate-next | package mode was too easy to broaden into global cleanup | rule/template/generated skill, sync/audits | keep | continue one package at a time |

Extracted file ledger:
| Path | Bucket | Origin/main owner check | Decision | Proof |
|------|--------|-------------------------|----------|-------|
| N/A | N/A | N/A | N/A | no extracted files |

Out-of-scope package drift:
| Package / command | Error summary | Why not blocking this run | Owner / next |
|-------------------|---------------|---------------------------|--------------|
| N/A | none | no package proof run | N/A |

Out-of-scope matches discovered:
| Pattern / API | Outside-scope owners | Why not patched now | Next package / owner |
|---------------|----------------------|---------------------|----------------------|
| N/A | none | workflow-only repair | N/A |

Changed list:
| Group | Current-run changes |
|-------|---------------------|
| code/runtime/API | none |
| tests/proof | none |
| docs/templates/skills | patched `plate-next` rule/template and regenerated generated skill |
| reverted/quarantined packets | none |

Needs your attention:
| Rank | Item | Why | Anchor | Recommendation |
|------|------|-----|--------|----------------|
| 1 | none | rule now matches your correction | N/A | continue package-by-package |

Findings:
- The previous `plate-next` wording had a package review section, but the
  correction/source-audit language still pushed toward broad Core/repo sweeps.

Decisions and tradeoffs:
- Broad audits are allowed as risk discovery, but broad patching is not allowed
  in package mode.
- Package hard cuts land package-by-package unless you explicitly broaden
  scope.

Error attempts:
| Error / failed attempt | Count | Next different move | Resolution |
|------------------------|-------|---------------------|------------|
| Previous run updated docs/broader surfaces from named API hard cut | 1 | repair `plate-next` scope wall | fixed in rule/template/generated skill |

Verification evidence:
- `pnpm install && pnpm prepare` passed.
- Source/template/generated skill audit found the new package-scope wall.
- Stale broad-sweep wording audit returned no old `related Core sweep` rule in
  source/template/generated skill.
- `node .agents/skills/autogoal/scripts/check-complete.mjs docs/plans/2026-07-08-plate-next-package-scope-repair.md` passed.

Final handoff contract:
- target surface and mode: workflow repair for `plate-next` package scope.
- files/APIs reviewed: `.agents/rules/plate-next.mdc`,
  `docs/plans/templates/plate-next.md`,
  `.agents/skills/plate-next/SKILL.md`.
- broad Core drift score coverage: N/A.
- package file checklist coverage: N/A.
- best Plate v2 recommendation: package review mode stays package-by-package.
- verdict matrix summary: rule/template/generated mirror score 100.
- Plite/Plate gaps or blockers: none.
- related scoped sweep query/active scope/matches/patched/deferred: audits listed above.
- out-of-scope matches discovered: none in this repair.
- changes made: rule/template/generated skill scope repair.
- tests/proof commands: sync and audits listed above.
- old compatibility names audited: N/A.
- needs attention: none.
- next best Plate Next packet: resume the current package, not global cleanup.

Reboot status:
| Question | Answer |
|----------|--------|
| Where am I? | Final verification |
| Where am I going? | Close the package-scope repair |
| What is the goal? | `plate-next` package mode must not update all |
| What have I learned? | The source/template needed a hard scope wall |
| What have I done? | Patched source/template and regenerated skill |

Timeline:
- 2026-07-08T12:39:11.628Z Goal plan created.
- 2026-07-08 Patched package-scope law into source rule and template.
- 2026-07-08 Ran `pnpm install && pnpm prepare`.

Open risks:
- None.
