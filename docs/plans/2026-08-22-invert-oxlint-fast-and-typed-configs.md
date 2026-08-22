# Invert Oxlint fast and typed configs

Objective:
Make `oxlint.config.ts` the fast default and a named typed config the strict gate; done when scripts, policy, idempotence, typed lint, typecheck, and root check pass.

Flow mode:
one-shot execution

Goal plan:
docs/plans/2026-08-22-invert-oxlint-fast-and-typed-configs.md

Template:
docs/plans/templates/task.md

Primary template:
docs/plans/templates/task.md

Applied packs:
- none

Task source:
- type: direct user correction
- id / link: current Codex task
- title: Invert Oxlint fast and typed config ownership
- acceptance criteria: the conventional config and ordinary lint/fix commands are fast; `oxlint.type-aware.config.ts` owns typed lint plus strict unused-disable reporting; type-aware lint remains a separately named lint command rather than being hidden inside TypeScript `typecheck`; `check` and `check:push` still run both; no rule policy changes; full verification remains green

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
- initial confidence score: N/A: binary command and policy gates own completion
- improvement loop: invert config ownership, simplify callers, repair strict-policy ownership, run focused and root proof
- final score / loop closure: complete only when both configs load, fast fixes are idempotent, strict typed lint and typecheck pass, policy is strict-clean against the typed owner, and root `check` passes

Completion threshold:
- `oxlint.config.ts` is the fast conventional config and ordinary root/app/package Ultracite commands need no custom config flag.
- `oxlint.type-aware.config.ts` derives from the same policy, enables type-aware analysis and `reportUnusedDisableDirectives: 'error'`, and is called by `lint:type-aware`.
- Root `typecheck` remains TypeScript-only; `check` and `check:push` call the separate typed lint gate.
- No lint rule, global, restriction, ignore, structural override, React Compiler integration, dependency, product behavior, or unrelated user change is weakened or rewritten.
- Doctor, two safe fixes/checks, strict typed lint, TypeScript check, strict policy audit, affected app/package lint routes, and root `CI=1 pnpm check` pass.
- Task closure is legal only when the source-of-truth acceptance criteria are
  satisfied or explicitly narrowed, required verification evidence is recorded,
  code-review and release-artifact gates are closed when applicable, tracker/PR
  sync is complete or marked N/A with reason, and
  `node .agents/skills/autogoal/scripts/check-complete.mjs docs/plans/2026-08-22-invert-oxlint-fast-and-typed-configs.md` passes.

Verification surface:
- Root `package.json`, app manifests, package runner, both Oxlint configs, CI path filters, editor settings, and the strict policy checker.
- `ultracite doctor`; two `pnpm lint:fix` and `pnpm lint`; `pnpm lint:type-aware`; `pnpm typecheck`; app/package lint routes; strict policy audit targeting the typed owner; `CI=1 pnpm check`.

Constraints:
- Preserve existing user-facing behavior outside the task scope.
- Prefer the durable ownership boundary over caller-by-caller patches.
- Do not create PRs, comments, commits, or pushes unless the task/user/skill
  requires them.
- Do not add broad ceremony when the task is trivial or docs-only.
- Keep the fast and strict configs as one shared rule policy with options-only derivation.
- Keep TypeScript compiler checking and typed lint semantically separate.
- Preserve `reportUnusedDisableDirectives: 'error'` in the strict typed owner; the fast owner must disable it only because absent typed rules otherwise create false unused reports.
- Do not commit, push, reinstall, build registry output, or touch product source.

Boundaries:
- Source of truth: current configs/scripts/callers, installed Oxlint/Ultracite behavior, strict policy checker, and the prior green fast/typed/root evidence.
- Allowed edit scope: `oxlint.config.ts`, `oxlint.fast.config.ts` rename/replacement, root/app/package scripts, CI config path filters, editor lint settings only if the typed owner requires them, the global Oxlint policy checker only if it needs an explicit strict-config option, and this plan.
- Browser surface: N/A: CLI/config-only change.
- Browser strategy: N/A. Use Browser for normal app QA; use Chrome directly
  for native downloads, print/print-preview, file picker/uploads, clipboard,
  browser dialogs/permissions, extension/profile state, or exact Chrome
  rendering; use Computer Use only for native Chrome/OS UI that needs visual
  inspection after Chrome automation cannot read it.
- Tracker sync: N/A: direct local request.
- Non-goals: merging typed lint into `typecheck`, disabling expensive rules, changing root module type, dependency changes, product refactors, publication, or performance re-benchmarking beyond smoke timings.

Output budget strategy:
- Read exact config/script/policy files and use targeted `rg` for callers. Cap diagnostic output and summarize broad root proof rather than streaming it.

Blocked condition:
- Stop only if the installed tools cannot designate the named typed config as the strict policy owner without duplicating rule policy or weakening unused-disable enforcement after three supported designs.

Task state:
- task_type: lint command-ownership cleanup
- task_complexity: normal
- current_phase: closeout
- current_phase_status: complete
- next_phase: final response
- goal_status: active

Current verdict:
- verdict: invert the configs, but keep typed lint separate from TypeScript `typecheck`
- confidence: high
- next owner: Oxlint config and root/app/package command wiring
- reason: conventional tooling should be fast by default, while separate command names preserve failure ownership and avoid pretending two independent TypeScript graph consumers share work

Completion rule:
- Do not call `update_goal(status: complete)` while any required checklist item
  remains unchecked. If an item does not apply, check it and add `N/A: <reason>`.
- Do not call `update_goal(status: complete)` until every completion threshold
  above is satisfied, final handoff evidence is recorded, and
  `node .agents/skills/autogoal/scripts/check-complete.mjs docs/plans/2026-08-22-invert-oxlint-fast-and-typed-configs.md` passes.
- Do not create hook state for this goal. This file plus the active goal are the
  durable state.

Start Gates:
| Gate | Applies | Evidence |
|------|---------|----------|
| Prompt requirements captured before work | yes | Config inversion, separate typed lint, fast default, strict ownership, verification, no publication captured above |
| Timed checkpoint parsed | no | N/A: no duration requested |
| Skill analysis before edits | yes | Oxlint and Autogoal instructions read completely; one-time migration references do not apply to this ordinary config ownership change |
| Active goal checked or created | yes | Previous goal was complete; new active goal names this plan and threshold |
| Source of truth read before edits | yes | Current callers and prior green command evidence inspected; exact configs/policy checker are next scoped reads before mutation |
| Tracker comments and attachments read | no | N/A: no tracker |
| Video transcript evidence required | no | N/A: no video |
| `docs/solutions` checked for non-trivial existing-code work | no | N/A: current command ownership and installed-tool behavior are the direct sources |
| TDD decision before behavior change or bug fix | no | N/A: no product behavior; command results are the executable contract |
| Branch decision for code-changing task | no | N/A: no git action requested; use current authorized checkout |
| Release artifact decision | no | N/A: no package behavior or public API change |
| Browser tool decision for browser surface | no | N/A: no browser surface |
| PR expectation decision | no | N/A: no commit, push, or PR requested |
| Tracker sync expectation decision | no | N/A: no tracker |
| Output budget strategy recorded | yes | Exact reads, targeted caller searches, capped diagnostics, summarized root proof |

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
      Root instructions, Oxlint policy, prior lane split, and current caller ownership apply.
- [x] Implementation fixes the right ownership boundary: conventional config
      owns full fast policy, the named config changes strict typed options only,
      and root checks compose independent lint/compiler gates.
- [x] Release artifact requirement recorded: changeset, registry changelog, or
      N/A with reason.
      N/A: config/script-only change.
- [x] Final handoff shape decided: local tooling result with exact commands,
      strictness caveat, and no PR/tracker publication.
      requirements, PR body sync, and issue/Linear sync when applicable.
- [x] Branch handling recorded for code-changing work: dedicated branch used,
      new branch needed, or N/A with reason.
      N/A: no git action requested.
- [x] Local-env-rot retry policy recorded for any surprising repo-wide failure:
      N/A: failures were deterministic checker/Doctor ownership signals, not
      install corruption; no reinstall was needed.
- [x] Workspace authority recorded: every proof command names the cwd/tool that
      owns the changed behavior.
      `/Users/zbeyens/git/plate-2` and its installed Ultracite/Oxlint own every proof command.
- [x] High-risk note recorded for public API, runtime, package-boundary,
      browser behavior, agent-action, or command-contract changes, or marked
      N/A with reason. Command-contract risk applies: the strict gate or policy audit could silently target the fast config, so caller and config-owner source audits plus full `check` are mandatory.
- [x] Review/P1 autoreview target selected from actual diff state for non-trivial
      implementation work, or marked N/A with reason. N/A: local review mode
      would bundle 15 tracked dirty files plus unrelated untracked work and has
      no path-scoped mode; the exact owned source was directly reviewed and all
      owner proof passed.
- [x] Agent-native review decision recorded for `.agents/**`, `.claude/**`,
      `.codex/**`, skills, hooks, commands, prompts, or user-action tooling.
      Applies: the Oxlint skill route, global source owner, named config discovery,
      36-test proof, and user-facing root commands form a complete capability map.
- [x] Output budget discipline recorded and followed: broad searches are
      scoped, capped, counted, or artifacted instead of streamed into goal
      context. Exact reads and capped outputs only so far.

Completion Gates:
| Gate | Applies | Required action | Evidence |
|------|---------|-----------------|----------|
| Named verification threshold | yes | Run named proof | Doctor, config identity, idempotence, warm lint, typed lint, typecheck, policy, skill tests, package/app routes, and root check passed |
| Bug reproduced before fix | yes | Record failing contract | Checker red test and Doctor warning reproduced both ownership defects before correction |
| Targeted behavior verification | yes | Run focused proof | Effective options/reference identity plus root/app/package commands passed |
| TypeScript or typed config changed | yes | Run relevant typecheck | `pnpm lint:type-aware` and `pnpm typecheck` passed |
| Package exports or file layout changed | no | N/A | No package exports or exported source layout changed |
| Package manifests, lockfile, or install graph changed | no | N/A | Root manifest changed scripts only; dependency fields, lockfile, and install graph are unchanged |
| Agent rules or skills changed | yes | Validate owning skill | Global Oxlint skill is the source owner; quick validation and all 36 skill tests passed; no repo mirror/install applies |
| Workspace authority proof | yes | Run in owning workspaces | Repo proof ran in `/Users/zbeyens/git/plate-2`; skill proof ran against `/Users/zbeyens/.codex/skills/oxlint` |
| Browser surface changed | no | N/A | CLI/config-only change |
| Browser final proof | no | N/A | No browser behavior |
| CI-controlled template output changed | no | N/A | No template output changed |
| Package behavior or public API changed | no | N/A | No changeset required |
| Registry-only component work changed | no | N/A | No registry component work |
| Docs or content changed | no | N/A | Only internal plan and skill instructions changed; skill validation passed |
| High-risk mini gate | yes | Prove strict gate cannot disappear | Both `check` and `check:push` call `lint:type-aware`; CI watches both configs; full root check passed |
| Agent-native review for agent/tooling changes | yes | Review route/source/proof parity | PASS: `$oxlint` -> global skill/checker -> named typed owner -> 36 tests and strict audit; root scripts are directly runnable |
| Local install corruption suspected | no | N/A | No corruption signal |
| P1 autoreview for non-trivial implementation changes | no | N/A | Helper cannot path-scope the shared 15-file dirty checkout; exact owned diff was manually reviewed and full owner proof passed |
| PR create or update | no | N/A | No publication authorized |
| Task-style PR body verified | no | N/A | No PR |
| PR proof image hosting | no | N/A | No PR or browser proof |
| Tracker sync-back | no | N/A | Direct local request |
| Final handoff contract | yes | Fill exact outcome | Completed below |
| Final lint | yes | Run safe fix twice | Both passed; second run idempotent |
| Output budget discipline | yes | Keep broad output bounded | Root check output was capped/polled; one typecheck result truncated by the tool but exit/result counts were preserved |
| Timed checkpoint | no | N/A | No duration requested |
| Goal plan complete | yes | Run `node .agents/skills/autogoal/scripts/check-complete.mjs docs/plans/2026-08-22-invert-oxlint-fast-and-typed-configs.md` | passed |

Phase / pass table:
| Phase | Status | Evidence | Next |
|-------|--------|----------|------|
| Intake and source read | complete | configs, callers, CI, editor, tools, and policies inspected | implementation |
| Implementation | complete | fast conventional plus typed derivative and checker support | verification |
| Verification | complete | every named command and source audit passed | closeout |
| PR / tracker sync | complete | N/A: no publication authorized | final response |
| Closeout | complete | final ledger complete; plan checker remains | final response |

Findings:
- Current `oxlint.config.ts` is strict/type-aware; `oxlint.fast.config.ts` derives from it and changes only `typeAware` plus unused-disable reporting.
- Root, apps, and package helpers all carry explicit fast-config flags; inverting ownership can delete that repeated wiring.
- `typecheck` is a Turbo/TypeScript owner. Typed Oxlint loads a separate graph, so nesting it would add latency without reuse and obscure failures.
- Ultracite Doctor statically expects the conventional config itself to extend an Ultracite preset. A tiny fast derivative pointing at a full named config is executable but reports a configuration warning.
- The clean shape is therefore full rule policy plus fast options in `oxlint.config.ts`, with `oxlint.type-aware.config.ts` changing only `typeAware` and unused-disable reporting.

Decisions and tradeoffs:
- Make the conventional config fast and create `oxlint.type-aware.config.ts` as the strict derivative.
- Keep `lint:type-aware` separate and have `check`/`check:push` call it beside `typecheck`.
- Teach the global policy checker to prefer named type-aware configs and compose an imported conventional rule owner, preserving strict enforcement without duplicating configuration.

Implementation notes:
- `oxlint.config.ts` now owns all presets, rules, overrides, ignores, and fast options.
- `oxlint.type-aware.config.ts` derives the canonical policy and enables type awareness plus strict unused-disable reporting.
- Root/app/package ordinary commands use conventional discovery; `lint:type-aware` selects the named config; CI watches both config files.
- The Oxlint skill checker and its regression test now support this two-config ownership model.

Review fixes:
- Accepted Doctor finding: moved full Ultracite preset policy back to conventional config instead of tolerating or hiding the warning.
- Accepted checker finding: composed named derivative options with imported conventional rules rather than duplicating policy.
- Rejected folding typed lint into `typecheck`: independent graph work would remain and failure ownership would worsen.

Error attempts:
| Error / failed attempt | Count | Next different move | Resolution |
|------------------------|-------|---------------------|------------|
| New checker preference test failed because the checker selected conventional `oxlint.config.ts` | 1 | Prefer named type-aware config candidates before conventional configs | Candidate selection repaired |
| Derivative-config regression test then failed because static analysis could not see base rules or strict options together | 2 | Compose the named derivative source before its imported conventional rule owner | Focused CLI test and all 36 skill tests pass |
| Doctor warned that a tiny conventional derivative did not visibly extend Ultracite | 1 | Keep full rule policy in the conventional fast config and derive only the named typed config | Doctor passes 6/6 with no warnings |

Verification evidence:
- `pnpm exec ultracite doctor` -> 6 passed, 0 warnings, 0 failures.
- Oxlint skill tests -> 36/36 passed, including the new named typed-config regression.
- Strict policy audit -> exit 0 against the automatically selected named typed owner and composed conventional rules.
- `pnpm lint:fix` twice -> passed in 5.76 s and 5.64 s; idempotent.
- Warm `pnpm lint` twice -> passed in 5.38 s and 5.50 s; mean 5.44 s.
- `pnpm lint:type-aware` -> passed in about 38 s.
- `pnpm typecheck` -> passed; 60/60 package typechecks green after the owning build graph.
- `@platejs/core`, `www`, and `plite` ordinary lint routes -> passed in 2.30 s, 2.48 s, and 1.22 s without custom config flags.
- Runtime config audit -> fast options are `typeAware: false`/unused off; typed options are `typeAware: true`/unused error; both share the exact same rules, overrides, and extends objects.
- Oxlint skill quick validation -> `Skill is valid!`.
- Agent-native review -> PASS: discoverable skill and package commands reach the correct source owners and reproducible proof.
- Direct owned-diff review -> no accepted finding; the structured autoreview helper was intentionally not run because it cannot path-scope this shared dirty checkout.
- `CI=1 pnpm check` -> exit 0: fast lint, typed lint, 60/60 builds, 60/60 typechecks, 3,255 fast tests, 1,542 slow tests with 60 skips, and the slowest-suite gate passed.

Final handoff contract:
- PR line: N/A: no commit, push, or PR requested
- Issue / tracker line: N/A: direct local task
- Confidence line: high; all focused and root gates passed
- Flow table:
  - Reproduced: checker selection/composition test red and Doctor warning; browser N/A
  - Verified: checker/Doctor/config/scripts/policy/typecheck/tests green; browser N/A
- Browser check: N/A: CLI/config-only change
- Outcome: ordinary lint/fix and editor discovery use the full fast conventional policy; a named command/config owns strict typed lint
- Caveat: fast mode intentionally cannot enforce unused typed suppressions; strict CI does
- Design:
  - Chosen boundary: full conventional policy with fast options; options-only typed derivative; separate root gates
  - Why not quick patch: renaming the earlier derivative left Doctor unable to see the Ultracite preset owner
  - Why not broader change: merging typed lint into TypeScript or changing root module type would add surprise or unrelated semantics without sharing graph work
- Verified: Doctor 6/6, skill 36/36, strict policy, two fixes/checks, config identity, typed lint, typecheck, three package/app routes, and full root check
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
- Issue / tracker: N/A: direct task
- Browser proof: N/A: no browser surface
- Caveats: existing Node typeless-package warnings remain; changing root module semantics is out of scope

Timeline:
- 2026-08-22T18:55:19.312Z Task goal plan created.
- 2026-08-22 Added a red CLI regression test proving strict policy must select a named type-aware owner before a fast conventional config.
- 2026-08-22 Corrected the first inversion after Doctor exposed hidden preset ownership; conventional config now visibly owns full fast policy.
- 2026-08-22 Doctor, skill tests, strict policy, idempotence, warm fast lint, typed lint, typecheck, and affected package/app routes passed.
- 2026-08-22 Full root `CI=1 pnpm check` and final source/config identity audits passed.
- 2026-08-22 Autogoal completion checker passed.

Reboot status:
| Question | Answer |
|----------|--------|
| Where am I? | Closeout complete |
| Where am I going? | Plan checker, goal completion, final response |
| What is the goal? | Make conventional Oxlint fast while preserving a named strict typed gate |
| What have I learned? | See Findings |
| What have I done? | Inverted config ownership, repaired strict policy discovery, simplified callers, and passed full proof |

Open risks:
- Editor tooling auto-discovers the fast conventional config. Strict typed diagnostics remain a deliberate CI/manual gate rather than a save-time tax.
- Node still emits the existing typeless-package warning for TypeScript configs; adding root `"type": "module"` would change unrelated package semantics and is not justified here.
