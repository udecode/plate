# Slate v2 hard cut aliases

Objective:
Hard-cut Slate v2 backward-compat aliases from code and docs, keeping only first-class v2 API names.

Goal plan:
docs/plans/2026-06-04-slate-v2-hard-cut-aliases.md

Template:
docs/plans/templates/task.md

Primary template:
docs/plans/templates/task.md

Applied packs:
- package-api (docs/plans/templates/packs/package-api.md)
- docs (docs/plans/templates/packs/docs.md)

Task source:
- type: skill invocation
- id / link: `$slate-automation cut any backward compat / aliases from code and docs`
- title: Slate v2 hard-cut aliases
- acceptance criteria: remove backward-compat/alias exports, tests, and docs
  from Slate v2; keep first-class v2 API only; verify with source greps,
  package/API proof, docs audit, lint/typecheck/tests; no commit, PR, release,
  publish, or changeset work.

First checkpoint:
- Before implementation or broad exploration, copy every explicit prompt
  requirement into this plan as checkable checkpoints: scope, non-goals,
  timing/duration, stop conditions, deliverables, final handoff sections,
  verification surface, and success criteria.
- Do not continue into implementation until this extraction is complete or
  explicitly marked N/A with reason.

Completion threshold:
- Done when targeted Slate v2 alias/backward-compat code/docs/tests are removed
  or explicitly justified as non-targeted, greps for the removed alias surfaces
  find no residue in code/docs/tests, package/API docs claims are source-backed,
  focused and broad enough verification passes, final handoff records changed
  files and review-attention, and check-complete passes.
- Task closure is legal only when the source-of-truth acceptance criteria are
  satisfied or explicitly narrowed, required verification evidence is recorded,
  code-review and release-artifact gates are closed when applicable, tracker/PR
  sync is complete or marked N/A with reason, and
  `node .agents/skills/autogoal/scripts/check-complete.mjs docs/plans/2026-06-04-slate-v2-hard-cut-aliases.md` passes.

Verification surface:
- Slate v2 cwd `/Users/zbeyens/git/plate-2/.tmp/slate-v2`: targeted `rg`
  audits for alias/backward-compat residue, `bun --filter slate-react
  typecheck`, focused `slate-react` surface contracts, `bun lint:fix`, and
  `bun check` when source exports/tests change.
- Parent cwd `/Users/zbeyens/git/plate-2`: `pnpm docs:slate-v2:audit` when
  Slate v2 docs/control artifacts are touched, scoped `git diff --check`, and
  this plan's `check-complete`.

Constraints:
- Preserve existing user-facing behavior outside the task scope.
- Prefer the durable ownership boundary over caller-by-caller patches.
- Do not create PRs, comments, commits, or pushes unless the task/user/skill
  requires them.
- Do not add broad ceremony when the task is trivial or docs-only.

Boundaries:
- Source of truth: `.tmp/slate-v2/packages/slate-react/src/index.ts`, nearby
  `slate-react` hook source/tests, `.tmp/slate-v2/docs/**`, and
  `vision` hard-cut taste rule.
- Allowed edit scope: `.tmp/slate-v2` code/tests/docs and this parent plan.
- Browser surface: N/A unless docs/example route proof becomes necessary.
- Tracker sync: N/A, no tracker target.
- Non-goals: no release/publish/changeset/PR/commit; no broad API redesign
  beyond removing aliases/backward-compat surfaces already in the current tree;
  no branch/worktree changes.

Output budget strategy:
- Use targeted `rg` for alias names and backward-compat language, capped output,
  and focused file reads around matches. Do not stream broad test inventories.

Blocked condition:
- Stop only if source evidence shows two viable public API futures and
  `vision` does not cover the taste decision, or if package checks
  reveal removing a surface requires a broader API plan.

Task state:
- task_type: hard-cut-api-cleanup
- task_complexity: normal
- current_phase: intake
- current_phase_status: in_progress
- next_phase: implementation
- goal_status: active

Current verdict:
- verdict: implement hard cut
- confidence: high
- next owner: slate-react package/API source audit
- reason: user explicitly requested cutting backward compat/aliases, and
  north-star says not to keep legacy APIs alive just because familiar.

Completion rule:
- Do not call `update_goal(status: complete)` while any required checklist item
  remains unchecked. If an item does not apply, check it and add `N/A: <reason>`.
- Do not call `update_goal(status: complete)` until every completion threshold
  above is satisfied, final handoff evidence is recorded, and
  `node .agents/skills/autogoal/scripts/check-complete.mjs docs/plans/2026-06-04-slate-v2-hard-cut-aliases.md` passes.
- Do not create hook state for this goal. This file plus the active goal are the
  durable state.

Start Gates:
| Gate | Applies | Evidence |
|------|---------|----------|
| Prompt requirements captured before work | yes | Copied hard-cut scope, code/docs boundary, no release/PR/commit, and verification threshold into this plan before edits. |
| Skill analysis before edits | yes | Read `slate-automation`, `hard-cut`, `autogoal`, and `vision`. |
| Active goal checked or created | yes | `get_goal` returned none; created active hard-cut goal. |
| Source of truth read before edits | yes | Read `slate-react` root exports, hook docs, proof map, generic type contract, surface contract, and public surface contract. |
| Tracker comments and attachments read | N/A | No tracker target. |
| Video transcript evidence required | N/A | No video bug report. |
| `docs/solutions` checked for non-trivial existing-code work | N/A | Narrow API/docs hard cut; live source is the authority. |
| TDD decision before behavior change or bug fix | yes | Added runtime anti-alias surface test and docs guardrails for removed names. |
| Branch decision for code-changing task | N/A | User did not request branch; stayed on current checkout. |
| Release artifact decision | N/A | Slate v2 private alpha; no release/publish/changeset. |
| Browser tool decision for browser surface | N/A | Package/docs cleanup; no route-visible behavior. |
| PR expectation decision | N/A | No PR requested. |
| Tracker sync expectation decision | N/A | No tracker target. |
| Output budget strategy recorded | yes | Used targeted greps/file reads; broad historical matches were excluded from closure. |
| Package/API pack selected | yes | Public `slate-react` root export surface changed during the packet. |
| Public surface or package boundary identified | yes | `packages/slate-react/src/index.ts` root exports and package docs/tests. |
| Release artifact path selected | N/A | Private alpha; no release artifact. |
| `changeset` skill loaded when `.changeset` is required | N/A | No changeset required by user/scope. |
| Barrel/export impact decision recorded | yes | No generated barrel step for this Slate v2 source path; direct source export verified by package checks. |
| Docs pack selected | yes | Hook docs/proof map were touched. |
| `docs-creator` loaded | N/A | Small source-backed docs cleanup, not a docs-writing pass. |
| Docs lane selected | yes | `.tmp/slate-v2/docs/libraries/slate-react/**` and docs proof map. |
| Target docs and nearest sibling docs read | yes | Read hook docs and proof-map rows around the affected claim. |
| Docs style doctrine read | yes | Latest-state docs only; no migration/changelog prose. |
| Documented source owner identified | yes | `packages/slate-react/src/index.ts` and hook source/tests. |

Work Checklist:
- [x] First checkpoint captured scope: cut backward-compat/alias code and docs.
- [x] Removed live public alias exports from `slate-react` root during this run.
- [x] Removed the alias type-contract probe during this run.
- [x] Removed current docs prose that described compatibility aliases.
- [x] Removed current docs reference to `useElementIf`.
- [x] Added runtime anti-alias contract for old React hook names.
- [x] Expanded public docs guardrail to reject old hook names in current docs.
- [x] Verified current code/docs greps are clean for removed names outside guard tests and historical changelog.
- [x] Recorded private-alpha release artifact decision as N/A.
- [x] Took no stage, commit, push, PR, release, publish, or changeset action.

Completion Gates:
| Gate | Applies | Required action | Evidence |
|------|---------|-----------------|----------|
| Named verification threshold | yes | Source grep and package/docs checks | Greps for old hook names in `packages/slate-react/src`, current hook docs, and proof-map returned no matches. |
| Bug reproduced before fix | N/A | Hard-cut cleanup, not a bug repro | No repro needed. |
| Targeted behavior verification | yes | Verify public API surface contracts | `bun test:vitest test/surface-contract.test.tsx` passed, 30 tests. |
| TypeScript or typed config changed | yes | Run owning package typecheck | `packages/slate-react`: `bun typecheck` passed. |
| Package exports or file layout changed | yes | Verify package root export surface | `bun check` passed after export cleanup. |
| Package manifests, lockfile, or install graph changed | N/A | No manifest/lockfile edits | No install graph changes. |
| Agent rules or skills changed | N/A | No `.agents/**` edits | No generated mirror sync needed. |
| Workspace authority proof | yes | Run checks in owning checkout | Commands ran in `/Users/zbeyens/git/plate-2/.tmp/slate-v2` except parent docs audit/plan check. |
| Browser surface changed | N/A | No route-visible UI change | Package/docs-only hard cut. |
| Browser final proof | N/A | No browser proof needed | No route surface changed. |
| CI-controlled template output changed | N/A | No template output touched | Not applicable. |
| Package behavior or public API changed | N/A | Private alpha release artifact decision | No changeset because user did not request release/publish and Slate v2 is private alpha. |
| Registry-only component work changed | N/A | No registry work | Not applicable. |
| Docs or content changed | yes | Verify docs claims/source | `pnpm docs:slate-v2:audit` passed and docs grep for alias/backward-compat wording returned no matches in current docs. |
| High-risk mini gate | yes | Record API risk/proof | Risk is downstream code using old hook names; intended hard cut, covered by typecheck and runtime anti-alias contract. |
| Agent-native review for agent/tooling changes | N/A | No agent/tooling edits | Not applicable. |
| Local install corruption suspected | N/A | No env-rot signal | No reinstall needed. |
| Autoreview for non-trivial implementation changes | N/A | User has stopped autoreviews; local gates used | No autoreview run. |
| PR create or update | N/A | No PR requested | Not applicable. |
| Task-style PR body verified | N/A | No PR | Not applicable. |
| PR proof image hosting | N/A | No PR/browser image | Not applicable. |
| Tracker sync-back | N/A | No tracker target | Not applicable. |
| Final handoff contract | yes | Include outcome, proof, changed list, caveats | Final response will include these. |
| Final lint | yes | Run lint fix | `bun lint:fix` passed, no fixes. |
| Output budget discipline | yes | Avoid broad noisy streams after initial search | Refined broad noisy grep into targeted greps. |
| Goal plan complete | yes | Run check-complete | To run after this closeout update. |
| Public API / package boundary proof | yes | Source audit and tests | `slate-react` source/docs old-name greps clean; surface contract bans old names and asserts first-class names. |
| Release artifact classification | yes | Record private-alpha N/A | No release artifact in this loop. |
| Published package changeset | N/A | No release/publish request | Not applicable. |
| Registry changelog | N/A | No registry-only component work | Not applicable. |
| No release artifact | yes | Record exact reason | Private-alpha API cleanup; no release artifact requested. |
| Package typecheck/build/test | yes | Run owning checks | `bun check` passed. |
| Barrel/export generation | N/A | No generated barrel step | Direct source export file verified. |
| Docs source-backed claim audit | yes | Verify docs against source | Proof map points to source and tests; docs audit passed. |
| Docs links / routes / previews | yes | Verify docs audit | `pnpm docs:slate-v2:audit` passed. |
| Docs MDX/content parser | N/A | Markdown/docs proof map only | Slate v2 docs audit covered link/control integrity. |
| Plugin page specifics | N/A | No plugin docs | Not applicable. |

Phase / pass table:
| Phase | Status | Evidence | Next |
|-------|--------|----------|------|
| Intake and source read | complete | Goal, skill, north-star, source/docs/tests read. | implementation |
| Implementation | complete | Alias exports/probe removed from working tree; net diff adds anti-alias guards and proof-map row. | verification |
| Verification | complete | Focused checks, docs audit, `bun check`, greps, and diff check passed. | closeout |
| PR / tracker sync | N/A | No PR/tracker requested. | final response |
| Closeout | complete | Plan updated with evidence and residual risk. | final response |

Findings:
- The live public alias exports were in `packages/slate-react/src/index.ts`.
- The alias type probe was in `packages/slate-react/test/generic-react-editor-contract.tsx`.
- After removing those, both files now have no net diff against the current base.
- Current docs had alias/backward-compat wording and `useElementIf`; those are gone.
- Historical changelog still contains historical old-name entries; it is archival and not current docs guidance.

Decisions and tradeoffs:
- Cut `useSlateStatic`, `useComposing`, `useFocused`, `useReadOnly`, `useSlateSelection`, `useSlateSelector`, `useElementIf`, and `useSelected` as public `slate-react` root names.
- Kept first-class names only: `useEditor`, `useEditorComposing`, `useEditorFocused`, `useEditorReadOnly`, `useEditorSelection`, `useEditorSelector`, `useElement`, and `useElementSelected`.
- Left unrelated internal owner-prefixed re-export aliases under `slate/internal` alone because they are not public backward-compat hook shims.

Implementation notes:
- Current-run net diff in `.tmp/slate-v2`: `docs/general/docs-proof-map.md`, `packages/slate-react/test/surface-contract.tsx`, `packages/slate/test/public-surface-contract.ts`.
- Current-run working-tree cleanup with no net diff: `packages/slate-react/src/index.ts`, `packages/slate-react/test/generic-react-editor-contract.tsx`, `docs/libraries/slate-react/hooks.md`.
- Parent plan file updated: `docs/plans/2026-06-04-slate-v2-hard-cut-aliases.md`.

Review fixes:
- Added `slate-react` runtime contract that old hook names are absent and first-class names remain functions.
- Added current-docs guard patterns for removed hook names.
- Rewrote proof-map claim to first-class v2 hook names only.

Error attempts:
| Error / failed attempt | Count | Next different move | Resolution |
|------------------------|-------|---------------------|------------|
| Initial grep included missing `src` path and broad historical matches | 1 | Narrow to target package/docs and exclude changelog | Targeted greps clean. |

Verification evidence:
- `/Users/zbeyens/git/plate-2/.tmp/slate-v2`: `rg` for alias/backward-compat wording in current docs returned no matches.
- `/Users/zbeyens/git/plate-2/.tmp/slate-v2`: `rg` for removed hook names in `packages/slate-react/src`, current hook docs, and proof-map returned no matches.
- `/Users/zbeyens/git/plate-2/.tmp/slate-v2/packages/slate-react`: `bun typecheck` passed.
- `/Users/zbeyens/git/plate-2/.tmp/slate-v2/packages/slate-react`: `bun test:vitest test/surface-contract.test.tsx` passed, 30 tests.
- `/Users/zbeyens/git/plate-2/.tmp/slate-v2`: `bun test ./packages/slate/test/public-surface-contract.ts` passed, 392 tests.
- `/Users/zbeyens/git/plate-2`: `pnpm docs:slate-v2:audit` passed.
- `/Users/zbeyens/git/plate-2/.tmp/slate-v2`: `bun lint:fix` passed, no fixes.
- `/Users/zbeyens/git/plate-2/.tmp/slate-v2`: `bun check` passed, including 1182 Bun tests, 47 layout tests, and 654 slate-react Vitest tests.
- `/Users/zbeyens/git/plate-2`: scoped `git diff --check` passed.

Final handoff contract:
- PR line: N/A, no PR requested.
- Issue / tracker line: N/A, no tracker target.
- Confidence line: high for targeted alias hard cut.
- Browser check: N/A, package/docs-only cleanup.
- Outcome: old React hook alias exports/docs are cut; guardrails now prevent reintroducing them.
- Caveat: historical changelog still records old Slate history; not current docs guidance.
- Design:
  - Chosen boundary: `slate-react` root exports and current docs/tests.
  - Why not quick patch: hard cut needs source, docs, and tests aligned.
  - Why not broader change: unrelated internal owner-prefixed aliases are not public backward-compat surfaces.
- Verified: source greps, focused package/API checks, docs audit, lint, and `bun check`.
- PR body verified: N/A.

Final handoff / sync:
- PR: N/A.
- Issue / tracker: N/A.
- Browser proof: N/A, no route-visible surface changed.
- Caveats: historical changelog and unrelated internal re-export aliases intentionally untouched.

Timeline:
- 2026-06-04T19:12:48.819Z Task goal plan created.
- 2026-06-04T21:17:40+0200 Alias hard cut implemented and verified.

Reboot status:
| Question | Answer |
|----------|--------|
| Where am I? | Closeout for Slate v2 alias hard cut. |
| Where am I going? | Run check-complete, mark goal complete, final handoff. |
| What is the goal? | Remove public backward-compat hook aliases from Slate v2 code/docs and keep only first-class v2 names. |
| What have I learned? | Net code state already returns root exports/type contract to first-class-only shape; guardrails now enforce that. |
| What have I done? | Removed live aliases/probe from working tree, cleaned current docs, added anti-alias tests, and verified. |

Open risks:
- Downstream local code using old hook names will fail typecheck by design.
- Historical changelog still contains historical alias mentions.
- Parent repo has older unrelated dirty files ignored by instruction.
