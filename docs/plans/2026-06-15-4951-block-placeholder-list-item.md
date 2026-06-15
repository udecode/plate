# 4951 block placeholder list item

Objective:
Fix #4951 block placeholder list-item bug; done when repro fails before fix, passes after fix, checks/review pass, and PR/sync-back complete.

Goal plan:
docs/plans/2026-06-15-4951-block-placeholder-list-item.md

Template:
docs/plans/templates/task.md

Primary template:
docs/plans/templates/task.md

Applied packs:
- package-api (docs/plans/templates/packs/package-api.md)

Task source:
- type: GitHub issue
- id / link: #4951 https://github.com/udecode/plate/issues/4951
- title: [@platejs/utils] BlockPlaceholderPlugin suppresses placeholder on single empty list item (indent-list)
- acceptance criteria: reproduce the missing placeholder on a single empty list-style paragraph, fix the plugin so that state shows the configured block placeholder, preserve pristine single-empty-editor suppression, add package regression coverage, ship with package release artifact and tracker sync.

Completion threshold:
- Focused regression test fails before implementation for the reported single empty indent-list state.
- Focused regression test passes after implementation while existing pristine-empty suppression remains covered.
- Owning package verification, release artifact, autoreview, PR body check, and tracker sync are complete or explicitly N/A with evidence.
- Task closure is legal only when the source-of-truth acceptance criteria are
  satisfied or explicitly narrowed, required verification evidence is recorded,
  code-review and release-artifact gates are closed when applicable, tracker/PR
  sync is complete or marked N/A with reason, and
  `node .agents/skills/autogoal/scripts/check-complete.mjs docs/plans/2026-06-15-4951-block-placeholder-list-item.md` passes.

Verification surface:
- `pnpm --filter @platejs/core build && bun test packages/core/src/lib/plugins/slate-extension/SlateExtensionPlugin.spec.tsx packages/utils/src/react/plugins/BlockPlaceholderPlugin.spec.tsx`
- `pnpm turbo typecheck --filter=./packages/core --filter=./packages/utils`
- `pnpm --filter www build:source`
- `pnpm lint:fix`
- `pnpm check` before PR update
- autoreview helper on final diff
- PR body readback and issue #4951 sync-back

Constraints:
- Preserve existing user-facing behavior outside the task scope.
- Prefer the durable ownership boundary over caller-by-caller patches.
- Do not create PRs, comments, commits, or pushes unless the task/user/skill
  requires them.
- Do not add broad ceremony when the task is trivial or docs-only.

Boundaries:
- Source of truth: GitHub issue #4951 body, local `BlockPlaceholderPlugin` source/tests, repo instructions.
- Allowed edit scope: `packages/core` state-empty API/tests, `packages/utils` placeholder plugin/tests, affected docs, `.changeset`, this goal plan, PR/issue text.
- Browser surface: Browser route proof attempted because packages/content changed; the standalone demo route loads, but Browser automation cannot move the Slate selection from the heading into the empty paragraph, and the page exposes no editor object for direct state inspection. Focused React plugin specs remain the behavior authority.
- Tracker sync: posted concise issue comment after verified PR exists.
- Non-goals: do not rewrite list autoformat, list data model, or expose a broad placeholder rendering API unless source proves it is needed.

Output budget strategy:
- Use exact issue/file reads, focused `rg` patterns, targeted test commands, and capped command output. Avoid broad repo scans and generated/build output streams.

Blocked condition:
- Stop if the focused regression cannot reproduce the issue before implementation, or if source proves the behavior is invalid/wont-fix.

Task state:
- task_type: public issue bug fix
- task_complexity: normal
- current_phase: closeout
- current_phase_status: complete
- next_phase: amend/push updated PR
- goal_status: ready_for_handoff

Current verdict:
- verdict: valid and fixed locally with core-owned state-empty API
- confidence: 98%
- next owner: task
- reason: issue claim matches local global-empty guard; the final fix adds plugin-owned `node.isMetadataProp`, has `NodeIdPlugin` claim its configured id key as inert metadata, and makes `BlockPlaceholderPlugin` delegate its default pristine-empty policy to `editor.api.isElementStateEmpty`.

Pre-solution issue challenge:
- reporter claim: `BlockPlaceholderPlugin` hides placeholder when the only block is an empty paragraph with indent-list metadata.
- suggested diagnosis or fix: diagnosis likely right; suggested hardcoded list/indent pristine check is too narrow and should be challenged.
- repro ladder:
  - tests / source-level repro: in progress with focused plugin spec
  - Playwright / automated browser: N/A unless unit repro cannot model behavior
  - Browser plugin: N/A unless tests cannot model user-visible surface honestly
  - screenshot / visual proof: N/A unless visual rendering, layout, or native state becomes the blocker
- reproduction verdict: reproduced with focused plugin test; `_target` remains `null` for a single empty list-style paragraph.
- validity verdict: valid
- best long-term fix boundary: `BlockPlaceholderPlugin` should distinguish pristine editor state from user-created structural empty blocks without list-specific caller patches, via plugin-owned pristine-empty policy.
- harsh honest feedback: reporter found a real-looking bug; their list-property pseudocode is too local and would bake one plugin's metadata into a generic placeholder utility.
- hard-stop decision: reproduced, so implementation may proceed.

Completion rule:
- Do not call `update_goal(status: complete)` while any required checklist item
  remains unchecked. If an item does not apply, check it and add `N/A: <reason>`.
- Do not call `update_goal(status: complete)` until every completion threshold
  above is satisfied, final handoff evidence is recorded, and
  `node .agents/skills/autogoal/scripts/check-complete.mjs docs/plans/2026-06-15-4951-block-placeholder-list-item.md` passes.
- Do not create hook state for this goal. This file plus the active goal are the
  durable state.

Start Gates:
| Gate | Applies | Evidence |
|------|---------|----------|
| Skill analysis before edits | yes | Read task/autoreview/tdd/autogoal skills; using task plus pre-solution challenge, red-green TDD, and goal plan. |
| Active goal checked or created | yes | Initial run used the goal plan. Follow-up rename run created goal `Hard rename node.isPropEmpty to node.isMetadataProp...` and reused this ledger. |
| Source of truth read before edits | yes | `gh issue view 4951 --comments --json ...` read issue body/comments. |
| Tracker comments and attachments read | yes | Issue has no comments or attachments. |
| Video transcript evidence required | no | N/A: issue contains no video/screen recording evidence. |
| Pre-solution issue challenge required | yes | Public issue has bug claim, diagnosis, and proposed fix; challenge recorded in this plan. |
| Reproduction verdict before implementation | yes | Reproduced by failing `bun test packages/utils/src/react/plugins/BlockPlaceholderPlugin.spec.tsx -t "keeps the target on a single empty list item"` before implementation. |
| Repro escalation ladder selected | yes | Start with focused plugin spec; higher browser levels N/A unless tests cannot model behavior. |
| Suggested fix reviewed against durable boundary | yes | Rejected list-specific hardcode as too narrow; durable boundary is generic pristine-state distinction. |
| `docs/solutions` checked for non-trivial existing-code work | no | N/A: narrow plugin regression; existing source/tests are the authority. |
| TDD decision before behavior change or bug fix | yes | Use red regression test in `BlockPlaceholderPlugin.spec.tsx` before implementation. |
| Branch decision for code-changing task | yes | Created dedicated branch `codex/4951-block-placeholder-list` from `main`. |
| Release artifact decision | yes | `.changeset` required because `@platejs/core` public API and `@platejs/utils` published package behavior changed. |
| Browser tool decision for browser surface | yes | Required by repo policy for package/content changes; Browser loaded `http://localhost:3050/blocks/block-placeholder-demo`, force-focused the editor, but could not move Slate selection into the empty paragraph and found no editor global for direct plugin-state inspection. |
| PR expectation decision | yes | Task workflow expects verified PR before tracker sync. |
| Tracker sync expectation decision | yes | Comment on #4951 after PR exists and verification is complete. |
| Output budget strategy recorded | yes | Exact source reads and capped focused commands only. |
| Package/API pack selected | yes | `--with package-api` applied because published package runtime behavior changes. |
| Public surface or package boundary identified | yes | `@platejs/core` editor/plugin API plus `@platejs/utils` runtime behavior via `BlockPlaceholderPlugin`. |
| Release artifact path selected | yes | `.changeset` for `@platejs/core` and `@platejs/utils`. |
| `changeset` skill loaded when `.changeset` is required | yes | Read `.agents/skills/changeset/SKILL.md` and `.agents/rules/changeset.mdc`; added separate `.changeset/core-node-metadata-prop.md` and `.changeset/utils-block-placeholder-list.md`. |
| Barrel/export impact decision recorded | no | N/A: no exports or exported file layout expected. |

Work Checklist:
- [x] Short objective plus outcome, completion threshold, verification surface,
      constraints, boundaries, and blocked condition are concrete.
- [x] Task source classified with source type, id/link, title, task type,
      acceptance criteria, caveats, likely files/routes/packages, browser
      surface, and root-cause layer.
- [x] Required video or screen-recording evidence is cached/read as normalized
      `<video-transcripts>` XML, or marked N/A with reason.
- [x] For public tracker bug reports, behavior claims, technical diagnoses, or
      suggested fixes, reporter claims are challenged before implementation
      with a recorded verdict: `valid`, `not reproduced`, `invalid`,
      `wont-fix`, `partially valid`, or `platform limitation`. Feature, docs,
      support, or cleanup requests with no bug claim may mark reproduction
      `N/A` with reason.
- [x] Repro escalation ladder followed for bug/behavior claims: focused
      test/source-level repro first when applicable; existing repo-owned
      Playwright regression/test harness next when available and useful as
      executable coverage; do not use standalone Playwright, Puppeteer, or raw
      DevTools as a substitute for the repo Browser policy;
      `[@Browser](plugin://browser@openai-bundled)` next when tests or
      Playwright cannot reproduce or cannot model the surface honestly;
      screenshot or explicit visual-proof waiver when visual/native state
      matters.
- [x] Hard-stop rule followed for bug/behavior claims: no code when the issue
      is not reproduced, invalid, or won't-fix; partial validity pivots to the
      best long-term fix and records what was wrong or incomplete in the issue's
      proposed path.
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
- [x] Package/API pack: public API, package boundary, export, and release-artifact impact are recorded.
- [x] Package/API pack: release artifact matrix is applied: `.changeset`, registry changelog, or explicit no-artifact reason.
- [x] Package/API pack: `.changeset` work loads `changeset` and follows its package/version/prose rules.
- [x] Package/API pack: registry-only work uses the `registry-changelog` pack instead of adding a package changeset.
- [x] Package/API pack: no-artifact decisions state why the diff has no published package user-visible delta from `main`.
- [x] Package/API pack: compatibility, migration, or hard-cut decision is explicit when public shape changes.
- [x] Package/API pack: package-owned typecheck/build/test proof is recorded or marked N/A with reason.
- [x] Package/API pack: generated barrels or release notes are updated when required.

Completion Gates:
| Gate | Applies | Required action | Evidence |
|------|---------|-----------------|----------|
| Named verification threshold | yes | Run the command, proof, source audit, or artifact check named in this plan | Red repro failed before fix; hard rename source audit found no source-owned `isPropEmpty` refs; focused core+utils spec, core+utils typecheck, docs source build, lint-fix, Browser route attempt, `pnpm check`, and final autoreview passed. |
| Pre-solution issue challenge verdict | yes | Record reporter claim, suggested fix, repro verdict, validity verdict, durable boundary, and hard-stop/pivot decision before implementation | Valid. Reproduced before implementation; rejected list-only proposed fix as too narrow. |
| Repro escalation ladder | yes | For bug/behavior claims, record test/source-level, Playwright, Browser, and screenshot/visual-proof outcomes or N/A/blocker reasons before `not reproduced` | Focused source-level spec reproduced and verified the behavior. Playwright/Browser/screenshot N/A because no browser-only state remained. |
| Bug reproduced before fix | yes | Record failing test/repro or N/A with reason | `bun test packages/utils/src/react/plugins/BlockPlaceholderPlugin.spec.tsx -t "keeps the target on a single empty list item"` failed before implementation: expected placeholder `_target`, received `null`. |
| Targeted behavior verification | yes | Run focused test/proof for changed behavior or record N/A | `pnpm --filter @platejs/core build && bun test packages/core/src/lib/plugins/slate-extension/SlateExtensionPlugin.spec.tsx packages/utils/src/react/plugins/BlockPlaceholderPlugin.spec.tsx` passed: 30 tests, including editor API, `node.isMetadataProp`, configured NodeId metadata, custom inert props, and empty list-item placeholder target. |
| TypeScript or typed config changed | yes | Run relevant typecheck | `pnpm turbo typecheck --filter=./packages/core --filter=./packages/utils` passed. |
| Package exports or file layout changed | no | Run `pnpm brl` before final verification and keep generated barrel updates | N/A: no exports or file layout changed. |
| Package manifests, lockfile, or install graph changed | no | Run `pnpm install` and relevant package checks | N/A: no manifests, lockfile, or install graph changed. |
| Agent rules or skills changed | no | Run `pnpm install` and verify generated skill sync | N/A: no agent rules or skills changed. |
| Workspace authority proof | yes | Run verification in the owning repo/package/app/route/tool and record cwd; do not count the wrong workspace as proof | Commands ran in `/Users/zbeyens/git/plate`; owning package proof is `packages/utils`. |
| Browser surface changed | yes | Capture Browser Use proof or record explicit waiver/blocker | Browser loaded `http://localhost:3050/blocks/block-placeholder-demo`; demo source uses `BlockPlaceholderKit`; Browser could force-focus the editor, but click/key automation did not move selection into the empty paragraph and no window editor global exists, so visual placeholder proof is blocked. |
| Browser final proof | yes | Attach screenshot or exact browser verification caveat when browser proof applies | Exact caveat recorded: Browser could not establish the empty-block Slate selection needed to activate the placeholder; focused React plugin spec proves `_target` and injected placeholder props instead. |
| CI-controlled template output changed | no | Restore generated template output or record why it is intentionally kept | N/A: no `templates/**` output touched. |
| Package behavior or public API changed | yes | Add a changeset or record why no changeset applies | Added `.changeset/core-node-metadata-prop.md` for `@platejs/core` and `.changeset/utils-block-placeholder-list.md` for `@platejs/utils`. |
| User-visible registry output changed | no | Use the registry-changelog pack: add/update `apps/www/src/registry/changelog/entries/*.mdx`, run `node tooling/scripts/generate-ui-changelog-entries.mjs --write`, run `node tooling/scripts/generate-ui-changelog-entries.mjs --check`, or record N/A | N/A: no `apps/www/src/registry/**` behavior output changed. |
| Docs or content changed | yes | For docs-heavy work, use `--template docs`; for incidental docs, verify source-backed claims, links, examples, and rendered output or record N/A | Incidental docs update to core API and block-placeholder EN/CN visibility/API rule; `pnpm --filter www build:source` passed and Browser route loaded. |
| High-risk mini gate | yes | For public API/runtime/package-boundary/browser/agent-action/command-contract changes, record realistic failure mode, proof plan, and why the chosen boundary is right; otherwise N/A | Failure mode: internal ids could trigger placeholders on pristine docs or the empty-state API could be owned by the wrong plugin namespace. Proof: metadata-only id test stays suppressed when `NodeIdPlugin` is active, configured id key is honored, custom plugins can claim inert props through `node.isMetadataProp`, and `editor.api.isElementStateEmpty` is covered. Boundary is node-plugin-owned prop inertness plus editor-facing state check plus placeholder-owned default policy. |
| Agent-native review for agent/tooling changes | no | For `.agents/**`, `.claude/**`, `.codex/**`, skills, hooks, commands, prompts, or user-action tooling, load `.agents/skills/agent-native-reviewer/SKILL.md` and close accepted/actionable findings, or record N/A | N/A: no agent/tooling surfaces changed. |
| Local install corruption suspected | no | Run `pnpm run reinstall` once, rerun the exact failing command, or record N/A | N/A: no suspicious env-rot failure; full check passed. |
| Autoreview for non-trivial implementation changes | yes | Load `.agents/skills/autoreview/SKILL.md`; use dirty local `--mode local`, branch/PR `--mode branch --base <base>`, or committed slice `--mode commit --commit <ref>` until no accepted/actionable findings, or record N/A for docs-only/trivial/no local patch | Final `.agents/skills/autoreview/scripts/autoreview --mode local` exited 0: no accepted/actionable findings; reviewer explicitly validated consistent rename to `node.isMetadataProp`. |
| PR create or update | yes | Run `check` before PR work and sync PR body to the task-style final handoff | `pnpm check` passed before PR update; PR #5029 body updated with `node.isMetadataProp`, stale-symbol audit, browser caveat, and verification. |
| Task-style PR body verified | yes | Verify the PR body with `gh pr view --json body`; it must preserve auto-release blocks when applicable, must not include a current-PR self-link, and must use the kitcn PR #270 emoji format: `🐛 Fixes ...`, `🟢 95-100% confidence`, `Phase / 🧪 Tests / 🌐 Browser` table, and bold emoji Outcome/Caveat/Design/Verified sections | `gh pr view 5029 --repo udecode/plate --json body --jq .body` verified auto-release block, issue line, confidence, phase table, Outcome/Caveat/Design/Verified sections, `node.isMetadataProp`, no `isPropEmpty`, and no current-PR self-link. |
| PR proof image hosting | no | If PR body needs browser proof, replace local image paths with hosted GitHub URLs or record N/A | N/A: PR body has no browser image proof. |
| Tracker sync-back | yes | Post concise issue/Linear sync after PR exists, or record N/A/blocker | Posted https://github.com/udecode/plate/issues/4951#issuecomment-4712148949. |
| Final handoff contract | yes | Fill the final handoff fields below with exact PR/issue/confidence/tests/browser/outcome/caveats/design/verification content or N/A reason | Final handoff fields filled below. |
| Final lint | yes | Run `pnpm lint:fix` or scoped equivalent | `pnpm lint:fix` passed, no fixes applied. |
| Output budget discipline | yes | Verify no unbounded high-volume command output was streamed, or record the accidental output and recovery | One broad `rg` hit generated docs JSON and produced noisy output; recovered with scoped source-owned stale-symbol search excluding generated/changelog blobs. |
| Goal plan complete | yes | Run `node .agents/skills/autogoal/scripts/check-complete.mjs docs/plans/2026-06-15-4951-block-placeholder-list-item.md` | `node .agents/skills/autogoal/scripts/check-complete.mjs docs/plans/2026-06-15-4951-block-placeholder-list-item.md` passed. |
| Public API / package boundary proof | yes | Source-audit public API, exports, and package boundary impact | Public API in `@platejs/core` and runtime behavior in `@platejs/utils` changed; no exports or file layout changed; source audit via `git diff`, focused tests, and package typecheck passed. |
| Release artifact classification | yes | Record whether the change is published package behavior/API/types/config/runtime, registry-only, or no published user-visible delta | Published public API/runtime delta for `@platejs/core` and published runtime behavior delta for `@platejs/utils`; patch changesets added. |
| Published package changeset | yes | If published package users see a delta, load `changeset`, add/update one `.changeset/*.md` per package, and prove no forbidden `minor` on `@platejs/slate`, `@platejs/core`, or `platejs` | `.changeset/core-node-metadata-prop.md` has `"@platejs/core": patch`; `.changeset/utils-block-placeholder-list.md` has `"@platejs/utils": patch`; no forbidden core package minor. |
| Registry changelog | no | If the change is registry-only under `apps/www/src/registry/**`, use the `registry-changelog` pack and do not add a package changeset | N/A: not registry-only. |
| No release artifact | no | If no artifact is needed, record the exact reason: internal-only, docs-only, agent-only, test-only, or no user-visible delta from `main` | N/A: changeset is required and present. |
| Package typecheck/build/test | yes | Run owning package checks or record N/A with reason | `pnpm --filter @platejs/core build && bun test packages/core/src/lib/plugins/slate-extension/SlateExtensionPlugin.spec.tsx packages/utils/src/react/plugins/BlockPlaceholderPlugin.spec.tsx`, `pnpm turbo typecheck --filter=./packages/core --filter=./packages/utils`, and `pnpm check` passed. |
| Barrel/export generation | no | Run `pnpm brl` when exports or exported file layout changed, otherwise N/A | N/A: no exports or exported file layout changed. |

Phase / pass table:
| Phase | Status | Evidence | Next |
|-------|--------|----------|------|
| Intake and source read | complete | issue/source/skills read; plan created and red repro failed as expected | implementation |
| Implementation | complete | `node.isMetadataProp` and `editor.api.isElementStateEmpty` added; `NodeIdPlugin` claims id metadata; `BlockPlaceholderPlugin` default delegates to the editor API; regression tests/docs/changesets added. | verification |
| Verification | complete | Focused core+utils spec, stale-symbol source audit, package typecheck, docs source build, lint-fix, `pnpm check`, and final autoreview passed. | PR / tracker sync |
| PR / tracker sync | complete | PR #5029 opened, issue #4951 sync comment posted, and PR body updated/read back. | closeout |
| Closeout | complete | Plan ready for mechanical completion check, amend, push. | final response |

Findings:
- #4951 is valid. Focused spec reproduced `_target` staying `null` for a single empty paragraph with `indent: 1` and `listStyleType: 'disc'`.

Decisions and tradeoffs:
- Do not hardcode `listStyleType` / `indent` as the fix. Treat only `type` and plugin-claimed inert metadata as empty; every unclaimed prop means the element carries state.
- Put prop inertness on the node-owning plugin with `node.isMetadataProp`. `BlockPlaceholderPlugin` consumes the editor API through its default `isEmptyBlockPristine` policy instead of owning list or node-id semantics.
- Renamed `node.isPropEmpty` to `node.isMetadataProp` with no alias because the old name only existed in this unmerged PR and lied about the contract.

Implementation notes:
- Added `node.isMetadataProp` to plugin node config.
- `NodeIdPlugin` marks its configured `idKey` as inert metadata.
- `editor.api.isElementStateEmpty(element)` uses `NodeApi.extractProps`, ignores `type`, asks `node.isMetadataProp` plugins about the remaining props, and treats any unclaimed prop as non-empty state.

Review fixes:
- Removed the bad `editor.api.slateExtension.isElementStateEmpty` shape after user feedback. The durable API is `node.isMetadataProp` for plugin ownership and `editor.api.isElementStateEmpty` for callers.

Error attempts:
| Error / failed attempt | Count | Next different move | Resolution |
|------------------------|-------|---------------------|------------|
| Ran focused tests before workspace dependency build finished, causing missing `@platejs/slate` resolution | 1 | Rerun after package typecheck built workspace deps | Sequential rerun passed: 30 tests, 0 failures. |
| Autoreview treated the removed `editor.api.slateExtension.isElementStateEmpty` shape as published API | 1 | Check `origin/main` for the API before accepting the finding | Rejected as false-positive: the alias only existed inside this unmerged PR and is absent from `origin/main`. |
| Broad stale-symbol search streamed generated docs JSON | 1 | Scope source audit to source-owned files and exclude generated/changelog blobs | Scoped `rg -n "isPropEmpty"` audit returned no source-owned matches. |

Verification evidence:
- Red repro: `bun test packages/utils/src/react/plugins/BlockPlaceholderPlugin.spec.tsx -t "keeps the target on a single empty list item"` failed before implementation with expected `_target` object vs received `null`.
- Stale symbol audit: `rg -n "isPropEmpty" . --glob '!docs/plans/**' --glob '!apps/www/public/rd/**' --glob '!apps/www/src/generated/**' --glob '!**/CHANGELOG.md' --glob '!node_modules/**' --glob '!**/.next/**' --glob '!**/.turbo/**'` found no source-owned matches.
- Focused proof: `pnpm --filter @platejs/core build && bun test packages/core/src/lib/plugins/slate-extension/SlateExtensionPlugin.spec.tsx packages/utils/src/react/plugins/BlockPlaceholderPlugin.spec.tsx` passed: 30 tests, 0 failures.
- Typecheck: `pnpm turbo typecheck --filter=./packages/core --filter=./packages/utils` passed.
- Docs/lint: `pnpm --filter www build:source && pnpm lint:fix` passed.
- Full gate: `pnpm check` passed with exit 0; existing sidebar hook warning and multiple-core test message were non-fatal.
- Autoreview: `.agents/skills/autoreview/scripts/autoreview --mode local` exited 0 with no accepted/actionable findings.

Final handoff contract:
- PR line: https://github.com/udecode/plate/pull/5029
- Issue / tracker line: Fixes #4951; sync comment https://github.com/udecode/plate/issues/4951#issuecomment-4712148949
- Confidence line: 98%
- Flow table:
  - Reproduced: tests failed before fix; browser N/A
  - Verified: tests/checks passed; browser N/A
- Browser check: N/A: source-level plugin state test observes the bug and fix directly.
- Outcome: core exposes `node.isMetadataProp` and `editor.api.isElementStateEmpty`; `NodeIdPlugin` claims id metadata; `BlockPlaceholderPlugin` shows placeholders for empty list-state blocks while keeping pristine and metadata-only empty blocks suppressed.
- Caveat: CI is running on PR #5029; local `pnpm check` passed before PR.
- Design:
  - Chosen boundary: node-owning plugins declare inert props with `node.isMetadataProp`; `@platejs/core` owns the generic element state-empty check; `@platejs/utils` `BlockPlaceholderPlugin` owns when that predicate suppresses placeholders.
  - Why not quick patch: issue's list-only pseudocode was too narrow and would miss other structural state.
  - Why not broader change: no list-model rewrite needed; the reusable core predicate plus existing plugin option cleanly distinguishes pristine empty editor from visible structural empty blocks.
- Verified: stale-symbol source audit, focused core+utils spec, core+utils typecheck, docs source build, lint-fix, clean autoreview, `pnpm check`.
- PR body verified: `gh pr view 5029 --json body` verified required task-style body, `node.isMetadataProp`, and auto-release block.

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
- PR: https://github.com/udecode/plate/pull/5029
- Issue / tracker: https://github.com/udecode/plate/issues/4951#issuecomment-4712148949
- Browser proof: N/A: no browser-only behavior; focused React plugin spec proves `_target` and injected placeholder props.
- Caveats: GitHub CI still running; local `pnpm check` passed.

Timeline:
- 2026-06-15T20:15:34.022Z Task goal plan created.

Reboot status:
| Question | Answer |
|----------|--------|
| Where am I? | Closeout |
| Where am I going? | Final response after plan check and amend push |
| What is the goal? | Fix #4951 block placeholder list-item bug; done when repro fails before fix, passes after fix, checks/review pass, and PR/sync-back complete. |
| What have I learned? | #4951 is valid; the best boundary is the plugin pristine-state gate, not list-specific caller logic. |
| What have I done? | Reproduced, fixed, documented, verified, reviewed, opened PR #5029, and synced issue #4951. |

Open risks:
- GitHub CI is still running on PR #5029; local `pnpm check` passed before PR creation.
