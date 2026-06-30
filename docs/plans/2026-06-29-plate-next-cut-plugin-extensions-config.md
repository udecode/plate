# plate-next cut plugin extensions config

Objective:
Hard-cut authored `extensions` from Core plugin config; done when plugins use `.extendExtension`, no authored config matches remain, and `pnpm check:core` passes.

Goal plan:
docs/plans/2026-06-29-plate-next-cut-plugin-extensions-config.md

Primary template:
docs/plans/templates/plate-next.md

Applied packs:
- none

Flow mode:
one-shot execution

Completion threshold:
- `createBasePlugin({ extensions: ... })`, `createPlatePlugin({ extensions: ... })`, and `.extend({ extensions: ... })` are no longer authored in Core.
- Runtime extension installation still works through `.extendExtension(...)`.
- Focused tests and `pnpm check:core` pass.

Verification surface:
- Source audit for authored `extensions` config in `packages/core/src` and `packages/core/type-tests`.
- Focused Core tests for plugin extension installation and affected runtime owners.
- Full `pnpm check:core`.

Constraints:
- No public compat alias or shim.
- Keep internal `__extensions` for deferred plugin configuration.
- Use internal runtime storage for editor extensions; do not keep public `plugin.extensions`.
- No broad rename or package sweep.

Boundaries:
- Allowed: `packages/core/src`, `packages/core/type-tests`, this plan.
- Non-goal: docs/browser work; non-Core package migration.

Output budget strategy:
- Use scoped `rg` over Core only.
- Use focused tests first, then `pnpm check:core`.

Blocked condition:
- Block only if `.extendExtension` could not preserve existing Core runtime behavior without reintroducing a public config field.

Start Gates:
| Gate | Applies | Evidence |
|------|---------|----------|
| Prompt requirements captured before work | yes | User approved cutting `extensions: []` from `createBasePlugin`; target is Core plugin API. |
| `plate-next` skill/rule read | yes | Read `.agents/skills/plate-next/SKILL.md`. |
| Active goal checked or created | N/A | No thread goal created; plan ledger used for this micro cut. |
| Mode classified as named packet vs broad Core sweep | yes | Named API packet, not broad Core sweep. |
| Review target recorded as best Plate v2 / Plite-fit / no legacy compat | yes | Best shape is `.extendExtension(...)`; authored config field dies. |
| Broad Core drift ledger initialized when in scope | N/A | Broad Core sweep not requested. |
| Source of truth and allowed workspace recorded | yes | Current checkout, `packages/core/src`, `packages/core/type-tests`. |
| Output budget strategy recorded | yes | Scoped searches and focused tests only. |
| Public API fork routing checked | yes | User accepted the cut before implementation. |
| Gap policy checked | yes | No Plite gap; needed internal Core storage `__editorExtensions`. |
| Related Core sweep policy checked | yes | Swept authored `extensions` patterns in Core source and type tests. |
| Review-mode rename freeze checked | yes | No renames. |

Work Checklist:
- [x] Replace authored plugin `extensions` config with `.extendExtension(...)`.
- [x] Remove public `extensions` from BasePlugin and PlatePlugin config types.
- [x] Poison `createBasePlugin` input with `extensions?: never` so object literals do not accept the old field.
- [x] Remove root editor option picks for `extensions`.
- [x] Replace old public-field installer with internal `__editorExtensions` storage and installer.
- [x] Preserve runtime behavior for history, parser, DOM, affinity, node-id, length, slate-extension, input-rules, and override owners.
- [x] Update Core type contracts and specs to the current shape.
- [x] Run source audit and proof commands.

Completion Gates:
| Gate | Applies | Required action | Evidence |
|------|---------|-----------------|----------|
| Named verification threshold | yes | Prove current API shape and runtime behavior | Source audit, focused tests, `pnpm check:core`. |
| Broad Core drift ledger coverage | N/A | Not a broad Core sweep | Named packet only. |
| Score gate | N/A | No score gate for micro named packet | Source/proof gates used instead. |
| Best Plate v2 recommendation | yes | Record accepted shape | `.extendExtension(...)` is the only authored runtime-extension path. |
| Plite/Plate gap ledger | yes | Record blockers or N/A | No Plite gap; internal Core storage added. |
| Related Core sweep after correction | yes | Audit same-class matches | `rg` over `packages/core/src packages/core/type-tests` for authored `extensions` config. |
| Package/API proof | yes | Run Core proof | `pnpm check:core` passed. |
| Non-Core package error triage | N/A | No non-Core failures in scoped proof | `check:core` only. |
| Source audit | yes | Run exact audit for removed authored field | No authored `extensions: ...` matches remain in Core source/type tests. |
| Rename ledger | N/A | No rename | No Added/Deleted rename work. |
| Extracted-file inventory | N/A | No extracted files created | Only existing files plus this plan changed. |
| Autoreview / review | N/A | Micro API cut with full Core proof | No separate autoreview run. |
| Final lint/check | yes | Run `pnpm check:core` | Passed. |
| Changed list / top drift / needs attention | yes | Fill final response | Included in handoff. |
| Goal plan complete | yes | Run check-complete | Pending final checker run. |

Review matrix:
| Path / API | Drift score | Verdict | Owner | Evidence | Next |
|------------|-------------|---------|-------|----------|------|
| `createBasePlugin` authored `extensions` config | 4 | hard-cut | Core plugin API | Field removed/forbidden; call sites converted | keep |
| `.extendExtension(...)` | 0 | keep-in-plate | Core plugin API | Runtime behavior green via focused tests and `check:core` | keep |
| `plugin.extensions` installer | 4 | hard-cut | Core runtime | Replaced by internal `__editorExtensions` | keep |

Phase / pass table:
| Phase | Status | Evidence | Next |
|-------|--------|----------|------|
| API cut | complete | Types and call sites patched | keep |
| Runtime preservation | complete | Focused tests passed | keep |
| Core proof | complete | `pnpm check:core` passed | close |

Findings:
- Public `extensions` config was config soup.
- Cutting the installer entirely broke runtime behavior; correct owner is internal `__editorExtensions`, installed by Core runtime.
- React `createPlatePlugin` does not expose typed `.extendExtension` yet because the direct method caused recursive type-instantiation debt. Base plugin extension typing remains the supported authored path for this packet.

Timeline:
- Read `plate-next`, `hard-cut`, and `autogoal` instructions.
- Converted current authored Core users to `.extendExtension(...)`.
- Added internal `__editorExtensions`.
- Ran source audit, focused tests, and `pnpm check:core`.

Decisions and tradeoffs:
- Cut public config field -> clearer API and better authoring intent.
- Keep internal storage -> preserves existing runtime behavior without public config soup.
- Do not add React plugin `.extendExtension` in this packet -> current type graph recurses; defer only if a clean non-recursive design is needed.

Review fixes:
- Initial over-cut removed the runtime installer and broke Core runtime tests.
- Fixed by installing from internal `__editorExtensions` instead of public `plugin.extensions`.

Error attempts:
| Error / failed attempt | Count | Next different move | Resolution |
|------------------------|-------|---------------------|------------|
| Removed installer too aggressively | 1 | Add internal storage/installer | Fixed; focused tests and `check:core` passed. |
| React `.extendExtension` type recursion | 1 | Do not expose React sugar in this packet | Removed method; Core typecheck passed. |

Verification evidence:
- `pnpm --filter @platejs/core exec tsc --project tsconfig.test.json --noEmit --pretty false` -> passed.
- Focused affected specs -> 173 pass, 0 fail.
- Source audit for authored `extensions` config -> no public authored matches remain; only internal `__extensions`/`__editorExtensions` and `.extendExtension` output remain.
- `pnpm check:core` -> passed; Core tests 683 pass, Plite tests 1872 pass / 85 skip.

Reboot status:
| Where am I? | Where am I going? | What is the goal? | What learned? | What done? |
|-------------|-------------------|-------------------|---------------|------------|
| Core API cut complete | Final handoff | Remove authored plugin `extensions` config | Need internal installer, not public field | Proof green |

Open risks:
- React `createPlatePlugin` does not get public typed `.extendExtension` in this packet. Use `createBasePlugin(...).extendExtension(...)` for the strong typed path, or design a non-recursive React wrapper later.
