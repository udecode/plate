---
'platejs': patch
---

- Fix `EditorStatic` dropping earlier `leafAttributes` class names when multiple leaf-attribute mark plugins apply to one leaf
- Decode combined `text-decoration: underline line-through` and nested `font-style: normal` or `text-decoration: none` mark resets on HTML paste
- Include `source.tag` on AST-stage `html-unsafe-content` element removals and preserve element locations on dropped list HTML styles
- Remove the DOM entrypoint dependency from `platejs/static`
