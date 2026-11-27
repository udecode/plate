---
'platejs': patch
---

- Remove `useAnnotationStore`, `useAnnotation`, `useAnnotations`, `UseAnnotationStoreOptions`, `Annotation*` re-exports, and unused `ViewSource*` (`ViewSourceOptions`, `ViewSourceStatus`, `ViewSourceError`, `ViewSourceErrorSink`, `ViewSourcePhase`) exports from `platejs/react`.
- Export `CommentAttachmentChange` from `platejs/comments` as the payload type for `subscribeAttachments`.

**Migration:** Replace `useAnnotation*` with `editor.anchor`, `commit.changed.anchors()`, and `DecorationSource`. Update `subscribeAttachments` listener types from `AnnotationChange` to `CommentAttachmentChange` from `platejs/comments`.
