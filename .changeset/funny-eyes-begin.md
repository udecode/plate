---
'@platejs/core': patch
---

Expose mimeType to plugin parser functions

Added comprehensive copy functionality and view editor support for static rendering.

**New Components:**
- Added `PlateView` component for static editor rendering with copy support
- Added `usePlateViewEditor` hook for creating memoized static editors

**Static Editor Enhancements:**
- Added `withStatic` HOC to enhance editors with static rendering capabilities
- Added `ViewPlugin` that enables copy operations in static editors
- Added `getStaticPlugins` to configure plugins for static rendering
- Added `onCopy` handler that properly serializes content with `x-slate-fragment` format

**New Utilities:**
- Added `getSelectedDomBlocks` to extract selected DOM elements with Slate metadata
- Added `getSelectedDomNode` to get DOM nodes from browser selection
- Added `isSelectOutside` to check if selection is outside editor bounds
- Added `getPlainText` to recursively extract plain text from DOM nodes

This enables seamless copy operations from static Plate editors, allowing content to be pasted into other Slate editors while preserving rich formatting and structure.
