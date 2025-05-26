---
'@udecode/plate-core': major
---

- `editor.getType()` now takes a `pluginKey: string` instead of a `plugin: PlatePlugin`. For example, use `editor.getType(KEYS.p)` instead of `editor.getType(ParagraphPlugin)`.
- Plugins without `key` will not be registered into the editor.
- Passing `disabled: true` prop to `PlateContent` will set `readOnly` to `true`.
- Moved editor state properties under `editor.dom`:
  - `currentKeyboardEvent` → `editor.dom.currentKeyboardEvent`
  - `prevSelection` → `editor.dom.prevSelection`
- `NodeIdPlugin`: Now enabled by default as part of core plugins. This automatically assigns unique IDs to block nodes.
  - **Migration**: If you were not using `NodeIdPlugin` before and want to maintain the previous behavior, add `nodeId: false` to your editor configuration:
  ```ts
  const editor = usePlateEditor({
    // ...other options
    nodeId: false, // Disables automatic node ID generation
  });
  ```
- **Plugin Shortcuts**:
  - Plugin shortcut keys in `editor.shortcuts` are now namespaced by plugin key (e.g., `code.toggle`); `priority` resolves conflicts for identical key combinations, not name overrides.
  - `preventDefault` now defaults to `true` for all plugin shortcuts. This prevents browser default actions for keyboard shortcuts by default. **Migration**: If you need to allow browser default behavior for a specific shortcut, explicitly set `preventDefault: false`:
  ```ts
  MyPlugin.configure({
    shortcuts: {
      myAction: {
        keys: 'mod+s',
        preventDefault: false, // Allow browser's default save dialog
      },
    },
  });
  ```
