---
'platejs': patch
---

Add document-first semantic HTML, Markdown, structural plain-text, static HTML, and DOCX export contracts. Each serializer consumes one complete document, requires an explicit authored projection when proposals are present, and returns format data with structured diagnostics.

Use `PluginCodecNode` as the shared schema-narrowed node type for Markdown and plain-text codec authors. Markdown MDX JSON-literal attributes decode to canonical property values, and feature codecs emit schema-valid media and callout documents.
