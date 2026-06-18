---
date: 2026-05-04
topic: clawsweeper-batch-5-gitcrawl
status: complete
source: gitcrawl + live GitHub
---

# ClawSweeper Batch 5 With Gitcrawl

## Summary

This batch processed the two live issues missing from the frozen ledger plus
three issues from weak gitcrawl cluster 3.

Verdict: gitcrawl was useful, but cluster 3 was correctly marked weak. The three
old issues are neighbors, not duplicates. `#3478` is external store / controlled
updates, `#3497` is focus loss after unrelated parent state updates, and `#4001`
is placeholder plus keyboard/composition DOM desync.

| Issue | Decision       | Bucket           | Confidence | PR-description text                             |
| ----- | -------------- | ---------------- | ---------- | ----------------------------------------------- |
| #6051 | cluster-synced | v2-input-runtime | high       | none; detailed ledger only                      |
| #6053 | fixes-claimed  | v2-react-runtime | high       | none; detailed ledger only                      |
| #3478 | cluster-synced | v2-react-runtime | high       | none; already represented by React runtime plan |
| #4001 | cluster-synced | v2-input-runtime | high       | none; already represented by input runtime plan |
| #3497 | cluster-synced | v2-react-runtime | high       | none; already represented by React runtime plan |

## #6051 On Firefox For Android With The Samsung Keyboard, Slate Fails To Insert Some Characters

Status: cluster-synced  
Bucket: v2-input-runtime  
Confidence: high

Issue summary:
Firefox for Android with Samsung Keyboard fails to insert the second character
on a new line. The reported runtime error is `can't access property
"hasAttribute", s is null`; the reporter points to Android `handleDOMBeforeInput`
and `toSlateRange` / `toSlatePoint` receiving DOM containers whose `parentNode`
is null.

Evidence:

- live GitHub checked: yes; issue is open, current repro uses Slate `0.124.1`
  and the public Rich Text example.
- gitcrawl neighbors: `#5130`, `#3313`, `#5643`, `#4400`, `#5603`, `#6022`,
  `#5171`, `#5183`, `#4789`.
- duplicate proof: no exact duplicate found. The closest family is Android /
  Firefox / IME DOM point import, but Samsung Keyboard plus null parent DOM
  containers is a distinct live repro.
- current v2 proof: `packages/slate-react/src/editable/runtime-before-input-events.ts`,
  `packages/slate-react/src/hooks/android-input-manager/android-input-manager.ts`,
  and `packages/slate-dom/src/plugin/dom-editor.ts` show this is
  routed through the v2 input/composition/DOM point bridge. No real Firefox
  Android Samsung Keyboard device proof exists here.

Decision:
Route to the input runtime. Do not claim a fix without device proof. This is not
just a generic DOM point crash; the null-parent `beforeinput` shape makes it a
mobile input-runtime gate.

PR-description text:
none; detailed ledger only.

## #6053 useSelected Error When Remove Myself

Status: fixes-claimed  
Bucket: v2-react-runtime  
Confidence: high

Issue summary:
A component calls `useSelected()` and removes itself from the editor when it is
not selected. During that lifecycle, the hook can read a stale path and call
`Editor.range`, throwing `Cannot find a descendant at path [0,1] in node`.

Evidence:

- live GitHub checked: yes; issue is open with no comments.
- gitcrawl neighbors: `#5771`, `#4031`, `#4323`, `#4984`, `#3858`, `#4643`,
  `#3921`.
- duplicate proof: no exact duplicate found. Neighbors are stale path, DOM point,
  collaboration, and selection validity issues, but not the same
  `useSelected` self-removal lifecycle.
- current v2 proof: `packages/slate-react/test/use-element-selected.test.tsx`
  covers selected self-removal with clean unmount, explicit stale watched-path
  false behavior, and the existing path-shift case. The hook still guards
  `Editor.hasPath(editor, selectedPath)` before calling `Editor.range`.

Decision:
Claim `Fixes #6053`. The exact self-removal repro-shaped test exists and the
explicit stale path contract is covered separately.

PR-description text:
none; detailed ledger only.

## #3478 Editor Crashes With Redux

Status: cluster-synced  
Bucket: v2-react-runtime  
Confidence: high

Issue summary:
Feeding editor changes through Redux or another external store can crash or
freeze the editor under ordinary typing speed. The thread broadens this beyond
Redux: users hit the same class with GraphQL cache and delayed external state
loops.

Evidence:

- frozen ledger row: valid, `react-controlled-value-and-external-updates`,
  previously `cluster-synced`.
- live GitHub checked: yes; issue remains open.
- related issue: `#3332` is the explicit predecessor and is closed after a
  maintainer could not reproduce on `0.57.1`.
- gitcrawl neighbors: `#4001`, `#3834`, `#3497`, `#4081`, `#4495`, `#3777`,
  `#3656`, `#3921`.
- duplicate proof: not a duplicate of `#4001` or `#3497`; same runtime
  neighborhood, different failure mode.
- current v2 proof: `useSlateEditor({ initialValue })`, selector hooks, and the
  snapshot-driven provider tests in
  `packages/slate-react/test/provider-hooks-contract.tsx` move the
  center of gravity away from controlled-value external-store feedback loops.
  No Redux repro was run here.

Decision:
Keep as cluster-synced under `v2-react-runtime`. The prior live ledger row
incorrectly routed it through input runtime; the correct owner is React runtime,
snapshot identity, and external-store update boundaries.

PR-description text:
none; already represented by React runtime plan.

## #4001 German Keyboard Backtick Isn't Recognized In onChange Event; Crashes Editor When Using Placeholder

Status: cluster-synced  
Bucket: v2-input-runtime  
Confidence: high

Issue summary:
With a German keyboard and an empty editor placeholder, the first backtick input
does not fire the expected change path; the next character desynchronizes Slate
and DOM points and throws `Cannot resolve a Slate point from DOM point`.

Evidence:

- frozen ledger row: valid, `placeholder-and-ime-empty-editor`, previously
  `cluster-synced`.
- live GitHub checked: yes; issue remains open.
- linked artifact: comment points to `#3437`, a merged PR around element/text
  memoization and placeholder re-rendering.
- gitcrawl neighbors: `#3478`, `#3834`, `#3777`, `#3943`, `#3568`, `#4074`,
  `#3586`, `#4789`, `#3497`.
- duplicate proof: related to `#3777` and other placeholder/composition DOM point
  failures, but not the same as external-store `#3478`.
- current v2 proof: placeholder visibility and composition are first-class root
  sources / runtime paths in
  `packages/slate-react/src/editable/root-selector-sources.ts`,
  `packages/slate-react/src/editable/runtime-before-input-events.ts`,
  and composition tests. No German keyboard browser repro was run here.

Decision:
Keep as cluster-synced under `v2-input-runtime`. It is a real placeholder +
input-method DOM bridge issue, not a React external-store bug.

PR-description text:
none; already represented by input runtime plan.

## #3497 Editor Loses Focus If Parent Component Triggers Unrelated State Change

Status: cluster-synced  
Bucket: v2-react-runtime  
Confidence: high

Issue summary:
An unrelated parent state update can steal focus immediately after
`ReactEditor.focus(editor)`. Later comments broaden the issue to multiple
editors and rerendered sibling editors where `ReactEditor.isFocused` may still
return true even though the visible caret/input path is gone.

Evidence:

- frozen ledger row: valid, `focus-state-and-external-dom-ownership`,
  previously `cluster-synced`.
- live GitHub checked: yes; issue remains open and was bumped in 2024.
- gitcrawl neighbors: `#4495`, `#3478`, `#3634`, `#3834`, `#5537`, `#3656`,
  `#3921`, `#3696`, `#3821`, `#5211`, `#4001`.
- duplicate proof: same family as `#3634` and `#5537`, but not enough to close
  as duplicate; this row specifically covers parent-state focus churn.
- current v2 proof: focus state, provider editor replacement, selection
  reconciliation, and selector-first render paths are represented by
  `packages/slate-react/src/components/slate.tsx`,
  `packages/slate-react/src/editable/selection-reconciler.ts`, and
  provider hook tests. No exact sandbox repro was run here.

Decision:
Keep as cluster-synced under `v2-react-runtime`. The old live ledger routed it
through input runtime; that was too coarse. The owner is focus/selection state
under React rerender pressure.

PR-description text:
none; already represented by React runtime plan.

## Batch Result

- fixed-local: none
- fixes-claimed: `#6053`
- cluster-synced: `#6051`, `#3478`, `#4001`, `#3497`
- needs-repro: exact closure proof for all five if a PR wants `Fixes #...`
- skipped: none
- needs-human: none

Next slice:

- finish weak cluster 3 with `#3777`;
- then process PR-linked keep clusters where a linked PR may change current
  claim posture: `#6022/#6027`, `#5987/#6033`, `#5983/#6020`, `#5826/#5882`.
