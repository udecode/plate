# Simplify typed Oxlint lane

Objective:
Use one Oxlint config; done when the typed lane uses atomic CLI flags, the named typed config and checker workaround are removed, and focused policy/lint proof passes.

Flow mode:
one-shot execution

Goal plan:
docs/plans/2026-08-22-simplify-typed-oxlint-lane.md

Template:
docs/plans/templates/task.md

Primary template:
docs/plans/templates/task.md

Applied packs:
- agent-native (docs/plans/templates/packs/agent-native.md)

Task source:
- type: direct user follow-up
- id / link: this Codex task
- title: Simplify the typed Oxlint lane
- acceptance criteria: keep the conventional lane fast; enable type-aware rules
  and unused-disable errors together through CLI flags; remove the redundant
  typed config; revert the checker/skill workaround created only for that file;
  preserve unrelated changes; do not commit or push; prove focused lint and
  strict config policy.

First checkpoint:
- Before implementation or broad exploration, copy every explicit prompt
  requirement into this plan as checkable checkpoints: scope, non-goals,
  timing/duration, stop conditions, deliverables, final handoff sections,
  verification surface, and success criteria.
- Do not continue into implementation until this extraction is complete or
  explicitly marked N/A with reason.

Timed checkpoint:
- requested duration: N/A: none requested
- semantics: N/A: no timed checkpoint
- initial confidence score: N/A: binary command threshold
- improvement loop: rerun the exact failing owner until focused gates pass
- final score / loop closure: N/A: binary command threshold

Completion threshold:
- Exactly one repository Oxlint config remains; `lint:type-aware` enables
  `--type-aware` and
  `--report-unused-disable-directives-severity=error` atomically; CI watches
  only the surviving config; the temporary named-config support is removed
  from the global Oxlint skill/checker/tests; fast lint, typed lint, strict
  policy, and focused checker tests pass.
- Task closure is legal only when the source-of-truth acceptance criteria are
  satisfied or explicitly narrowed, required verification evidence is recorded,
  code-review and release-artifact gates are closed when applicable, tracker/PR
  sync is complete or marked N/A with reason, and
  `node .agents/skills/autogoal/scripts/check-complete.mjs docs/plans/2026-08-22-simplify-typed-oxlint-lane.md` passes.

Verification surface:
- `pnpm lint:fix`, `pnpm lint`, `pnpm lint:type-aware`.
- `node /Users/zbeyens/.codex/skills/oxlint/scripts/check-config-policy.mjs /Users/zbeyens/git/plate-2 --strict`.
- Focused global Oxlint checker tests and source audits for stale named-config
  references.

Constraints:
- Preserve existing user-facing behavior outside the task scope.
- Prefer the durable ownership boundary over caller-by-caller patches.
- Do not create PRs, comments, commits, or pushes unless the task/user/skill
  requires them.
- Do not add broad ceremony when the task is trivial or docs-only.
- Preserve the repository's justified lint policy and all unrelated checkout
  changes.
- Do not commit, push, change React Compiler build integration, or alter
  production behavior.

Boundaries:
- Source of truth: root Oxlint/package/CI files plus the global Oxlint skill and
  deterministic checker changed by the superseded named-config design.
- Allowed edit scope: `oxlint.config.ts`, `oxlint.type-aware.config.ts`,
  `package.json`, relevant CI path filters, the global Oxlint skill/checker/test,
  and this goal plan.
- Browser surface: N/A: tooling-only change.
- Browser strategy: N/A. Use Browser for normal app QA; use Chrome directly
  for native downloads, print/print-preview, file picker/uploads, clipboard,
  browser dialogs/permissions, extension/profile state, or exact Chrome
  rendering; use Computer Use only for native Chrome/OS UI that needs visual
  inspection after Chrome automation cannot read it.
- Tracker sync: N/A: no tracker or PR requested.
- Non-goals: rule-policy changes, dependency changes, product/runtime changes,
  broad CI work, commits, and pushes.

Output budget strategy:
- Read exact files and scoped diffs only; cap command output; use `rg` only for
  named config/flag references and counts; exclude generated/build output.

Blocked condition:
- Stop only if the installed Oxlint CLI rejects the paired flags or a required
  shared file contains overlapping user changes that cannot be preserved.

Task state:
- task_type: tooling configuration simplification
- task_complexity: micro
- current_phase: closeout
- current_phase_status: complete
- next_phase: final response
- goal_status: active

Current verdict:
- verdict: replace the second config with paired CLI overrides and remove its
  one-off checker support
- confidence: high; both lint lanes, strict policy, checker tests, doctor, and
  idempotence passed
- next owner: user
- reason: the redundant config and its filename-specific support are gone; no
  in-scope gate remains

Completion rule:
- Do not call `update_goal(status: complete)` while any required checklist item
  remains unchecked. If an item does not apply, check it and add `N/A: <reason>`.
- Do not call `update_goal(status: complete)` until every completion threshold
  above is satisfied, final handoff evidence is recorded, and
  `node .agents/skills/autogoal/scripts/check-complete.mjs docs/plans/2026-08-22-simplify-typed-oxlint-lane.md` passes.
- Do not create hook state for this goal. This file plus the active goal are the
  durable state.

Start Gates:
| Gate | Applies | Evidence |
|------|---------|----------|
| Prompt requirements captured before work | yes | One config; atomic typed CLI flags; remove named config and filename-specific checker support; preserve unrelated changes; no commit/push; focused proof |
| Timed checkpoint parsed | no | N/A: no duration requested |
| Skill analysis before edits | yes | Read the global Oxlint and repo Autogoal skills completely; one-time migration references do not apply to this ordinary config cut |
| Active goal checked or created | yes | `get_goal` returned no active goal; goal creation follows this requirement checkpoint |
| Source of truth read before edits | yes | Read root config, named config, package scripts, CI filters, global Oxlint skill, checker, and checker CLI tests |
| Tracker comments and attachments read | no | N/A: direct local tooling request |
| Video transcript evidence required | no | N/A: no video |
| `docs/solutions` checked for non-trivial existing-code work | no | N/A: micro configuration cut with exact owners already identified |
| TDD decision before behavior change or bug fix | yes | Add focused checker regression for the generalized atomic CLI contract; no product behavior changes |
| Branch decision for code-changing task | no | N/A: no git branch/commit/PR requested |
| Release artifact decision | no | N/A: internal tooling only; no package/public API change |
| Browser tool decision for browser surface | no | N/A: lint tooling only |
| PR expectation decision | no | N/A: user did not request PR/commit/push |
| Tracker sync expectation decision | no | N/A: no tracker target |
| Output budget strategy recorded | yes | Exact-file reads/diffs and scoped `rg`; capped output |
| Agent-native pack selected | yes | Global Oxlint skill/checker behavior is being reverted |
| Agent-facing action surface identified | yes | Global Oxlint skill config-audit guidance and checker CLI |
| Source rule versus generated mirror boundary identified | yes | Global skill files are direct source; repo `.agents` generated mirrors are not edited |
| `agent-native-reviewer` loaded or waiver recorded | yes | Read the reviewer skill completely; capability map passes after tightening atomic command-segment detection |

Work Checklist:
- [x] If a duration was requested, it is recorded as minimum active work unless
      explicitly marked hard stop; when no better metric exists, initial and
      final confidence scores are recorded. N/A: none requested.
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
- [x] Release artifact requirement recorded: N/A: no package behavior/public API
      change, so no changeset or registry changelog.
- [x] Final handoff shape decided: concise tooling outcome, exact lint/policy
      proof, timings, and unrun broad gates; no PR/tracker fields apply.
- [x] Branch handling recorded: N/A: user requested local edits only, with no
      branch/commit/PR action.
- [x] Local-env-rot retry policy recorded: N/A: no install-corruption signal or
      surprising repo failure occurred.
- [x] Workspace authority recorded: repository commands ran from
      `/Users/zbeyens/git/plate-2`; global checker tests ran against the direct
      skill source under `/Users/zbeyens/.codex/skills/oxlint`.
- [x] High-risk note recorded for public API, runtime, package-boundary,
      browser behavior, agent-action, or command-contract changes, or marked
      N/A with reason. The command-contract failure mode was split flags or a
      checker false pass; same-segment detection plus positive/negative tests
      proves the chosen command boundary.
- [x] Review/P1 autoreview target selected: N/A for this micro configuration cut;
      the required focused agent-native review was performed instead.
- [x] Agent-native review decision recorded: required and completed because the
      global Oxlint skill/checker changed.
- [x] Output budget discipline recorded and followed: broad searches are
      scoped, capped, counted, or artifacted instead of streamed into goal
      context. Exact files and scoped `rg` were used; one strict JSON report was
      summarized after capture.
- [x] Agent-native pack: direct global skill/checker source was edited; no generated repo mirror was touched.
- [x] Agent-native pack: the strict CLI pairing is discoverable in the global Oxlint skill's Config audit section.
- [x] Agent-native pack: generated mirrors are N/A because no `.agents/rules/**` source changed.
- [x] Agent-native pack: the one accepted robustness finding was fixed and proved by a negative regression test.

Completion Gates:
| Gate | Applies | Required action | Evidence |
|------|---------|-----------------|----------|
| Named verification threshold | yes | Run the command, proof, source audit, or artifact check named in this plan | Fast/typed lint, strict checker, checker tests, doctor, idempotence, formatting, and stale-reference audit all pass |
| Bug reproduced before fix | no | Record failing test/repro or N/A with reason | N/A: configuration simplification, not a behavior bug |
| Targeted behavior verification | yes | Run focused test/proof for changed behavior or record N/A | Checker CLI tests pass 4/4, including positive and false-atomic negative rows |
| TypeScript or typed config changed | yes | Run relevant typecheck | `pnpm lint:type-aware` passes twice; this directly loads and validates the TypeScript Oxlint config plus typed rule graph |
| Package exports or file layout changed | no | Run `pnpm brl` before final verification and keep generated barrel updates | N/A: no package export/source layout change |
| Package manifests, lockfile, or install graph changed | no | Run `pnpm install` and relevant package checks | N/A: only a package script changed; dependencies, lockfile, and install graph are untouched |
| Agent rules or skills changed | no | Run `pnpm install` and verify generated skill sync | N/A: direct global skill source changed; no repo-generated `.agents` mirror or install sync applies |
| Workspace authority proof | yes | Run verification in the owning repo/package/app/route/tool and record cwd; do not count the wrong workspace as proof | Repo lint ran in `/Users/zbeyens/git/plate-2`; checker tests and formatting targeted `/Users/zbeyens/.codex/skills/oxlint` directly |
| Browser surface changed | no | Capture Browser proof for normal app surfaces, or Chrome/Computer proof for native browser/OS surfaces | N/A: lint tooling only |
| Browser final proof | no | Attach Browser/Chrome/Computer proof or exact caveat when browser proof applies | N/A: no browser surface |
| CI-controlled template output changed | no | Restore generated template output or record why it is intentionally kept | N/A: no template output touched |
| Package behavior or public API changed | no | Add a changeset or record why no changeset applies | N/A: tooling command only |
| Registry-only component work changed | no | Update `docs/components/changelog.mdx` or record N/A | N/A: no registry component |
| Docs or content changed | yes | For docs-heavy work, use `--template docs`; for incidental docs, verify source-backed claims, links, examples, and rendered output or record N/A | Global skill guidance and this plan are incidental; Oxfmt check passes and source wording matches tested behavior |
| High-risk mini gate | yes | For public API/runtime/package-boundary/browser/agent-action/command-contract changes, record realistic failure mode, proof plan, and why the chosen boundary is right; otherwise N/A | Failure mode: split commands falsely pass or typed suppressions look unused in fast mode. Same-segment checker tests and two typed runs pass; package script is the CLI override owner |
| Agent-native review for agent/tooling changes | yes | For `.agents/**`, `.claude/**`, `.codex/**`, skills, hooks, commands, prompts, or user-action tooling, load `.agents/skills/agent-native-reviewer/SKILL.md` and close accepted/actionable findings, or record N/A | Reviewer skill read; capability map passes after accepted same-command-segment fix |
| Local install corruption suspected | no | Run `pnpm run reinstall` once, rerun the exact failing command, or record N/A | N/A: no corruption signal |
| P1 autoreview for non-trivial implementation changes | no | Load `.agents/skills/autoreview/SKILL.md`; pass `--max-priority P1` with dirty local `--mode local`, branch/PR `--mode branch --base <base>`, or committed slice `--mode commit --commit <ref>`; fix and rerun within the hard cap of three helper invocations for one unchanged scope, then stop and report any remaining accepted/actionable findings; use P2 or P3 only when explicitly requested, or record N/A for docs-only/trivial/no local patch | N/A: micro tooling cut; focused agent-native review covers the changed action surface |
| PR create or update | no | Run `check` before PR work and sync PR body to the task-style final handoff | N/A: no PR requested |
| Task-style PR body verified | no | Verify the PR body with `gh pr view --json body`; it must preserve auto-release blocks when applicable, must not include a current-PR self-link, and must use the kitcn PR #270 emoji format: `🐛 Fixes ...`, `🟢 95-100% confidence`, `Phase / 🧪 Tests / 🌐 Browser` table, and bold emoji Outcome/Caveat/Design/Verified sections | N/A: no PR |
| PR proof image hosting | no | If PR body needs browser proof, replace local image paths with hosted GitHub URLs or record N/A | N/A: no PR/browser proof |
| Tracker sync-back | no | Post concise issue/Linear sync after PR exists, or record N/A/blocker | N/A: no tracker target |
| Final handoff contract | yes | Fill the final handoff fields below with exact PR/issue/confidence/tests/browser/outcome/caveats/design/verification content or N/A reason | Filled below |
| Final lint | yes | Run `pnpm lint:fix` or scoped equivalent | Two `pnpm lint:fix` and two `pnpm lint` runs pass; second run proves idempotence |
| Output budget discipline | yes | Verify no unbounded high-volume command output was streamed, or record the accidental output and recovery | Exact reads and scoped searches used; strict JSON captured then summarized |
| Timed checkpoint | no | If duration was requested, keep improving until elapsed, then finish the current loop cleanly; otherwise N/A | N/A: no duration requested |
| Goal plan complete | yes | Run `node .agents/skills/autogoal/scripts/check-complete.mjs docs/plans/2026-08-22-simplify-typed-oxlint-lane.md` | Passed after final evidence update |
| Agent source / generated sync | no | Run `pnpm install` when `.agents/rules/**` changed and verify generated mirrors | N/A: no `.agents/rules/**` change |
| Agent action discoverability | yes | Source-audit the skill/rule path an agent will read | Global Oxlint skill Config audit names the paired CLI contract and strict checker behavior |
| Agent-native review | yes | Load `.agents/skills/agent-native-reviewer/SKILL.md` and close accepted findings, or record N/A | Loaded; one P1 robustness finding accepted, fixed, and regression-tested; no remaining finding |

Phase / pass table:
| Phase | Status | Evidence | Next |
|-------|--------|----------|------|
| Intake and source read | completed | Read exact repo/global owners and extracted requirements | implementation |
| Implementation | completed | One config, paired CLI command, CI cleanup, generalized checker/skill contract | verification |
| Verification | completed | All named lint, policy, doctor, formatting, test, source-audit, and idempotence gates pass | closeout |
| PR / tracker sync | completed | N/A: no PR/tracker requested | final response |
| Closeout | completed | Plan and final evidence complete | final response |

Findings:
- The fast config intentionally omits typed rules, so unused-disable checking
  must remain off there or valid typed suppressions look unused.
- Oxlint 1.79 supports both required CLI flags and states CLI options override
  config values; the exact paired command already passed in the current repo.
- The strict skill checker previously read only config source. Supporting this
  clean layout requires recognizing the paired flags in one root script, not a
  second filename or derived-config composition.

Decisions and tradeoffs:
- Keep one fast config and make the typed lane atomic at the command boundary.
- Replace the global checker's named-file special case with a general paired-CLI
  policy and explicit report field; accepting either flag separately would let
  incomplete rule loading produce false unused-directive failures.

Implementation notes:
- None yet.

Review fixes:
- [P1 policy-proof robustness] The checker initially accepted both flags
  anywhere in one script, so two separate Oxlint commands joined with `&&`
  could launder the atomic guarantee. Accepted: require the Oxlint executable
  and both flags in one shell command segment; add a negative regression row.

Error attempts:
| Error / failed attempt | Count | Next different move | Resolution |
|------------------------|-------|---------------------|------------|
| Initial multi-file patch used the wrong exported function signature | 1 | Read the exact declaration and reapply narrow hunks | Resolved; no partial patch was applied |

Verification evidence:
- `pnpm exec ultracite doctor` in Plate repo -> 6 passed, 0 warnings, 0 failed;
  Ultracite 7.10.6, Oxlint 1.79.0, Oxfmt 0.64.0.
- `pnpm lint:fix` -> passed twice; second run made no further required change.
- `pnpm lint` -> passed twice; warm timings 5.26s and 5.50s.
- `pnpm lint:type-aware` -> passed twice with atomic flags; warm timings 38.65s
  and 41.37s; zero unused-disable failures.
- Global checker CLI tests -> 4/4 passed, including paired-command acceptance
  and split-command rejection.
- Strict policy checker -> exit 0; surviving `oxlint.config.ts`; enforcement
  source `lint:type-aware`; zero missing reasons, local config overrides, test
  directives, and unbounded directives.
- Oxfmt check on the three changed global skill/checker files -> passed.
- Source audit -> named typed config absent; zero stale
  `oxlint.type-aware.config` / `oxlint-type.config` references; CI no longer
  watches the removed file; `git diff --check` passed for scoped repo files.
- Goal-plan mechanical checker -> passed after final evidence update.

Final handoff contract:
- PR line: N/A: no PR requested
- Issue / tracker line: N/A: no tracker target
- Confidence line: high; all scoped gates pass twice where idempotence matters
- Flow table:
  - Reproduced: checker negative regression rejects split command flags; browser N/A
  - Verified: checker 4/4, strict audit, doctor, fast lint twice, typed lint twice; browser N/A
- Browser check: N/A: no browser surface
- Outcome: one fast config and one atomic typed CLI command; redundant named
  config and filename-specific support removed
- Caveat: full repository typecheck/tests/build were not rerun because no
  product, type, dependency, or build source changed
- Design:
  - Chosen boundary: root package script owns strict typed CLI overrides;
    conventional config owns the fast rule set; global checker recognizes the
    general atomic command contract
  - Why not quick patch: leaving the second config would preserve duplicate
    state and filename-specific checker machinery
  - Why not broader change: typed rules remain valuable and stay in the root
    check/typecheck lane; no rule policy or build integration needed changing
- Verified: exact commands and results are listed above
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
- PR: N/A: no PR requested
- Issue / tracker: N/A: no tracker target
- Browser proof: N/A: tooling-only
- Caveats: full repository typecheck/tests/build not rerun

Timeline:
- 2026-08-22T19:21:15.668Z Task goal plan created.
- 2026-08-22 Read the exact config, script, CI, skill, checker, and test owners.
- 2026-08-22 Replaced the named config with paired CLI flags and removed stale
  CI/filename-specific checker paths.
- 2026-08-22 Generalized strict policy recognition and added positive/negative
  checker tests; agent-native review tightened same-command-segment proof.
- 2026-08-22 Completed doctor, two safe fix/check passes, two typed passes,
  strict policy, formatting, checker tests, and stale-reference audit.

Reboot status:
| Question | Answer |
|----------|--------|
| Where am I? | Closeout complete |
| Where am I going? | Final response |
| What is the goal? | One fast Oxlint config plus atomic strict typed CLI enforcement |
| What have I learned? | Unused-directive checking must load the same typed rules as the suppressions it audits |
| What have I done? | Removed the redundant config, generalized checker policy, fixed the review finding, and passed all scoped gates |

Open risks:
- None in scope. Full product CI was not rerun because this packet changes only
  lint command/config ownership.
