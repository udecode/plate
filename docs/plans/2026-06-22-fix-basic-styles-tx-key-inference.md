# fix basic styles tx key inference

Objective:
Fix basic-styles tx key inference; no string-index tx helper remains, literal-key tx tests pass, and package gates are green.

Flow mode:
one-shot execution

Goal plan:
docs/plans/2026-06-22-fix-basic-styles-tx-key-inference.md

Template:
docs/plans/templates/task.md

Primary template:
docs/plans/templates/task.md

Applied packs:
- package-api (docs/plans/templates/packs/package-api.md)

Task source:
- type: user correction in current Codex thread
- id / link: N/A
- title: Fix `basic-styles` tx key inference
- acceptance criteria: remove or rewrite the helper pattern that produces `createStyleMarkTx(groupKey: string, markKey: string): { [x: string]: ... }`; preserve inline/literal tx inference for style plugins; keep `platejs` facade imports; verify no string-index helper leak remains; run focused package gates; do not broaden into another package.

First checkpoint:
- Before implementation or broad exploration, copy every explicit prompt
  requirement into this plan as checkable checkpoints: scope, non-goals,
  timing/duration, stop conditions, deliverables, final handoff sections,
  verification surface, and success criteria.
- Do not continue into implementation until this extraction is complete or
  explicitly marked N/A with reason.

Timed checkpoint:
- requested duration: N/A
- semantics: N/A
- initial confidence score: N/A: binary type/source gates
- improvement loop: N/A
- final score / loop closure: N/A

Completion threshold:
- `createStyleMarkTx` no longer produces a string-index tx API.
- Any `basic-styles` tx helper that would erase literal keys is deleted or replaced with inline literal-key tx definitions.
- `basic-styles` still imports from `platejs`, not direct owner packages.
- Focused tests prove `editor.update(tx => tx.<literal-style-key>.set(...))`.
- Typecheck/test/build/lint gates for `@platejs/basic-styles` pass, plus any core gate touched by the fix.
- Task closure is legal only when the source-of-truth acceptance criteria are
  satisfied or explicitly narrowed, required verification evidence is recorded,
  code-review and release-artifact gates are closed when applicable, tracker/PR
  sync is complete or marked N/A with reason, and
  `node .agents/skills/autogoal/scripts/check-complete.mjs docs/plans/2026-06-22-fix-basic-styles-tx-key-inference.md` passes.

Verification surface:
- Source audit for `createStyleMarkTx`, `createBlockStyleTx`, and string-index tx helper patterns under `packages/basic-styles/src`.
- Type-level/package tests that use literal style keys through `editor.update`.
- `pnpm turbo typecheck --filter=./packages/basic-styles`
- `pnpm --filter @platejs/basic-styles test`
- `pnpm --filter @platejs/basic-styles build`
- `pnpm --filter @platejs/basic-styles lint:fix`
- `node .agents/skills/autogoal/scripts/check-complete.mjs docs/plans/2026-06-22-fix-basic-styles-tx-key-inference.md`

Constraints:
- Preserve existing user-facing behavior outside the task scope.
- Prefer the durable ownership boundary over caller-by-caller patches.
- Do not create PRs, comments, commits, or pushes unless the task/user/skill
  requires them.
- Do not add broad ceremony when the task is trivial or docs-only.

Boundaries:
- Source of truth: `packages/basic-styles/src`, focused `@platejs/basic-styles` tests, and prior Plate v2 facade/core packet.
- Allowed edit scope: `packages/basic-styles`, this plan, and core only if type proof requires it.
- Browser surface: N/A unless a rendered behavior surface unexpectedly changes.
- Browser strategy: N/A: package/API typing fix. Use Browser for normal app QA; use Chrome directly
  for native downloads, print/print-preview, file picker/uploads, clipboard,
  browser dialogs/permissions, extension/profile state, or exact Chrome
  rendering; use Computer Use only for native Chrome/OS UI that needs visual
  inspection after Chrome automation cannot read it.
- Tracker sync: N/A.
- Non-goals: no broad package migration, no direct import churn, no PR/commit, no docs rewrite, no global core legacy cleanup.

Output budget strategy:
- Use targeted reads/searches under `packages/basic-styles` and focused proof commands only.

Blocked condition:
- Stop only if preserving literal tx keys requires changing the Plite/core extension type model beyond this package.

Task state:
- task_type: package/API type regression fix
- task_complexity: normal
- current_phase: closeout
- current_phase_status: complete
- next_phase: final response
- goal_status: active

Current verdict:
- verdict: fix the helper design, likely by inlining tx groups per plugin
- confidence: 0.82 before patch
- next owner: task
- reason: helper with computed `string` key erases the literal plugin-key API.

Completion rule:
- Do not call `update_goal(status: complete)` while any required checklist item
  remains unchecked. If an item does not apply, check it and add `N/A: <reason>`.
- Do not call `update_goal(status: complete)` until every completion threshold
  above is satisfied, final handoff evidence is recorded, and
  `node .agents/skills/autogoal/scripts/check-complete.mjs docs/plans/2026-06-22-fix-basic-styles-tx-key-inference.md` passes.
- Do not create hook state for this goal. This file plus the active goal are the
  durable state.

Start Gates:
| Gate | Applies | Evidence |
|------|---------|----------|
| Prompt requirements captured before work | yes | Requirement is literal tx key inference; no `[x: string]` helper leak; focused `basic-styles` only. |
| Timed checkpoint parsed | N/A | No duration requested. |
| Skill analysis before edits | yes | User explicitly invoked `autogoal`; package-api pack applies. |
| Active goal checked or created | yes | `get_goal` returned none; active goal created. |
| Source of truth read before edits | yes | Read `createStyleMarkTx`, `createBlockStyleTx`, all touched style plugins, tests, and rebuilt declarations. |
| Tracker comments and attachments read | N/A | No tracker/attachments. |
| Video transcript evidence required | N/A | No video. |
| `docs/solutions` checked for non-trivial existing-code work | N/A | Current package source is owner. |
| TDD decision before behavior change or bug fix | yes | Add/repair focused type/runtime tests before closing. |
| Branch decision for code-changing task | N/A | No branch/PR requested. |
| Release artifact decision | yes | N/A for focused review fix; no release requested. |
| Browser tool decision for browser surface | N/A | Package type/API fix only. |
| PR expectation decision | N/A | No PR requested. |
| Tracker sync expectation decision | N/A | No tracker. |
| Output budget strategy recorded | yes | Targeted package reads/proof only. |
| Package/API pack selected | yes | `package-api` pack applied. |
| Public surface or package boundary identified | yes | `@platejs/basic-styles` tx API and generated declarations. |
| Release artifact path selected | N/A | No release artifact for this fix checkpoint. |
| `changeset` skill loaded when `.changeset` is required | N/A | No changeset required. |
| Barrel/export impact decision recorded | yes | Run `pnpm brl` only if exported layout changes; likely N/A. |

Work Checklist:
- [x] Duration handling recorded: N/A, no duration requested.
- [x] First checkpoint complete: prompt requirement copied before implementation.
- [x] Short objective plus outcome, completion threshold, verification surface, constraints, boundaries, and blocked condition are concrete.
- [x] Task source classified: current-thread user correction about `createStyleMarkTx` string-index inference loss.
- [x] Video evidence N/A: no video.
- [x] Nearby package patterns read before edits.
- [x] Implementation fixes the right ownership boundary: inline literal tx groups in owning plugins; delete helper abstraction.
- [x] Release artifact requirement recorded: N/A for this focused checkpoint.
- [x] Final handoff shape decided: changed list, proof, caveat.
- [x] Branch handling N/A: no branch/PR requested.
- [x] Local-env-rot retry policy N/A: no env-rot signal.
- [x] Workspace authority recorded: proof commands ran from `/Users/zbeyens/git/plate-2`.
- [x] High-risk note recorded: package tx type API was at risk; declaration audit and negative type assertions prove literal keys.
- [x] Autoreview deferred: not requested for this immediate correction; run before commit.
- [x] Agent-native review N/A: no agent/tooling changes.
- [x] Output budget discipline followed: scoped package reads and proof only.
- [x] Package/API pack: public API, package boundary, export, and release-artifact impact recorded.
- [x] Package/API pack: release artifact matrix applied: no release artifact for this checkpoint.
- [x] Package/API pack: changeset N/A.
- [x] Package/API pack: registry-only N/A.
- [x] Package/API pack: no-artifact reason recorded: focused review fix, no release packaging requested.
- [x] Package/API pack: compatibility/hard-cut explicit: delete helper abstraction to preserve literal tx keys.
- [x] Package/API pack: package-owned typecheck/build/test proof recorded.
- [x] Package/API pack: generated barrels/release notes N/A; no exported file layout changed.

Completion Gates:
| Gate | Applies | Required action | Evidence |
|------|---------|-----------------|----------|
| Named verification threshold | yes | Run the command, proof, source audit, or artifact check named in this plan | Source and declaration scans clean; package gates green. |
| Bug reproduced before fix | yes | Record failing test/repro or N/A with reason | Original declaration showed `{ [x: string]: ... }`; fixed declarations show literal keys. |
| Targeted behavior verification | yes | Run focused test/proof for changed behavior or record N/A | `@platejs/basic-styles` tests pass. |
| TypeScript or typed config changed | yes | Run relevant typecheck | `pnpm turbo typecheck --filter=./packages/basic-styles` passes with negative type assertions. |
| Package exports or file layout changed | N/A | Run `pnpm brl` before final verification and keep generated barrel updates | No exported file layout changed. |
| Package manifests, lockfile, or install graph changed | N/A | Run `pnpm install` and relevant package checks | No manifest/lockfile change. |
| Agent rules or skills changed | N/A | Run `pnpm install` and verify generated skill sync | No agent changes. |
| Workspace authority proof | yes | Run verification in the owning repo/package/app/route/tool and record cwd | Commands ran in `/Users/zbeyens/git/plate-2`. |
| Browser surface changed | N/A | Capture Browser proof for normal app surfaces, or Chrome/Computer proof for native browser/OS surfaces | Package type/declaration fix only. |
| Browser final proof | N/A | Attach Browser/Chrome/Computer proof or exact caveat when browser proof applies | N/A. |
| CI-controlled template output changed | N/A | Restore generated template output or record why it is intentionally kept | N/A. |
| Package behavior or public API changed | yes | Add a changeset or record why no changeset applies | No changeset for this review checkpoint; package beta migration still in progress. |
| Registry-only component work changed | N/A | Update `docs/components/changelog.mdx` or record N/A | N/A. |
| Docs or content changed | yes | Verify source-backed claims or record N/A | Plan docs only, source-backed. |
| High-risk mini gate | yes | Record failure mode, proof plan, and boundary | Failure mode: helper erases literal tx keys. Proof: helper deleted, declarations literal, negative type assertions active. |
| Agent-native review for agent/tooling changes | N/A | Load agent-native reviewer or N/A | No agent/tooling change. |
| Local install corruption suspected | N/A | Run reinstall or N/A | No env-rot signal. |
| Autoreview for non-trivial implementation changes | N/A | Run autoreview or N/A | Deferred; user asked immediate fix, run before commit. |
| PR create or update | N/A | Run check before PR work | No PR. |
| Task-style PR body verified | N/A | Verify PR body when PR exists | No PR. |
| PR proof image hosting | N/A | Host images or N/A | N/A. |
| Tracker sync-back | N/A | Sync issue/Linear or N/A | No tracker. |
| Final handoff contract | yes | Fill final handoff fields below | Filled below. |
| Final lint | yes | Run `pnpm lint:fix` or scoped equivalent | `pnpm --filter @platejs/basic-styles lint:fix` passes. |
| Output budget discipline | yes | Verify no unbounded output streamed | Targeted package commands only. |
| Timed checkpoint | N/A | If duration requested, keep improving until elapsed | No duration. |
| Goal plan complete | yes | Run `node .agents/skills/autogoal/scripts/check-complete.mjs docs/plans/2026-06-22-fix-basic-styles-tx-key-inference.md` | Run after ledger fill. |
| Public API / package boundary proof | yes | Source-audit public API, exports, and package boundary impact | Rebuilt `.d.ts` shows literal keys: `fontSize`, `textAlign`, etc. |
| Release artifact classification | yes | Record release artifact class | Focused package API/type fix; no release artifact in this checkpoint. |
| Published package changeset | N/A | Add changeset if publishing | N/A for current checkpoint. |
| Registry changelog | N/A | Use registry changelog if registry-only | N/A. |
| No release artifact | yes | Record exact reason | Review checkpoint during Plate v2 migration, no release requested. |
| Package typecheck/build/test | yes | Run owning package checks | Typecheck/test/build pass. |
| Barrel/export generation | N/A | Run `pnpm brl` when exports or layout changed | No exported layout changed. |

Phase / pass table:
| Phase | Status | Evidence | Next |
|-------|--------|----------|------|
| Intake and source read | complete | Read helper/plugin/test/declaration surfaces. | implementation |
| Implementation | complete | Deleted helper abstraction; inlined literal tx groups. | verification |
| Verification | complete | Typecheck/test/build/lint/declaration scans pass. | closeout |
| PR / tracker sync | N/A | No PR/tracker requested. | final response |
| Closeout | complete | Plan filled and ready for final response. | final response |

Findings:
- `createStyleMarkTx(groupKey: string, markKey: string)` and `createBlockStyleTx(groupKey: string, ...)` erased plugin literal keys into `{ [x: string]: ... }`.
- The correct fix is inline tx group declarations at each plugin where the literal key is known.
- Rebuilt declarations now preserve literal groups: `fontSize`, `color`, `fontFamily`, `backgroundColor`, `fontWeight`, `lineHeight`, and `textAlign`.
- Negative type assertions now guard against unknown tx groups and invalid tx values.

Decisions and tradeoffs:
- Deleted both helper files instead of making them more generic. Generic helpers were the bug shape.
- Kept `platejs` imports. This fix is about tx inference, not import ownership.
- Did not broaden beyond `basic-styles`.

Implementation notes:
- Inlined style mark tx groups in font size/color/family/background/weight plugins.
- Inlined block style tx groups in line height and text align plugins.
- Added type-level negative assertions for unknown tx group, font-size value type, and text-align value type.

Review fixes:
- N/A: no autoreview in this immediate correction.

Error attempts:
| Error / failed attempt | Count | Next different move | Resolution |
|------------------------|-------|---------------------|------------|
| Used `if (false)` runtime-block type assertions | 1 | Move to type-only assertions | Lint rejected constant conditions; replaced with type aliases. |
| Multiline `@ts-expect-error` assertions | 1 | Make expected-error line formatter-stable | Formatter moved the error off the directive line; split into intermediate `Bad*Value` aliases. |

Verification evidence:
- `rg -n "createStyleMarkTx|createBlockStyleTx|\\[x: string\\]|\\[key: string\\]|\\[groupKey\\]|\\[plugin\\.key\\]" packages/basic-styles/src packages/basic-styles/dist -g '*.ts' -g '*.tsx' -g '*.d.ts'` -> no matches.
- Rebuilt `packages/basic-styles/dist/index-*.d.ts` shows literal tx groups: `backgroundColor`, `color`, `fontFamily`, `fontSize`, `fontWeight`, `lineHeight`, `textAlign`.
- `rg -n "@ts-expect-error|notAStyleGroup|BadFontSizeValue|BadTextAlignValue|_FontSizeRejectsNumber|_TextAlignRejectsMiddle" packages/basic-styles/src/lib/*.spec.ts` -> expected type assertions present.
- `pnpm --filter @platejs/basic-styles lint:fix` -> pass.
- `pnpm turbo typecheck --filter=./packages/basic-styles` -> pass.
- `pnpm --filter @platejs/basic-styles test` -> pass, 24 tests.
- `pnpm --filter @platejs/basic-styles build` -> pass.

Final handoff contract:
- PR line: N/A.
- Issue / tracker line: N/A.
- Confidence line: 0.96 for the `basic-styles` inference fix.
- Flow table:
  - Reproduced: declaration/source audit showed `[x: string]` from helper-generated tx groups.
  - Verified: typecheck/test/build/lint and rebuilt declaration audit.
- Browser check: N/A.
- Outcome: literal-key tx inference restored for `basic-styles`.
- Caveat: only `basic-styles` fixed; other packages may still have similar helper mistakes.
- Design:
  - Chosen boundary: inline tx groups in owning plugins.
  - Why not quick patch: const-generic helper would keep abstraction risk and still hide the literal owner.
  - Why not broader change: user asked this concrete regression; broad package sweep should be a separate packet.
- Verified: see verification evidence.
- PR body verified: N/A.

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
- Browser proof: N/A.
- Caveats: other packages not audited for the same helper smell.

Timeline:
- 2026-06-22T12:21:48.970Z Task goal plan created.

Reboot status:
| Question | Answer |
|----------|--------|
| Where am I? | Closeout after fixing `basic-styles` tx key inference. |
| Where am I going? | Final response; next packet should audit other packages for helper-erased tx keys. |
| What is the goal? | Remove string-index tx helper leakage and prove literal tx keys. |
| What have I learned? | Generic computed-key helpers are hostile to this API shape. |
| What have I done? | Deleted helpers, inlined literal groups, added negative type assertions, and verified declarations/gates. |

Open risks:
- Similar computed-key helper patterns may exist in other packages.
- Autoreview still needed before commit.
