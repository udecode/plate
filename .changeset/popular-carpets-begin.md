---
'@udecode/plate-core': patch
---

- Upgrade Slate to 0.114.0
- Fix: plugin `node.props.className` is now correctly merged
- Fix: plugin leaf components will not have `data-slate-leaf` attribute anymore since there is already one above those, resulting into a single `data-slate-leaf` attribute per React tree
