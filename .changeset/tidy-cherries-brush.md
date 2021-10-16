---
'@udecode/plate-break': patch
'@udecode/plate-common': patch
'@udecode/plate-core': patch
'@udecode/plate-dnd': patch
'@udecode/plate-alignment': patch
'@udecode/plate-alignment-ui': patch
'@udecode/plate-basic-elements': patch
'@udecode/plate-block-quote': patch
'@udecode/plate-block-quote-ui': patch
'@udecode/plate-code-block': patch
'@udecode/plate-code-block-ui': patch
'@udecode/plate-excalidraw': patch
'@udecode/plate-heading': patch
'@udecode/plate-horizontal-rule': patch
'@udecode/plate-horizontal-rule-ui': patch
'@udecode/plate-image': patch
'@udecode/plate-image-ui': patch
'@udecode/plate-link': patch
'@udecode/plate-link-ui': patch
'@udecode/plate-list': patch
'@udecode/plate-list-ui': patch
'@udecode/plate-media-embed': patch
'@udecode/plate-media-embed-ui': patch
'@udecode/plate-mention': patch
'@udecode/plate-mention-ui': patch
'@udecode/plate-paragraph': patch
'@udecode/plate-table': patch
'@udecode/plate-table-ui': patch
'@udecode/plate-find-replace': patch
'@udecode/plate-find-replace-ui': patch
'@udecode/plate-indent': patch
'@udecode/plate-basic-marks': patch
'@udecode/plate-font': patch
'@udecode/plate-font-ui': patch
'@udecode/plate-highlight': patch
'@udecode/plate-kbd': patch
'@udecode/plate-node-id': patch
'@udecode/plate-normalizers': patch
'@udecode/plate-placeholder': patch
'@udecode/plate': patch
'@udecode/plate-reset-node': patch
'@udecode/plate-select': patch
'@udecode/plate-ast-serializer': patch
'@udecode/plate-csv-serializer': patch
'@udecode/plate-html-serializer': patch
'@udecode/plate-md-serializer': patch
'@udecode/plate-serializer': patch
'@udecode/plate-test-utils': patch
'@udecode/plate-trailing-block': patch
'@udecode/plate-combobox': patch
'@udecode/plate-popper': patch
'@udecode/plate-styled-components': patch
'@udecode/plate-toolbar': patch
---

Fixes dependencie issue for React<17 users by using the classic `React.createElement` function rather than the newer `jsx-runtime` transform.

Per babel docs: https://babeljs.io/docs/en/babel-preset-react#with-a-configuration-file-recommended
