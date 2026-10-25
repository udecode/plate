# Word file libraries

What Plate learned from libraries that read, write, preview or edit Word (DOCX) files. Their findings belong to the `conversion-and-export` area, so a new one goes on this home's `conversion-and-export.md` with `<owner>/<repo>@<commit>:<path>` evidence.

Repos: `mwilliamson/mammoth.js`, `turbodocx/html-to-docx`, `dolanmiu/docx`, `volodymyrbaydalka/docxjs`, `superdoc/docx-editor`, `eigenpal/docx-editor`, `casualoffice/opendoc`, `jgm/pandoc`, `python-openxml/python-docx`, `dotnet/open-xml-sdk`, `stella/folio`, `truespar/scriptor`, `kklimuk/docx-cli`, `ansonlai/docx-redline-js`

Pages:

- [DOCX conversion and preservation](../docx-interoperability-oss.md). The 2026-09-14 comparison of six source families (Mammoth, TurboDocx, docx, docx-preview, SuperDoc, Pandoc) at pinned revisions, which separates semantic import, Word generation, package retention, preview and editable package preservation.

Research runs:

- [2026-09-14-docx-interoperability-oss](../../../plite/research/2026-09-14-docx-interoperability-oss). The source run behind that comparison.
- [2026-09-15-docx-post-implementation-oss](../../../plite/research/2026-09-15-docx-post-implementation-oss). Whether current libraries justify changing Plate's DOCX import and export contract after it shipped.
- [2026-10-06-docx-native-state](../../../plite/research/2026-10-06-docx-native-state). Whether any editor or DOCX library carries its own editor state inside a `.docx` it writes, read across fifteen clones.
