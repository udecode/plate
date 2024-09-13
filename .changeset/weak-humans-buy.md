---
'@udecode/plate-core': patch
---

- Rename all base plugins that have a React plugin counterpart to be prefixed with `Base`. This change improves clarity and distinguishes base implementations from potential React extensions. Use base plugins only for server-side environments or to extend your own DOM layer.
- Import the following plugins from `/react` entry: `AlignPlugin`, `CalloutPlugin`, `EquationPlugin`, `FontBackgroundColorPlugin`, `FontColorPlugin`, `FontFamilyPlugin`, `FontSizePlugin`, `FontWeightPlugin`, `InlineEquationPlugin`, `LineHeightPlugin`, `TextIndentPlugin`, `TocPlugin`
- Upgrade dependencies
