# Consolidate Oxlint suppressions

Objective:
Consolidate Oxlint suppressions by structural owner; ordinary tests have zero
inline/file directives, config has no exact-file overrides, remaining source
directives are truly local, and repository checks pass.

Goal plan:
docs/plans/2026-08-21-consolidate-oxlint-suppressions.md

Template:
docs/plans/templates/task.md

Primary template:
docs/plans/templates/task.md

Applied packs:

- none

Task source:

- type: direct user correction in the current Codex task
- id / link: N/A: no external tracker
- title: Consolidate Oxlint suppressions
- acceptance criteria: choose one clear ownership policy; move recurring valid
  test semantics to the single repository-wide test override; keep beneficial
  rules enabled and fix their test diagnostics; keep only genuinely local
  production directives; use no exact-file or package-specific config
  overrides; finish with zero ordinary-test directives and green lint/check.

First checkpoint:

- Before implementation or broad exploration, copy every explicit prompt
  requirement into this plan as checkable checkpoints: scope, non-goals,
  timing/duration, stop conditions, deliverables, final handoff sections,
  verification surface, and success criteria.
- Do not continue into implementation until this extraction is complete or
  explicitly marked N/A with reason.

Timed checkpoint:

- requested duration: N/A: no duration requested
- semantics: completion threshold, not a timed stop
- initial confidence score: 88%
- improvement loop: inventory -> classify by rule/path class -> consolidate ->
  remove stale directives -> verify
- final score / loop closure: 97%; all static, typed, test, policy, and review
  gates pass. Browser smoke was attempted and is blocked by unrelated missing
  CI-owned registry output.

Completion threshold:

- Zero `oxlint-disable*` directives in ordinary `*.test.*` and `*.spec.*`
  files; zero exact-file/package-specific config overrides; every remaining
  directive is an inline/bounded production invariant or justified whole-file
  structural boundary; `pnpm lint`, config audit, and `pnpm check` pass.
- Task closure is legal only when the source-of-truth acceptance criteria are
  satisfied or explicitly narrowed, required verification evidence is recorded,
  code-review and release-artifact gates are closed when applicable, tracker/PR
  sync is complete or marked N/A with reason, and
  `node .agents/skills/autogoal/scripts/check-complete.mjs docs/plans/2026-08-21-consolidate-oxlint-suppressions.md` passes.

Verification surface:

- Directive inventory grouped by rule and path class; source audit proving zero
  ordinary-test directives; Ultracite `audit-project --assert-migrated` and
  `check-config-policy`; `pnpm lint`; `pnpm check`; P1 autoreview of the
  config/directive cleanup.

Constraints:

- Preserve existing user-facing behavior outside the task scope.
- Prefer the durable ownership boundary over caller-by-caller patches.
- Do not disable correctness rules merely to remove comments; fix tests when a
  rule remains beneficial across tests.
- Do not introduce exact-file, package-specific, or named-file-list overrides.
- Config overrides represent structural path classes only; inline directives
  represent local production invariants only.
- Do not create PRs, comments, commits, or pushes unless the task/user/skill
  requires them.
- Do not add broad ceremony when the task is trivial or docs-only.

Boundaries:

- Source of truth: `oxlint.config.ts`, current `oxlint-disable*` directives,
  Ultracite migration rule policy, and current lint diagnostics.
- Allowed edit scope: `oxlint.config.ts` and files containing Oxlint disable
  directives or diagnostics caused by their removal. Never edit `templates/**`.
- Browser surface: shared React hooks and command-menu rendering received a
  browser-smoke attempt after code-level lint fixes.
- Browser strategy: use `/blocks/select-editor-demo`, then the docs route; both
  are blocked by the existing generated registry index referencing missing
  CI-owned files. Do not run the forbidden local registry build.
- Tracker sync: N/A: no issue or PR requested.
- Non-goals: globally disabling useful correctness rules; per-file config;
  package-by-package test policy; unrelated dirty-tree repairs; public API or
  runtime redesign.

Output budget strategy:

- Count and group directives before printing them. Save any machine-readable
  lint inventory under `/tmp`; inspect summaries and bounded slices. Exclude
  generated/build/vendor trees unless a match proves they are relevant.

Blocked condition:

- Block only if the same external/tooling failure prevents classification or
  verification for three consecutive goal turns after narrower audits and the
  documented reinstall retry are exhausted.

Task state:

- task_type: tooling/config policy cleanup
- task_complexity: normal: repository-wide inventory with narrow config/source edits
- current_phase: closeout
- current_phase_status: complete
- next_phase: final handoff
- goal_status: active

Current verdict:

- verdict: valid correction
- confidence: high
- next owner: task
- reason: repeated ordinary-test directives violate the selected Ultracite
  ownership model and make the policy unreadable.

Explicit requirements checklist:

- [x] Inventory every `oxlint-disable`, `oxlint-disable-next-line`, and bounded
      disable directive by rule, file, and structural path class.
- [x] Ordinary test/spec files contain zero Oxlint disable directives.
- [x] Recurring valid test semantics move once to the existing unified all-test
      override, with a concrete P0/P1 reason per rule.
- [x] Beneficial rules stay enabled in tests and violations are fixed instead
      of moved to config.
- [x] Production-local exceptions remain inline or bounded beside the actual
      invariant; generated/bootstrap whole-file boundaries may use a header.
- [x] Do not add exact-file, named-file-list, package-specific, `doc-page`,
      Playwright-only, or config-filename-only overrides.
- [x] Consider global disable only for a repository-wide negative-sum rule with
      the same evidence quality as the existing global-off policy; never for
      count or style alone.
- [x] Remove unused/stale directives and keep unused-directive reporting at
      error severity.
- [x] Finish with source audits, config structural audit, lint, `pnpm check`,
      and P1 review green for this scope.

Completion rule:

- Do not call `update_goal(status: complete)` while any required checklist item
  remains unchecked. If an item does not apply, check it and add `N/A: <reason>`.
- Do not call `update_goal(status: complete)` until every completion threshold
  above is satisfied, final handoff evidence is recorded, and
  `node .agents/skills/autogoal/scripts/check-complete.mjs docs/plans/2026-08-21-consolidate-oxlint-suppressions.md` passes.
- Do not create hook state for this goal. This file plus the active goal are the
  durable state.

Start Gates:
| Gate | Applies | Evidence |
|------|---------|----------|
| Prompt requirements captured before work | yes | Explicit requirements checklist records the user's ownership correction and exclusions. |
| Timed checkpoint parsed | N/A | No duration requested. |
| Skill analysis before edits | yes | Read `task`, `autogoal`, `migrate-to-ultracite`, migration playbook, and rule policy. |
| Active goal checked or created | yes | Prior goal is complete; this plan is the shell for the new corrected objective. |
| Source of truth read before edits | yes | Read the full migration policy and existing migration handoff; config/directive audit is the first execution phase. |
| Tracker comments and attachments read | N/A | No tracker source. |
| Video transcript evidence required | N/A | No video evidence. |
| `docs/solutions` checked for non-trivial existing-code work | N/A | The current config/directives and migration policy are the direct owners. |
| TDD decision before behavior change or bug fix | N/A | Policy cleanup should preserve behavior; lint and repository checks are the proof. |
| Branch decision for code-changing task | N/A | No branch, commit, or PR requested. |
| Release artifact decision | N/A | No package behavior or public API change intended. |
| Browser tool decision for browser surface | N/A | No browser surface. |
| PR expectation decision | N/A | No PR requested. |
| Tracker sync expectation decision | N/A | No tracker. |
| Output budget strategy recorded | yes | Count/group first and inspect bounded slices from temporary artifacts. |

Work Checklist:

- [x] If a duration was requested, it is recorded as minimum active work unless
      explicitly marked hard stop; when no better metric exists, initial and
      final confidence scores are recorded. N/A: no duration requested.
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
      N/A: no video evidence.
- [x] Nearby repo instructions and implementation patterns read before edits.
- [x] Implementation fixes the right ownership boundary, or the narrower choice
      is recorded with reason. Structural test/JS/tooling/fixture boundaries are
      in config; production-only exceptions are inline; actionable React hook
      diagnostics were fixed.
- [x] Release artifact requirement recorded: N/A. This changes lint policy and
      behavior-neutral internals, not a published package contract.
- [x] Final handoff shape decided: local tooling/config handoff with counts,
      decisions, verification, and browser caveat; no PR/tracker sync applies.
- [x] Branch handling recorded: N/A. No branch, commit, push, or PR requested.
- [x] Local-env-rot retry policy recorded: N/A. No install-corruption signal
      occurred; the browser failure is deterministic missing registry source.
- [x] Workspace authority recorded: all commands ran in
      `/Users/zbeyens/git/plate-2`; Browser targeted the local `www` server.
- [x] High-risk note recorded: hook lifecycle edits could recreate owners or
      stale callbacks; targeted typechecks, full tests, and P1 review cover that
      failure mode. No public API changed.
- [x] Review/P1 autoreview target selected from actual final config and affected
      hook/iframe files; cycle 2 returned zero actionable P0/P1 findings.
- [x] Agent-native review decision recorded: N/A. No agent-owned rules, skills,
      hooks, commands, prompts, or user-action tooling changed.
- [x] Output budget discipline recorded and followed: raw lint JSON and review
      artifacts stayed under `/tmp`; summaries were counted before inspection.

Completion Gates:
| Gate | Applies | Required action | Evidence |
|------|---------|-----------------|----------|
| Named verification threshold | complete | Run named audits and repository checks | All named static/type/test/review gates pass. |
| Bug reproduced before fix | N/A | Policy cleanup, not a behavior bug | Initial lint inventories supplied the red evidence. |
| Targeted behavior verification | complete | Verify affected hook owners | Seven-scope Turbo typecheck: 66/66 tasks. |
| TypeScript or typed config changed | complete | Run relevant typecheck | Targeted typecheck and full package typecheck pass. |
| Package exports or file layout changed | N/A | No barrel work | No exported file was added, removed, or moved. |
| Package manifests, lockfile, or install graph changed | N/A | No install work | No manifest or lockfile edit. |
| Agent rules or skills changed | N/A | No agent work | No agent-owned file changed. |
| Workspace authority proof | complete | Verify in owning checkout | All CLI proof ran from `/Users/zbeyens/git/plate-2`. |
| Browser surface changed | caveat | Attempt local Browser smoke | Both command-menu routes hit existing generated-registry compile errors. |
| Browser final proof | caveat | Record exact blocker | Missing CI-owned registry files; local registry generation is forbidden. |
| CI-controlled template output changed | complete | Keep templates untouched | `git diff --name-only -- templates` returned zero files. |
| Package behavior or public API changed | N/A | No release artifact | Behavior-neutral lifecycle expression; no public contract change. |
| Registry-only component work changed | N/A | No registry feature work | Only local iframe lint comments changed registry sources. |
| Docs or content changed | N/A | Goal plan only | No public docs/content changed. |
| High-risk mini gate | complete | Prove hook lifecycle safety | Typecheck, 4,772 broad tests, and P1 review pass. |
| Agent-native review for agent/tooling changes | N/A | No agent surface | Not applicable. |
| Local install corruption suspected | N/A | No reinstall | Failures did not match install corruption. |
| P1 autoreview for non-trivial implementation changes | complete | Run cycle 2 with P1 cap | Clean, 0 actionable findings, overall 0.88. |
| PR create or update | N/A | No PR requested | No git/GitHub mutation performed. |
| Task-style PR body verified | N/A | No PR | Not applicable. |
| PR proof image hosting | N/A | No PR/browser image | Not applicable. |
| Tracker sync-back | N/A | No tracker | Not applicable. |
| Final handoff contract | complete | Fill exact outcome and caveat | Recorded below. |
| Final lint | complete | Run `pnpm lint:fix` and `pnpm lint` | Both pass; final post-review `pnpm lint` passes. |
| Output budget discipline | complete | Keep high-volume output bounded | JSON/review artifacts under `/tmp`; one dev-server poll was noisy and was stopped. |
| Timed checkpoint | N/A | No duration requested | Not applicable. |
| Goal plan complete | yes | Run completion checker | Run after this update. |

Phase / pass table:
| Phase | Status | Evidence | Next |
|-------|--------|----------|------|
| Intake and source read | complete | Read task, autogoal, migration policy/playbook, and current config/directives. | implementation |
| Implementation | complete | Consolidated structural overrides, removed whole-file directives, localized production exceptions, and fixed actionable hook diagnostics. | verification |
| Verification | complete | Lint, policy audits, targeted typecheck, full check, source audits, and P1 review pass. | closeout |
| PR / tracker sync | complete | N/A: no PR, commit, push, or tracker mutation requested. | final response |
| Closeout | complete | Plan and goal closure checks. | final response |

Findings:

- Initial source inventory contained 259 directive lines, dominated by 217
  whole-file headers. Final inventory contains 58 inline/line directives in 48
  source files, zero whole-file/block directives, and zero directives in the
  unified test class.
- Re-enabling the five `typescript/no-unsafe-*` rules produced 1,004 production
  diagnostics. They fan out from deliberate existential `any` contracts such
  as `AnyEditor`, heterogeneous plugin/schema registries, and untyped adapters;
  the consumer sites cannot recover evidence lost at those owning boundaries.
- `react-hooks/exhaustive-deps` produced 40 diagnostics. Code fixes removed
  unstable defaults and clarified constant lifecycle objects; 13 precise local
  owner-identity exceptions remain. The rule stays enabled globally and in
  tests.
- All five iframe findings are fixed cross-origin providers that require scripts
  plus their own origin. The rule stays enabled; each provider carries a local
  exception beside its sandbox contract.
- The repo-owned `tooling/scripts/check-oxlint-config.mjs` is absent in this
  checkout. The migration skill's stricter `audit-project --assert-migrated`
  and `check-config-policy` replace it and both exit zero.

Decisions and tradeoffs:

- Config owns only structural classes: all tests including Playwright support,
  JavaScript, tooling/config/dev/bench scripts, declarations, debug modules,
  and serialized registry values. There are no exact-file or package-specific
  overrides.
- Production exceptions stay inline. A filename list in config merely hides the
  exception farther away and is worse than a local reason.
- The unsafe-any family is globally off for an architectural wrong-owner reason,
  not because of count or style. Plate deliberately permits existential `any`
  in public generic algebra; these five rules report downstream consumers and
  reward assertion laundering. Runtime validators and precise boundary types
  remain the actual safety owners.
- `exhaustive-deps`, iframe sandboxing, deprecation, accessibility, and other
  useful production rules remain enabled. Local exceptions document concrete
  runtime contracts.

Implementation notes:

- Unified Playwright support under the existing all-test selector and removed
  every test directive.
- Removed whole-file source suppressions and localized the surviving invariants.
- Replaced several lint workarounds with behavior-preserving code: stable command
  store/context/actions, stable schedule callback, complete effect dependencies,
  stable selector equality, ref-backed document snapshots, named render
  components, first-entry iteration, and stable demo keys.
- No template, manifest, lockfile, generated registry output, public API, branch,
  commit, push, PR, or tracker was changed.

Review fixes:

- Cycle 1 raised three P1 concerns: package-wide `exhaustive-deps`, global
  iframe sandboxing, and global unsafe-any rules. The first two were accepted:
  both rules were restored and resolved through code/local invariants.
- The unsafe-any concern was re-audited against the actual type algebra and
  retained globally off with per-rule P0 wrong-owner reasons. Cycle 2 reviewed
  that decision plus all hook refactors and returned zero actionable P0/P1
  findings (`overall: patch is correct`, 0.88).

Error attempts:
| Error / failed attempt | Count | Next different move | Resolution |
|------------------------|-------|---------------------|------------|
| Broadly re-enabled unsafe-any family | 1 | Audit diagnostic ownership rather than count | 1,004 downstream diagnostics traced to deliberate existential boundaries; globally off with explicit reasons. |
| First targeted typecheck used a zero-argument `useRef` unsupported by this React type version | 1 | Supply explicit `undefined` initial value | Targeted typecheck rerun passed 66/66 tasks. |
| Browser command-demo routes failed to compile | 2 routes | Inspect dev errors without generating registry output | Recorded caveat: missing CI-owned registry sources and existing client-metadata errors. |
| Review-clone copy loop used zsh's special `path` variable and unavailable `rsync` | 1 | Use a task-specific variable plus `mkdir`/`cp` | Clean cycle-2 clone created and review passed. |
| Dev-server output poll was accidentally too broad | 1 | Stop server and rely on bounded browser/dev-log evidence | Server stopped; final evidence remains concise. |

Verification evidence:

- `pnpm exec oxlint --format json .`: 0 diagnostics.
- `pnpm lint:fix`: pass; `pnpm lint`: pass, including final post-review run.
- Source audit: 58 directive lines / 48 files; 0 whole-file/block directives;
  0 unified-test-class directives.
- Ultracite `audit-project --assert-migrated`: exit 0.
- Ultracite `check-config-policy`: exit 0; empty `localConfigOverrides`,
  `testDirectiveViolations`, `missingReason`, `missingOverrideReason`, broad
  unsafe test holes, and unjustified test holes.
- Targeted Turbo typecheck for core, Plite React/layout, selection, cmdk,
  React utils, and www: 66/66 tasks.
- `pnpm check`: pass; 60 builds, 60 package typechecks, 3,243 fast tests, 1,529
  slow tests with 60 skips, zero failures, and slowest-suite limits pass.
- P1 autoreview cycle 2: clean, zero actionable findings, confidence 0.88.
- Templates audit: zero changed files.

Final handoff contract:

- PR line: N/A: no PR requested.
- Issue / tracker line: N/A: no tracker source.
- Confidence line: 97%.
- Flow table:
  - Reproduced: initial lint inventory captured 259 directives and strict-rule
    diagnostics; browser route exposed the unrelated registry blocker.
  - Verified: static/type/test/policy/review gates pass; Browser is caveated.
- Browser check: attempted `/blocks/select-editor-demo` and
  `/docs/components/select-editor`; both fail before rendering because the
  generated registry index imports missing CI-owned source files.
- Outcome: structural exceptions are centralized; production exceptions are
  local; suppression wallpaper is gone.
- Caveat: no rendered Browser proof because local registry generation is
  forbidden and the current generated index cannot compile.
- Design:
  - Chosen boundary: structural config patterns plus local production lines.
  - Why not quick patch: hundreds of copied headers and exact-file config rows
    would hide ownership and rot immediately.
  - Why not broader change: rewriting Plate's existential generic algebra to
    satisfy unsafe-any consumers is a risky public type-system redesign, not a
    lint migration.
- Verified: exact commands and counts are recorded above.
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

- PR: N/A: no PR requested.
- Issue / tracker: N/A: no tracker source.
- Browser proof: blocked by existing generated-registry compile failures.
- Caveats: browser rendering is unproved; every non-browser gate is green.

Timeline:

- 2026-08-21T06:14:28.923Z Task goal plan created.
- 2026-08-21 Inventory reduced from 259 source directive lines to 58, with
  zero whole-file and zero test-class directives.
- 2026-08-21 Full `pnpm check` passed and Browser smoke recorded its generated
  registry blocker.
- 2026-08-21 P1 autoreview cycle 2 returned clean.

Reboot status:
| Question | Answer |
|----------|--------|
| Where am I? | Closeout complete |
| Where am I going? | Final handoff |
| What is the goal? | Centralize structural Oxlint policy, keep production exceptions local, and prove the repo green. |
| What have I learned? | See Findings |
| What have I done? | See Timeline |

Open risks:

- Browser rendering remains unproved until CI regenerates or repairs
  `apps/www/src/__registry__/index.tsx`; this blocker predates and is unrelated
  to the suppression cleanup.
