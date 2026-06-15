# slate v2 document value hard cut main root

Objective:
Hard cut Slate v2 public main root; done when value uses children plus extra
roots only and main root has no public API path.

Goal plan:
docs/plans/2026-06-15-slate-v2-document-value-hard-cut-main-root.md

Template:
docs/plans/templates/task.md

Primary template:
docs/plans/templates/task.md

Applied packs:
- docs (docs/plans/templates/packs/docs.md)
- package-api (docs/plans/templates/packs/package-api.md)

Task source:
- type: user prompt
- id / link: current Codex thread
- title: Hard cut public `"main"` root from Slate v2 document value
- acceptance criteria:
  - Normal editor value remains the Slate-compatible block array.
  - Full document value shape is `{ children, roots?, state? }`.
  - `children` is the primary Slate document.
  - `roots` contains extra named roots only.
  - Public APIs use `root?: string`; `undefined` means the primary document.
  - There is no public way to spell the primary document as `"main"`.
  - Hard cut compatibility aliases, docs, examples, tests, comments, and
    fallback parsing for public `"main"` root.

First checkpoint:
- Before implementation or broad exploration, copy every explicit prompt
  requirement into this plan as checkable checkpoints: scope, non-goals,
  timing/duration, stop conditions, deliverables, final handoff sections,
  verification surface, and success criteria.
- Do not continue into implementation until this extraction is complete or
  explicitly marked N/A with reason.

Completion threshold:
- Source audit finds no public `"main"` root API path in Slate v2 code, docs, or
  examples, except internal/private implementation details explicitly recorded
  as non-public.
- Slate v2 public document value supports array shorthand and
  `{ children, roots?, state? }`.
- Focused type/tests/docs checks pass in the owning Slate v2 workspace.
- Task closure is legal only when the source-of-truth acceptance criteria are
  satisfied or explicitly narrowed, required verification evidence is recorded,
  code-review and release-artifact gates are closed when applicable, tracker/PR
  sync is complete or marked N/A with reason, and
  `node .agents/skills/autogoal/scripts/check-complete.mjs docs/plans/2026-06-15-slate-v2-document-value-hard-cut-main-root.md` passes.

Verification surface:
- Source audit over `.tmp/slate-v2` for `"main"`, `roots.main`, `main root`,
  document value, and root option usage.
- Focused package tests for document value/root normalization and public root
  access.
- Owning Slate v2 typecheck/check command after implementation.
- Docs/examples grep and build/type proof when docs/examples change.

Constraints:
- Preserve existing user-facing behavior outside the task scope.
- Prefer the durable ownership boundary over caller-by-caller patches.
- Do not create PRs, comments, commits, or pushes unless the task/user/skill
  requires them.
- Do not add broad ceremony when the task is trivial or docs-only.

Boundaries:
- Source of truth: latest user prompt plus `slate-north-star`, live
  `.tmp/slate-v2` source/tests/docs, and this plan.
- Allowed edit scope: `.tmp/slate-v2` Slate v2 source/tests/docs/examples and
  this plan. Parent repo skill/docs changes only if workflow misses are found.
- Browser surface: only if changed docs/examples expose a browser route or
  source audit shows behavior needs browser proof.
- Tracker sync: N/A: no tracker item.
- Non-goals: no release/publish/PR/commit unless explicitly requested; no
  backward compatibility for public `"main"` root; no migration-story docs.

Output budget strategy:
- Use filename/count searches first, then narrow `sed` reads on owning files.
- Exclude generated/build artifacts unless a changed owner requires them.
- Cap broad command output and record exact grep queries instead of streaming
  full matches.

Blocked condition:
- Block only if live source proves `"main"` is required by an unavoidable
  external contract and cutting it would need a user product decision, or if
  local install/tooling corruption persists after the repo-prescribed retry.

Task state:
- task_type: public API hard cut
- task_complexity: normal
- current_phase: intake
- current_phase_status: in_progress
- next_phase: implementation
- goal_status: active

Current verdict:
- verdict: in progress
- confidence: medium before source audit
- next owner: task
- reason: public API hard cut with docs/tests/type proof required

Completion rule:
- Do not call `update_goal(status: complete)` while any required checklist item
  remains unchecked. If an item does not apply, check it and add `N/A: <reason>`.
- Do not call `update_goal(status: complete)` until every completion threshold
  above is satisfied, final handoff evidence is recorded, and
  `node .agents/skills/autogoal/scripts/check-complete.mjs docs/plans/2026-06-15-slate-v2-document-value-hard-cut-main-root.md` passes.
- Do not create hook state for this goal. This file plus the active goal are the
  durable state.

Start Gates:
| Gate | Applies | Evidence |
|------|---------|----------|
| Prompt requirements captured before work | yes | Acceptance criteria above copy every explicit user requirement before implementation. |
| Skill analysis before edits | yes | Loaded `autogoal`, `hard-cut`, `slate-north-star`; task uses package-api/docs packs. |
| Active goal checked or created | yes | `get_goal` returned none; created active goal pointing to this plan. |
| Source of truth read before edits | yes | User prompt and skill/north-star instructions read; live source audit next before code edits. |
| Tracker comments and attachments read | N/A: no tracker item | User prompt only. |
| Video transcript evidence required | N/A: no video | Prompt has no media. |
| `docs/solutions` checked for non-trivial existing-code work | N/A: Slate v2 public API source owns current truth | North-star says live `.tmp/slate-v2` source outranks old docs for current API. |
| TDD decision before behavior change or bug fix | yes | Add/update focused contract tests after source audit, before closing implementation. |
| Branch decision for code-changing task | N/A: user did not ask branch work | Stay on current checkout; no git branch/commit/PR. |
| Release artifact decision | pending | Decide after package ownership/source audit; default no release action unless package policy requires changeset. |
| Browser tool decision for browser surface | pending | Decide after source audit; likely N/A unless examples/browser docs need proof. |
| PR expectation decision | N/A: no PR requested | No PR. |
| Tracker sync expectation decision | N/A: no tracker item | No sync-back. |
| Output budget strategy recorded | yes | Output budget strategy section filled before broad source audit. |
| Docs pack selected | yes | Plan created with docs pack because public docs/examples may change. |
| `docs-creator` loaded | pending | Load only if docs changes are non-trivial after source audit. |
| Docs lane selected | yes | Incidental docs under task template; docs pack protects docs proof. |
| Target docs and nearest sibling docs read | pending | Read when source audit identifies docs/examples to patch. |
| Docs style doctrine read | pending | Read `.agents/rules/docs-creator.mdc` if non-trivial docs edits occur. |
| Documented source owner identified | pending | Identify after source audit. |
| Package/API pack selected | yes | Plan created with package-api pack. |
| Public surface or package boundary identified | pending | Identify after source audit. |
| Release artifact path selected | pending | Choose `.changeset` or N/A after package owner/source audit. |
| `changeset` skill loaded when `.changeset` is required | pending | N/A unless changeset required. |
| Barrel/export impact decision recorded | pending | Decide after source audit. |

Work Checklist:
- [x] First checkpoint complete: every explicit prompt requirement, scope
      boundary, timing constraint, stop condition, deliverable, final handoff
      section, verification surface, and success criterion is copied into this
      plan as checkable checkpoints before implementation. Evidence: Task source,
      completion threshold, verification surface, constraints, boundaries, and
      blocked condition are filled.
- [x] Short objective plus outcome, completion threshold, verification surface,
      constraints, boundaries, and blocked condition are concrete.
- [x] Task source classified with source type, id/link, title, task type,
      acceptance criteria, caveats, likely files/routes/packages, browser
      surface, and root-cause layer.
- [x] Required video or screen-recording evidence is cached/read as normalized
      `<video-transcripts>` XML, or marked N/A with reason.
- [ ] Nearby repo instructions and implementation patterns read before edits.
- [ ] Implementation fixes the right ownership boundary, or the narrower choice
      is recorded with reason.
- [ ] Release artifact requirement recorded: changeset, registry changelog, or
      N/A with reason.
- [ ] Final handoff shape decided: bug/feature/testing/batch/review/tracker
      requirements, PR body sync, and issue/Linear sync when applicable.
- [ ] Branch handling recorded for code-changing work: dedicated branch used,
      new branch needed, or N/A with reason.
- [ ] Local-env-rot retry policy recorded for any surprising repo-wide failure:
      reinstall/rerun evidence or N/A with reason.
- [ ] Workspace authority recorded: every proof command names the cwd/tool that
      owns the changed behavior.
- [ ] High-risk note recorded for public API, runtime, package-boundary,
      browser behavior, agent-action, or command-contract changes, or marked
      N/A with reason.
- [ ] Review/autoreview target selected from actual diff state for non-trivial
      implementation work, or marked N/A with reason.
- [ ] Agent-native review decision recorded for `.agents/**`, `.claude/**`,
      `.codex/**`, skills, hooks, commands, prompts, or user-action tooling.
- [ ] Output budget discipline recorded and followed: broad searches are
      scoped, capped, counted, or artifacted instead of streamed into goal
      context.
- [ ] Docs pack: docs lane, target docs, nearest sibling docs, and source owner are recorded.
- [ ] Docs pack: every named API, import, option, route, component, transform, demo, and preview is source-backed or marked N/A with reason.
- [ ] Docs pack: docs use current-state reference voice, not changelog voice.
- [ ] Docs pack: links, anchors, and previews target real leaf pages or are marked N/A with reason.
- [ ] Package/API pack: public API, package boundary, export, and release-artifact impact are recorded.
- [ ] Package/API pack: release artifact matrix is applied: `.changeset`, registry changelog, or explicit no-artifact reason.
- [ ] Package/API pack: `.changeset` work loads `changeset` and follows its package/version/prose rules.
- [ ] Package/API pack: registry-only work updates `docs/components/changelog.mdx` instead of adding a package changeset.
- [ ] Package/API pack: no-artifact decisions state why the diff has no published package user-visible delta from `main`.
- [ ] Package/API pack: compatibility, migration, or hard-cut decision is explicit when public shape changes.
- [ ] Package/API pack: package-owned typecheck/build/test proof is recorded or marked N/A with reason.
- [ ] Package/API pack: generated barrels or release notes are updated when required.

Completion Gates:
| Gate | Applies | Required action | Evidence |
|------|---------|-----------------|----------|
| Named verification threshold | pending | Run the command, proof, source audit, or artifact check named in this plan | pending |
| Bug reproduced before fix | pending | Record failing test/repro or N/A with reason | pending |
| Targeted behavior verification | pending | Run focused test/proof for changed behavior or record N/A | pending |
| TypeScript or typed config changed | pending | Run relevant typecheck | pending |
| Package exports or file layout changed | pending | Run `pnpm brl` before final verification and keep generated barrel updates | pending |
| Package manifests, lockfile, or install graph changed | pending | Run `pnpm install` and relevant package checks | pending |
| Agent rules or skills changed | pending | Run `pnpm install` and verify generated skill sync | pending |
| Workspace authority proof | pending | Run verification in the owning repo/package/app/route/tool and record cwd; do not count the wrong workspace as proof | pending |
| Browser surface changed | pending | Capture Browser Use proof or record explicit waiver/blocker | pending |
| Browser final proof | pending | Attach screenshot or exact browser verification caveat when browser proof applies | pending |
| CI-controlled template output changed | pending | Restore generated template output or record why it is intentionally kept | pending |
| Package behavior or public API changed | pending | Add a changeset or record why no changeset applies | pending |
| Registry-only component work changed | pending | Update `docs/components/changelog.mdx` or record N/A | pending |
| Docs or content changed | pending | For docs-heavy work, use `--template docs`; for incidental docs, verify source-backed claims, links, examples, and rendered output or record N/A | pending |
| High-risk mini gate | pending | For public API/runtime/package-boundary/browser/agent-action/command-contract changes, record realistic failure mode, proof plan, and why the chosen boundary is right; otherwise N/A | pending |
| Agent-native review for agent/tooling changes | pending | For `.agents/**`, `.claude/**`, `.codex/**`, skills, hooks, commands, prompts, or user-action tooling, load `.agents/skills/agent-native-reviewer/SKILL.md` and close accepted/actionable findings, or record N/A | pending |
| Local install corruption suspected | pending | Run `pnpm run reinstall` once, rerun the exact failing command, or record N/A | pending |
| Autoreview for non-trivial implementation changes | pending | Load `.agents/skills/autoreview/SKILL.md`; use dirty local `--mode local`, branch/PR `--mode branch --base <base>`, or committed slice `--mode commit --commit <ref>` until no accepted/actionable findings, or record N/A for docs-only/trivial/no local patch | pending |
| PR create or update | pending | Run `check` before PR work and sync PR body to the task-style final handoff | pending |
| Task-style PR body verified | pending | Verify the PR body with `gh pr view --json body`; it must preserve auto-release blocks when applicable, must not include a current-PR self-link, and must use the kitcn PR #270 emoji format: `🐛 Fixes ...`, `🟢 95-100% confidence`, `Phase / 🧪 Tests / 🌐 Browser` table, and bold emoji Outcome/Caveat/Design/Verified sections | pending |
| PR proof image hosting | pending | If PR body needs browser proof, replace local image paths with hosted GitHub URLs or record N/A | pending |
| Tracker sync-back | pending | Post concise issue/Linear sync after PR exists, or record N/A/blocker | pending |
| Final handoff contract | pending | Fill the final handoff fields below with exact PR/issue/confidence/tests/browser/outcome/caveats/design/verification content or N/A reason | pending |
| Final lint | pending | Run `pnpm lint:fix` or scoped equivalent | pending |
| Output budget discipline | pending | Verify no unbounded high-volume command output was streamed, or record the accidental output and recovery | pending |
| Goal plan complete | yes | Run `node .agents/skills/autogoal/scripts/check-complete.mjs docs/plans/2026-06-15-slate-v2-document-value-hard-cut-main-root.md` | pending |
| Docs source-backed claim audit | pending | Verify docs claims against current source or record N/A | pending |
| Docs links / routes / previews | pending | Verify leaf links, routes, anchors, and preview names or record N/A | pending |
| Docs MDX/content parser | pending | Run `pnpm --filter www build:contentlayer` for MDX/content changes, or record N/A | pending |
| Plugin page specifics | pending | For plugin pages, apply `docs-creator` kit/manual/API rules; otherwise N/A | pending |
| Public API / package boundary proof | pending | Source-audit public API, exports, and package boundary impact | pending |
| Release artifact classification | pending | Record whether the change is published package behavior/API/types/config/runtime, registry-only, or no published user-visible delta | pending |
| Published package changeset | pending | If published package users see a delta, load `changeset`, add/update one `.changeset/*.md` per package, and prove no forbidden `minor` on `@platejs/slate`, `@platejs/core`, or `platejs` | pending |
| Registry changelog | pending | If the change is registry-only under `apps/www/src/registry/**`, update `docs/components/changelog.mdx` and do not add a package changeset | pending |
| No release artifact | pending | If no artifact is needed, record the exact reason: internal-only, docs-only, agent-only, test-only, or no user-visible delta from `main` | pending |
| Package typecheck/build/test | pending | Run owning package checks or record N/A with reason | pending |
| Barrel/export generation | pending | Run `pnpm brl` when exports or exported file layout changed, otherwise N/A | pending |

Phase / pass table:
| Phase | Status | Evidence | Next |
|-------|--------|----------|------|
| Intake and source read | in_progress | created plan | implementation |
| Implementation | pending | | verification |
| Verification | pending | | closeout |
| PR / tracker sync | pending | | final response |
| Closeout | pending | | final response |

Findings:
- None yet.

Decisions and tradeoffs:
- None yet.

Implementation notes:
- None yet.

Review fixes:
- None yet.

Error attempts:
| Error / failed attempt | Count | Next different move | Resolution |
|------------------------|-------|---------------------|------------|
| None yet | 0 | | |

Verification evidence:
- Pending.

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
- 2026-06-15T08:47:57.106Z Task goal plan created.

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
