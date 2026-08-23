# Mark rejected Oxlint re-enables P0

Objective:
Mark every rejected Oxlint re-enable candidate as P0 with a durable retry guard; done when all six reasons are explicit and strict policy plus lint pass.

Flow mode:
one-shot execution

Goal plan:
docs/plans/2026-08-22-mark-rejected-oxlint-re-enables-p0.md

Template:
docs/plans/templates/task.md

Primary template:
docs/plans/templates/task.md

Applied packs:
- none

Task source:
- type: direct user correction
- id / link: `oxlint.config.ts`
- title: Mark rejected Oxlint re-enables P0
- acceptance criteria: all six reverted candidates use `[P0 re-enable-rejected]` reasons that name the semantic/ownership failure; no rule state changes; strict policy and lint pass

First checkpoint:
- Before implementation or broad exploration, copy every explicit prompt
  requirement into this plan as checkable checkpoints: scope, non-goals,
  timing/duration, stop conditions, deliverables, final handoff sections,
  verification surface, and success criteria.
- Do not continue into implementation until this extraction is complete or
  explicitly marked N/A with reason.
- [x] Upgrade every reverted candidate to P0 so a later audit does not retry it without changed owner evidence.
- [x] Preserve the actual semantic reason; do not use error count, churn, or style as justification.
- [x] Change comments only: no rule severity, source, test, dependency, API, build, or runtime change.
- [x] Verify the six exact rules, strict config policy, and lint. Do not commit or push.

Timed checkpoint:
- requested duration: none
- semantics: N/A: no duration requested
- initial confidence score: N/A: binary six-rule audit
- improvement loop: N/A: one comment-only packet
- final score / loop closure: all six reasons present and both checks green

Completion threshold:
- The comments immediately above `typescript/strict-boolean-expressions`, `typescript/no-unnecessary-type-parameters`, `typescript/no-unnecessary-condition`, `import/no-cycle`, `typescript/no-unsafe-return`, and `typescript/no-unsafe-assignment` all start `[P0 re-enable-rejected]`, preserve concrete semantic evidence, and the strict policy audit plus lint pass.
- Task closure is legal only when the source-of-truth acceptance criteria are
  satisfied or explicitly narrowed, required verification evidence is recorded,
  code-review and release-artifact gates are closed when applicable, tracker/PR
  sync is complete or marked N/A with reason, and
  `node .agents/skills/autogoal/scripts/check-complete.mjs docs/plans/2026-08-22-mark-rejected-oxlint-re-enables-p0.md` passes.

Verification surface:
- Focused source audit in `oxlint.config.ts` for the six rule/comment pairs.
- Strict Oxlint config-policy checker and `pnpm lint`.

Constraints:
- Preserve existing user-facing behavior outside the task scope.
- Prefer the durable ownership boundary over caller-by-caller patches.
- Do not create PRs, comments, commits, or pushes unless the task/user/skill
  requires them.
- Do not add broad ceremony when the task is trivial or docs-only.
- Do not change any rule severity or option, production/test source, or unrelated user work.

Boundaries:
- Source of truth: user correction, the completed rule audit, Oxlint skill policy, and the six existing global-off reasons.
- Allowed edit scope: six comments in `oxlint.config.ts` and this micro execution ledger.
- Browser surface: none.
- Browser strategy: N/A: comments and lint policy only.
- Tracker sync: N/A: no tracker.
- Non-goals: re-auditing rule diagnostics, changing severities/options, source fixes, dependencies, builds, browser proof, PR, commit, or push.

Output budget strategy:
- Read only the six exact config matches and cap checker/lint output; no broad repository search.

Blocked condition:
- Stop only if the config no longer contains a named candidate or strict policy rejects the required P0 marker and no equivalent valid marker exists.

Task state:
- task_type: lint configuration policy correction
- task_complexity: micro
- current_phase: closeout
- current_phase_status: complete
- next_phase: none
- goal_status: complete

Current verdict:
- verdict: apply `[P0 re-enable-rejected]` to all six reverted candidates
- confidence: high
- next owner: none
- reason: the prior forced audit demonstrated durable semantic or owner conflicts, so a generic reason invites wasted re-audits

Completion rule:
- Do not call `update_goal(status: complete)` while any required checklist item
  remains unchecked. If an item does not apply, check it and add `N/A: <reason>`.
- Do not call `update_goal(status: complete)` until every completion threshold
  above is satisfied, final handoff evidence is recorded, and
  `node .agents/skills/autogoal/scripts/check-complete.mjs docs/plans/2026-08-22-mark-rejected-oxlint-re-enables-p0.md` passes.
- Do not create hook state for this goal. This file plus the active goal are the
  durable state.

Start Gates:
| Gate | Applies | Evidence |
|------|---------|----------|
| Prompt requirements captured before work | yes | First checkpoint records P0 retry guards, comment-only scope, checks, and no commit/push. |
| Timed checkpoint parsed | no | N/A: no duration requested. |
| Skill analysis before edits | yes | Read Oxlint and Autogoal completely; inspected relevant rule-policy entries. |
| Active goal checked or created | yes | `get_goal` returned none; create after this filled shell. |
| Source of truth read before edits | yes | User correction, existing six comments, prior completed audit, and relevant shared policy read. |
| Tracker comments and attachments read | no | N/A: no tracker. |
| Video transcript evidence required | no | N/A: no video. |
| `docs/solutions` checked for non-trivial existing-code work | no | N/A: comment-only micro correction. |
| TDD decision before behavior change or bug fix | no | N/A: no behavior changes. |
| Branch decision for code-changing task | no | N/A: continue current checkout; user requested no commit/push. |
| Release artifact decision | no | N/A: lint comments are not published package behavior. |
| Browser tool decision for browser surface | no | N/A: no browser surface. |
| PR expectation decision | no | N/A: no PR requested. |
| Tracker sync expectation decision | no | N/A: no tracker. |
| Output budget strategy recorded | yes | Six exact matches only; capped command output. |

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
- [x] Required video or screen-recording evidence is N/A: no video was provided.
      `<video-transcripts>` XML, or marked N/A with reason.
- [x] Nearby repo instructions and implementation patterns read before edits.
- [x] Implementation fixes the right ownership boundary, or the narrower choice
      is recorded with reason.
- [x] Release artifact is N/A: comments do not change published behavior.
      N/A with reason.
- [x] Final handoff shape decided: concise config verification; PR/tracker N/A.
      requirements, PR body sync, and issue/Linear sync when applicable.
- [x] Branch handling is N/A: no branch, commit, or push requested.
      new branch needed, or N/A with reason.
- [x] Local-env-rot retry is N/A unless a surprising install failure appears.
      reinstall/rerun evidence or N/A with reason.
- [x] Workspace authority recorded: every proof command names the cwd/tool that
      owns the changed behavior.
- [x] High-risk note is N/A: comment-only config metadata.
      browser behavior, agent-action, or command-contract changes, or marked
      N/A with reason.
- [x] P1 autoreview is N/A: trivial comment-only change; strict policy owns review.
      implementation work, or marked N/A with reason.
- [x] Agent-native review is N/A: no agent/tooling instruction source changed.
      `.codex/**`, skills, hooks, commands, prompts, or user-action tooling.
- [x] Output budget discipline recorded and followed: broad searches are
      scoped, capped, counted, or artifacted instead of streamed into goal
      context.

Completion Gates:
| Gate | Applies | Required action | Evidence |
|------|---------|-----------------|----------|
| Named verification threshold | yes | Run the command, proof, source audit, or artifact check named in this plan | Six exact rule/comment pairs use `[P0 re-enable-rejected]`; strict policy and lint passed. |
| Bug reproduced before fix | no | Record failing test/repro or N/A with reason | N/A: policy metadata correction, not a behavior bug. |
| Targeted behavior verification | no | Run focused test/proof for changed behavior or record N/A | N/A: no behavior changed; exact source audit verifies the metadata. |
| TypeScript or typed config changed | no | Run relevant typecheck | N/A: only comments in executable config changed; loading it through `pnpm lint` is the relevant proof. |
| Package exports or file layout changed | no | Run `pnpm brl` before final verification and keep generated barrel updates | N/A: no package files changed. |
| Package manifests, lockfile, or install graph changed | no | Run `pnpm install` and relevant package checks | N/A: no dependency files changed. |
| Agent rules or skills changed | no | Run `pnpm install` and verify generated skill sync | N/A: no agent source changed. |
| Workspace authority proof | yes | Run verification in the owning repo/package/app/route/tool and record cwd; do not count the wrong workspace as proof | Strict checker and `pnpm lint` ran from `/Users/zbeyens/git/plate-2`. |
| Browser surface changed | no | Capture Browser proof for normal app surfaces, or Chrome/Computer proof for native browser/OS surfaces | N/A: no browser bytes changed. |
| Browser final proof | no | Attach Browser/Chrome/Computer proof or exact caveat when browser proof applies | N/A: comment-only lint configuration. |
| CI-controlled template output changed | no | Restore generated template output or record why it is intentionally kept | N/A: no template output changed. |
| Package behavior or public API changed | no | Add a changeset or record why no changeset applies | N/A: no package behavior/API change. |
| Registry-only component work changed | no | Update `docs/components/changelog.mdx` or record N/A | N/A: no registry work. |
| Docs or content changed | no | For docs-heavy work, use `--template docs`; for incidental docs, verify source-backed claims, links, examples, and rendered output or record N/A | N/A: execution ledger only; no user-facing docs/content. |
| High-risk mini gate | no | For public API/runtime/package-boundary/browser/agent-action/command-contract changes, record realistic failure mode, proof plan, and why the chosen boundary is right; otherwise N/A | N/A: no high-risk contract changed. |
| Agent-native review for agent/tooling changes | no | For `.agents/**`, `.claude/**`, `.codex/**`, skills, hooks, commands, prompts, or user-action tooling, load `.agents/skills/agent-native-reviewer/SKILL.md` and close accepted/actionable findings, or record N/A | N/A: no agent-native source changed. |
| Local install corruption suspected | no | Run `pnpm run reinstall` once, rerun the exact failing command, or record N/A | N/A: no failure or install-corruption signal. |
| P1 autoreview for non-trivial implementation changes | no | Load `.agents/skills/autoreview/SKILL.md`; pass `--max-priority P1` with dirty local `--mode local`, branch/PR `--mode branch --base <base>`, or committed slice `--mode commit --commit <ref>`; fix and rerun within the hard cap of three helper invocations for one unchanged scope, then stop and report any remaining accepted/actionable findings; use P2 or P3 only when explicitly requested, or record N/A for docs-only/trivial/no local patch | N/A: trivial six-comment patch; strict policy is the owning review. |
| PR create or update | no | Run `check` before PR work and sync PR body to the task-style final handoff | N/A: no PR requested. |
| Task-style PR body verified | no | Verify the PR body with `gh pr view --json body`; it must preserve auto-release blocks when applicable, must not include a current-PR self-link, and must use the kitcn PR #270 emoji format: `🐛 Fixes ...`, `🟢 95-100% confidence`, `Phase / 🧪 Tests / 🌐 Browser` table, and bold emoji Outcome/Caveat/Design/Verified sections | N/A: no PR. |
| PR proof image hosting | no | If PR body needs browser proof, replace local image paths with hosted GitHub URLs or record N/A | N/A: no PR/browser proof. |
| Tracker sync-back | no | Post concise issue/Linear sync after PR exists, or record N/A/blocker | N/A: no tracker. |
| Final handoff contract | yes | Fill the final handoff fields below with exact PR/issue/confidence/tests/browser/outcome/caveats/design/verification content or N/A reason | Completed below. |
| Final lint | yes | Run `pnpm lint:fix` or scoped equivalent | Targeted `ultracite fix oxlint.config.ts` and full `pnpm lint` passed. |
| Output budget discipline | yes | Verify no unbounded high-volume command output was streamed, or record the accidental output and recovery | Only exact config matches and capped checker/lint output used. |
| Timed checkpoint | no | If duration was requested, keep improving until elapsed, then finish the current loop cleanly; otherwise N/A | N/A: no duration requested. |
| Goal plan complete | yes | Run `node .agents/skills/autogoal/scripts/check-complete.mjs docs/plans/2026-08-22-mark-rejected-oxlint-re-enables-p0.md` | Passed on the final ledger. |

Phase / pass table:
| Phase | Status | Evidence | Next |
|-------|--------|----------|------|
| Intake and source read | complete | user correction, six comments, Oxlint policy, and skills read | implementation |
| Implementation | complete | six reasons changed to `[P0 re-enable-rejected]` with retry preconditions | verification |
| Verification | complete | exact source audit, strict policy, targeted safe fix, and full lint passed | closeout |
| PR / tracker sync | complete | N/A: none requested | final response |
| Closeout | complete | evidence and risks recorded; mechanical checker next | final response |

Findings:
- Five reverted candidates already used P0 but lacked an explicit failed-re-enable marker; `typescript/no-unnecessary-condition` still used P1.
- A durable retry guard needs both P0 and the owner change required before reconsideration; otherwise a future audit may repeat the same experiment.

Decisions and tradeoffs:
- Use the uniform `[P0 re-enable-rejected]` marker for all six candidates and preserve the concrete semantic conflict plus retry precondition.
- Do not modify the shared global rule-policy snapshot: this is Plate-specific evidence, and the user asked to harden this repository config.

Implementation notes:
- Updated comments only for strict booleans, unnecessary type parameters/conditions, cycles, unsafe return, and unsafe assignment.
- No rule value, option, override, source, test, dependency, or runtime byte changed.

Review fixes:
- User correction accepted: upgraded the one P1 reason and made all six retry guards explicit instead of relying on generic P0 categories.

Error attempts:
| Error / failed attempt | Count | Next different move | Resolution |
|------------------------|-------|---------------------|------------|
| None yet | 0 | | |

Verification evidence:
- Exact `rg -n -B1` audit -> all six off entries are immediately preceded by `[P0 re-enable-rejected]` and a named retry precondition.
- Strict config-policy checker -> no missing/forbidden reasons, exact-file overrides, invalid/test/unbounded directives; atomic typed-unused enforcement remains `lint:type-aware`.
- `pnpm exec ultracite fix oxlint.config.ts` -> clean targeted safe fix.
- `pnpm lint` -> passed across 4,187 files.
- `node .agents/skills/autogoal/scripts/check-complete.mjs docs/plans/2026-08-22-mark-rejected-oxlint-re-enables-p0.md` -> complete.

Final handoff contract:
- PR line: N/A: no PR requested.
- Issue / tracker line: N/A: no tracker.
- Confidence line: high.
- Flow table:
  - Reproduced: N/A: policy correction, not behavior.
  - Verified: strict policy and lint green; browser N/A.
- Browser check: N/A: no browser surface.
- Outcome: all six rejected re-enables are durable P0 retry guards.
- Caveat: reconsideration is valid only after the named owner contract changes, not because diagnostic volume changes.
- Design:
  - Chosen boundary: comments immediately owning the six global offs in `oxlint.config.ts`.
  - Why not quick patch: this is the smallest correct patch; changing only P1 to P0 would leave five future retry traps ambiguous.
  - Why not broader change: shared skill policy is generic; this evidence is repository-specific.
- Verified: exact source audit, strict policy, targeted safe fix, and lint.
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
- Issue / tracker: N/A: no tracker.
- Browser proof: N/A: no runtime/UI change.
- Caveats: none for current behavior; retry only after named owners change.

Timeline:
- 2026-08-22T22:39:42.974Z Task goal plan created.
- 2026-08-23 Marked all six reverted candidates `[P0 re-enable-rejected]`, added retry preconditions, and passed strict policy plus lint.

Reboot status:
| Question | Answer |
|----------|--------|
| Where am I? | Closeout; mechanical plan check next. |
| Where am I going? | Final response. |
| What is the goal? | Make all six rejected Oxlint re-enables durable P0 retry guards. |
| What have I learned? | P0 alone is weaker than P0 plus an explicit owner-change precondition. |
| What have I done? | Updated six comments and passed exact source, policy, fixer, and lint proof. |

Open risks:
- None to runtime behavior: only comments changed.
