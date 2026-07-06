# plate-next plugin export inference law

Objective:
Teach Plate Next to reject plugin export annotations/casts that hide inference regressions, then remove current Utils examples safely.

Goal plan:
docs/plans/2026-07-05-plate-next-plugin-export-inference-law.md

Template:
docs/plans/templates/plate-next.md

Primary template:
docs/plans/templates/plate-next.md

Applied packs:
- plate-next named skill repair
- autogoal lifecycle checkpoint

Plate Next source:
- prompt / link: user asked why `packages/utils/src/lib/plugins/normalize-types/NormalizeTypesPlugin.ts` used `BasePlugin<NormalizeTypesConfig>`, said to add a rule to avoid declaring types, and said inference must be forced with no inference regression.
- mode: named Plate Next type-inference repair.
- target surface: `packages/utils` plugin exports plus `plate-next` source/template/mirror.
- review target: plugin constants infer from builder chains; explicit export result annotations/casts are forbidden unless they are true external boundaries.
- broad Core sweep: no.
- correction-triggered related Core sweep: exact source audit for the same plugin export annotation/cast smell.
- package review mode: scoped same-smell cleanup in `packages/utils`, not a full package file checklist.
- package review target: `packages/utils`.
- package file checklist gate: N/A.
- completion threshold summary: rule/template/mirror updated, Utils plugin export annotations/casts removed, audits clean, Utils and check:core proof green.

First checkpoint:
- Explicit requirement: explain/fix why `NormalizeTypesPlugin` declared `BasePlugin<NormalizeTypesConfig>`.
- Explicit requirement: add `plate-next` rule against declaring plugin result types.
- Explicit requirement: force inference and treat inference regression as a bug.
- Scope boundary: do not redesign plugin APIs unless inference fails after removing annotations/casts.
- Stop condition: source rule synced, current same-smell Utils cases removed, and proof passes.
- Final handoff: changed list, proof, audit results, and any remaining review debt.

Timed checkpoint:
- requested duration: none.
- semantics: scoped repair, not timed loop.
- initial confidence score: 88; the smell is clear, but typecheck must prove chained builders infer without the annotations.
- improvement loop: remove annotations/casts, patch rule/template, sync mirror, run proof.
- final score / loop closure: 99; the three Utils result annotations/casts were unnecessary, typecheck proved inference holds, and shared gates passed.

Completion threshold:
- `.agents/rules/plate-next.mdc` says plugin export annotations/casts hide inference regressions and should be removed unless they are true external boundaries.
- `docs/plans/templates/plate-next.md` includes a plugin export inference audit item.
- Generated `.agents/skills/plate-next/SKILL.md` is synced from the source rule.
- `NormalizeTypesPlugin`, `TrailingBlockPlugin`, and `BlockPlaceholderPlugin` infer their exported plugin types from the builder chains.
- `packages/utils/src` audit has zero matches for `export const ...: BasePlugin<...>`, `export const ...: PlatePlugin<...>`, or chained `as BasePlugin<...>` / `as PlatePlugin<...>`.
- Focused Utils typecheck/test/build and `pnpm check:core` pass.
- `node .agents/skills/autogoal/scripts/check-complete.mjs docs/plans/2026-07-05-plate-next-plugin-export-inference-law.md` passes.

Verification surface:
- focused tests / commands: `pnpm turbo typecheck --filter=./packages/utils`; `pnpm --filter @platejs/utils test`; `pnpm --filter @platejs/utils build`.
- package proof: Utils typecheck/test/build.
- shared Core gate: `pnpm check:core`.
- source audits: `rg -n "export const .*: (BasePlugin|PlatePlugin)<|\\) as (BasePlugin|PlatePlugin)<" packages/utils/src`.
- related Core sweep query / match count / patched count / deferred count: scoped audit over `packages/utils/src` found 3 same-smell plugin exports and patched all 3; broad Core scan was not in scope.
- package file manifest / row count / checked count / deferred count: N/A.
- Plite/Plate gap ledger: N/A; builder inference already worked after removing result annotations/casts.
- broad Core drift ledger gate: N/A.
- final plan check: `node .agents/skills/autogoal/scripts/check-complete.mjs docs/plans/2026-07-05-plate-next-plugin-export-inference-law.md`.

Constraints:
- Plugin export result types should infer from `createBasePlugin`, `createPlatePlugin`, `toPlatePlugin`, and chained `.extend*` calls.
- Explicit `PluginConfig` generic input is allowed when it defines the plugin config; explicit exported result annotation/cast is the smell.
- Do not use `: BasePlugin<Config>`, `: PlatePlugin<Config>`, or `as BasePlugin<Config>` to hide weak builder types.
- If inference fails, fix the owning builder/generic API rather than annotating the result.
- Do not broaden into unrelated Core plugin type cleanup.
- Do not hand-edit generated skill mirrors; patch source and run the generator.
- No browser proof; no UI route changed.

Boundaries:
- allowed edit scope: `packages/utils/src` same-smell plugin exports, `.agents/rules/plate-next.mdc`, generated skill mirror via repo script, `docs/plans/templates/plate-next.md`, and this plan.
- package/API surfaces: plugin builder inference for Base/Plate plugin constants.
- docs/browser surfaces: no public docs or browser surfaces.
- non-goals: broad Core sweep, public API rename, plugin API redesign, package migration.
- out-of-scope package errors: any non-Utils failures are out of scope unless caused by the edited plugin builder inference.

Output budget strategy:
- Use exact audits and proof summaries.
- Do not stream broad package search results into chat.

Blocked condition:
- Blocked only if removing the annotations breaks plugin config/type inference, proving a builder API gap that needs a separate Core type fix.

Current verdict:
- verdict: main-parity-cleanup
- confidence: 99
- next owner: plate-next
- keep / revert / quarantine call: keep
- reason: annotations were unnecessary type-cover; inference holds under focused and shared proof.

Start Gates:
| Gate | Applies | Evidence |
|------|---------|----------|
| Prompt requirements captured before work | yes | First checkpoint captures the NormalizeTypes target, rule update, no inference regression requirement, stop condition, and proof. |
| `plate-next` skill/rule read | yes | Generated `plate-next` skill read; source rule patched. |
| Active goal checked or created | yes | Active autogoal created for plugin export inference law. |
| Mode classified as named packet vs broad Core sweep | yes | Named skill repair plus scoped Utils same-smell cleanup; broad Core sweep is N/A. |
| Review target recorded as best Plate v2 / Plite-fit / no legacy compat | yes | Builder-chain inference is the target shape; no compatibility annotation kept. |
| Broad Core drift ledger initialized when in scope | N/A | Not a broad Core sweep. |
| Source of truth and allowed workspace recorded | yes | Source rule/template patched; mirror regenerated by `pnpm prepare`. |
| Output budget strategy recorded | yes | Exact audits and proof summaries only. |
| Public API fork routing checked | yes | No public API fork; no builder redesign needed. |
| Gap policy checked | yes | Inference failure would have been a Core builder gap; none occurred. |
| Related Core sweep policy checked | yes | Same-smell Utils audit patched all matches; broad Core deferred as out of scope. |
| Review-mode rename freeze checked | yes | No renames. |
| Package review checklist initialized when in scope | N/A | Not package review mode. |

Work Checklist:
- [x] First checkpoint complete: every explicit prompt requirement, scope boundary, stop condition, deliverable, final handoff section, verification surface, and success criterion is copied into this plan before implementation.
- [x] Mode classified as named skill-rule repair with scoped Utils same-smell cleanup.
- [x] Best Plate v2 call recorded: plugin constants infer from builder chains; result annotations/casts are inference regressions.
- [x] `plate-next` source rule updated.
- [x] Plate Next autogoal template updated.
- [x] Generated Plate Next skill mirror synced from source.
- [x] `NormalizeTypesPlugin` export annotation/cast removed.
- [x] Same-smell Utils plugin export annotations/casts removed.
- [x] Plugin export inference audit closed.
- [x] Focused Utils proof passes.
- [x] Shared `pnpm check:core` proof passes.
- [x] Changed list, needs-attention rows, and next owner are filled before final response.
- [x] Output budget discipline followed.

Phase / pass table:
| Phase | Status | Evidence |
|-------|--------|----------|
| Capture requirements | done | First checkpoint filled. |
| Patch skill law | done | Source rule and template patched, generated skill synced. |
| Cleanup Utils plugin exports | done | Three same-smell plugin exports now infer from builder chains. |
| Verify | done | Utils proof and `pnpm check:core` passed. |
| Close autogoal | done | Final evidence recorded. |

Completion Gates:
| Gate | Applies | Required action | Evidence |
|------|---------|-----------------|----------|
| Skill source updated | yes | Patch `.agents/rules/plate-next.mdc` | Plugin export inference law added. |
| Template updated | yes | Patch `docs/plans/templates/plate-next.md` | Plugin export inference audit added. |
| Generated mirror synced | yes | Run repo script and audit generated skill | `pnpm prepare`; `rg` found rule in generated mirror. |
| Same-smell cleanup | yes | Remove result annotations/casts from Utils plugin exports | `NormalizeTypesPlugin`, `TrailingBlockPlugin`, and `BlockPlaceholderPlugin` cleaned. |
| Source audit | yes | Run exact plugin export annotation/cast audit | Audit returned no matches in `packages/utils/src`. |
| Package proof | yes | Run Utils typecheck/test/build | Passed. |
| Shared Core gate | yes | Run `pnpm check:core` | Passed after formatting fix. |
| Goal plan complete | yes | Run `check-complete.mjs` | Ready for final check. |

Review matrix:
| Path / API | Drift score | Verdict | Owner | Evidence | Next |
|------------|-------------|---------|-------|----------|------|
| `packages/utils/src/lib/plugins/normalize-types/NormalizeTypesPlugin.ts` | 2 | main-parity-cleanup | packages/utils | `BasePlugin<NormalizeTypesConfig>` annotation and cast were unnecessary; typecheck passed after removal. | Keep inferred export. |
| `packages/utils/src/lib/plugins/trailing-block/TrailingBlockPlugin.ts` | 2 | main-parity-cleanup | packages/utils | Same BasePlugin annotation/cast smell found and removed. | Keep inferred export. |
| `packages/utils/src/react/plugins/BlockPlaceholderPlugin.tsx` | 2 | main-parity-cleanup | packages/utils | PlatePlugin export annotation was unnecessary; typecheck passed after removal. | Keep inferred export. |
| `.agents/rules/plate-next.mdc` | 2 | main-parity-cleanup | plate-next | Rule did not forbid plugin result annotations/casts. | Keep new rule. |
| `docs/plans/templates/plate-next.md` | 2 | main-parity-cleanup | plate-next | Template did not include plugin export inference audit. | Keep new checklist. |

Verification evidence:
- `rg -n "export const .*: (BasePlugin|PlatePlugin)<|\\) as (BasePlugin|PlatePlugin)<" packages/utils/src`: no matches after patch.
- `pnpm turbo typecheck --filter=./packages/utils`: passed.
- `pnpm --filter @platejs/utils test`: passed, 57 tests.
- `pnpm --filter @platejs/utils build`: passed.
- `pnpm prepare`: passed and regenerated skill mirrors.
- `pnpm install`: passed, workspace already up to date.
- `rg -n "plugin export inference|BasePlugin<Config>|PlatePlugin<Config>|builder/generic owner|plugin export annotations" .agents/rules/plate-next.mdc .agents/skills/plate-next/SKILL.md docs/plans/templates/plate-next.md`: found source/template/generated rule.
- `pnpm --filter @platejs/utils lint:fix`: fixed formatting only.
- `pnpm check:core`: passed; Core 703 tests, Plite 1900 pass / 85 skip, Utils 57 tests.

Changed list:
- `.agents/rules/plate-next.mdc`: added plugin export inference law and scoring suspicion.
- `.agents/skills/plate-next/SKILL.md`: regenerated mirror.
- `docs/plans/templates/plate-next.md`: added plugin export inference audit.
- `docs/plans/2026-07-05-plate-next-plugin-export-inference-law.md`: recorded plan/evidence.
- `packages/utils/src/lib/plugins/normalize-types/NormalizeTypesPlugin.ts`: removed `BasePlugin<NormalizeTypesConfig>` result annotation and cast.
- `packages/utils/src/lib/plugins/trailing-block/TrailingBlockPlugin.ts`: removed `BasePlugin<TrailingBlockConfig>` result annotation and cast.
- `packages/utils/src/react/plugins/BlockPlaceholderPlugin.tsx`: removed `PlatePlugin<BlockPlaceholderConfig>` result annotation.

Needs attention:
- No immediate blocker. Broad Core may still contain intentional exported boundary types; this packet only audited and cleaned the scoped Utils smell.

Open risks:
- None known. The exact Utils audit is clean and shared proof passed.

Reboot status:
- Current thread completed the scoped repair; no handoff needed.
