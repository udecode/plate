---
'plitejs': patch
---

- Publish multi-source native typing and deferred decoration refreshes in one repaint per node while keeping fast typing across editors with multiple decoration sources.
- Remove the `plitejs/annotations` entrypoint, `useAnnotationStore`, `useAnnotation`, `useAnnotations`, `UseAnnotationStoreOptions`, and unused `ViewSource*` (`ViewSourceOptions`, `ViewSourceStatus`, `ViewSourceError`, `ViewSourceErrorSink`, `ViewSourcePhase`) exports from `plitejs/react`.

**Migration:** Replace `plitejs/annotations` and `useAnnotation*` with `editor.anchor`, `commit.changed.anchors()`, and a `DecorationSource` registered through `EditorRoot` or a plugin.
