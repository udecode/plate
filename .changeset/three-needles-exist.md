---
"@udecode/plate-core": patch
---

- `createPluginFactory` type: default plugin has types (e.g. `Value`) which can be overriden using generics (e.g. `MyValue`).
- Plugin types are now using `Value` generic type when it's using the editor.
- replace plugin options generic type `P = {}` by `P = PluginOptions` where `PluginOptions = AnyObject`. That fixes a type error happening when a list of plugins has custom `P`, which don't match `{}`.
