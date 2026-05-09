---
title: Slate DOM-present staging needs document epoch and range materialization
date: 2026-05-03
category: docs/solutions/performance-issues
module: Slate v2 React runtime
problem_type: performance_issue
component: frontend_stimulus
symptoms:
  - Full-document replacement could keep every DOM-present root group mounted after the old document had completed background mounting.
  - DOM-present selection into pending content materialized the entire pending boundary instead of the target root group.
  - A browser native-typing proof briefly showed duplicate text insertion after a staged-plan reset during input.
root_cause: logic_error
resolution_type: code_fix
severity: high
tags: [slate-v2, slate-react, dom-coverage, large-document, staging, benchmark]
---

# Slate DOM-present staging needs document epoch and range materialization

## Problem

DOM-present large-document staging had the right primitive but the wrong lifecycle granularity. Full-document replacement and selection materialization both need to reset or mount by the current model target, not by stale group state or the whole pending boundary.

## Symptoms

- Replacing a fully mounted 1001-block DOM-present document with another 1001-block document left all fresh groups mounted immediately.
- The stale-DOM proof only covered replacement with a one-block document, so it missed mounted-state leakage across large-to-large replacement.
- Selection into a middle pending group took roughly 500 ms in the 5000-block smoke because materialization mounted the whole coalesced pending boundary.
- A Chromium DOM-present native typing row showed `dom-native block 1aa` after one keyboard type when the document epoch selector reset during input.

## What Didn't Work

- Using only top-level runtime ids as the root-group plan key. Runtime ids can be preserved or reused across a full replacement, so this does not prove the staged lifecycle still belongs to the current document.
- Materializing the entire `large-document-staged` boundary for selection. Coalescing is correct for registry size, but selection needs the intersecting group, not every pending group.
- Treating the command-passing benchmark as enough. The first post-fix benchmark technically passed but exposed a bad verdict: `middleBlockSelectThenType` was still red.

## Solution

Add a sticky root document epoch owned by the root selector source, and include it in the DOM-present root-group plan key. The epoch advances only when the latest commit reports `fullDocumentChanged`, so normal typing does not reset staged mounting.

```ts
export const useRootDocumentEpoch = () => {
  const lastEpochRef = useRef(0)
  const selector = useCallback((editor: ReactEditor) =>
    editor.read((state) => {
      const commit = state.value.lastCommit()

      if (commit?.fullDocumentChanged) {
        lastEpochRef.current = commit.version
      }

      return lastEpochRef.current
    }), [])

  return useEditorSelector(selector, Object.is, {
    profileId: 'root-document-epoch',
    shouldUpdate: shouldUpdateRootDocumentEpoch,
  })
}
```

Carry the target range through DOM coverage materialization and let the large-doc handler mount only groups intersecting that range.

```ts
DOMCoverage.materializeBoundary(editor, boundary.boundaryId, 'selection', {
  range: selection,
})
```

```ts
const pathRanges = targetRange
  ? [{ anchor: targetRange.anchor.path, focus: targetRange.focus.path }]
  : boundary.coveredPathRanges
```

Add the harder stale-DOM test: mount an old large doc fully, replace it with another large doc, assert old far text is gone immediately, assert fresh far text is still absent, and assert the fresh pending range is registered as `large-document-staged` coverage.

## Why This Works

The document epoch separates "same root group positions" from "same document lifecycle." Staged mount state can survive normal edits, but it cannot survive full replacement.

Range materialization keeps the registry coalesced while avoiding a performance cliff. The boundary can cover `[50..1000]`, but a caret in block 500 should only mount the group containing block 500.

## Prevention

- For staged DOM-present work, test large-to-large replacement, not only large-to-small replacement.
- Any coalesced missing-DOM boundary needs a target-aware materialization path for interaction-level operations.
- Keep benchmark interpretation honest: a command can pass while one lane is still clearly red.
- After changing staged lifecycle, rerun all three: focused package tests, browser native input proof, and the 5000-block benchmark smoke.

## Related Issues

- [Slate DOM-incomplete work should start with internal coverage boundaries](../developer-experience/2026-05-02-slate-dom-incomplete-work-should-start-with-internal-coverage-boundaries.md)
- [Slate v2 large-document shell policy must be explicit and corridor-mounted](2026-05-01-slate-v2-large-document-shell-policy-must-be-explicit-and-corridor-mounted.md)
- [Slate v2 text snapshots should be path-stable for large-document typing](2026-05-01-slate-v2-text-snapshots-should-be-path-stable-for-large-document-typing.md)
