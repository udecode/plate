# Find view ownership

Objective:
Remove model-scoped Find UI state and commands. Each mounted view owns its Find opening, draft, deferred execution, focus and scroll effects; headless search remains editor-owned.

Completion threshold:
Opening Find in one view creates one bar and focuses that view's input, including two views of one model and two Editables under one Plate. Search, navigation, selection, close, IME, pending input, detach and current custom controls retain behavior. Docs and copied registry output teach the final contract.

Verification surface:
Copied Find source/spec, actual Find demo with a same-model two-view example, existing Find browser cases, BaseFindPlugin tests, source types, EN/CN docs, registry and doctrine output.

Constraints:
User said “go” after the source-backed Best API Review. Local design, implementation and proof are authorized; next branch confirmed. No commits, publication, other checkout, parallel agents or unrelated product fixes. No independent query sessions or generic per-view plugin store.

Boundaries:
BaseFindPlugin retains query/results, document invalidation, navigation, selection and decorations. The copied kit uses existing slots.wrapRoot for exact-view integration. A copied useFind hook exposes only view-owned open/close commands; it owns neither search results nor effects per caller. Custom controls mount in that view's slots. Root composition owns its bar and local pending draft. All open bars follow the committed model query when no local draft is pending.

Blocked condition:
A missing actual browser capability limits that proof after a concrete attempt. All independent proof continues; actionable source or test failures remain work.

Work Checklist:
- [x] Capture a failing opening-focus test without manually focusing the input; preserve existing acceptance and caller inventory. Sources: accepted Best API Review, Patch, Testing.
- [x] Choose the smallest public contract and exact-view lifecycle; compare keep, delete, owner move and new primitive. Preserve inferred callbacks. Sources: Best API, Plate Plan, Plate UI, VISION.
- [x] Replace copied plugin UI state/commands with view composition. Keep typed headless calls and narrow result subscriptions; verify deferred draft commits cannot revive a closed query. Sources: Plate UI, Poteto Refactoring/Bug fix.
- [x] Prove command-control scaling, same-model views, nested providers, pending input, read-only search, detach and surviving views. Sources: Best API scale gate, Verify Plate.
- [x] Run focused component/headless/type checks and fresh-process browser replay with five warm opening/closing cycles, desktop/narrow state and follow-up typing. Sources: Patch, Verify Plate, user's no-regression requirement.
- [x] Update EN/CN examples, smallest source doctrine and version/mirrors, registry output and changelog. Inspect final source and retain fingerprints. Sources: Best API repair, Task docs, Registry Changelog.
- [x] Reconcile requirements, final evidence and limits; validate this plan and close the goal. Sources: Autogoal, Task.

Decisions:
- The review probe opened two bars and focused the second view when the first view's command ran. Shared model UI state plus per-bar autofocus is the cause; the old close test explicitly focused an input and did not cover opening.
- Existing slots.wrapRoot provides the exact mounted editor and Editable ref. It earns reuse without a new framework store, plugin, global event bus or package React entrypoint. Moving this UI into npm would retain the wrong lifetime; deleting headless search would move document invalidation into React.
- Copy a single view-owned command context for open/close. Commands do not subscribe to results. Each bar reads committed semantic query and keeps only an uncommitted draft locally; a submitted draft retires without overwriting newer input.
- Autoreview is N/A on next. No workflow routing changes are intended.

Verification evidence:
Local proof complete. Receipts: `.tmp/find-view-ownership/receipt.json`; decision trail: `.tmp/find-view-ownership/decisions.tsv`.

| Acceptance | Final evidence |
| --- | --- |
| Opening regression | `opening-red.log`: both existing keyboard paths opened two bars, expected one. The final one-provider and two-provider cases open one bar and focus its input without a manual focus step. |
| Component, headless and slot behavior | `semantic-and-slots.log`: 50 tests pass, 227 assertions. Includes 20 Find UI cases, 5 BaseFind cases and 25 PlateContent slot cases. |
| View/control scale | One, two and five custom controls preserve programmatic queries without result-driven renders; two same-model views and two Editables under one Plate, nested providers and Strict Mode pass. |
| Lifecycle and native intent | Pending-close cannot restore a query; inactive bars do not scroll; detach preserves shared query and surviving view; read-only search and close focus, IME, selection seeding, command selection, navigation and document updates pass. |
| DOM scroll owner | `dom-current.log`: 10 Plite DOM scroll cases pass, 32 assertions. The old Plate `dom` partition is no longer registered; its rejected command is retained in `dom.log` and contributes no proof. |
| Browser | `browser-final.json`: 3/3 Chromium cases pass, zero retries, skips or flaky outcomes. Five warm keyboard open/close cycles and five shared-view open/detach cycles, desktop 1280 and narrow 390 viewports, distant ranges, selection retention and follow-up typing/undo. |
| Interactive browser | Fresh in-app tab at `/blocks/find-demo`: native Command+F opens only the first view, second opening preserves the committed query, typing updates both committed values, detach keeps the first result, Escape returns typing to the first editor, undo restores text. |
| Types and generated output | Plate React source types and full www typecheck pass. Registry build, source parity, changelog check and scoped lint pass. The generated `find` payload contains the final hook, and the generated example index imports the current `find-demo` source with its button dependency. |
| Doctrine | Best API and Plate UI teach model semantics versus exact Editable UI commands. Doctrine 178 and generated mirrors validate; prior versions and package attestations are preserved. |

Fresh process: `PLATE_WWW_DIST_DIR=.next-find-view-ownership pnpm --filter www dev:plite --port 3299`, serving PID 63878 with cwd `/Users/zbeyens/git/plate-2/apps/www`. Only this task-owned server is stopped after proof.

Verification setup corrections: native test events use one platform modifier; test-only controls use an independent slot descriptor because configured kits cannot be configured again; the public native hotkey matcher is imported from `platejs/dom`. The initial browser filter `^Find` matched no full test titles and ran zero cases; the final `Find` filter enumerates and passes all three selected cases. No failed or empty run is counted as proof.

Adoption scope: copied `FindPlugin` UI state and commands are deleted. `useFind` exposes only view-owned `open` and `close` in Editable slots; search/navigation/selection retain `BaseFindPlugin`. EN/CN docs and a same-model demo teach that final contract. Package changesets/barrels are N/A because no package API/file changed. Vision already establishes the model/view lifetime law, so no durable taste change is needed. General workflow changes and Agent Native Reviewer are N/A; Autoreview is excluded on next.

Open risks:
No unresolved failure in the selected proof surface. Search query/results intentionally remain shared across views; closing a bar clears that shared query. This is local Chromium/in-app and narrow-viewport proof, not a full browser matrix, native mobile-device, pushed-ref or release claim.

Next action:
Local handoff; no commit, push or publication is authorized.
