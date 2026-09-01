---
'platejs': major
---

Use plugin-authored transient decorations and exact mounted-editor geometry for selections, remote cursors, Find, and floating controls.

`platejs/react` compiles each plugin's `decorate` and render slots. Plugin-store updates invalidate only that plugin's decorations. Editable and container sibling components receive only their exact mounted ref.

`platejs/yjs/react` exposes `useYjsRemoteCursorIds`, `useYjsRemoteCursor`, and `useYjsRemoteCursorGeometry`. `YjsPlugin` contributes remote-selection decorations; configure copied leaf and `afterEditable` renderers on that plugin.

Remove `platejs/cursor/react`, `platejs/find-replace`, and `platejs/floating/react`. Install the copied `SelectionRetentionKit` and `FindKit` for product behavior, and use `@floating-ui/react` directly for app-owned floating UI.
