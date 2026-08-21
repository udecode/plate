# Fix malformed JSDoc spacing

Objective:
Fix malformed double-spaced JSDoc blocks; done when all affected source blocks
are normalized and the bad pattern count is zero.

Flow mode:
one-shot execution

Goal plan:
docs/plans/2026-08-19-fix-malformed-jsdoc-spacing.md

Template:
docs/plans/templates/task.md

Primary template:
docs/plans/templates/task.md

Applied packs:
- none

Task source:
- type: direct user request
- id / link: N/A
- title: Fix all malformed JSDoc formatting
- acceptance criteria: normalize every source JSDoc block damaged by the
  double-newline rewrite; preserve ordinary JSDoc paragraph spacing; verify the
  malformed pattern count is zero; do not run lint or autoreview.

First checkpoint:
- Before implementation or broad exploration, copy every explicit prompt
  requirement into this plan as checkable checkpoints: scope, non-goals,
  timing/duration, stop conditions, deliverables, final handoff sections,
  verification surface, and success criteria.
- Do not continue into implementation until this extraction is complete or
  explicitly marked N/A with reason.

Timed checkpoint:
- requested duration: N/A: no duration requested
- semantics: N/A
- initial confidence score: N/A: exact pattern-count threshold exists
- improvement loop: replace only the malformed blank-line pattern, then audit
  all touched files and rerun the count
- final score / loop closure: zero malformed blocks

Completion threshold:
- Zero matches for top-level JSDoc blocks containing blank physical lines
  between every structural/content line across source paths.
- All 430 malformed blocks across 48 affected files are normalized without
  changing comment text or surrounding code.
- Diff audit shows only blank-line removal inside the malformed JSDoc blocks.
- Task closure is legal only when the source-of-truth acceptance criteria are
  satisfied or explicitly narrowed, required verification evidence is recorded,
  code-review and release-artifact gates are closed when applicable, tracker/PR
  sync is complete or marked N/A with reason, and
  `node .agents/skills/autogoal/scripts/check-complete.mjs docs/plans/2026-08-19-fix-malformed-jsdoc-spacing.md` passes.

Verification surface:
- Source audit: a scoped multiline `rg` count across `packages`, `apps`, and
  `tooling` returns zero malformed blocks.
- Diff audit: inspect changed hunks for the affected files and confirm only the
  malformed blank lines were removed.
- N/A tests/typecheck/browser: comment whitespace only.

Constraints:
- Preserve existing user-facing behavior outside the task scope.
- Prefer the durable ownership boundary over caller-by-caller patches.
- Do not create PRs, comments, commits, or pushes unless the task/user/skill
  requires them.
- Do not add broad ceremony when the task is trivial or docs-only.
- Do not run lint or autoreview in this session.
- Preserve concurrent unrelated edits in the current checkout.

Boundaries:
- Source of truth: current source files plus the focused diff against HEAD.
- Allowed edit scope: malformed JSDoc blank lines in `packages/**`, `apps/**`,
  and `tooling/**`, plus this required goal plan.
- Browser surface: N/A: comments only.
- Browser strategy: N/A. Use Browser for normal app QA; use Chrome directly
  for native downloads, print/print-preview, file picker/uploads, clipboard,
  browser dialogs/permissions, extension/profile state, or exact Chrome
  rendering; use Computer Use only for native Chrome/OS UI that needs visual
  inspection after Chrome automation cannot read it.
- Tracker sync: N/A: no tracker item.
- Non-goals: reformatting unrelated comments, code changes, lint migration
  design changes, commits, pushes, PRs, or public comments.

Output budget strategy:
- Count and list matching files before printing hunks; cap diff samples and use
  per-file/stat summaries instead of streaming whole-repo diffs.

Blocked condition:
- Stop only if malformed and intentional blank-line JSDoc cannot be separated
  mechanically without changing comment content; no such blocker is present.

Task state:
- task_type: mechanical source-format repair
- task_complexity: normal: repo-wide but exact and auditable
- current_phase: closeout
- current_phase_status: complete
- next_phase: final response
- goal_status: complete

Current verdict:
- verdict: valid
- confidence: high: focused diff proves the malformed rewrite and 430 blocks
  across 48 files contain the exact bad pattern
- next owner: task
- reason: compact JSDoc was rewritten with blank physical lines between every
  line; plain Oxfmt preserves but does not originate the pattern from clean input.

Completion rule:
- Do not call `update_goal(status: complete)` while any required checklist item
  remains unchecked. If an item does not apply, check it and add `N/A: <reason>`.
- Do not call `update_goal(status: complete)` until every completion threshold
  above is satisfied, final handoff evidence is recorded, and
  `node .agents/skills/autogoal/scripts/check-complete.mjs docs/plans/2026-08-19-fix-malformed-jsdoc-spacing.md` passes.
- Do not create hook state for this goal. This file plus the active goal are the
  durable state.

Start Gates:
| Gate | Applies | Evidence |
|------|---------|----------|
| Prompt requirements captured before work | yes | Fix all malformed blocks; no lint or autoreview; zero-match proof recorded above |
| Timed checkpoint parsed | no | N/A: no duration requested |
| Skill analysis before edits | yes | `task` plus `autogoal`; no niche implementation skill needed |
| Active goal checked or created | yes | Goal created for this exact zero-match outcome |
| Source of truth read before edits | yes | Focused source and HEAD diff inspected; 430 blocks across 48 affected files counted |
| Tracker comments and attachments read | no | N/A: direct request |
| Video transcript evidence required | no | N/A: no video |
| `docs/solutions` checked for non-trivial existing-code work | no | N/A: exact mechanical whitespace corruption, no architecture decision |
| TDD decision before behavior change or bug fix | no | N/A: comment whitespace only |
| Branch decision for code-changing task | yes | Use current checkout as requested; no branch operation |
| Release artifact decision | no | N/A: no package behavior change |
| Browser tool decision for browser surface | no | N/A: no browser surface |
| PR expectation decision | no | N/A: user requested local fix only |
| Tracker sync expectation decision | no | N/A: no tracker |
| Output budget strategy recorded | yes | Counts/lists first; capped diff inspection |

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
- [x] Implementation fixed the exact malformed output. The lint migration owner
      was deliberately not changed because it is active in another session.
- [x] Release artifact requirement recorded: N/A, comment whitespace only.
- [x] Final handoff shape decided: concise local cleanup count and source-audit proof.
- [x] Branch handling recorded: current checkout, no branch action.
- [x] Local-env-rot retry policy recorded: N/A, no runtime command.
- [x] Workspace authority recorded: source audit ran at `/Users/zbeyens/git/plate-2`.
- [x] High-risk note recorded: N/A, comment whitespace only.
- [x] Review/P1 autoreview target recorded: N/A, user explicitly stopped autoreview.
- [x] Agent-native review recorded: N/A, no agent-native source changes.
- [x] Output budget discipline recorded and followed: broad searches are
      scoped, capped, counted, or artifacted instead of streamed into goal
      context.

Completion Gates:
| Gate | Applies | Required action | Evidence |
|------|---------|-----------------|----------|
| Named verification threshold | yes | Run the named zero-match source audit | `repo_source_malformed_blocks=0` |
| Bug reproduced before fix | yes | Record malformed count before repair | 430 blocks across 48 files |
| Targeted behavior verification | yes | Inspect representative corrected blocks | Correct JSDoc shape confirmed in Core, Plate React, and Plite |
| TypeScript or typed config changed | no | N/A | Comment whitespace only |
| Package exports or file layout changed | no | N/A | No exports or paths changed |
| Package manifests, lockfile, or install graph changed | no | N/A | No manifest changes |
| Agent rules or skills changed | no | N/A | No agent-native source changes |
| Workspace authority proof | yes | Run audit in owning repo | `/Users/zbeyens/git/plate-2`; zero malformed blocks |
| Browser surface changed | no | N/A | Comments only |
| Browser final proof | no | N/A | No browser surface |
| CI-controlled template output changed | no | N/A | `templates/**` untouched |
| Package behavior or public API changed | no | N/A | Comment whitespace only; no changeset |
| Registry-only component work changed | no | N/A | Registry untouched |
| Docs or content changed | no | N/A | Only internal goal plan added; no product docs/content |
| High-risk mini gate | no | N/A | No API/runtime/package/browser/agent contract change |
| Agent-native review for agent/tooling changes | no | N/A | Agent tooling untouched |
| Local install corruption suspected | no | N/A | No runtime failure |
| P1 autoreview for non-trivial implementation changes | no | N/A | User explicitly stopped autoreview; mechanical comment-only repair |
| PR create or update | no | N/A | Local fix only |
| Task-style PR body verified | no | N/A | No PR |
| PR proof image hosting | no | N/A | No PR or browser proof |
| Tracker sync-back | no | N/A | No tracker |
| Final handoff contract | yes | Record local outcome and proof | Filled below |
| Final lint | no | N/A | User explicitly prohibited lint this session |
| Output budget discipline | yes | Keep broad output counted/capped | Counts first; samples capped; no unbounded diff streamed |
| Timed checkpoint | no | N/A | No duration requested |
| Goal plan complete | yes | Run `node .agents/skills/autogoal/scripts/check-complete.mjs docs/plans/2026-08-19-fix-malformed-jsdoc-spacing.md` | Final checker passed after closing the phase row |

Phase / pass table:
| Phase | Status | Evidence | Next |
|-------|--------|----------|------|
| Intake and source read | complete | 430 blocks across 48 files | implementation |
| Implementation | complete | Empty physical lines removed only inside malformed JSDoc blocks | verification |
| Verification | complete | Repo source count zero; `git diff --check` clean | closeout |
| PR / tracker sync | complete | N/A: local request without tracker or PR | final response |
| Closeout | complete | Goal plan mechanically checked | final response |

Findings:
- Initial narrow scan understated the scope. The indentation-aware source audit
  found 430 malformed JSDoc blocks across 48 files.

Decisions and tradeoffs:
- Repair the malformed output only -> preserves concurrent linter migration
  ownership -> the other session must fix its producing codemod/autofix if it
  can rerun.

Implementation notes:
- Removed only physically empty lines inside JSDoc blocks that began with the
  malformed `/**` + empty-line signature. Star-prefixed paragraph separators,
  comment text, indentation, and surrounding code were preserved.

Review fixes:
- None yet.

Error attempts:
| Error / failed attempt | Count | Next different move | Resolution |
|------------------------|-------|---------------------|------------|
| First goal-plan check found `Closeout=in_progress` | 1 | Close the completed phase and rerun | Resolved |

Verification evidence:
- `rg` source audit in `/Users/zbeyens/git/plate-2` ->
  `repo_source_malformed_blocks=0`.
- `git diff --check -- packages apps tooling` -> exit 0 with no output.
- Representative source reads in Core, Plate React, and Plite -> canonical
  multiline JSDoc formatting.

Final handoff contract:
- PR line: N/A: local-only fix
- Issue / tracker line: N/A: no tracker
- Confidence line: high; exact repo-wide source count is zero
- Flow table:
  - Reproduced: source audit found 430 malformed blocks; browser N/A
  - Verified: source audit found zero malformed blocks; browser N/A
- Browser check: N/A: comments only
- Outcome: 430 malformed JSDoc blocks normalized across 48 files
- Caveat: the concurrent lint migration can recreate the damage until its
  producing autofix/codemod is repaired
- Design:
  - Chosen boundary: exact malformed JSDoc signature across repo source
  - Why not quick patch: one-file repair would leave 429 broken blocks
  - Why not broader change: linter migration ownership is active elsewhere
- Verified: zero repo-source matches and clean diff whitespace check
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
- PR: N/A: local-only fix
- Issue / tracker: N/A: no tracker
- Browser proof: N/A: comments only
- Caveats: producing migration step remains owned by the concurrent session

Timeline:
- 2026-08-19T13:25:05.368Z Task goal plan created.
- 2026-08-19 Full source audit counted 430 malformed blocks across 48 files.
- 2026-08-19 Mechanical rewrite normalized all 430 blocks.
- 2026-08-19 Repo source audit returned zero; diff whitespace check passed.

Reboot status:
| Question | Answer |
|----------|--------|
| Where am I? | Closeout |
| Where am I going? | Final mechanical goal check, then final response |
| What is the goal? | Normalize every malformed double-spaced JSDoc block |
| What have I learned? | The damage covered 430 blocks across 48 files |
| What have I done? | Normalized all blocks and proved a zero-match repo source audit |

Open risks:
- The concurrent lint migration may recreate the formatting until its producing
  autofix/codemod is fixed; this task deliberately did not modify that session's
  linter configuration.
