---
'platejs': patch
---

- Add `pageNumber` to `exportDocx`, which numbers the pages in a footer. With a retained `source`, it rebuilds the file. Its footer replaces the source's default footer, which export reports as omitted, and fills the source's empty first-page and even-page footers.
- Apply every enclosing formatting mark to each run on DOCX export. Text after a nested mark, such as `r` in `<b><em>p</em><u>r</u></b>`, no longer takes the marks of the text before it.
- Write a soft line break as the plain `w:br` that Word writes for Shift+Enter, and keep justified lines that end in one from stretching across the page.
- Read a quoted font family, such as `"Apple Color Emoji"` or `"L'Atelier"`, from an inline style on DOCX export instead of writing a broken font name.
