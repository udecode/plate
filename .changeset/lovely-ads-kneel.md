---
'@udecode/plate-core': minor
---

- new dep: jotai
- `Plate`:
  - set the store only if it's not already set (e.g. controlled use-case)
  - there is now a jotai provider with plate id so it can be used by plate selectors if no id is given as parameter.
- `PlateProvider`: Create plate store and mount/unmount if `id` prop updates. `id` can be `string[]`. Use this component on top of components using plate hook selectors, otherwise your components would not rerender on change. Not needed for plate non-hook selectors (getters).
- `useCreatePlateStore`: hook that creates a plate store into the plates store, if not defined.
- `usePlateId`: returns the provider plate id (if any).
- `usePlateStore`: if the hook is used before the plate store is created, it will console warn "The plate hooks must be used inside the `<PlateProvider id={id}>` component's context."
- 