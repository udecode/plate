---
'@udecode/plate-core': major
---

- `editor.getType()` now takes a `pluginKey: string` instead of a `plugin: PlatePlugin` instance.
  - Example: Use `editor.getType(ParagraphPlugin.key)` instead of `editor.getType(ParagraphPlugin)`.
- Plugins without a `key` property will not be registered into the editor.
- Passing `disabled: true` prop to `PlateContent` will now also set the editor to `readOnly: true` state internally.
- Editor DOM state properties have been moved under `editor.dom` namespace:
  - `editor.currentKeyboardEvent` is now `editor.dom.currentKeyboardEvent`.
  - `editor.prevSelection` is now `editor.dom.prevSelection`.
- Editor metadata properties have been moved under `editor.meta` namespace:
  - `editor.isFallback` is now `editor.meta.isFallback`
  - `editor.key` is now `editor.meta.key`
  - `editor.pluginList` is now `editor.meta.pluginList`
  - `editor.shortcuts` is now `editor.meta.shortcuts`
  - `editor.uid` is now `editor.meta.uid`
- `NodeIdPlugin` is now enabled by default as part of the core plugins. This automatically assigns unique IDs to block nodes.
  - Migration: If you were not previously using `NodeIdPlugin` and wish to maintain the old behavior (no automatic IDs), explicitly disable it in your editor configuration:
    ```ts
    const editor = usePlateEditor({
      // ...other options
      nodeId: false, // Disables automatic node ID generation
    });
    ```
- The `components` prop has been removed from `serializeHtml` and `PlateStatic`.
  - Migration: Pass the `components` to `createSlateEditor({ components })` or the individual plugins instead.
- Plugin Shortcuts System Changes:
  - Shortcut keys defined in `editor.shortcuts` are now namespaced by the plugin key (e.g., `code.toggle` for `CodePlugin`).
  - The `priority` property for shortcuts is used to resolve conflicts when multiple shortcuts share the exact same key combination, not for overriding shortcuts by name.
  - `preventDefault` for plugin shortcuts now defaults to `true`, unless the handler returns `false` (i.e. not handled). This means browser default actions for these key combinations will be prevented unless explicitly allowed.
    - Migration: If you need to allow browser default behavior for a specific shortcut, set `preventDefault: false` in its configuration:
      ```ts
      MyPlugin.configure({
        shortcuts: {
          myAction: {
            keys: 'mod+s',
            preventDefault: false, // Example: Allow browser's default save dialog
          },
        },
      });
      ```
