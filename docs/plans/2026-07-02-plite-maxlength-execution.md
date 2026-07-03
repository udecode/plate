# plite maxLength execution

Objective:
Execute accepted Plite maxLength plan; done when Plite/Core expose option paths, LengthPlugin is cut, focused tests/docs pass, and plan is complete.

Goal plan:
docs/plans/2026-07-02-plite-maxlength-execution.md

Accepted plan:
docs/plans/2026-07-02-plite-length-limit-ownership.md

Template:
docs/plans/templates/plite-plan.md

Primary template:
docs/plans/templates/plite-plan.md

Applied packs:
- none

Completion threshold:
- `createEditor({ maxLength })` exists for non-React Plite.
- `<Editable maxLength={...}>` exists for React and can change dynamically.
- Plate forwards `createBaseEditor({ maxLength })` to Plite without public `LengthPlugin`.
- Public `LengthPlugin`, plugin options tests, docs, and exports are gone.
- Focused Plite/Core/docs verification is run or exact blocker recorded.
- `node .agents/skills/autogoal/scripts/check-complete.mjs docs/plans/2026-07-02-plite-maxlength-execution.md` passes.

Verification surface:
- Source checks with `rg` for `LengthPlugin`, `maxLength`, and public docs.
- Focused tests for Plite maxLength behavior, React dynamic Editable path, and Core forwarding.
- Package typecheck/lint/build only as needed by failures.

Constraints:
- Implement now; this is execution mode after user accepted plan with "go".
- No public compatibility aliases or shims.
- Keep Plite optional/unopinionated: no limit when `maxLength` is absent.
- Use `maxLength` option, not primary public `extensions: [maxLength(...)]`.
- Support non-React and React dynamic Editable use.
- Keep type inference intact.

Boundaries:
- Allowed implementation scope: `packages/plite/**`, `packages/plite-react/**`, `packages/core/**`, `content/docs/**`, generated barrels if required, and this plan.
- Do not alter unrelated package migration work.

Blocked condition:
- Block only if Plite cannot support runtime maxLength without a broader editor runtime API change. If that happens, record the exact missing API and stop.

Plite Plan lane state:
- plite_plan_lane_status: executing
- current_pass: implementation
- current_pass_status: complete
- next_pass: none
- next_action: handoff
- final_handoff_status: ready

Current verdict:
- verdict: execute accepted plan
- confidence: 0.94
- keep / cut / revise call: move length limiting to Plite `maxLength` option and React `Editable maxLength`; cut Plate `LengthPlugin`
- reason: length limiting is editor input policy, not a Plate product plugin.

Completion rule:
- Do not call `update_goal(status: complete)` until verification and this plan pass.

Start Gates:
| Gate | Applies | Evidence |
|------|---------|----------|
| Explicit requirement capture | yes | User challenged extension syntax; accepted API is `maxLength` option plus `<Editable maxLength>`, non-React support, no public LengthPlugin. |
| Skill analysis before edits | yes | `plite-plan` and `autogoal` read. |
| Active goal checked or created | yes | New execution goal created. |
| Source of truth read before edits | yes | Accepted plan read and live source will be inspected before patches. |
| Live `plate-2` grounding needed for current-state claims | yes | Source audit is the first implementation step. |

Work Checklist:
- [x] Accepted API requirements captured before implementation.
- [x] Execution goal created after planning goal completed.
- [x] Live source grounding recorded for current Plite/Core/React/docs surfaces.
- [x] Plite non-React `createEditor({ maxLength })` implemented.
- [x] Plite React `<Editable maxLength>` dynamic override implemented.
- [x] Plate Core forwards `maxLength` and removes public `LengthPlugin`.
- [x] Docs no longer teach `LengthPlugin` and teach current `maxLength` shape where relevant.
- [x] Focused tests added/moved for text insert, paste/fragment, delete allowed, absent option unlimited, replay/history safety where feasible.
- [x] Focused verification commands run.
- [x] Browser proof run or marked N/A with reason.
- [x] Autoreview marked N/A or run if implementation scope needs it before commit.

Completion Gates:
| Gate | Applies | Evidence |
|------|---------|----------|
| Named verification threshold | yes | Focused tests, typechecks, docs check, `check:core`. |
| Plite source/runtime/package public API claim | yes | `pnpm --filter @platejs/plite typecheck`, `pnpm --filter @platejs/plite test ./test/max-length-contract.test.ts`, `pnpm check:core`. |
| Core public API change | yes | `pnpm --filter @platejs/core exec bun test src/lib/editor/withPlite.spec.ts`, `pnpm check:core`. |
| Docs changed | yes | `pnpm --filter www check:docs`. |
| Autoreview for implementation changes | no | Not requested; no commit/PR handoff. |
| Final user-review handoff | yes | Ready. |
| Goal plan complete | yes | Ready for `check-complete`. |

Phase / pass table:
| Phase | Status | Evidence | Next |
|-------|--------|----------|------|
| Current-state read | complete | Plite runtime, Plite React `Editable`, Core plugin wiring, and docs searched. | done |
| Plite implementation | complete | `CreateEditorOptions.maxLength`, runtime maxLength state, insert text/fragment/node enforcement. | done |
| React Editable dynamic option | complete | `<Editable maxLength>` override with cleanup and behavior test. | done |
| Core LengthPlugin cut | complete | Core plugin registration/export/files removed; factory forwards maxLength to Plite. | done |
| Docs/tests | complete | Plite/Core docs updated; Plite/Core/React tests added or repaired. | done |
| Verification | complete | Focused tests, typechecks, docs check, `check:core`. | final handoff |

Scorecard:
| Dimension | Weight | Score | Evidence |
|-----------|-------:|------:|----------|
| React/runtime performance | 0.20 | 0.96 | Runtime truncates before insert instead of post-apply cleanup. |
| Plite API/DX quality | 0.20 | 0.97 | `createEditor({ maxLength })` and `<Editable maxLength>` are the public paths. |
| Plate and collaboration migration backbone | 0.15 | 0.94 | Operation replay bypass is tested. |
| Regression-proof testing strategy | 0.20 | 0.95 | Plite/Core/React focused tests plus `check:core`. |
| Research evidence completeness | 0.15 | 0.90 | no external research needed. |
| shadcn-style composability and minimalism | 0.10 | 0.95 | option beats public plugin boilerplate. |

Verification evidence:
- `pnpm --filter @platejs/plite test ./test/max-length-contract.test.ts` -> 8 pass.
- `pnpm --filter @platejs/core exec bun test src/lib/editor/withPlite.spec.ts` -> 27 pass.
- `pnpm --filter @platejs/plite-react test -- provider-hooks-contract.test.tsx` -> 38 pass.
- `pnpm --filter @platejs/plite typecheck` -> pass.
- `pnpm --filter @platejs/plite-react typecheck` -> pass.
- `pnpm --filter @platejs/core typecheck` -> pass.
- `pnpm --filter @platejs/plite lint` -> pass.
- `pnpm --filter @platejs/core lint` -> pass.
- `pnpm --filter @platejs/core brl` -> pass.
- `pnpm --filter www check:docs` -> pass.
- `pnpm exec biome check packages/plite-react/src/components/editable-text-blocks.tsx packages/plite-react/test/provider-hooks-contract.tsx` -> pass.
- `pnpm check:core` -> pass.
- `rg -n "LengthPlugin|length plugin|createLengthPlugin" packages/core/src packages/plite packages/plite-react content/docs --glob '!content/docs/migration/v48.mdx'` -> no matches.

Reboot status:
| Question | Answer |
|----------|--------|
| Where am I? | execution complete |
| Where am I going? | implement Plite-owned maxLength and cut Plate LengthPlugin |
| What is the goal? | make maxLength first-class Plite option and dynamic Editable prop |
| What have I learned? | accepted public API is option/prop, not public extension syntax |
| What have I done? | moved maxLength to Plite runtime, added React prop, cut Core LengthPlugin, updated docs/tests |

Open risks:
- `pnpm --filter @platejs/plite-react lint` still fails on broad pre-existing package lint findings outside the changed files. Changed React files pass targeted Biome check, and Plite React type/test pass.
- Browser proof N/A: this packet changes package runtime/docs APIs and has no specific visual route; behavior is covered by package tests. Run app/browser proof only if reviewing a visible editor route using `maxLength`.
