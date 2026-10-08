# ProseMirror: input and ime

## Composition overlap

- ProseMirror's view tests pin overlap behavior: a change that fully overlaps, partly overlaps or lies inside the composing range cancels the composition, and a change elsewhere does not (`test/webtest-composition.ts:238-268`). During view-desc sync, `updateChildren()` computes local composition info, updates the node that holds the composition when it can, and calls `protectLocalComposition()` before rendering child descs (`src/viewdesc.ts:767-826`). `compositionend` clears the composing state, records pending DOM mutations, clears the composition node, increments a composition id and schedules cleanup (`src/input.ts:502-525`). Source: `docs/plite/research/2026-06-12-ime-overlap-policy/sources/prosemirror-view-summary.md:1-22`. Limit: unpinned local `prosemirror-view` checkout read on 2026-06-12.
