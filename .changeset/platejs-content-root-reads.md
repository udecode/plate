---
'platejs': patch
---

- Render element-owned content roots in `EditorStatic` and `EditorPreview` through a reader of that root in the rendering editor's current authored mode: components, leaves, texts and decoration sources read the root's nodes at the paths they receive, and numbered lists inside a content root continue their sequence
- Accept a path, node or key in `editor.read.list.ordinal(at)`, and return `undefined` when the target is not a numbered list item in the editor's root
- Read a table cell's presentation from a known path in `read.cell({ at: path })` without indexing the rendered document
- Paint a static decoration that spans several text nodes on each of them, and nothing on another text node or root
- Run decoration `attributes` callbacks under the same document guard as `read`
- Paint a collaborator's selection only in the root it addresses
