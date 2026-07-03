# plate-next hotkeys composing dom api

Objective:
Clean Core hotkeys composing DOM API; done when local guard is gone, related
Core sweep is recorded, and Core/Plite proof passes.

Completion threshold:
Done when `packages/core/src/lib/utils/hotkeys.ts` calls
`editor.api.dom.isComposing()` directly, Core's DOM plugin type preserves the
Plite DOM API surface, no same-class local composing guard remains in Core, and
Core/Plite typecheck plus lint pass.

Verification surface:
- Source audit:
  `rg -n "isComposing' in dom|typeof dom\\.isComposing|dom\\.isComposing|api\\.dom\\.isComposing" packages/core/src packages/core/type-tests packages/plite* -g '*.ts' -g '*.tsx'`
- Owner audit:
  `rg -n "PlateDomApi|DOMApi|isAutoScrolling|scrollIntoView|isComposing" packages/core/src/lib/plugins/dom packages/core/src/lib/utils/hotkeys.ts packages/core/src/lib/plugins/navigation-feedback -g '*.ts' -g '*.tsx'`
- Extracted-file audit:
  `git ls-files --others --exclude-standard packages/core/src/lib/utils packages/core/src/lib/plugins/dom packages/core/src/lib/plugins/navigation-feedback packages/core/type-tests packages/plite* | sort`
- Package proof:
  `pnpm --filter @platejs/core typecheck`
  `pnpm --filter @platejs/plite typecheck`
  `pnpm --filter @platejs/core lint`
  `pnpm --filter @platejs/plite lint`
- Plan proof:
  `node .agents/skills/autogoal/scripts/check-complete.mjs docs/plans/2026-07-01-plate-next-hotkeys-composing-dom-api.md`

Constraints:
- Plate Core uses the Plite DOM API shape directly.
- No compatibility guard, helper wrapper, `any`, or duplicate Plate API around
  `isComposing`.
- No unrelated Core/package sweep.
- No rename churn.

Boundaries:
- Edited `packages/core/src/lib/utils/hotkeys.ts`,
  `packages/core/src/lib/plugins/dom/DOMPlugin.ts`, and this plan.
- Plite source stayed unchanged because its DOM API already exposes
  `isComposing`.
- Docs/browser surfaces were not touched.

Output budget strategy:
- Read only the target file and narrow DOM API owner files.
- Use focused `rg` sweeps for the same smell instead of broad Core output.
- Cap command output to proof summaries.

Blocked condition:
Blocked only if Core could not type `editor.api.dom.isComposing()` after
preserving the Plite DOM API surface. That did not happen.

Phase / pass table:
| Phase | Status | Evidence |
|-------|--------|----------|
| Checkpoint zero | done | User target, non-goals, proof, source audit, and boundaries recorded. |
| Source review | done | `hotkeys.ts`, `DOMPlugin.ts`, Plite DOM API owners, and existing callers inspected. |
| Patch | done | Hotkeys uses direct `editor.api.dom.isComposing()`; `DomConfig` exposes `PlateDomApi = DOMApi & Plate extras`. |
| Related sweep | done | Same-class composing guard audit has only the direct hotkeys call. |
| Proof | done | Core/Plite typecheck and lint passed. |
| Closeout | done | Plan records evidence, risk, changed list, and next owner. |

Start Gates:
| Gate | Applies | Evidence |
|------|---------|----------|
| Prompt requirements captured before work | yes | User called out the exact bad guard in `hotkeys.ts` and asked `plate-next repair`. |
| `plate-next` skill/rule read | yes | Skill read before patching. |
| Active goal checked or created | yes | No active goal existed; this goal was created. |
| Mode classified as named packet vs broad Core sweep | yes | Named Core utility/API packet. |
| Review target recorded as best Plate v2 / Plite-fit / no legacy compat | yes | Direct `editor.api.dom.isComposing()` is the target. |
| Broad Core drift ledger initialized when in scope | N/A | Not a broad Core sweep. |
| Source of truth and allowed workspace recorded | yes | Current checkout, Core hotkeys utility, Core DOM plugin, Plite DOM API owner files. |
| Output budget strategy recorded | yes | Narrow reads and focused `rg` sweeps. |
| Public API fork routing checked | yes | No public API fork; this is cleanup of an existing DOM API call. |
| Gap policy checked | yes | Missing typed DOM API was handled at the Core DOM type owner. |
| Related Core sweep policy checked | yes | Same-class guard/caller sweep ran. |
| Review-mode rename freeze checked | yes | No rename. |

Work Checklist:
- [x] First checkpoint copied explicit target, boundary, stop condition, and
      proof before code edits.
- [x] Mode classified as named Core API cleanup.
- [x] Best Plate v2 call recorded: use `editor.api.dom.isComposing()`.
- [x] Legacy/backcompat decision recorded: no local existence/type guard.
- [x] Gap rule recorded: patch owner typing if the direct call fails.
- [x] Patched `hotkeys.ts`.
- [x] Patched `DOMPlugin.ts` so `DomConfig` preserves Plite `DOMApi`.
- [x] Ran related `isComposing` sweep.
- [x] Ran Core/Plite typecheck.
- [x] Ran Core/Plite lint.
- [x] Recorded changed list, proof, risks, and next owner.
- [x] Run final `check-complete.mjs`.

Completion Gates:
| Gate | Applies | Required action | Evidence |
|------|---------|-----------------|----------|
| Named verification threshold | yes | Direct DOM call in `hotkeys.ts` | `hotkeys.ts` calls `editor.api.dom.isComposing()`. |
| Best Plate v2 recommendation | yes | Record accepted shape and rejected guard | Direct DOM API, no local guard. |
| Plite/Plate gap ledger | yes | Record blocker or N/A | No Plite source gap; Core `DomConfig` was narrowing the API. |
| Related Core sweep after correction | yes | Run same-class `rg` sweep | One match remains: the direct hotkeys call. |
| Package/API proof | yes | Run Core/Plite typechecks | Both passed. |
| Source audit | yes | Audit old guard patterns | No `'isComposing' in dom` or `typeof dom.isComposing` guard remains. |
| Extracted-file inventory | yes | Record untracked files in scope | One unrelated untracked type-test exists; left untouched. |
| Final lint/check | yes | Run Core/Plite lint | Both passed. |
| Changed list / top drift / needs attention | yes | Fill handoff ledgers | Filled below. |
| Goal plan complete | yes | Run `check-complete.mjs` | Ready to run. |

Review matrix:
| Path / API | Drift score | Verdict | Owner | Evidence | Next |
|------------|-------------|---------|-------|----------|------|
| `packages/core/src/lib/utils/hotkeys.ts` | 0 | main-parity-cleanup | Core hotkeys | Local guard removed; direct DOM API call is typed. | Keep. |
| `packages/core/src/lib/plugins/dom/DOMPlugin.ts` | 1 | main-parity-cleanup | Core DOM plugin | `DomConfig` now composes `DOMApi` with Plate extras instead of narrowing `dom`. | Keep. |
| `editor.api.dom.isComposing` | 0 | keep-in-plate-callsite | Plite DOM API | Plite DOM/React expose `isComposing` on `api.dom`; Core preserves that type. | Keep. |

Best Plate v2 recommendation:
| Target | Recommended shape | Rejected legacy/hack alternatives | Reason | User-review need |
|--------|-------------------|-----------------------------------|--------|------------------|
| Hotkeys composing check | `editor.api.dom.isComposing()` | Local `'isComposing' in dom` guard; wrapper helper; fallback false | DOM API owns composing state. Core DOM plugin must not narrow the DOM group. | None. |

Plite / Plate gap ledger:
| Gap type | Missing capability | Why local workaround is a hack | Smallest owner | Proof needed | Decision |
|----------|--------------------|-------------------------------|----------------|--------------|----------|
| Core type gap | Core `DomConfig` narrowed `api.dom` to Plate extras | Every call site would need defensive guards despite Plite owning DOM methods | `packages/core/src/lib/plugins/dom/DOMPlugin.ts` | Core typecheck | Fixed by `PlateDomApi = DOMApi & Plate extras`. |

Related Core sweep ledger:
| Trigger correction | Sweep query / method | Matches | Patched | Deferred | Remaining risk |
|--------------------|----------------------|---------|---------|----------|----------------|
| Remove composing local guard | `rg -n "isComposing' in dom|typeof dom\\.isComposing|dom\\.isComposing|api\\.dom\\.isComposing" ...` | 1 direct call after patch | 1 | 0 | Low. |
| Preserve DOM namespace type | `rg -n "PlateDomApi|DOMApi|isAutoScrolling|scrollIntoView|isComposing" packages/core/src/lib/plugins/dom ...` | 17 owner/test/navigation matches | 2 source owners reviewed | 0 | Low; navigation still guards optional `scrollIntoView`, which is a different optional service. |

Extracted file ledger:
| Path | Bucket | Origin/main owner check | Decision | Proof |
|------|--------|-------------------------|----------|-------|
| `packages/core/type-tests/plate-extension-merge-contracts.ts` | defer-with-owner | Out of this target; pre-existing unrelated untracked type-test in scoped inventory | Left untouched | Not created or needed by this packet. |

Changed list:
| Group | Current-run changes |
|-------|---------------------|
| code/runtime/API | `hotkeys.ts` direct call; `DOMPlugin.ts` `PlateDomApi` type preserving Plite `DOMApi`. |
| tests/proof | No test files changed; Core/Plite typecheck and lint prove the API shape. |
| docs/templates/skills | This autogoal plan. |
| reverted/quarantined packets | None. |

Needs your attention:
| Rank | Item | Why | Anchor | Recommendation |
|------|------|-----|--------|----------------|
| 1 | No decision needed | This is the clean owner fix you asked for. | `editor.api.dom.isComposing()` | Keep. |

Findings:
- The bad code was not just a call-site smell. Core `DomConfig` was narrowing
  `api.dom`, so TypeScript could not see Plite DOM methods from Core utilities.
- Plite already owns composing state through the DOM API.

Decisions and tradeoffs:
- Chose `PlateDomApi = DOMApi & { isAutoScrolling; scrollIntoView? }`.
- Kept `scrollIntoView` optional because it is a host service; navigation has a
  separate optional-service guard for it.
- Did not add a runtime fallback for `isComposing`; Core editors are expected
  to have the DOM API in this lane.

Error attempts:
| Error / failed attempt | Count | Next different move | Resolution |
|------------------------|-------|---------------------|------------|
| Direct hotkeys call before owner type fix | 1 | Patch the owner API type instead of restoring the guard | `DomConfig` now preserves `DOMApi`. |

Verification evidence:
- `rg -n "isComposing' in dom|typeof dom\\.isComposing|dom\\.isComposing|api\\.dom\\.isComposing" packages/core/src packages/core/type-tests packages/plite* -g '*.ts' -g '*.tsx'`
  returned only `packages/core/src/lib/utils/hotkeys.ts:90` with the direct
  call.
- `git ls-files --others --exclude-standard packages/core/src/lib/utils packages/core/src/lib/plugins/dom packages/core/src/lib/plugins/navigation-feedback packages/core/type-tests packages/plite* | sort`
  returned only unrelated `packages/core/type-tests/plate-extension-merge-contracts.ts`.
- `pnpm --filter @platejs/core typecheck` passed.
- `pnpm --filter @platejs/plite typecheck` passed.
- `pnpm --filter @platejs/core lint` passed.
- `pnpm --filter @platejs/plite lint` passed.

Final handoff contract:
- Target surface and mode: named Core hotkeys DOM API cleanup.
- Files/APIs reviewed: `hotkeys.ts`, `DOMPlugin.ts`, Plite DOM API owners, DOM
  navigation matches.
- Broad Core drift score coverage: N/A.
- Best Plate v2 recommendation: direct DOM API call and owner type fix.
- Verdict matrix summary: one Core hotkeys cleanup, one Core DOM owner type
  cleanup, no Plite source gap.
- Plite/Plate gaps or blockers: Core type gap fixed.
- Related Core sweep query/matches/patched/deferred: recorded above.
- Changes made: local guard removed; DOM API type widened to include Plite
  DOM methods.
- Tests/proof commands: recorded above.
- Old compatibility names audited: guard pattern has no matches.
- Needs attention: none.
- Next best Plate Next packet: continue user-led Core file/API review.

Reboot status:
| Question | Answer |
|----------|--------|
| Where am I? | Completed a narrow Plate Next Core API cleanup. |
| Where am I going? | Close the goal after the mechanical plan check. |
| What is the goal? | Remove hotkeys local composing guard and preserve DOM API typing. |
| What have I learned? | Core DOM plugin type narrowing was the real owner bug. |
| What have I done? | Patched source, ran sweeps, typecheck, and lint. |

Open risks:
- None for this packet.
