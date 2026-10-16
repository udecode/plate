---
'plitejs': patch
---

Give a `useEditor` editor its component's lifetime. Its plugins take outside resources, such as a Yjs document, when React commits the component, and give them back when it unmounts or `deps` replace the editor, so a remount, a Strict Mode rehearsal or a `deps` change binds the same `Y.Doc` again instead of throwing "already has an independent binding".
