---
'platejs': patch
---

- Copy and paste equations through HTML. `editor.api.html.serialize` writes `equation` and `inlineEquation` as an element that keeps the TeX in `data-editor-equation-latex`, with the TeX between dollar signs as its text, and parsing reads it back. In an editor without the equation plugins, this HTML parses as that text and reports the two equation attributes it omits.
- Paste math whose copy keeps its TeX as equations with that exact TeX, read from KaTeX's `application/x-tex` annotation or Wikipedia's `data-mw`. Such a KaTeX copy, as from a page that loads KaTeX's copy-tex extension, no longer pastes its drawn glyphs as text. A Chrome copy from a KaTeX page without copy-tex holds no TeX and still pastes the drawn text. Display math becomes `equation`, or `inlineEquation` inside a list item or heading. MathML without TeX is dropped with a diagnostic.
- Math inside a code block pastes as the text it draws, without its TeX, and the parse reports the loss. Paste removes the link around an equation with a warning, because a link holds only text.
- Parse MathML only in an editor with an equation plugin. Inside a `math` element, MathML elements pass the same safety checks as HTML elements and lose every URL attribute, and paste removes any HTML or SVG.
- Block equations with valid TeX in HTML drawn by the `math-static` registry component parse back with their TeX.
- Keep a carriage return in an HTML attribute value through serialize and parse.
