# plate-next-flashtarget-repair

Objective:
Repair `packages/core/src/lib/plugins/navigation-feedback/transforms/flashTarget.ts` so it uses the clean Plate/Plite DOM boundary with no local DOM API type hack.

Completion threshold:
- `flashTarget.ts` has no broad cast, local DOM API alias, duplicate DOM wrapper, or optional legacy fallback.
- Behavior remains the same: resolve the target node, mark/clear DOM attributes, clear previous path refs, and clear the timer.
- Same-class navigation-feedback DOM sweep is recorded.
- Focused tests/typecheck/biome/source audits pass.

Verification surface:
- `pnpm --filter @platejs/core exec bun test src/lib/plugins/navigation-feedback src/lib/plugins/dom`
- `pnpm --filter @platejs/core typecheck`
- `pnpm exec biome check packages/core/src/lib/plugins/navigation-feedback/transforms/flashTarget.ts packages/core/src/lib/plugins/navigation-feedback/NavigationFeedbackPlugin.spec.ts packages/core/src/lib/editor/withPlite.ts packages/core/src/lib/plugins/getCorePlugins.ts packages/core/src/react/editor/getPlateCorePlugins.ts`
- `rg -n "NavigationRuntimeApi|DOMResolver|hasDOMResolver|resolveDOMNode\\?|assertDOMNode\\?|toDOMNode|as \\{|as any|as unknown|editor\\.api\\.dom\\?" packages/core/src/lib/plugins/navigation-feedback packages/core/src/lib/plugins/dom --glob '!**/dist/**'`

Constraints:
- Use `origin/main` as evidence, not as a compatibility target.
- Keep the current owner/name; no rename pass.
- No public compat aliases, old Slate shims, fake DOM API fallbacks, or helper dumps.
- Do not broaden into all-Core or unrelated package migration.

Boundaries:
- Allowed edits: `flashTarget.ts`, focused owner spec, and same option-typing owner files required to remove casts honestly.
- Package/API surface: Core navigation-feedback plugin consuming Plite DOM through Core `BaseEditor`.
- Docs/browser surface: N/A; internal runtime helper with no standalone browser route.
- Non-goals: broad Core sweep, package migration, public API redesign.

Blocked condition:
No blocker found. `BaseEditor['api']['dom']` already has `resolveDOMNode`; the only gap exposed was top-level option typing for `navigationFeedback`.

Start Gates:
| Gate | Applies | Evidence |
|------|---------|----------|
| Prompt captured | yes | User asked to repair `packages/core/src/lib/plugins/navigation-feedback/transforms/flashTarget.ts` |
| Skills read | yes | `plate-next` and `autogoal` read |
| Goal active | yes | Active goal points at this plan |
| Mode classified | yes | Named-file Plate Next review, not broad Core sweep |
| Output budget | yes | Targeted reads and `rg`; no broad manifest |

Work Checklist:
- [x] Inspected `flashTarget.ts`, `origin/main` owner, caller graph, and focused tests.
- [x] Recorded best Plate v2 verdict for the helper.
- [x] Patched accepted smell without renaming or helper dumping.
- [x] Ran same-class navigation DOM sweep.
- [x] Ran focused tests/typecheck/biome/source audits.
- [x] Filled verification, risks, and handoff rows.
- [x] Ran `check-complete.mjs`.

Completion Gates:
| Gate | Applies | Evidence |
|------|---------|----------|
| Named verification threshold | yes | Focused navigation/dom tests, Core typecheck, biome, and source audit passed |
| Related sweep | yes | Same-class DOM/cast audit returned zero matches in navigation-feedback and dom plugin scope |
| Source audit | yes | Exact stale DOM alias/fallback/cast query returned zero matches |
| Final lint/check | yes | Scoped biome check passed |
| Goal plan complete | yes | `check-complete.mjs` to run after this closure patch |

Phase / pass table:
| Phase | Status | Evidence |
|-------|--------|----------|
| Source review | complete | Current file, `origin/main`, plugin spec, option typing, and DOMPlugin owner reviewed |
| Patch | complete | Removed local DOM resolver guard and repaired navigationFeedback partial option typing |
| Sweep | complete | Same-class navigation DOM audit returned zero matches after patch |
| Proof | complete | Focused tests, typecheck, and biome passed |

Review matrix:
| Path / API | Drift score | Verdict | Owner | Evidence | Next |
|------------|-------------|---------|-------|----------|------|
| `packages/core/src/lib/plugins/navigation-feedback/transforms/flashTarget.ts` | 0 | main-parity-cleanup | Navigation feedback | Uses `editor.api.dom.resolveDOMNode(node)` directly, no local DOMResolver guard | Keep |
| `packages/core/src/lib/plugins/navigation-feedback/NavigationFeedbackPlugin.spec.ts` | 0 | main-parity-cleanup | Navigation feedback tests | Uses real `HTMLElement` and no fixture `as any` casts in this spec | Keep |
| `packages/core/src/lib/editor/withPlite.ts` | 0 | main-parity-cleanup | Base editor options | `navigationFeedback` accepts partial plugin options like `{ duration }` | Keep |
| `packages/core/src/lib/plugins/getCorePlugins.ts` | 0 | main-parity-cleanup | Core plugin list | Same partial option surface flows into plugin configuration | Keep |
| `packages/core/src/react/editor/getPlateCorePlugins.ts` | 0 | main-parity-cleanup | React core plugin list | React entrypoint matches base option surface | Keep |

Best Plate v2 recommendation:
| Target | Recommended shape | Rejected alternatives | Reason | User-review need |
|--------|-------------------|----------------------|--------|------------------|
| `flashTarget.ts` DOM lookup | Direct `editor.api.dom.resolveDOMNode(node)` | Local `DOMResolver`, `hasDOMResolver`, optional `editor.api.dom?`, old `toDOMNode` fallback | Core DOM plugin already owns and types the DOM API | No |
| `navigationFeedback` options | `Partial<NavigationFeedbackConfig['options']> | boolean` | Requiring full runtime state `{ activeTarget, duration }` for public editor options | Users should pass `{ duration }` without casts | No |

Related Core sweep ledger:
| Trigger correction | Sweep query / method | Matches | Patched | Deferred | Remaining risk |
|--------------------|----------------------|---------|---------|----------|----------------|
| DOM resolver guard removal | `rg -n "NavigationRuntimeApi|DOMResolver|hasDOMResolver|resolveDOMNode\\?|assertDOMNode\\?|toDOMNode|as \\{|as any|as unknown|editor\\.api\\.dom\\?" packages/core/src/lib/plugins/navigation-feedback packages/core/src/lib/plugins/dom --glob '!**/dist/**'` | 0 after patch | `flashTarget.ts`, focused spec casts | 0 | Clean in named scope |
| Navigation feedback option typing | `rg -n "navigationFeedback\\?: NavigationFeedbackConfig\\['options'\\]|navigationFeedback\\?: Partial<NavigationFeedbackConfig\\['options'\\]>" packages/core/src -g '*.ts'` | 3 current partial typings, 0 old full typings | `withPlite.ts`, `getCorePlugins.ts`, `getPlateCorePlugins.ts` | 0 | Clean |

Changed list:
| Group | Current-run changes |
|-------|---------------------|
| code/runtime/API | `flashTarget.ts` direct typed DOM resolve; `navigationFeedback` editor option surface now accepts partial options in base/react core helpers |
| tests/proof | `NavigationFeedbackPlugin.spec.ts` uses real DOM element and no `as any` fixture casts |
| docs/templates/skills | This plan updated |
| reverted/quarantined packets | None |

Needs your attention:
| Rank | Item | Why | Anchor | Recommendation |
|------|------|-----|--------|----------------|
| 1 | Generic `withPlite.ts` casts still exist | They are outside this named `flashTarget.ts` packet, but a broader Plate Next sweep should keep attacking them | `packages/core/src/lib/editor/withPlite.ts` | Separate named packet or broad Core sweep |

Findings:
- The local `DOMResolver` guard in `flashTarget.ts` was migration paranoia. `BaseEditor` already carries `editor.api.dom.resolveDOMNode`.
- Removing test casts exposed a real option typing issue: `navigationFeedback: { duration }` was rejected because top-level options used full plugin runtime state instead of partial plugin options.

Decisions and tradeoffs:
- Keep navigation feedback in Plate. The flash/highlight behavior is product/plugin UX, not Plite substrate.
- Do not add a Plite API for this; Plite DOM already has the primitive.
- Do not route this through optional fallbacks. If Core installs the plugin, DOM API should be typed.

Error attempts:
| Error / failed attempt | Count | Next different move | Resolution |
|------------------------|-------|---------------------|------------|
| Core typecheck failed after removing spec casts | 1 | Fix owner option typing instead of restoring casts | `navigationFeedback` option surface changed to partial options |
| Biome requested formatting | 1 | Apply exact formatter shape | Spec expectation formatted |

Verification evidence:
- `pnpm --filter @platejs/core exec bun test src/lib/plugins/navigation-feedback src/lib/plugins/dom` -> 17 pass.
- `pnpm --filter @platejs/core typecheck` -> pass.
- `pnpm exec biome check packages/core/src/lib/plugins/navigation-feedback/transforms/flashTarget.ts packages/core/src/lib/plugins/navigation-feedback/NavigationFeedbackPlugin.spec.ts packages/core/src/lib/editor/withPlite.ts packages/core/src/lib/plugins/getCorePlugins.ts packages/core/src/react/editor/getPlateCorePlugins.ts` -> pass.
- Source audit for stale DOM resolver/fallback/casts in navigation-feedback/dom scope -> zero matches.

Final handoff contract:
- target surface and mode: named-file Plate Next repair for `flashTarget.ts`.
- files/APIs reviewed: `flashTarget.ts`, `NavigationFeedbackPlugin.spec.ts`, `withPlite.ts`, `getCorePlugins.ts`, `getPlateCorePlugins.ts`, DOMPlugin typing.
- best Plate v2 recommendation: direct typed DOM API call; partial top-level plugin options.
- verdict matrix summary: five reviewed rows, all clean after patch.
- Plite/Plate gaps or blockers: none.
- related Core sweep query/matches/patched/deferred: DOM guard/cast query zero after patch; navigationFeedback option typing query has three correct partial typings and zero old full typings.
- changes made: runtime DOM lookup cleanup, spec cast cleanup, option type repair.
- tests/proof commands: listed in Verification evidence.
- old compatibility names audited: `DOMResolver`, `hasDOMResolver`, optional DOM fallbacks, old `toDOMNode`, and casts in named owner scope.
- needs attention: generic `withPlite.ts` casts remain outside this packet.
- next best Plate Next packet: `withPlite.ts` generic cast cleanup if you want to keep draining Core type sludge.

Reboot status:
| Question | Answer |
|----------|--------|
| Where am I? | Closed scoped `flashTarget.ts` repair |
| Where am I going? | Final handoff |
| What is the goal? | Remove DOM typing smell without broadening into all Core |
| What have I learned? | The helper was cleanable with existing Core DOM types; option typing was the hidden reason tests used casts |
| What have I done? | Patched runtime, spec, and option surfaces; ran focused proof |

Open risks:
- Generic casts remain in `withPlite.ts`, outside this named packet.
