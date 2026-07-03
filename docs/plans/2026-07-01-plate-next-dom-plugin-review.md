# plate-next-dom-plugin-review

Objective:
Fully review `packages/core/src/lib/plugins/dom/DOMPlugin.ts`, fix accepted Plate/Plite DOM smells, and prove the same-class DOM sweep is clean.

Completion threshold:
- `DOMPlugin.ts` keeps the main owner and implements only the clean Plate layer: auto-scroll state and tx ergonomics over Plite DOM.
- Plite owns the DOM substrate and receives `scrollIntoView` options unchanged.
- No accepted local duplicate target shape, stale optional scroll wrapper, `withScrolling`, broad cast, or compat bridge remains in the named DOM scope.
- Focused DOM/navigation tests, Core typecheck, Plite DOM tests, biome, source audits, and this plan check pass.

Verification surface:
- `pnpm --filter @platejs/core exec bun test src/lib/plugins/dom src/lib/plugins/navigation-feedback`
- `pnpm --filter @platejs/core typecheck`
- `pnpm --filter @platejs/plite-dom test test/scroll-into-view.test.ts test/public-surface-contract.test.ts`
- `pnpm exec biome check packages/core/src/lib/plugins/dom/DOMPlugin.ts packages/core/src/lib/plugins/dom/DOMPlugin.spec.ts packages/core/src/lib/plugins/navigation-feedback/transforms/navigate.ts packages/plite-dom/src/plugin/dom-editor.ts packages/plite-dom/test/scroll-into-view.test.ts`
- `rg -n "hasScrollIntoView|hasDOMScrollApi|DOMScrollApi|DOMFocusApi|scrollIntoView\\?|editor\\.api\\.scrollIntoView|editor\\.api\\.dom\\.scrollIntoView\\?|withScrolling|as any" packages/core/src/lib/plugins/dom packages/core/src/lib/plugins/navigation-feedback/transforms packages/core/type-tests --glob '!**/dist/**'`

Constraints:
- Use `origin/main` as evidence, not as a compatibility target.
- Keep review-mode rename freeze; no file, export, or plugin naming cleanup in this packet.
- No public compat aliases, old Slate shims, duplicate Plate wrappers around Plite DOM, or helper dumps.
- If clean behavior needs missing substrate, record a Plite gap instead of adding a Plate workaround.
- Do not broaden into all-Core migration; the user named `DOMPlugin.ts`.

Boundaries:
- Allowed edits: `DOMPlugin.ts`, `DOMPlugin.spec.ts`, and directly related same-class DOM proof.
- Package/API surface: Core DOM plugin consuming Plite DOM.
- Docs/browser surface: not applicable; no user-facing docs or route changed.
- Non-goals: broad Core sweep, package migration, naming cleanup, PR/release work, unrelated navigation-feedback fixture typing.
- Out-of-scope package errors: no non-Core package errors occurred.

Blocked condition:
Blocked only if `DOMPlugin.ts` needs a missing Plite DOM primitive. No blocker was found.

Start Gates:
| Gate | Applies | Evidence |
|------|---------|----------|
| Prompt requirements captured before work | yes | User asked to fully review `DOMPlugin.ts` so no other smell |
| `plate-next` skill/rule read | yes | `.agents/skills/plate-next/SKILL.md` read |
| Active goal checked or created | yes | Active goal created for this plan |
| Mode classified | yes | Named-file Plate Next review; broad Core sweep not in scope |
| Review target recorded as Plite-fit | yes | Plate auto-scroll over Plite DOM substrate |
| Source of truth recorded | yes | Current checkout with `origin/main` as evidence |
| Output budget strategy recorded | yes | Targeted `sed`/`rg` only |
| Gap policy checked | yes | No Plite or Plate gap blocked the review |
| Related Core sweep policy checked | yes | Same-class DOM sweeps recorded below |
| Rename freeze checked | yes | No renames proposed or applied |

Work Checklist:
- [x] Copied every explicit prompt requirement, scope boundary, stop condition, and proof surface into this plan.
- [x] Classified the work as a named-file Plate Next packet, not broad Core sweep.
- [x] Recorded the best Plate v2 call for each reviewed API/helper.
- [x] Rejected legacy/backcompat shapes: optional scroll wrappers, old `withScrolling`, duplicate Plate scroll APIs, and broad casts.
- [x] Recorded the hack check: no bridge dump, fake alias, or displaced product behavior kept.
- [x] Recorded gap status: no missing Plite or Plate capability blocked this packet.
- [x] Added related sweep rows for each correction class.
- [x] Marked broad Core drift ledger as not applicable for this named-file request.
- [x] Applied bridge scoring law; no forbidden bridge is imported or installed by the named DOM scope.
- [x] Filled the review matrix for every inspected file/API/helper.
- [x] Checked public API fork routing; no `plate-plan` fork was needed.
- [x] Applied rename freeze; no rename ledger entry needed.
- [x] Closed extracted-file inventory for target scope.
- [x] Kept the safe cleanup packet after proof.
- [x] Ran focused package proof after code changes.
- [x] Recorded `pnpm brl` as not applicable because no exports/barrels changed.
- [x] Ran exact source audits for removed legacy/smell patterns.
- [x] Filled changed list, needs-attention rows, and next owner.
- [x] Followed output budget discipline.

Completion Gates:
| Gate | Applies | Evidence |
|------|---------|----------|
| Named verification threshold | yes | DOM/navigation tests, Core typecheck, Plite DOM tests, biome, and audits passed |
| Broad Core drift ledger coverage | N/A | User named `DOMPlugin.ts`; no broad Core sweep |
| Score gate | yes | All inspected rows score clean after patch |
| Best Plate v2 recommendation | yes | Keep DOMPlugin as Plate auto-scroll over Plite DOM; reject option reshaping and local target duplicate |
| Plite/Plate gap ledger | yes | No gap blocks this packet |
| Related Core sweep after correction | yes | Sweep rows recorded below |
| Package/API proof | yes | Core typecheck and Plite DOM tests passed |
| Non-Core package error triage | yes | No non-Core proof failures |
| Source audit | yes | Legacy optional scroll/wrapper audit returned zero matches |
| Rename ledger | N/A | No rename proposed |
| Extracted-file inventory | yes | One unrelated type-test found outside named DOM scope and left untouched |
| Review gate | N/A | Tiny named-file implementation; focused proof used |
| Final lint/check | yes | Scoped biome check passed |
| Changed list / needs attention | yes | Filled below |
| Goal plan complete | yes | `check-complete.mjs` to run after this record |

Phase / pass table:
| Phase | Status | Evidence |
|-------|--------|----------|
| Checkpoint zero | complete | Prompt, scope, non-goals, and proof copied before code edits |
| Source review | complete | `DOMPlugin.ts`, `DOMPlugin.spec.ts`, main version, Plite DOM, and navigation caller reviewed |
| Runtime cleanup | complete | Plite `Point` used and final `scrollIntoView` call passes options through unchanged |
| Test cleanup | complete | DOMPlugin test casts removed; option pass-through regressions added |
| Related sweep | complete | Same-class DOM queries recorded with no runtime leftovers |
| Proof | complete | All focused commands passed |

Review matrix:
| Path / API | Drift score | Verdict | Owner | Evidence | Next |
|------------|-------------|---------|-------|----------|------|
| `packages/core/src/lib/plugins/dom/DOMPlugin.ts` | 0 | main-parity-cleanup | Plate DOM plugin | Uses Plite `Point`, installs `pliteDom()`, keeps only Plate auto-scroll state/tx, passes `scrollOptions` unchanged | Keep |
| `packages/core/src/lib/plugins/dom/DOMPlugin.spec.ts` | 0 | justify-new-proof-tooling | Core DOM tests | Object and boolean scroll option pass-through regressions added; DOMPlugin test `as any` casts removed | Keep |
| `packages/core/src/lib/plugins/navigation-feedback/transforms/navigate.ts` | 0 | keep-in-plate | Navigation feedback | Directly calls `editor.api.dom.focus()` and `editor.api.dom.scrollIntoView(point)` with no optional wrapper | Keep |

Best Plate v2 recommendation:
| Target | Recommended shape | Rejected legacy/hack alternatives | Reason | User-review need |
|--------|-------------------|-----------------------------------|--------|------------------|
| `DOMPlugin` | Plate DOM composes Plite DOM and owns auto-scroll only | Local scroll target shape, apply-time scroll option rewriting, optional scroll guards, old `withScrolling` bridge | Clean ownership: Plite DOM substrate, Plate operation-scoped auto-scroll behavior | No |

Plite / Plate gap ledger:
| Gap type | Missing capability | Why local workaround is a hack | Smallest owner | Proof needed | Decision |
|----------|--------------------|-------------------------------|----------------|--------------|----------|
| N/A | No missing capability | N/A | N/A | Focused proof green | Closed |

Related Core sweep ledger:
| Trigger correction | Sweep query / method | Matches | Patched | Deferred | Remaining risk |
|--------------------|----------------------|---------|---------|----------|----------------|
| Scroll option pass-through | `rg -n "scrollIntoView\\(|scrollOptions" packages/core/src/lib/plugins/dom packages/core/src/lib/plugins/navigation-feedback/transforms packages/core/type-tests --glob '!**/dist/**'` | 18 | 1 runtime call and 2 tests | 0 | Clean |
| Legacy scroll wrapper/cast audit | `rg -n "hasScrollIntoView|hasDOMScrollApi|DOMScrollApi|DOMFocusApi|scrollIntoView\\?|editor\\.api\\.scrollIntoView|editor\\.api\\.dom\\.scrollIntoView\\?|withScrolling|as any" packages/core/src/lib/plugins/dom packages/core/src/lib/plugins/navigation-feedback/transforms packages/core/type-tests --glob '!**/dist/**'` | 0 | 0 | 0 | Clean |
| DOM API caller audit | `rg -n "editor\\.api\\.dom\\.scrollIntoView|editor\\.api\\.dom\\.focus|isAutoScrolling|pliteDom\\(" packages/core/src/lib/plugins/dom packages/core/src/lib/plugins/navigation-feedback/transforms packages/core/type-tests --glob '!**/dist/**'` | 11 | 0 | 0 | Clean |

Extracted file ledger:
| Path | Bucket | Origin/main owner check | Decision | Proof |
|------|--------|-------------------------|----------|-------|
| `packages/core/type-tests/plate-extension-merge-contracts.ts` | out-of-scope | Not under DOM plugin or navigation transform scope; found only because type-test owner path was included in inventory command | Leave untouched | N/A for this named-file packet |

Changed list:
| Group | Current-run changes |
|-------|---------------------|
| code/runtime/API | `DOMPlugin.ts`: local scroll target type now uses Plite `Point`; auto-scroll passes `scrollOptions` directly to Plite DOM; stale plugin comment fixed |
| tests/proof | `DOMPlugin.spec.ts`: object and boolean scroll option pass-through tests added; DOMPlugin test casts removed |
| docs/templates/skills | This autogoal plan updated |
| reverted/quarantined packets | None |

Needs your attention:
| Rank | Item | Why | Anchor | Recommendation |
|------|------|-----|--------|----------------|
| 1 | Unrelated navigation-feedback spec casts remain | Broad audit outside runtime transform scope still shows old fixture `as any` in the navigation-feedback spec | `packages/core/src/lib/plugins/navigation-feedback/NavigationFeedbackPlugin.spec.ts` | Defer to a separate navigation-feedback test-fixture typing cleanup |

Findings:
- `DOMPlugin.ts` accepted Plite `ScrollIntoViewOptions` but rewrote the final call into an object with forced `scrollMode: 'if-needed'`, which dropped boolean options and overrode explicit object options.
- The local `{ path; offset }` scroll target duplicated Plite `Point`.
- The old placeholder comment no longer described the file.

Decisions and tradeoffs:
- Keep `DOMPlugin` as the Plate owner.
- Do not move auto-scroll into Plite; it is product/plugin behavior around operations, not generic DOM substrate.
- Keep `pliteDom()` installed here for base editors.
- Do not broaden into navigation-feedback fixture casts in this named-file packet.

Error attempts:
| Error / failed attempt | Count | Next different move | Resolution |
|------------------------|-------|---------------------|------------|
| Initial Core typecheck failed after removing test `any` | 1 | Keep source types strict and adjust assertion shape | Replaced optional property reads with `toMatchObject` |
| Initial biome check requested formatting | 1 | Apply exact formatter shape | Collapsed WeakMap type line |

Verification evidence:
- `pnpm --filter @platejs/core exec bun test src/lib/plugins/dom src/lib/plugins/navigation-feedback` -> 17 pass.
- `pnpm --filter @platejs/core typecheck` -> pass.
- `pnpm --filter @platejs/plite-dom test test/scroll-into-view.test.ts test/public-surface-contract.test.ts` -> 19 pass.
- `pnpm exec biome check packages/core/src/lib/plugins/dom/DOMPlugin.ts packages/core/src/lib/plugins/dom/DOMPlugin.spec.ts packages/core/src/lib/plugins/navigation-feedback/transforms/navigate.ts packages/plite-dom/src/plugin/dom-editor.ts packages/plite-dom/test/scroll-into-view.test.ts` -> pass.
- Legacy wrapper audit returned zero matches in DOM/navigate/type-test scope.

Final handoff contract:
- target surface and mode: named-file review of `DOMPlugin.ts`.
- files/APIs reviewed: `DOMPlugin.ts`, `DOMPlugin.spec.ts`, `navigation-feedback/transforms/navigate.ts`, Plite DOM scroll contract.
- broad Core drift score coverage: N/A; user did not request broad Core sweep.
- best Plate v2 recommendation: keep DOMPlugin as Plate auto-scroll over Plite DOM, no compatibility wrapper.
- verdict matrix summary: three reviewed rows, all clean after patch.
- Plite/Plate gaps or blockers: none.
- related Core sweep query/matches/patched/deferred: 18 scroll option/caller matches reviewed, 1 runtime patch, 2 tests added, 0 deferred in DOM scope.
- changes made: runtime option pass-through, local Point typing, comment cleanup, DOM tests.
- tests/proof commands: listed in Verification evidence.
- old compatibility names audited: legacy optional scroll/wrapper query returned zero matches in DOM/navigate/type-test scope.
- needs attention: unrelated navigation-feedback fixture casts if you want a separate test typing cleanup.
- next best Plate Next packet: navigation-feedback spec fixture typing cleanup or continue named-file review queue.

Reboot status:
| Question | Answer |
|----------|--------|
| Where am I? | Closed scoped DOMPlugin review |
| Where am I going? | Final handoff |
| What is the goal? | Fully review `DOMPlugin.ts`, fix accepted DOM smells, and prove same-class DOM sweep green |
| What have I learned? | The only real DOMPlugin smell was option pass-through plus local Point duplication |
| What have I done? | Patched runtime/tests, swept same-class DOM patterns, and ran focused proof |

Timeline:
- 2026-07-01T22:13Z Goal plan created and checkpoint zero filled.
- 2026-07-01T22:14Z Patched scroll option pass-through and Plite `Point` target typing.
- 2026-07-01T22:16Z Added DOM pass-through regressions and removed DOMPlugin test casts.
- 2026-07-01T22:18Z Focused tests, typecheck, Plite DOM tests, biome, and audits passed.

Open risks:
- Unrelated navigation-feedback fixture casts remain outside this named-file DOMPlugin review.
