# Find controller cut

Objective:
Remove the copied Find controller facade and whole-store subscriptions. Keep one deferred-search effect and use the copied typed descriptor directly for custom controls.

Completion threshold:
Existing search, matching, navigation, selection, IME, pending state and scroll cleanup contracts pass. Additional controls perform no search or result subscriptions. Exact-view focus works after Escape and selection commits. Current docs and copied output teach the final API.

Verification surface:
`apps/www/src/registry/components/editor/find.tsx` and its existing spec, BaseFindPlugin tests, Find browser cases on `/blocks/find-demo`, EN/CN Find reference, copied registry generation and www source types. Existing mounted-view tests inform focus ownership.

Constraints:
User accepted the source review with “ok but make sure no regression”. Local implementation and proof only; current branch next. No commit, publication, checkout change, general Find performance rewrite or new npm Find controller. Sequential execution under the user's tool mapping. Autoreview is N/A on next.

Boundaries:
BaseFindPlugin keeps semantic query/results/invalidation/navigation/selection. The existing copied adapter is exported as FindPlugin and retains bar state and policy. FindKit retains styling and slot composition. Plite is unchanged unless proof identifies a necessary neutral owner repair. Previously observed Escape focus failure is an explicit bug-fix slice, with baseline and final evidence separate from the structural refactor.

Blocked condition:
Unavailable interactive browser capability limits that proof after a concrete attempt; all independent tests and source checks continue. In-scope failures remain actionable.

Work Checklist:
- [x] Pin baseline source/behavior and the exact Escape focus failure; capture sources and complete caller set. Sources: Task workflow, Poteto Refactoring/Bug fix, Patch.
- [x] Prove custom command controls cannot rerun search, and retain deferred-query/close/unmount/navigation behavior. Sources: Testing, Verify Plate, Best API.
- [x] Export the copied descriptor, remove FindController/useFindController, narrow subscriptions and keep one deferred-search effect in FindBar. Preserve inferred callbacks and exact view scope. Sources: Best API, Plate UI, Plate Plan.
- [x] Fix the proven focus owner through the bar's exact mounted editor, preserving current selection and originating mounted view. No timing workaround. Sources: multi-editor plan, Patch.
- [x] Run focused package/component/type checks and real desktop/narrow/browser replay, including five warm focus/lifecycle runs without retries. Record behavior and source identity; no raw-device claim. Sources: Verify Plate, Patch, user no-regression requirement.
- [x] Update EN/CN public examples, source doctrine and required version/mirrors, registry output and relevant changelog; inspect final diff and retained receipts. Sources: Best API repair, Task docs, root AGENTS.
- [x] Reconcile every obligation and report local status and concrete limits. Required proof passes; the native goal can close with this receipt. Sources: Autogoal, Task.

Decisions:
- Delete the mixed controller rather than promote it into npm. Existing API and selectors replace command aliases, duplicated count projection, error text and result snapshots.
- Open/draft/deferred state, input focus, labels, styling and placement remain in copied UI. A standalone command button calls the descriptor API without subscribing or scheduling search.
- No new store, scheduler, result index or lifecycle framework. The deterministic work probe is mounting 1/2/5 command controls around current search; target work is zero added searches or result-driven command-control renders.
- Current read-only review accepted the durable owner split; implementation remains accountable to exact behavior evidence, including stale API cleanup and multiple mounted views.
- Runtime inspection corrected the proposed factory-context fix: Plate API factories resolve once against the model, so changing which construction closure supplies `editor` does not bind a mounted view. The copied `close` command clears search/bar state; the bar performs focus through its own `useEditor()` result. Custom selection controls use the existing `update.select()` plus their mounted editor's DOM focus, eliminating `commitActiveMatch` too. No package/runtime change is needed.
- Baseline: existing component suite 7 pass / 1 Escape-focus failure. New command-control case fails because mounting the old controller changes query `world` to empty. Final component and headless Find suite passes all 20 cases, including 1/2/5 command controls, both mounted views, and direct selection followed by view focus.
- The expanded browser fixture initially omitted hydration readiness. A visible server-rendered editor and DOM selection fallback could pass before shortcut handlers mounted. Restore the existing `editor.ready({ editor: 'visible' })` precondition; no product edit is needed for that fixture failure. This was a new assertion's first execution, not a failed previously accepted browser fix.
- Both default www output directories were in use. The optional `PLATE_WWW_DIST_DIR` config selects a distinct build directory for a fresh app process in this checkout. Final proof uses port 3299 and `.next-find-controller-cut`.
- Best API and Plate UI teach direct typed commands, narrow selectors and component-owned deferred input/focus. Doctrine v176 and generated mirrors validate. Existing Vision already owns semantic state and exact mounted views, so no Vision change is needed. Other affected teaching owners contain no rejected controller shape. No package changeset or barrel generation is needed for this copied-UI export change. General workflow behavior, triggers and routing are unchanged; Agent Native Reviewer and cross-project workflow sync are N/A.

Verification evidence:
Source fingerprints, baseline logs, final command logs and per-run browser timings are in [the local receipt](../../.tmp/find-controller-cut/receipt.json). Prior range-scrolling proof is context; this receipt governs the current change.

| Check | Result |
| --- | --- |
| Find component and BaseFindPlugin tests | 20 passed, 0 failed, 108 assertions. |
| Plite DOM entrypoint tests | 239 passed, 0 failed, including the ten scroll cases. |
| Plate React entrypoint types | Passed. |
| Full www source typecheck | Passed, including editor/API reference generation checks, MDX, docs/registry parity, route types, app types and package integration. |
| Find browser lifecycle | 5/5 warm runs, zero retries: selected-text shortcut, literal search, active styling, keyboard/button navigation and wrapping, narrow placement, Escape/close-button focus, follow-up typing and undo. Run times: 480, 337, 273, 337, 295 ms. |
| Distant-range browser case | Passed at 1280×720 and 390×844, retaining input focus and canonical selection while scrolling each active range fully into view. |
| Interactive in-app browser | Fresh final-process page verified search, navigation, narrow bounds, Escape focus and follow-up typing. Content restored by undo; viewport override reset. |
| Copied registry output | Generated and read back: exported FindPlugin, narrow selectors, conditional deferred search, no controller facade. |
| EN/CN docs, changelog, doctrine | Current examples verified; changelog and v176 source/generated parity pass. |
| Scoped formatting/lint and final diff | Passed and inspected. |

Open risks:
No unresolved failure in the affected checks. Proof is local Chromium and in-app browser coverage, not a full browser matrix or real-device certification. Task changes remain uncommitted and unpushed; later source or integration changes require replay before a broader claim.

Next action:
Complete for the authorized local Find controller cut and focus repair.
