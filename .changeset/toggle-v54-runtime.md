---
"@platejs/toggle": major
---

Export `BaseTogglePluginState` and `TogglePluginState` as the complete mutable
state contracts for the headless and React toggle descriptors.

Own toggle behavior through the plugin portal:

- `editor.plugin(TogglePlugin).api.toggleIds(ids, force)`
- `editor.plugin(TogglePlugin).read.isActive()`
- `editor.plugin(TogglePlugin).read.lastEnclosedEntry(toggleId)`
- `editor.plugin(TogglePlugin).store.get('enclosingIds', elementId)`
- `editor.plugin(TogglePlugin).store.get('isClosed', elementId)`

Remove the standalone toggle query and transform exports. Toggle navigation,
delete handling, and selectable-node behavior run inside `TogglePlugin`.
Rendering is owned by `TogglePlugin`; `renderToggleAboveNodes` is not exported.

Export the toggle button, toolbar button, visibility, and plugin lifecycle
hooks from the colocated `useToggle` family.
