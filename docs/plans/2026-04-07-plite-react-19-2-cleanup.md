---
date: 2026-04-07
topic: plite-react-19-2-cleanup
status: complete
---

# Plite React 19.2 Cleanup

> Supporting plan. For current queue and roadmap truth, see [master-roadmap.md](/Users/zbeyens/git/plate-2/docs/plite/master-roadmap.md).

## Goal

Remove the obvious React 18-era compatibility patterns from the current
`plite` React surface.

## Scope

1. Replace the flagged `forwardRef` chains in `plite-react` primitives and
   `EditableText` with React 19 ref-prop components.
2. Remove the `memo(forwardRef(...))` wrapper in `TextString`.
3. Replace one-shot editor construction `useMemo` with lazy `useState` in the
   flagged example.

## Learnings

- React 19.2 convergence doc says to use modern React features where they earn
  their keep, not as theater.
- `EditableDescendantNode` memo is still justified by the huge-document paste
  learning, so this batch should not rip out memoization that is benchmark
  backed.
- `Editable` `useLayoutEffect` is justified by DOM selection sync and should
  not be downgraded just to look newer.

## Progress

- Reviewed the flagged files and repo-wide React pattern matches.
- Confirmed the real cleanup targets are:
  - `editable-text.tsx`
  - `plite-element.tsx`
  - `plite-text.tsx`
  - `plite-placeholder.tsx`
  - `text-string.tsx`
  - `site/examples/ts/huge-document.tsx`
- Confirmed `EditableDescendantNode` memo and `Editable` layout effects stay.
- Replaced the flagged `forwardRef` surfaces with React 19 ref props in:
  - `plite-element.tsx`
  - `plite-text.tsx`
  - `plite-placeholder.tsx`
  - `editable-text.tsx`
  - site example helper chrome
- Removed `memo(forwardRef(...))` from `TextString`.
- Replaced one-shot `useMemo` editor construction with lazy `useState` in the
  huge-document example.
- Kept the benchmark-backed and correctness-backed survivors:
  - `EditableDescendantNode` memo
  - `Editable` layout effects

## Verification

- `yarn workspace slate-react run test`
- `yarn exec eslint packages/plite-react/src/components/slate-element.tsx packages/plite-react/src/components/editable-element.tsx packages/plite-react/src/components/slate-text.tsx packages/plite-react/src/components/slate-placeholder.tsx packages/plite-react/src/components/text-string.tsx packages/plite-react/src/components/editable-text.tsx site/examples/ts/huge-document.tsx site/examples/ts/components/index.tsx`
- `yarn prettier --check packages/plite-react/src/components/slate-element.tsx packages/plite-react/src/components/slate-text.tsx packages/plite-react/src/components/slate-placeholder.tsx packages/plite-react/src/components/text-string.tsx packages/plite-react/src/components/editable-text.tsx site/examples/ts/huge-document.tsx site/examples/ts/components/index.tsx /Users/zbeyens/git/plate-2/docs/plans/2026-04-07-plite-react-19-2-cleanup.md`
- `rm -f /Users/zbeyens/git/plite/site/tsconfig.example.tsbuildinfo && yarn tsc:examples`
- `ROLLUP_PACKAGES=slate-react yarn build:rollup`
- `bash ./scripts/run-plite-browser-local.sh 3100 /examples/rich-inline "yarn exec playwright test playwright/integration/examples/rich-inline.test.ts --project=chromium --workers=1 --grep 'release-shaped lifecycle'"`
- `bash ./scripts/run-plite-browser-local.sh 3100 /examples/rich-inline "yarn exec playwright test playwright/integration/examples/rich-inline.test.ts playwright/integration/examples/richtext.test.ts --project=chromium --workers=1"`

## Notes

- `yarn build:plite-browser:playwright` still emits unrelated pre-existing
  `slate` core type noise outside this cleanup slice. The targeted
  `plite-react` build is green.
