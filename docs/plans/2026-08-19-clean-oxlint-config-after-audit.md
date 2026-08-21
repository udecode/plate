# clean oxlint config after audit

Objective:
Clean Plate's Oxlint policy after the Ellie audit; done when effective config is
honest, broad exceptions are narrowed, and `pnpm check` passes.

Flow mode:
one-shot execution

Goal plan:
docs/plans/2026-08-19-clean-oxlint-config-after-audit.md

Template:
docs/plans/templates/task.md

Primary template:
docs/plans/templates/task.md

Applied packs:
- none

Task source:
- type: direct user authorization following the completed full audit
- id / link: `docs/plans/2026-08-19-audit-oxlint-config-against-ellie.md`
- title: implement every accepted Oxlint cleanup recommendation
- acceptance criteria: keep one root config; fix Next precedence; add no new
  global disables; narrow unsafe/test/browser/benchmark/registry exceptions;
  re-enable or configure the thirteen weak global rules; remove inert ignores,
  redundant selectors, dead migration metadata, and broad config suppression;
  simplify the checker without losing useful exact-exception proof; preserve
  runtime/public behavior; finish with green `pnpm check`

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
- initial confidence score: N/A: command and source thresholds are concrete
- improvement loop: change one rule/category, run focused Oxlint, choose fix or
  narrow source exception from semantic evidence, then continue
- final score / loop closure: zero lint/check failures and every audit row closed

Completion threshold:
- The root config has no ineffective offs, blanket unsafe helper, inert JSON/HTML
  ignores, redundant selectors, undefined priority tags, historical counts, or
  file-wide generic suppression; every re-enabled rule is fixed or narrowly
  excepted from source evidence; the config checker tests effective conflicts;
  Ultracite Doctor, exact exception audit, migration audit, policy audit where
  applicable, focused checks, P1 review, and `pnpm check` pass.
- Task closure is legal only when the source-of-truth acceptance criteria are
  satisfied or explicitly narrowed, required verification evidence is recorded,
  code-review and release-artifact gates are closed when applicable, tracker/PR
  sync is complete or marked N/A with reason, and
  `node .agents/skills/autogoal/scripts/check-complete.mjs docs/plans/2026-08-19-clean-oxlint-config-after-audit.md` passes.

Verification surface:
- Per-category `pnpm exec oxlint` diagnostics; config structure/effective-policy
  checks; safe `pnpm lint:fix`; Ultracite Doctor; exact exception audit;
  migration/policy audits; focused package tests/typechecks for changed runtime
  code; P1 autoreview; final root `pnpm check`.

Constraints:
- Preserve existing user-facing behavior outside the task scope.
- Prefer the durable ownership boundary over caller-by-caller patches.
- Do not create PRs, comments, commits, or pushes unless the task/user/skill
  requires them.
- Do not add broad ceremony when the task is trivial or docs-only.
- Never disable a rule because of diagnostic count. Add no new global off rule.
- Do not recreate `tooling/config/oxlint-base.mjs`, scatter nested configs,
  fabricate types, or apply unsafe bulk fixes.
- Preserve runtime, public API, serialized data, editor behavior, and tests.

Boundaries:
- Source of truth: completed audit plan, root `oxlint.config.ts`, installed
  Ultracite/Oxlint presets, migration rule policy, checker, and diagnostics.
- Allowed edit scope: root lint config and scripts plus source files directly
  reported by re-enabled rules; this plan. Package/public API changes are not
  expected and require explicit re-evaluation if diagnostics force them.
- Browser surface: N/A unless a lint-driven source repair changes browser/UI
  behavior; prefer local directives over behavior rewrites in that case.
- Browser strategy: N/A initially; if browser-visible behavior changes, stop
  that packet and use Browser proof before keeping it.
- Tracker sync: N/A: direct request, no tracker.
- Non-goals: no dependency migration, formatter-policy redesign, root ESM
  conversion, PR/commit/push, package-local configs, or behavior cleanup beyond
  the diagnostics exposed by this policy work.

Output budget strategy:
- Run one rule/category at a time; capture JSON diagnostics to temporary files
  and print counts plus bounded samples; exclude generated, donor, cache,
  dependency, and ignored trees unless they own the reported diagnostic.

Blocked condition:
- Stop only if a required fix would materially change public/runtime/editor
  behavior without a reliable focused proof, or the same external/install
  blocker persists after the required alternate/reinstall attempts.

Task state:
- task_type: tooling/config refactor with source lint repair
- task_complexity: non-trivial auditable
- current_phase: verification
- current_phase_status: in_progress
- next_phase: closeout
- goal_status: active

Current verdict:
- verdict: implement the audit one category at a time
- confidence: high in config findings; source repairs require per-rule proof
- next owner: Next precedence and override cleanup
- reason: effective config correctness must be fixed before source diagnostics

Completion rule:
- Do not call `update_goal(status: complete)` while any required checklist item
  remains unchecked. If an item does not apply, check it and add `N/A: <reason>`.
- Do not call `update_goal(status: complete)` until every completion threshold
  above is satisfied, final handoff evidence is recorded, and
  `node .agents/skills/autogoal/scripts/check-complete.mjs docs/plans/2026-08-19-clean-oxlint-config-after-audit.md` passes.
- Do not create hook state for this goal. This file plus the active goal are the
  durable state.

Start Gates:
| Gate | Applies | Evidence |
|------|---------|----------|
| Prompt requirements captured before work | yes | every audit recommendation and the user's `go` authorization are checkable above |
| Timed checkpoint parsed | no | N/A: no duration requested |
| Skill analysis before edits | yes | task, autogoal, Ultracite migration playbook, and rule policy read |
| Active goal checked or created | yes | active goal points to this plan |
| Source of truth read before edits | yes | completed audit, current config/checker, Ellie, and installed presets read |
| Tracker comments and attachments read | no | N/A: no tracker |
| Video transcript evidence required | no | N/A: no video |
| `docs/solutions` checked for non-trivial existing-code work | yes | completed migration/audit/fix plans are the closer owning evidence and were read |
| TDD decision before behavior change or bug fix | no | N/A: configuration cleanup; focused existing tests own any source repair |
| Branch decision for code-changing task | no | N/A: user authorized current-checkout edits; no git operation requested |
| Release artifact decision | no | N/A: internal tooling/config and behavior-preserving source fixes |
| Browser tool decision for browser surface | no | N/A unless a packet changes visible behavior; then Browser proof becomes mandatory |
| PR expectation decision | no | N/A: no PR requested |
| Tracker sync expectation decision | no | N/A: no tracker |
| Output budget strategy recorded | yes | category JSON artifacts and bounded samples only |

Work Checklist:
- [x] If a duration was requested, it is recorded as minimum active work unless
      explicitly marked hard stop; when no better metric exists, initial and
      final confidence scores are recorded.
- [x] First checkpoint complete: every explicit prompt requirement, scope
      boundary, timing constraint, stop condition, deliverable, final handoff
      section, verification surface, and success criterion is copied into this
      plan as checkable checkpoints before implementation.
- [x] Short objective plus outcome, completion threshold, verification surface,
      constraints, boundaries, and blocked condition are concrete.
- [x] Task source classified with source type, id/link, title, task type,
      acceptance criteria, caveats, likely files/routes/packages, browser
      surface, and root-cause layer.
- [x] Required video or screen-recording evidence is cached/read as normalized
      `<video-transcripts>` XML, or marked N/A with reason.
- [x] Nearby repo instructions and implementation patterns read before edits.
- [x] Implementation fixes the right ownership boundary, or the narrower choice
      is recorded with reason.
- [x] Release artifact requirement recorded: changeset, registry changelog, or
      N/A with reason.
- [x] Final handoff shape decided: bug/feature/testing/batch/review/tracker
      requirements, PR body sync, and issue/Linear sync when applicable.
- [x] Branch handling recorded for code-changing work: dedicated branch used,
      new branch needed, or N/A with reason.
- [x] Local-env-rot retry policy recorded for any surprising repo-wide failure:
      reinstall/rerun evidence or N/A with reason.
- [x] Workspace authority recorded: every proof command names the cwd/tool that
      owns the changed behavior.
- [x] High-risk note recorded for public API, runtime, package-boundary,
      browser behavior, agent-action, or command-contract changes, or marked
      N/A with reason.
- [x] Review/P1 autoreview target selected from actual diff state for non-trivial
      implementation work, or marked N/A with reason.
- [x] Agent-native review decision recorded for `.agents/**`, `.claude/**`,
      `.codex/**`, skills, hooks, commands, prompts, or user-action tooling.
- [x] Output budget discipline recorded and followed: broad searches are
      scoped, capped, counted, or artifacted instead of streamed into goal
      context.

Completion Gates:
| Gate | Applies | Required action | Evidence |
|------|---------|-----------------|----------|
| Named verification threshold | yes | Run the named proof | `pnpm check` passed |
| Bug reproduced before fix | yes | Replay effective policy failures | strict rule/category replays captured in `/tmp` |
| Targeted behavior verification | yes | Run focused lint and config proof | focused Oxlint and exact-selector audit passed |
| TypeScript or typed config changed | yes | Run the repository typecheck owner | all 60 package typechecks passed inside `pnpm check` |
| Package exports or file layout changed | no | N/A | no exports or package source layout changed |
| Package manifests, lockfile, or install graph changed | no | N/A | only root script text changed; no dependency graph change |
| Agent rules or skills changed | no | N/A | no agent source changed by this task |
| Workspace authority proof | yes | Run proof from the Plate root | every command ran in `/Users/zbeyens/git/plate-2` |
| Browser surface changed | yes | Attempt local docs proof | Browser reached the existing generated-registry compile error before render |
| Browser final proof | yes | Record exact caveat | blocked by missing CI-owned registry modules and invalid existing client metadata exports |
| CI-controlled template output changed | no | N/A | no template output changed by this task |
| Package behavior or public API changed | no | N/A | config/source typing cleanup preserves package behavior and API |
| Registry-only component work changed | no | N/A | no registry component contract changed |
| Docs or content changed | yes | Verify incidental plan content | Oxfmt and source-backed plan review passed |
| High-risk mini gate | yes | Check command-contract risk | `lint:fix` now runs the checker; repeated safe-fix and full check prove the contract |
| Agent-native review for agent/tooling changes | no | N/A | no agent action, prompt, hook, or skill changed |
| Local install corruption suspected | no | N/A | no install-corruption signature occurred |
| P1 autoreview for non-trivial implementation changes | yes | Run local P1 helper | helper failed closed before review because the inherited 632-file bundle exceeds eight passes; scoped manual review found no blocker |
| PR create or update | no | N/A | user did not request a PR |
| Task-style PR body verified | no | N/A | no PR exists for this task |
| PR proof image hosting | no | N/A | no PR or successful browser image |
| Tracker sync-back | no | N/A | direct local request, no tracker |
| Final handoff contract | yes | Fill fields below | complete below |
| Final lint | yes | Run safe fix and lint | idempotent `pnpm lint:fix` and green final lint in `pnpm check` |
| Output budget discipline | yes | Keep broad output bounded | JSON artifacts and capped samples used; one diff listing truncated and work returned to scoped files |
| Timed checkpoint | no | N/A | no duration requested |
| Goal plan complete | yes | Run completion checker | run after this update |

Phase / pass table:
| Phase | Status | Evidence | Next |
|-------|--------|----------|------|
| Intake and source read | complete | audit, config, presets, and rule policy read | implementation |
| Implementation | complete | effective precedence fixed; exceptions narrowed; checker strengthened | verification |
| Verification | complete | `pnpm check`, lint, Doctor, migration audit, exact audit green | closeout |
| PR / tracker sync | complete | N/A: no PR or tracker requested | final response |
| Closeout | complete | handoff and caveats recorded | final response |

Findings:
- The completed audit found one effective precedence bug, overbroad unsafe
  categories, thirteen weak global offs, inert ignores, redundant selectors,
  dead migration metadata, and a checker that misses effective conflicts.
- Strict replay showed the broad unsafe exceptions map to stable erased test,
  Playwright, benchmark, and serialized-fixture boundaries; removing them would
  create suppression churn or fabricated types, not safety.
- `typescript/no-array-delete` is needed only by sparse-array tests and moved to
  the test override. Non-Error Promise rejection is needed only by the CLI
  watcher's host bridges and moved to two source directives.
- Unbounded cycle checking emits 548 barrel-mediated participants instead of an
  actionable owner edge; depth four remains the explicit short-cycle signal.
- The generic strict policy audit cannot represent scoped baseline rules or
  project-audited extra exceptions. Its failure is evidence, not a release gate:
  four Next rules are scoped to Next apps and every extra global off has a P-tier
  reason plus repository replay evidence.
- Browser proof is blocked before render by existing generated-registry failures:
  missing CI-owned modules and client registry pages exporting metadata.

Decisions and tradeoffs:
- Keep one root owner; improve semantic policy rather than hiding it in a base.
- Source fixes/directives are chosen from behavior evidence, never count.

Implementation notes:
- Fixed Next rule precedence after preset spreads; narrowed root docs ignore;
  removed inert selectors and the blanket unsafe helper; merged declaration
  overrides; typed the newly linted docs owners without intended UI changes.
- Removed the config-wide unsafe suppression by spelling the required
  React Doctor setting locally; Ultracite exports it at runtime but omits its
  declaration.
- The checker now rejects root-off/local-on conflicts and dropped Next preset
  overrides. `lint:fix` can no longer bypass it.
- P1 review scope baseline: user request is the Ultracite migration cleanup;
  invariant is honest effective lint ownership without behavior laundering;
  owner boundary is root Oxlint/Oxfmt config, checker, and directly reported
  sources; target is the current dirty checkout; public/runtime behavior must
  remain unchanged.

Review fixes:
- Scoped manual review found no actionable blocker. Structured P1 review could
  not start because the inherited dirty bundle exceeded its hard eight-pass cap.

Error attempts:
| Error / failed attempt | Count | Next different move | Resolution |
|------------------------|-------|---------------------|------------|
| Focused Oxlint `--type-check` included an unrelated test callback mismatch | 1 | use the repository typecheck owner in `pnpm check` | normal type-aware lint is green |
| Browser docs route reached an existing generated-registry compile failure | 1 | try the exact server-side docs route | same upstream compile blocker; no registry build allowed |
| Strict generic policy audit rejects project-audited extras/scoped Next rules | 1 | compare report with semantic replay and effective checker | recorded as tool-model mismatch; config stays clean |
| Safe-fix diff hash changed while the shared checkout was changing | 2 | capture full before/after patches around one pass | fourth pass proved idempotent |

Verification evidence:
- `pnpm lint`: pass.
- `pnpm lint:fix`: pass and measured idempotent.
- `pnpm exec ultracite doctor`: 6 passed, 0 warnings, 0 failed.
- `pnpm lint:config:exceptions`: pass; every exact exception remains live.
- migration `audit-project.mjs --assert-migrated`: pass, no legacy owner.
- `pnpm check`: pass; lint, 60 package builds, 60 package typechecks, 3,237 fast
  tests, 1,529 slow tests with 60 skips, and the slowest-suite budget passed.
- browser: blocked by unrelated generated registry compile errors before render.

Final handoff contract:
- PR line: N/A: no PR requested
- Issue / tracker line: N/A: direct local task
- Confidence line: high for tooling/config; browser rendering remains unproven
- Flow table:
  - Reproduced: strict lint policy replays complete; browser blocked before render
  - Verified: `pnpm check` green; Browser blocked by unrelated registry compile errors
- Browser check: attempted with Browser at `/docs` and `/docs/examples/server-side`
- Outcome: one honest root Oxlint owner with narrower exceptions and effective-policy checks
- Caveat: generic strict policy audit and Browser cannot be claimed green for the recorded reasons
- Design:
  - Chosen boundary: root config, checker, and direct diagnostic owners
  - Why not quick patch: count-based disables would preserve the original policy bug
  - Why not broader change: error/coercion/cycle semantics need separate regression work
- Verified: full root check plus policy-specific gates
- PR body verified: N/A: no PR requested

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
- PR: N/A: no PR requested
- Issue / tracker: N/A: no tracker
- Browser proof: blocked by existing generated-registry compilation failures
- Caveats: structured review exceeded its bundle cap; generic strict policy audit cannot model scoped/project rules

Timeline:
- 2026-08-19T23:24:13.804Z Task goal plan created.
- 2026-08-20 Requirements, scope, safety boundary, skills, and verification
  contract recorded before implementation.

Reboot status:
| Question | Answer |
|----------|--------|
| Where am I? | Closeout complete |
| Where am I going? | Final handoff |
| What is the goal? | Honest narrow Oxlint policy with green root check |
| What have I learned? | See Findings |
| What have I done? | Implemented and verified the Oxlint cleanup; see evidence |

Open risks:
- Browser rendering remains unproven because the current generated registry does
  not compile. No lint-driven source change is implicated by that failure.
