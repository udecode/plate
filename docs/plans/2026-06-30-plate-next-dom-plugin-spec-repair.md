# plate-next dom plugin spec repair

Objective:
Repair `packages/core/src/lib/plugins/dom/DOMPlugin.spec.ts` so it tests the Core DOM plugin without React setup, raw Plite extension boilerplate, explicit tx annotations, or helper indirection.

Completion threshold:
- Named-file Plate Next packet, not broad Core sweep.
- Remove `defineEditorExtension`, `EditorUpdateTransaction`, `createRuntimeDomEditor`, and `installScrollSpy` from the spec.
- Use `createBaseEditor` for Core DOM plugin tests.
- Use `createBasePlugin(...).extendEditorApi(...)` for the test scroll service.
- Keep tx callback types inferred.
- DOM spec, Core typecheck, and Core lint pass.
- Source audit confirms the removed test-only helpers/imports are gone from the spec.
- `node .agents/skills/autogoal/scripts/check-complete.mjs docs/plans/2026-06-30-plate-next-dom-plugin-spec-repair.md` passes.

Verification surface:
- `pnpm --filter @platejs/core exec bun test src/lib/plugins/dom/DOMPlugin.spec.ts`
- `pnpm --filter @platejs/core typecheck`
- `pnpm --filter @platejs/core lint`
- `rg -n "defineEditorExtension|EditorUpdateTransaction|createRuntimeDomEditor|installScrollSpy|as any|as unknown" packages/core/src/lib/plugins/dom/DOMPlugin.spec.ts`
- `git ls-files --others --exclude-standard packages/core/src/lib/plugins/dom | sort`

Constraints:
- Use `plate-next` review mode.
- Preserve behavior; do not restore old `editor.tf` / `getTransforms` APIs from main.
- No fake casts or explicit callback parameter types in tests.
- No React editor dependency for a Core DOM plugin spec.
- No broad Core sweep in this packet.

Boundaries:
- Allowed edit scope: `packages/core/src/lib/plugins/dom/DOMPlugin.spec.ts` and this plan.
- Target surface: DOM plugin unit spec.
- Non-goals: runtime API redesign, broad Core sweep, docs.
- Browser proof: N/A, no route/UI changed.
- Out-of-scope package errors: N/A, focused Core commands stayed green.

Blocked condition:
- None.

Phase / pass table:
| Phase | Status | Evidence |
|-------|--------|----------|
| Checkpoint zero | done | Prompt copied: repair `DOMPlugin.spec.ts` |
| Source comparison | done | Compared current spec against `origin/main` to identify migrated helper/cast drift |
| Implementation | done | Switched to `createBaseEditor`; removed raw Plite extension helper and explicit tx annotation |
| Correction sweep | done | Spec audit for removed helpers/imports/casts returned zero matches |
| Proof | done | DOM spec, Core typecheck, and Core lint passed |

Start Gates:
| Gate | Applies | Evidence |
|------|---------|----------|
| Prompt requirements captured before work | yes | Target file recorded |
| `plate-next` skill/rule read | yes | `.agents/skills/plate-next/SKILL.md` read |
| Active goal checked or created | yes | This plan |
| Mode classified as named packet vs broad Core sweep | yes | Named-file packet; broad Core sweep N/A |
| Review target recorded as best Plate v2 / Plite-fit / no legacy compat | yes | Constraints and recommendation table |
| Related Core sweep policy checked | yes | Same-file helper/cast audit recorded |

Work Checklist:
- [x] First checkpoint complete: explicit target, scope, non-goals, proof, and handoff recorded.
- [x] Mode classified: named file/API packet.
- [x] Best Plate v2 call recorded for the reviewed target.
- [x] Legacy/backcompat decision recorded.
- [x] Hack check recorded: no raw Plite extension helper, explicit tx annotation, or cast kept.
- [x] Gap ledger updated.
- [x] Related Core sweep row added with query, match count, patched count, deferred count, and remaining risk.
- [x] Broad Core sweep marked N/A.
- [x] Review matrix filled for inspected file/helper.
- [x] Focused package proof run.
- [x] Removed names source-audited.
- [x] Changed list and next owner filled.

Completion Gates:
| Gate | Applies | Required action | Evidence |
|------|---------|-----------------|----------|
| Named verification threshold | yes | Run focused DOM spec plus Core typecheck/lint | All commands passed |
| Broad Core drift ledger coverage | no | Not a broad Core sweep | N/A |
| Score gate | yes | Score target and same-file helper drift | Target score 0 after cleanup |
| Best Plate v2 recommendation | yes | Record recommended current shape and rejected hacks | See recommendation table |
| Plite/Plate gap ledger | yes | Record blockers or N/A | No gap |
| Related Core sweep after correction | yes | Run same-file helper/cast audit | Zero matches |
| Package/API proof | yes | Run Core proof | DOM spec, typecheck, lint passed |
| Source audit | yes | Run exact audit for removed helpers/imports/casts | Zero matches |
| Extracted-file inventory | yes | Check DOM plugin scope for untracked files | Zero rows |
| Final lint/check | yes | Run scoped lint/typecheck | Passed |
| Goal plan complete | yes | Run check-complete | Pending final command |

Review matrix:
| Path / API | Drift score | Verdict | Owner | Evidence | Next |
|------------|-------------|---------|-------|----------|------|
| `packages/core/src/lib/plugins/dom/DOMPlugin.spec.ts` | 0 | main-parity-cleanup | DOMPlugin | Core plugin spec now uses `createBaseEditor`, inferred tx callbacks, and Plate plugin API extension for scroll service | keep |

Best Plate v2 recommendation:
| Target | Recommended shape | Rejected legacy/hack alternatives | Reason | User-review need |
|--------|-------------------|-----------------------------------|--------|------------------|
| DOM plugin spec setup | Inline `createBaseEditor` setup and test scroll service via `createBasePlugin(...).extendEditorApi(...)` | React `createPlateEditor`, raw `defineEditorExtension`, explicit `EditorUpdateTransaction`, `as any` | This is a Core DOM plugin spec; it should exercise Core plugin APIs with inferred types | Low |

Plite / Plate gap ledger:
| Gap type | Missing capability | Why local workaround is a hack | Smallest owner | Proof needed | Decision |
|----------|--------------------|-------------------------------|----------------|--------------|----------|
| N/A | None | No workaround needed | N/A | DOM spec and Core typecheck | No blocker |

Related Core sweep ledger:
| Trigger correction | Sweep query / method | Matches | Patched | Deferred | Remaining risk |
|--------------------|----------------------|---------|---------|----------|----------------|
| Removed migrated DOM spec helpers/imports/casts | `rg -n "defineEditorExtension\|EditorUpdateTransaction\|createRuntimeDomEditor\|installScrollSpy\|as any\|as unknown" packages/core/src/lib/plugins/dom/DOMPlugin.spec.ts` | 0 after patch | 1 file | 0 | none in this spec |

Extracted file ledger:
| Path | Bucket | Origin/main owner check | Decision | Proof |
|------|--------|-------------------------|----------|-------|
| N/A | N/A | `git ls-files --others --exclude-standard packages/core/src/lib/plugins/dom` returned zero rows | no extracted DOM files | command passed |

Changed list:
| Group | Current-run changes |
|-------|---------------------|
| tests/proof | `DOMPlugin.spec.ts` switched to non-React `createBaseEditor`, inline setup, inferred tx callbacks |
| code/runtime/API | none |
| docs/plans | this plan updated |
| reverted/quarantined packets | none |

Needs your attention:
| Rank | Item | Why | Anchor | Recommendation |
|------|------|-----|--------|----------------|
| N/A | None | Spec is simpler and green | N/A | continue next file review |

Findings:
- The spec drifted from a Core plugin test into React editor setup.
- The explicit `EditorUpdateTransaction` annotation and raw `defineEditorExtension` were not needed.

Decisions and tradeoffs:
- Duplicated tiny editor setup in the two behavior tests instead of hiding it behind helpers, because this is review-mode API proof.
- Kept the shared `value` constant because it is simple fixture data reused by all rows.

Error attempts:
| Error / failed attempt | Count | Next different move | Resolution |
|------------------------|-------|---------------------|------------|
| None | 0 | N/A | N/A |

Verification evidence:
- `pnpm --filter @platejs/core exec bun test src/lib/plugins/dom/DOMPlugin.spec.ts`: 3 pass.
- `pnpm --filter @platejs/core typecheck`: pass.
- `pnpm --filter @platejs/core lint`: pass.
- Removed helper/import/cast audit: zero matches.
- DOM extracted-file inventory: zero rows.

Final handoff contract:
- target surface and mode: named-file Plate Next spec repair.
- files/APIs reviewed: `DOMPlugin.spec.ts`, current `DOMPlugin.ts`, `origin/main` DOM spec.
- broad Core drift score coverage: N/A.
- best Plate v2 recommendation: Core DOM spec should use base editor and plugin API extension, not React/raw Plite test plumbing.
- verdict matrix summary: one `main-parity-cleanup`.
- Plite/Plate gaps or blockers: none.
- related Core sweep query/matches/patched/deferred: same-file helper/cast audit, zero matches after patch, one file patched, zero deferred.
- changes made: listed above.
- tests/proof commands: listed above.
- old compatibility names audited: raw extension helper, explicit tx type, casts.
- needs attention: none for this packet.
- next best Plate Next packet: continue one-by-one review of Core specs with explicit callback types or raw Plite extension helpers.

Reboot status:
| Question | Answer |
|----------|--------|
| Where am I? | Completed named-file DOM spec cleanup |
| Where am I going? | Handoff after final check-complete |
| What is the goal? | Repair `DOMPlugin.spec.ts` shape without behavior change |
| What have I learned? | The spec did not need React or raw Plite extension setup |
| What have I done? | Switched to base editor setup and inferred tx callbacks; proved Core green |

Timeline:
- 2026-06-30 Goal plan created.
- 2026-07-01 Compared current and main DOM specs.
- 2026-07-01 Repaired spec and ran focused proof.

Open risks:
- None for this packet.
