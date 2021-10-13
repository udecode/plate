---
'@udecode/plate-core': minor
---

feat:
- `PlatePlugin`
  - new field: `overrideProps`
    - used by 
    - Overrides rendered node props (shallow merge).
    - This enables controlling the props of any node component (use cases: indent, align,...).
- new dependency: `clsx`
- new types:
  - `OverrideProps`
  - `PlatePluginEditor`
  - `PlatePluginSerialize`
  - `PlatePluginNode`
  - `PlatePluginElement`
  - `PlatePluginLeaf`
- `getRenderElement` and `getRenderLeaf`:
  - plugins `overrideProps` are used to override the props
  - `getRenderNodeProps`:
    - computes slate class and `nodeProps`
