---
'platejs': patch
---

- Throw a `TypeError` that names any option `createEditor` or `useCreateEditor` does not take, such as `value` for `initialValue`, instead of passing it to the root plugin. Root plugin fields such as `options`, `transforms` and `handlers` throw too; define them on a plugin. `useCreateEditor` checks the options of every render, even when `enabled` is `false`
- Name the unknown option, instead of the plugins, in the type error for a `createEditor` or `useCreateEditor` call that writes one beside `plugins`. `Parameters<typeof createEditor>[0]` and `Parameters<typeof useCreateEditor>[0]` now give the options that take `plugins`
