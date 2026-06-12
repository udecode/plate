# ProseMirror View Summary

ProseMirror is the decisive source for this packet because it has direct tests
for overlapping composition behavior:

- Full overlap cancels composition.
- Partial overlap cancels composition.
- A change inside the composing range cancels composition.
- A change elsewhere does not cancel composition.

Source: `../prosemirror-view/test/webtest-composition.ts:238-268`.

The implementation also protects active composition DOM during view-desc sync:
`updateChildren()` computes local composition info, updates the specific node
that holds composition when possible, and calls `protectLocalComposition()`
before rendering child descs. Source:
`../prosemirror-view/src/viewdesc.ts:767-826`.

Composition lifecycle is explicit in input handling:
`compositionend` clears composing state, records pending DOM mutations, clears
the composition node, increments a composition ID, and schedules cleanup.
Source: `../prosemirror-view/src/input.ts:502-525`.

Slate pressure:

Use ProseMirror-style cancellation as the default policy candidate, but do not
copy code. Define Slate composition ownership, overlap detection, stale event
idempotence, and non-overlap preservation in a Slate-native contract first.

