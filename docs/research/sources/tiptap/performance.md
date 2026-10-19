# Tiptap: performance

## Performance demo

- **Smoke only.** Tiptap's Performance demo shows React render counts with `shouldRerenderOnTransaction` toggled and `useEditorState` (`ueberdosis/tiptap@91c51be53c:demos/src/Examples/Performance/React/index.jsx:13-63`). Its only test asserts that the editor instance exists and checks no render count or timing (`ueberdosis/tiptap@91c51be53c:demos/src/Examples/Performance/React/index.spec.js:6-11`). It is a smoke test, not performance evidence; a Plite render or latency claim needs Plite's own benchmark or browser harness (`docs/editor-test-harvester/tiptap/report.md:103`). Read on 2026-10-08.
