---
"@platejs/toggle": major
---

Track open toggles and enclosing-toggle indexes with editor-scoped `NodeKey`
values rather than persisted element IDs.

Export `BaseTogglePluginState` and `TogglePluginState` as the complete mutable
state contracts for the headless and React toggle descriptors.

Own toggle behavior through the plugin portal:

- `editor.plugin(TogglePlugin).api.toggleKeys(keys, force)`
- `editor.plugin(TogglePlugin).read.lastEnclosedEntry(toggleKey)`
- `editor.plugin(TogglePlugin).store.get('enclosingKeys', elementKey)`
- `editor.plugin(TogglePlugin).store.get('isClosed', elementKey)`
- `editor.plugin(TogglePlugin).update.toggle({ collapse: true })`

Remove the standalone toggle query and transform exports. Check whether the
selection contains a toggle with `editor.read.nodes.some` and the installed
plugin's `schema.type`. Toggle navigation, delete handling, and selectable-node
behavior run inside `TogglePlugin`.
Rendering is owned by `TogglePlugin`; `renderToggleAboveNodes` is not exported.

Export the toggle button, toolbar button, visibility, and plugin lifecycle
hooks from the colocated `useToggle` family.

Infer `ToggleVisibility` renderer props from `BaseTogglePlugin`.
