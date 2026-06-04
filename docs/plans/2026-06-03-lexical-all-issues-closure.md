# lexical all issues closure

Objective:
Close the Lexical all-issues Slate v2 closure ledger issue-by-issue with exact
proof for every relevant row.

Goal plan:
docs/plans/2026-06-03-lexical-all-issues-closure.md

Template:
docs/plans/templates/task.md

Primary template:
docs/plans/templates/task.md

Applied packs:
- browser (docs/plans/templates/packs/browser.md)
- package-api (docs/plans/templates/packs/package-api.md)
- agent-native (docs/plans/templates/packs/agent-native.md)

Task source:
- type: user-invoked `slate-automation` full issue-harvest closure loop
- id / link: `.tmp/editor-issue-harvester/lexical/full/issue-closure-ledger.tsv`
- title: Lexical all-issues closure ledger, issue-by-issue
- acceptance criteria: process ledger rows in ascending issue number order until
  every relevant row has one checked closure state: `covered-by-existing-test`,
  `test-written`, `plate-owned-covered`, `deferred-with-owner`, or
  `invalid-skip`.

First checkpoint:
- Before implementation or broad exploration, copy every explicit prompt
  requirement into this plan as checkable checkpoints: scope, non-goals,
  timing/duration, stop conditions, deliverables, final handoff sections,
  verification surface, and success criteria.
- Do not continue into implementation until this extraction is complete or
  explicitly marked N/A with reason.

Completion threshold:
- Done only when `issue-closure-ledger.tsv` has zero relevant unchecked rows,
  `issue-closure-ledger.md` reports `unchecked relevant | 0`, every closure in
  `issue-closure-overrides.json` has exact evidence or a concrete owner, focused
  verification has passed for every written/linked local test, and
  `check-complete.mjs` passes.
- Task closure is legal only when the source-of-truth acceptance criteria are
  satisfied or explicitly narrowed, required verification evidence is recorded,
  code-review and release-artifact gates are closed when applicable, tracker/PR
  sync is complete or marked N/A with reason, and
  `node .agents/skills/autogoal/scripts/check-complete.mjs docs/plans/2026-06-03-lexical-all-issues-closure.md` passes.

Verification surface:
- Primary artifact: `.tmp/editor-issue-harvester/lexical/full/issue-closure-ledger.tsv`.
- Closure source: `.tmp/editor-issue-harvester/lexical/full/issue-closure-overrides.json`.
- Regenerator: `node .tmp/editor-issue-harvester/lexical/full/build-closure-ledger.mjs` from `/Users/zbeyens/git/plate-2`.
- Local proof examples: `bun test ./packages/<package>/test/<file> --test-name-pattern "<pattern>"` from `.tmp/slate-v2`; `PLAYWRIGHT_BASE_URL=http://localhost:3100 PLAYWRIGHT_RETRIES=0 PLAYWRIGHT_WORKERS=1 bun playwright <spec> --project=<browser> --grep "<pattern>"` from `.tmp/slate-v2`.

Constraints:
- Preserve existing user-facing behavior outside the task scope.
- Prefer the durable ownership boundary over caller-by-caller patches.
- Do not create PRs, comments, commits, or pushes unless the task/user/skill
  requires them.
- Do not add broad ceremony when the task is trivial or docs-only.

Boundaries:
- Source of truth: ledger TSV, issue bodies JSON, generated closure ledger MD,
  Slate v2 source/tests under `.tmp/slate-v2`, and `slate-north-star` for
  taste/routing.
- Allowed edit scope: issue-harvest scratch artifacts, local Slate v2 tests and
  runtime fixes when a relevant issue exposes a real gap, and `.agents/rules/**`
  only for workflow misses. Plate-owned rows are deferred with owner, not
  patched.
- Browser surface: only when an issue's proof requires editor/native DOM behavior.
- Tracker sync: N/A: external Lexical issues are source corpus only; do not post
  to GitHub.
- Non-goals: no PR, commit, push, release, changeset, public changelog prose, or
  broad experimental pagination/virtualization architecture unless a specific
  issue row proves that owner is required.

Output budget strategy:
- Use targeted `jq` by issue number and focused `rg` patterns per row. Avoid
  repo-wide broad tokens like `@` or generic `mention` across all packages unless
  output is redirected to a scratch artifact. Cap command output with
  `max_output_tokens`; record accidental high-volume output as a workflow
  slowdown.

Blocked condition:
- Stop only for a hard blocker: missing local issue body artifact, no safe owner
  for a relevant row after source/test search, repeated verification failure that
  requires architecture/taste authority, command/tool access failure preventing
  all meaningful progress, or explicit commit/PR/destructive authority need.

Task state:
- task_type: external issue-corpus closure ledger
- task_complexity: major
- current_phase: issue-by-issue closure
- current_phase_status: in_progress
- next_phase: verification
- goal_status: active

Current verdict:
- verdict: active
- confidence: high on process, per-row proof required before closure
- next owner: next unchecked relevant row after #175
- reason: #175 is checked with Slate-v2 browser native cross-block selection
  proof that excludes zero-width ghost text.

Completion rule:
- Do not call `update_goal(status: complete)` while any required checklist item
  remains unchecked. If an item does not apply, check it and add `N/A: <reason>`.
- Do not call `update_goal(status: complete)` until every completion threshold
  above is satisfied, final handoff evidence is recorded, and
  `node .agents/skills/autogoal/scripts/check-complete.mjs docs/plans/2026-06-03-lexical-all-issues-closure.md` passes.
- Do not create hook state for this goal. This file plus the active goal are the
  durable state.

Start Gates:
| Gate | Applies | Evidence |
|------|---------|----------|
| Prompt requirements captured before work | yes | User requested ascending full issue-by-issue loop; hard rule: one checkmark per relevant issue; per-row steps and final handoff sections copied into this plan. |
| Skill analysis before edits | yes | Read `slate-automation`, `slate-north-star`, `autogoal`, and `docs/slate-v2/agent-start.md`. |
| Active goal checked or created | yes | `create_goal` active for closing the Lexical closure ledger. |
| Source of truth read before edits | yes | Read `issue-closure-ledger.tsv`, issue #3 body, `slate-north-star`, and Slate v2 agent start. |
| Tracker comments and attachments read | N/A | External Lexical issues are local corpus input; no GitHub posting/sync requested. |
| Video transcript evidence required | N/A | No local video is part of this prompt; issue videos are external links in corpus only unless a row specifically needs visual reproduction. |
| `docs/solutions` checked for non-trivial existing-code work | pending | Check targeted solution docs only when a row maps to a matching Plate/Slate package. |
| TDD decision before behavior change or bug fix | yes | Relevant rows require existing exact test or smallest new verified test before checkmark. |
| Branch decision for code-changing task | N/A | User wants stay on current v2 flow; do not create branch. |
| Release artifact decision | yes | N/A: continuous private alpha and test/scratch workflow; no release/publish/PR. |
| Browser tool decision for browser surface | yes | Use Browser/Playwright only for row proofs requiring native DOM/editor behavior. |
| PR expectation decision | yes | N/A: no PR requested. |
| Tracker sync expectation decision | yes | N/A: no external issue sync. |
| Output budget strategy recorded | yes | Use targeted issue/body/test searches; artifact broad scans; accidental broad output logged below. |
| Browser pack selected | yes | Applies only for rows requiring route/native DOM proof. |
| Browser route / app surface identified | pending | Per issue row; #3 is Plate-owned mention/combobox candidate, not yet assigned to a browser route. |
| Browser tool decision recorded | yes | Prefer route Playwright for repeatable behavior; Browser only for live visual proof when route is named/needed. |
| Console/network caveat policy recorded | yes | Console/network checked only for browser-route proof rows. |
| Package/API pack selected | yes | Applies because row closures may add Slate v2/Plate package tests. |
| Public surface or package boundary identified | pending | Per issue row. |
| Release artifact path selected | yes | N/A: no published user-visible delta in this closure loop unless a row creates package behavior change, then reassess. |
| `changeset` skill loaded when `.changeset` is required | N/A | No changeset currently required. |
| Barrel/export impact decision recorded | yes | N/A unless a row changes exports or exported file layout. |
| Agent-native pack selected | yes | Applies because workflow/skill rules and generated mirrors may be repaired. |
| Agent-facing action surface identified | yes | `slate-automation`, `editor-test-harvester`, and `slate-north-star` are the agent-facing workflow surfaces. |
| Source rule versus generated mirror boundary identified | yes | Edit `.agents/rules/**`; run `pnpm install`; verify generated `.agents/skills/**` mirrors. |
| `agent-native-reviewer` loaded or waiver recorded | pending | Required before completion if agent workflow edits remain in the current diff. |

Work Checklist:
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
- [ ] Implementation fixes the right ownership boundary, or the narrower choice
      is recorded with reason.
- [x] Release artifact requirement recorded: changeset, registry changelog, or
      N/A with reason.
- [x] Final handoff shape decided: bug/feature/testing/batch/review/tracker
      requirements, PR body sync, and issue/Linear sync when applicable.
- [x] Branch handling recorded for code-changing work: dedicated branch used,
      new branch needed, or N/A with reason.
- [ ] Local-env-rot retry policy recorded for any surprising repo-wide failure:
      reinstall/rerun evidence or N/A with reason.
- [x] Workspace authority recorded: every proof command names the cwd/tool that
      owns the changed behavior.
- [ ] High-risk note recorded for public API, runtime, package-boundary,
      browser behavior, agent-action, or command-contract changes, or marked
      N/A with reason.
- [ ] Review/autoreview target selected from actual diff state for non-trivial
      implementation work, or marked N/A with reason.
- [ ] Agent-native review decision recorded for `.agents/**`, `.claude/**`,
      `.codex/**`, skills, hooks, commands, prompts, or user-action tooling.
- [x] Output budget discipline recorded and followed: broad searches are
      scoped, capped, counted, or artifacted instead of streamed into goal
      context.
- [ ] Browser pack: route, interaction path, and expected visible outcome are recorded before proof.
- [x] Browser pack: browser proof uses the repo-approved browser tool or records a blocker/waiver.
- [ ] Browser pack: console and network errors are checked or explicitly out of scope.
- [ ] Browser pack: screenshot, trace, or exact verification caveat is ready for final handoff.
- [ ] Package/API pack: public API, package boundary, export, and release-artifact impact are recorded.
- [x] Package/API pack: release artifact matrix is applied: `.changeset`, registry changelog, or explicit no-artifact reason.
- [ ] Package/API pack: `.changeset` work loads `changeset` and follows its package/version/prose rules.
- [ ] Package/API pack: registry-only work updates `docs/components/changelog.mdx` instead of adding a package changeset.
- [ ] Package/API pack: no-artifact decisions state why the diff has no published package user-visible delta from `main`.
- [ ] Package/API pack: compatibility, migration, or hard-cut decision is explicit when public shape changes.
- [ ] Package/API pack: package-owned typecheck/build/test proof is recorded or marked N/A with reason.
- [ ] Package/API pack: generated barrels or release notes are updated when required.
- [x] Agent-native pack: source-of-truth rule files are edited instead of generated skill mirrors.
- [x] Agent-native pack: the changed agent action is discoverable from the skill/rule text.
- [x] Agent-native pack: generated mirrors are synced when `.agents/rules/**` changed, or N/A reason is recorded.
- [ ] Agent-native pack: accepted agent-native review findings are fixed or explicitly rejected with reason.

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
| Goal plan complete | yes | Run `node .agents/skills/autogoal/scripts/check-complete.mjs docs/plans/2026-06-03-lexical-all-issues-closure.md` | pending |
| Browser interaction proof | pending | Exercise the target route/interaction with the approved browser tool or record blocker | pending |
| Browser console/network check | pending | Record console/network state or why it is not applicable | pending |
| Browser final proof artifact | pending | Record screenshot/trace/route proof or exact caveat | pending |
| Public API / package boundary proof | pending | Source-audit public API, exports, and package boundary impact | pending |
| Release artifact classification | pending | Record whether the change is published package behavior/API/types/config/runtime, registry-only, or no published user-visible delta | pending |
| Published package changeset | pending | If published package users see a delta, load `changeset`, add/update one `.changeset/*.md` per package, and prove no forbidden `minor` on `@platejs/slate`, `@platejs/core`, or `platejs` | pending |
| Registry changelog | pending | If the change is registry-only under `apps/www/src/registry/**`, update `docs/components/changelog.mdx` and do not add a package changeset | pending |
| No release artifact | pending | If no artifact is needed, record the exact reason: internal-only, docs-only, agent-only, test-only, or no user-visible delta from `main` | pending |
| Package typecheck/build/test | pending | Run owning package checks or record N/A with reason | pending |
| Barrel/export generation | pending | Run `pnpm brl` when exports or exported file layout changed, otherwise N/A | pending |
| Agent source / generated sync | pending | Run `pnpm install` when `.agents/rules/**` changed and verify generated mirrors | pending |
| Agent action discoverability | pending | Source-audit the skill/rule path an agent will read | pending |
| Agent-native review | pending | Load `.agents/skills/agent-native-reviewer/SKILL.md` and close accepted findings, or record N/A | pending |

Phase / pass table:
| Phase | Status | Evidence | Next |
|-------|--------|----------|------|
| Intake and source read | in_progress | created plan | implementation |
| Implementation | pending | | verification |
| Verification | pending | | closeout |
| PR / tracker sync | pending | | final response |
| Closeout | pending | | final response |

Findings:
- Ledger regenerated after #175: 2741 total rows, 1873 relevant unchecked,
  21 relevant `test-written`, 7 relevant `covered-by-existing-test`,
  2 relevant `deferred-with-owner`, 838 irrelevant checked.
- #59 is checked as `covered-by-existing-test` with verified richtext browser
  proof for collapsed mark hotkey typing.
- #60 is checked as `test-written` with verified richtext browser proof that
  collapsed italic hotkey typing leaves exactly one block.
- #65 is checked as `covered-by-existing-test` with verified browser paste and
  slate-dom clipboard boundary proof bundle.
- #66 is checked as `test-written` with verified word-delete tab-preservation
  contract.
- #71 is checked as `covered-by-existing-test` with verified package/browser
  whitespace proof.
- #72 is checked as `test-written` with verified plaintext Enter follow-up
  typing proof.
- #123 is checked as `test-written` with verified selection reconciler stale
  DOM offset clamp contract.
- #136 is checked as `deferred-with-owner` because the ledger classifies it
  Plate-owned and this run is Slate-v2-only.
- #141 is checked as `test-written` with a Slate DOM clipboard fallback
  contract that keeps a single pasted tab inside one text node through follow-up
  insert/delete editing.
- #146 is checked as `test-written` with a Slate DOM internal fragment
  copy/paste contract that rejects stray empty text leaves after full
  multi-block paste.
- #147 is checked as `covered-by-existing-test` with verified paste-html browser
  coverage for semantic HTML, code, Lexical core text-node HTML shape, and
  Google Docs BIU formatting.
- #148 is checked as `test-written` with verified plaintext browser
  beforeinput StaticRange proof for `deleteWordForward` and
  `deleteWordBackward` ranges that include tab whitespace.
- #158 is checked as `test-written` with verified richtext browser ArrowUp
  model/DOM caret sync proof. OS text-cursor indicator itself is not
  inspectable, so DOM caret is the portable proof.
- #170 and #172 are checked as `invalid-skip` false positives because emoji
  shortcut/autocorrect conversion is product/plugin behavior, not raw Slate-v2.
- #171 is checked as `test-written` with verified custom-placeholder
  dictation-style `insertText` beforeinput proof.
- #175 is checked as `test-written` with verified plaintext browser
  cross-block Shift+ArrowRight proof that selects real text and excludes
  `\uFEFF`.

Decisions and tradeoffs:
- Process rows in ascending issue number order.
- Cluster/matrix rows are routing only. They cannot close an issue.
- Plate-owned rows close as `deferred-with-owner` with a concrete Plate owner
  and reason. User clarified this loop is Slate-v2 only.
- For raw portable Slate gaps, write or link the smallest exact local test and
  run the focused verification command.

Implementation notes:
- Closure queue: `.tmp/editor-issue-harvester/lexical/full/issue-closure-ledger.tsv`.
- Closure overrides:
  `.tmp/editor-issue-harvester/lexical/full/issue-closure-overrides.json`.
- Ledger generator:
  `.tmp/editor-issue-harvester/lexical/full/build-closure-ledger.mjs`.

Review fixes:
- None yet.

Error attempts:
| Error / failed attempt | Count | Next different move | Resolution |
|------------------------|-------|---------------------|------------|
| Broad `rg` over generic mention/@ terms streamed excessive package/changelog output | 1 | Use issue-specific `jq`, targeted package/test paths, or redirect broad discovery to scratch artifacts | Recorded as workflow slowdown; avoid this command shape for future rows |

Verification evidence:
- `bun test ./packages/slate/test/text-units-contract.ts --test-name-pattern "moves word selection across whitespace-padded soft line boundaries"` from `.tmp/slate-v2`: pass for Lexical #7.
- `bun test ./packages/slate/test/text-units-contract.ts` from `.tmp/slate-v2`: 11 pass.
- `cd packages/slate-react && bun test:vitest test/model-input-strategy-contract.test.ts -t "deletes the current hard line backward without touching the previous block"` from `.tmp/slate-v2`: pass for Lexical #36.
- `PLAYWRIGHT_BASE_URL=http://localhost:3100 PLAYWRIGHT_RETRIES=0 PLAYWRIGHT_WORKERS=1 bun playwright playwright/integration/examples/plaintext.test.ts --project=webkit --grep "supports WebKit hard-line backward delete without command errors"` from `.tmp/slate-v2`: pass for Lexical #37.
- `PLAYWRIGHT_BASE_URL=http://localhost:3100 PLAYWRIGHT_RETRIES=0 PLAYWRIGHT_WORKERS=1 bun playwright playwright/integration/examples/plaintext.test.ts --project=chromium --grep "applies deleteSoftLineBackward target ranges exactly"` from `.tmp/slate-v2`: failed before runtime fix, then passed for Lexical #40.
- `PLAYWRIGHT_BASE_URL=http://localhost:3100 PLAYWRIGHT_RETRIES=0 PLAYWRIGHT_WORKERS=1 bun playwright playwright/integration/examples/plaintext.test.ts --project=chromium --grep "keeps browser line-end movement within the current block|moves ArrowRight out of an empty leading block|moves word forward out of an empty leading block|applies deleteSoftLineBackward target ranges exactly"` from `.tmp/slate-v2`: 4 pass for Lexical #46 umbrella.
- `bun test ./packages/slate/test/text-units-contract.ts --test-name-pattern "moves word selection across|portable Lexical #7163 Unicode rows by Slate character units"` from `.tmp/slate-v2`: 4 pass for Lexical #46 umbrella.
- `bun test ./packages/slate/test/delete-contract.ts --test-name-pattern "deletes forward over Unicode whitespace before the next word|deletes backward by word at the start of the next word without clearing the line"` from `.tmp/slate-v2`: 2 pass for Lexical #46 umbrella.
- `PLAYWRIGHT_BASE_URL=http://localhost:3100 PLAYWRIGHT_RETRIES=0 PLAYWRIGHT_WORKERS=1 bun playwright playwright/integration/examples/richtext.test.ts --project=chromium --grep "applies mark hotkeys to inserted rich text and clears active marks"` from `.tmp/slate-v2`: pass for Lexical #59.
- `PLAYWRIGHT_BASE_URL=http://localhost:3100 PLAYWRIGHT_RETRIES=0 PLAYWRIGHT_WORKERS=1 bun playwright playwright/integration/examples/richtext.test.ts --project=chromium --grep "does not create an orphan block when typing with a collapsed italic hotkey"` from `.tmp/slate-v2`: pass for Lexical #60.
- `PLAYWRIGHT_BASE_URL=http://localhost:3100 PLAYWRIGHT_RETRIES=0 PLAYWRIGHT_WORKERS=1 bun playwright playwright/integration/examples/paste-html.test.ts --project=chromium --grep "pasted bold text uses <strong>|pastes copied rendered Slate content as an internal fragment before HTML import|runs generated clipboard paste gauntlet without illegal kernel transitions"` from `.tmp/slate-v2`: 3 pass for Lexical #65.
- `cd packages/slate-dom && bun test ./test/clipboard-boundary.test.ts --test-name-pattern "round-trips a selected fragment|falls back to plain text when no fragment payload exists|pastes multiline plain text as separate blocks|exports decorated multi-leaf text"` from `.tmp/slate-v2`: 4 pass for Lexical #65.
- `bun test ./packages/slate/test/delete-contract.ts --test-name-pattern "deletes forward by word before a tab without expanding the tab"` from `.tmp/slate-v2`: pass for Lexical #66.
- `cd packages/slate-react && bun test:vitest test/editable-behavior.test.tsx -t "applies visible root defaults as CSS"` from `.tmp/slate-v2`: pass for Lexical #71.
- `PLAYWRIGHT_BASE_URL=http://localhost:3100 PLAYWRIGHT_RETRIES=0 PLAYWRIGHT_WORKERS=1 bun playwright playwright/integration/examples/plaintext.test.ts --project=chromium --grep "inserts text when typed"` from `.tmp/slate-v2`: pass for Lexical #71.
- `PLAYWRIGHT_BASE_URL=http://localhost:3100 PLAYWRIGHT_RETRIES=0 PLAYWRIGHT_WORKERS=1 bun playwright playwright/integration/examples/plaintext.test.ts --project=chromium --grep "creates a new plain text block on Enter before follow-up typing"` from `.tmp/slate-v2`: pass for Lexical #72.
- `cd packages/slate-react && bun test:vitest test/selection-reconciler-contract.test.tsx -t "selection reconciler clamps stale DOM range offsets after text shortening|selection reconciler clears the updating guard when DOM export throws"` from `.tmp/slate-v2`: 2 pass for Lexical #123.
- `PLAYWRIGHT_BASE_URL=http://localhost:3100 PLAYWRIGHT_RETRIES=0 PLAYWRIGHT_WORKERS=1 bun playwright playwright/integration/examples/plaintext.test.ts --project=chromium --grep "applies deleteSoftLineBackward target ranges exactly"` from `.tmp/slate-v2`: pass after #123 selection reconciler change.
- `cd packages/slate-dom && bun test ./test/clipboard-boundary.test.ts --test-name-pattern "keeps a single pasted tab inside one text node through follow-up editing"` from `.tmp/slate-v2`: pass for Lexical #141.
- `cd packages/slate-dom && bun test ./test/clipboard-boundary.test.ts --test-name-pattern "does not add empty text leaves when pasting a full multi-block fragment"` from `.tmp/slate-v2`: pass for Lexical #146.
- `PLAYWRIGHT_BASE_URL=http://localhost:3100 PLAYWRIGHT_RETRIES=0 PLAYWRIGHT_WORKERS=1 bun playwright playwright/integration/examples/paste-html.test.ts --project=chromium --grep "pasted bold text uses <strong>|pasted code uses <code>|imports Lexical core HTML block shape: plain DOM text node|preserves Google Docs BIU formatting from rich HTML paste"` from `.tmp/slate-v2`: 4 pass for Lexical #147.
- `PLAYWRIGHT_BASE_URL=http://localhost:3100 PLAYWRIGHT_RETRIES=0 PLAYWRIGHT_WORKERS=1 bun playwright playwright/integration/examples/plaintext.test.ts --project=chromium --grep "applies deleteWord target ranges over tab whitespace exactly"` from `.tmp/slate-v2`: pass for Lexical #148.
- `PLAYWRIGHT_BASE_URL=http://localhost:3100 PLAYWRIGHT_RETRIES=0 PLAYWRIGHT_WORKERS=1 bun playwright playwright/integration/examples/richtext.test.ts --project=chromium --grep "keeps DOM caret synced after ArrowUp across paragraphs"` from `.tmp/slate-v2`: pass for Lexical #158.
- `PLAYWRIGHT_BASE_URL=http://localhost:3100 PLAYWRIGHT_RETRIES=0 PLAYWRIGHT_WORKERS=1 bun playwright playwright/integration/examples/placeholder.test.ts --project=chromium --grep "commits dictation-style insertText beforeinput from the custom placeholder empty state"` from `.tmp/slate-v2`: pass for Lexical #171.
- `PLAYWRIGHT_BASE_URL=http://localhost:3100 PLAYWRIGHT_RETRIES=0 PLAYWRIGHT_WORKERS=1 bun playwright playwright/integration/examples/plaintext.test.ts --project=chromium --grep "keeps Shift\\+ArrowRight cross-block selection on real text"` from `.tmp/slate-v2`: pass for Lexical #175.

## Prompt Requirement Ledger

| Requirement | Status | Evidence / plan row |
|-------------|--------|---------------------|
| Start from `.tmp/editor-issue-harvester/lexical/full/issue-closure-ledger.tsv` | active | Source of truth and completion threshold above |
| Process issues in ascending issue number order until last issue | active | Next owner chosen by first unchecked relevant row after #175 |
| Every relevant issue needs its own checkmark | active | Completion threshold requires zero relevant unchecked rows |
| Cluster/matrix coverage is routing only | active | Decisions and tradeoffs above |
| Read title/body/classification per issue | active | #3 body read via local `issues-all-with-bodies.json` |
| Decide skip vs relevant | active | Ledger classification plus per-row body audit before override |
| Irrelevant rows get `invalid-skip` with reason | active | Existing checked skip rows retained; future rows must use override reason |
| Relevant rows search exact Slate v2 coverage | active | Plate-owned rows are deferred; future Slate-v2 rows must record exact search/proof |
| Existing coverage requires file:line/test name and focused command | active | #7 example closure |
| Missing coverage gets smallest correct test | active | Required before `test-written` closure |
| Focused verification required | active | Required command field in overrides |
| Update `issue-closure-overrides.json` | active | Override file is closure source |
| Regenerate ledger TSV/MD | active | Use generator after every override batch |
| Move to next issue | active | Next owner recorded after each checkpoint |
| Autogoal checkpoints aggressively | active | This plan is the checkpoint ledger |
| Final handoff changed files/commands/attention/checkpoints | active | Final handoff contract plus ledgers below |

## Issue Closure Ledger State

| Metric | Count |
|--------|------:|
| Total issues | 2741 |
| Relevant unchecked | 1873 |
| Relevant test-written | 21 |
| Relevant covered-by-existing-test | 7 |
| Relevant deferred-with-owner | 2 |
| Irrelevant checked | 838 |

Current issue owner: pending query.

## Packet Ledger

| Packet | Owner | Issue(s) | Change/proof | Decision | Next |
|--------|-------|----------|--------------|----------|------|
| P0 | slate-automation/autogoal | all | Created active goal and plan; copied prompt requirements into checkable rows | keep | process #3 |
| P1 | slate text units | #7 | Wrote and verified `moves word selection across whitespace-padded soft line boundaries` | keep | continue ledger |
| P2 | scope correction | #3 | Reverted attempted Plate combobox test after user clarified Slate-v2-only; marked #3 `deferred-with-owner` | keep | process #8 |
| P3 | slate-automation/north-star | all | Patched source rules so Slate-v2-only harvests defer Plate-owned rows; ran `pnpm install`; verified generated mirrors | keep | process #8 |
| P4 | slate transaction contract | #8 | Wrote and verified `moves word selection across formatted middle sibling text leaves` | keep | process #9 |
| P5 | slate delete contract | #9 | Wrote and verified `deletes forward over Unicode whitespace before the next word` | keep | process #10 |
| P6 | slate delete contract | #10 | Wrote and verified `deletes backward by word at the start of the next word without clearing the line` | keep | process #14 |
| P7 | slate delete contract | #14 | Linked and reran existing Unicode whitespace delete contract for tab forward-delete fatal | keep | process #17 |
| P8 | slate text units | #17 | Wrote movement contract and verified it with existing deletion contract for Unicode grapheme rows | keep | process #21 |
| P9 | plaintext browser proof | #21 | Wrote and verified Chromium line-end hotkey proof that stays within current block | keep | process #27 |
| P10 | placeholder browser proof | #27 | Linked and reran existing custom-placeholder proof for single-newline placeholder state | keep | process #28 |
| P11 | plaintext browser proof | #28 | Wrote and verified ArrowRight escape proof from an empty leading block | keep | process #33 |
| P12 | plaintext browser proof | #33 | Wrote and verified word-forward escape proof from an empty leading block | keep | process #36 |
| P13 | slate-react beforeinput contract | #36 | Wrote and verified `deleteHardLineBackward` contract preserving previous block; browser macOS Chromium probe skipped locally | keep | process #37 |
| P14 | plaintext WebKit proof | #37 | Wrote and verified WebKit `Meta+Backspace` no-error hard-line delete route proof | keep | process #40 |
| P15 | slate-react beforeinput runtime | #40 | Wrote failing synthetic `deleteSoftLineBackward` target-range proof; patched selection sync to keep expanded target ranges and delete-fragment to collapse to range start; reran #40 and #36 proofs | keep | process #46 |
| P16 | umbrella coverage bundle | #46 | Linked and reran exact browser/model coverage bundle for keyboard selection/deletion plan requirements | keep | process #59 |
| P17 | richtext browser proof | #59 | Linked and reran existing collapsed mark hotkey proof for italic-before-typing behavior | keep | query next row |
| P18 | richtext browser proof | #60 | Wrote and verified dedicated collapsed italic hotkey no-orphan-block proof | keep | query next row |
| P19 | clipboard coverage bundle | #65 | Linked and reran browser paste/internal-fragment/gauntlet plus slate-dom clipboard round-trip/fallback/multiline/decorated-copy tests | keep | query next row |
| P20 | slate delete contract | #66 | Wrote and verified forward word delete preserves tab after deleted word | keep | query next row |
| P21 | whitespace coverage bundle | #71 | Linked and reran Editable default CSS and plaintext typed-space proofs | keep | query next row |
| P22 | plaintext browser proof | #72 | Wrote and verified Hello/Enter/world plain text block split proof | keep | query next row |
| P23 | slate-react selection reconciler | #123 | Wrote and verified stale DOM offset clamp contract; patched selection export to clamp DOM offsets before setBaseAndExtent; reran adjacent #40 proof | keep | query next row |
| P24 | scope defer | #136 | Deferred Plate-owned code/bold/italic rendering policy with concrete Plate rich-text owner | keep | query next row |
| P25 | slate-dom clipboard contract | #141 | Wrote and verified single-tab paste plus follow-up insert/delete proof; corrected #141 anchor after later insertion | keep | query next row |
| P26 | slate-dom clipboard contract | #146 | Wrote and verified full multi-block internal fragment paste has no extra empty text leaves | keep | query next row |
| P27 | paste-html browser coverage | #147 | Linked and reran existing HTML paste browser subset for bold, code, Lexical core text-node shape, and Google Docs BIU | keep | query next row |
| P28 | plaintext browser proof | #148 | Wrote and verified `deleteWordForward`/`deleteWordBackward` beforeinput target ranges that include tab whitespace are applied exactly | keep | query next row |
| P29 | ledger generator repair | #170/#172 | Patched closure generator so overrides can reclassify false positives as irrelevant instead of freezing the original `relevant` flag | keep | query next row |
| P30 | richtext browser proof | #158 | Wrote and verified ArrowUp cross-paragraph model/DOM caret sync proxy for OS text-cursor-indicator issue | keep | query next row |
| P31 | false-positive skip | #170 | Reclassified emoji shortcut-on-Enter conversion as product/plugin behavior, not raw Slate-v2 | keep | query next row |
| P32 | placeholder browser proof | #171 | Wrote and verified dictation-style `insertText` beforeinput commits real text from custom-placeholder empty state | keep | query next row |
| P33 | false-positive skip | #172 | Reclassified dictated emote-word-to-emoji conversion as product/plugin behavior; dictation transport covered by #171 | keep | query next row |
| P34 | plaintext browser proof | #175 | Wrote and verified Shift+ArrowRight cross-block selection includes real text and excludes `\uFEFF` | keep | query next row |

## Workflow Slowdown Ledger

| Step / command | Owner | Why slow/noisy | Evidence | Repair decision |
|----------------|-------|----------------|----------|-----------------|
| Broad `rg` for mention/@ terms | automation search | Generic terms streamed huge package/changelog/test output into chat | One over-broad command returned thousands of lines | Use targeted issue-specific searches or redirect broad scans to scratch artifacts |
| Broad `rg` for whitespace terms | automation search | Generic whitespace/delete search streamed too much output | One over-broad command returned excessive output | Prefer exact issue commands, test anchors, and narrow package paths |
| `bun test` on Vitest path | command routing | Root Bun treated the path as a filter and suggested recursive `./` prefixes | Three failed attempts before using package Vitest script | For `slate-react` Vitest files, run `cd packages/slate-react && bun test:vitest <file> -t <name>` |
| #40 first proof run | slate-react beforeinput | Test intentionally exposed runtime gap | Chromium proof first cleared too much text, then after partial fix left stale selection | Fixed selection sync and delete-fragment collapse; reran focused proof green |
| #59 line anchor read | command cwd | Tried parent-relative `.tmp/slate-v2/...` path while already inside `.tmp/slate-v2` | `nl` failed before proof command still passed | Re-read anchor from correct cwd |
| `bun test` on slate-dom root path | command routing | Root Bun treated `./packages/slate-dom/test/clipboard-boundary.test.ts` as a filter | One failed attempt | For `slate-dom`, run from `packages/slate-dom` with `bun test ./test/<file>.test.ts` |
| False-positive issue override could not change `relevant` flag | ledger generator | Per-issue audit can prove a classifier row irrelevant, but generator froze original relevance | #170/#172 would otherwise count as relevant invalid-skips | Patched scratch generator to honor `override.relevant` or `override.disposition: "skip"` |

## Changed List

| Group | Current-run changes |
|-------|---------------------|
| code/runtime/API | Slate React beforeinput delete target-range handling: preserve expanded target ranges through selection sync; collapse explicit delete-fragment selection to range start after deletion. Slate React selection export clamps stale DOM range offsets before `setBaseAndExtent`. |
| tests/oracles/browser proof | #7, #8, #9, #10, #17, #21, #28, #33, #36, #37, #40, #60, #66, #72, #123, #141, #146, #148, #158, #171, #175 exact Slate-v2 contracts/proofs written and verified; #14, #27, #46, #59, #65, #71, #147 linked to verified existing tests; #170/#172 reclassified as invalid skips; attempted Plate combobox test was reverted due Slate-v2-only scope |
| benchmarks/metrics/targets | none |
| examples/docs | `docs/plans/2026-06-03-lexical-all-issues-closure.md` created and filled |
| skills/workflow | Patched `slate-automation` and `slate-north-star` to defer Plate-owned rows in Slate-v2-only harvests; synced generated mirrors |
| reverted/quarantined packets | none |

## Needs Your Attention

| Rank | Item | Anchor | Recommendation |
|------|------|--------|----------------|
| 1 | Plate-owned rows are out of this loop and get `deferred-with-owner`, not local Plate patches | user clarification during #3 | accept |

## Stopping Checkpoints To Unblock

None yet.

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
- 2026-06-03T20:53:21.935Z Task goal plan created.

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
