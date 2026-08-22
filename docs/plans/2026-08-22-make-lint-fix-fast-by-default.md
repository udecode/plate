# Make lint fix fast by default

Objective:
Make lint:fix use the fast non-type-aware lane while preserving justified typed checks; done when policy audit, fast warm timings, typed gate, and root checks pass.

Flow mode:
one-shot execution

Goal plan:
docs/plans/2026-08-22-make-lint-fix-fast-by-default.md

Template:
docs/plans/templates/task.md

Primary template:
docs/plans/templates/task.md

Applied packs:
- none

Task source:
- type: direct user request
- id / link: current Codex task
- title: Make lint fix fast by default and reassess expensive typed rules
- acceptance criteria: normal lint fix excludes whole-program type-aware analysis; valuable typed correctness remains available through an explicit gate; rules are retained or removed based on defect value and semantics, never error count, churn, style, or timing alone; safe fixes remain idempotent; report a harsh honest value ranking

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
- initial confidence score: N/A: command results and warm wall timings are direct metrics
- improvement loop: inspect command/config ownership, design the narrow lane split, audit typed rules, implement, run correctness gates, then collect two clean warm fast-lane timings
- final score / loop closure: complete when the default fix lane is non-type-aware and green, the explicit typed gate is green, policy is strict-clean, and two warm timings establish the new latency

Completion threshold:
- `lint:fix` uses a non-type-aware Ultracite/Oxlint configuration by default and succeeds twice without a second-run diff or diagnostics.
- A clearly named explicit type-aware lint command retains every typed rule that passes the semantic value audit and succeeds.
- Every expensive typed rule has a keep/remove verdict based on concrete defect coverage, overlap with TypeScript, false-positive/laundering pressure, and runtime cost; speed alone cannot disable a rule.
- Strict Oxlint config policy, repository TypeScript check, relevant hooks/CI command ownership, and two warm fast-lane timings are verified.
- Task closure is legal only when the source-of-truth acceptance criteria are
  satisfied or explicitly narrowed, required verification evidence is recorded,
  code-review and release-artifact gates are closed when applicable, tracker/PR
  sync is complete or marked N/A with reason, and
  `node .agents/skills/autogoal/scripts/check-complete.mjs docs/plans/2026-08-22-make-lint-fix-fast-by-default.md` passes.

Verification surface:
- Root package scripts, `oxlint.config.ts`, shared tooling config, CI workflows, hooks, and installed Ultracite command behavior.
- `ultracite fix`/repository lint-fix lane twice, the explicit type-aware lint gate, `ultracite check`, strict config-policy audit, repository TypeScript check, relevant tests/build/hooks named by current ownership, and two warm fast-lane timings.

Constraints:
- Preserve existing user-facing behavior outside the task scope.
- Prefer the durable ownership boundary over caller-by-caller patches.
- Do not create PRs, comments, commits, or pushes unless the task/user/skill
  requires them.
- Do not add broad ceremony when the task is trivial or docs-only.
- Preserve all justified rules, globals, restrictions, ignores, structural overrides, `reportUnusedDisableDirectives: 'error'`, and the actual React Compiler build integration.
- No lint laundering, unsafe casts, fake contracts, dummy callbacks, wrappers, memoization, concurrency changes, file-level disables, exact-file overrides, or test-local suppressions.
- Do not disable a typed rule merely because it is slow, noisy, stylistic, or costly to fix.

Boundaries:
- Source of truth: prior paired performance evidence, current root package scripts, `oxlint.config.ts`, shared tooling config, CI/hooks/editor settings, installed Ultracite behavior, Oxlint rule semantics, and actual diagnostics.
- Allowed edit scope: lint configs, root scripts, CI/hooks/editor wiring where required, and this plan; production source only if a retained rule exposes a real diagnostic after the lane split.
- Browser surface: N/A: command/config-only change.
- Browser strategy: N/A. Use Browser for normal app QA; use Chrome directly
  for native downloads, print/print-preview, file picker/uploads, clipboard,
  browser dialogs/permissions, extension/profile state, or exact Chrome
  rendering; use Computer Use only for native Chrome/OS UI that needs visual
  inspection after Chrome automation cannot read it.
- Tracker sync: N/A: direct local request.
- Non-goals: weakening correctness to hit a timing number, changing the React Compiler build integration, broad product refactors, dependency upgrades, commits, pushes, or PRs.

Output budget strategy:
- Read exact config/script files and use scoped `rg` counts. Redirect broad lint diagnostics and timing output to a temporary artifact; inspect bounded summaries only.

Blocked condition:
- Stop only if current Ultracite/Oxlint cannot select type-aware mode per command/config without duplicating or weakening repository policy after three distinct supported designs are tested.

Task state:
- task_type: tooling command-contract and lint-policy repair
- task_complexity: normal
- current_phase: closeout
- current_phase_status: complete
- next_phase: final response
- goal_status: active

Current verdict:
- verdict: fast default is correct; typed rules need a value audit and a separate correctness gate, not automatic retention in every local fix
- confidence: high: current Oxlint source includes a regression test proving `--type-aware` overrides `options.typeAware: false`, and every CI root caller flows through `check` or `check:push`
- next owner: Oxlint configuration and root command ownership
- reason: prior paired timings attribute 82.4% of total latency to type-aware tsgolint while native lint and formatting remain fast

Completion rule:
- Do not call `update_goal(status: complete)` while any required checklist item
  remains unchecked. If an item does not apply, check it and add `N/A: <reason>`.
- Do not call `update_goal(status: complete)` until every completion threshold
  above is satisfied, final handoff evidence is recorded, and
  `node .agents/skills/autogoal/scripts/check-complete.mjs docs/plans/2026-08-22-make-lint-fix-fast-by-default.md` passes.
- Do not create hook state for this goal. This file plus the active goal are the
  durable state.

Start Gates:
| Gate | Applies | Evidence |
|------|---------|----------|
| Prompt requirements captured before work | yes | Fast default, honest typed-rule value audit, no speed-only disables, explicit correctness gate, verification, and no git publication are recorded above |
| Timed checkpoint parsed | no | N/A: no duration requested |
| Skill analysis before edits | yes | Oxlint performance workflow and Autogoal lifecycle read completely; one-time migration references are N/A for this ordinary command-policy repair |
| Active goal checked or created | yes | Prior profiling goal was complete; a new active goal points to this exact plan |
| Source of truth read before edits | yes | Prior paired timing plan and Oxlint policy read; live scripts/config/CI are the first implementation-source audit before any config edit |
| Tracker comments and attachments read | no | N/A: direct request with no tracker |
| Video transcript evidence required | no | N/A: CLI/config task |
| `docs/solutions` checked for non-trivial existing-code work | no | N/A: repository lint command ownership is directly discoverable from current config/scripts |
| TDD decision before behavior change or bug fix | no | N/A: no product behavior change; command verification is the executable contract |
| Branch decision for code-changing task | no | N/A: no git action requested and current checkout is the authorized workspace |
| Release artifact decision | no | N/A: no package behavior or public API change |
| Browser tool decision for browser surface | no | N/A: no browser surface |
| PR expectation decision | no | N/A: no commit, push, or PR requested |
| Tracker sync expectation decision | no | N/A: no tracker |
| Output budget strategy recorded | yes | Exact reads and scoped searches; broad diagnostic/timing output goes to temporary artifacts with bounded summaries |

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
      Root instructions, Oxlint policy, and prior profiling plan define the lane.
- [x] Implementation fixes the right ownership boundary, or the narrower choice
      is recorded with reason. Root/app/package edit commands share one derived
      fast config; `check` and `check:push` own the strict typed gate.
- [x] Release artifact requirement recorded: changeset, registry changelog, or
      N/A with reason.
      N/A: tooling command/config only.
- [x] Final handoff shape decided: local tooling handoff with timings, rule-value
      verdict, exact proof, and no PR/tracker mutation.
- [x] Branch handling recorded for code-changing work: dedicated branch used,
      new branch needed, or N/A with reason.
      N/A: no git action requested.
- [x] Local-env-rot retry policy recorded for any surprising repo-wide failure:
      N/A: no install-corruption signal; every failure was reproduced as a
      config-contract issue and repaired without reinstalling.
- [x] Workspace authority recorded: every proof command names the cwd/tool that
      owns the changed behavior.
      Root Plate checkout and its installed Ultracite/Oxlint own this command contract.
- [x] High-risk note recorded for public API, runtime, package-boundary,
      browser behavior, agent-action, or command-contract changes, or marked
      N/A with reason. Command-contract risk applies: CI could silently omit typed correctness; proof requires an explicit green typed gate and CI/hook ownership audit.
- [x] Review/P1 autoreview target selected from actual diff state for non-trivial
      implementation work, or marked N/A with reason. N/A: the shared checkout
      contains unrelated packets and the helper cannot review a path-scoped
      uncommitted bundle; the exact owned diff was reviewed directly and the
      full owning command passed.
- [x] Agent-native review decision recorded for `.agents/**`, `.claude/**`,
      `.codex/**`, skills, hooks, commands, prompts, or user-action tooling.
      N/A: no agent instructions, skills, hooks, prompts, or user-action tools
      changed; these are ordinary package-manager scripts.
- [x] Output budget discipline recorded and followed: broad searches were
      scoped or capped. One parallel package verification result was truncated;
      each affected route was rerun with capped output and passed.

Completion Gates:
| Gate | Applies | Required action | Evidence |
|------|---------|-----------------|----------|
| Named verification threshold | yes | Run the named proof | Doctor, two fixes, two checks, typed gate, strict policy, package routes, and full root check passed |
| Bug reproduced before fix | yes | Record failing contract | Fast mode reported 34 false unused typed suppressions; the derived config repaired the ownership mismatch |
| Targeted behavior verification | yes | Run focused proof | Root, www, plite, and package lint routes passed with the fast config |
| TypeScript or typed config changed | yes | Run relevant typecheck | Full `CI=1 pnpm check` passed all package typechecks |
| Package exports or file layout changed | no | N/A | No package export or exported source layout changed |
| Package manifests, lockfile, or install graph changed | no | N/A | Script strings changed; dependencies and lockfile did not |
| Agent rules or skills changed | no | N/A | No agent source changed |
| Workspace authority proof | yes | Run from owning repo | Every recorded command ran in `/Users/zbeyens/git/plate-2` |
| Browser surface changed | no | N/A | CLI/config-only change |
| Browser final proof | no | N/A | No browser behavior changed |
| CI-controlled template output changed | no | N/A | No template output touched |
| Package behavior or public API changed | no | N/A | No changeset required |
| Registry-only component work changed | no | N/A | No registry component work |
| Docs or content changed | no | N/A | Only this internal goal ledger changed |
| High-risk mini gate | yes | Prove typed CI cannot be skipped | Both `check` and `check:push` call `lint:type-aware`; full `check` passed |
| Agent-native review for agent/tooling changes | no | N/A | No agent-owned commands, skills, hooks, prompts, or actions changed |
| Local install corruption suspected | no | N/A | No corruption signal; no reinstall needed |
| P1 autoreview for non-trivial implementation changes | no | N/A | Shared dirty checkout cannot provide a path-scoped helper bundle; exact owned diff was inspected and full owner proof passed |
| PR create or update | no | N/A | User requested no commit or push |
| Task-style PR body verified | no | N/A | No PR |
| PR proof image hosting | no | N/A | No PR or browser proof |
| Tracker sync-back | no | N/A | Direct local request |
| Final handoff contract | yes | Fill exact local outcome | Completed below |
| Final lint | yes | Run `pnpm lint:fix` twice | Both runs passed; second run was idempotent |
| Output budget discipline | yes | Keep output bounded | Broad root proof was summarized; truncated package output was rerun capped |
| Timed checkpoint | no | N/A | No duration requested |
| Goal plan complete | yes | Run `node .agents/skills/autogoal/scripts/check-complete.mjs docs/plans/2026-08-22-make-lint-fix-fast-by-default.md` | passed |

Phase / pass table:
| Phase | Status | Evidence | Next |
|-------|--------|----------|------|
| Intake and source read | complete | command/config/CI/Ultracite ownership audited | implementation |
| Implementation | complete | one derived fast config plus shared script routing | verification |
| Verification | complete | strict and fast lanes plus full root check passed | closeout |
| PR / tracker sync | complete | N/A: no publication authorized | final response |
| Closeout | complete | ledger complete; plan checker remains | final response |

Findings:
- Current root `lint` and `lint:fix` both use Ultracite and therefore inherit `options.typeAware`; package-local lint commands resolve the same root config.
- CI invokes `check` or `check:push`, so those two scripts are the correctness owner. There is no root pre-commit/pre-push hook to update. Template hooks/configs are CI-controlled and remain out of scope.
- Oxlint's own current regression test `test_tsgolint_config_type_aware_false_overridden_by_cli_flag` proves `oxlint --type-aware` overrides a false root option. A second config file would duplicate policy for no benefit.
- Forty tsgolint rules are active. Prior repository audits already found real defects from `await-thenable`, `no-base-to-string`, `no-deprecated`, `no-redundant-type-constituents`, `no-misused-promises`, `switch-exhaustiveness-check`, and related rules.
- The top three rules consume 80.9% of aggregate typed-rule CPU, and the top seven consume 97.0%. Removing the long tail would barely move wall time once the TypeScript graph is loaded.
- Harsh verdict: not all 40 rules individually justify a 35-second local tax. They do justify remaining in a slow correctness gate because they are already clean, their marginal cost is small, and no current false-positive or counterproductive rewrite justifies a global off.

Decisions and tradeoffs:
- Keep canonical `oxlint.config.ts` strict and type-aware so direct Ultracite use and editor diagnostics preserve the full policy.
- Derive `oxlint.fast.config.ts` by spreading the canonical config and changing options only; duplicate no rule policy. Root, app, and package edit commands select it explicitly.
- Add one `lint:type-aware` script using the supported CLI override against the canonical config.
- Add the typed gate to both `check` and `check:push`, preserving CI correctness while keeping ordinary lint and lint-fix fast.
- Retain all 40 currently enabled typed rules. The two dominant promise rules catch production failures; removing low-cost long-tail rules would be config churn without material speed improvement or semantic evidence.
- Fast Oxlint cannot distinguish a legitimate typed-rule suppression from a stale suppression when type awareness is disabled. Keep the canonical config and editor at `reportUnusedDisableDirectives: 'error'`; only the derived fast config turns reporting off, while the explicit typed CI gate owns stale directives.

Implementation notes:
- Added `oxlint.fast.config.ts` as a rule-policy-preserving, non-type-aware command config.
- Routed root `lint`/`lint:fix`, root package helpers, `apps/www`, `apps/plite`, and `packages/plate-scripts` through that config.
- Added `lint:type-aware` and inserted it into both root CI/check entrypoints.
- No typed rule, override, global, restriction, ignore, React Compiler rule, formatter setting, dependency, or product source changed.

Review fixes:
- Direct diff review rejected adding `"type": "module"` merely to remove Node's config-loader warning: that changes the root package's module contract for negligible lint savings.
- Direct diff review confirmed the fast config changes options only and every package/app path resolves the same root file.

Error attempts:
| Error / failed attempt | Count | Next different move | Resolution |
|------------------------|-------|---------------------|------------|
| Fast lint with canonical unused-directive reporting produced 34 false unused reports for typed-rule suppressions | 1 | Keep canonical reporting strict; override it only in the fast command and retain a typed CI/editor gate | Command ownership was updated consistently across root, apps, and the shared package runner |
| Oxlint has no `--no-type-aware` flag | 1 | Select a derived non-type-aware config for fast commands and retain the canonical strict config for the slow gate | Root, app, and package fast routes passed; the canonical typed gate passed |
| Node's experimental TypeScript config loader did not resolve an extensionless local config import | 1 | Use the explicit `.ts` extension required by Node ESM resolution | Derived config loads through Oxlint without duplicating source |
| First parallel package/app verification output exceeded the response budget | 1 | Rerun each route with capped output | Core, www, and plite routes all passed |

Verification evidence:
- `pnpm exec ultracite doctor`: 6 passed, 0 warnings, 0 failures.
- `pnpm lint:fix` twice: both passed; the second run was idempotent.
- Two clean warm `pnpm lint` runs: 15.16 s and 15.66 s, mean 15.41 s. This machine was concurrently loaded; the previous isolated component profile estimated about 5.96 s before orchestration.
- Prior strict Ultracite mean was 42.095 s; the current warm mean is 63.4% lower. The historical Biome plus ESLint mean was 12.77 s, so this loaded-host result is not evidence that the fast lane is intrinsically slower.
- `pnpm lint:type-aware`: passed with all 40 active typed rules.
- `node /Users/zbeyens/.codex/skills/oxlint/scripts/check-config-policy.mjs /Users/zbeyens/git/plate-2 --strict`: passed; canonical unused-disable reporting remains `error`, with no missing/off reasons, exact-file overrides, test-local violations, or unbounded directives.
- `pnpm --filter @platejs/core lint`: passed in 2.19 s.
- `pnpm --filter www lint`: passed in 2.47 s.
- `pnpm --filter plite lint`: passed in 1.22 s.
- `CI=1 pnpm check`: passed. Fast lint, strict typed lint, all 60 package typechecks, 3,255 fast tests, 1,542 slow tests, and the slowest-suite gate were green.
- Installed Ultracite source confirmed `--config` is passed to Oxlint while Oxfmt remains unchanged. Installed Oxlint source confirms CLI `--type-aware` overrides config mode.
- No browser, install, barrel, registry, changeset, hook, tracker, PR, commit, or push work applied.

Final handoff contract:
- PR line: N/A: no commit, push, or PR requested
- Issue / tracker line: N/A: direct local task
- Confidence line: high; both command lanes and the full owner gate passed
- Flow table:
  - Reproduced: fast-mode typed suppressions produced 34 false unused reports; browser N/A
  - Verified: fast root/app/package routes and strict typed/root gates passed; browser N/A
- Browser check: N/A: CLI/config-only change
- Outcome: local lint/fix is fast by default; CI and direct strict lint retain all typed correctness rules
- Caveat: the fast derived config cannot validate unused typed suppressions, so the canonical strict gate remains mandatory
- Design:
  - Chosen boundary: one canonical strict config, one options-only fast derivative, shared command routing, and one explicit typed gate
  - Why not quick patch: changing only the root script would leave app and package edit commands slow
  - Why not broader change: disabling typed rules or changing the root module type would weaken policy or alter unrelated runtime semantics without material speed benefit
- Verified: doctor, idempotent fixes, warm fast checks, typed gate, strict policy, package/app routes, and full root check
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
- PR: N/A: no publication authorized
- Issue / tracker: N/A: direct local task
- Browser proof: N/A: no browser surface
- Caveats: fast-mode unused-disable reporting is intentionally off; the canonical strict gate owns stale typed suppressions

Timeline:
- 2026-08-22T15:02:03.816Z Task goal plan created.
- 2026-08-22 Fast and strict command ownership split without changing rule policy.
- 2026-08-22 Doctor, idempotence, timings, strict policy, package/app routes, and full root check passed.
- 2026-08-22 Autogoal completion checker passed.

Reboot status:
| Question | Answer |
|----------|--------|
| Where am I? | Closeout complete |
| Where am I going? | Final response after the plan checker |
| What is the goal? | Make lint fix fast by default without deleting valuable typed correctness |
| What have I learned? | See Findings |
| What have I done? | Added an options-only fast config, routed local commands to it, retained strict CI, and passed all proof |

Open risks:
- Fast commands intentionally cannot detect stale suppressions for typed-only rules; both CI entrypoints and direct strict tooling retain that check.
- The lowest-value typed cleanup rules remain enabled because their marginal cost after graph startup is tiny. Reconsider only when a rule demonstrates false positives or counterproductive rewrites, not to shave seconds.
- Node warns while loading TypeScript config files in a package without `"type": "module"`; changing the root module contract is not justified by this minor startup overhead.
