# Fix combobox popup y-position

Objective:
Fix shared Plate combobox Y anchoring; done when exact @ and / browser repro is red before the fix and passes 5/5 after with focused checks green; plan docs/plans/2026-08-30-fix-combobox-popup-y-position.md.

Flow mode:
one-shot execution

Goal plan:
docs/plans/2026-08-30-fix-combobox-popup-y-position.md

Template:
docs/plans/templates/task.md

Primary template:
docs/plans/templates/task.md

Applied packs:
- browser (docs/plans/templates/packs/browser.md)

Task source:
- type: direct user regression report with screenshot
- id / link: local attachment `/var/folders/md/2qpw448d4tx0dgncw_kqdpk80000gn/T/codex-clipboard-48d41640-da48-4428-8b88-4a0e27531f91.png`
- title: Combobox popup Y position is shifted
- acceptance criteria: On `/blocks/mention-demo`, both `@` and `/` popup surfaces use the shared caret/trigger anchor without an extra vertical displacement; exact browser geometry fails before the fix and passes 5/5 after; focused owner checks pass.

First checkpoint:
- Before implementation or broad exploration, copy every explicit prompt
  requirement into this plan as checkable checkpoints: scope, non-goals,
  timing/duration, stop conditions, deliverables, final handoff sections,
  verification surface, and success criteria.
- Do not continue into implementation until this extraction is complete or
  explicitly marked N/A with reason.

Timed checkpoint:
- requested duration: N/A: none requested
- semantics: N/A: no timed checkpoint
- initial confidence score: N/A: binary geometry and proof threshold
- improvement loop: reproduce -> owner trace -> red proof -> shared fix -> 5/5 browser replay
- final score / loop closure: N/A: close on named pass gates

Completion threshold:
- Exact mention and slash interactions reproduce the vertical offset before the fix.
- A durable Plite React renderer test proves an inserted inline void moves the empty-block line break after the inline instead of retaining a leading `<br>`.
- Both interactions pass 5/5 retry-free browser replays on `/blocks/mention-demo`, with no new console errors.
- Focused tests, typecheck, scoped lint, and any required package changeset pass.
- Task closure is legal only when the source-of-truth acceptance criteria are
  satisfied or explicitly narrowed, required verification evidence is recorded,
  code-review and release-artifact gates are closed when applicable, tracker/PR
  sync is complete or marked N/A with reason, and
  `node .agents/skills/autogoal/scripts/check-complete.mjs docs/plans/2026-08-30-fix-combobox-popup-y-position.md` passes.

Verification surface:
- Exact Browser interaction and geometry measurements on `http://localhost:3011/blocks/mention-demo` for `@` and `/`.
- Focused test at the shared Plite React text-rendering owner.
- Owning package typecheck and scoped Ultracite check.

Constraints:
- Preserve existing user-facing behavior outside the task scope.
- Prefer the durable ownership boundary over caller-by-caller patches.
- Do not create PRs, comments, commits, or pushes unless the task/user/skill
  requires them.
- Do not add broad ceremony when the task is trivial or docs-only.

Boundaries:
- Source of truth: the `plitejs/react` empty-text renderer and mounted-node selector invalidation used by every Plate inline combobox.
- Allowed edit scope: Plite React rendering/invalidation, its focused DOM-shape contract, required changeset, and this plan; no caller-specific mention/slash patch.
- Browser surface: `/blocks/mention-demo`, opening both `@` mention and `/` slash command popups.
- Browser strategy: Browser for exact DOM geometry, screenshot, console, and interaction proof. Use Chrome directly
  for native downloads, print/print-preview, file picker/uploads, clipboard,
  browser dialogs/permissions, extension/profile state, or exact Chrome
  rendering; use Computer Use only for native Chrome/OS UI that needs visual
  inspection after Chrome automation cannot read it.
- Tracker sync: N/A: no external tracker named.
- Non-goals: redesigning combobox content, changing trigger semantics, or altering unrelated floating UI.

Output budget strategy:
- Search only `packages/platejs`, the owning registry component, and focused tests with capped `rg`/`sed` output. Exclude generated output, dependencies, build caches, and broad logs. Save screenshots as artifacts instead of streaming repeated DOM dumps.

Blocked condition:
- Stop only if the exact route cannot reproduce on a fresh current-source server, Browser cannot inspect popup geometry after documented recovery, or two materially different correct anchor outcomes lack product authority.

Task state:
- task_type: visible Plate behavior regression
- task_complexity: normal
- current_phase: closeout
- current_phase_status: completed
- next_phase: final response
- goal_status: complete

Current verdict:
- verdict: candidate-local
- confidence: high from exact red/green DOM contract, 5/5 `@` and `/` browser replay, and green affected Plite lane
- next owner: user for commit/push authority
- reason: runtime fix is verified locally but remains uncommitted and unpushed

Completion rule:
- Do not call `update_goal(status: complete)` while any required checklist item
  remains unchecked. If an item does not apply, check it and add `N/A: <reason>`.
- Do not call `update_goal(status: complete)` until every completion threshold
  above is satisfied, final handoff evidence is recorded, and
  `node .agents/skills/autogoal/scripts/check-complete.mjs docs/plans/2026-08-30-fix-combobox-popup-y-position.md` passes.
- Do not create hook state for this goal. This file plus the active goal are the
  durable state.

Start Gates:
| Gate | Applies | Evidence |
|------|---------|----------|
| Prompt requirements captured before work | yes | Exact route, any-combobox scope, screenshot symptom, shared-owner fix, and browser success threshold are recorded above. |
| Timed checkpoint parsed | no | N/A: no duration requested. |
| Skill analysis before edits | yes | `patch` owns one local behavior regression; Browser pack applies; Regression is deliberately not used for this single case; prior no-autoreview waiver retained. |
| Active goal checked or created | yes | Goal created for this exact plan and threshold. |
| Source of truth read before edits | yes | Read the zero-width renderer, descendant binding/equality, mounted-node selectors, inline canonicalization, and registry mention/slash callers before the runtime edit. |
| Tracker comments and attachments read | yes | Direct screenshot inspected at the named attachment path; no tracker comments exist. |
| Video transcript evidence required | no | N/A: screenshot report, no video. |
| `docs/solutions` checked for non-trivial existing-code work | yes | No existing solution owns empty-text line-break invalidation beside inserted inline nodes. |
| TDD decision before behavior change or bug fix | yes | Exact browser geometry must be recorded red before runtime edits; add the smallest durable owner-level test if geometry logic is unit-testable. |
| Branch decision for code-changing task | yes | Continue the current `codex/semantic-details-hard-cut` PR branch as explicitly requested by “continue”; do not create another branch. |
| Release artifact decision | yes | Published `plitejs/react` behavior changed, so add a `plitejs` patch changeset. |
| Browser tool decision for browser surface | yes | Use in-app Browser for normal local app geometry proof; exact Chrome-native behavior is not claimed. |
| PR expectation decision | yes | Continue existing PR #5115 only if the user later asks to push; this prompt authorizes local repair, not a new push. |
| Tracker sync expectation decision | no | N/A: no tracker named. |
| Output budget strategy recorded | yes | Narrow/capped owner searches and artifacted screenshots recorded above. |
| Browser pack selected | yes | Browser pack materialized in this plan. |
| Browser route / app surface identified | yes | `http://localhost:3011/blocks/mention-demo`, mention and slash triggers. |
| Browser tool decision recorded | yes | Browser selected; Chrome/Computer not required for normal DOM geometry. |
| Console/network caveat policy recorded | yes | Check console after exact interaction; network is out of scope unless popup data loading fails. |
| Observable browser case captured | yes | `combobox:y-anchor`: screenshot source; route `/blocks/mention-demo`; click empty paragraph, type `@` then `/`; popup top must derive from intended caret/trigger rect without extra line-height shift; popup geometry and console applicable; selection/focus/follow-up applicable; bad ref `a8f9de4dc2`; final ref and SHA-256 fingerprints required before completion. |

Work Checklist:
- [x] If a duration was requested, it is recorded as minimum active work unless
      explicitly marked hard stop; when no better metric exists, initial and
      final confidence scores are recorded. N/A: no duration requested.
- [x] First checkpoint complete: every explicit prompt requirement, scope
      boundary, timing constraint, stop condition, deliverable, final handoff
      section, verification surface, and success criterion is copied into this
      plan as checkable checkpoints before implementation.
- [x] Short objective plus outcome, completion threshold, verification surface,
      constraints, boundaries, and blocked condition are concrete.
- [x] Task source classified. Root cause: a leading empty-text runtime retained its empty-block `<br>` because its output depended on parent structure while its mounted selector observed only its own node key.
- [x] Video evidence N/A: screenshot-only report.
- [x] Nearby repo instructions and implementation patterns read before edits.
- [x] Shared `plitejs/react` rendering/invalidation owner fixed; registry callers remain unchanged.
- [x] Added `.changeset/fix-inline-combobox-line-position.md` as a `plitejs` patch.
- [x] Final handoff is a local bug candidate with exact tests/browser evidence; PR/tracker sync is N/A without commit/push authority.
- [x] Continued existing `codex/semantic-details-hard-cut`; no branch mutation.
- [x] Install-corruption retry N/A: stale browser output was resolved by rebuilding `plitejs` and restarting the app, not reinstalling dependencies.
- [x] Shell proof ran from `/Users/zbeyens/git/plate-2`; Browser proof ran on the rebuilt current-source `www` server at port 3011.
- [x] High-risk note: broad invalidation could regress render performance, so only empty text observes parent structural changes and equality keys only its zero-width parent inputs.
- [x] P1 autoreview N/A: user explicitly waived autoreview for this continuation.
- [x] Agent-native review N/A: no agent/tooling files changed.
- [x] Output discipline: one initial scoped `rg` was too broad and truncated; all later searches were capped and file-specific.
- [x] Browser route, interaction path, and visible outcome were recorded before proof.
- [x] Browser handled the normal DOM geometry case; Chrome/Computer are N/A.
- [x] No new console errors after `2026-08-30T06:06:17.503Z`; network N/A because local popup options loaded normally.
- [x] Captured a Browser screenshot after the corrected slash interaction; no visual waiver used.
- [x] Pixel-control matrix N/A: the claim is measured line-box/popup geometry, not layer/compositor paint.
- [x] Exact pre-fix replay failed with a 55.97px block and input y=222.07.
- [x] Final proof used fresh reloads and rechecked DOM markers, line box, popup geometry, focus, options, follow-up input, and errors.
- [x] Clean pushed-ref proof N/A: candidate is uncommitted/unpushed on base `a8f9de4dc274fddf3d1a0cf4813bf4d77f5b0e04`; final wording remains candidate-local.
- [x] React DOM lifecycle/focus passed 5/5 retry-free warm runs for each of `@` and `/`.
- [x] Proof used rebuilt `plitejs` output and a restarted current-source server; no stub, alias, generated edit, or route bypass.

Completion Gates:
| Gate | Applies | Required action | Evidence |
|------|---------|-----------------|----------|
| Named verification threshold | yes | Run named local proof | `@` and `/` each pass 5/5; Plite React gates and `pnpm check:plite:dev` pass. |
| Bug reproduced before fix | yes | Record failing test/repro | Browser: block 55.97px/input y=222.07; focused contract failed with leading zero-width marker `n`. |
| Targeted behavior verification | yes | Run focused test/proof | DOM-shape contract green; final browser block 32.76px for `@` and 31.98px for `/`. |
| TypeScript or typed config changed | yes | Run relevant typecheck | `pnpm --filter plitejs typecheck:entrypoint:react` passed. |
| Package exports or file layout changed | no | N/A | No export or file-layout change; `pnpm brl` not required. |
| Package manifests, lockfile, or install graph changed | no | N/A | Only a changeset was added; no manifest/lock/install graph change. |
| Agent rules or skills changed | no | N/A | No agent source changed. |
| Workspace authority proof | yes | Verify in owner/app | Package commands ran at repo root; Browser used current-source `www` on port 3011. |
| Browser surface changed | yes | Capture Browser proof | Exact mention/slash route replayed and final screenshot captured. |
| Browser final proof | yes | Attach proof or caveat | Browser screenshot emitted; geometry/focus/follow-up ledger recorded below. |
| CI-controlled template output changed | no | N/A | No template source/output touched. |
| Package behavior or public API changed | yes | Add changeset | `plitejs` patch changeset added; no public API shape changed. |
| Registry-only component work changed | no | N/A | Registry caller files were read but not edited. |
| Docs or content changed | no | N/A | Only this execution plan and changeset prose changed. |
| High-risk mini gate | yes | Record risk and proof | Narrow empty-text parent invalidation avoids global structural rerenders; full React suite and affected lane passed. |
| Agent-native review for agent/tooling changes | no | N/A | No agent/tooling changes. |
| Local install corruption suspected | no | N/A | No install corruption signal; rebuilt package/restarted server because app consumes `dist`. |
| P1 autoreview for non-trivial implementation changes | no | N/A | Explicit user waiver retained. |
| PR create or update | no | N/A | No new commit/push authority for this local candidate. |
| Task-style PR body verified | no | N/A | PR was not updated in this task. |
| PR proof image hosting | no | N/A | PR was not updated in this task. |
| Tracker sync-back | no | N/A | No tracker named. |
| Final handoff contract | yes | Fill exact local handoff | Completed below. |
| Final lint | yes | Run scoped equivalent | React entrypoint lint and scoped Ultracite both passed. |
| Output budget discipline | yes | Record accidental output | Initial combined `rg` truncated; subsequent searches were capped/file-specific. |
| Timed checkpoint | no | If duration was requested, keep improving until elapsed, then finish the current loop cleanly; otherwise N/A | N/A: no duration requested. |
| Goal plan complete | yes | Run completion checker | `[autogoal] complete` passed for this plan. |
| Browser interaction proof | yes | Exercise exact interaction | `@` and `/` opened on `/blocks/mention-demo`; popup/options/focus/follow-up verified. |
| Browser console/network check | yes | Record errors | Zero new console errors after the final replay timestamp; network N/A. |
| Browser final proof artifact | yes | Record screenshot | Final corrected slash screenshot emitted through Browser. |
| Exact case replay | yes | Prove exact case | Same route, paragraph, Enter, trigger, popup outcome as reporter screenshot. |
| Final ref and fingerprints | yes | Record local ref/hashes | Base ref and SHA-256 fingerprints recorded below; candidate remains uncommitted. |
| Clean final runtime | no | N/A for local candidate | Uncommitted/unpushed candidate; no fixed/completed pushed-ref claim. |
| Retry-free stability | yes | Record 5/5 | `@` 5/5 and `/` 5/5 with fresh reloads, no retry. |

Phase / pass table:
| Phase | Status | Evidence | Next |
|-------|--------|----------|------|
| Intake and source read | completed | exact browser geometry and Plite owner traced | implementation |
| Implementation | completed | renderer law, parent invalidation, regression contract, changeset | verification |
| Verification | completed | React entrypoint, affected Plite lane, and 5/5 browser ledger green | closeout |
| PR / tracker sync | N/A | local candidate; no new push/tracker authority | final response |
| Closeout | completed | plan/evidence complete; completion checker is final command | final response |

Findings:
- The popup was correctly anchored to its input. The inserted inline combobox doubled its paragraph from about 32px to 55.97px and moved the input onto a second line.
- The leading canonical empty-text spacer retained `data-plite-zero-width="n"` with `<br>` after the inline was inserted. Plate supplies custom leaf rendering, so that text runtime did not rerender on its parent structural change.
- Correct behavior keeps the leading spacer `z` and moves the single empty-block line break to the trailing text node.

Decisions and tradeoffs:
- Fix shared Plite React text rendering/invalidation, not Ariakit positioning or mention/slash callers.
- Observe parent structural changes only for empty mounted text. Include only the parent inputs that determine zero-width rendering in descendant equality.
- Preserve one trailing empty-block line break; removing every `<br>` would collapse blocks whose inline void renders no visible content.
- Retain the explicit no-autoreview waiver from the continuation request; record the gate as N/A at closeout.

Implementation notes:
- `resolveTextZeroWidth` applies the last-empty-text rule directly on a non-inline block.
- Empty mounted text selectors observe parent structure, and descendant equality carries a compact parent render key.
- The regression starts with an empty paragraph, inserts an inline void under custom `renderLeaf`, and proves leading `z` plus trailing `n`.

Review fixes:
- N/A: autoreview was explicitly waived; direct diff inspection required no follow-up patch.

Error attempts:
| Error / failed attempt | Count | Next different move | Resolution |
|------------------------|-------|---------------------|------------|
| Initial combined `rg` returned too much output and was truncated | 1 | Use capped file-specific searches | All later source reads were narrow. |
| A zsh variable named `path` shadowed `PATH` during one search | 1 | Rename the variable and rerun | Search succeeded; no file change resulted. |
| Existing dev server kept old `plitejs` package output after reload | 1 | Build `plitejs` and restart `www` | Fresh server served the current renderer. |
| First static DOM test missed custom-leaf runtime invalidation | 1 | Reproduce empty block -> inline insertion with `renderLeaf` | Test failed red on the retained leading `<br>`, then passed after invalidation fix. |
| Browser locator could not type into the focused zero-width combobox input | 1 | Type at current focus through Browser input control | Follow-up value became `a` and focus remained on combobox. |
| Initial trial oracle required sub-1px gap for mention | 1 | Account for mention's explicit `my-1.5` 6px margin | Correct oracle passed 5/5; slash remains sub-1px. |
| Markdown-only Ultracite closeout returned "No files found to lint" | 1 | Keep the earlier TS-scoped Ultracite proof and use the plan checker for the plan | Formatting passed; no lintable source was supplied in this extra command. |

Verification evidence:
- Pre-fix Browser: paragraph 55.97px; slash input y=222.07; popup y=241.11; leading spacer `n`.
- Red owner contract: expected leading `z`, received `n`.
- Final Browser: mention paragraph 32.76px, configured 6px margin/gap 6.26px; slash paragraph 31.98px, 0px margin/gap 0.26px; leading `z`, trailing `n`.
- Stability: `@` 5/5 and `/` 5/5. Every run kept combobox focus and accepted follow-up `a`.
- Console: zero new errors after `2026-08-30T06:06:17.503Z`.
- Package: React entrypoint test 75 files / 1109 tests passed; React typecheck and lint passed; scoped Ultracite passed.
- Affected lane: `pnpm check:plite:dev` passed 88 typecheck tasks, 139 test tasks, app typecheck, production build, and 3 Chromium smoke tests.
- Local base ref: `a8f9de4dc274fddf3d1a0cf4813bf4d77f5b0e04`.
- Production fingerprints: `editable-text-blocks.tsx` `c188db485d305132e065ade2a5df45d8e83cc1e14e59422e04992a86d3247296`; `editable-descendant-binding.ts` `863096a31f634e7dcc9345d16a14f1827b5e0bc5385919511bca3d21c5368b9b`; `editable-node-equality.ts` `38078cc824e1b585b66893197bc6d4cd843baaaeb5a570070bc2e50a2ad8b7b0`; `use-node-selector.tsx` `314f846f7e0451017d1d74308251c03c5df9da3a0b835951eb63d74cf7d40c16`.
- Test fingerprint: `rendered-dom-shape-contract.tsx` `2107ddf27d0e15a6340442c7b88f63cfbeff86b963c8bbd977bc6a18b7f8cf27`.
- Fixture fingerprints: `inline-combobox.tsx` `3f6227f3e21edb3bfe1fa76565b180419c2b07fcd2f564c5d6f2574fff9b6fc4`; `mention.tsx` `e61f7e8701ba66e9f8e2e5e19babdb21c76bde9360368397c8a8660e3f8fed02`; `slash.tsx` `4dd63959bf929ec11040b81c3c4b350f189c379579b9797dac8ec975fd58bfcd`.

Final handoff contract:
- PR line: N/A: local uncommitted candidate; existing PR not updated.
- Issue / tracker line: N/A: none named.
- Confidence line: high for local candidate; pushed-ref/CI closure not claimed.
- Flow table:
  - Reproduced: red owner contract and exact Browser geometry.
  - Verified: React package gates, affected Plite lane, and Browser 5/5 for both triggers.
- Browser check: corrected screenshot, exact geometry, focus/follow-up, and zero new errors.
- Outcome: inline combobox stays on the paragraph's first line and popup follows it.
- Caveat: uncommitted/unpushed local candidate; autoreview intentionally waived.
- Design:
  - Chosen boundary: Plite React empty-text zero-width rendering and parent-structure invalidation.
  - Why not quick patch: changing mention/slash offsets would leave every inline void on the wrong line.
  - Why not broader change: only empty text has this parent-dependent rendering law; global structural rerenders are unnecessary.
- Verified: named evidence above.
- PR body verified: N/A: PR not updated.

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
- PR: N/A: local candidate.
- Issue / tracker: N/A.
- Browser proof: exact `/blocks/mention-demo` interaction, corrected screenshot, and 5/5 per trigger.
- Caveats: uncommitted/unpushed; no pushed-ref or CI claim.

Timeline:
- 2026-08-30T05:39:32.540Z Task goal plan created.
- 2026-08-30 Requirement extraction, skill routing, screenshot inspection, exact browser case, and completion threshold recorded before runtime edits.
- 2026-08-30 Exact browser and contract reproduction isolated the stale leading empty-block `<br>`.
- 2026-08-30 Implemented parent-aware empty-text invalidation and the last-text line-break law; added Plite patch changeset.
- 2026-08-30 React entrypoint, affected Plite lane, and `@`/`/` Browser 5/5 proof passed.

Reboot status:
| Question | Answer |
|----------|--------|
| Where am I? | Closeout complete |
| Where am I going? | Final response |
| What is the goal? | Fix the shared combobox Y anchor and prove both mention and slash geometry. |
| What have I learned? | The apparent popup offset was a stale leading zero-width line break in Plite React. |
| What have I done? | Fixed the renderer/invalidation, added regression coverage/changeset, and passed package plus browser proof. |

Open risks:
- Remaining risk is publication state only: this candidate is not committed, pushed, or validated by PR CI.
