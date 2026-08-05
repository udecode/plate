---
"@platejs/math": patch
---

Fix inline equation popover remaining open when `ArrowLeft` or `ArrowRight` reaches the input edge. `useEquationInput`'s `selectOutsideEquation` now triggers `onClose` when selection moves outside the inline equation element.
