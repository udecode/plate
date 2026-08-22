# implement oxlint next-line cleanup

Objective:
Implement the audited Oxlint suppression cleanup; done when 32 next-line
directives move to correct config ownership, 60 remain inline, no global rule
is disabled, and full repository checks pass.

Flow mode:
one-shot execution

Goal plan:
docs/plans/2026-08-20-implement-oxlint-next-line-cleanup.md

Template:
docs/plans/templates/task.md

Primary template:
docs/plans/templates/task.md

Applied packs:

- none

Task source:

- type: direct user authorization following the completed suppression audit
- id / link: current Codex task; source audit at
  `docs/plans/2026-08-20-audit-oxlint-next-line-suppressions.md`
- title: implement all accepted `oxlint-disable-next-line` cleanup decisions
- acceptance criteria: apply every accepted recommendation; configure
  `prefer-const` rather than disabling it; add the unchecked-JavaScript rule;
  add three exact-file overrides; remove the corresponding directives; do not
  broaden test/global suppression; finish with green config, lint, and full
  repository checks.

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

- Root `prefer-const` remains an error with
  `ignoreReadBeforeAssign: true`; all 21 corresponding directives are gone.
- The existing unchecked-JavaScript override owns
  `typescript/use-unknown-in-catch-callback-variable`; its 2 directives are
  gone.
- Three exact-file overrides own DebugPlugin console output, the keyboard
  contract's module mocking, and the benchmark-source contract's dynamic
  evaluation; their 9 next-line directives and the same benchmark file's one
  matching line directive are gone.
- Exactly 60 active `oxlint-disable-next-line` directives remain. No additional
  global rule is disabled and no broad test override is added.
- The repo-owned config check, Ultracite migration audit and Doctor, safe
  lint/fix idempotence, full `pnpm check`, and P1 autoreview pass with zero
  accepted findings. The generic strict policy parser is advisory because it
  cannot read override-owned rules; its limitation is recorded rather than
  weakening the config to satisfy it.
- Task closure is legal only when the source-of-truth acceptance criteria are
  satisfied or explicitly narrowed, required verification evidence is recorded,
  code-review and release-artifact gates are closed when applicable, tracker/PR
  sync is complete or marked N/A with reason, and
  `node .agents/skills/autogoal/scripts/check-complete.mjs docs/plans/2026-08-20-implement-oxlint-next-line-cleanup.md` passes.

Verification surface:

- Exact source count and stale-directive searches for all 32 accepted rows plus
  the adjacent benchmark line directive.
- `node tooling/scripts/check-oxlint-config.mjs`.
- Ultracite migration audit/policy checks and Doctor.
- `pnpm lint:fix` twice with the second pass idempotent.
- Full `pnpm check` from `/Users/zbeyens/git/plate-2`.
- P1 local autoreview with zero accepted/actionable findings.

Constraints:

- Preserve existing user-facing behavior outside the task scope.
- Prefer the durable ownership boundary over caller-by-caller patches.
- Do not create PRs, comments, commits, or pushes unless the task/user/skill
  requires them.
- Do not add broad ceremony when the task is trivial or docs-only.
- Do not disable any rule globally or add a broad all-tests exception.
- Do not change runtime behavior to satisfy lint; only move previously audited
  exception ownership.
- Preserve all 60 exact source-local exceptions accepted by the audit.

Boundaries:

- Source of truth: completed audit plan, current `oxlint.config.ts`, installed
  Oxlint schema, Ultracite rule policy, and the 92-directive baseline.
- Allowed edit scope: `oxlint.config.ts`, the 20 source files containing the 32
  accepted next-line removals, the benchmark file's adjacent line directive,
  the docs-page generated-boundary owner surfaced by the full fixer, and this
  goal plan. Formatting may touch only what the safe repo fixer owns.
- Browser surface: N/A: comment/config ownership only.
- Browser strategy: N/A.
- Tracker sync: N/A: no tracker or PR requested.
- Non-goals: changing the remaining exceptions, changing runtime/package APIs,
  adding dependencies, or reopening already-audited global policy.

Output budget strategy:

- Use exact rule/path searches and count summaries. Cap check/review output;
  save or inspect only failing slices if a broad command fails.

Blocked condition:

- Block only if the accepted config cannot express the audited ownership or the
  same full-check failure repeats after one evidence-based fix and, for local
  install-corruption signals, one reinstall/rerun.

Task state:

- task_type: tooling/config cleanup
- task_complexity: normal non-trivial
- current_phase: closeout
- current_phase_status: complete
- next_phase: final response
- goal_status: complete

Current verdict:

- verdict: complete; all accepted ownership changes are implemented and green
- confidence: 99%
- next owner: user
- reason: exact source counts, targeted lint/typecheck, two safe-fixer passes,
  the full repository check, migration tooling, and P1 review all closed

Completion rule:

- Do not call `update_goal(status: complete)` while any required checklist item
  remains unchecked. If an item does not apply, check it and add `N/A: <reason>`.
- Do not call `update_goal(status: complete)` until every completion threshold
  above is satisfied, final handoff evidence is recorded, and
  `node .agents/skills/autogoal/scripts/check-complete.mjs docs/plans/2026-08-20-implement-oxlint-next-line-cleanup.md` passes.
- Do not create hook state for this goal. This file plus the active goal are the
  durable state.

Start Gates:
| Gate | Applies | Evidence |
|------|---------|----------|
| Prompt requirements captured before work | yes | “go all” applies every accepted row from the immediately preceding audit; exact scope and stop condition recorded above |
| Timed checkpoint parsed | no | N/A: none requested |
| Skill analysis before edits | yes | task, autogoal, migrate-to-ultracite, full playbook, and full compact policy read |
| Active goal checked or created | yes | no active goal found; new goal follows this completed checkpoint |
| Source of truth read before edits | yes | completed audit ledger, active config, installed schema, and policy read |
| Tracker comments and attachments read | no | N/A: direct request only |
| Video transcript evidence required | no | N/A: no video |
| `docs/solutions` checked for non-trivial existing-code work | no | N/A: this implements a fresh completed source audit, not a behavior pattern decision |
| TDD decision before behavior change or bug fix | no | N/A: no runtime behavior change; count/config proof is the regression surface |
| Branch decision for code-changing task | no | N/A: user requested changes in the current checkout; no branch/PR operation requested |
| Release artifact decision | no | N/A: lint comments/config do not change published behavior |
| Browser tool decision for browser surface | no | N/A: no browser surface |
| PR expectation decision | no | N/A: no PR requested |
| Tracker sync expectation decision | no | N/A: no tracker |
| Output budget strategy recorded | yes | exact searches/counts plus capped check/review output |

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
      Active config, installed rule schema, full audit, and migration policy read.
- [x] Implementation fixes the right ownership boundary, or the narrower choice
      is recorded with reason. Rule configuration owns stable patterns; 13
      genuinely fixable self-references became `const`; exact exceptions remain
      exact-file or source-local.
- [x] Release artifact requirement recorded: changeset, registry changelog, or
      N/A with reason. N/A: no runtime/package/registry behavior change.
- [x] Final handoff shape decided: tooling cleanup with exact counts, full check,
      config/policy proof, and review; PR/tracker/browser N/A.
- [x] Branch handling recorded for code-changing work: dedicated branch used,
      new branch needed, or N/A with reason. N/A: current checkout authorized.
- [x] Local-env-rot retry policy recorded for any surprising repo-wide failure:
      reinstall/rerun evidence or N/A with reason.
- [x] Workspace authority recorded: every proof command names the cwd/tool that
      owns the changed behavior.
- [x] High-risk note recorded for public API, runtime, package-boundary,
      browser behavior, agent-action, or command-contract changes, or marked
      N/A with reason. Risk: overbroad config could hide diagnostics; exact
      count, scoped override, config-policy, lint/check, and review proof own it.
- [x] Review/P1 autoreview target selected from actual diff state for non-trivial
      implementation work: local dirty checkout, `--mode local --max-priority P1`.
- [x] Agent-native review decision recorded for `.agents/**`, `.claude/**`,
      `.codex/**`, skills, hooks, commands, prompts, or user-action tooling.
      N/A: no agent workflow owner changes.
- [x] Output budget discipline recorded and followed: broad searches are
      scoped, capped, counted, or artifacted instead of streamed into goal
      context.

Completion Gates:
| Gate | Applies | Required action | Evidence |
|------|---------|-----------------|----------|
| Named verification threshold | yes | Run the command, proof, source audit, or artifact check named in this plan | 60 directives in 45 files; all named checks green |
| Bug reproduced before fix | no | Record failing test/repro or N/A with reason | N/A: lint ownership cleanup, not a behavior bug |
| Targeted behavior verification | yes | Run focused test/proof for changed behavior or record N/A | targeted Oxlint and affected package typechecks passed |
| TypeScript or typed config changed | yes | Run relevant typecheck | 12/12 Turbo typecheck tasks passed for Plite, Plite React, and Core; full check passed 60/60 |
| Package exports or file layout changed | no | Run `pnpm brl` before final verification and keep generated barrel updates | N/A: no exports or layout changed |
| Package manifests, lockfile, or install graph changed | no | Run `pnpm install` and relevant package checks | N/A: no dependency graph change |
| Agent rules or skills changed | no | Run `pnpm install` and verify generated skill sync | N/A: no agent source changed |
| Workspace authority proof | yes | Run verification in the owning repo/package/app/route/tool and record cwd; do not count the wrong workspace as proof | all proof ran from `/Users/zbeyens/git/plate-2` except the isolated review bundle |
| Browser surface changed | no | Capture Browser proof for normal app surfaces, or Chrome/Computer proof for native browser/OS surfaces | N/A: no browser behavior changed |
| Browser final proof | no | Attach Browser/Chrome/Computer proof or exact caveat when browser proof applies | N/A: config/comment cleanup only |
| CI-controlled template output changed | no | Restore generated template output or record why it is intentionally kept | N/A: no template output changed |
| Package behavior or public API changed | no | Add a changeset or record why no changeset applies | N/A: behavior and APIs unchanged |
| Registry-only component work changed | no | Update `docs/components/changelog.mdx` or record N/A | N/A: no registry component behavior changed |
| Docs or content changed | no | For docs-heavy work, use `--template docs`; for incidental docs, verify source-backed claims, links, examples, and rendered output or record N/A | N/A: only internal goal evidence changed |
| High-risk mini gate | yes | For public API/runtime/package-boundary/browser/agent-action/command-contract changes, record realistic failure mode, proof plan, and why the chosen boundary is right; otherwise N/A | risk was hidden diagnostics; exact scopes, counts, full lint/check, and review prove coverage |
| Agent-native review for agent/tooling changes | no | For `.agents/**`, `.claude/**`, `.codex/**`, skills, hooks, commands, prompts, or user-action tooling, load `.agents/skills/agent-native-reviewer/SKILL.md` and close accepted/actionable findings, or record N/A | N/A: Oxlint config is repo tooling, not agent-action tooling |
| Local install corruption suspected | no | Run `pnpm run reinstall` once, rerun the exact failing command, or record N/A | N/A: no install-corruption signal |
| P1 autoreview for non-trivial implementation changes | yes | Load `.agents/skills/autoreview/SKILL.md`; pass `--max-priority P1` with dirty local `--mode local`, branch/PR `--mode branch --base <base>`, or committed slice `--mode commit --commit <ref>`; fix and rerun within the hard cap of three helper invocations for one unchanged scope, then stop and report any remaining accepted/actionable findings; use P2 or P3 only when explicitly requested, or record N/A for docs-only/trivial/no local patch | final isolated exact-slice run clean, zero findings, 0.91 confidence |
| PR create or update | no | Run `check` before PR work and sync PR body to the task-style final handoff | N/A: no PR requested |
| Task-style PR body verified | no | Verify the PR body with `gh pr view --json body`; it must preserve auto-release blocks when applicable, must not include a current-PR self-link, and must use the kitcn PR #270 emoji format: `🐛 Fixes ...`, `🟢 95-100% confidence`, `Phase / 🧪 Tests / 🌐 Browser` table, and bold emoji Outcome/Caveat/Design/Verified sections | N/A: no PR requested |
| PR proof image hosting | no | If PR body needs browser proof, replace local image paths with hosted GitHub URLs or record N/A | N/A: no PR or browser proof |
| Tracker sync-back | no | Post concise issue/Linear sync after PR exists, or record N/A/blocker | N/A: no tracker |
| Final handoff contract | yes | Fill the final handoff fields below with exact PR/issue/confidence/tests/browser/outcome/caveats/design/verification content or N/A reason | filled below |
| Final lint | yes | Run `pnpm lint:fix` or scoped equivalent | two consecutive `pnpm lint:fix` passes succeeded; final plan formatting check follows |
| Output budget discipline | yes | Verify no unbounded high-volume command output was streamed, or record the accidental output and recovery | full-check output was bounded; audit output was accepted once as evidence |
| Timed checkpoint | no | If duration was requested, keep improving until elapsed, then finish the current loop cleanly; otherwise N/A | N/A: no duration requested |
| Goal plan complete | yes | Run `node .agents/skills/autogoal/scripts/check-complete.mjs docs/plans/2026-08-20-implement-oxlint-next-line-cleanup.md` | passed after recording all gate evidence |

Phase / pass table:
| Phase | Status | Evidence | Next |
|-------|--------|----------|------|
| Intake and source read | complete | audit, config, schema, migration policy, and skills read | implementation |
| Implementation | complete | 32 next-line directives and one adjacent line directive removed; scoped owners added | verification |
| Verification | complete | exact counts, lint/fix, typechecks, Doctor, migration audit, and full check green | closeout |
| PR / tracker sync | complete | N/A: neither requested | final response |
| Closeout | complete | P1 exact-slice review clean | final response |

Findings:

- `ignoreReadBeforeAssign` correctly covers 8 genuinely deferred assignments,
  but 13 self-referential initializers were ordinary `const` candidates. They
  were fixed instead of suppressing the rule.
- Fumadocs' CI-generated types leave every `doc-page.tsx` owner at the existing
  unsafe-type boundary. A stable `apps/www/src/app/**/doc-page.tsx` selector is
  required because the literal bracketed route glob does not match.
- The generic Ultracite strict policy checker parses only the root `rules`
  object. It therefore reports override-owned Next rules as missing and calls
  Plate-specific audited exceptions unknown. The repo structural checker and
  migration audit are the authoritative gates; changing policy to appease this
  parser would make the configuration worse.

Decisions and tradeoffs:

- No rule was disabled globally and no broad test override was added.
- Stable language boundaries use config overrides; one-off semantic exceptions
  remain inline; three unusual exact owners use exact-file overrides.
- Actual fixes beat comments: 13 declarations became `const` after the initial
  rule-option-only approach proved incomplete.

Implementation notes:

- Added `prefer-const: ['error', { ignoreReadBeforeAssign: true }]`.
- Added unchecked-JavaScript ownership for the catch-callback unknown rule.
- Added exact-file ownership for keyboard module mocking, benchmark dynamic
  evaluation, and DebugPlugin console output.
- Folded `doc-page.tsx` into the existing Fumadocs generated-type override and
  removed its file-level suppression.
- Removed 32 audited next-line directives plus the benchmark contract's matching
  line directive. Exactly 60 next-line directives remain.

Review fixes:

- No accepted finding required a fix. The first scoped bundle included unrelated
  DOM-repair work and reported one P1 at line 992; this task touched only the
  deferred declaration near line 148. It was rejected as a different behavior
  owner. The tightened exact cleanup slice passed with zero findings.

Autoreview scope baseline:

- Request: apply every accepted next-line suppression cleanup without weakening
  rules globally or adding a broad test exception.
- Invariant: a suppression belongs at the narrowest stable owner; ordinary
  fixable code remains linted.
- Target: dirty local checkout; no branch or PR operation requested.
- Owner boundary: root Oxlint configuration plus only the audited source files
  and the existing Fumadocs generated-type boundary surfaced by verification.
- Intended behavior: lint ownership changes only; runtime, public API, package,
  security, and user-facing behavior stay unchanged.
- Sibling surface: all occurrences of the moved rules were searched; the 60
  exceptions rejected by the audit stay inline.
- Review classification: only findings that break this lint-ownership invariant
  are in scope; unrelated cleanup is follow-up work.

Error attempts:
| Error / failed attempt | Count | Next different move | Resolution |
|------------------------|-------|---------------------|------------|
| Root option alone left 13 `prefer-const` errors | 1 | Fix declarations that are truly const | Converted all 13 to annotated `const` initializers |
| First `pnpm lint:fix` exposed `doc-page.tsx` unsafe return | 1 | Move its existing generated-type boundary into config | Added stable generated-owner selector and removed file directive |
| Literal bracketed route glob did not match | 1 | Use a stable owner pattern | Replaced it with `apps/www/src/app/**/doc-page.tsx` |
| Generic strict policy checker cannot parse overrides | 1 | Keep repo policy intact and use owner-aware gates | Recorded as an advisory tool limitation; no config weakening |
| Full local autoreview bundle exceeded eight passes | 1 | Isolate the authorized cleanup files | Review bundle reduced to one pass |
| First scoped review included unrelated DOM-repair changes | 1 | Remove unrelated same-file migration work from the bundle | Exact cleanup slice returned zero findings |

Verification evidence:

- Exact audit: 60 active `oxlint-disable-next-line` directives in 45 files;
  zero matching directives remain in the 20 moved-owner files.
- `node tooling/scripts/check-oxlint-config.mjs`: passed; 164 root rules and 147
  selector/rule pairs.
- Targeted Oxlint over every affected owner: passed.
- `pnpm turbo typecheck --filter=./packages/plite --filter=./packages/plite-react --filter=./packages/core`:
  12/12 tasks passed.
- `pnpm lint:fix` passed three times; Oxfmt processed 4,165 files each time and
  the later passes were idempotent.
- `pnpm exec ultracite doctor`: 6 passed, 0 warnings, 0 failed.
- migration audit with `--assert-migrated`: passed with no failures.
- `pnpm check`: passed; 60 builds, 60 typechecks, 3,242 fast tests, and 1,529
  slow tests passed with zero failures (60 slow skips).
- `.agents/skills/autoreview/scripts/autoreview --mode local --max-priority P1`
  on the exact isolated cleanup slice: clean, zero findings, 0.91 confidence.

Final handoff contract:

- PR line: N/A: no PR requested
- Issue / tracker line: N/A: direct local task
- Confidence line: 99%; exact counts and every owning check are green
- Flow table:
  - Reproduced: initial targeted lint retained 13 `prefer-const` failures; browser N/A
  - Verified: full `pnpm check` green; browser N/A
- Browser check: N/A: no browser behavior changed
- Outcome: 92 next-line directives reduced to 60 with no global rule-off
- Caveat: generic strict policy parser is not override-aware; owner-aware gates pass
- Design:
  - Chosen boundary: root option, stable JavaScript/generated patterns, and
    exact-file overrides only where the exception belongs to an exact owner
  - Why not quick patch: repeated local comments hid stable ownership and 13
    declarations were better fixed directly
  - Why not broader change: the remaining 60 exceptions are semantic one-offs;
    moving them would hide unrelated diagnostics
- Verified: exact source audit, structural config check, targeted lint/typecheck,
  two safe fixer passes, Doctor, migration audit, full check, and P1 review
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
- Issue / tracker: N/A: none
- Browser proof: N/A: no browser surface
- Caveats: generic strict policy script is structurally unaware of overrides;
  no product or CI risk remains within this task

Timeline:

- 2026-08-20T11:00:47.331Z Task goal plan created.
- 2026-08-20 Implemented audited config ownership and fixed 13 declarations.
- 2026-08-20 Completed targeted lint/typecheck, two fixer passes, Doctor,
  migration audit, and full repository check.
- 2026-08-20 Completed P1 exact-slice review with zero findings.

Reboot status:
| Question | Answer |
|----------|--------|
| Where am I? | Closeout complete |
| Where am I going? | Final response |
| What is the goal? | Reduce audited next-line comments without weakening lint policy |
| What have I learned? | Rule configuration covered 8 cases; 13 needed real const fixes |
| What have I done? | Implemented every accepted row and closed all owner-aware checks |

Open risks:

- None within task scope. The generic strict policy script has a documented
  parser gap, while the repo-owned structural check and full CI command pass.
