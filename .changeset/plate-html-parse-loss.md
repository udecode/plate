---
'platejs': major
---

- `html-unsafe-content` diagnostics carry `impact`. Removing metadata, scripts, style sheets, event handlers, script URLs or graphics inside an `aria-hidden="true"` subtree (such as icon SVG) is lossless; removing SVG, MathML, embedded objects, blocked `data:` media sources, inline frame documents or styles that load resources is lossy, and fails a parse under the default `lossPolicy: 'reject'`.
- HTML parsing reports embedded media (`img`, `video`, `audio`, `iframe`, `canvas`) that no installed mapping owns as `html-unsupported-content`, `dropped` or, when its fallback content is kept, `replaced`. With the default `lossPolicy: 'reject'`, such a parse fails.
- A `createsElement` HTML mapping creates the schema's default block when it is one of the plugin's targets, so a list configured with `targetPlugins: [heading, paragraph]` decodes bare `<li>` content as paragraphs.
