---
'@udecode/plate-core': major
---

- Migrate from jotai@1 to jotai@2
  - TODO: Add link to jotai-factory README
  - Accessing a store without an explicit provider component is no longer supported. Attempting to do so will result in a warning in the console: `Tried to access jotai store '${storeName}' outside of a matching provider.`
- Rename Zustood exports
  - `StateActions` -> `ZustandStateActions`
  - `StoreApi` -> `ZustandStoreApi`
  - `createStore` -> `createZustandStore`
  - Note that these exports are deprecated and should not be used in new code. They may be removed in a future version of Plate.
- `renderAboveEditable` and `renderAboveSlate`
  - The given component is now rendered using JSX syntax, separately from the parent component. Previously, the component was called as a function, which affected how hooks were handled by React.
- `withHOC`
  - Add support for `ref` prop, which is forwarded to the inner component
  - Add `hocRef` argument, which is forwarded to the `HOC`
  - Strengthen the type of `hocProps`
