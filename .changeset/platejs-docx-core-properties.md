---
'platejs': patch
---

- Stop naming `html-to-docx` as the author, last editor and keywords of files from `exportDocx`
- Fix `exportDocx` failing with `invalid-package` when its `title` holds `<` or `&`
