# base-plugin-editor-rename

Objective:
Hard rename Plate base plugin/editor API so non-React substrate code uses
`BasePlugin` / `createBasePlugin` and the base editor type is `BaseEditor`,
with no public compat aliases for the old names.

Goal plan:
docs/plans/2026-06-24-base-plugin-editor-rename.md

Task source:
- User requested a hard rename: `BasePlugin` / `createBasePlugin` for non-React
  substrate/plugin logic, `PlatePlugin` / `createPlatePlugin` for React/product
  plugin logic, and `BaseEditor` instead of `BasePlateEditor`.

Completion threshold:
The goal is done when active source/docs no longer expose or reference the old
API names, generated package barrels and relevant `dist` outputs are refreshed,
focused package tests pass for the renamed plugin/editor surface, affected
package typechecks pass, and this plan passes the autogoal completion check.

Verification surface:
- Source/docs stale-name audit for the old exact public names.
- Generated `dist` stale-name audit for old import/export names.
- `pnpm brl`.
- Affected package typechecks for `@platejs/core` and `platejs`.
- Focused direct `bun test` rows for renamed plugin/html utility files.
- `platejs` package smoke test.
- Docs source generation and docs parity check because docs content changed.
- Scoped Biome check on rename files.

Constraints:
- Hard cut only. Do not add compat aliases or shims for the old names.
- Keep Plite raw `BaseEditor` accessible from `@platejs/plite`; the root
  `platejs` package intentionally exposes Plate's `BaseEditor`.
- Do not broaden into Plate v2 design or unrelated browser behavior work.
- Do not create a PR, commit, push, or changeset in this pass.

Boundaries:
- Source of truth: packages, app docs/content, generated barrels, and relevant
  package `dist` artifacts for this API surface.
- Allowed edit scope: API naming files, callers, docs that teach the API, tests
  using the renamed helpers, and generated barrels/build artifacts required by
  package exports.
- Browser surface: N/A; this is a package API/type rename, not a rendered UI
  behavior change.
- Browser strategy: N/A for this task.
- Tracker sync: N/A; no issue/PR tracker was requested.
- Non-goals: no changeset, no public compat layer, no full Plate package sweep.

Output budget strategy:
Searches were scoped to `packages`, `apps/www/src`, and `content/docs`; `dist`
audits were file-list only; high-volume command output was capped.

Blocked condition:
No blocker remains. The package test wrapper is not a reliable focused command
for this task because it ran or hung on the broad core suite, so direct
`bun test` is the recorded focused proof.

Task state:
- task_type: package API hard cut
- task_complexity: medium
- current_phase: closeout
- current_phase_status: complete
- next_phase: final response
- goal_status: ready to close

Current verdict:
- verdict: complete
- confidence: high
- next owner: none
- reason: old exact names are gone from active source/docs and generated package
  artifacts; affected package proof is green.

Start Gates:
| Gate | Applies | Evidence |
|------|---------|----------|
| Prompt requirements captured before work | yes | Requirements copied into this plan: BasePlugin/createBasePlugin, PlatePlugin/createPlatePlugin, BaseEditor, hard rename/no aliases. |
| Timed checkpoint parsed | no | No duration was requested. |
| Skill analysis before edits | yes | Read `autogoal` and `hard-cut` skills before durable work. |
| Active goal checked or created | yes | Active goal created for this hard rename plan. |
| Source of truth read before edits | yes | Existing core plugin/editor files, callers, docs, and generated barrel shape were inspected during implementation. |
| Tracker comments and attachments read | no | No tracker or attachment target. |
| TDD decision before behavior change or bug fix | no | Naming/API hard cut; focused existing tests are the right proof. |
| Branch decision for code-changing task | no | User did not ask for branch work; no git branch action. |
| Release artifact decision | yes | No changeset in this pass; user asked rename work only and no release action. |
| Browser tool decision for browser surface | yes | N/A because no browser-rendered behavior changed. |
| Package/API pack selected | yes | Public package API and export boundary changed. |
| Public surface or package boundary identified | yes | Core non-React plugin/editor naming and root `platejs` export collision were resolved. |
| Barrel/export impact decision recorded | yes | `pnpm brl` required and run. |

Work Checklist:
- [x] No duration was requested; timed loop is N/A.
- [x] First checkpoint captured explicit requirements, scope, stop condition, and verification surface.
- [x] Objective, completion threshold, verification surface, constraints, boundaries, and blocked condition are concrete.
- [x] Source task classified as package API hard cut.
- [x] Video/screen evidence is N/A because no media input was part of this request.
- [x] Nearby implementation patterns were read before edits.
- [x] Implementation fixes the owner boundary by renaming the base plugin/editor API itself, not adding aliases.
- [x] Release artifact decision recorded as no changeset for this pass.
- [x] Final handoff shape is concise changed list plus verification and caveat.
- [x] Branch handling is N/A; no branch action requested.
- [x] Local-env retry policy applied: `pnpm run reinstall` was run once after React dispatcher failures.
- [x] Workspace authority recorded: commands ran in `/Users/zbeyens/git/plate-2`.
- [x] High-risk public API note recorded: hard cut removes old names with no aliases.
- [x] Autoreview is N/A for this narrow rename pass; user did not request review and focused proof is recorded.
- [x] Agent-native review is N/A; no `.agents/**`, `.codex/**`, skill, hook, or prompt surface changed.
- [x] Output budget discipline followed after one accidental broad diff listing; subsequent searches were capped.
- [x] Package/API pack: public API, package boundary, export, and release-artifact impact recorded.
- [x] Package/API pack: no-artifact reason recorded.
- [x] Package/API pack: compatibility decision is explicit: hard cut, no aliases.
- [x] Package/API pack: package-owned typecheck/test proof recorded.
- [x] Package/API pack: generated barrels updated with `pnpm brl`.

Completion Gates:
| Gate | Applies | Evidence |
|------|---------|----------|
| Named verification threshold | yes | Source/docs audit, `dist` audit, `pnpm brl`, typechecks, focused tests, docs checks, and scoped Biome all recorded below. |
| Bug reproduced before fix | no | This was a naming hard cut, not a bug fix. |
| Targeted behavior verification | yes | `bun test` focused renamed plugin/html utility files passed. |
| TypeScript or typed config changed | yes | `pnpm turbo typecheck --filter=./packages/core --filter=./packages/plate` passed. |
| Package exports or file layout changed | yes | `pnpm brl` passed. |
| Package manifests, lockfile, or install graph changed | no | No manifest/lockfile edit; `pnpm run reinstall` only refreshed local install. |
| Agent rules or skills changed | no | No agent rule or skill source changed. |
| Workspace authority proof | yes | All proof commands ran from `/Users/zbeyens/git/plate-2`. |
| Browser surface changed | no | Package API rename only. |
| Browser final proof | no | N/A for package API/type rename. |
| CI-controlled template output changed | no | No template output intentionally changed. |
| Package behavior or public API changed | yes | Hard rename changes package API names; no changeset requested for this local pass. |
| Docs or content changed | yes | `pnpm --filter www build:source` and `pnpm --filter www check:docs` passed. |
| High-risk mini gate | yes | Failure mode was stale public names or `dist` imports; source/docs and `dist` audits are clean. |
| Local install corruption suspected | yes | `pnpm run reinstall` passed after React dispatcher failures. |
| Final lint | yes | Scoped `pnpm exec biome check --fix ...` passed on rename files. Broad `pnpm lint:fix` found unrelated existing Plite/browser lint debt and is not this gate. |
| Goal plan complete | yes | `check-complete.mjs` will be run before `update_goal`. |
| Public API / package boundary proof | yes | Source/docs and generated `dist` stale-name audits are clean. |
| Release artifact classification | yes | Published package API rename, but no changeset in this pass per current task scope. |
| Published package changeset | no | Explicitly deferred; user asked code rename, not release prep. |
| Package typecheck/build/test | yes | Typecheck/build through package graph and focused tests recorded. |
| Barrel/export generation | yes | `pnpm brl` passed. |

Phase / pass table:
| Phase | Status | Evidence | Next |
|-------|--------|----------|------|
| Intake and source read | complete | Skills read and source owner files inspected. | Implementation |
| Implementation | complete | Old names renamed to `BasePlugin`, `createBasePlugin`, and `BaseEditor`; lower-level config base moved to `PluginBase`. | Verification |
| Verification | complete | Commands and audits below. | Closeout |
| PR / tracker sync | complete | N/A; no PR/tracker requested. | Final response |
| Closeout | complete | Plan completed and ready for autogoal close. | Final response |

Findings:
- `packages/plate/src/index.tsx` had a root export collision between Plite
  `BaseEditor` and Plate `BaseEditor`; root `platejs` now explicitly exposes
  the Plate type.
- Package `dist` files held stale old imports after source was clean; targeted
  package builds refreshed them.
- `pnpm --filter @platejs/core test <files>` is not a reliable focused command
  here; direct `bun test <files>` is the focused proof.

Decisions and tradeoffs:
- Keep `PlatePlugin` / `createPlatePlugin` for React/product plugin logic.
- Use `BasePlugin` / `createBasePlugin` for non-React substrate plugins.
- Rename the old low-level internal base config type to `PluginBase` to avoid
  stealing the public `BasePlugin` name.
- Use `BaseEditor` for the Plate base editor type; no `BasePlateEditor` alias.

Implementation notes:
- Renamed core plugin/editor files and call sites.
- Updated docs/examples/tests to the new names.
- Regenerated barrels and rebuilt affected `dist` artifacts.
- Replaced stale test mock variable names to avoid old vocabulary in source.

Review fixes:
- Fixed `EditorHotkeysEffect` typing after rename by narrowing shortcut entries.
- Fixed root `platejs` duplicate `BaseEditor` export.
- Renamed internal helpers `initializeBasePlateEditor` and `isBasePlateEditor`.

Error attempts:
| Error / failed attempt | Count | Next different move | Resolution |
|------------------------|-------|---------------------|------------|
| Newline-separated perl path rewrite failed | 1 | Use null-separated `rg -l -0 | xargs -0` | Rename completed. |
| Core package test wrapper ran/hung broader suite instead of focused files | 2 | Use direct `bun test <files>` | Focused tests passed. |
| React invalid hook call / null dispatcher failures | 1 | Run repo reset path `pnpm run reinstall` | Reinstall passed; focused direct tests are green. |
| Broad `pnpm lint:fix` hit unrelated Plite/browser lint debt | 1 | Use scoped Biome on rename files | Scoped Biome passed. |

Verification evidence:
- `pnpm brl` passed.
- `pnpm turbo typecheck --filter='./packages/*'` passed before reinstall: 75
  tasks successful.
- `pnpm turbo build --filter=./packages/ai --filter=./packages/basic-nodes --filter=./packages/code-block --filter=./packages/link --filter=./packages/list-classic --filter=./packages/list --filter=./packages/math --filter=./packages/media --filter=./packages/mention --filter=./packages/toggle` passed.
- `rg -l "createEditorPlugin|createBasePlateEditor|BasePlateEditor|isBasePlateEditor|getEditorPlugin" packages/*/dist --glob '!**/*.map'` produced no files.
- `rg -n "\bcreateEditorPlugin\b|\bcreateBasePlateEditor\b|\bBasePlateEditor\b|\bTBasePlateEditor\b|\bAnyEditorPlugin\b|\bEditorPluginContext\b|\bEditorPluginMethods\b|\bEditorPluginConfig\b|\bgetEditorPlugin\b|\bisBasePlateEditor\b|\binitializeBasePlateEditor\b" packages apps/www/src content/docs --glob '!**/dist/**' --glob '!apps/www/public/**' --glob '!**/node_modules/**'` produced no matches.
- `pnpm run reinstall` passed.
- `bun test packages/core/src/lib/plugin/createBasePlugin.spec.ts packages/core/src/static/serializeHtml.node-props.spec.ts packages/core/src/lib/utils/normalizeDescendantsToDocumentFragment.spec.tsx` passed: 34 tests.
- `bun test packages/core/src/lib/plugin/createBasePlugin.typed.spec.ts packages/core/src/lib/plugin/getBasePlugin.spec.ts` passed: 6 tests.
- `pnpm --filter platejs test` passed: 1 test.
- `pnpm --filter www build:source` passed.
- `pnpm --filter www check:docs` passed.
- `pnpm turbo typecheck --filter=./packages/core --filter=./packages/plate` passed: 12 tasks.
- `pnpm exec biome check --fix ...` on rename files passed: 85 files, no fixes.

Reboot status:
Current state is resumable from this plan. If continuing, do not reintroduce
old names as aliases; start from the clean source/docs and `dist` audits above.

Open risks:
- Broad `pnpm lint:fix` still fails on unrelated existing Plite/browser lint
  debt, so it is not a valid closeout gate for this narrow hard rename.
- A changeset may be needed later if this package API rename is prepared for
  publication, but it was outside this requested pass.

Final handoff contract:
- Changed list: core plugin/editor naming, callers, docs/examples/tests,
  barrels, and affected package build artifacts.
- Verification: source/docs audit, `dist` audit, package typechecks, focused
  tests, docs checks, scoped Biome.
- Caveat: broad lint has unrelated debt; no browser proof because no UI
  behavior changed.
