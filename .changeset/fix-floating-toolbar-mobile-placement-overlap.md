---
"www": patch
---

Fix `FloatingToolbar` overlapping with native mobile text selection context menus on mobile devices. Uses `useIsMobile` to set `placement: 'bottom'` on mobile viewports so custom floating toolbars render below selection instead of colliding with native mobile context menus.
