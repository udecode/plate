---
'platejs': major
---

Unify plugin rendering under `component`, `render.attributes`, `render.mark`, and `slots`.

Remove editor component registries, nested plugin overrides, public render-pipeline helpers, and the competing `render.as`, `render.node`, `render.nodeProps`, mark-render, and structural-render fields. Configure intrinsic tags through `component`, weak peer changes through flat `override[target]`, and structural composition through `slots`.
