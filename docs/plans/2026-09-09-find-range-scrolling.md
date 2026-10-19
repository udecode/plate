# Find range scrolling

Objective:
Replace the copied Find decoration query and manual animation-frame scheduling with `editor.api.dom.scrollIntoView(activeMatch.range)`, preserving cancellation, navigation and the exact mounted view.

Mode:
Local implementation authorized by the user's “go” after the range-scroll recommendation. Current checkout: next. No commit, push, PR, other feature cleanup or public messages.

Completion threshold:
Find uses the semantic range and the existing DOM scheduler; closing, changing targets and unmounting cancel the pending request. Focused package/type/browser proof and generated registry output agree with the final source. Broader unrelated failures remain explicitly identified.

Verification surface:
Copied Find controller and its specs; Plite DOM scroll method and its existing scheduler contract; inherited Plate DOM facade; the actual /blocks/find-demo route; current public scrolling documentation and affected source doctrine.

Constraints:
Preserve source owners, search semantics, keyboard behavior, native selection, source scheduling and static behavior. Do not create another scroll API, scheduler, store or Find-specific substrate branch. No proactive git status, checkout changes or unrelated edits.

Boundaries:
The existing DOM method already schedules work but drops its cancellation handle. Return that handle from the same operation. Preserve cancellation across both frames of explicit always-scroll navigation. Keep Find's effect in its copied bar and semantic matching in BaseFindPlugin. The pending Comments composition recommendation is a separate scope.

Blocked condition:
An unavailable real browser capability limits that proof claim after a concrete attempt. In-scope implementation failures remain actionable. No scheduling or publication is authorized.

Work checklist:
- [x] Record baseline and prove cancellation at the existing DOM owner; preserve current navigation and exact-view behavior. Sources: Task workflow, Testing, Verify Plate. Existing six scroll cases passed; four added cancellation cases failed before the API returned cleanup, then all ten passed.
- [x] Return request cleanup through the existing DOM method and inherited facade; consume it from the copied Find bar. Sources: Best API, Plate UI, Plite source law. The effect reads `activeMatch` and returns `scrollIntoView(activeMatch.range, { block: 'nearest', inline: 'nearest', scrollMode: 'if-needed' })`.
- [x] Prove range scrolling, replacement, close and unmount; run focused package/source types and the real route at desktop/narrow sizes. Sources: Verify Plate, Plate UI. Package, component and distant-range browser evidence is recorded below; the unrelated pre-existing focus failure remains explicit.
- [x] Repair affected API teaching and append doctrine version, regenerate rule/registry output, check formatting and source identities. Sources: Best API self-maintenance, root AGENTS. Updated public DOM docs, Best API, Plate UI and the existing Plite scheduler law; doctrine 173 validates with generated mirrors. Registry generation and direct payload readback pass.
- [x] Reconcile the source-linked obligations, evidence and final local handoff in this same plan. Sources: Autogoal, Task workflow. Local scope is complete; no publication or package attestation is implied.

Decision trail:
- The DOM query depends on decoration spans even though Find already owns the full matched range. Existing `activeMatch` and range-scroll APIs replace that indirection.
- Returning the existing scheduler cancellation function is smaller than adding an AbortSignal option, a cancel-scroll namespace or another controller scheduler. The explicit two-frame navigation path retains cleanup for both deferred stages. No new runtime owner is accepted; an additional scale probe is N/A for forwarding existing request lifetime.
- Structured Autoreview is N/A on next. No independent agent review is requested. The package/runtime and copied UI owners are being handled sequentially.
- Keep the effect in `FindBar`: a second consumer of the public controller must not create another scrolling effect. Its view-bound editor preserves the exact mounted DOM target.
- No files or barrel exports moved. The existing Plite DOM changeset describes the public cancellation return. General workflow routing did not change, so Agent Native Reviewer and cross-project workflow sync are N/A. Existing package attestations remain untouched.

Verification evidence:
The source fingerprints, command logs and result manifest are in [the local receipt](../../.tmp/find-range-scrolling/receipt.json).

| Check | Result |
| --- | --- |
| `pnpm --filter plitejs test:entrypoint:dom` | 239 passed, 0 failed across 17 files, including all ten scroll cases. |
| Find component and affected Plate DOM/navigation/footnote specs | 29 passed, 1 pre-existing Escape return-focus failure. The new range/effect cleanup test passes. |
| Plite DOM and Plate React entrypoint typechecks | Both passed. |
| `pnpm --filter www typecheck` | Passed, including editor generation, API reference, MDX, docs and registry source parity, route types, application types and package integration. |
| Chromium distant-range browser case | Passed at 1280×720 and 390×844. Two matches separated by 70 lines; next/previous makes each active match fully intersect the viewport and clipping ancestors, retaining input focus and canonical selection. Closing removes matches. |
| Existing Find browser case | Search, wrapping and narrow placement pass; final Escape return-focus assertion fails. |
| Interactive in-app browser | Verified the same `/blocks/find-demo` route, search, next/previous, narrow bar and close. The editor does not regain focus after close. Temporary viewport override reset. |
| Scoped Ultracite fix/check | Passed on affected source and tests. |
| Registry generation | Passed; direct generated Find and DOM-reference payload readback matches the new calls and return type. |
| Doctrine and generated teaching | Version 173 validates after `pnpm install`; affected execution owners contain no conflicting scroll pattern. |

Serving identity: the existing server on port 3297 serves `/Users/zbeyens/git/plate-2/apps/www`. This is focused local package/browser proof, not a full browser matrix or release claim.

Open risks:
- Escape return focus already failed in the component baseline before this refactor and remains red in component and browser proof. That separate focus behavior is not fixed by this scrolling change.
- No raw-device or full browser-matrix claim is made. The narrow proof uses a Chromium viewport.

Next action:
Complete for the authorized local scrolling scope. Escape return focus remains a separate actionable defect.
