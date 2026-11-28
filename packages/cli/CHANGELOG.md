# @platejs/cli

## 54.0.0-beta.8

### Minor Changes

- [`4bf170b7eadbbeae6e1555f694a61c300405dd93`](https://github.com/udecode/plate/commit/4bf170b7eadbbeae6e1555f694a61c300405dd93) – Update `plate codemod plite-to-plate` for unified Plite and Plate naming: remove obsolete `EditorStateSelectorOptions` and `useEditorEditableElement` rules, diagnose removed `useOptionalEditorReadOnly` and multi-root `useEditorContext` differences, support legacy `PagedEditablePage*` type renames, and resolve aliased `*EditorContent*` bindings for `root` lifting, render props, spread props, `<EditorRoot readOnly>` override conflicts, and 3-arg `useEditorSelector` / `useStateFieldValue` `deferred` checks.

### Patch Changes

- [`d5f3a595540cb5ecc7b4558f25d7ce9042e4e666`](https://github.com/udecode/plate/commit/d5f3a595540cb5ecc7b4558f25d7ce9042e4e666) – Allow `--from 0` in `plate migrate run` to match `migrateDocument` source version `0`.

## 54.0.0-beta.7

### Patch Changes

- [`2c357bb`](https://github.com/udecode/plate/commit/2c357bbbafab6651fab715ff983f3df17cda9cd1) by [@zbeyens](https://github.com/zbeyens) – Add `plate codemod plite-to-plate` to automate migrating Plite projects to Plate (rewriting imports, JSX components, `DOMEditor` calls, plugin options, and `package.json`, with structured diagnostics and `TODO` comments for manual steps), and mark `platejs` as an optional peer dependency

## 54.0.0-beta.6

## 54.0.0-beta.5

## 54.0.0-beta.4

## 54.0.0-beta.3

## 54.0.0-beta.2
