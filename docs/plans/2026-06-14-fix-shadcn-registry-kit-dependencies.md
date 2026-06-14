# Fix shadcn registry kit dependencies

Objective:
Fix GitHub issue #4971 by making Plate registry editor kit and editor block files install into the configured shadcn components alias so relative plugin imports resolve.

Goal plan:
docs/plans/2026-06-14-fix-shadcn-registry-kit-dependencies.md

Task source:
- type: GitHub issue
- id / link: https://github.com/udecode/plate/issues/4971
- title: [Bug]: relative imports fail due to CLI install
- acceptance criteria: shadcn CLI installs `editor-base-kit`, `editor-kit`, their `./plugins/*` dependencies, and editor block component files into the same configured components editor directory.

Completion threshold:
- Registry source metadata maps every `components/editor/*` and `blocks/*/components/editor/*` file to `@components/editor/*`.
- `editor-base-kit` relative `./plugins/*` imports and editor block imports resolve after `shadcn@4.7.0 add`, including custom `aliases.components`.
- Registry changelog records the registry-only user-visible fix, and source-only changelog rows do not claim unrelated same-day package releases.
- Focused tests, registry source check, `www` typecheck, lint, shadcn smoke proof, and autoreview pass.

Verification surface:
- `bun test apps/www/src/registry/registry.test.ts 'apps/www/src/app/registry/changelog/[event]/route.test.ts' apps/www/src/app/registry/changelog/components.json/route.test.ts apps/www/src/app/registry/changelog/index.json/route.test.ts`
- `node --test tooling/scripts/generate-ui-changelog-entries.test.mjs`
- `pnpm --filter www exec tsx --tsconfig ./scripts/tsconfig.scripts.json scripts/check-registry-source.mts`
- `pnpm --filter www typecheck`
- `pnpm lint:fix`
- `pnpm dlx shadcn@4.7.0 add <local registry item> --cwd <tmpdir> --yes --overwrite --silent` smoke tests for custom `aliases.components`.
- `.agents/skills/autoreview/scripts/autoreview --mode local ...`

Constraints:
- Do not edit generated registry build output or run `build:registry`.
- Registry-only user-visible work uses `tooling/data/plate-ui-changelog.mdx` plus generated `/registry/changelog/*` JSON, not a package changeset.
- Do not create a PR, commit, push, or issue comment without an explicit user request.
- Preserve explicit registry targets such as block page targets.

Boundaries:
- Source of truth: GitHub issue #4971 title/body/comments fetched with `gh issue view ... --comments --json`.
- Allowed edit scope: `apps/www` registry metadata/checks/changelog routes, changelog generator tests, and this goal plan.
- Browser surface: applies because `apps/www/**` changed, but Browser/browser-use was not exposed by `tool_search`; route tests and CLI smoke cover the affected JSON/install behavior.
- Tracker sync: N/A because repo policy requires explicit PR/comment request, and none was given.
- Non-goals: package runtime changes, registry build output, unrelated docs plan file, PR creation.

Output budget strategy:
- Used focused `sed` and `rg` reads, targeted tests, capped command output, and short smoke-test file lists instead of broad build or full test output.

Blocked condition:
- Only Browser proof is blocked: `tool_search` exposed thread and automation tools, not Browser/browser-use. Code and CLI verification continued without browser proof.

Task state:
- task_type: bug fix
- task_complexity: medium
- current_phase: closeout
- current_phase_status: complete
- goal_status: ready-to-close

Current verdict:
- verdict: fixed
- confidence: high
- next owner: user
- reason: focused tests, typecheck, lint, shadcn CLI smoke tests, and final autoreview are clean.

Start Gates:
| Gate | Applies | Evidence |
|------|---------|----------|
| Skill analysis before edits | yes | Loaded `task`, `autogoal`, `shadcn`, `plate-ui`, `changeset`, and `autoreview` guidance before closeout. |
| Active goal checked or created | yes | Active goal created for issue #4971 with this plan path. |
| Source of truth read before edits | yes | `gh issue view 4971 --repo udecode/plate --comments --json ...` read title/body/comments. |
| Tracker comments and attachments read | yes | GitHub issue comments included in source fetch; no attachments needed. |
| Video transcript evidence required | no | Issue has no video or screen recording. |
| Existing-code patterns read | yes | Read registry item creation, registry checks, changelog generator, and editor block files. |
| TDD decision | yes | Added focused registry/changelog tests around current behavior instead of dead-path removal assertions. |
| Branch decision | no | User did not ask for branch, commit, push, or PR. |
| Release artifact decision | yes | Registry changelog required; package changeset not applicable. |
| Browser tool decision | yes | Browser proof blocked because Browser/browser-use tools were unavailable through `tool_search`. |
| PR expectation decision | yes | N/A: no explicit PR request and repo policy forbids PR work without it. |
| Tracker sync expectation decision | yes | N/A: no explicit tracker comment request and no PR exists. |
| Package/API pack selected | yes | Registry-only package/API surface selected. |
| Barrel/export impact decision | yes | N/A: no package exports or barrel-owned files changed. |

Work Checklist:
- [x] Objective, completion threshold, verification surface, constraints, boundaries, and blocked condition are concrete.
- [x] Task source classified with issue link, title, acceptance criteria, likely files, browser surface, and root-cause layer.
- [x] Video evidence marked N/A because issue has no video.
- [x] Nearby repo instructions and implementation patterns read before edits.
- [x] Implementation fixes the registry metadata ownership boundary instead of patching individual kit imports.
- [x] Release artifact requirement recorded as registry changelog, not package changeset.
- [x] Final handoff shape decided: no PR/tracker sync; concise final with tests and browser caveat.
- [x] Branch handling recorded as N/A because no branch/PR request.
- [x] Local-env-rot retry policy recorded as N/A because failures matched code/test expectations, not install corruption.
- [x] Workspace authority recorded: commands ran in `/Users/zbeyens/git/plate`.
- [x] High-risk note recorded for public registry install behavior.
- [x] Autoreview selected and rerun until clean.
- [x] Agent-native review marked N/A because no `.agents/**`, skills, hooks, prompts, or agent-action tooling changed.
- [x] Output budget discipline recorded and followed.
- [x] Public API/package boundary impact recorded as registry metadata surface only.
- [x] Release artifact matrix applied: registry changelog updated and generated JSON refreshed.
- [x] Changeset work marked N/A because no package versioned API/runtime delta.
- [x] Registry-only work updated `tooling/data/plate-ui-changelog.mdx` and generated changelog JSON.
- [x] No-artifact decision marked N/A because registry changelog artifact applies.
- [x] Compatibility decision explicit: preserve shadcn configured `aliases.components` via `@components` targets.
- [x] Package-owned proof recorded with `www` typecheck and registry source check.
- [x] Barrel/export generation marked N/A because exports and exported file layout did not change.

Completion Gates:
| Gate | Applies | Required action | Evidence |
|------|---------|-----------------|----------|
| Named verification threshold | yes | Run all named checks | All commands in Verification evidence passed. |
| Bug reproduced before fix | yes | Record issue-level repro and CLI smoke | Issue repro read; smoke proved raw targets miss custom alias while `@components` targets install correctly. |
| Targeted behavior verification | yes | Test registry metadata and shadcn install paths | Registry tests plus `shadcn@4.7.0` custom-alias smokes passed. |
| TypeScript or typed config changed | yes | Run `www` typecheck | `pnpm --filter www typecheck` passed. |
| Package exports or file layout changed | no | Run `pnpm brl` only if exports changed | N/A: registry metadata targets changed, not package exports. |
| Package manifests, lockfile, or install graph changed | no | Run install only if graph changed | N/A: no manifests or lockfiles changed. |
| Agent rules or skills changed | no | Run skill sync only for agent rule edits | N/A. |
| Workspace authority proof | yes | Run checks in owning repo/app | Commands ran in `/Users/zbeyens/git/plate`; `www` owns registry metadata. |
| Browser surface changed | yes | Capture Browser proof or caveat | Blocked: Browser/browser-use tools unavailable through `tool_search`; route tests cover JSON surface. |
| Browser final proof | yes | Attach screenshot or caveat | Caveat recorded: no Browser tool exposed. |
| CI-controlled template output changed | no | Restore template output if touched | N/A. |
| Package behavior or public API changed | no | Add changeset if package API/runtime changed | N/A: registry metadata/changelog only. |
| Registry-only component work changed | yes | Update registry changelog and generated JSON | `node tooling/scripts/generate-ui-changelog-entries.mjs --write` ran; generated event is unresolved source-only. |
| Docs or content changed | yes | Verify incidental docs/changelog claims | Changelog route tests and generator tests passed. |
| High-risk mini gate | yes | Record failure mode and proof | Failure mode: shadcn flattens targetless editor files; proof: custom-alias CLI smokes and registry tests. |
| Agent-native review | no | Load reviewer only for agent tooling | N/A. |
| Local install corruption suspected | no | Run reinstall only for env-rot signs | N/A. |
| Autoreview | yes | Rerun until no accepted/actionable findings | Final autoreview clean: no accepted/actionable findings. |
| PR create or update | no | PR requires explicit request | N/A. |
| Task-style PR body verified | no | Verify only when PR exists | N/A. |
| PR proof image hosting | no | Host images only for PR body | N/A. |
| Tracker sync-back | no | Comment only when requested or PR exists | N/A. |
| Final handoff contract | yes | Fill exact outcome/caveats/tests | Final response will list fix, proof, Browser caveat, and no PR. |
| Final lint | yes | Run `pnpm lint:fix` | Passed with no fixes after final changes. |
| Output budget discipline | yes | Confirm scoped output | Followed with capped output; one noisy `rg` recovered with targeted searches. |
| Goal plan complete | yes | Run autogoal completion checker | To run after this update. |
| Public API / package boundary proof | yes | Source-audit registry public surface | `check-registry-source.mts` and tests assert target contract. |
| Release artifact classification | yes | Record artifact class | Registry-only user-visible install metadata. |
| Published package changeset | no | Add changeset only for package delta | N/A. |
| Registry changelog | yes | Update source and generated JSON | Done. |
| No release artifact | no | Record reason if no artifact | N/A. |
| Package typecheck/build/test | yes | Run owning package checks | `pnpm --filter www typecheck` passed. |
| Barrel/export generation | no | Run `pnpm brl` if exports changed | N/A. |

Phase / pass table:
| Phase | Status | Evidence | Next |
|-------|--------|----------|------|
| Intake and source read | complete | GitHub issue #4971 read; repo/skill instructions loaded. | done |
| Implementation | complete | Registry target normalization, source checks, changelog generator, and generated changelog updated. | done |
| Verification | complete | Tests, typecheck, lint, shadcn smokes, and autoreview passed. | done |
| PR / tracker sync | n/a | No explicit PR/comment request; repo policy forbids unsolicited PR/comment. | done |
| Closeout | complete | Plan updated; completion checker remains final mechanical step. | final response |

Findings:
- Root cause: targetless registry component files let shadcn infer default component paths, flattening editor kit files so `./plugins/*` imports fail.
- Follow-up root cause: editor block component files under `blocks/*/components/editor/*` need the same configured-alias target treatment.
- Changelog root cause: source-only registry changelog rows could borrow unrelated same-day package release metadata.

Decisions and tradeoffs:
- Use `@components/editor/*` targets because `shadcn@4.7.0` maps `@components` through the consuming app's configured `aliases.components`.
- Normalize centrally in `createPlateRegistryItems()` so new editor kit and block editor files inherit the contract.
- Keep source-only changelog events unresolved until PR/commit/release evidence exists.

Implementation notes:
- `apps/www/src/registry/registry.ts` now adds targets for any file path containing `components/editor/` unless it already has an explicit target.
- `apps/www/scripts/check-registry-source.mts` enforces that contract for kits and editor blocks.
- `apps/www/src/registry/registry.test.ts` covers kit dependencies and editor block component files.
- `tooling/scripts/generate-ui-changelog-entries.mjs` refuses release matching for source-only change units.

Review fixes:
- First autoreview finding fixed: raw `components/editor/*` targets changed to alias-aware `@components/editor/*`.
- First autoreview finding fixed: source-only changelog event no longer claims unrelated `v53.1.3` list release.
- Second autoreview finding fixed: `blocks/*/components/editor/*` files now receive alias-aware targets.
- Final autoreview clean: no accepted/actionable findings.

Error attempts:
| Error / failed attempt | Count | Next different move | Resolution |
|------------------------|-------|---------------------|------------|
| Initial shadcn smoke lacked `tsconfig.json` | 1 | Add minimal tsconfig/package scaffold | Smoke reran successfully. |
| Synthetic block smoke did not materialize page file | 1 | Narrow smoke to block component files/import rewrites | Component smoke proved the flagged path. |
| Broad `rg` pattern invoked shell backticks | 1 | Rerun targeted quoted searches | Stale generated event confirmed removed. |

Verification evidence:
- `bun test apps/www/src/registry/registry.test.ts 'apps/www/src/app/registry/changelog/[event]/route.test.ts' apps/www/src/app/registry/changelog/components.json/route.test.ts apps/www/src/app/registry/changelog/index.json/route.test.ts` passed: 8 tests, 170 expects.
- `node --test tooling/scripts/generate-ui-changelog-entries.test.mjs` passed: 8 tests.
- `pnpm --filter www exec tsx --tsconfig ./scripts/tsconfig.scripts.json scripts/check-registry-source.mts` passed.
- `pnpm --filter www typecheck` passed, including docs source parity, registry source check, app TS, and package integration TS.
- `pnpm lint:fix` passed with no fixes after final changes.
- `pnpm dlx shadcn@4.7.0 add` custom `aliases.components` smoke installed `@components/editor/*` to `src/shared/components/editor/*` and preserved `./plugins/basic-blocks-base-kit`.
- `pnpm dlx shadcn@4.7.0 add` block component smoke installed `blocks/editor-ai/components/editor/*` targets to `src/shared/components/editor/*` and rewrote imports to `@/shared/components/editor/*`.
- Final autoreview passed: no accepted/actionable findings; patch correct.

Final handoff contract:
- PR line: N/A, no PR requested.
- Issue / tracker line: N/A, no tracker comment requested.
- Confidence line: high.
- Flow table:
  - Reproduced: issue #4971 read; shadcn target behavior smoked.
  - Verified: focused tests, `www` typecheck, lint, shadcn smokes, autoreview.
- Browser check: blocked because Browser/browser-use tools were unavailable.
- Outcome: registry installs preserve editor kit/plugin and editor block component paths under configured components alias.
- Caveat: no in-app browser screenshot; the affected surface is registry JSON/install metadata and was verified with route tests plus real shadcn CLI smokes.
- Design:
  - Chosen boundary: central registry item target normalization.
  - Why not quick patch: individual kit edits would miss future editor files.
  - Why not broader change: package code and registry build output do not own this install-path contract.
- Verified: commands listed in Verification evidence.
- PR body verified: N/A.

Final handoff / sync:
- PR: N/A, not requested.
- Issue / tracker: N/A, not requested.
- Browser proof: blocked; Browser/browser-use unavailable through `tool_search`.
- Caveats: no package changeset; registry changelog event remains unresolved until real release provenance exists.

Open risks:
- No open code risks found by final autoreview. Browser proof could not be captured because the required tool was unavailable, but shadcn CLI smoke directly verified the install behavior.

Reboot status:
| Question | Answer |
|----------|--------|
| Where am I? | Closeout after final clean autoreview. |
| Where am I going? | Run autogoal completion checker, mark goal complete, send final response. |
| What is the goal? | Fix issue #4971 shadcn registry install paths for editor kits and blocks. |
