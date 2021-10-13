---
'@udecode/plate-core': minor
---

feat:
- `PlatePlugin`
  - new field: `overrideProps`
    - Overrides rendered node props (shallow merge).
    - This enables controlling the props of any node component (use cases: indent, align,...).
    - used by `pipeRenderElement` and `pipeRenderLeaf`
- `getRenderElement` and `getRenderLeaf`:
  - pass the rest of the props to the component
  - `getRenderNodeProps`:
    - computes slate class and `nodeProps`
- new dependency: `clsx`
- new types:
  - `OverrideProps`
  - `PlatePluginEditor`
  - `PlatePluginSerialize`
  - `PlatePluginNode`
  - `PlatePluginElement`
  - `PlatePluginLeaf`