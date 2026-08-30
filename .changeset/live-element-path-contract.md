---
'platejs': major
---

Keep stable element renderers independent from sibling path shifts. Element components resolve event-time paths from their element and opt into `usePath()` only when output depends on live position. Plite node refs restore the live runtime path after any external React render so moved text DOM cannot retain stale coordinates. Node wrappers receive `renderPath` as a render-snapshot path for cheap depth and ancestor decisions without a live subscription. Descriptor wrappers can reject ineligible nodes before Plate composes plugin context or mounts their component.
