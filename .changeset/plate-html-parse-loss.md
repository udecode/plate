---
'platejs': major
---

- Check every HTML URL for what it does, wherever HTML is parsed, pasted, imported from DOCX or serialized: an `href` must be safe to open, `img` `src` and `poster` must be images, an `iframe` `src` must be an absolute web page, and other `src` values must be media.
- `html-unsafe-content` diagnostics carry `impact`. A removed link destination keeps its label (`action: 'unwrapped'`) and warns under every policy; it is lossless only when the destination could run script, such as `javascript:` or `data:`. An `img` without a usable `src` is replaced by its alt text. Removing metadata, scripts, style sheets, event handlers, a script resource URL or graphics inside an `aria-hidden="true"` subtree (such as icon SVG) is lossless; removing SVG, MathML, embedded objects, media sources that cannot load, inline frame documents or styles that load resources is lossy, and fails a parse under the default `lossPolicy: 'reject'`.
- Serialization removes an unsafe attribute or CSS value from its output and reports it as `html-unsafe-content`.
- HTML parsing reports embedded media (`img`, `video`, `audio`, `iframe`, `canvas`) that no installed mapping owns as `html-unsupported-content`, `dropped` or, when its fallback content is kept, `replaced`. With the default `lossPolicy: 'reject'`, such a parse fails. A lost property (`kind: 'attribute'` or `'style'`) is a warning under every policy.
- A link whose destination `LinkPlugin` does not allow keeps its label and reports an `html-unsupported-content` warning; HTML export writes the stored destination.
- A `createsElement` HTML mapping creates the schema's default block when it is one of the plugin's targets, so a list configured with `targetPlugins: [heading, paragraph]` decodes bare `<li>` content as paragraphs.
