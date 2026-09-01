---
'plitejs': patch
'platejs': patch
---

Bound Anchor dispatch, range projection, commit queries, and overlay updates to affected content. Keep composed decoration reads local to the requested node and DOM task scheduling linear in queued tasks. Add the `presence` change query for added and removed node identities without computing path changes.

Reuse immutable document indexes without rescanning cached roots. Fit incoming Yjs nodes through the existing schema API without opening a detached live-document transaction per node.

Build snapshot element catalogs only when requested. Apply multi-leaf text changes with one shared-ancestor publication per canonical change.

Resolve Yjs schema property contexts only within affected regions.

Map replacement identities through canonical changes without comparing every source node's text with every target node.

Preserve whole-node deletion and retained sibling identities when canonical changes round-trip through JSON.

Preserve selected text and direction through formatting splits and merges by retaining characters in canonical changes.

Construct splits directly from their local close/open boundary without diffing the whole document.

Read canonical values without revalidating immutable root arrays, and collect slice-owned roots without serializing unrelated document state.

Avoid model identity lookup when editor DOM is unmounted. Skip copy-property traversal for schemas whose properties all survive copying.

Ignore deferred content-root focus after a later model or projected selection supersedes it.

Publish a selected-void cut and its final caret in one transaction.

Reuse identical endpoint mappings within one change and repeated range projections within an immutable snapshot while preserving independent Anchor values.

Reuse mapped output membership indexes and unchanged bucket ordering when only projected values change.
