---
'plitejs': patch
---

- Throw a `TypeError` that names any option `createEditor` or `useEditor` does not take, such as `value` for `initialValue`, whether the options object holds it or inherits it. `useEditor` checks the options of every render
- Read each option `createEditor` and `useEditor` from `plitejs/react` take wherever the options object holds it, so an option that a parent object or a class getter defines builds the editor as the same option written in the call does
- Fail to compile when a `createEditor` or `useEditor` call writes an unknown option in its options object, with or without `plugins`; the error names the option. An options object passed from a variable, and a key every object has, such as `toString`, still meet only the runtime check
