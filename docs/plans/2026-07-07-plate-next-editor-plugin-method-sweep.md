# plate-next editor plugin method sweep

Objective:
Add Plate `editor.plugin(...)` as the clean plugin-context method, sweep the
Selection package off imported `getEditorPlugin(...)` call sites, and prove Core
plus Selection stay green.

Goal plan:
docs/plans/2026-07-07-plate-next-editor-plugin-method-sweep.md

Completion threshold:
- `editor.plugin(BlockSelectionPlugin).api...` and
  `editor.plugin<BlockSelectionConfig>(KEYS.blockSelection).api...` are
  supported.
- Public `editor.getApi(...)` is not reintroduced.
- Selection package runtime call sites do not import standalone
  `getEditorPlugin(...)` for plugin context.
- Plugin-object and key-plus-generic inference are tested.
- Focused Core and Selection proof passes.
- Broad Core/package migration is outside this packet.

Verification surface:
- `rg -n "getEditorPlugin<BlockSelectionConfig>|\\.getApi\\(|getApi\\(" packages/selection/src packages/core/src --glob '!**/dist/**'`
- `rg -n "getEditorPlugin" packages/selection/src --glob '!**/dist/**'`
- `rg -n "editor\\.plugin" packages/selection/src packages/core/src/lib/plugin/getEditorPlugin.spec.ts packages/core/src/react/plugin/createPlatePlugin.spec.ts --glob '!**/dist/**'`
- `pnpm turbo typecheck --filter=./packages/core --filter=./packages/selection`
- `pnpm --filter @platejs/core exec bun test src/lib/plugin/getEditorPlugin.spec.ts src/react/plugin/createPlatePlugin.spec.ts`
- `pnpm --filter @platejs/selection test`
- `pnpm --filter @platejs/selection lint`
- `pnpm --filter @platejs/selection build`
- `pnpm --filter @platejs/core lint`
- `node .agents/skills/autogoal/scripts/check-complete.mjs docs/plans/2026-07-07-plate-next-editor-plugin-method-sweep.md`

Constraints:
- Keep the method as Plate API, not a public compat alias.
- Do not resurrect `editor.getApi(...)`.
- Do not force owner-package call sites to import standalone
  `getEditorPlugin(...)`.
- Use key-plus-generic fallback where importing the plugin object would create a
  package boundary problem.
- Preserve type inference; do not add callback annotations or casts to hide API
  weakness.

Boundaries:
- Edited scope: `packages/core/src/lib/editor`, Core plugin tests, and Selection
  call sites/tests.
- No Plite runtime change was needed.
- No browser/docs route was touched.
- No broad Core drift review was requested in this packet.

Blocked condition:
Stop if `editor.plugin(...)` cannot preserve both plugin-object and
key-plus-generic inference without weakening `BaseEditor` / `PlateEditor`
assignability.

Start Gates:
| Gate | Applies | Evidence |
|------|---------|----------|
| Prompt requirements captured before work | yes | Accepted shape copied into threshold: `editor.plugin(...)`, no `getApi`, sweep Selection, focused proof |
| `plate-next` used | yes | Active lane is Plate v2 cleanup review and migration sweep |
| `autogoal` used | yes | Goal plan created before implementation |
| Mode classified | yes | Named API packet, not broad Core/package sweep |
| Scope bounded | yes | Core editor method plus Selection call sites |

Work Checklist:
- [x] Add `editor.plugin(...)` to `BaseEditor` runtime/type surface.
- [x] Support plugin-object inference with `editor.plugin(MethodPlugin)`.
- [x] Support key-plus-generic access with `editor.plugin<Config>('key')`.
- [x] Keep `PlateEditor` assignable to `BaseEditor`; do not narrow the inherited
      method on the React editor type.
- [x] Add Core contract tests for base editor and Plate editor method access.
- [x] Sweep Selection runtime call sites from imported `getEditorPlugin(...)`
      to `editor.plugin<BlockSelectionConfig>(KEYS.blockSelection)`.
- [x] Update Selection unit fixtures that hand-roll editors to expose
      `editor.plugin(...)`.
- [x] Source-audit Selection for removed standalone `getEditorPlugin` imports.
- [x] Source-audit Core/Selection for `.getApi(` comeback.
- [x] Run focused Core/Selection typecheck, tests, lint, and build proof.
- [x] Record changed files, verification, decisions, and remaining risks.

Phase / pass table:
| Phase | Status | Evidence |
|-------|--------|----------|
| API design | complete | `BaseEditor` owns `plugin`; `PlateEditor` inherits it to preserve assignability |
| Runtime implementation | complete | `withPlite` installs `editor.plugin` via existing `getEditorPlugin` resolver |
| Selection sweep | complete | Selection runtime call sites use `editor.plugin<BlockSelectionConfig>(KEYS.blockSelection)` |
| Fixture repair | complete | Selection mocks expose the same method used by real editors |
| Verification | complete | Focused commands listed in Verification evidence passed |

Completion Gates:
| Gate | Applies | Required action | Evidence |
|------|---------|-----------------|----------|
| Named verification threshold | yes | Run focused Core/Selection proof | All proof commands passed after fixture repair |
| Broad Core drift ledger coverage | no | Not a broad Core sweep | Scope was a named editor method packet |
| Score gate | no | Package/file score ledger not required | Not package review mode |
| Best Plate v2 recommendation | yes | Record accepted shape and rejected alternatives | Use `editor.plugin(...)`; reject `editor.getApi(...)` and package-level helper imports |
| Plite/Plate gap ledger | yes | Record blocker or N/A | No Plite gap found |
| Related Core sweep after correction | yes | Search old helper/getApi patterns | Source audits are clean |
| Package file checklist | no | Not package review mode | Selection call-site sweep only |
| Package/API proof | yes | Core + Selection commands | Typecheck, tests, lint, Selection build passed |
| Shared Core gate coverage | no | `check:core` update not needed | Named API packet, no new package in Core gate |
| Non-Core package error triage | no | No unrelated package proof used | N/A |
| Source audit | yes | Run exact audits | Old Selection helper import and `getApi` audits returned no matches |
| Rename ledger | no | No rename in packet | N/A |
| Extracted-file inventory | no | No extracted Core files in packet | N/A |
| Autoreview / review | no | Focused proof sufficient | Small API/call-site packet; no broad review requested |
| Final lint/check | yes | Scoped lint/build/typecheck | Passed |
| Changed list / needs attention | yes | Fill ledgers below | Complete |
| Goal plan complete | yes | Run completion checker | To run after this edit |

Best Plate v2 recommendation:
| Target | Recommended shape | Rejected legacy/hack alternatives | Reason | User-review need |
|--------|-------------------|-----------------------------------|--------|------------------|
| Plugin context access | `editor.plugin(pluginOrKey)` | `editor.getApi(...)`; imported `getEditorPlugin(...)` in owner packages | Method keeps app/package code ergonomic without reviving old API names | Low |

Plite / Plate gap ledger:
| Gap type | Missing capability | Why local workaround is a hack | Smallest owner | Proof needed | Decision |
|----------|--------------------|-------------------------------|----------------|--------------|----------|
| N/A | None | No workaround needed | Plate Core | Core/Selection proof | Keep Plate method |

Related Core sweep ledger:
| Trigger correction | Sweep query / method | Matches | Patched | Deferred | Remaining risk |
|--------------------|----------------------|---------|---------|----------|----------------|
| Add `editor.plugin` | `rg "getEditorPlugin<BlockSelectionConfig>|\\.getApi\\(|getApi\\(" packages/selection/src packages/core/src` | 0 | 0 | 0 | None |
| Selection helper import sweep | `rg "getEditorPlugin" packages/selection/src` | 0 | 0 | 0 | None |

Review matrix:
| Path / API | Drift score | Verdict | Owner | Evidence | Next |
|------------|-------------|---------|-------|----------|------|
| `packages/core/src/lib/editor/SlateEditor.ts` / `BaseEditor.plugin` | 0 | keep | Plate Core | Inference tests and typecheck pass | None |
| `packages/core/src/lib/editor/withPlite.ts` / runtime install | 0 | keep | Plate Core | Runtime method delegates to existing plugin context resolver | None |
| `packages/selection/src/**` plugin context call sites | 0 | keep | Selection | Tests/lint/build pass and old helper audit is clean | None |

Changed list:
| Group | Current-run changes |
|-------|---------------------|
| code/runtime/API | Added `BaseEditor.plugin(...)`; installed it in `withPlite`; swept Selection plugin-context call sites |
| tests/proof | Added Core method contract tests; updated Selection editor fixtures |
| docs/templates/skills | Updated this autogoal plan only |
| reverted/quarantined packets | None |

Needs your attention:
| Rank | Item | Why | Anchor | Recommendation |
|------|------|-----|--------|----------------|
| 1 | None | The accepted API shape is implemented and scoped proof is green | N/A | Continue package review with this method available |

Verification evidence:
- `pnpm turbo typecheck --filter=./packages/core --filter=./packages/selection`
  passed: 13 successful tasks.
- `pnpm --filter @platejs/core exec bun test src/lib/plugin/getEditorPlugin.spec.ts src/react/plugin/createPlatePlugin.spec.ts`
  passed: 14 tests, 26 expects.
- `pnpm --filter @platejs/selection test` passed after fixture repair:
  98 tests, 184 expects.
- `pnpm --filter @platejs/selection lint` passed.
- `pnpm --filter @platejs/selection build` passed.
- `pnpm --filter @platejs/core lint` passed.
- Source audit for `getEditorPlugin<BlockSelectionConfig>`, `.getApi(`, and
  `getApi(` in `packages/selection/src` plus `packages/core/src` returned no
  matches.
- Source audit for `getEditorPlugin` in `packages/selection/src` returned no
  matches.

Final handoff contract:
- target surface and mode: named Plate editor method packet.
- files/APIs reviewed: `BaseEditor.plugin`, `withPlite` runtime install,
  Core method tests, Selection plugin-context call sites.
- broad Core drift score coverage: N/A.
- package file checklist coverage: N/A.
- best Plate v2 recommendation: keep `editor.plugin(...)` as the ergonomic
  method; do not restore `getApi`.
- Plite/Plate gaps or blockers: none.
- related Core sweep query/matches/patched/deferred: old helper/getApi audits
  returned zero matches.
- changes made: see Changed list.
- tests/proof commands: see Verification evidence.
- old compatibility names audited: `getApi` audit clean.
- needs attention: none.
- next best Plate Next packet: continue package-by-package review using
  `editor.plugin(...)` where plugin context is needed.

Reboot status:
| Question | Answer |
|----------|--------|
| Where am I? | Plate Next named API sweep complete |
| Where am I going? | Completion checker and goal closeout |
| What is the goal? | Add `editor.plugin(...)`, sweep Selection, prove Core/Selection |
| What have I learned? | Runtime was clean; only hand-rolled Selection fixtures needed the new method |
| What have I done? | Added method, tests, call-site sweep, fixture repair, and proof |

Open risks:
- None for this packet.
