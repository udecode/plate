# Discovery sources and issue samples

Checked 2026-09-24. Official docs identify candidate contracts; code claims in
the review rely on local source fingerprints in the JSON shards. No commercial
converter internals or current upstream completeness claim follows from a docs
page. No third-party source implementation was copied.

| Source | Observation and limit |
| --- | --- |
| [Tiptap static renderer](https://tiptap.dev/docs/editor/api/utilities/static-renderer) | Document plus extensions, separate output backends and custom handlers. Current docs and the local 3.21.0 snapshot are separate evidence; the sampled local static Markdown implementation calls itself incomplete. |
| [BlockNote DOCX](https://www.blocknotejs.org/docs/features/export/docx) | Schema/mappings and block input; native docx objects and separate packing. License and implementation facts were verified in the local package. |
| [BlockNote supported formats](https://www.blocknotejs.org/docs/foundations/supported-formats) | Format-specific fidelity promises and lossy interchange terminology; discovery only. |
| [BlockNote math](https://www.blocknotejs.org/docs/features/blocks/math) | Native Word equation mapping motivated inspection of the local DOCX math adapter. |
| [CKEditor PDF](https://ckeditor.com/docs/ckeditor5/latest/features/converters/export-pdf.html) | Documents an HTML/CSS conversion service with page options. This does not expose or validate service internals. |
| [Lexical serialization](https://lexical.dev/docs/concepts/serialization) | Fetch returned an internal error. No claim rests on its unread contents. |
| [Lexical #5192](https://github.com/facebook/lexical/issues/5192) | Historical 0.13.1 report: a selection node's styling affects HTML despite copy exclusion. Body read through gh; closed, updated 2026-08-08. Proof idea: editing decoration and exported semantics differ. No current reproduction. |
| [Lexical #6086](https://github.com/facebook/lexical/issues/6086) | Historical 0.14.5 report: indentation lost on one-paragraph copy. Body read through gh; open, updated 2026-08-08. Proof idea: whole document and trimmed selection cannot share unchecked assumptions. No current reproduction. |

The Lexical issue query also returned #8108 and #5069; their bodies were not
read and supply no review evidence. The BlockNote `export docx` query returned
no rows within its bounded search. Neither search is an exhaustive issue audit.
