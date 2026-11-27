---
'plitejs': patch
---

- Include `PluginReference` in `EditorStateField`, the type `defineStateField` returns, so TypeScript accepts a state field wherever it accepts a plugin reference, such as in `plugins`. Make a state field with `defineStateField`, because an object you build by hand no longer types as one.
