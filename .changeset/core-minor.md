---
'@udecode/plate-core': minor
---

- Use `editor.reset` instead of `resetEditor` to focus the editor after reset so it's decoupled from `slate-react`.
- Add a server bundle including `createPlateEditor`. It can be imported using `import { createPlateEditor } from '@udecode/plate-core/server'`.
