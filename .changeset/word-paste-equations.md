---
'platejs': patch
---

- `WordPastePlugin` keeps Word equations. With `BaseInlineEquationPlugin` installed, an equation inside text pastes as an inline equation. With `BaseEquationPlugin` installed, a display equation alone in its paragraph pastes as an equation block. Without those plugins, the equation pastes as its TeX text, as DOCX import does. Word paste drops the picture Word copies with each equation.
