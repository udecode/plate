---
'@udecode/plate-core': patch
---

- Upgrade `slate` to `0.114.0`
- Fix: plugin `node.props.className` merging
- Fix: remove redundant `data-slate-leaf` attribute from leaf components
- Add `node.leafProps` to override `data-slate-leaf` element attributes
- Add `node.textProps` to override `data-slate-node="text"` element attributes
- Add `render.leaf` to render a component below leaf nodes when `isLeaf: true` and `isDecoration: false`
- Add `node.isDecoration` to control if a plugin's nodes can be rendered as decorated leaf
