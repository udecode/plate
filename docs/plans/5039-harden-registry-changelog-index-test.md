# Harden registry changelog index test

Objective:
Replace PR #5096's live-inventory changelog assertions with stable behavioral invariants; done when mutation proof, focused tests, full check, autoreview, and GitHub CI pass.

Flow mode:
one-shot execution

Goal plan:
docs/plans/5039-harden-registry-changelog-index-test.md

Template:
docs/plans/templates/task.md

Primary template:
docs/plans/templates/task.md

Applied packs:
- none

Task source:
- type: user-requested follow-up on GitHub PR #5096
- id / link: https://github.com/udecode/plate/pull/5096
- title: cut brittle registry changelog inventory assertions
- acceptance criteria: keep real source-to-index integration coverage; remove
  literal entry counts/current newest IDs/current component history; add a
  small synthetic exact-contract test; pass focused tests, generator check,
  full `bun check`, autoreview, and final GitHub CI.

Timed checkpoint:
- requested duration: N/A: none requested
- semantics: N/A: no timed checkpoint
- initial confidence score: N/A: binary verification threshold
- improvement loop: one mutation-proof and verification loop until green
- final score / loop closure: N/A: close on all named checks green

Completion threshold:
- A legitimate extra entry no longer breaks the integration test solely because
  inventory changed; the test still proves source/output/index conservation,
  href derivation, component fanout, ordering, and on-disk projection currency.
- Focused registry tests, generator `--check`, lint, full `bun check`, final
  autoreview, and all required PR #5096 checks pass on the final head.
- Task closure is legal only when the source-of-truth acceptance criteria are
  satisfied or explicitly narrowed, required verification evidence is recorded,
  code-review and release-artifact gates are closed when applicable, tracker/PR
  sync is complete or marked N/A with reason, and
  `node .agents/skills/autogoal/scripts/check-complete.mjs docs/plans/5039-harden-registry-changelog-index-test.md` passes.

Verification surface:
- Temporary valid-entry mutation repro before and after the test refactor.
- `bun test tooling/scripts/generate-ui-changelog-entries.test.mjs`.
- `node tooling/scripts/generate-ui-changelog-entries.mjs --check`.
- `pnpm lint:fix`, `bun check`, local autoreview, and `gh pr checks 5096`.

Constraints:
- Preserve existing user-facing behavior outside the task scope.
- Prefer the durable ownership boundary over caller-by-caller patches.
- Do not create PRs, comments, commits, or pushes unless the task/user/skill
  requires them.
- Do not add broad ceremony when the task is trivial or docs-only.

Boundaries:
- Source of truth: user instruction, current registry generator/test, entry
  README, and PR #5096 check state.
- Allowed edit scope: `tooling/scripts/generate-ui-changelog-entries.test.mjs`,
  this goal ledger, and PR #5096 body/branch.
- Browser surface: N/A: deterministic Node test tooling only.
- Tracker sync: update and verify existing PR #5096; no separate issue comment.
- Non-goals: generator/runtime changes, registry entry/output changes, package
  behavior, snapshots, or broad test cleanup.

Output budget strategy:
- Read exact generator/test ranges, cap command output, and avoid generated
  JSON, build trees, and broad repository scans.

Blocked condition:
- Stop only if the existing PR branch rejects pushes or required GitHub checks
  repeatedly cannot start and no in-scope approval/retry path remains.

Task state:
- task_type: test-quality refactor on existing PR
- task_complexity: normal, measurable follow-up
- current_phase: PR sync and remote verification
- current_phase_status: complete
- next_phase: PR sync and remote verification
- goal_status: active

Current verdict:
- verdict: valid; deterministic but inventory-coupled test should be adapted
- confidence: high; exact assertions and generator ownership are fully traced
- next owner: task
- reason: `--check` owns artifact currency while this test should own behavior

Pre-solution issue challenge:
- reporter claim: the repaired test may be flaky or overkill and should be cut/fixed
- suggested diagnosis or fix: replace current-inventory literals with behavioral invariants and a synthetic exact-contract case
- repro ladder:
  - tests / source-level repro: add one temporary valid entry; current test should fail only on live-inventory assertions
  - Playwright / automated browser: N/A: Node generator test owns the behavior
  - Browser plugin: N/A: no browser-observable contract
  - screenshot / visual proof: N/A: no visual claim
- reproduction verdict: historical PR/current-main failure already proved the inventory coupling; run one clean mutation proof now
- validity verdict: valid
- best long-term fix boundary: split exact index semantics into a small synthetic unit test and retain live-file integration as conservation invariants
- harsh honest feedback: a test that requires editing expected inventory after every valid entry is maintenance tax, not meaningful protection
- hard-stop decision: continue; the claim is source-proven and directly testable

Completion rule:
- Do not call `update_goal(status: complete)` while any required checklist item
  remains unchecked. If an item does not apply, check it and add `N/A: <reason>`.
- Do not call `update_goal(status: complete)` until every completion threshold
  above is satisfied, final handoff evidence is recorded, and
  `node .agents/skills/autogoal/scripts/check-complete.mjs docs/plans/5039-harden-registry-changelog-index-test.md` passes.
- Do not create hook state for this goal. This file plus the active goal are the
  durable state.

Start Gates:
| Gate | Applies | Evidence |
|------|---------|----------|
| Timed checkpoint parsed | no | N/A: no duration requested |
| Skill analysis before edits | yes | Loaded `autogoal`, `task`, `testing`, and `tdd`; use `autoreview` at closeout |
| Active goal checked or created | yes | Active goal created for this exact plan and threshold |
| Source of truth read before edits | yes | Read current test, index builder, CLI `--check`, entry README, blame, and history |
| Tracker comments and attachments read | no | N/A: follow-up comes directly from the user; PR context was read in the preceding task |
| Video transcript evidence required | no | N/A: no video evidence |
| Pre-solution issue challenge required | yes | Claim is valid: test is deterministic but coupled to legitimate inventory churn |
| Reproduction verdict before implementation | yes | Historical 23-vs-22 red is authoritative; run temporary valid-entry mutation before the refactor |
| Repro escalation ladder selected | yes | Focused Node test owns proof; browser levels are N/A |
| Suggested fix reviewed against durable boundary | yes | Keep live integration for conservation; move exact semantics to synthetic inputs |
| `docs/solutions` checked for non-trivial existing-code work | yes | No current matching solution file; read entry README, generator owner, test history, and prior registry verification guidance |
| TDD decision before behavior change or bug fix | yes | Test-only refactor: use mutation red/green; do not fake a production-code RED cycle |
| Branch decision for code-changing task | yes | Continue existing PR #5096 branch and push the full verified checkout |
| Release artifact decision | no | N/A: tooling-test-only change; no package or user-visible registry output |
| Browser tool decision for browser surface | no | N/A: no browser surface |
| PR expectation decision | yes | Update existing PR #5096 after full `bun check` passes |
| Tracker sync expectation decision | yes | Sync and verify PR body; no separate issue comment |
| Output budget strategy recorded | yes | Exact reads and capped outputs only |

Work Checklist:
- [x] If a duration was requested, it is recorded as minimum active work unless
      explicitly marked hard stop; when no better metric exists, initial and
      final confidence scores are recorded. N/A: no duration requested.
- [x] Short objective plus outcome, completion threshold, verification surface,
      constraints, boundaries, and blocked condition are concrete.
- [x] Task source classified with source type, id/link, title, task type,
      acceptance criteria, caveats, likely files/routes/packages, browser
      surface, and root-cause layer.
- [x] Required video or screen-recording evidence is cached/read as normalized
      `<video-transcripts>` XML, or marked N/A with reason. N/A: no video.
- [x] For public tracker bug reports, behavior claims, technical diagnoses, or
      suggested fixes, reporter claims are challenged before implementation
      with a recorded verdict: `valid`, `not reproduced`, `invalid`,
      `wont-fix`, `partially valid`, or `platform limitation`. Feature, docs,
      support, or cleanup requests with no bug claim may mark reproduction
      `N/A` with reason.
- [x] Repro escalation ladder followed for bug/behavior claims: focused
      test/source-level repro first when applicable; existing repo-owned
      Playwright regression/test harness next when available and useful as
      executable coverage; do not use standalone Playwright, Puppeteer, or raw
      DevTools as a substitute for the repo Browser policy;
      `[@Browser](plugin://browser@openai-bundled)` next when tests or
      Playwright cannot reproduce or cannot model the surface honestly;
      screenshot or explicit visual-proof waiver when visual/native state
      matters.
- [x] Hard-stop rule followed for bug/behavior claims: no code when the issue
      is not reproduced, invalid, or won't-fix; partial validity pivots to the
      best long-term fix and records what was wrong or incomplete in the issue's
      proposed path.
- [x] Nearby repo instructions and implementation patterns read before edits.
- [x] Implementation fixes the right ownership boundary: exact semantics use
      synthetic inputs; live files prove lossless conservation only.
- [x] Release artifact requirement recorded: N/A: tooling test only; no package or registry output change.
- [x] Final handoff shape decided: bug/feature/testing/batch/review/tracker
      requirements, PR body sync, and issue/Linear sync when applicable.
- [x] Branch handling recorded for code-changing work: dedicated branch used,
      new branch needed, or N/A with reason.
- [x] Local-env-rot retry policy recorded for any surprising repo-wide failure:
      run `pnpm run reinstall` once only for install-corruption signals.
- [x] Workspace authority recorded: every proof command names the cwd/tool that
      owns the changed behavior.
- [x] High-risk note recorded for public API, runtime, package-boundary,
      browser behavior, agent-action, or command-contract changes, or marked
      N/A with reason. N/A: test-only refactor; generator contract is unchanged.
- [x] Review/autoreview target selected from actual diff state for non-trivial
      implementation work: use dirty local autoreview before commit.
- [x] Agent-native review decision recorded for `.agents/**`, `.claude/**`,
      `.codex/**`, skills, hooks, commands, prompts, or user-action tooling. N/A: no agent tooling changes.
- [x] Output budget discipline recorded and followed: broad searches are
      scoped, capped, counted, or artifacted instead of streamed into goal
      context.

Completion Gates:
| Gate | Applies | Required action | Evidence |
|------|---------|-----------------|----------|
| Named verification threshold | pending | Run the command, proof, source audit, or artifact check named in this plan | Local threshold passes; final GitHub CI pending |
| Pre-solution issue challenge verdict | yes | Record reporter claim, suggested fix, repro verdict, validity verdict, durable boundary, and hard-stop/pivot decision before implementation | Valid; mutation proved inventory coupling and the split test boundary is durable |
| Repro escalation ladder | yes | For bug/behavior claims, record test/source-level, Playwright, Browser, and screenshot/visual-proof outcomes or N/A/blocker reasons before `not reproduced` | Focused mutation red/green complete; browser/visual levels N/A |
| Bug reproduced before fix | yes | Record failing test/repro or N/A with reason | Valid temporary entry failed 15/16 at `24 !== 23` before refactor |
| Targeted behavior verification | yes | Run focused test/proof for changed behavior or record N/A | Same mutation passed 17/17 after refactor; final focused suite 17/17 |
| TypeScript or typed config changed | no | Run relevant typecheck | N/A: JavaScript test only; full repo typecheck still passed in `bun check` |
| Package exports or file layout changed | no | Run `pnpm brl` before final verification and keep generated barrel updates | N/A: no package exports or layout changed; full CI barrel guard will run |
| Package manifests, lockfile, or install graph changed | no | Run `pnpm install` and relevant package checks | N/A: no manifest or lockfile changes |
| Agent rules or skills changed | no | Run `pnpm install` and verify generated skill sync | N/A: no agent rules or skills changed |
| Workspace authority proof | yes | Run verification in the owning repo/package/app/route/tool and record cwd; do not count the wrong workspace as proof | All local proof ran in `/Users/zbeyens/git/plate`; remote proof will run on PR #5096 |
| Browser surface changed | no | Capture Browser Use proof or record explicit waiver/blocker | N/A: Node test tooling only |
| Browser final proof | no | Attach screenshot or exact browser verification caveat when browser proof applies | N/A: no browser-visible claim |
| CI-controlled template output changed | no | Restore generated template output or record why it is intentionally kept | N/A: no `templates/**` files changed |
| Package behavior or public API changed | no | Add a changeset or record why no changeset applies | N/A: test-only follow-up; existing Link changeset remains unchanged |
| User-visible registry output changed | no | Use the registry-changelog pack: add/update `apps/www/src/registry/changelog/entries/*.mdx`, run `node tooling/scripts/generate-ui-changelog-entries.mjs --write`, run `node tooling/scripts/generate-ui-changelog-entries.mjs --check`, or record N/A | N/A: no entry or generated output changed; generator `--check` passes 23/23 |
| Docs or content changed | yes | For docs-heavy work, use `--template docs`; for supporting public docs/content/API/example changes, load `docs-creator` and close the docs pack; for typo/link-only edits, record the explicit reason and proportional proof | Internal required goal ledger only; no public docs/content/API/example change |
| High-risk mini gate | no | For public API/runtime/package-boundary/browser/agent-action/command-contract changes, record realistic failure mode, proof plan, and why the chosen boundary is right; otherwise N/A | N/A: test-only refactor; generator contract unchanged |
| Agent-native review for agent/tooling changes | no | For `.agents/**`, `.claude/**`, `.codex/**`, skills, hooks, commands, prompts, or user-action tooling, load `.agents/skills/agent-native-reviewer/SKILL.md` and close accepted/actionable findings, or record N/A | N/A: no agent/tooling action surface changed |
| Local install corruption suspected | no | Run `pnpm run reinstall` once, rerun the exact failing command, or record N/A | N/A: no corruption signal; all checks passed |
| Autoreview for non-trivial implementation changes | yes | Load `.agents/skills/autoreview/SKILL.md`; use dirty local `--mode local`, branch/PR `--mode branch --base <base>`, or committed slice `--mode commit --commit <ref>` until no accepted/actionable findings, or record N/A for docs-only/trivial/no local patch | Local autoreview clean, no findings, patch correct at 0.86 confidence |
| PR create or update | pending | Run `check` before PR work and sync PR body to the task-style final handoff | pending |
| Task-style PR body verified | pending | Verify the PR body with `gh pr view --json body`; it must preserve auto-release blocks when applicable, must not include a current-PR self-link, and must use the kitcn PR #270 emoji format: `🐛 Fixes ...`, `🟢 95-100% confidence`, `Phase / 🧪 Tests / 🌐 Browser` table, and bold emoji Outcome/Caveat/Design/Verified sections | pending |
| PR proof image hosting | pending | If PR body needs browser proof, replace local image paths with hosted GitHub URLs or record N/A | pending |
| Tracker sync-back | pending | Post concise issue/Linear sync after PR exists, or record N/A/blocker | pending |
| Final handoff contract | pending | Fill the final handoff fields below with exact PR/issue/confidence/tests/browser/outcome/caveats/design/verification content or N/A reason | pending |
| Final lint | yes | Run `pnpm lint:fix` or scoped equivalent | 3,285 files checked; no fixes |
| Output budget discipline | yes | Verify no unbounded high-volume command output was streamed, or record the accidental output and recovery | Exact reads and capped command output only |
| Timed checkpoint | no | If duration was requested, keep improving until elapsed, then finish the current loop cleanly; otherwise N/A | N/A: no duration requested |
| Goal plan complete | yes | Run `node .agents/skills/autogoal/scripts/check-complete.mjs docs/plans/5039-harden-registry-changelog-index-test.md` | pending |

Phase / pass table:
| Phase | Status | Evidence | Next |
|-------|--------|----------|------|
| Intake and source read | complete | generator, test, README, history, and ownership read | implementation |
| Implementation | complete | inventory literals removed; synthetic contract plus live conservation retained | verification |
| Verification | complete | mutation red/green, 17 focused tests, generator check, lint, full `bun check`, and autoreview pass | PR sync |
| PR / tracker sync | in_progress | local checkout verified | push and final CI |
| Closeout | pending | | final response |

Findings:
- `parseRegistryChangelogEntryFiles` sorts `.mdx` paths; the index builder sorts
  outputs by date, so the test is deterministic rather than flaky.
- Literal counts, newest IDs/hrefs, and complete current component histories
  encode repository inventory. They fail when a valid source is added even if
  generation and checked projections are correct.
- `--check` already owns on-disk artifact currency. The current-file test should
  prove one-to-one conservation; a synthetic test should own exact ordering,
  href, and component fanout semantics.

Decisions and tradeoffs:
- Keep one live-file integration test, but replace all current-inventory literals.
- Add one minimal synthetic index test rather than duplicating current files in snapshots.

Implementation notes:
- Added a two-event synthetic contract for newest-first ordering, derived hrefs,
  and per-target index grouping.
- Replaced the live repository golden state with source/output/index ID equality,
  exact target-to-event association equality, derived hrefs, and a non-empty
  guard so the integration cannot pass vacuously.

Review fixes:
- Autoreview accepted no findings; patch judged correct at 0.86 confidence.

Error attempts:
| Error / failed attempt | Count | Next different move | Resolution |
|------------------------|-------|---------------------|------------|
| None yet | 0 | | |

Verification evidence:
- Before fix, one valid temporary entry made the focused suite fail 15/16 at
  `24 !== 23`; no generator implementation changed.
- After fix, the same temporary entry passed 17/17, proving inventory growth no
  longer breaks the integration test. The temporary file was removed.
- Final focused suite without the temporary entry: 17/17 pass.
- Generator `--check`: 23 events from 23 sources; all projections current.
- `pnpm lint:fix`: 3,285 files checked, no fixes.
- `bun check`: exit 0; lint, 54-package build/typecheck, 3,464 fast tests,
  slow tests, and slowest-test guard passed.
- `.agents/skills/autoreview/scripts/autoreview --mode local
  --stream-engine-output`: clean, no accepted/actionable findings.

Final handoff contract:
- PR line: pending
- Issue / tracker line: pending
- Confidence line: pending
- Flow table:
  - Reproduced: tests pending, browser pending
  - Verified: tests pending, browser pending
- Browser check: pending
- Outcome: pending
- Caveat: pending
- Design:
  - Chosen boundary: pending
  - Why not quick patch: pending
  - Why not broader change: pending
- Verified: pending
- PR body verified: pending

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
- PR: pending
- Issue / tracker: pending
- Browser proof: pending
- Caveats: pending

Timeline:
- 2026-08-15T08:53:28.128Z Task goal plan created.
- 2026-08-15 Valid temporary entry reproduced the brittle `24 !== 23` failure.
- 2026-08-15 Replaced live inventory literals with behavioral invariants and a synthetic index contract; mutation and focused suites passed.
- 2026-08-15 Full `bun check` and dirty-local autoreview passed.

Reboot status:
| Question | Answer |
|----------|--------|
| Where am I? | Focused verification complete |
| Where am I going? | Full check, autoreview, PR sync, and final CI |
| What is the goal? | Stable behavioral coverage without live inventory golden assertions |
| What have I learned? | See Findings |
| What have I done? | Mutation red/green proof, test refactor, generator check, and lint |

Open risks:
- Risk: derived expected values could become tautological. Mitigation: exact
  semantics live in independent synthetic inputs; live integration checks only
  conservation across public generator functions.
