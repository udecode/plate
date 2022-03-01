---
'@udecode/plate-core': patch
'@udecode/plate-find-replace': patch
'@udecode/plate-autoformat': patch
'@udecode/plate-break': patch
'@udecode/plate-combobox': patch
'@udecode/plate-node-id': patch
'@udecode/plate-normalizers': patch
'@udecode/plate-reset-node': patch
'@udecode/plate-select': patch
'@udecode/plate-trailing-block': patch
'@udecode/plate-headless': patch
'@udecode/plate-alignment': patch
'@udecode/plate-basic-elements': patch
'@udecode/plate-basic-marks': patch
'@udecode/plate-block-quote': patch
'@udecode/plate-code-block': patch
'@udecode/plate-font': patch
'@udecode/plate-heading': patch
'@udecode/plate-highlight': patch
'@udecode/plate-horizontal-rule': patch
'@udecode/plate-image': patch
'@udecode/plate-indent': patch
'@udecode/plate-indent-list': patch
'@udecode/plate-kbd': patch
'@udecode/plate-line-height': patch
'@udecode/plate-link': patch
'@udecode/plate-list': patch
'@udecode/plate-media-embed': patch
'@udecode/plate-mention': patch
'@udecode/plate-paragraph': patch
'@udecode/plate-table': patch
'@udecode/plate': patch
'@udecode/plate-serializer-csv': patch
'@udecode/plate-serializer-docx': patch
'@udecode/plate-juice': patch
'@udecode/plate-serializer-md': patch
'@udecode/plate-ui-button': patch
'@udecode/plate-ui-combobox': patch
'@udecode/plate-ui-dnd': patch
'@udecode/plate-ui-find-replace': patch
'@udecode/plate-ui-alignment': patch
'@udecode/plate-ui-block-quote': patch
'@udecode/plate-ui-code-block': patch
'@udecode/plate-ui-excalidraw': patch
'@udecode/plate-ui-font': patch
'@udecode/plate-ui-horizontal-rule': patch
'@udecode/plate-ui-image': patch
'@udecode/plate-ui-line-height': patch
'@udecode/plate-ui-link': patch
'@udecode/plate-ui-list': patch
'@udecode/plate-ui-media-embed': patch
'@udecode/plate-ui-mention': patch
'@udecode/plate-ui-table': patch
'@udecode/plate-ui-placeholder': patch
'@udecode/plate-ui': patch
'@udecode/plate-ui-popover': patch
'@udecode/plate-ui-popper': patch
'@udecode/plate-styled-components': patch
'@udecode/plate-ui-toolbar': patch
---

Add @udecode/plate-combobox to @udecode/plate-headless dependencies.

Plate combobox was getting compiled into the dist files, as opposed to being just re-exported, leading to two conflicting versions of @udecode/plate-combobox: one being the package itself, the other being the inlined version in @udecode/plate-headless.

Fixes: #1339
