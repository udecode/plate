---
'platejs': major
---

Use direct, diagnosed HTML, Markdown, and DOCX conversion contracts.

Feature plugins declare schema-bound node mappings with `formats` and `defineFormats`. HTML uses one parse5-owned safety and admission path for direct parsing and paste. HTML and Markdown expose detached `parse*` and `serialize*` functions plus installed editor methods, with exact installed value inference and explicit document, slice, diagnostics, projection, and loss-policy results. Fragment parsing preserves slice boundaries and refuses silent inline truncation. DOCX import captures a detached target before asynchronous work, and DOCX export uses `exportDocx` with explicit native-state attachment.

**Migration:** Replace `codecs` and `defineCodecs` with `formats` and `defineFormats`. Replace legacy HTML and Markdown deserializers with the direct format entrypoints. Call `importDocx(source, { plugins, ...options })` without an editor instance, and replace `exportToDocx` with `exportDocx`.
