---
'@udecode/resizable': minor
---

Added touch events to Resizable

We were lacking touch-related events on `ResizeHandle.tsx`. That made it so that mobile users will not be able to resize an element.
With the addition of the functions, this functionality should be available as it was prior to the latest major bump.
Additionally, we were missing the 'resizable' alias in 'aliases-plate', which made the local development quite complex.
