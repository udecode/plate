# full Slate-name cleanup

Objective:
Complete full Slate-name cleanup; done when remaining old-name ledger is classified or fixed and package/docs gates pass.

Goal plan:
docs/plans/2026-06-23-full-slate-naming-cleanup.md

Template:
docs/plans/templates/major-task.md

Applied packs:
- docs
- package-api

Completion threshold:
- Current-facing package source, package tests, docs, and app source have zero unclassified matches for old public names: `SlateEditor`, `SlatePlugin`, `SlatePluginConfig`, `SlatePlugins`, `createSlatePlugin`, `createSlateEditor`, `createPliteEditor`, `@platejs/slate-legacy`, and `slate-legacy`.
- Current-facing package/docs/app source has zero unclassified `Slate v2`, `slate-v2`, or `Plate Slate` terminology.
- Historical changelogs, donor transplant ledgers, issue ledgers, and dated plan artifacts may preserve old words when they are evidence, not current public API.
- Public source teaches `createBasePlateEditor`, `BasePlateEditor`, `EditorPlugin`, `EditorPluginInput`, `EditorPlugins`, and `createEditorPlugin`; no compat alias is added.
- Package-owned typecheck/build/test, docs source checks, scoped lint, and barrel generation pass or have a source-backed non-blocking reason.
- Autogoal `check-complete` passes.

Verification surface:
- `.tmp/cut-slate-plugin-naming/full/current-facing-old-symbols.final-clean.txt`
- `.tmp/cut-slate-plugin-naming/full/current-facing-old-terminology.final-clean.txt`
- `.tmp/cut-slate-plugin-naming/full/create-plite-editor-leftovers.after-create-base.txt`
- `.tmp/cut-slate-plugin-naming/full/package-tests-sequential.final3.log`
- `.tmp/cut-slate-plugin-naming/full/typecheck-touched-packages.final3.log`
- `.tmp/cut-slate-plugin-naming/full/build-core.final2.log`
- `.tmp/cut-slate-plugin-naming/full/www-build-source.after-create-base.log`
- `.tmp/cut-slate-plugin-naming/full/www-check-docs.after-create-base.log`
- `.tmp/cut-slate-plugin-naming/full/biome-create-base-touched.after-create-base.log`
- `.tmp/cut-slate-plugin-naming/full/pnpm-brl.final.log`

Constraints:
- No commit, push, PR, release, or changeset in this goal.
- Do not edit `packages/slate-legacy`; it is the separate deletion lane.
- Do not erase truthful historical evidence from changelogs, donor transplant ledgers, issue ledgers, or dated plans.
- Do not manually edit generated `dist`; rebuild/package-generate from source.
- Keep scope to name cleanup and safe regression fixes found while proving it.

Boundaries:
- Source of truth: current checkout, public package source, current docs/app source, and generated proof logs.
- Current-facing scope: `packages/*/src`, `packages/*/test`, `packages/core/src`, `packages/plate/src`, `content/docs`, and `apps/www/src`.
- Accepted historical scope: changelogs, `docs/transplant/slate-v2`, issue ledgers, dated `docs/plans`, and archived plan artifacts.
- Browser surface: N/A; this was source/docs/API terminology plus package/runtime proof, with no rendered UI behavior change requiring Browser.
- Release artifact: N/A; user explicitly scoped this migration lane away from changesets, with release-lanes owning publish artifacts later.

Blocked condition:
Blocked only if a remaining current-facing old-name match requires a new public API decision from the user, or package/docs proof fails on a regression that cannot be fixed inside this cleanup lane. Neither condition remains.

Start Gates:
| Gate | Applies | Evidence |
|------|---------|----------|
| Prompt requirements captured before work | yes | This plan records scope, non-goals, stop condition, deliverables, verification surface, and success criteria. |
| Timed checkpoint parsed | no | N/A: no duration requested for this cleanup. |
| `major-task` loaded | yes | `.agents/skills/major-task/SKILL.md` read before planning. |
| `autogoal` loaded | yes | `.agents/skills/autogoal/SKILL.md` read before plan/check-complete closeout. |
| Active goal checked or created | yes | Active goal objective points to this plan. |
| Source of truth read before analysis | yes | Current source, docs, audit ledgers, and prior canary evidence inspected. |
| Major lane selected | yes | Architecture/public API plus docs terminology hard cut. |
| Decision criteria stated | yes | Zero unclassified current-facing old names plus package/docs gates. |
| Existing repo patterns checked | yes | No-alias policy, BasePlate naming, Plite package naming, and docs current-state doctrine applied. |
| Helper stack selected | yes | autogoal, major-task, docs-creator doctrine, local audits, package checks, docs checks. |
| External research decision recorded | no | N/A: local source owns this naming cleanup. |
| Implementation expectation recorded | yes | Full sweep implementation was expected and performed. |
| Workspace authority selected | yes | `/Users/zbeyens/git/plate-2`. |
| Branch / PR expectation decided | no | N/A: no PR or commit requested. |
| Output budget strategy recorded | yes | Searches were written to artifacts and summarized with counts. One broad output was accidental and recovered by artifact/count audits. |
| Docs pack selected | yes | Docs were edited and verified with source checks. |
| `docs-creator` loaded | yes | `.agents/skills/docs-creator/SKILL.md` read for docs doctrine. |
| Target docs and nearest sibling docs read | yes | Docs containing stale names were read/rewritten through source-backed search, then parser-checked. |
| Package/API pack selected | yes | Package source and public docs import examples changed. |
| Public surface or package boundary identified | yes | `platejs` exports `createBasePlateEditor`, not `createPliteEditor`. |
| Release artifact path selected | yes | No changeset in this lane; release-lanes owns beta publish notes. |
| Barrel/export impact decision recorded | yes | `pnpm brl` ran and passed. |

Work Checklist:
- [x] Explicit prompt requirements, scope boundary, stop condition, deliverables, verification surface, and success criteria are copied into this plan.
- [x] Objective, completion threshold, verification surface, constraints, boundaries, and blocked condition are concrete.
- [x] Current state was mapped before implementation.
- [x] Existing repo naming decisions and no-alias policy were applied.
- [x] External research was skipped with a recorded N/A reason.
- [x] Facts, inference, and recommendation were separated through source audit, implementation, and verification evidence.
- [x] Review pressure was applied through old-name ledgers and package/docs gates.
- [x] Docs pack gates were selected because current docs changed.
- [x] Package/API pack gates were selected because exported public API naming and package tests were involved.
- [x] Workspace authority is recorded for every proof command.
- [x] Output budget discipline was followed after the accidental broad output: final audits are artifact-count based.
- [x] Current docs use current-state API names; historical docs keep truthful history.
- [x] Docs named APIs/imports were source-backed against `packages/plate/src/index.tsx` and `packages/core/src/lib/editor/withPlite.ts`.
- [x] Docs source/parser checks passed.
- [x] Package public boundary proof passed: current-facing package source/test audit is zero for old public names.
- [x] Release artifact matrix was applied: no changeset for this migration cleanup lane.
- [x] Compatibility decision is explicit: no public compat alias or shim was added.
- [x] Package typecheck/build/test proof is recorded.
- [x] Generated barrels were updated/verified with `pnpm brl`.
- [x] Broad `www typecheck` failure was classified as existing Plate runtime migration debt, not this cleanup, based on `editor.tf` and `getPluginApi` errors.
- [x] Final evidence and risks are recorded below.

Completion Gates:
| Gate | Applies | Required action | Evidence |
|------|---------|-----------------|----------|
| Named verification threshold | yes | Run final old-name audits and package/docs gates | Current-facing old symbols count 0; terminology count 0; package/docs gates passed. |
| Current-state source audit | yes | Map public source and docs/app references | `platejs` exports `createBasePlateEditor`; stale `createPliteEditor` docs/tests were rewritten. |
| Decision criteria closure | yes | Mark criteria satisfied or scoped historical | Current-facing criteria satisfied; historical `v48` and ledgers classified as accepted history. |
| Options / tradeoffs / rejection record | yes | Choose patch vs classify | Current public docs/tests patched; changelogs/ledgers classified, not rewritten. |
| Review / pressure pass | yes | Run old-name and terminology ledgers | Final zero-count audit artifacts recorded. |
| Review findings closure | yes | Fix actionable findings | Stale `createPliteEditor` public docs/tests fixed. |
| External-source audit | no | Use local source only | N/A: this is repo-owned API naming. |
| Implementation gates | yes | Close docs/package/API gates | Package tests/typecheck/build, docs checks, scoped Biome, and barrels passed. |
| Final handoff contract | yes | Record evidence, caveats, residual risk, next owner | Recorded in this plan and final response. |
| Final lint | yes | Run scoped equivalent | `biome-create-base-touched.after-create-base.log` passed. |
| Output budget discipline | yes | Record accidental stream and recovery | One broad grep streamed too much; final closeout uses artifacted audits. |
| Timed checkpoint | no | Mark N/A | N/A: no duration requested. |
| Goal plan complete | yes | Run check-complete | Run after this plan update. |
| Docs source-backed claim audit | yes | Verify imports/API names against source | `packages/plate/src/index.tsx` exports `createBasePlateEditor`; docs now match. |
| Docs links / routes / previews | no | Mark N/A | N/A: no route or link shape changed. |
| Docs MDX/content parser | yes | Run docs source checks | `www-build-source.after-create-base.log` and `www-check-docs.after-create-base.log` passed. |
| Plugin page specifics | no | Mark N/A | N/A: plugin docs content was only naming/import cleanup. |
| Public API / package boundary proof | yes | Source-audit public API and package old names | `current-facing-old-symbols.final-clean.txt` count 0. |
| Release artifact classification | yes | Record artifact decision | No changeset: migration cleanup lane, not publish lane. |
| Published package changeset | no | Mark N/A | N/A: no release artifact requested; release-lanes owns publication artifacts. |
| Registry changelog | no | Mark N/A | N/A: not registry-only changelog work. |
| No release artifact | yes | Record exact reason | Internal migration cleanup on beta branch; no commit/release requested. |
| Package typecheck/build/test | yes | Run owning package checks | Touched-package typecheck/build script passed; core build passed; sequential package tests passed. |
| Barrel/export generation | yes | Run `pnpm brl` | `pnpm-brl.final.log`: 58 successful tasks. |

Phase / pass table:
| Phase | Status | Evidence | Next |
|-------|--------|----------|------|
| Intake and source read | complete | Plan and source audits created | done |
| Current-state map | complete | Public source showed `createBasePlateEditor` is canonical | done |
| Options and recommendation | complete | Patch current-facing names, classify history | done |
| Review / pressure pass | complete | Final old-name audits returned zero current-facing hits | done |
| Implementation or plan artifact | complete | Runtime/doc/test naming cleanup applied | done |
| Verification | complete | Package/docs/lint/barrel gates passed | done |
| Closeout | complete | This plan records evidence and residual risks | final response |

Findings:
- `createPliteEditor` was still used in docs/app tests even though `platejs` source exports `createBasePlateEditor`. That was a real API mismatch, not a harmless leftover.
- Input-rule behavior regressed during bridge cleanup until the current runtime installed a Plite extension middleware for `tx.text.insert`.
- Grouped parallel package tests were noisy and failed with stale package-link/runtime resolution; sequential package tests after `pnpm install` were the reliable proof.
- `www typecheck` remains blocked by broader Plate runtime migration debt (`editor.tf`, `getPluginApi`, registry UI typing), outside this name cleanup.

Verification evidence:
- `rg` current-facing old public names -> `0` in `.tmp/cut-slate-plugin-naming/full/current-facing-old-symbols.final-clean.txt`.
- `rg` current-facing old terminology -> `0` in `.tmp/cut-slate-plugin-naming/full/current-facing-old-terminology.final-clean.txt`.
- `rg createPliteEditor` after rewrite -> only `content/docs/migration/v48.mdx`, accepted historical migration text.
- `pnpm --filter @platejs/core build` -> passed in `.tmp/cut-slate-plugin-naming/full/build-core.final2.log`.
- `sh .tmp/cut-slate-plugin-naming/full/typecheck-touched-packages.sh` -> 56 successful tasks in `.tmp/cut-slate-plugin-naming/full/typecheck-touched-packages.final3.log`.
- Sequential package tests passed for `@platejs/ai`, `@platejs/toggle`, `@platejs/comment`, `@platejs/dnd`, `@platejs/selection`, `@platejs/list-classic`, `@platejs/suggestion`, `@platejs/basic-styles`, `@platejs/combobox`, `@platejs/table`, `@platejs/plite-hyperscript`, and `@platejs/plite-react` in `.tmp/cut-slate-plugin-naming/full/package-tests-sequential.final3.log`.
- `pnpm --filter www build:source` and `pnpm --filter www check:docs` passed.
- Scoped Biome check for renamed docs/app/package-test files passed.
- `pnpm brl` passed with 58 successful tasks.

Reboot status:
Current-facing Slate-name cleanup is verified. Resume next on the broader Plate runtime migration debt if desired: registry/app code still has `editor.tf`, `getTransforms`, and `getPluginApi` type errors under `www typecheck`.

Open risks:
- `www typecheck` is not green because Plate runtime/default-route migration is incomplete. This is real debt, but not a remaining Slate-name cleanup failure.
- Historical changelogs, transplant scripts, and issue/plan ledgers still contain old words intentionally as evidence.
- `.agents/rules` and generated skill mirrors still contain old Slate-oriented skill names in places; that is an agent-skill topology rename lane, not current package/docs API cleanup.
