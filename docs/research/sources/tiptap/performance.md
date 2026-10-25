# Tiptap: performance

## Performance demo

- **Smoke only.** Tiptap's Performance demo shows React render counts with `shouldRerenderOnTransaction` toggled and `useEditorState` (`ueberdosis/tiptap@91c51be53c:demos/src/Examples/Performance/React/index.jsx:13-63`). Its only test asserts that the editor instance exists and checks no render count or timing (`ueberdosis/tiptap@91c51be53c:demos/src/Examples/Performance/React/index.spec.js:6-11`). It is a smoke test, not performance evidence; a Plite render or latency claim needs Plite's own benchmark or browser harness (`docs/editor-test-harvester/tiptap/report.md:103`). Read on 2026-10-08.

## React subscription ownership

- **Editor-wrapper renders and node-view portal renders have separate subscriptions.** Tiptap's useEditor suppresses per-transaction wrapper rerenders when `shouldRerenderOnTransaction` is false or omitted; useEditorState selects through `useSyncExternalStoreWithSelector`, while EditorContent's Portals component subscribes directly to its renderer collection. Evidence: `ueberdosis/tiptap@91c51be53c4655ef07e29ec489471524debfa0ca:packages/react/src/useEditor.ts:365-380`, `ueberdosis/tiptap:packages/react/src/useEditorState.ts:151-173` and `ueberdosis/tiptap:packages/react/src/EditorContent.tsx:25-35`. Source: `docs/plans/2026-05-08-plite-performance-scalability-plite-issues-ralplan.md:690-698`. Limit: subscription ownership does not itself prove narrow selector cost or bounded render counts.

## Collaboration mapping probe

- **Position mapping is timed separately from the whole transaction.** Tiptap's CollaborationMappingPerformance experiment times mapping its position array and reports the number of positions, then records transaction duration and document size separately; the experiment also varies decorations during simulated typing. Evidence: `ueberdosis/tiptap@91c51be53c4655ef07e29ec489471524debfa0ca:demos/src/Experiments/CollaborationMappingPerformance/React/index.tsx:153-160`, `:246-254`, with the decoration workload cited by `docs/plans/2026-05-08-plite-performance-scalability-plite-issues-ralplan.md:699-704`. Limit: an experiment's instrumentation is not a retained benchmark result or collaboration correctness proof.
