---
'@platejs/core': major
---

Remove raw compiled plugin registries, fallback identity, and option-store APIs from the public Plate editor and plugin types.

**Migration:** Replace `editor.plugins[Plugin.key]` with
`editor.getPlugin(Plugin)` or the descriptor-scoped portal. Replace option-store
access with the portal or React option hooks. Use `useActiveEditor()` for
nullable editor lookup. Compiled component, plugin, input-rule, and shortcut
registries are internal runtime data.

React component objects in declared render slots remain opaque host resources
and retain their identity while surrounding descriptor data is snapshotted.

```tsx
const options = editor.plugin(MyPlugin).getOptions();
editor.plugin(MyPlugin).setOption('enabled', true);

const enabled = usePluginOption(MyPlugin, 'enabled');
```
