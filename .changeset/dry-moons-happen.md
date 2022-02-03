---
"@udecode/plate-core": patch
---


Fix: "Adding new Editor instances after render of another instance causes a bad setState error". We were setting the plate store anytime `getPlateStore` was called, so it could be called outside a `useEffect`. `Plate` now returns `null` until the plate store is set in the plates store, so `getPlateStore` always returns a defined store. Note that you'd need the same check on your end above any component using plate selectors.
