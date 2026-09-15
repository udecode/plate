# Pointer selection across deleted suggestions

Status: Complete

Objective:
Allow a physical mouse drag to expand a selection across retained deleted suggestion text and adjacent live text on `/blocks/suggestion-demo`.

Completion threshold:
Forward and reverse drags cross both live/deleted boundaries, paint the complete visible range once, preserve exact view/model selection ownership, and allow a valid follow-up action without runtime errors.

Verification surface:
The existing `apps/www/tests/browser/suggestion.spec.ts` Chromium runner on a fresh source-serving host, plus focused Plite React tests and typecheck for the owning selection bridge. Five retry-free repeats for the native pointer path.

Constraints:
Current `next` checkout, no commit or publication. Preserve prior caret and suggestion repairs. Deleted content remains retained/read-only. No example-specific workaround or new public API.

Boundaries:
Plite DOM/React selection projection owns the behavior; the www suggestion demo owns browser proof. Root is the only writer for product, test and plan files.

Blocked condition:
If exact physical drag cannot be reproduced or native/view/model endpoints cannot be observed, keep the claim open and improve the existing browser harness before product edits.

Work Checklist:
- [x] Reproduce a forward physical drag from live `this ` into `redundant phrase`: native selection stops at the retained boundary and only `this ` paints; no retained selection marker is produced.
- [x] Add a failing real-pointer browser case spanning both deleted-text boundaries.
- [x] Repair the shared projected-drag endpoint owner.
- [x] Prove forward/reverse selection, paint, focus and follow-up input; run focused checks and five warm repeats.
- [x] Record final evidence and close the goal.

Verification evidence:
`apps/www/tests/browser/suggestion.spec.ts` case `expands a pointer selection across deleted text boundaries` is red on the source-serving route. The first drag reports a view selection but the screenshot paints only live `this `; `[data-editor-retained="delete"] [data-editor-view-selection]` is absent.

A first five-repeat candidate run passed all four drag paths in every iteration, but repeat 4 exposed a follow-up ownership race: an immediate click into paragraph 3 left the prior paragraph's projected selection active long enough for `End` and typing to target paragraph 2. The repair treated this as a product failure rather than hiding it with a test retry.

The retained pointer endpoint now resolves through the shared DOM geometry and projected-DOM selection owners, preserving `fragmentId`, affinity, root, owner and point. Any drag with a retained endpoint uses the view-boundary graph. A retained anchor clears the model selection, while a live anchor keeps the required collapsed model position.

Mouse-down now clears an earlier projected selection before transferring a browser-owned click to a new anchor. This closed the follow-up click/typing race without adding a delay.

Final source-serving host: Next PID 89270, cwd `/Users/zbeyens/git/plate-2/apps/www`, started September 13, 2026 at 22:51:32 local time with `PLATE_WWW_DEV_SOURCE=1` and `PLATE_WWW_DIST_DIR=.next-deleted-pointer`; `/api/plite/ready` returned `{"devSource":true,"plite":false}` and `/blocks/suggestion-demo` returned HTTP 200.

Final proof:
- The exact physical pointer case passed 5/5 serial repeats on the fresh host. Each repeat exercised live-to-retained and retained-to-live drags in forward and backward directions, asserted the exact rendered selection length, no native/view double highlight, correct model ownership, and immediate click/typing in paragraph 3.
- The full `apps/www/tests/browser/suggestion.spec.ts` suite passed 10/10 on the fresh host.
- `packages/plitejs/test/react/root-interaction-controller.test.tsx` passed 10/10.
- `pnpm --filter plitejs typecheck` passed all 13 entrypoint tasks.
- Targeted Ultracite passed for the changed controller, browser spec and changeset.
- `docs/plans/artifacts/suggestion-deleted-pointer-selection/deleted-pointer-selection.png` was inspected and shows one continuous highlight from live `this ` through retained `redundant phras`.

Broader-check note: an accidentally broad React invocation ran 1,273 tests and exposed two existing checkout failures outside this repair. `external-text-contract.test.tsx` returns `stale` where it expects `applied`; `kernel-authority-audit-contract.test.ts` reports one direct-mutation occurrence in the already-modified `mutation-controller.ts`. Focused reruns confirm both remain red and neither failure points at `root-interaction-controller.ts`.

Open risks:
Exact scope covers horizontal Chromium pointer drag on the suggestion demo. Mobile/IME, vertical movement and unrelated DOM-coverage topologies remain outside this case.

Next action:
None for this report. Keep the two unrelated broad React failures with their owning work.
