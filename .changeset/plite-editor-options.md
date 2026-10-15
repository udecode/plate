---
'plitejs': patch
---

- Throw a `TypeError` that names any option `createEditor` or `useEditor` does not take, such as `value` for `initialValue`, whether the options object holds it or inherits it. `useEditor` checks the options of every render
- Fail to compile when a `createEditor` or `useEditor` call writes an unknown option, with or without `plugins`; the error names the option. `Parameters<typeof createEditor>[0]` now gives the options that take `plugins`
