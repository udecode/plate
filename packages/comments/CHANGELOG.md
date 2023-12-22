# @udecode/plate-comments

## 27.0.4

### Patch Changes

- [#2817](https://github.com/udecode/plate/pull/2817) by [@12joan](https://github.com/12joan) –
  - Fix the `onCommentAdd`, `onCommentUpdate` and `onCommentDelete` callbacks on CommentsProvider

## 27.0.3

## 27.0.0

### Major Changes

- [#2763](https://github.com/udecode/plate/pull/2763) by [@12joan](https://github.com/12joan) –
  - Migrate store to jotai@2
  - Revert the breaking changes to `@udecode/plate-comments` made in 26.0.0

## 26.0.0

### Major Changes

- [#2760](https://github.com/udecode/plate/pull/2760) by [@12joan](https://github.com/12joan) –
  - Renamed the `comments` prop on CommentsProvider to `initialComments` to reflect the fact that updating its value after the initial render has no effect
  - Removed the following props from CommentsProvider, since they represent the internal state of the comments plugin and should not be controlled externally:
    - `activeCommentId`
    - `addingCommentId`
    - `newValue`
    - `focusTextarea`
  - The following props on CommentsProvider can now be updated after the initial render (whereas prior to this version, doing so had no effect):
    - `myUserId`
    - `users`
    - `onCommentAdd`
    - `onCommentUpdate`
    - `onCommentDelete`

## 25.0.1

## 25.0.0

### Major Changes

- [#2725](https://github.com/udecode/plate/pull/2725) by [@EandrewJones](https://github.com/EandrewJones) – Remove `useCommentValue`, which was redundant with the hooks applied automatically in `CommentEditTextarea.tsx`.

## 24.5.2

## 24.4.0

### Minor Changes

- [#2675](https://github.com/udecode/plate/pull/2675) by [@zbeyens](https://github.com/zbeyens) – Support slate-react 0.99.0

## 24.3.6

## 24.3.5

## 24.3.2

## 24.3.1

## 24.3.0

## 24.2.0

## 24.0.2

## 24.0.1

## 24.0.0

## 23.7.4

## 23.7.0

## 23.6.0

## 23.3.1

## 23.3.0

## 22.1.0

### Patch Changes

- [#2518](https://github.com/udecode/plate/pull/2518) by [@12joan](https://github.com/12joan) – Remove comment node when new comment form is closed

- [#2520](https://github.com/udecode/plate/pull/2520) by [@12joan](https://github.com/12joan) – Return `hidden: true` from `useCommentAddButton` when `myUserId` is not set

## 22.0.2

## 22.0.1

## 22.0.0

### Major Changes

- [#2471](https://github.com/udecode/plate/pull/2471) by [@zbeyens](https://github.com/zbeyens) – Removed:
  - `AccountCircleIcon`
  - `CheckIcon`
  - `MoreVertIcon`
  - `RefreshIcon`
  - `AvatarImage`
  - `CommentLinkButton`
  - `CommentLinkDialog`
  - `CommentLinkDialogCloseButton`
  - `CommentLinkDialogCopyLink`
  - `CommentLinkDialogInput`
  - `PlateCommentLeaf` for `useCommentLeafState`

### Minor Changes

- ## [#2471](https://github.com/udecode/plate/pull/2471) by [@zbeyens](https://github.com/zbeyens) – New exports:

## 21.5.0

## 21.4.2

## 21.4.1

## 21.3.2

## 21.3.0

## 21.1.5

## 21.0.0

## 20.7.2

## 20.7.0

## 20.4.0

## 20.3.2

## 20.0.0

### Patch Changes

- [#2252](https://github.com/udecode/plate/pull/2252) by [@12joan](https://github.com/12joan) – Include `createdAt` and `userId` (if present) in comment passed to `onCommentAdd`

## 19.7.0

### Patch Changes

- [#2225](https://github.com/udecode/plate/pull/2225) by [@TomMorane](https://github.com/TomMorane) – fix: hotkey

## 19.5.0

### Minor Changes

- [#2202](https://github.com/udecode/plate/pull/2202) by [@zbeyens](https://github.com/zbeyens) – Replace onMouseDown by onClick. Add aria-label.

## 19.4.4

## 19.4.2

## 19.2.0

## 19.1.1

## 19.1.0

## 19.0.3

## 19.0.2

### Patch Changes

- [#2104](https://github.com/udecode/plate/pull/2104) by [@zbeyens](https://github.com/zbeyens) – Fixes #2103

## 19.0.1

## 19.0.0

### Patch Changes

- [#2097](https://github.com/udecode/plate/pull/2097) by [@zbeyens](https://github.com/zbeyens) –
  - Fixes #2050

## 18.15.0

## 18.13.0

### Minor Changes

- [#1829](https://github.com/udecode/plate/pull/1829) by [@osamatanveer](https://github.com/osamatanveer) –
  - new plugin: comments
