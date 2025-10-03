---
"@platejs/floating": patch
---

Fix: Resolve infinite loop in useFloatingToolbar hook (v2)
Problem: The floating toolbar was causing infinite re-renders under certain conditions, leading to performance issues and potential browser hangs. This occurred when users interacted with text selections while the toolbar was visible.

WHY the change was made:
- Infinite re-rendering was caused by the open dependency in the useEffect hook.
- The open dependency was removed and the setOpen function was called with a functional update to access the previous state.

HOW a consumer should update their code:
- No action required. The change is internal and does not affect consumer code.
