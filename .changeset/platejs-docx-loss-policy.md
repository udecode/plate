---
'platejs': patch
---

Add `lossPolicy` to `exportDocx`. The default `reject` fails the export when content would be dropped, such as an image DOCX cannot embed or a comment without a representable range; `allow` returns the file with warnings. A removed link destination keeps its text, and named roots, document metadata, and other properties DOCX cannot represent stay warnings under both policies. The accepted projection omits, with a warning, a comment on content it excludes.

Check DOCX output before it is written. A link destination that is unsafe or relative is removed and its text kept. An image that is unsafe, relative, a blob, remote without `allowRemoteImages`, unfetchable, or in a format Word cannot display is omitted and leaves its alt text. The written package must stay within the passive vocabulary that retained sources use; anything else is withheld with an `invalid-package` error. Keep every child of a link's label, and declare GIF and BMP content types for embedded images.

Retain a DOCX source only when every package part, content type, relationship, markup namespace, and field instruction belongs to a closed passive vocabulary; hyperlinks qualify when their destination is absolute and meets the navigation floor. Any other package returns `source: null` with a `source-unavailable` warning that names the part, and export regenerates the document from editor content. Pass the nullable source to `exportDocx` directly.
