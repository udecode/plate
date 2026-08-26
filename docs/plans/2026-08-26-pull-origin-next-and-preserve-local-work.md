# Pull origin next and preserve local work

Objective:
Integrate origin/next while preserving all local work; done when next matches upstream, zero conflicts remain, local changes are restored, and integration checks pass.

Goal plan:
docs/plans/2026-08-26-pull-origin-next-and-preserve-local-work.md

Template:
docs/plans/templates/task.md

Primary template:
docs/plans/templates/task.md

Applied packs:
- none

Task source:
- type: direct user request
- id / link: N/A
- title: Pull and resolve conflicts
- acceptance criteria: pull origin/next into the current checkout, preserve all staged, unstaged, and untracked local work, resolve every conflict, and verify the combined tree without committing, pushing, or opening a PR.

First checkpoint:
- Before implementation or broad exploration, copy every explicit prompt
  requirement into this plan as checkable checkpoints: scope, non-goals,
  timing/duration, stop conditions, deliverables, final handoff sections,
  verification surface, and success criteria.
- Do not continue into implementation until this extraction is complete or
  explicitly marked N/A with reason.

Timed checkpoint:
- requested duration: N/A; no duration requested
- semantics: finish when the evidence threshold is met
- initial confidence score: 90%; the commit graph is a pure fast-forward, while reapplying the large dirty tree is the material risk
- improvement loop: retain a recoverable stash, resolve overlap file by file, then compare pre/post inventories and run integrity checks
- final score / loop closure: 98%; graph, conflict, preservation, source/mirror, typecheck, generated output, unit, and focused Chromium proof passed

Completion threshold:
- `next` is at the fetched `origin/next` commit with `0 0` divergence.
- `git ls-files -u` is empty and no conflict markers remain in the applied diff.
- Every pre-pull staged, unstaged, and untracked path is restored, independently present upstream, or explicitly reconciled during conflict resolution.
- The pre-pull stash checkpoint remains available until preservation and integration checks pass.
- No commit, push, PR, tracker mutation, or product-scope expansion occurs.
- Task closure is legal only when the source-of-truth acceptance criteria are
  satisfied or explicitly narrowed, required verification evidence is recorded,
  code-review and release-artifact gates are closed when applicable, tracker/PR
  sync is complete or marked N/A with reason, and
  `node .agents/skills/autogoal/scripts/check-complete.mjs docs/plans/2026-08-26-pull-origin-next-and-preserve-local-work.md` passes.

Verification surface:
- Git graph audit: `git rev-list --left-right --count HEAD...origin/next`.
- Conflict audit: `git ls-files -u` and `git diff --check`.
- Preservation audit: pre/post tracked and untracked inventories, hashes for unchanged-path content, saved binary patches, and explicit review of every overlapping path.
- Integration checks: focused checks selected from the actual conflict set; broader checks only when overlap changes behavior or generated ownership.

Constraints:
- Preserve existing user-facing behavior outside the task scope.
- Prefer the durable ownership boundary over caller-by-caller patches.
- Do not create PRs, comments, commits, or pushes unless the task/user/skill
  requires them.
- Do not add broad ceremony when the task is trivial or docs-only.

Boundaries:
- Source of truth: the user's request and current checkout at `/Users/zbeyens/git/plate-2`.
- Allowed edit scope: Git conflict resolutions and this required goal plan; preserve all other local work as-is.
- Browser surface: N/A unless a conflict requires a user-visible behavior merge.
- Browser strategy: N/A for a Git integration task unless conflict ownership makes runtime proof necessary. Use Browser for normal app QA; use Chrome directly
  for native downloads, print/print-preview, file picker/uploads, clipboard,
  browser dialogs/permissions, extension/profile state, or exact Chrome
  rendering; use Computer Use only for native Chrome/OS UI that needs visual
  inspection after Chrome automation cannot read it.
- Tracker sync: N/A; no tracker source or mutation requested.
- Non-goals: no commit, push, PR, release artifact, API redesign, feature work, or cleanup of unrelated local changes.

Output budget strategy:
- Store full pre/post inventories and patches in a temporary recovery directory; stream only capped summaries and conflict-owner excerpts.

Blocked condition:
- Block only if Git cannot fetch origin, the stash cannot be reconstructed after three distinct recovery attempts, or a conflict requires a product decision that cannot be inferred from both versions and nearby ownership.

Task state:
- task_type: Git integration chore
- task_complexity: non-trivial because the checkout contains extensive staged, unstaged, and untracked work
- current_phase: closeout
- current_phase_status: complete
- next_phase: final response
- goal_status: ready-to-complete

Current verdict:
- verdict: valid
- confidence: 98%
- next owner: task
- reason: the user explicitly authorized pulling and conflict resolution; a recoverable checkpoint makes the operation safe.

Completion rule:
- Do not call `update_goal(status: complete)` while any required checklist item
  remains unchecked. If an item does not apply, check it and add `N/A: <reason>`.
- Do not call `update_goal(status: complete)` until every completion threshold
  above is satisfied, final handoff evidence is recorded, and
  `node .agents/skills/autogoal/scripts/check-complete.mjs docs/plans/2026-08-26-pull-origin-next-and-preserve-local-work.md` passes.
- Do not create hook state for this goal. This file plus the active goal are the
  durable state.

Start Gates:
| Gate | Applies | Evidence |
|------|---------|----------|
| Prompt requirements captured before work | yes | Pull, resolve conflicts, preserve the dirty tree, verify, and do not ship were copied above. |
| Timed checkpoint parsed | no | N/A: no duration requested. |
| Skill analysis before edits | yes | `autogoal` and `task` own measurable ordinary integration work. |
| Active goal checked or created | yes | `get_goal` returned no active goal; creation follows this checkpoint. |
| Source of truth read before edits | yes | Direct user request and repository instructions read. |
| Tracker comments and attachments read | no | N/A: no tracker source. |
| Video transcript evidence required | no | N/A: this Git request does not depend on the earlier recording. |
| `docs/solutions` checked for non-trivial existing-code work | no | N/A: no implementation pattern is being designed. |
| TDD decision before behavior change or bug fix | no | N/A: Git integration only; no new behavior fix is authorized. |
| Branch decision for code-changing task | yes | Stay on current `next`; the user asked to pull this checkout. |
| Release artifact decision | no | N/A: no new package or registry behavior is being authored. |
| Browser tool decision for browser surface | no | N/A unless conflict resolution changes runtime behavior. |
| PR expectation decision | no | N/A: explicitly outside scope. |
| Tracker sync expectation decision | no | N/A: no tracker. |
| Output budget strategy recorded | yes | Full evidence goes to a temporary directory; console output stays capped. |

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
- [x] Implementation fixes the right ownership boundary, or the narrower choice
      is recorded with reason.
- [x] Release artifact requirement recorded: changeset, registry changelog, or
      N/A with reason.
- [x] Final handoff shape decided: bug/feature/testing/batch/review/tracker
      requirements, PR body sync, and issue/Linear sync when applicable.
- [x] Branch handling recorded for code-changing work: dedicated branch used,
      new branch needed, or N/A with reason.
- [x] Local-env-rot retry policy recorded for any surprising repo-wide failure:
      reinstall/rerun evidence or N/A with reason.
- [x] Workspace authority recorded: every proof command names the cwd/tool that
      owns the changed behavior.
- [x] High-risk note recorded for public API, runtime, package-boundary,
      browser behavior, agent-action, or command-contract changes, or marked
      N/A with reason.
- [x] Review/P1 autoreview target selected from actual diff state for non-trivial
      implementation work, or marked N/A with reason.
- [x] Agent-native review decision recorded for `.agents/**`, `.claude/**`,
      `.codex/**`, skills, hooks, commands, prompts, or user-action tooling.
- [x] Output budget discipline recorded and followed: broad searches are
      scoped, capped, counted, or artifacted instead of streamed into goal
      context.

Completion Gates:
| Gate | Applies | Required action | Evidence |
|------|---------|-----------------|----------|
| Named verification threshold | yes | Run the command, proof, source audit, or artifact check named in this plan | `HEAD` and `origin/next` are `d282fd8a33`; divergence `0/0`; zero unmerged entries; zero missing local paths. |
| Bug reproduced before fix | no | Record failing test/repro or N/A with reason | N/A: Git integration chore, not a behavior bug fix. |
| Targeted behavior verification | yes | Run focused test/proof for changed behavior or record N/A | Regression tests `60/60`; Plite React `22/22`; Chromium inline row `1/1`; Vercel runtime `5/5`. |
| TypeScript or typed config changed | yes | Run relevant typecheck | `pnpm turbo typecheck --filter=./packages/plite-react` passed `5/5` tasks. |
| Package exports or file layout changed | no | Run `pnpm brl` before final verification and keep generated barrel updates | N/A: conflict resolution changed no exports or file layout. |
| Package manifests, lockfile, or install graph changed | yes | Run `pnpm install` and relevant package checks | `pnpm install` passed with lockfile current. |
| Agent rules or skills changed | yes | Run `pnpm install` and verify generated skill sync | `pnpm install` regenerated mirrors; four Regression reference/script pairs match byte-for-byte; contract tests `30/30`. |
| Workspace authority proof | yes | Run verification in the owning repo/package/app/route/tool and record cwd; do not count the wrong workspace as proof | Every command ran in `/Users/zbeyens/git/plate-2`; package and app commands used their owning filters. |
| Browser surface changed | yes | Capture Browser proof for normal app surfaces, or Chrome/Computer proof for native browser/OS surfaces | The only browser-test conflict passed through the repo-owned Chromium runner; no product UI conflict required manual Browser proof. |
| Browser final proof | yes | Attach Browser/Chrome/Computer proof or exact caveat when browser proof applies | `mouse drag undo restores typed inline link text replacement` passed `1/1` in Chromium. |
| CI-controlled template output changed | no | Restore generated template output or record why it is intentionally kept | N/A: no `templates/**` output was edited. |
| Package behavior or public API changed | no | Add a changeset or record why no changeset applies | N/A: integration reconciled existing upstream/local changes and authored no package API. |
| Registry-only component work changed | no | Update `docs/components/changelog.mdx` or record N/A | N/A: this was not registry-only feature work; existing source entries generated their artifacts. |
| Docs or content changed | no | For docs-heavy work, use `--template docs`; for incidental docs, verify source-backed claims, links, examples, and rendered output or record N/A | N/A: only the required goal plan and an existing regression plan template conflict were reconciled. |
| High-risk mini gate | yes | For public API/runtime/package-boundary/browser/agent-action/command-contract changes, record realistic failure mode, proof plan, and why the chosen boundary is right; otherwise N/A | Failure mode was local-work loss or doctrine drift; stash, byte inventories, source/mirror sync, and owner tests closed it. |
| Agent-native review for agent/tooling changes | yes | For `.agents/**`, `.claude/**`, `.codex/**`, skills, hooks, commands, prompts, or user-action tooling, load `.agents/skills/agent-native-reviewer/SKILL.md` and close accepted/actionable findings, or record N/A | PASS: Regression route, source owner, generated mirror, template, validator, and proof remain connected; no findings. |
| Local install corruption suspected | no | Run `pnpm run reinstall` once, rerun the exact failing command, or record N/A | N/A: no corruption signature occurred. |
| P1 autoreview for non-trivial implementation changes | no | Load `.agents/skills/autoreview/SKILL.md`; pass `--max-priority P1` with dirty local `--mode local`, branch/PR `--mode branch --base <base>`, or committed slice `--mode commit --commit <ref>`; fix and rerun within the hard cap of three helper invocations for one unchanged scope, then stop and report any remaining accepted/actionable findings; use P2 or P3 only when explicitly requested, or record N/A for docs-only/trivial/no local patch | N/A: repo policy explicitly forbids autoreview while the current branch is `next`. |
| PR create or update | no | Run `check` before PR work and sync PR body to the task-style final handoff | N/A: user requested local pull/conflict resolution only. |
| Task-style PR body verified | no | Verify the PR body with `gh pr view --json body`; it must preserve auto-release blocks when applicable, must not include a current-PR self-link, and must use the kitcn PR #270 emoji format: `🐛 Fixes ...`, `🟢 95-100% confidence`, `Phase / 🧪 Tests / 🌐 Browser` table, and bold emoji Outcome/Caveat/Design/Verified sections | N/A: no PR. |
| PR proof image hosting | no | If PR body needs browser proof, replace local image paths with hosted GitHub URLs or record N/A | N/A: no PR. |
| Tracker sync-back | no | Post concise issue/Linear sync after PR exists, or record N/A/blocker | N/A: no tracker source. |
| Final handoff contract | yes | Fill the final handoff fields below with exact PR/issue/confidence/tests/browser/outcome/caveats/design/verification content or N/A reason | Filled below. |
| Final lint | yes | Run `pnpm lint:fix` or scoped equivalent | Scoped Ultracite check ran; its only format report reproduces on the pre-pull selection test bytes, so unrelated user formatting was not rewritten. Conflict files pass `git diff --check`. |
| Output budget discipline | yes | Verify no unbounded high-volume command output was streamed, or record the accidental output and recovery | Full patches, hashes, and inventories stayed under `/tmp/plate-pull-20260826.AsfNg9`; console output was capped. |
| Timed checkpoint | no | If duration was requested, keep improving until elapsed, then finish the current loop cleanly; otherwise N/A | N/A: no duration requested. |
| Goal plan complete | yes | Run `node .agents/skills/autogoal/scripts/check-complete.mjs docs/plans/2026-08-26-pull-origin-next-and-preserve-local-work.md` | Ready for final checker. |

Phase / pass table:
| Phase | Status | Evidence | Next |
|-------|--------|----------|------|
| Intake and source read | complete | user request, repo policy, Autogoal, Task | implementation |
| Implementation | complete | checkpointed, pulled, reapplied, resolved nine conflicts | verification |
| Verification | complete | graph, inventory, unit, typecheck, generation, parity, Chromium | closeout |
| PR / tracker sync | complete | N/A: neither authorized nor requested | final response |
| Closeout | complete | goal checker is the final command | final response |

Findings:
- Nine content conflicts required reconciliation. The generated changelog indexes were rebuilt from all 86 source entries.
- The upstream inline test expected a nonexistent `kind` field from `SelectionSnapshot`; the merged test now checks the actual anchor/focus contract and passes in Chromium.
- Three paths changed after the initial snapshot and were preserved as newer unstaged work; generated registry output also incorporated newly appearing local source entries.

Decisions and tradeoffs:
- Kept the checkpoint stash instead of dropping it; recoverability is worth one temporary stash entry in a 1,421-path dirty checkout.
- Preserved the exact original staged path set. Mixed staged/unstaged files were reconstructed through a three-way merge of old HEAD, new HEAD, and the original index tree.
- Kept upstream's catch-all registry tracing, retained only the local style-overlay route that the catch-all does not cover, and tested both behaviors.

Implementation notes:
- Fast-forwarded `next` from `168a4490e2` to `d282fd8a33`.
- Reapplied stash `817f732dd611bc5686d80b3c2a5f7dce50ec38ff`; resolved nine conflicts; regenerated changelog and registry outputs; ran skill sync.

Review fixes:
- Agent-native review: PASS with no findings.
- Removed one integration-only duplicate-control assertion after the validator test proved that computed-style rows intentionally exit the pixel-classifier branch.
- Removed `kind: 'text'` from the merged browser snapshot assertion after exact Chromium proof exposed the local helper contract.

Error attempts:
| Error / failed attempt | Count | Next different move | Resolution |
|------------------------|-------|---------------------|------------|
| `git stash apply --index` could not three-way apply 20 overlapping index patches | 1 | Apply without `--index`, resolve content, then reconstruct the original index with explicit three-way merges | Resolved; staged path set restored exactly. |
| Computed-style validator test asserted a duplicate-control error outside the pixel-classifier branch | 1 | Keep the source-backed pixel/positive/negative contract | Rerun passed `60/60`. |
| Chromium inline row expected nonexistent snapshot `kind` | 1 | Assert the typed `SelectionSnapshot` anchor/focus contract | Exact rerun passed `1/1`. |

Verification evidence:
- `git fetch origin next`; `HEAD == origin/next == d282fd8a33`; divergence `0/0`.
- `git ls-files -u`: zero entries; modified-file conflict-marker scan: zero; conflict-file `git diff --check`: pass.
- Preservation: `1,421/1,421` pre-pull tracked paths present, `2/2` pre-pull untracked paths present, zero missing paths, original untracked node-selection file hash unchanged, staged path set `1,418/1,418` with zero drift.
- `pnpm install`: pass; Regression mirror parity: pass; Regression contract tests: `30/30`; validator tests: `60/60`.
- `bun test apps/www/src/lib/vercel-runtime.test.ts`: `5/5`; `pnpm --filter @platejs/plite-react test -- selection-reconciler-contract.test.tsx`: `22/22`; package typecheck: `5/5` tasks.
- Changelog generation/check: 86 source entries; `pnpm --filter www build:registry`: pass; focused Chromium inline row: `1/1`.

Final handoff contract:
- PR line: N/A; no PR authorized.
- Issue / tracker line: N/A; no tracker source.
- Confidence line: 98%.
- Flow table:
  - Reproduced: Git overlap and two invalid merged assertions were reproduced by exact index apply, unit, and Chromium proof.
  - Verified: all named integration checks passed.
- Browser check: focused repo-owned Chromium row passed `1/1`; manual Browser proof N/A for an integration-only task.
- Outcome: `next` matches origin, all local work is restored, zero conflicts remain, and the original staged path inventory is intact.
- Caveat: checkpoint stash `817f732d` and recovery directory `/tmp/plate-pull-20260826.AsfNg9` are intentionally retained; no commit or push was made.
- Design:
  - Chosen boundary: three-way reconcile upstream, local worktree, and original index independently.
  - Why not quick patch: a simple stash apply would have flattened staged/unstaged intent and risked losing overlap.
  - Why not broader change: product/API cleanup is outside a pull operation.
- Verified: exact graph, inventory, owner tests, generation, parity, and focused browser evidence listed above.
- PR body verified: N/A; no PR.

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
- PR: N/A.
- Issue / tracker: N/A.
- Browser proof: focused Chromium inline row `1/1`.
- Caveats: retained stash and `/tmp` recovery artifacts; scoped format check reports pre-existing formatting debt in the selection reconciler test.

Timeline:
- Goal plan created and the full dirty checkout captured before Git mutation.
- `next` fast-forwarded from `168a4490e2` to `d282fd8a33`.
- Local work reapplied; nine content conflicts and three staged-index conflicts reconciled.
- Registry and skill mirrors regenerated; unit, typecheck, parity, generation, and Chromium proof passed.
- Final fetch confirmed `0/0` divergence and preservation audits found zero missing local paths.

Reboot status:
| Question | Answer |
|----------|--------|
| Where am I? | Closeout complete; ready for final response. |
| Where am I going? | Mark the active goal complete and hand back the integrated checkout. |
| What is the goal? | Keep `next` current without losing or flattening the existing local work. |
| What have I learned? | Nine paths needed content reconciliation; the original index required independent three-way reconstruction. |
| What have I done? | See Timeline and Verification evidence. |

Open risks:
- None material. Stash `817f732d` and `/tmp/plate-pull-20260826.AsfNg9` remain as recovery copies; the pre-existing selection-test format debt remains untouched.

Timeline:
- 2026-08-26T11:53:24.317Z Task goal plan created.

Reboot status:
| Question | Answer |
|----------|--------|
| Where am I? | Intake and source read |
| Where am I going? | Implementation, verification, PR/tracker sync, closeout |
| What is the goal? | TODO: Fill from Objective |
| What have I learned? | See Findings |
| What have I done? | See Timeline |

Open risks:
- Pending.
