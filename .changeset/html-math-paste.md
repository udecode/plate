---
'platejs': patch
---

- Copy and paste equations through HTML. `editor.api.html.serialize` writes `equation` and `inlineEquation` as an element that keeps the TeX in `data-editor-equation-latex`, with the TeX between dollar signs as its text, and parsing reads it back. In an editor without the equation plugins, this HTML parses as that text and reports the two equation attributes it omits.
- Paste math as equations. Paste reads the exact TeX from KaTeX's `application/x-tex` annotation or Wikipedia's `data-mw`, and rebuilds the TeX from the MathML when the copy holds none, such as a Chrome copy from a KaTeX page without copy-tex. When Plate drops a KaTeX formula because its MathML has no TeX form or no installed equation plugin takes it, the parse reports the drop and KaTeX's drawn glyphs paste as text. Display math becomes `equation`, or `inlineEquation` inside a list item or heading.
- Warn when a rebuild loses presentation that TeX cannot hold, such as a color, a size, spacing or a bracket's stretch, or when it picks one of two commands that write the same MathML, such as `\mathcal` and `\mathscr`. Each rebuilt formula gets one warning that names each loss and pick.
- Paste MathML that sits beside a hidden drawing of its letters as text, such as MathJax 2's CHTML output, as those letters. Drop MathML with no TeX form, such as `mlongdiv`, with a diagnostic that names the element. Each dropped formula reports its own diagnostic with its place in the HTML.
- Math inside a code block pastes as the text it draws, without its TeX, and the parse reports the loss; math with no TeX form is cut from the code. Paste removes the link around an equation with a warning, because a link holds only text.
- Parse MathML only in an editor with an equation plugin. Inside a `math` element, MathML elements pass the same safety checks as HTML elements and lose every URL attribute, and paste removes any HTML or SVG.
- Block equations with valid TeX in HTML drawn by the `math-static` registry component parse back with their TeX.
- Keep a carriage return in an HTML attribute value through serialize and parse.
