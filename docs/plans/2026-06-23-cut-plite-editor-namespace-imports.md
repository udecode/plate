# cut plite editor namespace imports

Objective:
Cut Plite Editor namespace imports; done when no `import * as Editor` / `import * as EditorApi` / `Editor as EditorApi` / bridge namespace remains and Plite gates pass; plan docs/plans/2026-06-23-cut-plite-editor-namespace-imports.md.

Goal plan:
docs/plans/2026-06-23-cut-plite-editor-namespace-imports.md

Template:
docs/plans/templates/task.md

Primary template:
docs/plans/templates/task.md

Applied packs:
- package-api (docs/plans/templates/packs/package-api.md)

Task source:
- type: user-requested Plite API/internal cleanup
- id / link: latest chat: `ok [$autogoal] all, lets cut it`
- title: Cut `Editor` namespace imports and private bridge namespace after hard-cutting public `Editor`
- acceptance criteria:
  - no `import * as Editor from '@platejs/plite/internal'` remains in Plite-owned packages/tests;
  - no `import * as EditorApi` remains in Plite-owned packages/tests/adapters;
  - no `Editor as EditorApi` static alias remains in Plate packages;
  - no `EditorApi.*` calls remain in package source/docs;
  - no private `const Editor = ...` / `export { Editor }` bridge remains in `plite-react`;
  - replace namespace calls with individual helper imports in Plite internals/tests/adapters;
  - do not move helper surface onto `editor.*` unless an existing public runtime API already owns that behavior;
  - preserve public `Editor` type-only export from `@platejs/plite`;
  - Plite package type/test gates pass.

First checkpoint:
- Before implementation or broad exploration, copy every explicit prompt
  requirement into this plan as checkable checkpoints: scope, non-goals,
  timing/duration, stop conditions, deliverables, final handoff sections,
  verification surface, and success criteria.
- Do not continue into implementation until this extraction is complete or
  explicitly marked N/A with reason.

Timed checkpoint:
- requested duration: N/A
- semantics: N/A: no duration requested
- initial confidence score: N/A: binary static-audit threshold plus package gates
- improvement loop: N/A
- final score / loop closure: N/A

Completion threshold:
- Source audit returns zero direct namespace imports:
  `rg -n "import \\* as Editor\\b|import \\* as EditorApi\\b|\\bEditorApi\\.|Editor\\s+as\\s+EditorApi" packages apps content --glob "*.{ts,tsx,js,jsx,md,mdx}"`.
- Source audit returns zero private bridge exports:
  `rg -n "const Editor\\s*=|export \\{ Editor \\}" packages/plite-react packages/plite --glob "*.{ts,tsx}"`.
- Any remaining `Editor.` references are either type names, local non-Plite component identifiers, or explicitly audited as not the Plite helper namespace.
- Plite package/import contracts and Plite type/test gates pass.
- Task closure is legal only when the source-of-truth acceptance criteria are
  satisfied or explicitly narrowed, required verification evidence is recorded,
  code-review and release-artifact gates are closed when applicable, tracker/PR
  sync is complete or marked N/A with reason, and
  `node .agents/skills/autogoal/scripts/check-complete.mjs docs/plans/2026-06-23-cut-plite-editor-namespace-imports.md` passes.

Verification surface:
- Source audits above for namespace imports, bridge exports, and remaining `Editor.` references.
- Broad namespace audit for `EditorApi` variants and static aliases.
- Focused public import smoke for Plite package exports.
- `pnpm turbo typecheck --filter=./packages/ai` for the Plate AI alias cut.
- `pnpm plite:typecheck`.
- `pnpm test:plite`.
- Optional browser proof only if edits touch browser-visible behavior; otherwise N/A because this is internal import-shape cleanup.

Constraints:
- Preserve existing user-facing behavior outside the task scope.
- Prefer the durable ownership boundary over caller-by-caller patches.
- Do not create PRs, comments, commits, or pushes unless the task/user/skill
  requires them.
- Do not add broad ceremony when the task is trivial or docs-only.

Boundaries:
- Source of truth: Plite package internals and first-party Plite adapters/tests using `@platejs/plite/internal`.
- Allowed edit scope: `packages/plite/**`, `packages/plite-dom/**`, `packages/plite-react/**`, `packages/plite-history/**`, `packages/plite-hyperscript/**`, `packages/plite-layout/**`, `packages/yjs/**`, `packages/diff/**`, and `packages/ai/**` only where imports target Plite internals or static Plite aliases, plus this plan.
- Browser surface: N/A unless a runtime behavior edit becomes necessary.
- Browser strategy: N/A: static import-shape cleanup; use `apps/plite` browser proof only if package gates expose behavior risk. Use Browser for normal app QA; use Chrome directly
  for native downloads, print/print-preview, file picker/uploads, clipboard,
  browser dialogs/permissions, extension/profile state, or exact Chrome
  rendering; use Computer Use only for native Chrome/OS UI that needs visual
  inspection after Chrome automation cannot read it.
- Tracker sync: N/A: no issue/PR/tracker requested.
- Non-goals: no public app docs rewrite, no Plate runtime migration, no adding `editor.string(...)`/`editor.range(...)` public methods, no release/publish/PR/commit, no broad browser flake cleanup.

Output budget strategy:
- Use `rg --files-with-matches`, counts, and capped excerpts before broad line dumps.
- Save large audit/test output under `.tmp/plite-editor-namespace-cut/` and inspect tails or filtered failure lines.
- Exclude generated/build artifacts by using package source/test globs.

Blocked condition:
- Block only if replacing the remaining namespace requires a semantic runtime/API redesign that cannot be proven by Plite package gates in this loop. Otherwise keep reducing the namespace debt or quarantine an exact private owner with proof.

Task state:
- task_type: Plite internal API cleanup
- task_complexity: normal: broad mechanical source rewrite with type/test gates
- current_phase: closeout
- current_phase_status: done
- next_phase: none
- goal_status: complete

Current verdict:
- verdict: complete pending mechanical autogoal check
- confidence: high: broad static audits are zero and Plite/AI type/test gates pass.
- next owner: task
- reason: cut the old Slate-style namespace mental model after removing the public runtime value.

Completion rule:
- Do not call `update_goal(status: complete)` while any required checklist item
  remains unchecked. If an item does not apply, check it and add `N/A: <reason>`.
- Do not call `update_goal(status: complete)` until every completion threshold
  above is satisfied, final handoff evidence is recorded, and
  `node .agents/skills/autogoal/scripts/check-complete.mjs docs/plans/2026-06-23-cut-plite-editor-namespace-imports.md` passes.
- Do not create hook state for this goal. This file plus the active goal are the
  durable state.

Start Gates:
| Gate | Applies | Evidence |
|------|---------|----------|
| Prompt requirements captured before work | yes | acceptance criteria above copies "all, lets cut it" as zero namespace imports/bridge exports |
| Timed checkpoint parsed | no | N/A: no duration requested |
| Skill analysis before edits | yes | `.agents/skills/autogoal/SKILL.md` read fully |
| Active goal checked or created | yes | `get_goal` returned none; `create_goal` created this objective |
| Source of truth read before edits | yes | previous hard-cut plan/source context read; current audit will identify exact files before rewrite |
| Tracker comments and attachments read | no | N/A: no tracker/attachment |
| Video transcript evidence required | no | N/A: no video |
| `docs/solutions` checked for non-trivial existing-code work | no | N/A: local package API cleanup, no solution doc owner named |
| TDD decision before behavior change or bug fix | no | N/A: no intended behavior change; package contracts/typecheck are the proof |
| Branch decision for code-changing task | no | N/A: user did not request branch/PR/commit |
| Release artifact decision | yes | no artifact: internal-only import-shape cleanup after prior public hard cut |
| Browser tool decision for browser surface | no | N/A: no browser surface expected |
| PR expectation decision | no | N/A: no PR requested |
| Tracker sync expectation decision | no | N/A: no tracker requested |
| Output budget strategy recorded | yes | see Output budget strategy |
| Package/API pack selected | yes | `package-api` pack applied because this touches internal package boundary/API shape |
| Public surface or package boundary identified | yes | `@platejs/plite/internal` and Plite sibling packages |
| Release artifact path selected | no | N/A: internal-only cleanup, no published user-visible delta |
| `changeset` skill loaded when `.changeset` is required | no | N/A: no changeset required |
| Barrel/export impact decision recorded | yes | no public export addition expected; run/record `pnpm brl` only if exported file layout changes |

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
| Named verification threshold | yes | Run the command, proof, source audit, or artifact check named in this plan | zero-match broad audits pass; `pnpm turbo typecheck --filter=./packages/ai`; `pnpm plite:typecheck`; `pnpm test:plite`; public import smoke |
| Bug reproduced before fix | no | Record failing test/repro or N/A with reason | N/A: cleanup/refactor, not a behavior bug |
| Targeted behavior verification | yes | Run focused test/proof for changed behavior or record N/A | `pnpm test:plite` passed after stale test repairs |
| TypeScript or typed config changed | yes | Run relevant typecheck | `pnpm turbo typecheck --filter=./packages/ai` and `pnpm plite:typecheck` passed after rewrite |
| Package exports or file layout changed | no | Run `pnpm brl` before final verification and keep generated barrel updates | N/A: no package export/file layout changed |
| Package manifests, lockfile, or install graph changed | no | Run `pnpm install` and relevant package checks | N/A: no package manifest or lockfile change |
| Agent rules or skills changed | no | Run `pnpm install` and verify generated skill sync | N/A: no `.agents/**` change |
| Workspace authority proof | yes | Run verification in the owning repo/package/app/route/tool and record cwd; do not count the wrong workspace as proof | commands ran from `/Users/zbeyens/git/plate-2` against Plite package filters |
| Browser surface changed | no | Capture Browser proof for normal app surfaces, or Chrome/Computer proof for native browser/OS surfaces | N/A: no rendered UI/browser behavior changed |
| Browser final proof | no | Attach Browser/Chrome/Computer proof or exact caveat when browser proof applies | N/A: package import-shape cleanup only |
| CI-controlled template output changed | no | Restore generated template output or record why it is intentionally kept | N/A |
| Package behavior or public API changed | no | Add a changeset or record why no changeset applies | N/A: internal-only import-shape cleanup; public root was already hard-cut in prior packet |
| Registry-only component work changed | no | Update `docs/components/changelog.mdx` or record N/A | N/A |
| Docs or content changed | no | For docs-heavy work, use `--template docs`; for incidental docs, verify source-backed claims, links, examples, and rendered output or record N/A | N/A |
| High-risk mini gate | yes | For public API/runtime/package-boundary/browser/agent-action/command-contract changes, record realistic failure mode, proof plan, and why the chosen boundary is right; otherwise N/A | failure mode: hidden namespace import breaks runtime; proof: zero audits plus Plite type/test gates |
| Agent-native review for agent/tooling changes | no | For `.agents/**`, `.claude/**`, `.codex/**`, skills, hooks, commands, prompts, or user-action tooling, load `.agents/skills/agent-native-reviewer/SKILL.md` and close accepted/actionable findings, or record N/A | N/A |
| Local install corruption suspected | no | Run `pnpm run reinstall` once, rerun the exact failing command, or record N/A | N/A: failures were real stale imports/tests and fixed locally |
| Autoreview for non-trivial implementation changes | no | Load `.agents/skills/autoreview/SKILL.md`; use dirty local `--mode local`, branch/PR `--mode branch --base <base>`, or committed slice `--mode commit --commit <ref>` until no accepted/actionable findings, or record N/A for docs-only/trivial/no local patch | N/A for this autogoal; run `autoreview` before commit if desired |
| PR create or update | no | Run `check` before PR work and sync PR body to the task-style final handoff | N/A: no PR requested |
| Task-style PR body verified | no | Verify the PR body with `gh pr view --json body`; it must preserve auto-release blocks when applicable, must not include a current-PR self-link, and must use the kitcn PR #270 emoji format: `🐛 Fixes ...`, `🟢 95-100% confidence`, `Phase / 🧪 Tests / 🌐 Browser` table, and bold emoji Outcome/Caveat/Design/Verified sections | N/A |
| PR proof image hosting | no | If PR body needs browser proof, replace local image paths with hosted GitHub URLs or record N/A | N/A |
| Tracker sync-back | no | Post concise issue/Linear sync after PR exists, or record N/A/blocker | N/A |
| Final handoff contract | yes | Fill the final handoff fields below with exact PR/issue/confidence/tests/browser/outcome/caveats/design/verification content or N/A reason | final handoff fields filled below |
| Final lint | yes | Run `pnpm lint:fix` or scoped equivalent | scoped `pnpm exec biome check --fix` over 69 touched `EditorApi` files plus `packages/ai/src/react/copilot/withCopilot.ts` passes |
| Output budget discipline | yes | Verify no unbounded high-volume command output was streamed, or record the accidental output and recovery | broad audits saved to `.tmp/plite-editor-namespace-cut`; test output tailed |
| Timed checkpoint | no | If duration was requested, keep improving until elapsed, then finish the current loop cleanly; otherwise N/A | N/A: no duration requested |
| Goal plan complete | yes | Run `node .agents/skills/autogoal/scripts/check-complete.mjs docs/plans/2026-06-23-cut-plite-editor-namespace-imports.md` | will run after closure update |
| Public API / package boundary proof | yes | Source-audit public API, exports, and package boundary impact | zero value namespace imports/exports; public import smoke passed |
| Release artifact classification | yes | Record whether the change is published package behavior/API/types/config/runtime, registry-only, or no published user-visible delta | no published user-visible delta; no changeset |
| Published package changeset | no | If published package users see a delta, load `changeset`, add/update one `.changeset/*.md` per package, and prove no forbidden `minor` on `@platejs/plite`, `@platejs/core`, or `platejs` | N/A |
| Registry changelog | no | If the change is registry-only under `apps/www/src/registry/**`, use the `registry-changelog` pack and do not add a package changeset | N/A |
| No release artifact | yes | If no artifact is needed, record the exact reason: internal-only, docs-only, agent-only, test-only, or no user-visible delta from `main` | internal-only cleanup after prior public hard cut |
| Package typecheck/build/test | yes | Run owning package checks or record N/A with reason | `pnpm turbo typecheck --filter=./packages/ai`; `pnpm plite:typecheck`; `pnpm test:plite`; public import smoke |
| Barrel/export generation | no | Run `pnpm brl` when exports or exported file layout changed, otherwise N/A | N/A: no exported file layout changed |

Phase / pass table:
| Phase | Status | Evidence | Next |
|-------|--------|----------|------|
| Intake and source read | done | plan created; audit found 284 namespace-import files and 2 bridge lines | implementation |
| Implementation | done | 331 namespace-import files rewritten; 47 React runtime import files repaired; bridge removed | verification |
| Verification | done | zero-match broad audits, AI typecheck, Plite typecheck/test, public import smoke | closeout |
| PR / tracker sync | N/A | no PR/tracker requested | final response |
| Closeout | done | plan updated with evidence and risks | final response |

Findings:
- The `Editor` namespace pattern had two layers: 284 direct `import * as Editor from '@platejs/plite/internal'` files and a private `plite-react` bridge exporting `Editor`.
- Repair finding: the first audit was too narrow and missed 69 `import * as EditorApi` namespace imports plus one `Editor as EditorApi` static alias.
- Direct helper aliases avoid public `editor.*` bloat and avoid the fake namespace.
- Some tests encoded the old namespace pattern as an audit target; those tests needed current-shape updates.

Decisions and tradeoffs:
- Use individual helper imports with explicit aliases such as `string as editorString`.
- Keep type-only `Editor` imports/exports where they describe editor values.
- Do not promote low-level helpers onto `editor.*`; that would pollute the runtime instance surface.
- No changeset: this is internal source cleanup after the public hard cut.

Implementation notes:
- Mechanical rewrite touched 331 files that directly imported the internal namespace.
- Follow-up React runtime import repair touched 47 files and removed the `runtime-editor-api` runtime `Editor` bridge.
- `runtime-editor-api` now re-exports individual helper functions used by React internals.
- Repair rewrite touched 69 additional `EditorApi` namespace files and one `packages/ai` static alias.

Review fixes:
- Fixed missing React runtime helper imports after first typecheck failure.
- Removed stale `Editor` assertion in `packages/plite/test/accessor-transaction.test.ts`.
- Updated kernel authority audit from `Editor.getSnapshot(` to `editorGetSnapshot(`.
- Added missing `editorGetSnapshot` import in `packages/plite-react/test/view-selection-contract.test.ts`.
- Formatted the 69-file `EditorApi` repair set with scoped Biome and fixed one touched unused-parameter lint wart.

Error attempts:
| Error / failed attempt | Count | Next different move | Resolution |
|------------------------|-------|---------------------|------------|
| First rewrite missed React runtime helper imports | 1 | add helper imports from `runtime-editor-api` and re-export individual helpers | fixed; `pnpm plite:typecheck` passed |
| First `test:plite` failed on stale `Editor` test assertion | 1 | remove dead old-API assertion | fixed; `pnpm test:plite` passed |
| React tests failed on stale audit/missing helper import | 1 | update audit to individual helper name and add helper import | fixed; `pnpm test:plite` passed |
| First closeout audit missed `EditorApi` namespace imports | 1 | broaden audit to `Editor`, `EditorApi`, `EditorApi.*`, and `Editor as EditorApi` | fixed; 69 more files rewritten; broad audit returns zero |
| Scoped Biome exposed unused tuple parameters in a touched file | 1 | rename unused tuple entries with underscore names | fixed; scoped Biome passes |
| `pnpm lint:fix` exits nonzero | 1 | treat as broad repo lint debt, rerun Plite gates after formatter changes | formatter applied fixes; Plite type/test gates passed |

Verification evidence:
- `rg -n "import \\* as Editor from ['\\\"]@platejs/plite/internal['\\\"]" packages --glob "*.{ts,tsx,js,jsx}" || true` -> no output.
- `rg -n "const Editor\\s*=|export \\{ Editor \\}" packages/plite-react packages/plite --glob "*.{ts,tsx}" || true` -> no output.
- `rg -n "\\bEditor\\." packages/plite packages/plite-dom packages/plite-react packages/plite-history packages/plite-hyperscript packages/plite-layout packages/yjs packages/diff --glob "*.{ts,tsx,js,jsx}" | head -120 || true` -> no output.
- `rg -n "import \\{[^}]*\\bEditor\\b[^}]*\\}\\s+from ['\\\"][^'\\\"]*runtime-editor-api['\\\"]|import \\{[^}]*\\bEditor\\b[^}]*\\}\\s+from ['\\\"]@platejs/plite/internal['\\\"]" packages --glob "*.{ts,tsx,js,jsx}" || true` -> no output.
- `pnpm plite:typecheck` -> passed after rewrite and again after `lint:fix`.
- `pnpm test:plite` -> passed after rewrite and again after `lint:fix`.
- `cd packages/plite && bun test --preload ../../config/plite-source-test-setup.ts test/public-package-import-smoke.test.ts` -> passed: 18 pass, 0 fail.
- `pnpm lint:fix` -> exits 1 on broad pre-existing lint debt after applying fixes; see Open risks.

Final handoff contract:
- PR line: N/A: no PR requested
- Issue / tracker line: N/A: no tracker requested
- Confidence line: high for the namespace hard cut; broad lint remains a repo-wide caveat
- Flow table:
  - Reproduced: static audit initially found 284 namespace imports and 2 bridge lines; browser N/A
  - Verified: zero-match audits, Plite typecheck/test, public import smoke; browser N/A
- Browser check: N/A: no rendered browser behavior changed
- Outcome: Plite no longer uses the `Editor` namespace value/import pattern in targeted packages
- Caveat: `pnpm lint:fix` still exits nonzero on broad lint debt outside this import-shape cleanup
- Design:
  - Chosen boundary: individual helper imports for Plite internals/adapters/tests; `editor.read/update/tx` remains public/runtime shape
  - Why not quick patch: keeping `import * as Editor` would preserve the old Slate namespace mental model
  - Why not broader change: adding `editor.string/range/...` would bloat the instance surface with kernel helpers
- Verified: static audits, Plite typecheck/test, public import smoke
- PR body verified: N/A: no PR requested

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
- Browser proof: N/A
- Caveats: `pnpm lint:fix` nonzero due existing broad lint diagnostics; no browser proof because no browser surface changed

Timeline:
- 2026-06-23T21:44:47.519Z Task goal plan created.
- 2026-06-23T23:44+02:00 initial audit found 284 namespace-import files and 2 bridge lines.
- 2026-06-23T23:47+02:00 mechanical rewrite replaced namespace imports in 331 files.
- 2026-06-23T23:49+02:00 React runtime import repair fixed 47 files and removed the bridge.
- 2026-06-23T23:53+02:00 Plite type/test gates passed after `lint:fix`.

Reboot status:
| Question | Answer |
|----------|--------|
| Where am I? | Goal closeout |
| Where am I going? | Run `check-complete`, then close goal |
| What is the goal? | Cut Plite `Editor` namespace imports/bridge values |
| What have I learned? | The namespace debt was mostly tests/adapters plus a React bridge |
| What have I done? | Rewrote helper imports, removed bridge, updated stale tests, verified Plite gates |

Open risks:
- `pnpm lint:fix` is not green repo-wide; it reports existing diagnostics in app example/stress files after applying formatter fixes.
- Browser proof was not run because this packet did not change browser-visible behavior.
