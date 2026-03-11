---
'@udecode/react-utils': patch
---

- Fixed `createPrimitiveComponent` so `setProps` is applied without leaking onto DOM elements.
- Fixed `createPrimitiveComponent` to preserve merged hook and consumer `style` props instead of overwriting hook styles when a consumer passes `style`.
