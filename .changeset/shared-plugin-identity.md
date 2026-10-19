---
'@platejs/cli': major
'platejs': major
'plitejs': major
---

Use one nominal `Plugin` descriptor family across Plite and Plate. Author plugins with `definePlugin`, install them through the `plugins` option, and open their exact typed portal with `editor.plugin(Plugin)`. Plate keeps its product compiler while preserving the original descriptor through headless and React authoring stages; dependencies, conflicts, ancestry, editor-local configuration, stores, rollback, retained portals, and view capabilities resolve from that shared identity.

**Migration:** Replace `defineExtension` with `definePlugin`, `extensions` with `plugins`, `editor.extension(Plugin)` with `editor.plugin(Plugin)`, `EditorExtension` with `Plugin`, and `EditorExtensionTypeProvider` with `PluginTypeProvider`. Replace Plate's `defineBasePlugin` and `definePlatePlugin` factories with `definePlugin`. The v54 CLI migration emits one mixed `EditorKit` plugin tuple.
