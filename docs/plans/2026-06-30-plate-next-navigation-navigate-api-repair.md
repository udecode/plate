# plate-next navigation navigate api repair

Objective:
Repair `packages/core/src/lib/plugins/navigation-feedback/transforms/navigate.ts` by deleting the local `NavigationRuntimeApi` cast and moving the missing `dom.focus` type to the DOM plugin API owner.

Completion threshold:
- Named-file Plate Next packet, not broad Core sweep.
- Remove `NavigationRuntimeApi`.
- `navigate` calls typed Core APIs directly: `editor.api.dom.focus?.()` and `editor.api.scrollIntoView?.()`.
- DOM focus service is typed in `DomConfig['api']`, not patched locally in navigation.
- Focused navigation and DOM plugin tests pass.
- Core typecheck and lint pass.
- Same-class local runtime API casts are source-audited.
- `node .agents/skills/autogoal/scripts/check-complete.mjs docs/plans/2026-06-30-plate-next-navigation-navigate-api-repair.md` passes.

Verification surface:
- `pnpm --filter @platejs/core exec bun test src/lib/plugins/navigation-feedback/NavigationFeedbackPlugin.spec.ts`
- `pnpm --filter @platejs/core exec bun test src/lib/plugins/dom/DOMPlugin.spec.ts`
- `pnpm --filter @platejs/core typecheck`
- `pnpm --filter @platejs/core lint`
- `rg -n "type .*RuntimeApi|BaseEditor\\['api'\\] &|as .*RuntimeApi|dom\\?: BaseEditor\\['api'\\]\\['dom'\\]" packages/core/src packages/core/type-tests -g '*.ts' -g '*.tsx'`
- `git ls-files --others --exclude-standard packages/core/src/lib/plugins/navigation-feedback packages/core/src/lib/plugins/dom | sort`

Constraints:
- Use `plate-next` review mode.
- Main is evidence for behavior and owner, not a reason to keep old `editor.tf` / `editor.api` compatibility.
- No local type helper/cast to compensate for weak Core API typing.
- Plate owns product/plugin APIs; DOM plugin owns DOM service typing.
- No renames or broad Core sweep in this packet.

Boundaries:
- Allowed edit scope: `packages/core/src/lib/plugins/navigation-feedback/transforms/navigate.ts`, `packages/core/src/lib/plugins/dom/DOMPlugin.ts`, and this plan.
- Target surface: Core navigation feedback transform and DOM plugin API typing.
- Non-goals: broad Core sweep, docs, package migration.
- Browser proof: N/A, no route/UI changed.
- Out-of-scope package errors: N/A, focused Core commands stayed green.

Blocked condition:
- None. The missing capability was a Core DOM plugin type gap, not a Plite substrate blocker.

Phase / pass table:
| Phase | Status | Evidence |
|-------|--------|----------|
| Checkpoint zero | done | Prompt copied: repair `navigate.ts`, remove `NavigationRuntimeApi` smell |
| Source comparison | done | Compared current file with `origin/main` navigate behavior |
| Implementation | done | Added optional `dom.focus` to `DomConfig['api']`; removed local runtime API alias/cast |
| Correction sweep | done | Same-class local runtime API cast audit returned zero matches |
| Proof | done | Navigation tests, DOM tests, Core typecheck, and Core lint passed |

Start Gates:
| Gate | Applies | Evidence |
|------|---------|----------|
| Prompt requirements captured before work | yes | Target file and exact bad type recorded |
| `plate-next` skill/rule read | yes | `.agents/skills/plate-next/SKILL.md` read |
| Active goal checked or created | yes | This plan |
| Mode classified as named packet vs broad Core sweep | yes | Named-file packet; broad Core sweep N/A |
| Review target recorded as best Plate v2 / Plite-fit / no legacy compat | yes | Constraints and recommendation table |
| Related Core sweep policy checked | yes | Same-class type-helper/cast audit recorded |

Work Checklist:
- [x] First checkpoint complete: explicit target, scope, non-goals, proof, and handoff recorded.
- [x] Mode classified: named file/API packet.
- [x] Best Plate v2 call recorded for the reviewed target.
- [x] Legacy/backcompat decision recorded.
- [x] Hack check recorded: no local API cast/helper kept.
- [x] Gap ledger updated.
- [x] Related Core sweep row added with query, match count, patched count, deferred count, and remaining risk.
- [x] Broad Core sweep marked N/A.
- [x] Review matrix filled for inspected file/helper.
- [x] Focused package proof run.
- [x] Old compatibility/helper names source-audited.
- [x] Changed list and next owner filled.

Completion Gates:
| Gate | Applies | Required action | Evidence |
|------|---------|-----------------|----------|
| Named verification threshold | yes | Run focused behavior proof plus Core typecheck/lint | All commands passed |
| Broad Core drift ledger coverage | no | Not a broad Core sweep | N/A |
| Score gate | yes | Score target and same-class helper drift | Target score 0 after cleanup; no remaining same-class helper |
| Best Plate v2 recommendation | yes | Record recommended current shape and rejected hacks | See recommendation table |
| Plite/Plate gap ledger | yes | Record blockers or N/A | Core DOM type gap fixed |
| Related Core sweep after correction | yes | Run same-class Core source audit | Zero matches |
| Package/API proof | yes | Run Core proof | Focused tests, typecheck, lint passed |
| Source audit | yes | Run exact audit for removed helper/cast shape | Zero matches |
| Extracted-file inventory | yes | Check target scopes for untracked files | Zero rows |
| Final lint/check | yes | Run scoped lint/typecheck | Passed |
| Goal plan complete | yes | Run check-complete | Pending final command |

Review matrix:
| Path / API | Drift score | Verdict | Owner | Evidence | Next |
|------------|-------------|---------|-------|----------|------|
| `packages/core/src/lib/plugins/navigation-feedback/transforms/navigate.ts` | 0 | main-parity-cleanup | NavigationFeedbackPlugin | Local `NavigationRuntimeApi` removed; calls typed `editor.api` services directly | keep |
| `packages/core/src/lib/plugins/dom/DOMPlugin.ts` | 0 | Plate gap fixed | DOMPlugin | Optional `dom.focus` service belongs beside DOM state/services | keep |

Best Plate v2 recommendation:
| Target | Recommended shape | Rejected legacy/hack alternatives | Reason | User-review need |
|--------|-------------------|-----------------------------------|--------|------------------|
| `navigate` focus/scroll services | Use typed `editor.api.dom.focus?.()` and `editor.api.scrollIntoView?.()` | `NavigationRuntimeApi`, local intersection type, `as` cast, bridge helper | Navigation should consume Core API; DOM plugin should own DOM service typing | Low |

Plite / Plate gap ledger:
| Gap type | Missing capability | Why local workaround is a hack | Smallest owner | Proof needed | Decision |
|----------|--------------------|-------------------------------|----------------|--------------|----------|
| Plate gap | `DomConfig['api']` lacked optional `dom.focus` | Navigation cannot locally widen editor API without hiding owner typing drift | `DOMPlugin.ts` | DOM + navigation tests, Core typecheck | Fixed |

Related Core sweep ledger:
| Trigger correction | Sweep query / method | Matches | Patched | Deferred | Remaining risk |
|--------------------|----------------------|---------|---------|----------|----------------|
| Removed local runtime API cast/helper | `rg -n "type .*RuntimeApi\|BaseEditor\\['api'\\] &\|as .*RuntimeApi\|dom\\?: BaseEditor\\['api'\\]\\['dom'\\]" packages/core/src packages/core/type-tests -g '*.ts' -g '*.tsx'` | 0 after patch | 2 files | 0 | none for this helper class |

Extracted file ledger:
| Path | Bucket | Origin/main owner check | Decision | Proof |
|------|--------|-------------------------|----------|-------|
| N/A | N/A | `git ls-files --others --exclude-standard packages/core/src/lib/plugins/navigation-feedback packages/core/src/lib/plugins/dom` returned zero rows | no extracted files | command passed |

Changed list:
| Group | Current-run changes |
|-------|---------------------|
| code/runtime/API | `DOMPlugin.ts` types optional `dom.focus`; `navigate.ts` removed local runtime API cast/helper |
| tests/proof | No test file changes; existing DOM/navigation specs cover behavior |
| docs/plans | This plan updated |
| reverted/quarantined packets | none |

Needs your attention:
| Rank | Item | Why | Anchor | Recommendation |
|------|------|-----|--------|----------------|
| N/A | None | Owner typing is clean and proven | N/A | continue next file review |

Findings:
- `origin/main` selected, focused, scrolled, and flashed through old Slate APIs.
- The migrated file preserved behavior but hid missing DOM API typing in a local intersection type.

Decisions and tradeoffs:
- Fixed the owner API instead of adding a local cast.
- Kept focus optional because not every editor host has a focusable DOM runtime.

Error attempts:
| Error / failed attempt | Count | Next different move | Resolution |
|------------------------|-------|---------------------|------------|
| None | 0 | N/A | N/A |

Verification evidence:
- `pnpm --filter @platejs/core exec bun test src/lib/plugins/navigation-feedback/NavigationFeedbackPlugin.spec.ts`: 8 pass.
- `pnpm --filter @platejs/core exec bun test src/lib/plugins/dom/DOMPlugin.spec.ts`: 3 pass.
- `pnpm --filter @platejs/core typecheck`: pass.
- `pnpm --filter @platejs/core lint`: pass.
- Same-class runtime API cast audit: zero matches.
- Target extracted-file inventory: zero rows.

Final handoff contract:
- target surface and mode: named-file Plate Next review packet.
- files/APIs reviewed: `navigate.ts`, `DOMPlugin.ts`, old main navigation behavior.
- broad Core drift score coverage: N/A.
- best Plate v2 recommendation: DOM plugin owns DOM service typing; navigation consumes typed Core APIs directly.
- verdict matrix summary: one `main-parity-cleanup`, one fixed `Plate gap`.
- Plite/Plate gaps or blockers: fixed Plate DOM type gap; no Plite blocker.
- related Core sweep query/matches/patched/deferred: same-class runtime API cast audit, zero matches after patch, two files patched, zero deferred.
- changes made: listed above.
- tests/proof commands: listed above.
- old compatibility names audited: local `RuntimeApi` cast/helper shape.
- needs attention: none for this packet.
- next best Plate Next packet: continue one-by-one review of Core files with local type casts or displaced DOM/API behavior.

Reboot status:
| Question | Answer |
|----------|--------|
| Where am I? | Completed named-file navigation API cleanup |
| Where am I going? | Handoff after final check-complete |
| What is the goal? | Remove `NavigationRuntimeApi` and repair owner typing |
| What have I learned? | The issue was a Core DOM type gap, not a Plite gap |
| What have I done? | Added optional `dom.focus`; removed local cast; proved behavior |

Timeline:
- 2026-06-30 Goal plan created.
- 2026-07-01 Compared `navigate.ts` with `origin/main`.
- 2026-07-01 Removed local runtime API alias/cast and ran focused proof.

Open risks:
- None for this packet.
