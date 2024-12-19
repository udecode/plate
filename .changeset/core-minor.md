---
'@udecode/plate-core': minor
---

## @udecode/plate-core@40.1.0

### Minor Changes

- [#3744](https://github.com/udecode/plate/pull/3744) by [@zbeyens](https://github.com/zbeyens) –
  - Add `PlateStatic`, `SlateElement`, `SlateLeaf` components for static rendering and server-side HTML serialization
  - Add `serializeHtml` function to serialize editor content to HTML. Deprecating `@udecode/plate-html` in favor of core serialization.
  - Move from `PlatePlugin` (`/react`) to `BasePlugin` (`/`): `node.component`, `render.aboveEditable`, `render.aboveSlate`, `render.node`
  - Add to `SlatePlugin`: `node.props`, `render.aboveNodes`, `render.belowNodes`, `render.afterEditable`, `render.beforeEditable`, `render.node`
