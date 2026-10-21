---
"@platejs/docx-io": minor
---

- Add `paragraphSpacing` and `headingSpacing` to `exportToDocx`, `exportEditorToDocx`, `editor.api.docxExport.exportToBlob`, `editor.tf.docxExport.exportAndDownload` and `htmlToDocxBlob` to set the space Word adds around paragraphs and headings, in twentieths of a point. Without them the file is unchanged.
