# create plate review skill

Objective:
Create a reproducible Plate architecture review skill with scoped modes, an evidence rubric, deterministic score caps, clear owner routing, generated mirrors, and local validation.

Goal plan:
docs/plans/2026-08-31-create-plate-review-skill.md

Template:
docs/plans/templates/task.md

Primary template:
docs/plans/templates/task.md

Applied packs:
- agent-native (docs/plans/templates/packs/agent-native.md)

Task source:
- type: direct user request
- id / link: N/A: local conversation request
- title: Create a full reproducible architecture review skill
- acceptance criteria: A repo-local `plate-review` skill explains the score, supports `all`, `plugin`, `entrypoint`, `package`, and `surface` parameters, produces evidence-backed before/after review output, stays read-only, and routes accepted work to existing implementation owners.

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
- initial confidence score: 82/100
- improvement loop: source topology audit, implementation, deterministic fixture, generated-mirror validation, agent-native review
- final score / loop closure: 96/100; exact five-mode contract, deterministic receipts, current Comments composition witness, source/generated parity, and agent-native capability map verified

Completion threshold:
- The source rule and generated skill exist and match after `pnpm install`.
- The command grammar covers exactly five primary scopes: `all`, `plugin`, `entrypoint`, `package`, and `surface`.
- The weighted rubric totals 10.0 and deterministic hard caps prevent wrong ownership, wrong lifetime, incomplete coverage, or unmeasured scale from receiving a misleading score.
- A local scoring validator passes its self-test, including a Comments-shaped fixture capped at 2/10.
- Shared routing names `plate-review` as the read-only architecture verdict owner without duplicating `best-api`, `plate-next`, `editor-audit`, `architecture-cleanup`, or implementation owners.
- Skill validation, source/mirror parity, focused lint, and agent-native review pass with no accepted actionable findings left open.
- Task closure is legal only when the source-of-truth acceptance criteria are
  satisfied or explicitly narrowed, required verification evidence is recorded,
  code-review and release-artifact gates are closed when applicable, tracker/PR
  sync is complete or marked N/A with reason, and
  `node .agents/skills/autogoal/scripts/check-complete.mjs docs/plans/2026-08-31-create-plate-review-skill.md` passes.

Verification surface:
- Local score-script self-test and invalid-input cases.
- Skill frontmatter/structure validation through repo Skiller generation and the local contract test. The generic skill-creator validator is an explicit N/A because it also rejects established repo skills that use Skiller's supported `argument-hint` key.
- Source audit for all five modes, rubric total, caps, output contract, and owner routing.
- `pnpm install` generation plus source/generated parity check.
- Scoped lint for changed JavaScript and Markdown/rule sources when supported.
- Agent-native review of the final `.agents/**` and tooling action surface.

Constraints:
- Preserve existing user-facing behavior outside the task scope.
- Prefer the durable ownership boundary over caller-by-caller patches.
- Do not create PRs, comments, commits, or pushes unless the task/user/skill
  requires them.
- Do not add broad ceremony when the task is trivial or docs-only.

Boundaries:
- Source of truth: `.agents/rules/plate-review.mdc`, `.agents/AGENTS.md`, and the deterministic scorer source; `.agents/skills/**` is generated.
- Allowed edit scope: the new source rule, the smallest shared routing additions, one deterministic scorer/fixture surface, generated mirrors, and this goal plan.
- Browser surface: N/A: agent instruction and CLI scoring only.
- Browser strategy: N/A. Use Browser for normal app QA; use Chrome directly
  for native downloads, print/print-preview, file picker/uploads, clipboard,
  browser dialogs/permissions, extension/profile state, or exact Chrome
  rendering; use Computer Use only for native Chrome/OS UI that needs visual
  inspection after Chrome automation cannot read it.
- Tracker sync: N/A: no tracker or public issue.
- Non-goals: implementing architecture fixes, changing Plate/Plite public APIs, reviewing an external editor, replacing `best-api` or `plate-next`, creating a PR/commit/push, or adding a diff-review mode owned by `autoreview`.

Output budget strategy:
- Use targeted `rg`, bounded `sed`, and capped command output. Do not scan generated trees broadly. Keep validation output under 12k tokens per command.

Blocked condition:
- Block only if the repo generator cannot produce a valid skill from source, or current owner rules make the requested independent review job impossible without deleting/reinterpreting an existing owner beyond the authorized scope.

Task state:
- task_type: agent-native skill creation
- task_complexity: medium
- current_phase: closeout
- current_phase_status: complete
- next_phase: final response
- goal_status: ready for completion check

Current verdict:
- verdict: PASS. `plate-review` fills an independent read-only scoring job with deterministic caps and explicit handoffs; it does not duplicate an implementation or API owner.
- confidence: 96/100
- next owner: user invocation through `$plate-review <scope> <target?>`
- reason: all five requested modes, arithmetic, cap status, source/mirror parity, routing, and agent-native action proof pass locally.

Completion rule:
- Do not call `update_goal(status: complete)` while any required checklist item
  remains unchecked. If an item does not apply, check it and add `N/A: <reason>`.
- Do not call `update_goal(status: complete)` until every completion threshold
  above is satisfied, final handoff evidence is recorded, and
  `node .agents/skills/autogoal/scripts/check-complete.mjs docs/plans/2026-08-31-create-plate-review-skill.md` passes.
- Do not create hook state for this goal. This file plus the active goal are the
  durable state.

Start Gates:
| Gate | Applies | Evidence |
|------|---------|----------|
| Prompt requirements captured before work | yes | acceptance criteria, boundaries, and completion threshold above |
| Timed checkpoint parsed | yes | N/A: no duration requested |
| Skill analysis before edits | yes | `skill-creator` and `autogoal` loaded; existing owner overlap inspected |
| Active goal checked or created | yes | `get_goal` returned no active goal; dedicated goal created after the first checkpoint |
| Source of truth read before edits | yes | `.agents/AGENTS.md`, existing review owners, Skiller generation, and source/mirror patterns inspected |
| Tracker comments and attachments read | no | N/A: direct local request |
| Video transcript evidence required | no | N/A: no video |
| `docs/solutions` checked for non-trivial existing-code work | no | N/A: agent workflow creation, not existing product behavior |
| TDD decision before behavior change or bug fix | no | N/A: no product behavior; deterministic scorer gets self-tests |
| Branch decision for code-changing task | yes | edit current checkout directly; no branch/PR requested |
| Release artifact decision | no | N/A: no package or registry behavior |
| Browser tool decision for browser surface | no | N/A: no browser surface |
| PR expectation decision | no | N/A: no PR requested |
| Tracker sync expectation decision | no | N/A: no tracker |
| Output budget strategy recorded | yes | targeted and capped reads/commands above |
| Agent-native pack selected | yes | applied by scratchpad generator |
| Agent-facing action surface identified | yes | `$plate-review <scope> <target?>` plus deterministic scorer |
| Source rule versus generated mirror boundary identified | yes | edit `.agents/rules/**`; generate `.agents/skills/**` via `pnpm install` |
| `agent-native-reviewer` loaded or waiver recorded | yes | full skill read; capability map passed with no actionable finding |

Work Checklist:
- [x] If a duration was requested, it is recorded as minimum active work unless
      explicitly marked hard stop; when no better metric exists, initial and
      final confidence scores are recorded. N/A: no duration; confidence moved from 82 to 96.
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
      `<video-transcripts>` XML, or marked N/A with reason. N/A: no media input.
- [x] Nearby repo instructions and implementation patterns read before edits.
- [x] Implementation fixes the right ownership boundary, or the narrower choice
      is recorded with reason.
- [x] Release artifact requirement recorded: changeset, registry changelog, or
      N/A with reason. N/A: repo tooling and agent instructions only.
- [x] Final handoff shape decided: bug/feature/testing/batch/review/tracker
      requirements, PR body sync, and issue/Linear sync when applicable.
- [x] Branch handling recorded for code-changing work: dedicated branch used,
      new branch needed, or N/A with reason.
- [x] Local-env-rot retry policy recorded for any surprising repo-wide failure:
      reinstall/rerun evidence or N/A with reason. N/A: no install-corruption signal.
- [x] Workspace authority recorded: every proof command names the cwd/tool that
      owns the changed behavior.
- [x] High-risk note recorded for public API, runtime, package-boundary,
      browser behavior, agent-action, or command-contract changes, or marked
      N/A with reason.
- [x] Review/P1 autoreview target selected from actual diff state for non-trivial
      implementation work, or marked N/A with reason. N/A: agent-workflow task uses its owning agent-native reviewer; no product implementation.
- [x] Agent-native review decision recorded for `.agents/**`, `.claude/**`,
      `.codex/**`, skills, hooks, commands, prompts, or user-action tooling.
- [x] Output budget discipline recorded and followed: broad searches are
      scoped, capped, counted, or artifacted instead of streamed into goal
      context.
- [x] Agent-native pack: source-of-truth rule files are edited instead of generated skill mirrors.
- [x] Agent-native pack: the changed agent action is discoverable from the skill/rule text.
- [x] Agent-native pack: generated mirrors are synced when `.agents/rules/**` changed, or N/A reason is recorded.
- [x] Agent-native pack: accepted agent-native review findings are fixed or explicitly rejected with reason.

Completion Gates:
| Gate | Applies | Required action | Evidence |
|------|---------|-----------------|----------|
| Named verification threshold | yes | Run the command, proof, source audit, or artifact check named in this plan | `pnpm check:plate-review`: 8/8 pass |
| Bug reproduced before fix | no | Record failing test/repro or N/A with reason | N/A: skill creation, not a behavior bug |
| Targeted behavior verification | yes | Run focused test/proof for changed behavior or record N/A | scorer CLI and Comments-composition fixture pass |
| TypeScript or typed config changed | no | Run relevant typecheck | N/A: JavaScript, Markdown, JSON only |
| Package exports or file layout changed | no | Run `pnpm brl` before final verification and keep generated barrel updates | N/A: no package source/export layout |
| Package manifests, lockfile, or install graph changed | yes | Run `pnpm install` and relevant package checks | `pnpm install` passed; only root script added, no dependency change |
| Agent rules or skills changed | yes | Run `pnpm install` and verify generated skill sync | Skiller generated Codex/Claude mirrors; parity test passed |
| Workspace authority proof | yes | Run verification in the owning repo/package/app/route/tool and record cwd; do not count the wrong workspace as proof | all proof ran in `/Users/zbeyens/git/plate-2` |
| Browser surface changed | no | Capture Browser proof for normal app surfaces, or Chrome/Computer proof for native browser/OS surfaces | N/A: no UI or browser behavior |
| Browser final proof | no | Attach Browser/Chrome/Computer proof or exact caveat when browser proof applies | N/A: no browser surface |
| CI-controlled template output changed | no | Restore generated template output or record why it is intentionally kept | N/A: no template source/output |
| Package behavior or public API changed | no | Add a changeset or record why no changeset applies | N/A: repo tooling/agent contract only |
| Registry-only component work changed | no | Update `docs/components/changelog.mdx` or record N/A | N/A: no registry component |
| Docs or content changed | no | For docs-heavy work, use `--template docs`; for incidental docs, verify source-backed claims, links, examples, and rendered output or record N/A | N/A: internal rule and goal plan only |
| High-risk mini gate | yes | For public API/runtime/package-boundary/browser/agent-action/command-contract changes, record realistic failure mode, proof plan, and why the chosen boundary is right; otherwise N/A | failure risks: false final score, ignored cap, stale mirror, or wrong route; 8 contract tests plus agent-native map cover them; read-only owner prevents execution overlap |
| Agent-native review for agent/tooling changes | yes | For `.agents/**`, `.claude/**`, `.codex/**`, skills, hooks, commands, prompts, or user-action tooling, load `.agents/skills/agent-native-reviewer/SKILL.md` and close accepted/actionable findings, or record N/A | PASS; source, route, mirrors, proof, context, and authority present |
| Local install corruption suspected | no | Run `pnpm run reinstall` once, rerun the exact failing command, or record N/A | N/A: no corruption signature |
| P1 autoreview for non-trivial implementation changes | no | Load `.agents/skills/autoreview/SKILL.md`; pass `--max-priority P1` with dirty local `--mode local`, branch/PR `--mode branch --base <base>`, or committed slice `--mode commit --commit <ref>`; fix and rerun within the hard cap of three helper invocations for one unchanged scope, then stop and report any remaining accepted/actionable findings; use P2 or P3 only when explicitly requested, or record N/A for docs-only/trivial/no local patch | N/A: no product implementation; agent-native reviewer is the owning gate |
| PR create or update | no | Run `check` before PR work and sync PR body to the task-style final handoff | N/A: no PR requested |
| Task-style PR body verified | no | Verify the PR body with `gh pr view --json body`; it must preserve auto-release blocks when applicable, must not include a current-PR self-link, and must use the kitcn PR #270 emoji format: `🐛 Fixes ...`, `🟢 95-100% confidence`, `Phase / 🧪 Tests / 🌐 Browser` table, and bold emoji Outcome/Caveat/Design/Verified sections | N/A: no PR |
| PR proof image hosting | no | If PR body needs browser proof, replace local image paths with hosted GitHub URLs or record N/A | N/A: no PR/browser proof |
| Tracker sync-back | no | Post concise issue/Linear sync after PR exists, or record N/A/blocker | N/A: no tracker |
| Final handoff contract | yes | Fill the final handoff fields below with exact PR/issue/confidence/tests/browser/outcome/caveats/design/verification content or N/A reason | filled below |
| Final lint | yes | Run `pnpm lint:fix` or scoped equivalent | scoped `ultracite fix` and final `ultracite check` passed |
| Output budget discipline | yes | Verify no unbounded high-volume command output was streamed, or record the accidental output and recovery | targeted `rg`/`sed`; capped outputs; one combined read truncated and was replaced by narrower reads |
| Timed checkpoint | no | If duration was requested, keep improving until elapsed, then finish the current loop cleanly; otherwise N/A | N/A: no duration requested |
| Goal plan complete | yes | Run `node .agents/skills/autogoal/scripts/check-complete.mjs docs/plans/2026-08-31-create-plate-review-skill.md` | run after this final plan update |
| Agent source / generated sync | yes | Run `pnpm install` when `.agents/rules/**` changed and verify generated mirrors | passed; Codex and Claude generated contents match source |
| Agent action discoverability | yes | Source-audit the skill/rule path an agent will read | `.agents/AGENTS.md`, root `AGENTS.md`, generated skill, argument hint, and package command all expose the action |
| Agent-native review | yes | Load `.agents/skills/agent-native-reviewer/SKILL.md` and close accepted findings, or record N/A | PASS; no accepted actionable findings remain |

Phase / pass table:
| Phase | Status | Evidence | Next |
|-------|--------|----------|------|
| Intake and source read | completed | owner overlap, generator, skill-creator, and scoring method read | implementation |
| Implementation | completed | source rule, routing, scorer, tests, package command, generated mirrors | verification |
| Verification | completed | 8/8 tests, Skiller sync, scoped lint, Comments source witness, agent-native review | closeout |
| PR / tracker sync | completed | N/A: no PR or tracker requested | final response |
| Closeout | completed | plan contract filled; completion checker next | final response |

Findings:
- No existing skill owns reproducible current-system architecture scoring across the requested scopes. The independent owner gap is real.
- Plate Next's score-100 rows judge migration/file adoption, not whole-system architecture quality; reusing them would be a category error.
- The generic skill-creator validator rejects Skiller's established `argument-hint` frontmatter on `best-api` as well as `plate-review`; repo Skiller generation and the local parity test are authoritative here.
- Current Comments source demonstrates why scope resolution matters: `BaseCommentPlugin` owns document anchors, while registry `discussionPlugin` owns application discussion state and `CommentCreateForm` writes the store and document marks. `plugin comment` and `entrypoint platejs/comment` must not share a score.

Decisions and tradeoffs:
- Create `plate-review`, not an `architecture-cleanup`, `best-api`, or `plate-next` alias. Its only authority is diagnosis, score receipts, hard-cut verdicts, and routing.
- Keep one self-contained skill entrypoint. The five modes share the same review method, so extra reference routing would add navigation without removing conditional complexity.
- Add one pure scorer rather than a schema/generator layer. It validates arithmetic and cap state while leaving evidence judgment to the reviewer.
- Separate architecture quality (/10), confidence (/100), and urgency (P0-P3). They answer different questions.
- Never average `all` results; rank independently scoreable units so a blocker cannot disappear inside a repo mean.

Implementation notes:
- `.agents/rules/plate-review.mdc` is the durable skill source.
- `.agents/AGENTS.md` owns routing and responsibility boundaries.
- `tooling/scripts/plate-review-score.mjs` emits self-contained schema-versioned receipts.
- `tooling/scripts/plate-review-score.test.mjs` covers arithmetic, caps, provisional/incomplete status, invalid inputs, CLI behavior, five modes, routing, and generated parity.
- `package.json` exposes `pnpm check:plate-review` as the first offline validation command.

Review fixes:
- Removed `disable-model-invocation`; it contradicted natural-language routing from `AGENTS.md`.
- Added confidence-dimension details and `schemaVersion: 1` so saved receipts reproduce their own math.
- Scoped the 2/10 Comments example to the full composition and explicitly prohibited copying that score to the narrower `platejs/comment` entrypoint.
- Expanded parity proof to both Codex and Claude mirrors plus generated root `AGENTS.md`.

Error attempts:
| Error / failed attempt | Count | Next different move | Resolution |
|------------------------|-------|---------------------|------------|
| `python` command missing for generic validator | 1 | use installed `python3` | validator ran |
| generic validator rejects repo-supported `argument-hint` | 1 | compare against established `best-api`, then use repo Skiller and local contract proof | confirmed validator incompatibility; repo validation passes |
| initial test regex escaped a backtick inside a template literal | 1 | replace fragile regex with direct heading inclusion | 8/8 tests pass |

Verification evidence:
- `pnpm install` -> Skiller apply and required resource sync passed.
- `pnpm check:plate-review` -> 8/8 tests passed.
- `pnpm exec ultracite check tooling/scripts/plate-review-score.mjs tooling/scripts/plate-review-score.test.mjs` -> passed.
- Comments composition scorer receipt -> raw 2.5, wrong-owner and duplicate-truth caps, final 2.0/10.
- Current source witness -> `BaseCommentPlugin` persists document anchor properties; registry `discussionPlugin` stores discussions/users; `CommentCreateForm` mutates discussion state and document marks.
- Agent-native capability map -> PASS: user action -> `$plate-review`/scorer -> source rule/tool -> Codex+Claude/root mirrors -> `pnpm check:plate-review` -> read-only handoff.

Final handoff contract:
- PR line: N/A: no PR requested
- Issue / tracker line: N/A: no tracker
- Confidence line: 96/100
- Flow table:
  - Reproduced: Comments-composition 2/10 cap fixture passes; browser N/A
  - Verified: 8/8 contract tests and generated parity pass; browser N/A
- Browser check: N/A: no browser surface
- Outcome: `plate-review` is generated and callable with all/plugin/entrypoint/package/surface scopes.
- Caveat: the generic global validator cannot parse the repo's established `argument-hint`; repo-local Skiller and contract proof pass.
- Design:
  - Chosen boundary: read-only architecture diagnosis and deterministic scoring, followed by exact owner routing.
  - Why not quick patch: adding a score paragraph to `best-api` would mix current-system diagnosis with ideal public call-shape ownership.
  - Why not broader change: implementation, migration, external comparison, and diff review already have owners.
- Verified: source/mirror sync, action discovery, arithmetic/caps, invalid states, and scoped lint.
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
- Issue / tracker: N/A: no tracker
- Browser proof: N/A: no browser surface
- Caveats: generic quick validator rejects repo-supported extended frontmatter; local authoritative validation passes

Timeline:
- 2026-08-31T10:11:57.813Z Task goal plan created.
- 2026-08-31 Source topology and owner overlap audited; independent read-only review job accepted.
- 2026-08-31 Skill source, routing, deterministic scorer, tests, and package command implemented.
- 2026-08-31 Skiller generated Codex/Claude/root mirrors; 8/8 checks and scoped lint passed.
- 2026-08-31 Agent-native review passed with no actionable findings.

Reboot status:
| Question | Answer |
|----------|--------|
| Where am I? | Closeout complete; final completion check remains |
| Where am I going? | Final response |
| What is the goal? | Deliver a reproducible five-scope Plate architecture review skill with deterministic scoring and clear routing |
| What have I learned? | See Findings |
| What have I done? | Implemented and verified the source rule, generated mirrors, scorer, tests, routing, and agent-native action |

Open risks:
- No product/runtime risk. Future audit scores still depend on honest evidence grades; the scorer deliberately cannot automate architecture judgment.
