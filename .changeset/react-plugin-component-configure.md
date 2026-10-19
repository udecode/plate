---
'platejs': patch
---

Fix `ScriptPlugin` and `HeadingPlugin` losing their `<sub>`/`<sup>` and `<h1>`–`<h6>` rendering after `.configure()` or `.extend()`. A component bound through `toReactPlugin()` now stays bound unless `.configure({ component })` replaces it.
