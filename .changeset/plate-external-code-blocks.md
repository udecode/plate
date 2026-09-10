---
'platejs': patch
---

- Expose Plite external-text adapters through Plate element slots
- Keep mounted Plate content synchronized with imperative read-only changes
- Refresh syntax only for changed code blocks and cancel pending refreshes after the last view unmounts
- Identify native syntax decorations so embedded editors can preserve neutral annotations without duplicate syntax
- Indent the first empty line of a code block at offset zero

Use `createCodeMirrorAdapter` from the optional `platejs/code-block/codemirror` entrypoint for ExternalText synchronization, shared history, selection, and guarded composition/language-load lifetime. Install its CodeMirror language, state, and view peers when using this adapter. Copied code-block UI supplies themes, search, language choices, and native CodeMirror commands.
