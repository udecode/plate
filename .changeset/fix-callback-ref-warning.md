---
"@udecode/react-utils": patch
---

Fix React warning "Unexpected return value from a callback ref" in `useComposedRef`

The `composeRefs` function was returning a cleanup function, which violates React's rule that callback refs should not return functions. This fix ensures that `composeRefs` returns `undefined` instead, preventing the warning and potential crashes when callback refs are composed.