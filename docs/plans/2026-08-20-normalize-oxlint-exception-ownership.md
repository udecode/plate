# normalize oxlint exception ownership

Objective:
Normalize Oxlint exceptions; done when test idioms use pattern overrides,
exact-file overrides are gone, justified negative-sum rules are global, the
remaining inline directives are intentional, and `pnpm check` passes.

Flow mode:
one-shot execution

Goal plan:
docs/plans/2026-08-20-normalize-oxlint-exception-ownership.md

Template:
docs/plans/templates/task.md

Primary template:
docs/plans/templates/task.md

Applied packs:
- none

Task source:
- type: direct user correction
- id / link: current Codex task
- title: prefer stable test-pattern and global Oxlint ownership over repeated
  per-file or next-line exceptions
- acceptance criteria: decide file-level versus inline ownership; promote rules
  globally only when they are repository-wide negative-sum; use the standard
  test glob instead of exact test-file config when test semantics own the
  exception; do not justify a disable by diagnostic volume; audit and report
  every remaining test next-line directive; finish with green lint and full CI.

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
- initial confidence score: N/A
- improvement loop: N/A
- final score / loop closure: N/A

Completion threshold:
- Every active next-line directive is classified as global negative-sum,
  structural test/path pattern, explicit whole-file boundary, or local semantic
  exception.
- Exact-file Oxlint override blocks introduced for keyboard mocking, benchmark
  evaluation, and DebugPlugin logging are removed.
- Test-wide disables are limited to rules whose semantics genuinely differ in
  tests; correctness rules remain enabled even if multiple contract tests need
  local violations.
- The final next-line count, test next-line count, global promotions, pattern
  promotions, file-level boundaries, and rejected promotions are recorded.
- Config structure, targeted lint, safe fixer, full `pnpm check`, and P1
  autoreview pass with zero accepted findings.
- Task closure is legal only when the source-of-truth acceptance criteria are
  satisfied or explicitly narrowed, required verification evidence is recorded,
  code-review and release-artifact gates are closed when applicable, tracker/PR
  sync is complete or marked N/A with reason, and
  `node .agents/skills/autogoal/scripts/check-complete.mjs docs/plans/2026-08-20-normalize-oxlint-exception-ownership.md` passes.

Verification surface:
- Exact source audit of `oxlint-disable-next-line`, file-level directives,
  config selectors, and rule counts split by test/non-test paths.
- `node tooling/scripts/check-oxlint-config.mjs` and targeted Oxlint.
- `pnpm lint:fix`, full `pnpm check`, and P1 local exact-slice autoreview.

Constraints:
- Preserve existing user-facing behavior outside the task scope.
- Prefer the durable ownership boundary over caller-by-caller patches.
- Do not create PRs, comments, commits, or pushes unless the task/user/skill
  requires them.
- Do not add broad ceremony when the task is trivial or docs-only.
- Never disable from error volume alone.
- Keep unsafe, promise, async, and other correctness rules enabled in tests
  unless the test runner's structural type hole proves the precise exception.
- Preserve runtime, test, package, browser, and public API behavior.

Boundaries:
- Source of truth: the 60 active directives, `oxlint.config.ts`, Ultracite's
  migration playbook and compact rule policy, installed Oxlint behavior, and
  the preceding completed suppression audit.
- Allowed edit scope: `oxlint.config.ts`, source files whose directives move to
  global/test/file ownership, and this goal plan.
- Browser surface: N/A: lint ownership only.
- Browser strategy: N/A: no rendered behavior changes.
- Tracker sync: N/A: direct local request.
- Non-goals: weakening all lint in tests, changing code behavior merely to
  satisfy a rule, reopening unrelated migration code, or creating a PR/commit.

Output budget strategy:
- Count and group directives first; inspect only the few source windows needed
  for ambiguous ownership. Cap config and review output; do not stream full CI
  logs unless a failure needs its owning slice.

Blocked condition:
- Block only if Oxlint cannot express the structural pattern or the same full
  check failure repeats after one evidence-based repair and one local-env reset
  when corruption signals apply.

Task state:
- task_type: tooling policy cleanup
- task_complexity: normal non-trivial
- current_phase: closeout
- current_phase_status: complete
- next_phase: final handoff
- goal_status: complete

Current verdict:
- verdict: the user's ownership correction is valid, but blanket test disabling
  would be unsafe; promote only test-specific idioms
- confidence: 100% after full verification
- next owner: N/A: local task is complete
- reason: test patterns own fixture conventions while correctness violations
  remain local and visible

Completion rule:
- Do not call `update_goal(status: complete)` while any required checklist item
  remains unchecked. If an item does not apply, check it and add `N/A: <reason>`.
- Do not call `update_goal(status: complete)` until every completion threshold
  above is satisfied, final handoff evidence is recorded, and
  `node .agents/skills/autogoal/scripts/check-complete.mjs docs/plans/2026-08-20-normalize-oxlint-exception-ownership.md` passes.
- Do not create hook state for this goal. This file plus the active goal are the
  durable state.

Start Gates:
| Gate | Applies | Evidence |
|------|---------|----------|
| Prompt requirements captured before work | yes | test-pattern preference, global-policy question, ownership choice, and no volume rationale recorded above |
| Timed checkpoint parsed | no | N/A: none requested |
| Skill analysis before edits | yes | task, autogoal, migrate-to-ultracite, full playbook, and full policy read |
| Active goal checked or created | yes | prior goal complete; this plan defines the new objective before creation |
| Source of truth read before edits | yes | all 60 directives and relevant config selectors inventoried |
| Tracker comments and attachments read | no | N/A: no tracker |
| Video transcript evidence required | no | N/A: no video |
| `docs/solutions` checked for non-trivial existing-code work | no | N/A: current config and completed audit are the direct owners |
| TDD decision before behavior change or bug fix | no | N/A: no behavior change; lint/config checks own regression proof |
| Branch decision for code-changing task | no | N/A: current checkout explicitly authorized; no PR requested |
| Release artifact decision | no | N/A: no package or registry behavior change |
| Browser tool decision for browser surface | no | N/A: no browser surface |
| PR expectation decision | no | N/A: no PR requested |
| Tracker sync expectation decision | no | N/A: no tracker |
| Output budget strategy recorded | yes | count-first and capped-output strategy recorded above |

Work Checklist:
- [x] If a duration was requested, it is recorded as minimum active work unless
      explicitly marked hard stop; when no better metric exists, initial and
      final confidence scores are recorded. N/A: no duration.
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
      `<video-transcripts>` XML, or marked N/A with reason. N/A: no video.
- [x] Nearby repo instructions and implementation patterns read before edits.
- [x] Implementation fixes the right ownership boundary, or the narrower choice
      is recorded with reason.
- [x] Release artifact requirement recorded: changeset, registry changelog, or
      N/A with reason. N/A: configuration/comment ownership only.
- [x] Final handoff shape decided: bug/feature/testing/batch/review/tracker
      requirements, PR body sync, and issue/Linear sync when applicable.
- [x] Branch handling recorded for code-changing work: dedicated branch used,
      new branch needed, or N/A with reason. N/A: current checkout authorized.
- [x] Local-env-rot retry policy recorded for any surprising repo-wide failure:
      reinstall/rerun evidence or N/A with reason.
- [x] Workspace authority recorded: every proof command names the cwd/tool that
      owns the changed behavior.
- [x] High-risk note recorded for public API, runtime, package-boundary,
      browser behavior, agent-action, or command-contract changes, or marked
      N/A with reason. Risk is hidden diagnostics; exact owner audit, full lint,
      check, and P1 review own it.
- [x] Review/P1 autoreview target selected from actual diff state for non-trivial
      implementation work: exact isolated config/directive slice, because the
      checkout's broader migration exceeds one review bundle.
- [x] Agent-native review decision recorded for `.agents/**`, `.claude/**`,
      `.codex/**`, skills, hooks, commands, prompts, or user-action tooling.
      N/A: no agent workflow source changes.
- [x] Output budget discipline recorded and followed: broad searches are
      scoped, capped, counted, or artifacted instead of streamed into goal
      context. One migration audit emitted oversized output; later audits used
      exact counts and capped slices, and the miss is recorded below.

Completion Gates:
| Gate | Applies | Required action | Evidence |
|------|---------|-----------------|----------|
| Named verification threshold | yes | Run the named proof suite | Passed: structural config check, targeted Oxlint, fixer, full `pnpm check`, Doctor, migration audit, and P1 review |
| Bug reproduced before fix | no | N/A: policy cleanup, not a runtime bug | N/A: baseline directive inventory is the policy repro |
| Targeted behavior verification | yes | Run focused config and lint proof | Passed: config structure and targeted Oxlint |
| TypeScript or typed config changed | yes | Run relevant typecheck | Passed inside full `pnpm check`: 60/60 typecheck tasks |
| Package exports or file layout changed | no | N/A: no export or layout change | N/A |
| Package manifests, lockfile, or install graph changed | no | N/A: no dependency graph change | N/A |
| Agent rules or skills changed | no | N/A: no agent source changed | N/A |
| Workspace authority proof | yes | Run proof in the owning checkout | Passed in `/Users/zbeyens/git/plate-2` |
| Browser surface changed | no | N/A: lint ownership only | N/A |
| Browser final proof | no | N/A: no rendered behavior | N/A |
| CI-controlled template output changed | no | N/A: no template output changed | N/A |
| Package behavior or public API changed | no | N/A: no changeset applies | N/A |
| Registry-only component work changed | no | N/A: no registry behavior changed | N/A |
| Docs or content changed | no | N/A: goal plan is incidental execution evidence | Source-backed plan checked by completion script |
| High-risk mini gate | yes | Prove that correctness diagnostics were not hidden | Unsafe values, promise misuse, hooks, accessibility, console, and security rules remain enabled outside explicit owners; full check and review passed |
| Agent-native review for agent/tooling changes | no | N/A: Oxlint config is repo tooling, not agent-action tooling | N/A |
| Local install corruption suspected | no | N/A: no corruption signal | N/A |
| P1 autoreview for non-trivial implementation changes | yes | Run local exact-slice P1 review | Invocation 2 clean; zero accepted findings, correctness 0.87 |
| PR create or update | no | N/A: user did not request a PR | N/A |
| Task-style PR body verified | no | N/A: no PR | N/A |
| PR proof image hosting | no | N/A: no PR or browser proof | N/A |
| Tracker sync-back | no | N/A: no tracker | N/A |
| Final handoff contract | yes | Fill exact outcome, caveat, design, and verification | Filled below |
| Final lint | yes | Run `pnpm lint:fix` | Passed twice; second run was idempotent |
| Output budget discipline | yes | Record any miss and recovery | One oversized migration-audit result recorded; all subsequent output capped |
| Timed checkpoint | no | N/A: no duration requested | N/A |
| Goal plan complete | yes | Run `node .agents/skills/autogoal/scripts/check-complete.mjs docs/plans/2026-08-20-normalize-oxlint-exception-ownership.md` | Passed |

Phase / pass table:
| Phase | Status | Evidence | Next |
|-------|--------|----------|------|
| Intake and source read | complete | 60 next-line and 456 file-level baseline occurrences audited | implementation |
| Implementation | complete | global, test-pattern, ambient, and four whole-file owners normalized | verification |
| Verification | complete | full proof suite and P1 review green | closeout |
| PR / tracker sync | complete | N/A: neither requested nor applicable | final response |
| Closeout | complete | final counts and residual debt recorded | final response |

Findings:
- Baseline source ownership was 60 next-line directives in 60 occurrences: 9
  in standard test paths and 51 outside them. Tests used six next-line rules.
- The larger smell was 456 file-level directives across 386 files. The main
  concentrations were unsafe-value rules, public-generic inference,
  `unbound-method`, `no-loop-func`, and Bun matcher typing gaps.
- Five rules are repository-wide negative-sum for semantic reasons, not volume:
  `no-loop-func` duplicates `no-var` yet rejects safe block-scoped closures;
  `typescript/no-unnecessary-type-parameters` misreads library inference and
  compile-time witnesses; `typescript/no-namespace` rejects declaration
  merging; `unicorn/no-new-array` changes sparse/preallocated array semantics;
  and `react/prefer-function-component` cannot model class-only lifecycles.
- Ten rules describe stable test semantics and belong on the shared test glob:
  module mocking, partial accessors, fixture scopes, script-URL fixtures, class
  state fixtures, Bun matcher thenability, deprecated compatibility probes,
  non-Error/Suspense fixtures, and unbound method/spies.
- Test-wide `typescript/no-misused-promises`, `react-hooks/rules-of-hooks`, and
  `no-console` would be reckless. They catch false-green async tests, invalid
  hook execution, and accidental noisy logging, respectively.
- The benchmark contract is an explicit dynamic-evaluation owner and DebugPlugin
  is an explicit console owner. Whole-file directives keep those reasons in the
  only files that own the exception; exact-file config would silently exempt
  unrelated future code.
- The final source has 51 next-line directives, 15 same-line directives, and
  341 file-level directives across 303 files. Exact-file config selectors are
  zero.
- Five next-line directives remain in tests: three intentional async values at
  sync contract boundaries, one opt-in console trace, and one domain `.fill`
  false positive. None describes a safe test-wide exemption.
- The largest retained next-line groups are 21 composite-widget
  `prefer-tag-over-role` exceptions and 10 production deprecation compatibility
  calls. Both need call-site evidence and remain inline.
- The remaining file-level concentration is unsafe-type ownership: 134 unsafe
  assignments, 94 unsafe arguments, 76 unsafe returns, 75 unsafe member reads,
  and 37 unsafe calls. That is real boundary/type debt, not evidence that the
  rules lack value.

Decisions and tradeoffs:
- Prefer global root policy only for a repository-wide invalid rule premise.
- Prefer a config pattern when every matching file shares a language, fixture,
  test-runner, generated, declaration, or adapter condition.
- Prefer a whole-file directive only when the entire file is one explicit
  boundary owner. Otherwise keep the exception at the exact line.
- Do not globalize the 21 composite-widget role exceptions, 10 production
  deprecations, unsafe-value rules, async correctness rules, hook rules, or
  security-sensitive production rules. Repetition does not erase their value.

Implementation notes:
- Added five root rule-offs and ten test-pattern rule-offs with semantic
  reasons.
- Removed 127 obsolete directives from 118 files.
- Removed exact-file config for keyboard module mocking, benchmark dynamic
  evaluation, and DebugPlugin logging.
- Added ambient declaration ownership for triple-slash references.
- Added exact whole-file boundaries to the benchmark contract and DebugPlugin.
- Moved the two Fumadocs generated-type exceptions from exact config selectors
  to explained headers in their owning files.
- Removed every exact-file selector from `oxlint.config.ts`; only structural
  patterns remain.

Review fixes:
- Invocation 1 reported two P1 claims. Both were rejected with installed-runtime
  proof: Ultracite 7.10.5 exports `jsPluginSettings` and `selectJsPlugins`, and
  `next-env.d.ts` is ignored while the core preset already disables its import
  rule.
- Invocation 2 reviewed the same slice with that evidence and returned zero
  findings. No code change was warranted.

Autoreview scope baseline:
- Request: replace repeated per-test and exact-file suppression ownership with
  stable test patterns or globally justified negative-sum policy.
- Violated invariant: exception scope must match semantic ownership; exact-file
  config and repeated whole-file comments hide that relationship.
- Target: dirty local `next` checkout, reviewed through an isolated exact slice
  because the checkout contains a much larger migration bundle.
- Intended behavior: lint-policy ownership only; runtime, public API, test,
  package, security, and browser behavior remain unchanged.
- Owner boundary: `oxlint.config.ts`, obsolete directives covered by its new
  rules, and four explicit whole-file generated/logging/evaluation owners.
- Relevant siblings: all active next-line, line, and file-level directives were
  counted and grouped by rule plus test/non-test path.
- Contracts preserved: unsafe-value, promise misuse, hook-order, console-noise,
  accessibility, and production security rules remain enabled outside their
  already-owned structural boundaries.

Error attempts:
| Error / failed attempt | Count | Next different move | Resolution |
|------------------------|-------|---------------------|------------|
| First combined config patch had a stale context anchor | 1 | Split the patch by override/root owner | Applied all intended config changes in smaller verified patches |
| First generated directive-removal patch repeated file operations | 1 | Group all removals per file | Removed 127 directives across 118 files with one grouped patch |
| Removing exact Fumadocs config selectors exposed generated-type diagnostics | 1 | Put the exception beside the generated boundary instead of restoring hidden config | Added explained whole-file headers to the route and source owners |
| Migration audit streamed an oversized result | 1 | Use capped, count-only follow-up audits | Recorded exact final counts without repeating the large output |
| First P1 review assumed an older package surface and a missing Next rule | 1 | Verify installed exports and effective config, then rerun the same review scope | Both claims disproved; invocation 2 clean |
| Direct Oxfmt check targeted the ignored goal-plan path | 1 | Use the plan's owning validator; full Oxfmt already passed before the evidence-only edit | Autogoal completion check passed; `docs/plans/**` is intentionally outside Oxfmt's targets |

Verification evidence:
- `node tooling/scripts/check-oxlint-config.mjs`: passed with 169 root rules and
  166 selector/rule pairs.
- Exact selector audit: `(no exact selectors)`.
- Targeted Oxlint over config and the four explicit boundary files: passed.
- `pnpm lint:fix`: passed twice; second pass made no further formatting change.
- `pnpm check`: exit 0; 60 build tasks, 60 typecheck tasks, 3,242 fast tests,
  and 1,529 slow tests passed with zero failures.
- `pnpm exec ultracite doctor`: 6 passed, 0 warnings, 0 failures.
- Ultracite migration audit with `--assert-migrated`: zero failures.
- P1 local exact-slice autoreview invocation 2: zero findings, patch correct,
  confidence 0.87.

Final handoff contract:
- PR line: N/A: no PR requested
- Issue / tracker line: N/A: direct local task
- Confidence line: 100% for requested policy ownership and green checks
- Flow table:
  - Reproduced: baseline directive inventory complete; browser N/A
  - Verified: full `pnpm check` green; browser N/A
- Browser check: N/A: no rendered behavior changed
- Outcome: exceptions now live at global, structural-pattern, whole-file, or
  inline scope according to their semantics; exact-file config is gone
- Caveat: 341 file-level directives remain, mostly unsafe-type debt; they stay
  visible because globally disabling those rules would hide real defects
- Design:
  - Chosen boundary: inline by default, whole-file for a coherent file owner,
    path override for shared test/declaration semantics, global only when the
    rule premise is repository-wide invalid
  - Why not quick patch: repeated inline comments were the ownership bug
  - Why not broader change: correctness and unsafe-type rules still have value
- Verified: config checks, fixer, full check, Doctor, migration audit, and P1
  review all pass
- PR body verified: N/A: no PR

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
- PR: N/A: not requested
- Issue / tracker: N/A: none
- Browser proof: N/A: lint-only change
- Caveats: unsafe-type file headers remain explicit follow-up debt

Timeline:
- 2026-08-20T11:45:49.818Z Task goal plan created.
- 2026-08-20T12:03:00Z Promoted five global rules and ten test-owned rules;
  removed repeated directives and exact-file config selectors.
- 2026-08-20T12:09:00Z Full check, Doctor, migration audit, and config audits
  passed.
- 2026-08-20T12:17:00Z P1 autoreview invocation 2 passed with zero findings.

Reboot status:
| Question | Answer |
|----------|--------|
| Where am I? | Closeout complete |
| Where am I going? | Final response |
| What is the goal? | Normalize Oxlint exception ownership without hiding correctness debt |
| What have I learned? | Test conventions deserve structural overrides; unsafe-type debt does not |
| What have I done? | See implementation notes, verification evidence, and timeline |

Open risks:
- No blocking risk. The 341 remaining file-level directives are an explicit
  future cleanup queue, dominated by erased/generated/runtime boundary typing.
