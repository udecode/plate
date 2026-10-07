---
review_scopes:
  - dnd
review_basis: []
work_kind: implementation
---

# Side zone clearance from the drag's start

Status: executed, 2026-10-07; uncommitted in the working tree
Playbook: plan

## Brief

### What did you find?

The left side zone started at a fixed 32 px left of the content, which fits only the copied handle's 22 px gutter. A handle of another width or side would break the straight-drag-down tolerance.

### What will change?

A padding zone counts only once the pointer is 20 px past where the drag started, on that side. The fixed 32 px goes away, and no option is added.

### What do you need from me?

Nothing. You picked this rule, with a 20 px offset, on 2026-10-07. Commits stay yours.

### What happens if I say go?

Go ran on 2026-10-07. The constant is replaced, the browser cases pass in three engines, and the plan is folded into the dnd subject.

### What could go wrong?

A drag that starts in the padding itself needs 20 px of travel before it can make columns. A custom driver without a drag session gets no clearance.

## Scope

The owner's words on 2026-10-07: "默认自动判断，但更好的做法是可配置吧？", then "默认值改为20的话 会冲突吗", then "go，按第2种做". Option 2 was the drag-origin rule with a 20 px offset and no configuration. It replaces the Defaults row "Where the left zone starts" of `docs/plans/2026-10-07-dnd-side-zones-and-scroll.md`.

## Main changes

- **A padding side zone is measured from the drag's start.** `drag.start` records the pointer's x on the drag session. The left zone needs the pointer in the left padding and more than 20 px left of that x. The right zone needs the pointer in the right padding and more than 20 px right of it. A straight drag down from a handle on either side therefore stays above or below. Without a session origin, as for a custom driver, the whole padding counts. The origin lives in its own store until the session settles, because `takeDragSession` removes the session before the drop resolves its target.

## Native behavior and proof

| Delta | Behavior | What changes | Proof surface | Source |
| --- | --- | --- | --- | --- |
| changed | Outside side zones | A block dropped in the padding beside a top-level block lands beside it, once the pointer is 20 px past where the drag started on that side, so a straight drag from a handle in the padding lands above or below | `dom-drag-geometry.test.ts`; www `dnd.spec.ts` in three engines, five runs each | `side zones plan` Step 3; `origin plan` |

## Defaults

| Decision | Pick | Alternative | Word |
| --- | --- | --- | --- |
| Configuration | None; the start x adapts to any handle | An option on `resolveDropTarget` or the plugin | "configurable clearance" |
| Clearance | 20 px from the start x, on both sides | Another distance | "clearance N" |

## Steps

The plan runs under `.agents/playbooks/build.md`.

- [x] **Step 1. Measure the clearance from the drag's start.** Write a `dom-drag-geometry.test.ts` case that starts a drag 60 px left of the content, through `drag.start`. A pointer 40 px left of the content resolves an edge, and 90 px left resolves `start`. It fails with the fixed constant, which resolves `start` at 40 px. Then store the start x on the session, replace `HANDLE_CLEARANCE`, and run the geometry file. Closed by `packages/plitejs/test/react/dom-drag-geometry.test.ts`, red at base (`red-detail.log`), 23 passed after.
- [x] **Step 2. Prove it in the browser.** Run the padding, drift-left, side-strip and list-gutter cases of `apps/www/tests/browser/dnd.spec.ts` five times in Chromium, Firefox and WebKit without retries. Rerun the react partition, typecheck and core-audits. Closed by `docs/plans/artifacts/2026-10-07-dnd-left-zone-from-drag-origin/accept2/`, 55 of 55 per engine, after the first run caught the drop reading no origin (`accept-failed-chromium.log`); the three checks exit 0.
- [x] **Step 3. Close.** Update the dnd docs sentence about the 32 px offset in both languages, and the changeset. Run the writing passes and `lint:fix` on the touched files, write the Close, fold and republish. Closed by `content/docs/(plugins)/(functionality)/dnd.mdx`, `.changeset/plitejs-side-landing.md`, the Close below and the fold into `docs/plans/topics/dnd.md`.

## Close

The reversal comes first. The first build read the origin from the live session, and `takeDragSession` removes that session before the drop resolves. So a drop in the left padding near the handle built columns while the hover had shown before or after. The drift-left browser case caught it in all three engines. The origin now lives in its own store, cleared when the session settles.

What landed, uncommitted:
- **Session.** `drag.start` records the start x, and `readDragOriginX` reads it until the session settles (`packages/plitejs/src/dom/utils/drag-session.ts`).
- **Resolver.** `SIDE_CLEARANCE = 20` replaces `HANDLE_CLEARANCE` in `paddingSide` (`packages/plitejs/src/dom/plugin/dom-drag.ts`) and applies to both sides.
- **Tests.** A geometry case starts a real drag and checks the clearance. The old clearance case now covers a resolve with no session.
- **Docs and release.** The dnd docs in both languages and the changeset describe the rule.

Proof and its limits:
- **Red before green.** The geometry case failed with the 32 px constant.
- **Browser.** The changed cases ran 55 of 55 per engine in Chromium, Firefox and WebKit, against `next dev :3000` serving this checkout.
- **Checks.** typecheck, plite-test and core-audits exit 0.
- **Not covered.** No benchmark ran, because the diff adds one stored number (inferred). Real hand drift, OS drag, touch and Safari stay unproven.

Of 3 boxes, 3 are done.

The open work "Left zone offset" in the dnd subject is resolved by this plan. "RTL handle side" stays open; the rule now works for a handle on either side, but no RTL browser case ran.

## Proof

Each step names its proof. The change adds one number to the session and removes a constant. It adds no rect read, listener or render, so Benchmark's probe does not apply (inferred from the diff).
