---
"www": patch
---

Fix font & background color toolbar button dropdown clipping. Added explicit width (`w-[276px]`) to `ColorDropdownMenuItems` in `font-color-toolbar-button.tsx` so the 10-column color palette grid allocates full width without horizontal clipping.
