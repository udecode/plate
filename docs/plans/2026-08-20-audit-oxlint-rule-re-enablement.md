# Audit Oxlint rule re-enablement

Objective:
Normalize broad Oxlint patterns and rank global rules for re-enablement; done when forbidden patterns are gone, every off rule is scored, and checks pass.

Flow mode:
one-shot execution

Goal plan:
docs/plans/2026-08-20-audit-oxlint-rule-re-enablement.md

Template:
docs/plans/templates/task.md

Primary template:
docs/plans/templates/task.md

Applied packs:
- none

Task source:
- type: direct user prompt
- id / link: N/A: no tracker
- title: Remove narrow config patterns and rank rules to re-enable
- acceptance criteria:
  - Replace `**/*.config.{cts,mts,ts,tsx}` with a wider honest structural owner
    or prove a repository-wide global policy; do not retain that selector by
    inertia.
  - Fold `**/playwright/**` into the shared all-test policy instead of a
    separate override.
  - Remove the `**/doc-page.tsx` filename-specific override; filename-shaped
    config exemptions are forbidden.
  - Audit every globally disabled rule and rank re-enable candidates by an
    explicit importance score.
  - Diagnostic count and stylistic preference may inform effort, but neither
    may be the sole reason to keep a rule disabled or re-enable it.
  - Report score factors, current diagnostic count, representative semantic
    risk, recommendation, and verification.

First checkpoint:
- Before implementation or broad exploration, copy every explicit prompt
  requirement into this plan as checkable checkpoints: scope, non-goals,
  timing/duration, stop conditions, deliverables, final handoff sections,
  verification surface, and success criteria.
- Do not continue into implementation until this extraction is complete or
  explicitly marked N/A with reason.

Timed checkpoint:
- requested duration: N/A: none requested
- semantics: N/A
- initial confidence score: N/A: exact source/command thresholds exist
- improvement loop: inspect config ownership, measure candidate rules, score,
  normalize patterns, lint, review, and close full CI
- final score / loop closure: N/A

Completion threshold:
- `oxlint.config.ts` contains none of the three rejected selectors and no exact
  file/app/package disable owner.
- Playwright sources inherit the one shared test policy.
- Configuration/tool adapter exceptions have one wider honest owner or are
  removed; production unsafe-value rules remain strict.
- A durable artifact scores every global `off` rule and sorts candidates by
  importance using correctness/security value, false-positive risk, semantic
  rewrite risk, ownership duplication, and repair cost/count.
- Re-enable candidates are recommendations only in this turn; no global rule
  is enabled without source-backed representative diagnostics and a user go.
- `pnpm lint:fix`, structural audits, and `pnpm check` pass. P1 autoreview is
  run within its three-invocation cap, every accepted finding is fixed, and any
  missing clean rerun is reported rather than implied.
- Task closure is legal only when the source-of-truth acceptance criteria are
  satisfied or explicitly narrowed, required verification evidence is recorded,
  code-review and release-artifact gates are closed when applicable, tracker/PR
  sync is complete or marked N/A with reason, and
  `node .agents/skills/autogoal/scripts/check-complete.mjs docs/plans/2026-08-20-audit-oxlint-rule-re-enablement.md` passes.

Verification surface:
- Bounded source audit of all config overrides and global `off` rules.
- Per-candidate Oxlint diagnostics with counts and representative source reads.
- Ranked artifact under
  `docs/plans/artifacts/2026-08-20-audit-oxlint-rule-re-enablement/`.
- `pnpm lint:fix`, `node tooling/scripts/check-oxlint-config.mjs`, Ultracite
  migration audits, P1 autoreview, and `pnpm check` from the repository root.

Constraints:
- Preserve existing user-facing behavior outside the task scope.
- Prefer the durable ownership boundary over caller-by-caller patches.
- Do not create PRs, comments, commits, or pushes unless the task/user/skill
  requires them.
- Do not add broad ceremony when the task is trivial or docs-only.

Boundaries:
- Source of truth: user prompt, `oxlint.config.ts`, project checker, installed
  Ultracite/Oxlint presets, canonical rule policy, and current diagnostics.
- Allowed edit scope: lint config/checker, suppression-only fixes forced by
  ownership normalization, ranked audit artifact, and this plan.
- Browser surface: N/A: lint/config policy only.
- Browser strategy: N/A. Use Browser for normal app QA; use Chrome directly
  for native downloads, print/print-preview, file picker/uploads, clipboard,
  browser dialogs/permissions, extension/profile state, or exact Chrome
  rendering; use Computer Use only for native Chrome/OS UI that needs visual
  inspection after Chrome automation cannot read it.
- Tracker sync: N/A: no tracker.
- Non-goals: no exact-file/per-owner override, no rule decision based only on
  count or style, no unsafe bulk fixer, no production behavior/API change, no
  PR/commit/push, and no speculative re-enablement before the ranked report.

Output budget strategy:
- Parse config programmatically; collect counts before diagnostics; cap console
  slices; store the full scored table in the plan artifact; exclude generated,
  dependency, build, and ignored donor trees.

Blocked condition:
- Stop only if Oxlint cannot evaluate a candidate/config boundary after three
  distinct command shapes, or if a rule's best ownership requires a product
  contract decision outside lint policy.

Task state:
- task_type: tooling policy audit and bounded refactor
- task_complexity: non-trivial
- current_phase: closeout
- current_phase_status: completed
- next_phase: final response
- goal_status: ready for completion

Current verdict:
- verdict: valid
- confidence: high
- next owner: task
- reason: the three selectors fragment semantic ownership, and the current
  global-off surface needs a value-first re-enable audit.

Completion rule:
- Do not call `update_goal(status: complete)` while any required checklist item
  remains unchecked. If an item does not apply, check it and add `N/A: <reason>`.
- Do not call `update_goal(status: complete)` until every completion threshold
  above is satisfied, final handoff evidence is recorded, and
  `node .agents/skills/autogoal/scripts/check-complete.mjs docs/plans/2026-08-20-audit-oxlint-rule-re-enablement.md` passes.
- Do not create hook state for this goal. This file plus the active goal are the
  durable state.

Start Gates:
| Gate | Applies | Evidence |
|------|---------|----------|
| Prompt requirements captured before work | yes | All six acceptance rows above copy the requested pattern changes, score ordering, and decision constraints. |
| Timed checkpoint parsed | no | N/A: no duration requested. |
| Skill analysis before edits | yes | Fully read `task`, `autogoal`, `migrate-to-ultracite`, the migration playbook, and all 1,214 lines of canonical rule policy. |
| Active goal checked or created | yes | Prior goal was complete; a new active goal names this plan and threshold. |
| Source of truth read before edits | yes | User prompt, current/previous plans, migration policy, and canonical rule catalog read. |
| Tracker comments and attachments read | no | N/A: direct prompt. |
| Video transcript evidence required | no | N/A: no video. |
| `docs/solutions` checked for non-trivial existing-code work | yes | Only an old Biome template solution matched; current migration plans are the relevant history. |
| TDD decision before behavior change or bug fix | no | N/A: lint-policy audit/refactor; diagnostic and command proofs own behavior. |
| Branch decision for code-changing task | yes | Continue in the shared checkout; no branch requested. |
| Release artifact decision | no | N/A: no published API or package behavior change. |
| Browser tool decision for browser surface | no | N/A: no rendered surface. |
| PR expectation decision | no | N/A: no PR requested. |
| Tracker sync expectation decision | no | N/A: no tracker. |
| Output budget strategy recorded | yes | Programmatic counts first, bounded representative slices, full ranking in an artifact. |

Work Checklist:
- [x] No duration was requested; timed semantics are N/A.
- [x] First checkpoint complete: every explicit prompt requirement, scope
      boundary, stop condition, deliverable, verification surface, and success
      criterion is copied above before implementation.
- [x] Short objective, completion threshold, verification surface, constraints,
      boundaries, and blocked condition are concrete.
- [x] Task source is classified as a direct, non-trivial tooling-policy audit
      with no browser/tracker/public API surface.
- [x] Video evidence is N/A because none was supplied.
- [x] Governing repo instructions, prior plans, config policy, and canonical
      rule catalog were read before editing.
- [x] Implementation fixes the right ownership boundary: config/setup adapters
      share one non-production policy, Playwright shares the test policy, and
      the unique Shadcn metadata boundary carries a local file-header reason.
- [x] Release artifact is N/A because no published package behavior changes.
- [x] Final handoff is a ranked audit plus implemented selector normalization,
      verification, remaining risk, and explicit no-re-enable-yet boundary.
- [x] Work stays in the shared checkout; no branch/commit/PR was requested.
- [x] Local-env-rot retry policy is N/A: no install-corruption or mixed-runtime
      failure occurred.
- [x] Workspace authority recorded: every proof command ran from
      `/Users/zbeyens/git/plate-2`.
- [x] High-risk note: a bad global re-enable can force semantic rewrites; a bad
      global disable hides correctness. Scoring penalizes both failure modes.
- [x] P1 autoreview ran within the three-invocation cap. Its two verified P1
      findings were fixed and directly checked; the final helper rerun did not
      execute because it targeted the wrong checkout and the cap was exhausted.
- [x] Agent-native review is N/A because no agent rules, skills, hooks, prompts,
      or user-action tooling are in scope.
- [x] Output was bounded after two accidental oversized streams: the all-rule
      audit and final CI output were recovered through counts, artifacts, and
      session polling.

Completion Gates:
| Gate | Applies | Required action | Evidence |
|------|---------|-----------------|----------|
| Named verification threshold | yes | Run the command, proof, source audit, or artifact check named in this plan | `pnpm check` exited 0; structural, migration, and ranking audits are recorded below. |
| Bug reproduced before fix | no | Record failing test/repro or N/A with reason | N/A: policy refactor, not a behavior bug; isolated configs reproduced the selector-owned diagnostics. |
| Targeted behavior verification | yes | Run focused test/proof for changed behavior or record N/A | Checker passed with filename-selector regression cases, and focused Oxlint passed on every edited source. |
| TypeScript or typed config changed | yes | Run relevant typecheck | Root `pnpm check` completed package builds and typechecks with exit 0. |
| Package exports or file layout changed | no | Run `pnpm brl` before final verification and keep generated barrel updates | N/A: no exported file or layout changed. |
| Package manifests, lockfile, or install graph changed | no | Run `pnpm install` and relevant package checks | N/A: no manifest, lockfile, or install-graph edit. |
| Agent rules or skills changed | no | Run `pnpm install` and verify generated skill sync | N/A: no agent source changed. |
| Workspace authority proof | yes | Run verification in the owning repo/package/app/route/tool and record cwd; do not count the wrong workspace as proof | All final commands ran at `/Users/zbeyens/git/plate-2`; the wrong-checkout review attempt is excluded. |
| Browser surface changed | no | Capture Browser proof for normal app surfaces, or Chrome/Computer proof for native browser/OS surfaces | N/A: the app-source edit is a lint comment only and changes no rendered output. |
| Browser final proof | no | Attach Browser/Chrome/Computer proof or exact caveat when browser proof applies | N/A: no runtime or visual change. |
| CI-controlled template output changed | no | Restore generated template output or record why it is intentionally kept | N/A: no template output changed. |
| Package behavior or public API changed | no | Add a changeset or record why no changeset applies | N/A: lint ownership only; no package behavior or public API. |
| Registry-only component work changed | no | Update `docs/components/changelog.mdx` or record N/A | N/A: no registry component behavior changed. |
| Docs or content changed | yes | For docs-heavy work, use `--template docs`; for incidental docs, verify source-backed claims, links, examples, and rendered output or record N/A | The audit artifact is source-derived incidental documentation; its 183 rows and formulas were programmatically checked. |
| High-risk mini gate | yes | Record the realistic failure mode and proof for a command-contract change | Risk was hidden production diagnostics from an overbroad override; isolated scans proved configs, tests, and one local metadata boundary require different owners. |
| Agent-native review for agent/tooling changes | no | Review agent-action tooling or record N/A | N/A: no agent-action tooling or agent source changed. |
| Local install corruption suspected | no | Reinstall once and rerun, or record N/A | N/A: no corruption signal occurred. |
| P1 autoreview for non-trivial implementation changes | yes | Run P1 local review, fix accepted findings, and respect the three-invocation cap | Review found a filename-selector bypass and irreproducible score rows. Both were fixed and directly verified. The final helper rerun targeted the wrong checkout, so no clean attestation is claimed after the cap. |
| PR create or update | no | Run `check` before PR work and sync the body | N/A: no PR requested. |
| Task-style PR body verified | no | Verify the PR body with `gh pr view --json body` | N/A: no PR exists or was requested. |
| PR proof image hosting | no | Host browser proof when needed | N/A: no PR or browser image. |
| Tracker sync-back | no | Post issue or Linear sync | N/A: direct local task with no tracker. |
| Final handoff contract | yes | Fill the final handoff fields below | Filled below with exact outcome, caveat, design, and verification. |
| Final lint | yes | Run `pnpm lint:fix` or scoped equivalent | `pnpm lint:fix` exited 0; root `pnpm check` repeated lint successfully. |
| Output budget discipline | yes | Verify bounded output or record recovery | Two oversized outputs are recorded below; subsequent commands used capped output and session polling. |
| Timed checkpoint | no | Continue until elapsed when requested; otherwise N/A | N/A: no duration requested. |
| Goal plan complete | yes | Run the autogoal completion checker | Exit 0: `[autogoal] complete` for this plan. |

Phase / pass table:
| Phase | Status | Evidence | Next |
|-------|--------|----------|------|
| Intake and source read | completed | Prompt, config, checker, Ultracite policy, Ellie config, and skill owners read. | implementation |
| Implementation | completed | Three selector owners normalized; checker hardened; local metadata boundary documented. | verification |
| Verification | completed | Structural, focused, migration, ranking, review, and full CI evidence recorded. | closeout |
| PR / tracker sync | not_applicable | No PR, commit, push, or tracker mutation requested. | closeout |
| Closeout | completed | Ranked artifact and truthful review caveat ready for final response. | final response |

Findings:
- The typed-config selector covered 126 diagnostics but mixed real production
  strictness with adapter/config inputs. The honest owner is the broad
  non-production config/setup pattern, not a global unsafe-rule disable.
- Playwright had 281 diagnostics across 41 files, dominated by cross-realm
  unsafe access. It is test code and belongs to the one shared test policy.
- `doc-page.tsx` had 34 unsafe diagnostics at an intentionally extensible
  Shadcn metadata boundary. Its exception is unique and belongs in an explained
  file-header directive, not filename-shaped central config.
- There are 183 globally disabled rules. A forced audit found 58,308 findings
  across 3,548 files; the ranking gives repair volume at most 5/100 points.
- The six strongest next candidates score 88, 86, 82, 80, 78, and 76. Three
  have zero current findings but high future correctness value.

Decisions and tradeoffs:
- Keep production unsafe-value rules strict. Broadly disabling them would hide
  genuine failures to accommodate configs, tests, and one extensible boundary.
- Ban filename-specific config selectors. Unique boundaries use local comments;
  recurring semantic categories use shared config patterns.
- Recommend rule re-enablement without applying it in this turn. Each candidate
  needs a focused repair batch and representative source review.
- Treat the strict canonical-policy comparator as evidence, not a green gate:
  Plate intentionally scopes four Next rules and carries documented local
  policy differences.

Implementation notes:
- Added `**/*.{config,setup}.{cts,mts,ts,tsx}` to the existing broad
  non-production/tooling override and deleted the narrower config override.
- Added `**/playwright/**` to the shared test selector list and checker, then
  deleted the standalone Playwright override.
- Removed `**/doc-page.tsx` from config and added one explained file-header
  directive for four unsafe-value rules in the owning file.
- Hardened the checker against exact terminal filenames, including brace forms
  and nested wildcard paths.
- Wrote the full scored ranking under the plan artifact directory.

Review fixes:
- P1: `**/docs/doc-page.tsx` and `**/doc-page.{tsx}` bypassed the first
  filename-selector check. Fixed by examining the terminal segment after brace
  removal and added executable regression cases.
- P1: lower ranking rows were not independently reproducible. Added the exact
  formula, component mapping, scan provenance, candidate probes, and explicit
  top-20 components; programmatic recomputation reports zero failures.

Error attempts:
| Error / failed attempt | Count | Next different move | Resolution |
|------------------------|-------|---------------------|------------|
| CLI `-D` audit was masked by per-file override precedence | 1 | Evaluate through an isolated config without the rejected overrides | Produced exact config, Playwright, and doc-page diagnostics. |
| Candidate config under `.tmp` changed the ignore base and emitted 3,041 irrelevant findings | 1 | Place the temporary config at repository root | Reduced the probe to 12 exact candidate findings. |
| First review bundle encoded full files as additions and exceeded preflight scope | 1 | Build a tight synthetic before/after bundle | Actual P1 review ran and returned two valid findings. |
| Final review rerun launched from the real checkout instead of the synthetic checkout | 1 | Stop at the hard three-invocation cap and directly verify both fixes | No clean final autoreview attestation is claimed; no verified finding remains unresolved. |
| All-rule audit and one CI poll exceeded display output budget | 2 | Persist aggregate evidence and poll with capped chunks | Full ranking is durable; `pnpm check` completion and exit 0 were recovered. |
| Focused Oxfmt check matched no files because `docs/**` is intentionally ignored | 1 | Use the root lint result plus content-specific validators | Root lint is green; ranking and autogoal validators both pass. |

Verification evidence:
- Root: `/Users/zbeyens/git/plate-2` for every command below.
- `pnpm lint:fix`: exit 0.
- `node tooling/scripts/check-oxlint-config.mjs`: exit 0; 199 root rules and
  359 selector/rule pairs passed.
- Focused Oxlint on `oxlint.config.ts`, the checker, `doc-page.tsx`, and
  Playwright sources: exit 0.
- Ultracite migration audit with `--assert-migrated`: exit 0, no failures.
- `pnpm exec ultracite doctor`: 6 passed, 0 warnings, 0 failed.
- Strict canonical comparator: expected nonzero comparison result from four
  intentionally app-scoped Next rules, 12 conditional classifications, and 76
  documented Plate-only offs; it found no missing reasons, local config files,
  test directives, or unjustified test override.
- Global-off inventory versus ranking: 183 config rules, 183 artifact rows,
  zero missing, zero extra.
- Score recomputation: 183 rows, 20 manual rows, zero formula failures.
- `pnpm check`: exit 0. Lint/format, 60 package builds, package typechecks,
  3,242 main tests, 1,529 slow tests with 60 skips, and the slowest-test gate
  all completed with zero failures.

Final handoff contract:
- PR line: N/A: no PR requested or created.
- Issue / tracker line: N/A: direct local task.
- Confidence line: high; full CI is green and every ranking row is validated.
- Flow table:
  - Reproduced: rejected selector ownership measured with isolated Oxlint
    configs; browser N/A.
  - Verified: structural/focused audits and full `pnpm check` green; browser
    N/A.
- Browser check: N/A: lint comment/config changes have no runtime surface.
- Outcome: selector ownership is category-wide or local, filename-specific
  central overrides are rejected, and all 183 root-off rules have a value-first
  ranking.
- Caveat: no rule was re-enabled. The final autoreview helper rerun did not
  execute after a wrong-checkout invocation spent the cap; both prior P1
  findings are fixed and directly verified, but no clean attestation is claimed.
- Design:
  - Chosen boundary: shared semantic patterns for recurring non-production and
    test code; explained inline ownership for a unique metadata boundary.
  - Why not quick patch: more file-specific config would preserve fragmented
    ownership and invite package-by-package drift.
  - Why not broader change: global unsafe-rule disables would weaken production
    checks, while immediate rule re-enablement would mix audit with risky fixes.
- Verified: exact commands and results are listed above.
- PR body verified: N/A: no PR.

Task-style PR body contract:
- Preserve any existing `<!-- auto-release:start -->` block. If a changeset is
  part of the diff and repo policy expects auto release, include that block.
- Use the accepted kitcn PR #270 visual format. The body starts with an emoji
  issue/tracker/fix line, for example `🐛 Fixes #123` or `🐛 Fixes ➖ N/A`, then
  an emoji confidence line like `🟢 95-100% confidence`.
- Use this exact table header: `| Phase | 🧪 Tests | 🌐 Browser |`.
- Use `Reproduced` and `Verified` rows. Mark passing proof with `🟢`, repro or
  failing proof with `🔴`, and non-applicable cells with `➖ N/A`.
- Use bold emoji section headings: `**✅ Outcome**`, `**⚠️ Caveat**`,
  `**🏗️ Design**`, and `**🧪 Verified**`.
- Never include a line that links to the current PR itself. The current PR URL
  belongs in the final response, not in its own description.
- Do not replace this with a generic `Summary` / `Verification` PR body, an
  adaptive prose body from a git helper skill, plain `## Outcome` sections, or
  an unrelated generated badge footer unless the caller or repo template
  explicitly asks for it.
- Proof is `gh pr view --json body` output or a concise source-backed summary
  of that output.

Final handoff / sync:
- PR: N/A: not requested.
- Issue / tracker: N/A: none.
- Browser proof: N/A: no rendered behavior changed.
- Caveats: final P1 clean rerun unavailable after the invocation cap; no
  verified finding remains unresolved.

Timeline:
- 2026-08-20T15:04:34.616Z Task goal plan created.
- 2026-08-20 Selector ownership normalized and structural checker hardened.
- 2026-08-20 All 183 global-off rules scored; six next candidates and four
  targeted-audit candidates documented.
- 2026-08-20 P1 review returned two findings; both fixed and directly checked.
- 2026-08-20 `pnpm check` exited 0.
- 2026-08-20 Autogoal completion checker exited 0.

Reboot status:
| Question | Answer |
|----------|--------|
| Where am I? | Closeout complete; final response next. |
| Where am I going? | Return selector decisions, ranked recommendations, and caveats. |
| What is the goal? | Normalize broad Oxlint ownership and rank every global-off rule by importance. |
| What have I learned? | Category ownership matters more than diagnostic volume; six rules have strong next-batch value. |
| What have I done? | Normalized selectors, hardened enforcement, scored 183 rules, fixed review findings, and passed CI. |

Open risks:
- Re-enabling the recommended rules remains a separate repair phase. In
  particular, deprecated APIs and template expressions need source-by-source
  decisions; zero-finding guards are safe candidates but still require user go.
- The final review helper did not produce a clean post-fix attestation because
  the hard invocation cap was exhausted. Direct regression/formula checks and
  full CI cover both accepted findings.
