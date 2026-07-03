# plate-next dom plugin runtime repair

Objective:
Repair `packages/core/src/lib/plugins/dom/DOMPlugin.ts` by removing migration casts/noise around scroll and read-only state while keeping DOMPlugin as the Plate owner for auto-scroll and DOM facade behavior.

Completion threshold:
- Named-file Plate Next packet, not broad Core sweep.
- Remove `editor.api?.` optional chaining from the guaranteed editor API object.
- Remove the `isViewReadOnly` helper and its `state as { view?: ... }` cast.
- Use Plite's public `editor.read.view.isReadOnly()` API.
- Avoid `as any`, `as unknown`, and `Partial<DomConfig['api']>` in `DOMPlugin.ts`.
- Preserve the host DOM bridge behavior for React/DOM editors.
- Run focused DOM/navigation tests, Core typecheck, Core lint, and source audits.
- `node .agents/skills/autogoal/scripts/check-complete.mjs docs/plans/2026-06-30-plate-next-dom-plugin-runtime-repair.md` passes.

Verification surface:
- `pnpm --filter @platejs/core exec bun test src/lib/plugins/dom/DOMPlugin.spec.ts src/lib/plugins/dom/withScrolling.spec.ts src/lib/plugins/navigation-feedback/NavigationFeedbackPlugin.spec.ts`
- `pnpm --filter @platejs/core typecheck`
- `pnpm --filter @platejs/core lint`
- `rg -n "isViewReadOnly|state as \\{|editor\\.api\\?\\.|Partial<DomConfig\\['api'\\]>|as \\{ dom\\?: HostDomApi \\}|as any|as unknown" packages/core/src/lib/plugins/dom/DOMPlugin.ts`
- `git ls-files --others --exclude-standard packages/core/src/lib/plugins/dom | sort`

Constraints:
- Use `plate-next` review mode.
- Keep `DOMPlugin` owner/name/key; no rename pass.
- Main is behavior evidence, not a reason to keep old `with*`, `tf`, or transform API shapes.
- No bridge/helper dump.
- Do not broaden into deleting the exported `withScrolling` helper in this packet; record it as follow-up unless explicitly requested.

Boundaries:
- Allowed edit scope: `packages/core/src/lib/plugins/dom/DOMPlugin.ts` and this plan.
- Target surface: Core DOM runtime plugin implementation.
- Non-goals: public export hard-cut, broad Core sweep, docs/browser proof.
- Browser proof: N/A, no route/UI changed.
- Out-of-scope package errors: N/A, focused Core commands stayed green.

Blocked condition:
- None. Plite already exposes `editor.read.view.isReadOnly()`.

Phase / pass table:
| Phase | Status | Evidence |
|-------|--------|----------|
| Checkpoint zero | done | Prompt copied: repair `DOMPlugin.ts` |
| Source comparison | done | Compared current DOMPlugin with `origin/main` and current Plite read/view APIs |
| Implementation | done | Removed `editor.api?.`; removed `isViewReadOnly` cast helper; used `editor.read.view.isReadOnly()` |
| Correction sweep | done | DOMPlugin audit for removed cast/helper shapes returned zero matches |
| Proof | done | DOM, withScrolling, navigation specs plus Core typecheck/lint passed |

Start Gates:
| Gate | Applies | Evidence |
|------|---------|----------|
| Prompt requirements captured before work | yes | Target file recorded |
| `plate-next` skill/rule read | yes | `.agents/skills/plate-next/SKILL.md` read |
| Active goal checked or created | yes | This plan |
| Mode classified as named packet vs broad Core sweep | yes | Named-file packet; broad Core sweep N/A |
| Review target recorded as best Plate v2 / Plite-fit / no legacy compat | yes | Constraints and recommendation table |
| Related Core sweep policy checked | yes | DOMPlugin source audit recorded |

Work Checklist:
- [x] First checkpoint complete: explicit target, scope, non-goals, proof, and handoff recorded.
- [x] Mode classified: named file/API packet.
- [x] Best Plate v2 call recorded for the reviewed target.
- [x] Legacy/backcompat decision recorded.
- [x] Hack check recorded: no `state as`, no `editor.api?.`, no `Partial<DomConfig['api']>`, no `as any`.
- [x] Gap ledger updated.
- [x] Related Core sweep row added with query, match count, patched count, deferred count, and remaining risk.
- [x] Broad Core sweep marked N/A.
- [x] Review matrix filled for inspected file/helper.
- [x] Focused package proof run.
- [x] Removed names/source shapes audited.
- [x] Changed list and next owner filled.

Completion Gates:
| Gate | Applies | Required action | Evidence |
|------|---------|-----------------|----------|
| Named verification threshold | yes | Run focused DOM/navigation proof plus Core typecheck/lint | All commands passed |
| Broad Core drift ledger coverage | no | Not a broad Core sweep | N/A |
| Score gate | yes | Score target and same-file helper drift | Target score 0 after cleanup |
| Best Plate v2 recommendation | yes | Record recommended current shape and rejected hacks | See recommendation table |
| Plite/Plate gap ledger | yes | Record blockers or N/A | No gap |
| Related Core sweep after correction | yes | Run DOMPlugin cast/helper audit | Zero matches |
| Package/API proof | yes | Run Core proof | Focused tests, typecheck, lint passed |
| Source audit | yes | Run exact audit for removed helper/cast shapes | Zero matches |
| Extracted-file inventory | yes | Check DOM plugin scope for untracked files | Zero rows |
| Final lint/check | yes | Run scoped lint/typecheck | Passed |
| Goal plan complete | yes | Run check-complete | Pending final command |

Review matrix:
| Path / API | Drift score | Verdict | Owner | Evidence | Next |
|------------|-------------|---------|-------|----------|------|
| `packages/core/src/lib/plugins/dom/DOMPlugin.ts` | 0 | main-parity-cleanup | DOMPlugin | DOMPlugin owns Plate auto-scroll and DOM facade; implementation now uses Plite public read view and typed host DOM service | keep |
| `packages/core/src/lib/plugins/dom/withScrolling.ts` | 2 | defer-with-owner | DOMPlugin public helper/export | Separate exported old `with*` helper still exists; DOMPlugin.ts no longer depends on it | Review as explicit hard-cut packet |

Best Plate v2 recommendation:
| Target | Recommended shape | Rejected legacy/hack alternatives | Reason | User-review need |
|--------|-------------------|-----------------------------------|--------|------------------|
| DOM read-only fallback | Use `editor.read.view.isReadOnly()` | `state as { view?: ... }`, local helper around read state | Plite owns view state and exposes it publicly | Low |
| Host DOM service composition | Name `HostDomApi` and destructure optional host `dom` service | `Partial<DomConfig['api']>`, `as any`, pretending the final DOM facade is already installed | DOMPlugin composes a host DOM bridge, then exposes a stable Plate facade | Low |

Plite / Plate gap ledger:
| Gap type | Missing capability | Why local workaround is a hack | Smallest owner | Proof needed | Decision |
|----------|--------------------|-------------------------------|----------------|--------------|----------|
| N/A | None | Public Plite view read API exists | N/A | Core focused tests and typecheck | No blocker |

Related Core sweep ledger:
| Trigger correction | Sweep query / method | Matches | Patched | Deferred | Remaining risk |
|--------------------|----------------------|---------|---------|----------|----------------|
| Removed DOMPlugin cast/helper smells | `rg -n "isViewReadOnly\|state as \\{\|editor\\.api\\?\\.\|Partial<DomConfig\\['api'\\]>\|as \\{ dom\\?: HostDomApi \\}\|as any\|as unknown" packages/core/src/lib/plugins/dom/DOMPlugin.ts` | 0 after patch | 1 file | 0 | none in `DOMPlugin.ts` |
| Related old `with*` helper | `rg -n "withScrolling\|beginAutoScroll\\(" packages/core/src packages/core/type-tests -g '*.ts' -g '*.tsx'` | 5 | 0 | 1 exported helper family | needs explicit hard-cut decision |

Extracted file ledger:
| Path | Bucket | Origin/main owner check | Decision | Proof |
|------|--------|-------------------------|----------|-------|
| N/A | N/A | `git ls-files --others --exclude-standard packages/core/src/lib/plugins/dom` returned zero rows | no extracted DOM files | command passed |

Changed list:
| Group | Current-run changes |
|-------|---------------------|
| code/runtime/API | `DOMPlugin.ts` now uses `editor.read.view.isReadOnly()`, direct `editor.api.scrollIntoView?.`, and named `HostDomApi` host bridge typing |
| tests/proof | no test file changes in this packet |
| docs/plans | this plan updated |
| reverted/quarantined packets | none |

Needs your attention:
| Rank | Item | Why | Anchor | Recommendation |
|------|------|-----|--------|----------------|
| 1 | `withScrolling` helper/export | It is still an old `with*` public helper beside DOMPlugin; deleting it is a broader hard-cut than this file repair | `packages/core/src/lib/plugins/dom/withScrolling.ts` | review next with explicit hard-cut |

Findings:
- `DOMPlugin.ts` was hiding Plite view state behind a local cast.
- The remaining host DOM composition is legitimate: React/DOM editors can provide DOM services before Core wraps them.
- `withScrolling` is related legacy shape, but not required by `DOMPlugin.ts`.

Decisions and tradeoffs:
- Did not delete `withScrolling` inside this packet because the user targeted `DOMPlugin.ts`; cutting an exported helper should be explicit.
- Kept `HostDomApi` private and narrow to document the pre-existing host DOM service boundary.

Error attempts:
| Error / failed attempt | Count | Next different move | Resolution |
|------------------------|-------|---------------------|------------|
| None | 0 | N/A | N/A |

Verification evidence:
- `pnpm --filter @platejs/core exec bun test src/lib/plugins/dom/DOMPlugin.spec.ts src/lib/plugins/dom/withScrolling.spec.ts src/lib/plugins/navigation-feedback/NavigationFeedbackPlugin.spec.ts`: 13 pass.
- `pnpm --filter @platejs/core typecheck`: pass.
- `pnpm --filter @platejs/core lint`: pass.
- DOMPlugin cast/helper audit: zero matches.
- DOM extracted-file inventory: zero rows.

Final handoff contract:
- target surface and mode: named-file Plate Next runtime repair.
- files/APIs reviewed: `DOMPlugin.ts`, `origin/main` DOMPlugin, Plite `editor.read.view`, `withScrolling` related helper.
- broad Core drift score coverage: N/A.
- best Plate v2 recommendation: keep DOMPlugin owner; use Plite public view read; keep host DOM bridge typed explicitly.
- verdict matrix summary: one `main-parity-cleanup`, one deferred exported helper family.
- Plite/Plate gaps or blockers: none.
- related Core sweep query/matches/patched/deferred: DOMPlugin smell audit zero after patch; `withScrolling` deferred.
- changes made: listed above.
- tests/proof commands: listed above.
- old compatibility names audited: cast/helper shapes plus `withScrolling` surface.
- needs attention: `withScrolling` hard-cut packet.
- next best Plate Next packet: decide whether to delete `withScrolling.ts`, `withScrolling.spec.ts`, and its barrel export.

Reboot status:
| Question | Answer |
|----------|--------|
| Where am I? | Completed named-file DOMPlugin runtime cleanup |
| Where am I going? | Handoff after final check-complete |
| What is the goal? | Repair `DOMPlugin.ts` without broad export cuts |
| What have I learned? | Plite already owns view read-only state; host DOM bridge typing is the only real composition boundary |
| What have I done? | Removed cast/helper noise and proved Core green |

Timeline:
- 2026-06-30 Goal plan created.
- 2026-07-01 Compared current and main DOMPlugin, checked Plite view APIs.
- 2026-07-01 Repaired DOMPlugin and ran focused proof.

Open risks:
- `withScrolling` remains as a separate exported old `with*` helper.
