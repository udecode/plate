---
'platejs': patch
---

- Fix Markdown export writing document text that a CommonMark or GFM reader runs as HTML or reads as a script link or link definition. A details summary or other registered tag whose one-line text holds a tag now writes on its own lines. A leveled summary title that cannot print on one line with its heading, such as one holding a tag or a line break, keeps its level as `level="2"`. An equation whose TeX holds a tag or link that raw HTML export would refuse, such as `<img src=x onerror=alert(1)>`, `<javascript:alert(1)>` or an unclosed `<b title=`, writes a space after each `<` that could start one, and a block equation whose TeX would start a new Markdown block indents its lines, both of which TeX ignores in math mode. A footnote whose first line reads as a `javascript:` or other unsafe link definition starts after a blank line. Plate reads the summary and footnote back as the same document.
- Fix copying part of a code block writing its raw text into `text/markdown`. The copied code is written as escaped Markdown text.
