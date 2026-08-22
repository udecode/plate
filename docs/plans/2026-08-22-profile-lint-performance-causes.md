# Profile lint performance causes

Objective:
Profile Plate lint latency; done when two warm component samples rank the causes of the 12.77s to 42.10s regression; plan docs/plans/2026-08-22-profile-lint-performance-causes.md.

Flow mode:
one-shot execution

Goal plan:
docs/plans/2026-08-22-profile-lint-performance-causes.md

Template:
docs/plans/templates/task.md

Primary template:
docs/plans/templates/task.md

Applied packs:
- none

Task source:
- type: direct user request
- id / link: current Codex task
- title: Find the biggest causes of the lint regression
- acceptance criteria: isolate and time formatter, native Oxlint, JavaScript plugins, and type-aware tsgolint; rank the largest measured costs without changing repository lint policy

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
- initial confidence score: N/A: direct timings are the metric
- improvement loop: warm each controlled lane, collect two measured runs, then investigate the largest delta
- final score / loop closure: complete when the ranked measured causes and residual are reported

Completion threshold:
- Record two warm wall-clock samples for Oxfmt, full Oxlint, native Oxlint without JavaScript plugins, and Oxlint without type-aware tsgolint, or document an exact CLI/config limitation and use a controlled temporary config.
- Rank the largest measured deltas, compare them with the old 12.77s and final 42.10s means, and identify any residual that controlled measurements cannot attribute.
- Keep repository source and lint policy unchanged; temporary benchmark configs must live outside the repository.
- Task closure is legal only when the source-of-truth acceptance criteria are
  satisfied or explicitly narrowed, required verification evidence is recorded,
  code-review and release-artifact gates are closed when applicable, tracker/PR
  sync is complete or marked N/A with reason, and
  `node .agents/skills/autogoal/scripts/check-complete.mjs docs/plans/2026-08-22-profile-lint-performance-causes.md` passes.

Verification surface:
- `/usr/bin/time -p` warm command samples from `/Users/zbeyens/git/plate-2`.
- Installed Ultracite/Oxlint CLI and config-source audit proving what each controlled command enables.
- Final normal `pnpm exec ultracite check` pass after profiling.

Constraints:
- Preserve existing user-facing behavior outside the task scope.
- Prefer the durable ownership boundary over caller-by-caller patches.
- Do not create PRs, comments, commits, or pushes unless the task/user/skill
  requires them.
- Do not add broad ceremony when the task is trivial or docs-only.

Boundaries:
- Source of truth: recorded legacy timings, current root scripts/config, installed CLI help/source, and controlled warm wall-clock measurements.
- Allowed edit scope: this plan plus three temporary root benchmark configs, removed before final verification; helper code and timing output stay under a system temporary directory.
- Browser surface: N/A: command-line tooling only.
- Browser strategy: N/A: no browser behavior changes.
- Tracker sync: N/A: no issue or PR.
- Non-goals: changing rules, disabling plugins, editing production/config source, committing, pushing, or optimizing before the cause is measured.

Output budget strategy:
- Capture timing summaries and exit codes only. Keep verbose lint output in temporary files, inspect only bounded tails on failure, and exclude generated/build trees according to the real config.

Blocked condition:
- Stop only if three controlled isolation approaches cannot separate plugin/type-aware ownership without mutating repository policy.

Task state:
- task_type: performance diagnosis
- task_complexity: normal
- current_phase: closeout
- current_phase_status: complete
- next_phase: final response
- goal_status: complete

Current verdict:
- verdict: root type-aware tsgolint adds about 34.71 seconds and owns the regression; Oxfmt and native Oxlint are fast
- confidence: high from paired warm component timings, controlled rule isolation, Oxlint rule timings, and a tsgolint CPU profile
- next owner: lint policy, if the user authorizes splitting edit-time lint from the slow type-aware CI lane
- reason: disabling correctness rules for speed would hide the problem; the durable fix is moving the full TypeScript graph pass out of every edit-time lint

Completion rule:
- Do not call `update_goal(status: complete)` while any required checklist item
  remains unchecked. If an item does not apply, check it and add `N/A: <reason>`.
- Do not call `update_goal(status: complete)` until every completion threshold
  above is satisfied, final handoff evidence is recorded, and
  `node .agents/skills/autogoal/scripts/check-complete.mjs docs/plans/2026-08-22-profile-lint-performance-causes.md` passes.
- Do not create hook state for this goal. This file plus the active goal are the
  durable state.

Start Gates:
| Gate | Applies | Evidence |
|------|---------|----------|
| Prompt requirements captured before work | yes | Measure and rank the biggest causes of the 12.77s to 42.10s lint regression |
| Timed checkpoint parsed | no | N/A: no duration requested |
| Skill analysis before edits | yes | Oxlint performance and Autogoal workflows read completely; Oxlint owns this diagnosis |
| Active goal checked or created | yes | Goal created for this plan after the prior migration goal completed |
| Source of truth read before edits | yes | Legacy and final timing evidence already recorded in the two lint migration plans; live CLI/config source is the next read |
| Tracker comments and attachments read | no | N/A: direct local request |
| Video transcript evidence required | no | N/A: CLI performance |
| `docs/solutions` checked for non-trivial existing-code work | no | N/A: read-only tooling diagnosis, no implementation planned |
| TDD decision before behavior change or bug fix | no | N/A: no behavior change |
| Branch decision for code-changing task | no | N/A: no source/config change or git action |
| Release artifact decision | no | N/A: no package behavior change |
| Browser tool decision for browser surface | no | N/A: no browser surface |
| PR expectation decision | no | N/A: no commit, push, or PR requested |
| Tracker sync expectation decision | no | N/A: no tracker owner |
| Output budget strategy recorded | yes | Timing summaries only; full output redirected to temporary files and bounded on failure |

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
      `<video-transcripts>` XML, or marked N/A with reason. N/A: CLI timing.
- [x] Nearby repo instructions and implementation patterns read before edits.
- [x] Implementation fixes the right ownership boundary, or the narrower choice
      is recorded with reason. N/A: diagnose only; no optimization authorized yet.
- [x] Release artifact requirement recorded: N/A: no package change.
- [x] Final handoff shape decided: performance table with measured means, deltas, biggest causes, confidence, and next optimization target; no PR/tracker sync.
      requirements, PR body sync, and issue/Linear sync when applicable.
- [x] Branch handling recorded for code-changing work: N/A: read-only diagnosis.
- [x] Local-env-rot retry policy recorded: N/A unless a failure differs from the already-green lint command.
- [x] Workspace authority recorded: every proof command runs from `/Users/zbeyens/git/plate-2` against its installed lint stack.
      owns the changed behavior.
- [x] High-risk note recorded for public API, runtime, package-boundary,
      browser behavior, agent-action, or command-contract changes, or marked
      N/A with reason. N/A: no implementation change.
- [x] Review/P1 autoreview target selected: N/A for read-only measurement.
- [x] Agent-native review decision recorded: N/A: no agent/tooling file changes.
- [x] Output budget discipline recorded and followed: broad searches are
      scoped, capped, counted, or artifacted instead of streamed into goal
      context. One diagnostic command accidentally streamed 1,451 lines before
      truncation; every later run used `--silent` and temporary artifacts.

Completion Gates:
| Gate | Applies | Required action | Evidence |
|------|---------|-----------------|----------|
| Named verification threshold | complete | Run the command, proof, source audit, or artifact check named in this plan | Two warm samples collected for formatter, native lint, both JavaScript plugins, full non-type-aware lint, native type-aware lint, full type-aware lint, typed setup, and three leading typed rules |
| Bug reproduced before fix | complete | Record failing test/repro or N/A with reason | N/A: this is a measured performance regression, not a behavior fix |
| Targeted behavior verification | complete | Run focused test/proof for changed behavior or record N/A | Paired warm wall timings and built-in rule timing isolate the latency owners |
| TypeScript or typed config changed | complete | Run relevant typecheck | N/A: no TypeScript or repository config changed |
| Package exports or file layout changed | complete | Run `pnpm brl` before final verification and keep generated barrel updates | N/A: no package files changed |
| Package manifests, lockfile, or install graph changed | complete | Run `pnpm install` and relevant package checks | N/A: dependency graph unchanged |
| Agent rules or skills changed | complete | Run `pnpm install` and verify generated skill sync | N/A: no agent rule or skill changed |
| Workspace authority proof | complete | Run verification in the owning repo/package/app/route/tool and record cwd; do not count the wrong workspace as proof | All commands ran in `/Users/zbeyens/git/plate-2` against its installed Ultracite/Oxlint stack |
| Browser surface changed | complete | Capture Browser proof for normal app surfaces, or Chrome/Computer proof for native browser/OS surfaces | N/A: CLI-only diagnosis |
| Browser final proof | complete | Attach Browser/Chrome/Computer proof or exact caveat when browser proof applies | N/A: no browser surface |
| CI-controlled template output changed | complete | Restore generated template output or record why it is intentionally kept | N/A: no template output changed |
| Package behavior or public API changed | complete | Add a changeset or record why no changeset applies | N/A: no package behavior or API change |
| Registry-only component work changed | complete | Update `docs/components/changelog.mdx` or record N/A | N/A: no registry change |
| Docs or content changed | complete | For docs-heavy work, use `--template docs`; for incidental docs, verify source-backed claims, links, examples, and rendered output or record N/A | Only this execution plan records local evidence; no user-facing docs changed |
| High-risk mini gate | complete | For public API/runtime/package-boundary/browser/agent-action/command-contract changes, record realistic failure mode, proof plan, and why the chosen boundary is right; otherwise N/A | N/A: read-only performance diagnosis |
| Agent-native review for agent/tooling changes | complete | For `.agents/**`, `.claude/**`, `.codex/**`, skills, hooks, commands, prompts, or user-action tooling, load `.agents/skills/agent-native-reviewer/SKILL.md` and close accepted/actionable findings, or record N/A | N/A: agent/tooling sources unchanged |
| Local install corruption suspected | complete | Run `pnpm run reinstall` once, rerun the exact failing command, or record N/A | N/A: controlled lanes were green and internally consistent before unrelated machine load increased |
| P1 autoreview for non-trivial implementation changes | complete | Load `.agents/skills/autoreview/SKILL.md`; pass `--max-priority P1` with dirty local `--mode local`, branch/PR `--mode branch --base <base>`, or committed slice `--mode commit --commit <ref>`; fix and rerun within the hard cap of three helper invocations for one unchanged scope, then stop and report any remaining accepted/actionable findings; use P2 or P3 only when explicitly requested, or record N/A for docs-only/trivial/no local patch | N/A: no implementation patch |
| PR create or update | complete | Run `check` before PR work and sync PR body to the task-style final handoff | N/A: user did not request PR work |
| Task-style PR body verified | complete | Verify the PR body with `gh pr view --json body`; it must preserve auto-release blocks when applicable, must not include a current-PR self-link, and must use the kitcn PR #270 emoji format: `🐛 Fixes ...`, `🟢 95-100% confidence`, `Phase / 🧪 Tests / 🌐 Browser` table, and bold emoji Outcome/Caveat/Design/Verified sections | N/A: no PR |
| PR proof image hosting | complete | If PR body needs browser proof, replace local image paths with hosted GitHub URLs or record N/A | N/A: no PR or browser proof |
| Tracker sync-back | complete | Post concise issue/Linear sync after PR exists, or record N/A/blocker | N/A: direct request, no tracker |
| Final handoff contract | complete | Fill the final handoff fields below with exact PR/issue/confidence/tests/browser/outcome/caveats/design/verification content or N/A reason | Filled below |
| Final lint | complete | Run `pnpm lint:fix` or scoped equivalent | Final untouched `pnpm exec ultracite check` exited 0; no repository lint source was changed |
| Output budget discipline | complete | Verify no unbounded high-volume command output was streamed, or record the accidental output and recovery | One accidental 1,451-line diagnostic stream was truncated; all later broad output went to temporary artifacts with bounded summaries |
| Timed checkpoint | complete | If duration was requested, keep improving until elapsed, then finish the current loop cleanly; otherwise N/A | N/A: no duration requested |
| Goal plan complete | yes | Run `node .agents/skills/autogoal/scripts/check-complete.mjs docs/plans/2026-08-22-profile-lint-performance-causes.md` | Complete after every required gate and handoff field was filled; final checker rerun is the last closeout command |

Phase / pass table:
| Phase | Status | Evidence | Next |
|-------|--------|----------|------|
| Intake and source read | complete | legacy/final timings, live config, installed Ultracite source, and CLI capabilities inspected | profiling |
| Implementation | complete | N/A: diagnosis only; disposable root config entrypoints removed | verification |
| Verification | complete | paired warm timings, native rule timing, tsgolint CPU profile, and final green lint | closeout |
| PR / tracker sync | complete | N/A: no PR/tracker requested | final response |
| Closeout | complete | ranked causes and recommendation recorded | final response |

Findings:
- Legacy Biome plus React Hooks ESLint averaged 12.77 seconds. Final Ultracite averaged 42.095 seconds: +29.325 seconds, 3.296x, or +229.6%.
- Installed Ultracite runs `oxfmt --check` and then `oxlint` sequentially. Oxfmt averaged 1.475 seconds over 4,185 files.
- Native Oxlint without type information or JavaScript plugins averaged 0.835 seconds. Full non-type-aware Oxlint averaged 4.485 seconds.
- Full type-aware Oxlint averaged 39.19 seconds. Type awareness therefore adds about 34.705 seconds, 82.44% of the final lint and 118.35% of the entire regression.
- Native type-aware Oxlint averaged 36.93 seconds versus 0.835 seconds without types. The type-aware owner is tsgolint/TypeScript checking, not the JavaScript plugins.
- A minimal type-aware lane averaged 16.655 seconds. TypeScript program construction and checker setup alone add about 15.82 seconds over native lint. The repository has 152 `tsconfig*.json` files, but forcing one root tsconfig averaged 20.025 seconds and was slower than auto-discovery.
- The JavaScript plugin delta is about 3.65 seconds. React Doctor accounts for about 3.25 seconds of that delta; Anti-Slop accounts for about 0.76 seconds. Their isolated deltas overlap slightly with shared startup work.
- Controlled single-rule wall means above the 16.655-second typed setup were: `typescript/no-misused-promises` +19.605 seconds, `typescript/no-floating-promises` +10.825 seconds, and `typescript/no-confusing-void-expression` +2.985 seconds. Rules share checker work, so these deltas are not additive.
- Oxlint aggregate rule timings ranked `no-misused-promises` at 36.8%, `no-confusing-void-expression` at 31.5%, and `no-floating-promises` at 12.6%. The top three consume 80.9% of aggregate typed-rule CPU. Aggregate CPU ranks confusing-void above floating-promises while isolated wall latency ranks floating-promises second because parallel critical-path time differs from summed worker CPU.
- The tsgolint CPU profile shows expensive generic and conditional type relation/instantiation plus substantial memory reclamation and GC. This matches Plate's large TypeScript graph and the promise rules' checker-heavy work.
- Later timings were invalidated by unrelated machine load: a synthetic activation script, the VM, and WindowServer were consuming CPU. Those samples are excluded from comparisons; the earlier internally consistent warm pairs are the timing evidence.

Decisions and tradeoffs:
- Do not disable correctness rules merely to improve the headline number.
- The clean fix is a fast non-type-aware edit-time lint plus a separate type-aware CI/slow gate that retains the typed rules, ideally scoped to affected packages.
- Keep React Doctor unless its roughly 3.25-second cost fails a value review. It is secondary, not the regression owner. Anti-Slop is too small to optimize first.
- If every local root lint must remain type-aware, optimize or isolate `no-misused-promises` first, then `no-floating-promises`; do not pretend Oxfmt is the problem.

Implementation notes:
- No lint policy or repository source was changed. Eleven disposable root config entrypoints used for accurate root-relative globs were removed before final verification.

Review fixes:
- None yet.

Error attempts:
| Error / failed attempt | Count | Next different move | Resolution |
|------------------------|-------|---------------------|------------|
| External temporary configs resolved globs relative to `/tmp` and scanned ignored docs/templates | 1 | Keep helper code external but put three disposable config entrypoints at the repository root | Root-relative config ownership restores the real file set; entrypoints must be removed before final proof |
| A diagnostic rerun streamed 1,451 lines before truncation | 1 | Use `--silent` for every remaining timing run and inspect only exit status/time | No source mutation occurred; later output is capped to timing summaries |
| Initial isolated `no-misused-promises` config replaced the configured option tuple with plain `error` | 1 | Preserve `config.rules[rule]` exactly when isolating a rule | Corrected configuration passed and produced the recorded pair |
| One timing parser regex was over-escaped | 1 | Parse line tokens instead of nested regular-expression escaping | Corrected parser extracted the bounded timing rows |
| `ultracite check --config <path>` treated the separate existing path as a lint target | 1 | Pass the option as `--config=<path>` | Corrected invocation worked; later load-contaminated samples were excluded |

Verification evidence:
- Baselines: old lint `13.55s`, `11.99s`, mean `12.77s`; final Ultracite `41.71s`, `42.48s`, mean `42.095s`.
- Warm component pairs: Oxfmt `1.31s`, `1.64s`; native Oxlint `0.87s`, `0.80s`; full no-type Oxlint `4.66s`, `4.31s`; native typed Oxlint `37.51s`, `36.35s`; full typed Oxlint `39.06s`, `39.32s`.
- JavaScript plugin pairs: Anti-Slop `1.58s`, `1.61s`; React Doctor `4.00s`, `4.17s`.
- Type-aware setup pair: `16.82s`, `16.49s`. Single-root-tsconfig pair: `19.72s`, `20.33s`.
- Single typed rule pairs: `no-misused-promises` `36.12s`, `36.40s`; `no-floating-promises` `27.46s`, `27.50s`; `no-confusing-void-expression` `19.71s`, `19.57s`.
- Full debug run: 3,561 files, 634 rules, 18 threads. Oxfmt reports 4,185 files.
- Final repository check: `pnpm exec ultracite check` exited 0 after every disposable config entrypoint was removed. Its wall time is excluded because external CPU load had changed.

Final handoff contract:
- PR line: N/A: no git or PR action requested
- Issue / tracker line: N/A: direct local request
- Confidence line: high for cause ranking; medium for predicting the exact new end-to-end time until the lane split is implemented under stable host load
- Flow table:
  - Reproduced: command timing regression confirmed; browser N/A
  - Verified: paired controlled command timings and profiles; browser N/A
- Browser check: N/A: CLI tooling only
- Outcome: type-aware tsgolint owns the regression; JavaScript plugins are a distant second and Oxfmt/native Oxlint are small
- Caveat: later host load prevented a trustworthy new end-to-end counterfactual, so the recommendation uses stable paired component timings rather than contaminated runs
- Design:
  - Chosen boundary: separate fast edit-time lint from retained type-aware CI/slow proof
  - Why not quick patch: disabling high-value typed rules for speed is lint laundering
  - Why not broader change: no optimization was authorized; this task measures and recommends only
- Verified: source inspection, paired timings, built-in rule timing, CPU profile, and final green lint
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
- PR: N/A
- Issue / tracker: N/A
- Browser proof: N/A
- Caveats: later external machine load is excluded; no optimization has been implemented

Timeline:
- 2026-08-22T13:41:22.269Z Task goal plan created.

Reboot status:
| Question | Answer |
|----------|--------|
| Where am I? | Closeout complete |
| Where am I going? | Final response |
| What is the goal? | Rank the largest owners of the 12.77s to 42.10s lint regression with paired evidence |
| What have I learned? | Type-aware tsgolint owns the regression; `no-misused-promises` is the largest isolated rule owner |
| What have I done? | Timed every component, isolated plugins and typed rules, profiled tsgolint, restored the root, and reran normal lint green |

Open risks:
- A stable-host end-to-end counterfactual for the proposed non-type-aware edit lane has not been run; the component sum predicts roughly 6 seconds before orchestration.
- No performance fix has been implemented. The current normal lint remains around 42 seconds on the earlier stable host.
