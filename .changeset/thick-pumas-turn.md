---
'@udecode/plate-code-block': major
---

Migrated from Prism.js to lowlight for syntax highlighting

- Updated `codeBlockToDecorations`, `setCodeBlockToDecorations`, and `resetCodeBlockDecorations` to use lowlight
- Changed plugin configuration to use `lowlight` option instead of `prism` option
- Removed dependency on `prismjs` in favor of `lowlight`
- Updated tests to reflect new token structure
