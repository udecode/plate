# plate-next extension key api cut

Objective:
Cut the Plate-facing extension `name` escape hatch for secondary plugin extensions; use plugin-scoped extension keys instead.

Goal plan:
docs/plans/2026-07-01-plate-next-extension-key-api-cut.md

Primary template:
docs/plans/templates/plate-next.md

Applied packs:
- none

Flow mode:
one-shot execution

Explicit requirements:
- User likes the architecture where Plite owns `dom` and Plate DOM adds product behavior on top.
- User wants the breaking change that makes this perfect.
- User allowed cutting anything needed.
- Do not preserve legacy compatibility if it conflicts with the clean Plate/Plite boundary.
- Avoid collision workaround strings like `name: 'core-dom'`.

Completion threshold:
- Plate plugin `.extendExtension(extension)` remains primary extension DX and derives the plugin key.
- Plate plugin `.extendExtension('subKey', extension)` creates a plugin-scoped secondary extension identity.
- `DOMPlugin` uses `extendExtension('autoScroll', ...)`, not `name: 'core-dom'`.
- Same-key secondary extension pieces merge before Plite install.
- Core source audit finds no `core-dom` or single-item `extendExtension([ ... ])` leftovers in Core.
- Focused Core tests, Core typecheck, and touched-file lint pass.
- `node .agents/skills/autogoal/scripts/check-complete.mjs docs/plans/2026-07-01-plate-next-extension-key-api-cut.md` passes.

Verification surface:
- `pnpm --filter @platejs/core exec bun test src/lib/plugin/createBasePlugin.spec.ts src/lib/plugins/dom/DOMPlugin.spec.ts`
- `pnpm --filter @platejs/core exec bun test ./src/react/components/Plate.slow.tsx`
- `pnpm --filter @platejs/core typecheck`
- `pnpm exec biome check packages/core/src/lib/plugin/BasePlugin.ts packages/core/src/lib/plugin/createBasePlugin.ts packages/core/src/lib/plugin/createBasePlugin.spec.ts packages/core/src/lib/plugins/dom/DOMPlugin.ts packages/core/src/react/components/Plate.slow.tsx`
- `rg -n "name: 'core-dom'|name: \"core-dom\"|core-dom|extendExtension\\(\\{\\s*name:|extendExtension\\(\\[" packages/core/src packages/core/type-tests -g '*.ts' -g '*.tsx'`

Constraints:
- Plate owns product plugin composition.
- Plite owns raw editor extensions and still accepts raw `defineEditorExtension(...)`.
- Do not rename raw Plite extension `name` in this packet.
- Do not run a broad Core sweep; this is a named API packet.
- No public compatibility alias.

Boundaries:
- Allowed edit scope: `packages/core/src/lib/plugin/**`, `packages/core/src/lib/plugins/dom/**`, directly affected Core tests.
- Docs/browser surfaces: N/A, no public docs touched.
- `pnpm brl`: N/A, no export/barrel change.
- Out-of-scope package errors: N/A, focused Core proof passed.

Output budget strategy:
- Focused `sed` reads for owner files.
- Focused `rg` source audits with capped output.
- No broad generated output or full repo test streaming.

Blocked condition:
- Blocked only if TypeScript cannot infer API/tx groups through the keyed overload without requiring a Plate wrapper or `any` at the call site. Not blocked.

Phase / pass table:
| Phase | Status | Evidence | Next |
|-------|--------|----------|------|
| Requirements capture | done | Explicit requirements copied above | none |
| API design | done | `extendExtension(extension)` primary, `extendExtension('subKey', extension)` secondary | keep |
| Runtime normalization | done | plugin key + subkey normalizes to `pluginKey:subKey` | keep |
| DOM migration | done | `DOMPlugin.extendExtension('autoScroll', ...)` | keep |
| Test cleanup | done | Single-item extension array removed from `Plate.slow.tsx`; stale Plite assertions repaired | keep |
| Verification | done | Proof table below | none |

Start Gates:
| Gate | Applies | Evidence |
|------|---------|----------|
| Prompt requirements captured before work | yes | Explicit requirements section |
| `plate-next` skill/rule read | yes | Active context and packet follows Plate/Plite boundary law |
| Active goal checked or created | yes | Goal created for this plan |
| Mode classified | yes | Named API packet |
| Broad Core drift ledger initialized when in scope | N/A | Not a broad Core sweep |
| Public API fork routing checked | yes | User accepted breaking change in current thread |

Work Checklist:
- [x] First checkpoint complete: explicit prompt requirements copied into this plan.
- [x] Mode classified: named API packet.
- [x] Best Plate v2 call recorded for every reviewed target.
- [x] Legacy/backcompat decision recorded: no `core-dom` compatibility workaround kept.
- [x] Hack check recorded: no fake extension name, no fake DOM plugin token.
- [x] Gap ledger updated: no Plite/Plate gap blocks this packet.
- [x] Related Core sweep row added.
- [x] Review matrix filled.
- [x] Focused package proof run.
- [x] `pnpm brl` N/A recorded.
- [x] Old compatibility names source-audited.
- [x] Changed list and needs-attention rows filled.
- [x] Output budget discipline followed.

Review matrix:
| Path / API | Drift score | Verdict | Owner | Evidence | Next |
|------------|-------------|---------|-------|----------|------|
| `BasePlugin.extendExtension` | 0 | main-parity-cleanup | Plate plugin API | Adds keyed overload while preserving primary extension inference | keep |
| `normalizePlateEditorExtensions` | 0 | main-parity-cleanup | Plate plugin API | `pluginKey:subKey` identity replaces fake `name` strings | keep |
| `DOMPlugin` | 0 | keep-in-plate | Plate DOM product behavior | Auto-scroll now lives under `dom:autoScroll` secondary extension | keep |
| `createBasePlugin.spec.ts` | 0 | proof | Core tests | Locks plugin-scoped secondary keys and repeated-key merge | keep |
| `Plate.slow.tsx` | 1 | main-parity-cleanup | Core React tests | Removed single-item extension array; updated stale Plite expectations found by focused test | keep |

Best Plate v2 recommendation:
| Target | Recommended shape | Rejected alternatives | Reason | User-review need |
|--------|-------------------|----------------------|--------|------------------|
| Plate plugin extensions | `.extendExtension(extension)` for primary, `.extendExtension('subKey', extension)` for secondary | `name: 'core-dom'`, array disambiguation for one extension, fake DOM plugin constants | Plugin key should own identity; secondary product behavior should be namespaced under plugin key | low |

Plite / Plate gap ledger:
| Gap type | Missing capability | Decision |
|----------|--------------------|----------|
| none | none | No blocker |
| deferred | Raw Plite `EditorExtension.name` still exists | Leave for a separate Plite API design packet; this packet only cuts Plate-facing workaround |

Related Core sweep ledger:
| Trigger correction | Sweep query / method | Matches | Patched | Deferred | Remaining risk |
|--------------------|----------------------|---------|---------|----------|----------------|
| `core-dom` removal | `core-dom|name: 'core-dom'|name: "core-dom"` | 0 after patch | 1 | 0 | none |
| Plate extension array cleanup | `extendExtension\\(\\[` | 0 after patch | 1 | 0 | none |
| Plate-facing explicit extension `name` | `extendExtension\\(\\{\\s*name:` | 0 after patch | 0 | raw `defineEditorExtension` names remain | low |

Verification evidence:
- `pnpm --filter @platejs/core exec bun test src/lib/plugin/createBasePlugin.spec.ts src/lib/plugins/dom/DOMPlugin.spec.ts` -> 28 pass.
- `pnpm --filter @platejs/core exec bun test ./src/react/components/Plate.slow.tsx` -> 24 pass.
- `pnpm --filter @platejs/core typecheck` -> pass.
- `pnpm exec biome check packages/core/src/lib/plugin/BasePlugin.ts packages/core/src/lib/plugin/createBasePlugin.ts packages/core/src/lib/plugin/createBasePlugin.spec.ts packages/core/src/lib/plugins/dom/DOMPlugin.ts packages/core/src/react/components/Plate.slow.tsx` -> pass.
- Source audit for `core-dom`, Plate-facing explicit extension `name`, and `extendExtension([` -> no matches in `packages/core/src` / `packages/core/type-tests`.

Changed files:
- `packages/core/src/lib/plugin/BasePlugin.ts`
- `packages/core/src/lib/plugin/createBasePlugin.ts`
- `packages/core/src/lib/plugin/createBasePlugin.spec.ts`
- `packages/core/src/lib/plugins/dom/DOMPlugin.ts`
- `packages/core/src/react/components/Plate.slow.tsx`
- `docs/plans/2026-07-01-plate-next-extension-key-api-cut.md`

Needs attention:
- Later optional Plite API packet: rename raw `EditorExtension.name` to `key`. Not part of this Plate-facing cut.

Current verdict:
- verdict: keep
- confidence: high
- next owner: Plite API design only if you want to hard-rename raw extension identity too.
- keep / revert / quarantine call: keep
- reason: Plate product behavior now composes over Plite DOM with a plugin-scoped extension key instead of a collision workaround.

Completion Gates:
| Gate | Applies | Required action | Evidence |
|------|---------|-----------------|----------|
| Named verification threshold | yes | Run focused Core proof | passed |
| Broad Core drift ledger coverage | N/A | Not broad Core sweep | N/A |
| Score gate | yes | All reviewed rows score below action threshold | passed |
| Best Plate v2 recommendation | yes | Record recommended API shape | done |
| Plite/Plate gap ledger | yes | Record blockers or N/A | no blocker |
| Related Core sweep after correction | yes | Run same-class search | no remaining matches |
| Package/API proof | yes | Focused tests/typecheck/lint | passed |
| Source audit | yes | Audit old names/patterns | passed |
| Rename ledger | N/A | No postponed rename in this packet | N/A |
| Extracted-file inventory | N/A | No extracted file topology change | N/A |
| Autoreview / review | N/A | Narrow API packet with focused tests/typecheck | N/A |
| Final lint/check | yes | Touched-file lint | passed |
| Changed list / top drift / needs attention | yes | Filled above | done |
| Goal plan complete | yes | Run check-complete | passed |

Reboot status:
| Where am I? | Where am I going? | What is the goal? | What learned? | What done? |
|-------------|-------------------|-------------------|---------------|------------|
| Closing packet | Run final goal checker | Plate extension key API cut | Secondary Plate extensions should be keyed under plugin identity | Code, tests, audit, proof complete |

Open risks:
- Raw Plite extension identity still uses `name`; separate Plite API decision if desired.
