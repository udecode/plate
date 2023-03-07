---
'@udecode/plate-core': major
---

- This package has been splitted into multiple packages for separation of concerns and decoupled versioning:
  - `@udecode/utils` is a collection of miscellaneous utilities. Can be used by any project.
  - `@udecode/slate` is a "slate preview": it includes experimental features and bug fixes that we may introduce into `slate` one day. It's essentially composed of the generic types. Can be used by vanilla `slate` consumers without plate.
  - `@udecode/slate-react` is a "slate-react preview": it includes experimental features and bug fixes that we may introduce into `slate-react` one day. It's essentially composed of the generic types. Can be used by vanilla `slate-react` consumers without plate.
  - `@udecode/plate-core` is the minimalistic core of plate. It essentially includes `Plate`, `PlateProvider` and their dependencies. Note this package is not dependent on the `*-utils` packages.
  - `@udecode/plate-utils` is a collection of utils depending on `@udecode/slate-react` and `@udecode/plate-core`
  - `@udecode/plate-common` re-exports the 5 previous packages and is a dependency of all the other packages. It's basically replacing `@udecore/plate-core` as a bundle. 
- Removed `getPreventDefaultHandler` since it is no longer needed.
**Migration**:
  - If using `@udecode/plate` or `@udecode/plate-headless`: none
  - Else: find & replace `@udecode/plate-core` by `@udecode/plate-common`
