# plate-next-dom-scroll-primitive

Objective:
Move the Plate scroll primitive from top-level `editor.api.scrollIntoView` to
`editor.api.dom.scrollIntoView`, while keeping `tx.dom.autoScroll` as Plate Core
operation-policy behavior.

Completion threshold:
Done when top-level `editor.api.scrollIntoView` has no source callers,
`DOMPlugin` exposes optional `dom.scrollIntoView`, navigation uses the DOM
namespace, `tx.dom.autoScroll` still scrolls through the DOM service, and Core
plus Plite type/lint gates pass.

Verification surface:
- Source audit:
  `rg -n "api\\.scrollIntoView|scrollIntoView:" packages/core/src packages/core/type-tests packages/plite* -g '*.ts' -g '*.tsx'`
- Focused tests:
  `pnpm --filter @platejs/core exec bun test src/lib/plugins/dom/DOMPlugin.spec.ts src/lib/plugins/navigation-feedback/NavigationFeedbackPlugin.spec.ts`
- Package gates:
  `pnpm --filter @platejs/core typecheck`
  `pnpm --filter @platejs/plite typecheck`
  `pnpm --filter @platejs/core lint`
  `pnpm --filter @platejs/plite lint`
- Plan gate:
  `node .agents/skills/autogoal/scripts/check-complete.mjs docs/plans/2026-07-01-plate-next-dom-scroll-primitive.md`

Constraints:
- Plate owns product/editor-host DOM policy such as auto-scroll.
- Plite owns substrate DOM state and primitives, but does not get Plate
  operation-policy auto-scroll.
- No public compat alias or top-level `scrollIntoView` shim.
- No unrelated Core sweep, package rename, docs rename, or browser route work.

Boundaries:
- Edited Core DOM/navigation source and tests only, plus this plan.
- Plite source stayed unchanged because the API merge type already supported the
  DOM namespace extension.
- Non-Core package failures would be out of scope unless caused by this API
  move.

Blocked condition:
Blocked only if Core plugin API could not merge optional `dom.scrollIntoView`
with existing Plite DOM API without losing type inference. That blocker did not
occur.

Phase / pass table:
| Phase | Status | Evidence |
|-------|--------|----------|
| Checkpoint zero | done | Prompt requirements, boundaries, proof, non-goals, and stop condition copied before implementation. |
| API move | done | `DOMPlugin` and navigation now use `editor.api.dom.scrollIntoView`. |
| Related source sweep | done | Audit found no `api.scrollIntoView` callers; remaining matches are nested `dom.scrollIntoView` or the local guard type. |
| Proof | done | Focused tests, Core/Plite typecheck, and Core/Plite lint passed. |
| Closeout | done | Plan records changed files, proof, risks, and next owner. |

Start Gates:
| Gate | Applies | Evidence |
|------|---------|----------|
| Prompt requirements captured | yes | Target, proof, boundaries, no-alias rule, and stop condition are listed in this plan. |
| Skill routing | yes | Used `autogoal` for lifecycle and `plate-next` for Core API boundary review. |
| Mode classified | yes | Named API packet, not a broad Core sweep. |
| Public API fork checked | yes | User accepted the DOM namespace move; no separate planning fork needed. |
| Rename freeze | yes | No file/plugin rename. |

Work Checklist:
- [x] First checkpoint copied all explicit requirements before implementation.
- [x] Classified the work as a named Core API packet.
- [x] Recorded the best Plate v2 shape: `editor.api.dom.scrollIntoView`.
- [x] Rejected the legacy top-level root API and any compat alias.
- [x] Kept `tx.dom.autoScroll` in Plate Core as policy, not Plite substrate.
- [x] Patched `DOMPlugin` runtime/API type.
- [x] Patched navigation runtime caller.
- [x] Patched DOM and navigation focused tests.
- [x] Ran related source sweep for `api.scrollIntoView` and `scrollIntoView`.
- [x] Verified no untracked/extracted files were created in the target scope.
- [x] Ran focused behavior tests.
- [x] Ran Core and Plite typechecks.
- [x] Ran Core and Plite lint.
- [x] Recorded changed list, review matrix, risks, and next owner.

Completion Gates:
| Gate | Applies | Evidence |
|------|---------|----------|
| Named verification threshold | yes | Focused DOM/navigation tests passed: 15 pass, 0 fail. |
| Related Core sweep | yes | `rg` found no `api.scrollIntoView`; remaining `scrollIntoView:` matches are nested DOM API declarations/tests or the navigate DOM guard. |
| Package/API proof | yes | `@platejs/core` and `@platejs/plite` typecheck passed. |
| Source audit | yes | Removed top-level API caller surface; no compat alias left. |
| Extracted-file inventory | yes | `git ls-files --others --exclude-standard packages/core/src/lib/plugins/dom packages/core/src/lib/plugins/navigation-feedback` returned no files. |
| Final lint/check | yes | `@platejs/core` and `@platejs/plite` lint passed. |
| Goal plan complete | yes | This plan is ready for `check-complete.mjs`. |

Review matrix:
| Path / API | Drift score | Verdict | Owner | Evidence | Next |
|------------|-------------|---------|-------|----------|------|
| `packages/core/src/lib/plugins/dom/DOMPlugin.ts` | 1 | keep-in-plate | Core DOM plugin | `autoScroll` remains Plate operation policy; scroll primitive moved under `api.dom`. | Keep. |
| `packages/core/src/lib/plugins/dom/DOMPlugin.spec.ts` | 0 | proof-updated | Core DOM plugin tests | Scroll spy is installed as `api.dom.scrollIntoView`. | Keep. |
| `packages/core/src/lib/plugins/navigation-feedback/transforms/navigate.ts` | 1 | namespace-cleanup | Navigation feedback | Uses guarded `editor.api.dom.scrollIntoView(point)`. | Keep. |
| `packages/core/src/lib/plugins/navigation-feedback/NavigationFeedbackPlugin.spec.ts` | 0 | proof-updated | Navigation feedback tests | Test service now extends `api.dom`. | Keep. |

Best Plate v2 recommendation:
| Target | Recommended shape | Rejected legacy/hack alternatives | Reason | User-review need |
|--------|-------------------|-----------------------------------|--------|------------------|
| Scroll primitive | `editor.api.dom.scrollIntoView`, with `tx.dom.autoScroll` as Plate policy | Top-level `editor.api.scrollIntoView`; compat alias; moving operation-policy auto-scroll into Plite | Scrolling is DOM host behavior; auto-scroll policy is Plate plugin behavior. | None. |

Plite / Plate gap ledger:
| Gap type | Missing capability | Why local workaround is a hack | Smallest owner | Proof needed | Decision |
|----------|--------------------|-------------------------------|----------------|--------------|----------|
| none | No Plite gap found | No workaround needed | Core DOM plugin | Core/Plite typecheck | Closed. |

Related Core sweep ledger:
| Trigger correction | Sweep query / method | Matches | Patched | Deferred | Remaining risk |
|--------------------|----------------------|---------|---------|----------|----------------|
| Move root scroll API under DOM | `rg -n "api\\.scrollIntoView|scrollIntoView:" packages/core/src packages/core/type-tests packages/plite* -g '*.ts' -g '*.tsx'` | 5 nested/guard matches after patch | 5 reviewed | 0 | Low; no root API caller remains. |

Changed list:
| Group | Current-run changes |
|-------|---------------------|
| code/runtime/API | `DOMPlugin` now declares/calls `api.dom.scrollIntoView`; navigation calls `api.dom.scrollIntoView`. |
| tests/proof | DOM and navigation tests install scroll spies under `api.dom`. |
| docs/templates/skills | This autogoal plan only. |
| reverted/quarantined packets | None. |

Needs your attention:
| Rank | Item | Why | Anchor | Recommendation |
|------|------|-----|--------|----------------|
| 1 | No decision needed | The packet follows the accepted DOM namespace rule. | `editor.api.dom.scrollIntoView` | Keep. |

Findings:
- `scrollIntoView` was a misplaced root editor API. The cleaner shape is the
  DOM service namespace.
- `tx.dom.autoScroll` should stay in Plate Core because it is an operation
  policy around transactions, not a Plite substrate primitive.

Decisions and tradeoffs:
- Kept the navigation DOM guard local. It avoids forcing every host editor to
  implement scrolling and keeps optional DOM services honest.
- Did not move auto-scroll into Plite. That would leak Plate plugin policy into
  the substrate.

Error attempts:
| Error / failed attempt | Count | Next different move | Resolution |
|------------------------|-------|---------------------|------------|
| none | 0 | No alternate move needed | All proof passed. |

Verification evidence:
- `rg -n "api\\.scrollIntoView|scrollIntoView:" packages/core/src packages/core/type-tests packages/plite* -g '*.ts' -g '*.tsx'`
  showed no `api.scrollIntoView` callers.
- `git ls-files --others --exclude-standard packages/core/src/lib/plugins/dom packages/core/src/lib/plugins/navigation-feedback`
  returned no untracked files.
- `pnpm --filter @platejs/core exec bun test src/lib/plugins/dom/DOMPlugin.spec.ts src/lib/plugins/navigation-feedback/NavigationFeedbackPlugin.spec.ts`
  passed: 15 tests, 0 failures.
- `pnpm --filter @platejs/core typecheck` passed.
- `pnpm --filter @platejs/plite typecheck` passed.
- `pnpm --filter @platejs/core lint` passed.
- `pnpm --filter @platejs/plite lint` passed.

Final handoff contract:
- Target surface and mode: named Core API packet for DOM scroll primitive.
- Files/APIs reviewed: `DOMPlugin`, DOM tests, navigation transform,
  navigation tests.
- Broad Core drift score coverage: not applicable; this was a named packet.
- Best Plate v2 recommendation: keep scroll under `editor.api.dom`, keep
  auto-scroll under `tx.dom`.
- Plite/Plate gaps or blockers: none.
- Related Core sweep query/matches/patched/deferred: recorded above.
- Changes made: root scroll API removed; DOM namespace service used.
- Tests/proof commands: recorded above.
- Old compatibility names audited: `api.scrollIntoView` has no callers.
- Needs attention: none.
- Next best Plate Next packet: continue reviewing remaining Core plugin drift
  file-by-file when requested.

Reboot status:
| Question | Answer |
|----------|--------|
| Where am I? | Completed a narrow Plate Next API cleanup packet. |
| Where am I going? | Close the goal after `check-complete.mjs` passes. |
| What is the goal? | Move scroll primitive under DOM API without losing auto-scroll behavior. |
| What have I learned? | No Plite gap was needed for this move. |
| What have I done? | Patched source/tests and ran focused plus package gates. |

Timeline:
- 2026-07-01: Goal plan created.
- 2026-07-01: Patched DOM and navigation scroll API usage.
- 2026-07-01: Ran source audit, focused tests, typechecks, and lint.

Open risks:
- None for this packet.
