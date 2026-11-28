---
'platejs': patch
---

Replace `platejs/suggestion` and `platejs/suggestion/react` with `platejs/authored` (`AuthoredPlugin`, `suggestionColorOf`, `AUTHORED_COLOR_COUNT`) and `platejs/authored/react` (`AuthoredReactPlugin`, `useAuthoredGroups`, `useActiveAuthored`), remove `PLUGINS.suggestion` and `useSuggestionChanges`, add `describeTableSuggestion` to `platejs/table` and `useCommentThreadIndex` to `platejs/comments/react`, remove `users` and `CommentUser` from `BaseCommentsPlugin`, replace `subscribePending`, `subscribeVisibleThreadIds`, and `subscribeDraftThreadIds` with `subscribeSnapshot`, and scope comment `activeIds` per presentation via `api.activeIds()`, `api.setActive()`, and `api.subscribeActive()`.

**Migration:** Import `AuthoredPlugin` from `platejs/authored` and `AuthoredReactPlugin`, `useAuthoredGroups`, and `useActiveAuthored` from `platejs/authored/react`. Move comment author profiles into a React context (such as copied `UserDirectoryProvider`), replace `subscribePending`/`subscribeVisibleThreadIds`/`subscribeDraftThreadIds` with `api.subscribeSnapshot`, and replace `store.get('activeIds')` with `api.activeIds()` and `api.subscribeActive()` (call `api.setActive()` on the mounted editor view rather than an unmounted model editor handle).
