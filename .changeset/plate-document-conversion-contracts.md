---
'platejs': major
---

Use direct, diagnosed HTML, Markdown, and DOCX conversion contracts.

Feature plugins declare schema-bound node mappings with `formats` and `defineFormats`. HTML uses one parse5-owned safety and admission path for direct parsing and paste. HTML and Markdown expose detached `parse*` and `serialize*` functions plus installed editor methods, with explicit document, slice, diagnostics, projection, and loss-policy results. Editor methods type documents with the editor's value; standalone functions accept any plugin list and type documents as `Value`, like `createEditor({ plugins })`. Fragment parsing preserves slice boundaries and refuses silent inline truncation. Markdown serialization drops and reports a node that no configured remark plugin writes, such as a table without `remark-gfm`. A Markdown copy writes any slice its mappings can write, such as a dragged column. DOCX import captures a detached target before asynchronous work and reports schema repairs and mapping loss under its `lossPolicy`; a footnote or endnote part that holds only Word's separator notes reports nothing. DOCX export uses `exportDocx` with explicit native-state attachment.

**Migration:** Replace `codecs` and `defineCodecs` with `formats` and `defineFormats`. Replace legacy HTML and Markdown deserializers with the direct format entrypoints. Call `importDocx(source, { plugins, ...options })` without an editor instance, and replace `exportToDocx` with `exportDocx`.
