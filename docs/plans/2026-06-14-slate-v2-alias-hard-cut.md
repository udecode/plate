# Slate v2 alias hard cut

Objective:
Remove Slate v2 public aliases; done when alias scans and package/API checks pass; plan docs/plans/2026-06-14-slate-v2-alias-hard-cut.md.

Flow mode:
one-shot execution

Goal plan:
docs/plans/2026-06-14-slate-v2-alias-hard-cut.md

Template:
docs/plans/templates/task.md

Primary template:
docs/plans/templates/task.md

Applied packs:
- docs (docs/plans/templates/packs/docs.md)
- package-api (docs/plans/templates/packs/package-api.md)

Task source:
- type: direct user command
- id / link: N/A
- title: Cut public aliases from Slate v2
- acceptance criteria: remove public alias exports/docs introduced or exposed by
  the current Slate v2 beta diff; keep one canonical public name per API;
  verify by source scans plus focused package/API checks.

First checkpoint:
- Before implementation or broad exploration, copy every explicit prompt
  requirement into this plan as checkable checkpoints: scope, non-goals,
  timing/duration, stop conditions, deliverables, final handoff sections,
  verification surface, and success criteria.
- Do not continue into implementation until this extraction is complete or
  explicitly marked N/A with reason.

Completion threshold:
- Public alias exports in the touched Slate v2 API surface are removed or turned
  into canonical source names.
- Public docs stop teaching aliases such as `useSlateRootState`,
  `EditableTextBlocks`, `EditableTextBlocksProps`,
  `EditableTextLeafProps`, `EditableTextRenderTextProps`,
  `EditableTextRenderPlaceholderProps`, `EditableRenderElementProps`, and
  `EditableRenderVoidProps`. Canonical names such as `Editable`,
  `EditableProps`, `RenderLeafProps`, `RenderTextProps`,
  `RenderPlaceholderProps`, `RenderElementProps`, and `RenderVoidProps`
  remain public.
- Source audit shows no public root alias exports remain in
  `packages/slate-react/src/index.ts` for the cut surface.
- Focused package/API checks pass.
- Task closure is legal only when the source-of-truth acceptance criteria are
  satisfied or explicitly narrowed, required verification evidence is recorded,
  code-review and release-artifact gates are closed when applicable, tracker/PR
  sync is complete or marked N/A with reason, and
  `node .agents/skills/autogoal/scripts/check-complete.mjs docs/plans/2026-06-14-slate-v2-alias-hard-cut.md` passes.

Verification surface:
- Source audit in `.tmp/slate-v2` using focused `rg` / `sed` over
  `packages/slate-react/src/index.ts`, public docs, and package docs.
- Focused `bun test ./packages/slate/test/public-surface-contract.ts`.
- `bun --filter ./packages/slate-react typecheck`.
- `bun typecheck:site`.
- `bun check` if source/type/doc changes require final fast gate.

Constraints:
- Preserve existing user-facing behavior outside the task scope.
- Prefer the durable ownership boundary over caller-by-caller patches.
- Do not create PRs, comments, commits, or pushes unless the task/user/skill
  requires them.
- Do not add broad ceremony when the task is trivial or docs-only.

Boundaries:
- Source of truth: current Slate v2 checkout under `.tmp/slate-v2`, especially
  public `slate-react` exports, docs, and public-surface contracts.
- Allowed edit scope: `.tmp/slate-v2/packages/slate-react/**`,
  `.tmp/slate-v2/docs/**`, `.tmp/slate-v2/packages/slate*/Readme.md`, focused
  tests/contracts, and this parent plan.
- Browser surface: N/A unless code changes affect runtime behavior. This is an
  API/docs hard cut.
- Tracker sync: N/A.
- Non-goals: no commit, PR, release, publish, changeset, pagination work, raw
  mobile work, or unrelated runtime refactor.

Output budget strategy:
- Use focused `rg` over `.tmp/slate-v2/packages/slate-react`, `.tmp/slate-v2/docs`,
  and package READMEs. Prefer filenames/counts before printing large matches.
  Avoid broad generated/tmp/build output.

Blocked condition:
- Block only if removing an alias would require a canonical API rename that is a
  taste decision not already implied by "I hate aliases, cut all of them now",
  or if focused proof reveals runtime breakage outside the alias surface.

Task state:
- task_type: hard-cut / package API cleanup
- task_complexity: normal
- current_phase: closeout
- current_phase_status: complete
- next_phase: final response
- goal_status: ready_for_completion

Current verdict:
- verdict: aliases should be cut at public API boundaries, not kept as compatibility shims
- confidence: high
- next owner: task
- reason: user explicitly rejected aliases during beta API review; public API is
  still pre-beta enough to hard-cut without migration shims.

Completion rule:
- Do not call `update_goal(status: complete)` while any required checklist item
  remains unchecked. If an item does not apply, check it and add `N/A: <reason>`.
- Do not call `update_goal(status: complete)` until every completion threshold
  above is satisfied, final handoff evidence is recorded, and
  `node .agents/skills/autogoal/scripts/check-complete.mjs docs/plans/2026-06-14-slate-v2-alias-hard-cut.md` passes.
- Do not create hook state for this goal. This file plus the active goal are the
  durable state.

Start Gates:
| Gate | Applies | Evidence |
|------|---------|----------|
| Prompt requirements captured before work | yes | User requirement copied into this plan: cut aliases now; no commit/PR/release; source/docs/API checks required. |
| Skill analysis before edits | yes | `hard-cut` and `autogoal` skills read before mutable alias work. |
| Active goal checked or created | yes | `get_goal` returned a paused matching alias-hard-cut goal on resume; user explicitly said "complete alias hard-cut", so this plan continues and closes that goal. |
| Source of truth read before edits | yes | Read public `slate-react` exports, hook docs, source owners, `slate-dom` Hotkeys export, and public surface contracts. |
| Tracker comments and attachments read | N/A | Direct user command; no tracker. |
| Video transcript evidence required | N/A | No video/screenshot evidence named. |
| `docs/solutions` checked for non-trivial existing-code work | N/A | Alias hard-cut is governed by current source/docs contracts, not prior solution recall. |
| TDD decision before behavior change or bug fix | yes | This is API hard-cut, not behavior TDD; update public-surface/type contracts after scan. |
| Branch decision for code-changing task | N/A | User did not request branch/PR; work stays in current checkout. |
| Release artifact decision | yes | N/A: Slate v2 is continuous private alpha; no release/publish/changeset authorized. |
| Browser tool decision for browser surface | N/A | API/docs hard-cut; no browser surface changed unless later runtime evidence says otherwise. |
| PR expectation decision | N/A | No PR requested. |
| Tracker sync expectation decision | N/A | No tracker. |
| Output budget strategy recorded | yes | Focused alias scans only; no broad generated output. |
| Docs pack selected | yes | Docs pack selected because public docs must stop teaching aliases. |
| `docs-creator` loaded | N/A | Mechanical Slate v2 alias removal in existing docs; no new Plate docs page or docs style redesign. |
| Docs lane selected | yes | Incidental API docs update tied to package hard cut. |
| Target docs and nearest sibling docs read | yes | Read Slate React hooks/root docs and nearest public examples for alias usage. |
| Docs style doctrine read | yes | Repo docs rule requires latest-state docs with no changelog/migration language. |
| Documented source owner identified | yes | `packages/slate-react/src/index.ts` and corresponding source components/hooks own documented API names. |
| Package/API pack selected | yes | Package/API pack selected because public exports change. |
| Public surface or package boundary identified | yes | Public `slate-react` root export surface, `slate-dom` root Hotkeys export, docs, examples, and package dist import shape. |
| Release artifact path selected | N/A | No release artifact: private-alpha uncommitted beta API cleanup; no publish requested. |
| `changeset` skill loaded when `.changeset` is required | N/A | No changeset authorized. |
| Barrel/export impact decision recorded | yes | Slate v2 package root is source export file, not parent `pnpm brl`; update package source/tests directly. |

Work Checklist:
- [x] First checkpoint complete: explicit request was to cut aliases, preserve canonical public names, avoid commit/PR/release, and verify by alias scans plus package/API checks.
- [x] Short objective plus outcome, completion threshold, verification surface, constraints, boundaries, and blocked condition are concrete.
- [x] Task source classified: direct user command, API hard-cut, no tracker, no browser runtime surface, likely owners `slate-react`, `slate-dom`, docs, examples, and public contracts.
- [x] Video evidence N/A: no video or screen recording is part of this API cleanup.
- [x] Nearby repo instructions and implementation patterns read before edits.
- [x] Implementation fixed the ownership boundary: public source exports now use canonical names directly instead of alias exports or compatibility shims.
- [x] Release artifact requirement recorded: N/A because Slate v2 is continuous private alpha and no release/publish/changeset was requested.
- [x] Final handoff shape decided: concise changed list, tests, review result, caveat, and no PR/tracker/browser lines except N/A.
- [x] Branch handling N/A: user did not request branch or PR.
- [x] Local-env-rot retry policy N/A: no local-corruption-shaped failure occurred.
- [x] Workspace authority recorded: commands ran in `.tmp/slate-v2` for package/API proof and parent `plate-2` for this plan.
- [x] High-risk note recorded: public API hard-cut can break alias consumers, intentionally accepted because private alpha and user rejects aliases.
- [x] Autoreview target selected: local alias hard-cut surface with prompt scoped to public alias removal, docs/examples/tests, package exports, Hotkeys, and runtime non-regression.
- [x] Agent-native review N/A: no `.agents/**`, `.claude/**`, `.codex/**`, skills, hooks, commands, prompts, or user-action tooling changed in this packet.
- [x] Output budget discipline followed: alias scans were focused on source/docs/tests/examples and high-volume generated/build output was avoided.
- [x] Docs pack: docs lane, target docs, nearest sibling docs, and source owner are recorded.
- [x] Docs pack: named APIs/imports/examples are source-backed by `slate-react` / `slate-dom` source and contracts.
- [x] Docs pack: docs use current-state reference voice; no changelog/migration alias language added.
- [x] Docs pack: docs links/routes/previews N/A for this packet because no new docs links/routes/previews were introduced by the alias cut.
- [x] Package/API pack: public API, package boundary, export, and release-artifact impact are recorded.
- [x] Package/API pack: release artifact matrix applied; no artifact because private-alpha uncommitted API cleanup with no release requested.
- [x] Package/API pack: changeset N/A because no release/publish/changeset authority.
- [x] Package/API pack: registry-only changelog N/A because no registry component change.
- [x] Package/API pack: no-artifact decision recorded as private-alpha no-release cleanup.
- [x] Package/API pack: hard-cut decision explicit for public shape changes.
- [x] Package/API pack: package-owned typecheck/test/import proof recorded.
- [x] Package/API pack: generated barrels/release notes N/A because Slate v2 source root exports are direct package files; parent `pnpm brl` does not own this sibling package.

Completion Gates:
| Gate | Applies | Required action | Evidence |
|------|---------|-----------------|----------|
| Named verification threshold | yes | Run source audit, focused contract tests, package typechecks, site typecheck, import smoke, and final fast gate | Source alias scan clean; focused tests/typechecks passed; import smoke passed; `bun check` passed. |
| Bug reproduced before fix | N/A | Record failing test/repro or N/A with reason | N/A: user requested API hard cut, not a behavior bug. |
| Targeted behavior verification | yes | Run focused test/proof for review-triggered behavior fix | `.tmp/slate-v2`: `bun --filter ./packages/slate-react test:vitest test/keyboard-input-strategy-contract.test.ts test/surface-contract.test.tsx` passed 78 tests after Arabic-script digit direction fix. |
| TypeScript or typed config changed | yes | Run relevant typecheck | `.tmp/slate-v2`: `bun --filter ./packages/slate-react typecheck`, `bun --filter ./packages/slate-dom typecheck`, and `bun typecheck:site` passed. |
| Package exports or file layout changed | yes | Run package-owned checks and barrel decision | `.tmp/slate-v2`: source root exports updated directly; `pnpm brl` N/A because parent barrels do not own sibling Slate v2 package files. |
| Package manifests, lockfile, or install graph changed | no | Run install when package graph changes | N/A: no package manifest or lockfile changed in this packet. |
| Agent rules or skills changed | no | Run skill sync when agent sources change | N/A: no `.agents` rule/skill changed. |
| Workspace authority proof | yes | Run verification in the owning repo/package/app/route/tool and record cwd | `.tmp/slate-v2` owns package/API checks; parent `plate-2` owns this plan checker. |
| Browser surface changed | no | Capture Browser Use proof or record explicit waiver/blocker | N/A: API/docs hard cut with no UI route or behavior change. |
| Browser final proof | no | Attach screenshot or exact browser verification caveat when browser proof applies | N/A: no browser surface changed. |
| CI-controlled template output changed | no | Restore generated template output or record why kept | N/A: no CI-controlled template output changed. |
| Package behavior or public API changed | yes | Add a changeset or record why no changeset applies | No changeset: Slate v2 private alpha, no release/publish requested. |
| Registry-only component work changed | no | Update registry changelog or record N/A | N/A: no registry component change. |
| Docs or content changed | yes | Verify source-backed docs claims and site typecheck | `.tmp/slate-v2`: docs/source alias scan clean and `bun typecheck:site` passed. |
| High-risk mini gate | yes | Record realistic failure mode, proof plan, and boundary choice | Failure mode: breaking consumers of alias names. Accepted because aliases are explicitly rejected and Slate v2 is private alpha; proof is source scan, contracts, typechecks, import smoke, and review. |
| Agent-native review for agent/tooling changes | no | Run agent-native review or record N/A | N/A: no agent/tooling files changed. |
| Local install corruption suspected | no | Run reinstall if failure smells like env rot | N/A: no env-rot-shaped failure. |
| Autoreview for non-trivial implementation changes | yes | Run local structured review until no accepted/actionable findings | `.tmp/slate-v2`: final autoreview rerun exited 0 with no accepted/actionable findings. |
| PR create or update | no | Create/update PR when requested | N/A: no PR requested. |
| Task-style PR body verified | no | Verify PR body when PR exists | N/A: no PR. |
| PR proof image hosting | no | Host images when PR body needs browser proof | N/A: no PR/browser image. |
| Tracker sync-back | no | Sync tracker when tracker source exists | N/A: no tracker. |
| Final handoff contract | yes | Fill final handoff fields | Final handoff fields filled below. |
| Final lint | yes | Run lint or equivalent | `.tmp/slate-v2`: `bun check` lint phase passed. |
| Output budget discipline | yes | Verify no unbounded high-volume output | Broad searches were focused; one alias scan intentionally printed only small canonical/negative-guard hits. |
| Goal plan complete | yes | Run `node .agents/skills/autogoal/scripts/check-complete.mjs docs/plans/2026-06-14-slate-v2-alias-hard-cut.md` | Run after final review result is recorded. |
| Docs source-backed claim audit | yes | Verify docs claims against current source | Docs/source scan clean for removed alias names; source exports are canonical. |
| Docs links / routes / previews | N/A | Verify leaf links/routes/anchors or record N/A | N/A: no new links, routes, anchors, or previews. |
| Docs MDX/content parser | N/A | Run content parser or record N/A | N/A: no MDX/contentlayer-owned route changes; `bun typecheck:site` is the owning docs proof here. |
| Plugin page specifics | N/A | Apply plugin page rules or record N/A | N/A: not a plugin page. |
| Public API / package boundary proof | yes | Source-audit public API, exports, and package boundary impact | Source scan clean for removed alias names; root runtime import smoke confirms `Editable` / `useSlateViewState` / `Hotkeys` and rejects stale names. |
| Release artifact classification | yes | Classify release artifact need | Published package API shape changes, but no artifact in this private-alpha no-release packet. |
| Published package changeset | N/A | Add changeset if publishing | N/A: no release/publish requested; private alpha. |
| Registry changelog | N/A | Update registry changelog for registry-only work | N/A: no registry work. |
| No release artifact | yes | Record exact no-artifact reason | Private-alpha API cleanup; no ship/release/publish/changeset authority. |
| Package typecheck/build/test | yes | Run owning package checks or record N/A | `.tmp/slate-v2`: focused React, DOM, Slate public-surface, and keyboard contract tests; React/DOM typechecks; site typecheck; import smoke; and `bun check` passed. |
| Barrel/export generation | N/A | Run `pnpm brl` when required | N/A: sibling Slate v2 package exports are source-owned direct files; no parent barrel generation. |

Phase / pass table:
| Phase | Status | Evidence | Next |
|-------|--------|----------|------|
| Intake and source read | complete | Source owners, docs, and contracts read; matching paused goal resumed. | implementation complete |
| Implementation | complete | Public aliases cut from Slate React and Slate DOM source/docs/tests. | verification complete |
| Verification | complete | Focused scans, package tests/typechecks, site typecheck, import smoke, and `bun check` passed. | review/check-complete |
| PR / tracker sync | N/A | No PR/tracker requested or present. | final response |
| Closeout | complete | Plan filled; review and check-complete recorded in verification evidence. | final response |

Findings:
- Removed alias targets: `EditableTextBlocks`, `EditableTextBlocksProps`,
  `EditableTextLeafProps`, `EditableTextRenderTextProps`,
  `EditableTextRenderPlaceholderProps`, `EditableRenderElementProps`,
  `EditableRenderVoidProps`, `useSlateRootState`, and `default as Hotkeys`.
- Canonical names retained: `Editable`, `EditableProps`, `RenderLeafProps`,
  `RenderTextProps`, `RenderPlaceholderProps`, `RenderElementProps`,
  `RenderVoidProps`, `useSlateViewState`, and named `Hotkeys`.
- Broad alias scan hits after the cut are either negative contract assertions,
  canonical `RenderElementProps` type casts in examples, or unrelated TypeScript
  `as` casts, not compatibility aliases.
- Autoreview found one missed benchmark alias import and two adjacent stale
  behavior/docs issues: direct public docs `Editor.rangeRef` snippet and weak
  Arabic-script digit direction detection.

Decisions and tradeoffs:
- Hard cut, no aliases or shims: accepted by explicit user taste and private-alpha status.
- No changeset/release artifact: Slate v2 is private alpha and no release/publish was requested.
- No browser proof: runtime behavior did not change; API/source contracts own this cleanup.

Implementation notes:
- `slate-react` source exports use canonical render prop and `Editable` names directly.
- `useSlateRootState` is removed; `useSlateViewState` is the canonical root-view selector.
- `slate-dom` publishes named `Hotkeys` without a default-export alias.
- Docs/examples/tests were updated to the canonical public names.
- Surface contracts now reject the removed aliases and guard the canonical hook docs wording.
- `scripts/benchmarks/browser/react/active-typing-breakdown.tsx` now imports
  canonical render prop type names.
- `docs/concepts/03-locations.md` now teaches public bookmarks instead of a
  direct `Editor.rangeRef` snippet.
- `getTextDirection` now treats Arabic-script digits as neutral until a strong
  letter appears, with regression coverage.

Review fixes:
- Accepted: benchmark stale alias imports -> replaced with `RenderElementProps`,
  `RenderLeafProps`, and `RenderTextProps`.
- Accepted: public docs `Editor.rangeRef` snippet -> replaced with bookmark-only
  public durable-anchor guidance.
- Accepted: Arabic-script digit direction regression -> gated RTL detection on
  strong letters and added digit-only Arabic-script regression cases.
- Final autoreview rerun: clean.

Error attempts:
| Error / failed attempt | Count | Next different move | Resolution |
|------------------------|-------|---------------------|------------|
| Wrong Vitest wrapper path `test/surface-contract.tsx` through package script | 1 | Use package Vitest wrapper filename `test/surface-contract.test.tsx` | Correct focused React surface contract passed. |
| `bun check` formatting/import-sort failure after source edits | 1 | Patch formatting/import order, rerun fast gate | `bun check` passed after cleanup. |
| First autoreview attempt exceeded 30 minutes with heartbeats | 1 | Stop that stuck attempt and rerun Codex review with web search off and static-review prompt | Second review returned actionable findings. |
| `bun check` failed benchmark formatting after review fix | 1 | Apply formatter shape and rerun | `bun check` passed. |

Verification evidence:
- `.tmp/slate-v2`: focused alias source/docs scan for removed alias names exited 1 with no output over `packages/slate-react/src`, `packages/slate-dom/src`, docs, examples, and package READMEs.
- `.tmp/slate-v2`: broader alias scan showed only negative contract assertions, canonical `RenderElementProps` usage, and unrelated TypeScript casts.
- `.tmp/slate-v2`: `bun --filter ./packages/slate-react test:vitest test/surface-contract.test.tsx` passed 38 tests.
- `.tmp/slate-v2`: `bun test ./packages/slate-dom/test/public-surface-contract.ts ./packages/slate-dom/test/hotkeys.ts` passed 30 tests.
- `.tmp/slate-v2`: after review fixes, `bun --filter ./packages/slate-react test:vitest test/keyboard-input-strategy-contract.test.ts test/surface-contract.test.tsx` passed 78 tests.
- `.tmp/slate-v2`: after review fixes, `bun test ./packages/slate/test/public-surface-contract.ts ./packages/slate-dom/test/public-surface-contract.ts ./packages/slate-dom/test/hotkeys.ts` passed 631 tests.
- `.tmp/slate-v2`: `bun --filter ./packages/slate-react typecheck` passed.
- `.tmp/slate-v2`: `bun --filter ./packages/slate-dom typecheck` passed.
- `.tmp/slate-v2`: `bun typecheck:site` passed.
- `.tmp/slate-v2`: direct Node ESM import smoke passed and printed `alias hard-cut import smoke ok`.
- `.tmp/slate-v2`: final `bun check` passed after review fixes, including lint, 7 package typechecks, site/root typecheck, 1228 Bun tests, 48 layout tests, and 810 slate-react Vitest tests.
- `.tmp/slate-v2`: autoreview first bounded rerun found accepted issues in benchmark aliases, public `Editor.rangeRef` docs, and Arabic-script digit direction detection; all were fixed.
- `.tmp/slate-v2`: final autoreview command with `--mode local --no-web-search` exited 0: `autoreview clean: no accepted/actionable findings reported`; overall patch correct.

Final handoff contract:
- PR line: N/A: no PR requested.
- Issue / tracker line: N/A: direct user command, no tracker.
- Confidence line: High for alias cut; all named package/API proof is green.
- Flow table:
  - Reproduced: N/A: API hard-cut, not behavior bug.
  - Verified: source scans, contract tests, typechecks, import smoke, `bun check`, review-triggered behavior regression coverage, and autoreview.
- Browser check: N/A: no browser surface changed.
- Outcome: public aliases removed; canonical API names guarded.
- Caveat: alias consumers break by design; this is accepted private-alpha cleanup.
- Design:
  - Chosen boundary: public package source exports, docs, examples, and surface contracts.
  - Why not quick patch: caller-only replacement would leave public aliases alive.
  - Why not broader change: no unrelated runtime/API redesign needed.
- Verified: focused scans/tests/typechecks/import smoke/fast gate/review.
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
- Browser proof: N/A: no browser surface changed.
- Caveats: alias consumers break by design; no release artifact created.

Timeline:
- 2026-06-14T20:30:09.209Z Task goal plan created.
- 2026-06-14T20:30-22:40+0200 Alias hard cut implemented in Slate React and Slate DOM source/docs/contracts; focused package checks and `bun check` passed.
- 2026-06-14T22:46+0200 Paused matching goal resumed from user command `complete alias hard-cut`; source/docs alias scan and focused package proof rerun.
- 2026-06-14T22:48+0200 First autoreview attempt launched for alias hard-cut surface, exceeded 30 minutes with heartbeats, and was stopped as a review-tool timeout.
- 2026-06-14T23:26+0200 Autoreview found missed benchmark alias imports and stale `Editor.rangeRef` public docs; both fixed and focused proof rerun.
- 2026-06-14T23:35+0200 Autoreview found Arabic-script digit direction regression; fixed strong-letter RTL detection and added regression coverage.
- 2026-06-14T23:38+0200 Final `bun check` passed after all review fixes.
- 2026-06-14T23:46+0200 Final autoreview rerun exited clean with no accepted/actionable findings.

Reboot status:
| Question | Answer |
|----------|--------|
| Where am I? | Final closeout of paused alias hard-cut goal. |
| Where am I going? | Run check-complete, then mark the active goal complete. |
| What is the goal? | Remove Slate v2 public aliases and prove the public API/docs surface is canonical. |
| What have I learned? | The real alias surface is cut; remaining alias matches are negative guards or canonical names, and review caught one adjacent keyboard direction regression that is now fixed. |
| What have I done? | Cut aliases, updated docs/contracts/benchmark imports, fixed stale public docs and Arabic-script digit direction, reran proof and clean autoreview. |

Open risks:
- Alias consumers break by design; accepted by user taste and private-alpha status.
- No release artifact was created; future publish/release owner must decide release metadata.
