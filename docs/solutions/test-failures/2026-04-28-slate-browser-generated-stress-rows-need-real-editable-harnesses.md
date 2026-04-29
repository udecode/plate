---
title: Slate browser generated stress rows need real Editable harnesses
date: 2026-04-28
category: docs/solutions/test-failures
module: slate-v2 slate-browser generated stress
problem_type: test_failure
component: testing_framework
symptoms:
  - Generated stress failed waiting for getByRole('textbox') on a selector-only demo route.
  - Overlay render-budget rows failed because app-owned button state caused one root Editable render.
  - Browser contract rows were valid, but the generated stress route was not executable by the editor harness.
root_cause: wrong_api
resolution_type: test_fix
severity: medium
tags: [slate-v2, slate-browser, generated-stress, editable, playwright]
---

# Slate browser generated stress rows need real Editable harnesses

## Problem

Generated `slate-browser` stress rows call `openExample(... ready: { editor:
'visible' })`, so they need a route with a real `Editable` surface and browser
handle. Selector-only demos can still be useful contract routes, but they cannot
run through the generated editor scenario harness.

## Symptoms

- `persistent-annotation-anchors overlay-annotation-bookmark-rebase` failed
  while waiting for `getByRole('textbox').first()` because that demo renders
  selector panels under `<Slate>` without an `Editable`.
- Overlay budget assertions failed when app-owned button state legitimately
  caused one `Editable` render.
- The stress pack stopped at the first failed row, so later overlay rows did not
  execute until the harness mismatch was fixed.

## What Didn't Work

- Pointing a generated stress row at a selector-only demo route. The row can
  click buttons and assert text, but the runner still opens an editor harness
  before executing any scenario steps.
- Asserting `editable: 0` for every overlay refresh. A button in the same React
  owner as the editor can rerender the root once without proving broad Slate
  node churn.

## Solution

Use a real editor route for generated stress and keep selector-only demos as
contract/demo coverage.

```ts
const overlayAnnotationBookmarkRebase = (): StressCase =>
  createStressCase({
    family: 'overlay-annotation-bookmark-rebase',
    route: 'review-comments',
    steps: [
      ...addReviewCommentSteps(),
      {
        kind: 'clickSelector',
        label: 'insert-prefix-before-bookmark',
        selector: 'button:has-text("Insert prefix before first comment")',
      },
      {
        contains: 'range:0.0:1|0.0:25',
        kind: 'assertLocatorText',
        label: 'assert-rebased-comment-range',
        selector: '#comment-card-comment-1',
      },
    ],
  })
```

Keep the broader contract row honest by listing both the executable stress route
and the selector/demo route:

```ts
{
  family: 'overlay-annotation-bookmark-rebase',
  routes: ['review-comments', 'persistent-annotation-anchors'],
}
```

For app-owned overlay buttons, cap the root render instead of pretending it is
zero:

```ts
{
  budget: { byKind: { editable: { max: 1 } } },
  kind: 'assertRenderBudget',
}
```

## Why This Works

The generated stress runner needs editor operations, selection handles, render
profiler state, replay artifacts, and kernel trace checks. A selector-only demo
does not publish that surface. Moving the executable stress row to
`review-comments` keeps the bookmark-rebase behavior under browser proof while
leaving `persistent-annotation-anchors` available for focused selector
assertions and documentation.

The `editable: { max: 1 }` budget still catches broad churn. It allows the
single root render caused by the app button owner but does not allow repeated
editor, element, leaf, or void churn to hide inside the stress row.

## Prevention

- Before adding a generated stress row, confirm the route renders an `Editable`
  and publishes the `slate-browser` handle.
- Use selector-only routes for contract registry coverage or custom Playwright
  rows, not generated editor scenarios.
- Budget app-owned control updates separately from Slate-owned node churn.
- Run the new stress family with `PLAYWRIGHT_RETRIES=0` before calling the row
  accepted.

## Related Issues

- [Slate v2 migration-backbone lanes need browser contracts before completion](../developer-experience/2026-04-28-slate-v2-migration-backbone-lanes-need-browser-contracts-before-completion.md)
- [Slate React runtime owner cuts need static inventories and browser proof](../developer-experience/2026-04-27-slate-react-runtime-owner-cuts-need-static-inventories-and-browser-proof.md)
- [Workspace package subpath consumers may need a targeted build before Playwright](../logic-errors/2026-04-04-workspace-package-subpath-consumers-may-need-a-targeted-build-before-playwright.md)
