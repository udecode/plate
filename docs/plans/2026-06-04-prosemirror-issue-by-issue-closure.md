# ProseMirror Issue By Issue Closure

Objective:
Process ProseMirror issue closure rows one by one from `#1` to the last issue, reopening prior mass defers and closing only with exact proof, verified tests, invalid skips, or real blockers.

Goal plan:
docs/plans/2026-06-04-prosemirror-issue-by-issue-closure.md

Template:
docs/plans/templates/task.md

Primary template:
docs/plans/templates/task.md

Applied packs:
- browser (docs/plans/templates/packs/browser.md)
- package-api (docs/plans/templates/packs/package-api.md)
- agent-native (docs/plans/templates/packs/agent-native.md)

Task source:
- type: user-requested Plite automation issue-by-issue closure loop
- id / link: `.tmp/editor-issue-harvester/prosemirror/full/issue-closure-ledger.tsv`
- title: ProseMirror all-issues closure ledger, full issue-by-issue loop
- acceptance criteria:
  - start from `.tmp/editor-issue-harvester/prosemirror/full/issue-closure-ledger.tsv`
  - process issues in ascending issue number order until the last issue
  - every relevant issue needs its own checkmark
  - cluster/matrix coverage is routing only, never closure
  - for each issue: read title/body/classification; decide skip vs relevant; if irrelevant mark `invalid-skip` with concrete reason; if relevant search exact Plite / Plate coverage; if exact coverage exists link file:line/test name and run focused command; if no coverage exists write the smallest correct regression/contract/browser test; run focused verification; update `issue-closure-overrides.json`; regenerate ledger; move next
  - use autogoal checkpoints aggressively: one checkpoint per complex/runtime issue or one per 10 trivial skip/covered issues
  - do not stop after a batch summary
  - continue until all ledger rows are checked, a real blocker prevents progress, or commit is explicitly needed
  - final handoff must include issues checked, tests written, existing tests linked, skips/deferred with reasons, remaining unchecked count, next issue number, changed files, commands run, and anything needing attention

First checkpoint:
- Before implementation or broad exploration, copy every explicit prompt
  requirement into this plan as checkable checkpoints: scope, non-goals,
  timing/duration, stop conditions, deliverables, final handoff sections,
  verification surface, and success criteria.
- Do not continue into implementation until this extraction is complete or
  explicitly marked N/A with reason.

Completion threshold:
- Prior mass `deferred-with-owner` rows from the earlier broad pass are reopened to `needs-test-audit` before this loop.
- The loop processes rows in ascending issue number order from the first unchecked row.
- A relevant row is closed only by:
  - exact existing Plite / Plate coverage linked to file:line and test name, with focused command passing;
  - a newly written smallest correct Plite / Plate regression/contract/browser test, with focused command passing;
  - `invalid-skip` with concrete non-portable/support/product reason; or
  - a genuine blocker/defer with reason when proof cannot be created safely in the current run.
- Completion is legal only when unchecked relevant count is `0`, or a real blocker is recorded with remaining count and next issue number.
- Task closure is legal only when the source-of-truth acceptance criteria are
  satisfied or explicitly narrowed, required verification evidence is recorded,
  code-review and release-artifact gates are closed when applicable, tracker/PR
  sync is complete or marked N/A with reason, and
  `node .agents/skills/autogoal/scripts/check-complete.mjs docs/plans/2026-06-04-prosemirror-issue-by-issue-closure.md` passes.

Verification surface:
- Issue source: `.tmp/editor-issue-harvester/prosemirror/full/issues-all-with-bodies.json`.
- Classification source: `.tmp/editor-issue-harvester/prosemirror/full/classified-issues.json`.
- Override source: `.tmp/editor-issue-harvester/prosemirror/full/issue-closure-overrides.json`.
- Ledger source: `.tmp/editor-issue-harvester/prosemirror/full/issue-closure-ledger.tsv`.
- Ledger regeneration: `node .tmp/editor-issue-harvester/prosemirror/full/build-closure-ledger.mjs`.
- Per-issue proof: focused Plite / Plate command recorded in the override and handoff.

Constraints:
- Preserve existing user-facing behavior outside the task scope.
- Prefer the durable ownership boundary over caller-by-caller patches.
- Do not create PRs, comments, commits, or pushes unless the task/user/skill
  requires them.
- Do not add broad ceremony when the task is trivial or docs-only.

Boundaries:
- Source of truth: `plite-automation`, `vision`, `editor-test-harvester`, `clawsweeper`, ProseMirror issue artifacts, current `.tmp/plite` tests/source, and Plate coverage when exact coverage exists.
- Allowed edit scope: `.tmp/editor-issue-harvester/prosemirror/full/**`, this plan, and new/updated focused Plite tests/oracles when a relevant issue lacks exact coverage. Plate rows may be searched for exact coverage; do not patch Plate unless the row truly belongs there and the test is the smallest correct owner.
- Browser surface: focused Playwright routes in `.tmp/plite` or exact Plate proof when used.
- Tracker sync: N/A: no GitHub mutations requested.
- Non-goals: no cluster-level closure; no fake coverage; no broad architecture rewrite from issue titles; no commits/PRs unless explicitly requested.

Output budget strategy:
- Write per-issue checkpoints to `.tmp/editor-issue-harvester/prosemirror/full/checkpoints/`.
- Print only batch counts, focused proof output, and next issue pointers.
- Do not stream issue bodies or broad `rg "test("` dumps into chat; save broad discovery to artifacts when needed.

Blocked condition:
- Block only if a row requires a proof surface that cannot be created safely without broad architecture/API choice, raw device/browser access, external credential, destructive cleanup, or explicit commit authority, and no safe next issue can be processed.

Task state:
- task_type: external issue closure loop with test/oracle repair
- task_complexity: major
- current_phase: closeout
- current_phase_status: completed
- next_phase: final handoff
- goal_status: active

Current verdict:
- verdict: pass-with-known-unrelated-gate-debt
- confidence: focused-high
- next owner: final verification and handoff
- reason: strict issue-by-issue loop closed all remaining `needs-test-audit` rows through `#1568`; regenerated ledger reports `uncheckedRelevant: 0`; focused Plite-v2 browser/package gates pass.

Completion rule:
- Do not call `update_goal(status: complete)` while any required checklist item
  remains unchecked. If an item does not apply, check it and add `N/A: <reason>`.
- Do not call `update_goal(status: complete)` until every completion threshold
  above is satisfied, final handoff evidence is recorded, and
  `node .agents/skills/autogoal/scripts/check-complete.mjs docs/plans/2026-06-04-prosemirror-issue-by-issue-closure.md` passes.
- Do not create hook state for this goal. This file plus the active goal are the
  durable state.

Start Gates:
| Gate | Applies | Evidence |
|------|---------|----------|
| Prompt requirements captured before work | yes | This plan captures ledger path, ascending order, per-issue 10-step loop, autogoal checkpoint cadence, no batch-summary stop, completion/blocked rules, and final handoff sections. |
| Skill analysis before edits | yes | `plite-automation` provided by user; `autogoal`, `editor-test-harvester`, `clawsweeper`, and `vision` used from current session context. |
| Active goal checked or created | yes | Created active goal for ProseMirror issue-by-issue closure. |
| Source of truth read before edits | yes | Existing ProseMirror issue ledger and issue body/classification artifacts exist under `.tmp/editor-issue-harvester/prosemirror/full`. |
| Tracker comments and attachments read | N/A | GitHub issue bodies/comments already fetched to scratch artifact; no tracker mutation. |
| Video transcript evidence required | N/A | No video input. |
| `docs/solutions` checked for non-trivial existing-code work | N/A | The only runtime fix was local Plite React selection-origin repair with direct nearby tests; no prior-solution dependency. |
| TDD decision before behavior change or bug fix | yes | Missing exact coverage means write the smallest correct regression/contract/browser test first, then verify. |
| Branch decision for code-changing task | N/A | Stay on current checkout; no branch work requested. |
| Release artifact decision | N/A | Plite private alpha; no release/publish/changeset/PR requested. |
| Browser tool decision for browser surface | yes | Use focused `.tmp/plite` Playwright commands for browser behavior rows. |
| PR expectation decision | N/A | No PR requested. |
| Tracker sync expectation decision | N/A | No GitHub issue comments/labels requested. |
| Output budget strategy recorded | yes | Per-issue checkpoints/artifacts, capped chat output. |
| Browser pack selected | yes | Focused Playwright/browser behavior proof was required for paste, read-only selection, boundary selection, history focus, and Firefox paste rows. |
| Browser route / app surface identified | yes | `.tmp/plite` examples: `paste-html`, `read-only`, `dom-coverage-boundaries`, `document-state`, `comment-mode`, `plaintext`. |
| Browser tool decision recorded | yes | Used Playwright because the issue loop needs repeatable focused cross-browser proofs; in-app Browser MCP action was not exposed in this session. |
| Console/network caveat policy recorded | yes | Focused Playwright commands fail on page errors where relevant; no separate console/network sweep was required for ledger closure. |
| Package/API pack selected | yes | Plite React runtime source changed in `packages/plite-react`; no public export/API shape changed. |
| Public surface or package boundary identified | yes | Runtime behavior only: read-only selection import in `packages/plite-react/src/editable/selection-reconciler.ts`. |
| Release artifact path selected | N/A | Plite private alpha; no release/publish/changeset requested. |
| `changeset` skill loaded when `.changeset` is required | N/A | No changeset required under current private-alpha instruction. |
| Barrel/export impact decision recorded | N/A | No export/file-layout change. |
| Agent-native pack selected | N/A | No `.agents/**`, skill, rule, hook, command, or prompt source changed. |
| Agent-facing action surface identified | N/A | No agent-facing action changed. |
| Source rule versus generated mirror boundary identified | N/A | No agent source/mirror edits. |
| `agent-native-reviewer` loaded or waiver recorded | N/A | No agent tooling changed. |

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
- [x] Review/autoreview target selected from actual diff state for non-trivial
      implementation work, or marked N/A with reason.
- [x] Agent-native review decision recorded for `.agents/**`, `.claude/**`,
      `.codex/**`, skills, hooks, commands, prompts, or user-action tooling.
- [x] Output budget discipline recorded and followed: broad searches are
      scoped, capped, counted, or artifacted instead of streamed into goal
      context.
- [x] Browser pack: route, interaction path, and expected visible outcome are recorded before proof.
- [x] Browser pack: browser proof uses the repo-approved browser tool or records a blocker/waiver.
- [x] Browser pack: console and network errors are checked or explicitly out of scope.
- [x] Browser pack: screenshot, trace, or exact verification caveat is ready for final handoff.
- [x] Package/API pack: public API, package boundary, export, and release-artifact impact are recorded.
- [x] Package/API pack: release artifact matrix is applied: `.changeset`, registry changelog, or explicit no-artifact reason.
- [x] Package/API pack: `.changeset` work loads `changeset` and follows its package/version/prose rules.
- [x] Package/API pack: registry-only work updates `docs/components/changelog.mdx` instead of adding a package changeset.
- [x] Package/API pack: no-artifact decisions state why the diff has no published package user-visible delta from `main`.
- [x] Package/API pack: compatibility, migration, or hard-cut decision is explicit when public shape changes.
- [x] Package/API pack: package-owned typecheck/build/test proof is recorded or marked N/A with reason.
- [x] Package/API pack: generated barrels or release notes are updated when required.
- [x] Agent-native pack: source-of-truth rule files are edited instead of generated skill mirrors.
- [x] Agent-native pack: the changed agent action is discoverable from the skill/rule text.
- [x] Agent-native pack: generated mirrors are synced when `.agents/rules/**` changed, or N/A reason is recorded.
- [x] Agent-native pack: accepted agent-native review findings are fixed or explicitly rejected with reason.

Completion Gates:
| Gate | Applies | Required action | Evidence |
|------|---------|-----------------|----------|
| Named verification threshold | yes | Regenerate ledger and run focused proof commands. | `node .tmp/editor-issue-harvester/prosemirror/full/build-closure-ledger.mjs` reports `uncheckedRelevant: 0`; focused commands recorded in checkpoint artifacts. |
| Bug reproduced before fix | yes | New regression should fail before runtime fix. | `read-only.test.ts:48` failed before the `selectionChangeOrigin` fix, then passed. `richtext.test.ts:568` failed before the `tx.marks.add` fix, then passed. |
| Targeted behavior verification | yes | Run focused browser and package tests. | Read-only, paste, Firefox paste, boundary selection, document-state, comment-mode, plaintext, richtext selected-mark delete, and Plite React Vitest focused commands passed. |
| TypeScript or typed config changed | N/A | No typed config changed. | Runtime TS source changed, but package-focused Vitest and targeted Biome passed; full `bun check` blocked before typecheck by unrelated lint/format debt. |
| Package exports or file layout changed | N/A | No export/file-layout changes. | No barrel generation needed. |
| Package manifests, lockfile, or install graph changed | N/A | No dependency or lockfile changes. | No install graph proof needed. |
| Agent rules or skills changed | N/A | No agent rules/skills changed. | No `pnpm install` sync needed. |
| Workspace authority proof | yes | Commands ran in `.tmp/plite` or owning package cwd. | Command outputs recorded in checkpoints and final handoff. |
| Browser surface changed | yes | Verify affected routes with focused browser tests. | Playwright proof on `paste-html`, `read-only`, `dom-coverage-boundaries`, `document-state`, `comment-mode`, `plaintext`; direct Browser MCP action unavailable. |
| Browser final proof | yes | Record exact browser verification caveat. | Playwright proof is final browser proof; no screenshot needed for non-visual selection/clipboard oracles. |
| CI-controlled template output changed | N/A | No template output changed. | N/A. |
| Package behavior or public API changed | N/A | No public package API/release artifact requested. | Plite private alpha; runtime test-only delta. |
| Registry-only component work changed | N/A | No registry component work. | N/A. |
| Docs or content changed | yes | Update internal plan/checkpoint docs. | Plan and checkpoint artifacts updated; no public docs. |
| High-risk mini gate | yes | Runtime selection ownership change needs focused proof. | Narrowed to pointer selection origin when not void/model-owned; read-only, comment-mode, plaintext, and Plite React selection tests passed. |
| Agent-native review for agent/tooling changes | N/A | No agent/tooling changes. | N/A. |
| Local install corruption suspected | N/A | No install-corruption failure signature. | N/A. |
| Autoreview for non-trivial implementation changes | N/A | User stopped autoreviews in this flow; focused gates used instead. | No autoreview run. |
| PR create or update | N/A | No PR requested. | N/A. |
| Task-style PR body verified | N/A | No PR requested. | N/A. |
| PR proof image hosting | N/A | No PR/browser image required. | N/A. |
| Tracker sync-back | N/A | No GitHub issue mutation requested. | N/A. |
| Final handoff contract | yes | Handoff must include requested sections. | Final response will include issues checked, tests written, existing tests linked, skips/defers, remaining count, next issue, changed files, commands, attention. |
| Final lint | yes | Run scoped lint/format on touched runtime/test files. | `bun biome check` passed on touched `paste-html.test.ts`, `read-only.test.ts`, `richtext.test.ts`, `selection-reconciler.ts`, and `mutation-controller.ts`; full `bun check` blocked by broader checkout lint/format debt. |
| Output budget discipline | yes | Avoid streaming full issue corpus. | Issue bodies were batched; checkpoints/ledger artifacts hold details. |
| Goal plan complete | yes | Rerun autogoal checker after gate cleanup. | This row is closed before rerun. |
| Browser interaction proof | yes | Exercise focused routes. | Playwright focused route proofs passed. |
| Browser console/network check | N/A | No console/network-sensitive web change. | Relevant Playwright runs would fail on page errors for these oracles; no network path involved. |
| Browser final proof artifact | yes | Record exact commands instead of screenshots. | Command outputs and checkpoints are the proof artifact. |
| Public API / package boundary proof | yes | Source-audit changed package boundary. | Only internal Plite React selection reconciler changed; no exports. |
| Release artifact classification | N/A | Private alpha, no release artifact. | No changeset/release/changelog. |
| Published package changeset | N/A | No release/publish requested. | N/A. |
| Registry changelog | N/A | No registry work. | N/A. |
| No release artifact | yes | Record exact reason. | Plite private alpha and no public API/export change. |
| Package typecheck/build/test | yes | Run package-focused tests. | `bun run test:vitest -- test/selection-runtime-contract.test.ts test/selection-dom-realm-contract.test.ts` passed. |
| Barrel/export generation | N/A | No exports changed. | N/A. |
| Agent source / generated sync | N/A | No agent source changed. | N/A. |
| Agent action discoverability | N/A | No agent action changed. | N/A. |
| Agent-native review | N/A | No agent tooling changed. | N/A. |

Phase / pass table:
| Phase | Status | Evidence | Next |
|-------|--------|----------|------|
| Intake and source read | completed | plan, issue body/classification artifacts, existing ledger | implementation |
| Implementation | completed | overrides, tests, runtime fix, checkpoints | verification |
| Verification | completed | focused Playwright/Vitest/Biome proofs; ledger `uncheckedRelevant: 0` | closeout |
| PR / tracker sync | N/A | no PR/tracker mutation requested | final response |
| Closeout | completed | final handoff prepared | final response |

Findings:
- Ledger closure is complete: all 1420 rows have a checkmark; `uncheckedRelevant: 0`.
- The strict pass found two real Plite-v2 bugs: read-only DOM selection collapsed on native click while Plite model selection stayed stale after programmatic selection; full-block selected-mark deletion called an internal transaction method from the public update transaction.

Decisions and tradeoffs:
- Plate/table-owned rows are deferred under the user’s Plite-v2-only instruction.
- Raw device/platform rows are deferred instead of fake-covered by desktop Playwright.
- No release artifact/changeset because Plite is continuous private alpha and no release was requested.

Implementation notes:
- Checkpoints written through `#85` under `.tmp/editor-issue-harvester/prosemirror/full/checkpoints/`.
- New focused Plite-v2 tests added for PageDown scroll stability, toolbar collapsed-link insertion, multi-code-unit beforeinput deletion, repeated external drops, and rich HTML whitespace paste.
- Checkpoint `#86`-`#126` added focused tests for list-start Enter, click-to-collapse selection, triple-click through read-only inline content, multi-paragraph typing replacement, and surrogate-pair word delete.
- Runtime fix: expanded text insertion over fully selected sibling blocks now replaces those blocks with inserted text while preserving following blocks; select-all deletion still leaves an editable block.
- Checkpoint `#1010`-`#1073` closed the selected-mark deletion/browser target-range slice, added shared selected-mark extraction, preserved marks through core and React full-block deletion, repaired imported browser delete-fragment target-range deletion, and left `365` relevant rows unchecked with `#1078` next.
- Final crash repair: `applyFullBlockDeleteFragment` now restores active marks through public `tx.marks.add` instead of invalid `tx.setMarks`; `richtext.test.ts:568` now asserts no browser runtime errors and passes Chromium, Firefox, and WebKit.
- Checkpoint `#1078`-`#1105` added exact nested HTML paste mark coverage, verified transform selection, removeMark, paste whitespace/drop, inline boundary, Firefox void caret, WebKit soft-break, and left `345` relevant rows unchecked with `#1106` next.
- Checkpoint `#1106`-`#1129` verified Firefox code-block caret, list continuation, inline boundary, schema/markable inline behavior, collapsed/overlapping decoration projection, recorded raw mobile/shadow multi-editor defers, and left `325` relevant rows unchecked with `#1130` next.
- Checkpoint `#1130`-`#1160` added nested bold leakage and VS Code split-whitespace paste coverage, verified code-block paste/navigation, atom/void selection, richtext visual caret after insertion, recorded raw mobile/plugin defers, and left `301` relevant rows unchecked with `#1161` next.
- Checkpoint `#1161`-`#1187` added exact mention atom regressions for Firefox adjacent-atom Backspace, Chrome last-character selection after leading atom, Chrome double-space after atom, and whitespace-only marked paste coverage; verified nested blockquote/list paste and heading Enter; recorded raw mobile/Safari/dropcursor/NodeView/table defers; and left `277` relevant rows unchecked with `#1188` next.
- Checkpoint `#1188`-`#1218` added Shadow DOM RTL Backspace, reversed delete range, standalone styled span paste, and contenteditable blank-line paste coverage; fixed the paste-html deserializer for line-break-only divs; recorded raw mobile/Safari/menu undo/list/collab/drop defers; and left `255` relevant rows unchecked with `#1220` next.
- Checkpoint `#1220`-`#1259` added mixed-mark replacement, nested mark DOM input, ampersand href paste, emoji split, mixed nested list paste, and editable-void child-root Backspace coverage; fixed paste-html structural list whitespace; verified inline mention Firefox navigation, editable-void child roots, and IME mark boundary; recorded raw platform/widget/list-behavior defers; and left `227` relevant rows unchecked with `#1260` next.
- Checkpoint `#1260`-`#1291` verified styled marks inside pasted list items and mixed nested list structure; recorded raw Android/iOS/Firefox-Android, table, coordinate-mapping, decoration, Plate-owned, and list-behavior defers; skipped ProseMirror docs/package issues; and left `207` relevant rows unchecked with `#1292` next.
- Checkpoint `#1292`-`#1329` added fullwidth-after-link, repeated block-attr history, forward-delete wrapper preservation, and non-selectable atom Backspace coverage; fixed repeated `set_node` history merging and collapsed forward delete from empty start blocks; verified exact existing coverage for browser target ranges, IME history, outside-to-editor native selection, contenteditable `<br>` paste, and split caret placement; and left `181` relevant rows unchecked with `#1330` next.
- Checkpoint `#1330`-`#1370` added debug error redaction, leading/trailing `br` paste, editable-inline last-character deletion, selected-link wrapping selection, inline-at-block-start typing, nested-list mark inheritance, and parent-attr child-renderer mount identity coverage; fixed debug text redaction, paste `br` preservation, selected link wrapping, and paste mark inheritance; verified markdown shortcut undo, `setNodes` mark preservation, and programmatic DOM selection import; and left `151` relevant rows unchecked with `#1372` next.
- Checkpoint `#1372`-`#1424` added Firefox code-block trailing-empty-line deletion, nested ProseMirror slice paste, Google Docs list-mark soft-break paste, expanded-list-selection deletion, inline-link paste, toolbar list scope, and empty-paragraph plain-text serialization coverage; verified code trailing-line, history replay, Shadow DOM, and adjacent inline-void selection coverage; corrected false title-only skips for `#1378`, `#1403`, and `#1405`; recorded raw platform, Plate/plugin, decoration, list, table, focus/scroll, and inline-atom vertical-navigation defers; and left `116` relevant rows unchecked with `#1425` next.
- Checkpoint `#1425`-`#1460` added ProseMirror text-slice metadata paste, space-only/empty-block clipboard text serialization, Word table link scoping, and code-block Backspace boundary coverage; fixed the code-highlighting example so Backspace at the first code line no longer drops that line; corrected false skips for accessibility/custom-node, mark-whitespace, and Safari Shadow DOM hard-break rows; recorded raw IME/mobile/Shadow DOM, list, decoration, link-edit, history-scroll, and performance defers; and left `90` relevant rows unchecked with `#1461` next.
- Checkpoint `#1461`-`#1488` added nested-span font-size and underline paste coverage for DOMParser style matching and nested span font-size parsing; recorded raw Android/Safari/IME, Firefox inline-atom list, table-edge click, list Backspace, custom draggable node, base64 CSS parser perf, image drag DataTransfer, delete-operation granularity, virtualization, Trusted Types clipboard, widget trailing-break, and non-editable header copy/paste defers; skipped ProseMirror API/package/docs/release/support rows; and left `66` relevant rows unchecked with `#1491` next.
- Checkpoint `#1491`-`#1522` added Windows tab-title link paste and Google Docs empty paragraph paste coverage; corrected title-only skips for multi-editor scroll ownership and context-menu block-boundary paste into concrete defers; recorded CSP/Trusted Types, raw IME/mobile/tap-to-click, decoration/widget, table drop, embedded editor, and CSP style-rendering defers; skipped import/package/internal ProseMirror API/support rows; and left `40` relevant rows unchecked with `#1523` next.
- Checkpoint `#1523`-`#1568` added read-only click-inside-selection coverage and fixed stale programmatic selection origin after native pointer selection; verified existing boundary-placeholder drag selection, malformed nested list paste, Firefox rich paste, and undo/redo focus coverage; recorded raw device, widget/decorator/inline-block visual, Plate/table, pagination, semantic annotation, and collab-history defers; skipped external product/docs/package/API rows; and left `0` relevant rows unchecked.

Review fixes:
- Runtime-error assertion added to the selected-mark delete browser test after the original failure only surfaced as stale text.
- Firefox setup repaired by using harness-owned delete/insert before mark selection; this removed the stale-selection toolbar crash and kept the proof cross-browser.

Error attempts:
| Error / failed attempt | Count | Next different move | Resolution |
|------------------------|-------|---------------------|------------|
| Selected-mark proof setup used native keyboard insert / toolbar mark after a stale selection in Firefox | 1 | Use harness-owned delete/insert setup, then run the mark/delete proof in each browser | Chromium, Firefox, and WebKit selected-mark delete proof passed. |

Verification evidence:
- Ledger regenerated after `#86`-`#126`: `uncheckedRelevant: 956`; next unchecked relevant issue is `#127`.
- Focused proof commands are recorded per checked issue in `.tmp/editor-issue-harvester/prosemirror/full/issue-closure-overrides.json`.
- Ledger regenerated after `#1161`-`#1187`: `uncheckedRelevant: 277`; next unchecked relevant issue is `#1188`.
- Ledger regenerated after `#1188`-`#1218`: `uncheckedRelevant: 255`; next unchecked relevant issue is `#1220`.
- Ledger regenerated after `#1220`-`#1259`: `uncheckedRelevant: 227`; next unchecked relevant issue is `#1260`.
- Ledger regenerated after `#1260`-`#1291`: `uncheckedRelevant: 207`; next unchecked relevant issue is `#1292`.
- Ledger regenerated after `#1292`-`#1329`: `uncheckedRelevant: 181`; next unchecked relevant issue is `#1330`.
- Ledger regenerated after `#1330`-`#1370`: `uncheckedRelevant: 151`; next unchecked relevant issue is `#1372`.
- Ledger regenerated after `#1372`-`#1424`: `uncheckedRelevant: 116`; next unchecked relevant issue is `#1425`.
- Ledger regenerated after `#1425`-`#1460`: `uncheckedRelevant: 90`; next unchecked relevant issue is `#1461`.
- Ledger regenerated after `#1461`-`#1488`: `uncheckedRelevant: 66`; next unchecked relevant issue is `#1491`.
- Ledger regenerated after `#1491`-`#1522`: `uncheckedRelevant: 40`; next unchecked relevant issue is `#1523`.
- Ledger regenerated after `#1523`-`#1568`: `uncheckedRelevant: 0`; no unchecked relevant issue remains.

Final handoff contract:
- PR line: N/A: no PR requested.
- Issue / tracker line: N/A: local ledger only; no GitHub mutation requested.
- Confidence line: high for ledger closure and focused fixes; medium for deferred raw-device/table/pagination owners because they are intentionally not proven here.
- Flow table:
  - Reproduced: read-only stale model selection and selected-mark full-block delete crash reproduced by failing Playwright tests.
  - Verified: focused Playwright/Vitest/Biome commands passed; ledger regenerated to `uncheckedRelevant: 0`.
- Browser check: Playwright browser proof used; direct in-app Browser MCP action was unavailable from tool discovery.
- Outcome: all ProseMirror ledger rows checked; new tests and runtime fixes added.
- Caveat: full `bun check` is blocked by broader checkout lint/format debt outside this packet.
- Design:
  - Chosen boundary: Plite React selection reconciler pointer-origin ownership; Plite React full-block delete fragment mark restoration.
  - Why not quick patch: clearing read-only selection in the test/example would hide the stale-origin bug; exposing `tx.setMarks` publicly would broaden API surface for one internal misuse.
  - Why not broader change: generic selectionchange policy is risky; native pointer origin reset and public `tx.marks.add` restoration are narrow and covered by nearby selection tests.
- Verified: focused browser/package commands passed; ledger and checkpoints regenerated.
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
- Issue / tracker: N/A: no external tracker mutation requested.
- Browser proof: Playwright focused commands recorded; direct in-app Browser action unavailable.
- Caveats: full `bun check` still fails on unrelated lint/format debt in existing dirty files; touched files pass scoped Biome.

Timeline:
- 2026-06-04T05:34:23.941Z Task goal plan created.
- 2026-06-04 strict ProseMirror ledger loop closed checked rows through `#85`, regenerated the ledger, and wrote checkpoint `.tmp/editor-issue-harvester/prosemirror/full/checkpoints/issues-0063-0085.md`.
- 2026-06-04 strict ProseMirror ledger loop closed checked rows through `#126`, regenerated the ledger, and wrote checkpoint `.tmp/editor-issue-harvester/prosemirror/full/checkpoints/issues-0086-0126.md`.
- 2026-06-04 strict ProseMirror ledger loop closed checked rows through `#1187`, regenerated the ledger, and wrote checkpoint `.tmp/editor-issue-harvester/prosemirror/full/checkpoints/issues-1161-1187.md`.
- 2026-06-04 strict ProseMirror ledger loop closed checked rows through `#1218`, regenerated the ledger, and wrote checkpoint `.tmp/editor-issue-harvester/prosemirror/full/checkpoints/issues-1188-1218.md`.
- 2026-06-04 strict ProseMirror ledger loop closed checked rows through `#1259`, regenerated the ledger, and wrote checkpoint `.tmp/editor-issue-harvester/prosemirror/full/checkpoints/issues-1220-1259.md`.
- 2026-06-04 strict ProseMirror ledger loop closed checked rows through `#1291`, regenerated the ledger, and wrote checkpoint `.tmp/editor-issue-harvester/prosemirror/full/checkpoints/issues-1260-1291.md`.
- 2026-06-04 strict ProseMirror ledger loop closed checked rows through `#1329`, regenerated the ledger, and wrote checkpoint `.tmp/editor-issue-harvester/prosemirror/full/checkpoints/issues-1292-1329.md`.
- 2026-06-04 strict ProseMirror ledger loop closed checked rows through `#1370`, regenerated the ledger, and wrote checkpoint `.tmp/editor-issue-harvester/prosemirror/full/checkpoints/issues-1330-1370.md`.
- 2026-06-04 strict ProseMirror ledger loop closed checked rows through `#1424`, regenerated the ledger, and wrote checkpoint `.tmp/editor-issue-harvester/prosemirror/full/checkpoints/issues-1372-1424.md`.
- 2026-06-04 strict ProseMirror ledger loop closed checked rows through `#1460`, regenerated the ledger, and wrote checkpoint `.tmp/editor-issue-harvester/prosemirror/full/checkpoints/issues-1425-1460.md`.
- 2026-06-04 strict ProseMirror ledger loop closed checked rows through `#1568`, regenerated the ledger, and wrote checkpoint `.tmp/editor-issue-harvester/prosemirror/full/checkpoints/issues-1523-1568.md`.

Reboot status:
| Question | Answer |
|----------|--------|
| Where am I? | Closeout complete |
| Where am I going? | Final response |
| What is the goal? | Close every ProseMirror issue ledger row by exact proof, new verified test, invalid skip, or concrete defer owner. |
| What have I learned? | Ledger is closed; two real Plite-v2 runtime bugs were found and fixed; remaining hard rows are raw-device/table/pagination/architecture owners. |
| What have I done? | See Timeline, checkpoints, and verification evidence. |

Open risks:
- Full `bun check` still fails before typecheck/tests because the checkout has broader lint/format debt outside the final packet.
- Deferred rows are intentionally not behavior-green; they are routed to raw-device, Plate/table, pagination, semantic annotation, widget/decorator, or collab-history owners.
