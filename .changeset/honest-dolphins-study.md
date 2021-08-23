---
'@udecode/plate-dnd': major
'@udecode/plate-alignment-ui': major
'@udecode/plate-block-quote-ui': major
'@udecode/plate-code-block-ui': major
'@udecode/plate-excalidraw': major
'@udecode/plate-image-ui': major
'@udecode/plate-link-ui': major
'@udecode/plate-list-ui': major
'@udecode/plate-media-embed-ui': major
'@udecode/plate-mention-ui': major
'@udecode/plate-table-ui': major
'@udecode/plate-find-replace-ui': major
'@udecode/plate-font-ui': major
'@udecode/plate-placeholder': major
'@udecode/plate': major
'@udecode/plate-styled-components': major
'@udecode/plate-toolbar': major
---

WHAT: moved `styled-components` from dependencies to peer dependencies.  
WHY: there was multiple instances of `styled-components` across all the packages.  
HOW: make sure to have `styled-components` in your dependencies.
