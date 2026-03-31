# Issue 4140: Yjs must preserve useEditorSelection updates

## Tracker

- Source type: GitHub issue
- Source id: `#4140`
- Title: `Yjs: useEditorSelection() does not seem to work with YjsPlugin`
- URL: `https://github.com/udecode/plate/issues/4140`
- Task type: bug
- Expected outcome: `useEditorSelection()` updates under `YjsPlugin` the same way it does without Yjs, including after init and later selection changes
- Browser surface: no; the stable seam is a React integration spec around `YjsPlugin` plus the Plate selection store

## Relevant area

- `packages/yjs/src/react/YjsPlugin.tsx`
- `packages/yjs/src/lib/BaseYjsPlugin.ts`
- `packages/yjs/src/lib/withTYjs.ts`
- `packages/core/src/react/hooks/useSlateProps.ts`
- `packages/core/src/react/stores/plate/createPlateStore.ts`

## Learnings

- Existing repo learnings worth carrying forward:
  - Yjs tests can fail for harness reasons before the real bug. Use explicit paths when running isolated Bun tests.
  - Selection bugs in Plate usually belong at the ownership seam, not in downstream UI.
- `learnings-researcher` pointed at `docs/solutions/patterns/critical-patterns.md`, but that file does not exist in this checkout.
- Issue comments include a concrete React repro and a prior unverified hypothesis that `@slate-yjs/core` swallows Slate `onChange` options.

## Plan

1. Read the issue repro against the current Yjs and Plate selection plumbing.
2. Add one integration-style regression spec at the Yjs React surface.
3. Make the test fail for the real reason.
4. Patch the Yjs bridge at the narrowest ownership seam that restores Plate selection version updates.
5. Run targeted tests, then package build, typecheck, and `lint:fix`.
6. Add a changeset if the fix changes published package behavior.

## Progress

- Loaded `task`, `planning-with-files`, `learnings-researcher`, `tdd`, and `changeset`.
- Re-read the GitHub issue and comments.
- Read the current Yjs plugin, init specs, and Plate selection/version code.
- Confirmed the triage seam still looks right: Plate selection subscribers depend on `versionSelection`, and Yjs does not obviously advance that path today.
- Rebuilt the issue locally instead of trusting the old Claude branch. That branch's "repro" is not credible:
  - it never rendered `PlateContent`
  - it used an invalid mock provider config
  - it asserted `null` instead of the expected behavior
- A current-main integration repro with Yjs initialized before render behaved correctly: DOM selection updates reached `useEditorSelection()`.
- A separate async-init-after-mount repro exposed a different problem: `editor.children` updates, but the pasted issue comment's component shape still does not force a rerender. That is not enough evidence to claim `#4140` itself still reproduces on current main.
