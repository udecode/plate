# plate-next override plugin repair

Objective:
Repair `packages/core/src/lib/plugins/override/OverridePlugin.ts` so plugin node override behavior stays owned by `OverridePlugin`, uses Plite element specs directly, and keeps no `createPlateElementSpecsExtension` helper.

Completion threshold:
- Named-file Plate Next packet, not broad Core sweep.
- Keep `OverridePlugin` name/key/owner from `origin/main`.
- Remove the one-use migration factory `createPlateElementSpecsExtension`.
- Do not create `createPlateElementSpecsExtension`, `installPlateElementSpecsExtension`, or a renamed equivalent helper.
- Prove plugin node flags still install into Plite schema.
- Sweep the same helper/name pattern across Core/Plite source.
- `node .agents/skills/autogoal/scripts/check-complete.mjs docs/plans/2026-06-30-plate-next-override-plugin-repair.md` passes.

Verification surface:
- `pnpm --filter @platejs/core exec bun test src/lib/editor/withPlite.spec.ts --test-name-pattern "installs plugin node selection flags through OverridePlugin"`
- `pnpm --filter @platejs/core exec bun test src/lib/editor/withPlite.spec.ts`
- `pnpm --filter @platejs/core typecheck`
- `pnpm --filter @platejs/core lint`
- `rg -n "createPlateElementSpecsExtension|createPlateElementSpec|plate:element-specs:plite|installPlateElementSpecsExtension" packages/core/src packages/core/type-tests packages/plite/src -g '*.ts' -g '*.tsx'`
- `git ls-files --others --exclude-standard packages/core/src/lib/plugins/override | sort`

Constraints:
- Use `plate-next` review mode.
- Best Plate v2 shape wins; no legacy compat alias/shim.
- Main is evidence for owner/name, not a command to preserve old APIs.
- No helper dumps, bridge dumps, `any` casts, or duplicate Plate wrapper around Plite.
- Rename freeze applies; do not rename `OverridePlugin`.
- If Plite lacks required substrate, record a Plite gap instead of a workaround.

Boundaries:
- Allowed edit scope: `packages/core/src/lib/plugins/override/OverridePlugin.ts` and this plan.
- Target surface: Core `OverridePlugin` node override behavior.
- Non-goals: broad Core sweep, public API rename pass, package migration, docs.
- Browser proof: N/A, no user-visible route changed.
- Out-of-scope package errors: N/A, focused Core commands stayed green.

Blocked condition:
- None. Plate `extendExtension` normalizes unnamed extension objects into named
  Plite extensions using the plugin key.

Phase / pass table:
| Phase | Status | Evidence |
|-------|--------|----------|
| Checkpoint zero | done | Prompt copied: repair `OverridePlugin.ts`, no `createPlateElementSpecsExtension`; named-file packet, not broad sweep |
| Source comparison | done | Compared current file against `origin/main:packages/core/src/lib/plugins/override/OverridePlugin.ts` |
| Implementation | done | Removed one-use factory and inlined element-spec installation under `OverridePlugin.extendExtension` |
| Correction sweep | done | Deleted helper/name audit returned zero matches |
| Proof | done | Focused spec, full `withPlite.spec.ts`, Core typecheck, and Core lint passed |

Start Gates:
| Gate | Applies | Evidence |
|------|---------|----------|
| Prompt requirements captured before work | yes | Target file and "no createPlateElementSpecsExtension" recorded in this plan |
| `plate-next` skill/rule read | yes | `.agents/skills/plate-next/SKILL.md` read before final patch/proof |
| Active goal checked or created | yes | `docs/plans/2026-06-30-plate-next-override-plugin-repair.md` |
| Mode classified as named packet vs broad Core sweep | yes | Named-file packet; broad Core sweep explicitly N/A |
| Review target recorded as best Plate v2 / Plite-fit / no legacy compat | yes | Constraints and recommendation sections |
| Related Core sweep policy checked | yes | Deleted helper/name audit recorded below |

Work Checklist:
- [x] First checkpoint complete: explicit target, scope, non-goals, proof, and handoff recorded.
- [x] Mode classified: named file/API packet.
- [x] Best Plate v2 call recorded for the reviewed target.
- [x] Legacy/backcompat decision recorded.
- [x] Hack check recorded: no bridge/helper dump kept.
- [x] Gap ledger updated.
- [x] Related Core sweep row added with query, match count, patched count, deferred count, and remaining risk.
- [x] Broad Core sweep marked N/A.
- [x] Review matrix filled for inspected file/helper.
- [x] Focused package proof run.
- [x] Old compatibility/helper names audited.
- [x] Changed list and next owner filled.

Completion Gates:
| Gate | Applies | Required action | Evidence |
|------|---------|-----------------|----------|
| Named verification threshold | yes | Run focused behavior proof plus Core typecheck/lint | All commands passed |
| Broad Core drift ledger coverage | no | Not a broad Core sweep | N/A |
| Score gate | yes | Score target and same-class helper drift | `OverridePlugin.ts` score 0 after cleanup; no remaining same-class helper |
| Best Plate v2 recommendation | yes | Record recommended current shape and rejected hacks | See recommendation table |
| Plite/Plate gap ledger | yes | Record blockers or N/A | No gap |
| Related Core sweep after correction | yes | Run same-class Core/Plite source audit | Zero matches for deleted names |
| Package/API proof | yes | Run Core proof | Focused tests, typecheck, lint passed |
| Source audit | yes | Run exact audit for removed helper names | Zero matches |
| Extracted-file inventory | yes | Check override scope for untracked files | Zero rows |
| Final lint/check | yes | Run scoped lint/typecheck | Passed |
| Goal plan complete | yes | Run check-complete | Pending final command |

Review matrix:
| Path / API | Drift score | Verdict | Owner | Evidence | Next |
|------------|-------------|---------|-------|----------|------|
| `packages/core/src/lib/plugins/override/OverridePlugin.ts` | 0 | main-parity-cleanup | Core OverridePlugin | Owner/name kept; Plite element specs returned inline through `extendExtension`; old factory and explicit `plate:*` name gone | keep |

Best Plate v2 recommendation:
| Target | Recommended shape | Rejected legacy/hack alternatives | Reason | User-review need |
|--------|-------------------|-----------------------------------|--------|------------------|
| `OverridePlugin` node behavior | Keep `OverridePlugin`; return an unnamed extension object so Plate derives the extension name from the plugin key | `createPlateElementSpecsExtension`, `installPlateElementSpecsExtension`, explicit `name: 'plate:override'`, bridge-file installer, rename pass | This is still the main owner for plugin node override behavior; Plate owns plugin-derived extension naming; Plite owns schema registration | Low |

Plite / Plate gap ledger:
| Gap type | Missing capability | Why local workaround is a hack | Smallest owner | Proof needed | Decision |
|----------|--------------------|-------------------------------|----------------|--------------|----------|
| N/A | None | Plite already supports extension element specs | N/A | Existing Core spec | No blocker |

Related Core sweep ledger:
| Trigger correction | Sweep query / method | Matches | Patched | Deferred | Remaining risk |
|--------------------|----------------------|---------|---------|----------|----------------|
| Removed `createPlateElementSpecsExtension` and one-use spec helper | `rg -n "createPlateElementSpecsExtension\|createPlateElementSpec\|plate:element-specs:plite\|installPlateElementSpecsExtension" packages/core/src packages/core/type-tests packages/plite/src -g '*.ts' -g '*.tsx'` | 0 after patch | 1 file | 0 | none for this helper class |

Extracted file ledger:
| Path | Bucket | Origin/main owner check | Decision | Proof |
|------|--------|-------------------------|----------|-------|
| N/A | N/A | `git ls-files --others --exclude-standard packages/core/src/lib/plugins/override` returned zero rows | no extracted override files | command passed |

Changed list:
| Group | Current-run changes |
|-------|---------------------|
| code/runtime/API | `OverridePlugin.ts` now inlines Plite element spec extension installation; no `createPlateElementSpecsExtension` |
| tests/proof | No test file changes; existing behavior spec covers node flags |
| docs/plans | This plan updated |
| reverted/quarantined packets | none |

Needs your attention:
| Rank | Item | Why | Anchor | Recommendation |
|------|------|-----|--------|----------------|
| N/A | None | `OverridePlugin` now relies on plugin-derived extension naming | `OverridePlugin.ts` | no review needed for this packet |

Findings:
- `origin/main` owned this behavior in `OverridePlugin`; current Plite migration should keep that owner.
- The removed factory was review noise, not needed substrate.

Decisions and tradeoffs:
- Inlined the one-use spec conversion because repo guidance prefers inline when used once.
- Removed `defineEditorExtension` at this Plate call site because it forces an
  explicit `name`; `extendExtension` should do the Plate-side normalization.

Error attempts:
| Error / failed attempt | Count | Next different move | Resolution |
|------------------------|-------|---------------------|------------|
| None | 0 | N/A | N/A |

Verification evidence:
- `pnpm --filter @platejs/core exec bun test src/lib/editor/withPlite.spec.ts --test-name-pattern "installs plugin node selection flags through OverridePlugin"`: 1 pass.
- `pnpm --filter @platejs/core exec bun test src/lib/editor/withPlite.spec.ts`: 25 pass.
- `pnpm --filter @platejs/core typecheck`: pass.
- `pnpm --filter @platejs/core exec bun test src/lib/plugin/createBasePlugin.spec.ts --test-name-pattern "adds editor extensions with plugin-derived names|keeps explicit editor extension names"`: 2 pass.
- `pnpm --filter @platejs/core lint`: pass.
- Deleted helper/name audit: zero matches.
- Override extracted-file inventory: zero rows.

Final handoff contract:
- target surface and mode: named-file Plate Next review packet.
- files/APIs reviewed: `OverridePlugin.ts`, old main `withOverrides` ownership, Plite extension element spec registration.
- broad Core drift score coverage: N/A.
- best Plate v2 recommendation: keep owner; inline Plite-native implementation; no factory/helper.
- verdict matrix summary: one `main-parity-cleanup`.
- Plite/Plate gaps or blockers: none.
- related Core sweep query/matches/patched/deferred: deleted helper audit, zero matches after patch, one file patched, zero deferred.
- changes made: listed above.
- tests/proof commands: listed above.
- old compatibility names audited: `createPlateElementSpecsExtension`, `createPlateElementSpec`, `plate:element-specs:plite`, `installPlateElementSpecsExtension`.
- needs attention: none for this packet.
- next best Plate Next packet: continue one-by-one review of Core plugin files still showing migration drift.

Reboot status:
| Question | Answer |
|----------|--------|
| Where am I? | Completed named-file OverridePlugin cleanup |
| Where am I going? | Handoff after final check-complete |
| What is the goal? | Remove `createPlateElementSpecsExtension` without changing behavior |
| What have I learned? | Plite element specs are sufficient; no bridge/helper gap |
| What have I done? | Inlined element spec installation under `OverridePlugin`; proved behavior |

Timeline:
- 2026-06-30T22:29:25.653Z Goal plan created.
- 2026-07-01 OverridePlugin owner compared with `origin/main`.
- 2026-07-01 Removed factory/helper and ran focused proof.

Open risks:
- None for this packet.
