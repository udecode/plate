# Audit registry memo and display names

Objective:
Audit registry React.memo and displayName; done when every source occurrence is classified with evidence; plan docs/plans/2026-08-23-audit-registry-memo-and-display-names.md.

Flow mode:
one-shot execution

Goal plan:
docs/plans/2026-08-23-audit-registry-memo-and-display-names.md

Template:
docs/plans/templates/task.md

Primary template:
docs/plans/templates/task.md

Applied packs:
- none

Task source:
- type: direct user request
- id / link: N/A: no external ticket or tracker
- title: Harsh honest feedback registry audit of React.memo and displayName under React 19 and React Compiler
- acceptance criteria: exhaustively count and classify every relevant authored registry occurrence; explain whether each pattern has a proven identity, performance, or debugging contract; give a blunt retain/remove verdict without editing product source.

First checkpoint:
- Before implementation or broad exploration, copy every explicit prompt
  requirement into this plan as checkable checkpoints: scope, non-goals,
  timing/duration, stop conditions, deliverables, final handoff sections,
  verification surface, and success criteria.
- Do not continue into implementation until this extraction is complete or
  explicitly marked N/A with reason.

Timed checkpoint:
- requested duration: N/A: none requested
- semantics: N/A: none requested
- initial confidence score: N/A: exact source-occurrence classification is the metric
- improvement loop: N/A: one-shot read-only audit
- final score / loop closure: N/A: completion is exhaustive classification

Completion threshold:
- Every authored `React.memo`/`memo(...)` and `.displayName` occurrence under `apps/www/src/registry` is counted, inspected in context, and classified as retain, remove, or unrelated, with any strict reference-identity or debug-label contract cited from its consumer.
- The final report states why React 19 and React Compiler change the default, separates compiler optimization from semantic identity and DevTools naming, and gives the highest-value cleanup order.
- Task closure is legal only when the source-of-truth acceptance criteria are
  satisfied or explicitly narrowed, required verification evidence is recorded,
  code-review and release-artifact gates are closed when applicable, tracker/PR
  sync is complete or marked N/A with reason, and
  `node .agents/skills/autogoal/scripts/check-complete.mjs docs/plans/2026-08-23-audit-registry-memo-and-display-names.md` passes.

Verification surface:
- Source audit with scoped `rg` counts/file lists under `apps/www/src/registry`, plus contextual reads of every match and its direct consumers.
- Cross-check React Compiler enablement and React version requirements from current repository configuration.

Constraints:
- Preserve existing user-facing behavior outside the task scope.
- Prefer the durable ownership boundary over caller-by-caller patches.
- Do not create PRs, comments, commits, or pushes unless the task/user/skill
  requires them.
- Do not add broad ceremony when the task is trivial or docs-only.
- Read-only product audit: do not change registry/package source, behavior, public API, generated output, git state, PRs, or trackers.
- Harsh honest feedback: lead with the verdict and call out cargo-cult patterns directly.

Boundaries:
- Source of truth: authored source under `apps/www/src/registry`, current React/package configuration, current React Compiler configuration, and direct consumers of matched symbols.
- Allowed edit scope: this goal plan only; product source is read-only.
- Browser surface: N/A: static source audit with no behavior change.
- Browser strategy: N/A: no browser-facing change or runtime claim. Use Browser for normal app QA; use Chrome directly
  for native downloads, print/print-preview, file picker/uploads, clipboard,
  browser dialogs/permissions, extension/profile state, or exact Chrome
  rendering; use Computer Use only for native Chrome/OS UI that needs visual
  inspection after Chrome automation cannot read it.
- Tracker sync: N/A: no tracker was supplied and no mutation was requested.
- Non-goals: implementing cleanup, profiling every component, auditing generated registry output, classic-surface modernization, package-wide React patterns outside registry, commits, pushes, or PRs.

Output budget strategy:
- Count and list files before printing matches; limit searches to authored `apps/www/src/registry`; exclude generated `apps/www/src/__registry__`, public build output, templates, dependencies, and logs; inspect only bounded context around each match.

Blocked condition:
- Stop only if current source or compiler/package configuration is unreadable, or a matched identity contract depends on unavailable external code that cannot be proven locally.

Task state:
- task_type: read-only source audit
- task_complexity: normal
- current_phase: closeout
- current_phase_status: completed
- next_phase: final response
- goal_status: complete

Current verdict:
- verdict: Under the requested React 19 plus Compiler contract, remove all 8 registry memo wrappers and all 10 displayName assignments; enforce Compiler coverage first because the current repo does not honestly guarantee it in every registry runtime.
- confidence: high: exhaustive current source count, direct consumer reads, current target-19 Compiler diagnostics, config audit, history, and official React semantics agree.
- next owner: plate-ui
- reason: Plate registry React/component doctrine owns the decision.

Completion rule:
- Do not call `update_goal(status: complete)` while any required checklist item
  remains unchecked. If an item does not apply, check it and add `N/A: <reason>`.
- Do not call `update_goal(status: complete)` until every completion threshold
  above is satisfied, final handoff evidence is recorded, and
  `node .agents/skills/autogoal/scripts/check-complete.mjs docs/plans/2026-08-23-audit-registry-memo-and-display-names.md` passes.
- Do not create hook state for this goal. This file plus the active goal are the
  durable state.

Start Gates:
| Gate | Applies | Evidence |
|------|---------|----------|
| Prompt requirements captured before work | yes | Scope is authored registry `React.memo` and `.displayName`; deliverable is harsh source-backed feedback under the stated React 19 plus Compiler contract; implementation is out of scope. |
| Timed checkpoint parsed | no | N/A: no duration requested |
| Skill analysis before edits | yes | Read `autogoal`, `plate-ui`, `shadcn`, `plate-ui/rules/react-performance.md`, and `plate-ui/references/component-audit.md` before product-source exploration. |
| Active goal checked or created | yes | `get_goal` returned null; created the matching audit goal. |
| Source of truth read before edits | yes | Read every match and direct JSX consumer, current app/package/compiler config, Oxlint override rationale, prior hard-cut plan, relevant history, fresh target-19 logger output, and official React memo guidance. |
| Tracker comments and attachments read | no | N/A: no tracker or attachment supplied. |
| Video transcript evidence required | no | N/A: no video supplied. |
| `docs/solutions` checked for non-trivial existing-code work | no | N/A: read-only pattern audit, not implementation or bug repair. |
| TDD decision before behavior change or bug fix | no | N/A: no behavior change. |
| Branch decision for code-changing task | no | N/A: no product code change. |
| Release artifact decision | no | N/A: no product or registry source change. |
| Browser tool decision for browser surface | no | N/A: static audit only. |
| PR expectation decision | no | N/A: user requested an audit, not a PR. |
| Tracker sync expectation decision | no | N/A: no tracker in scope. |
| Output budget strategy recorded | yes | Scoped counts/file lists first; authored registry only; bounded contextual reads. |

Work Checklist:
- [x] N/A: no duration was requested.
- [x] First checkpoint complete: every explicit requirement, boundary, deliverable, verification surface, and success criterion is captured above.
- [x] Short objective, outcome, threshold, verification surface, constraints, boundaries, and blocked condition are concrete.
- [x] Task source is classified with acceptance criteria, likely files, browser decision, and root-cause layer.
- [x] N/A: no video or screen recording was supplied.
- [x] Read `plate-ui`, `shadcn`, React performance rules, component audit, current config, all direct consumers, history, and the existing hard-cut plan.
- [x] N/A: read-only audit; no product implementation was requested.
- [x] Release artifacts are N/A because no product or registry source changed.
- [x] Final handoff is verdict first, counted inventory, per-owner disposition, configuration conflict, cleanup order, and residual risk; PR/tracker sections are N/A.
- [x] Branch handling is N/A because no product code change was authorized.
- [x] Local-env-rot retry is N/A because no repo-wide product check failed and no install-corruption signal appeared.
- [x] Workspace authority recorded: local proof ran in `/Users/zbeyens/git/plate-2`; official React docs own Compiler semantics.
- [x] High-risk note: deleting hot-path wrappers before Compiler coverage is enforced could regress development or downstream copied-code performance; the custom ColorPicker comparator can already retain stale callback and DOM props.
- [x] P1 autoreview is N/A because this is a read-only audit with no product patch.
- [x] Agent-native review is N/A because no agent rules, skills, hooks, prompts, or tooling changed.
- [x] Output discipline followed after two over-broad reads were cut down; authoritative searches used counts, exact files, and bounded slices.

Completion Gates:
| Gate | Applies | Required action | Evidence |
|------|---------|-----------------|----------|
| Named verification threshold | yes | Run the command, proof, source audit, or artifact check named in this plan | Scoped audit found exactly 8 `React.memo`, 10 `.displayName`, zero imported `memo`; all 8 bodies emitted current target-19 `CompileSuccess`. |
| Bug reproduced before fix | no | Record failing test/repro or N/A with reason | N/A: audit only; no fix attempted. The ColorPicker comparator omission is proven statically against its declared props. |
| Targeted behavior verification | no | Run focused test/proof for changed behavior or record N/A | N/A: no behavior changed. |
| TypeScript or typed config changed | no | Run relevant typecheck | N/A: no typed product/config source changed. |
| Package exports or file layout changed | no | Run `pnpm brl` before final verification and keep generated barrel updates | N/A: no export or layout change. |
| Package manifests, lockfile, or install graph changed | no | Run `pnpm install` and relevant package checks | N/A: no manifest, lockfile, or install-graph change. |
| Agent rules or skills changed | no | Run `pnpm install` and verify generated skill sync | N/A: read-only agent-doctrine audit. |
| Workspace authority proof | yes | Run verification in the owning repo/package/app/route/tool and record cwd; do not count the wrong workspace as proof | All local evidence ran in `/Users/zbeyens/git/plate-2`; official React docs support Compiler and comparator semantics. |
| Browser surface changed | no | Capture Browser proof for normal app surfaces, or Chrome/Computer proof for native browser/OS surfaces | N/A: no browser surface changed. |
| Browser final proof | no | Attach Browser/Chrome/Computer proof or exact caveat when browser proof applies | N/A: static read-only audit. |
| CI-controlled template output changed | no | Restore generated template output or record why it is intentionally kept | N/A: no template output touched. |
| Package behavior or public API changed | no | Add a changeset or record why no changeset applies | N/A: no package change. |
| Registry-only component work changed | no | Update `docs/components/changelog.mdx` or record N/A | N/A: registry source was not edited. |
| Docs or content changed | no | For docs-heavy work, use `--template docs`; for incidental docs, verify source-backed claims, links, examples, and rendered output or record N/A | N/A: only this internal goal plan was updated. |
| High-risk mini gate | yes | For public API/runtime/package-boundary/browser/agent-action/command-contract changes, record realistic failure mode, proof plan, and why the chosen boundary is right; otherwise N/A | Recommendation requires Compiler coverage enforcement before deletion; hot paths need focused performance/browser proof; ColorPicker comparator risks stale props today. |
| Agent-native review for agent/tooling changes | no | For `.agents/**`, `.claude/**`, `.codex/**`, skills, hooks, commands, prompts, or user-action tooling, load `.agents/skills/agent-native-reviewer/SKILL.md` and close accepted/actionable findings, or record N/A | N/A: no agent/tooling change. |
| Local install corruption suspected | no | Run `pnpm run reinstall` once, rerun the exact failing command, or record N/A | N/A: no corruption signal. |
| P1 autoreview for non-trivial implementation changes | no | Load `.agents/skills/autoreview/SKILL.md`; pass `--max-priority P1` with dirty local `--mode local`, branch/PR `--mode branch --base <base>`, or committed slice `--mode commit --commit <ref>`; fix and rerun within the hard cap of three helper invocations for one unchanged scope, then stop and report any remaining accepted/actionable findings; use P2 or P3 only when explicitly requested, or record N/A for docs-only/trivial/no local patch | N/A: no implementation patch. |
| PR create or update | no | Run `check` before PR work and sync PR body to the task-style final handoff | N/A: no PR requested. |
| Task-style PR body verified | no | Verify the PR body with `gh pr view --json body`; it must preserve auto-release blocks when applicable, must not include a current-PR self-link, and must use the kitcn PR #270 emoji format: `🐛 Fixes ...`, `🟢 95-100% confidence`, `Phase / 🧪 Tests / 🌐 Browser` table, and bold emoji Outcome/Caveat/Design/Verified sections | N/A: no PR. |
| PR proof image hosting | no | If PR body needs browser proof, replace local image paths with hosted GitHub URLs or record N/A | N/A: no PR or image proof. |
| Tracker sync-back | no | Post concise issue/Linear sync after PR exists, or record N/A/blocker | N/A: no tracker supplied. |
| Final handoff contract | yes | Fill the final handoff fields below with exact PR/issue/confidence/tests/browser/outcome/caveats/design/verification content or N/A reason | Filled below with audit verdict, evidence, caveat, and cleanup boundary. |
| Final lint | no | Run `pnpm lint:fix` or scoped equivalent | N/A: no product source change; repo-wide autofix would be unauthorized. |
| Output budget discipline | yes | Verify no unbounded high-volume command output was streamed, or record the accidental output and recovery | Two over-broad reads were truncated; subsequent searches excluded generated/raw paths and used counts, exact files, and bounded slices. |
| Timed checkpoint | no | If duration was requested, keep improving until elapsed, then finish the current loop cleanly; otherwise N/A | N/A: no duration requested. |
| Goal plan complete | yes | Run `node .agents/skills/autogoal/scripts/check-complete.mjs docs/plans/2026-08-23-audit-registry-memo-and-display-names.md` | Final rerun passes after this evidence row is recorded. |

Phase / pass table:
| Phase | Status | Evidence | Next |
|-------|--------|----------|------|
| Intake and source read | completed | Requirements, skills, current config, all matches/consumers, history, prior plan, and official React docs read. | source classification |
| Implementation | completed | N/A: user requested read-only audit; no product source changed. | verification |
| Verification | completed | 8 memo, 10 displayName, zero imported memo; 8/8 target-19 CompileSuccess. | closeout |
| PR / tracker sync | completed | N/A: no PR or tracker requested. | final response |
| Closeout | completed | Findings, dispositions, configuration conflict, risk, and cleanup order recorded. | final response |

Findings:
- Current authored registry contains 8 `React.memo` wrappers across 6 files and 10 `.displayName` assignments across 7 files; there are no imported/aliased `memo` calls.
- Seven ordinary wrappers are pure render-skip optimizations: `AIChatEditor`, `ColumnDragHandle`, `DragHandle`, `DropLine`, `EmojiButton`, `RowOfButtons`, and `TableCellResizeControls`. None is passed to a subscription, registry, imperative adapter, cache, or third-party identity API; all are rendered as JSX.
- `ColorPicker` is the sole custom comparator. It compares only `color`, `colors`, `recentColors`, and `updatedColor`, but the component also accepts `className`, three callback props, and arbitrary div props. It can keep stale callbacks and DOM props, exactly the custom-comparator failure React warns about.
- All eight component bodies emitted `CompileSuccess` in a fresh target-19 diagnostic run. This proves source eligibility, not actual coverage in every build.
- Current coverage contradicts the requested hard requirement: `apps/www` uses `reactCompiler: !isDev`; registry installation docs do not state Compiler as a consumer requirement; shared package config still targets 18; Oxlint globally disables its coarse no-manual-memoization rule.
- Seven display names annotate memo wrappers with anonymous inner arrows. Their only current value is DevTools labeling; remove the wrappers and use named functions. The other three annotate already named bindings/declarations (`InlineComboboxInput`, `Editor`, `EditorView`) and are pure dead churn. No runtime code reads these properties.
- Only `TableCellResizeControls` has any historical performance claim: commit `a18141cd58c` introduced it in a large-table performance packet. No isolated benchmark or test proves the memo wrapper itself is required. The remaining wrapper history has generic `docs`, `fix`, or `v2` messages and no local rationale.

Decisions and tradeoffs:
- Delete `.displayName` independently of Compiler coverage; use named component functions where labels matter.
- Do not claim all `React.memo` wrappers are safely removable merely because the plugin is installed. Enforce the requested Compiler contract first, then delete all eight because each body is Compiler-eligible and none owns semantic identity.
- Prioritize the unsafe `ColorPicker` comparator, then trivial wrappers, then hot-path wrappers with focused performance/browser proof.

Implementation notes:
- Read-only audit. Suggested implementation order: enforce Compiler coverage/doctrine/check; remove all ten display names; delete `ColorPicker` comparator; delete trivial/ordinary wrappers; run focused emoji, DnD, AI preview, color menu, and large-table performance/browser proof.

Review fixes:
- Rejected the blanket claim that React Compiler is already a hard repo invariant: current config disproves it.
- Kept `useMemo`/`useCallback` outside scope because their observable identity contracts require a different per-consumer audit.

Error attempts:
| Error / failed attempt | Count | Next different move | Resolution |
|------------------------|-------|---------------------|------------|
| `shadcn info` run at monorepo root | 1 | Pass the owning workspace with `-c apps/www` | Project context read successfully. |
| Unquoted shell glob for plugin files | 1 | Search the exact registry directory instead of a shell-expanded optional glob | Current docs/config search completed. |
| Doctrine/history reads were too broad and tool-truncated | 2 | Exclude generated/raw outputs; use exact plan slices, counts, symbols, and commit IDs | Authoritative evidence was re-read in bounded form. |

Verification evidence:
- `rg` source audit in `/Users/zbeyens/git/plate-2`: `React.memo=8`, `.displayName=10`, imported memo files `=0`.
- `node tmp/react-compiler-plan/compiler-coverage.mjs`: 142 files, zero transform errors; focused query matched `CompileSuccess` for all eight registry memo bodies.
- Config audit: `apps/www/next.config.ts` has `reactCompiler: !isDev`; `apps/www/package.json` has React `19.2.4`; shared package transform still targets 18; Oxlint manual-memo rule is off with an identity rationale.
- Direct source/consumer audit and whole-workspace `.displayName` read search found no identity owner or runtime display-name reader for registry matches.
- Official React `memo` reference confirms Compiler-equivalent component memoization and requires custom comparators to compare every prop, including functions.

Final handoff contract:
- PR line: N/A: no PR requested or created
- Issue / tracker line: N/A: no tracker supplied
- Confidence line: high
- Flow table:
  - Reproduced: static source/config defect proof; browser N/A
  - Verified: exact source counts plus 8/8 target-19 Compiler success; browser N/A
- Browser check: N/A: no runtime or source change
- Outcome: remove all 8 memo wrappers and all 10 display names under an enforced Compiler baseline; ColorPicker comparator is the first-risk owner.
- Caveat: the baseline is requested but not yet mechanically true in apps/www development or arbitrary copied-registry consumers.
- Design:
  - Chosen boundary: coverage-first hard cut, then zero shipped registry memo/displayName.
  - Why not quick patch: blindly deleting hot-path wrappers while development/downstream coverage is unproved would turn doctrine into a performance gamble.
  - Why not broader change: `useMemo`/`useCallback` identity semantics are a separate audit.
- Verified: every authored registry occurrence classified with current source and Compiler evidence.
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
- PR: N/A
- Issue / tracker: N/A
- Browser proof: N/A: read-only static audit
- Caveats: Compiler requirement is not yet an enforced repo/registry-consumer invariant.

Timeline:
- 2026-08-23T13:26:46.402Z Task goal plan created.
- 2026-08-23T13:40Z Exhaustive registry counts and contextual reads completed.
- 2026-08-23T13:43Z Fresh target-19 Compiler diagnostic completed with all eight memo bodies compiling.
- 2026-08-23T13:50Z Config/history/official-doc audit and final dispositions completed.

Reboot status:
| Question | Answer |
|----------|--------|
| Where am I? | Closeout complete; ready for final response. |
| Where am I going? | Deliver the harsh audit and recommended cleanup order. |
| What is the goal? | Classify every registry React.memo and displayName occurrence under the React 19 plus Compiler requirement. |
| What have I learned? | All 8 wrappers are Compiler-eligible optimization only; 10 display names are removable; current Compiler coverage is not yet an honest invariant; ColorPicker comparator is unsafe. |
| What have I done? | Counted and inspected every occurrence, traced consumers/history, refreshed target-19 diagnostics, verified config, and recorded dispositions. |

Open risks:
- The audit does not claim runtime performance after deletion because no product patch or browser/benchmark proof was authorized.
- The existing temp Compiler diagnostic inventory controls file coverage from its August 19 source list; every currently matched registry owner is included and refreshed, but this is not yet a durable CI contract.
