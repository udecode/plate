---
"@platejs/core": minor
---

Added copy functionality to **PlateStatic** component. When users copy content from a static Plate editor, the selection is now properly serialized with the `x-slate-fragment` data format, enabling seamless paste operations into other Slate editors while preserving the rich structure of the content.

- Added `onCopy` handler to PlateStatic that sets clipboard data in three formats: Slate fragment, HTML, and plain text
- Added `setFragmentDataStatic` utility to handle copy operations for static editors
- Added `getSelectedDomBlocks` utility to extract selected DOM elements with Slate metadata
- Added `getPlainText` utility to recursively extract plain text from DOM nodes