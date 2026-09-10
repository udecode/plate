---
'platejs': major
---

Use plugin-authored transient decorations and exact mounted-editor geometry for selections, remote cursors, Find, and floating controls.

`platejs/react` compiles each plugin's `decorate: { read, observe? }` descriptor into Plite decorations. Plugin-store updates invalidate only that plugin's affected nodes. Editable and container sibling components receive only their exact mounted ref.

`platejs/yjs/react` exposes `useYjsRemoteCursorIds`, `useYjsRemoteCursor`, and `useYjsRemoteCursorGeometry`. Import `YjsPlugin` from the copied `remote-cursor-overlay` file for selection highlights, carets, and labels. The package plugin supplies unstyled selection decorations.

Use `BaseFindPlugin` from `platejs/find` for query, navigation, and replacement, and install the copied `FindKit` for Find controls and rendering. Use `data-plite-keep-selection-visible` on controls that retain the native inactive selection and `@floating-ui/react` directly for app-owned floating UI. Remote cursor rendering belongs to the copied overlay.
