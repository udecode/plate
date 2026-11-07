---
'plitejs': patch
---

- Prevent post-commit observer failures from making committed editor updates throw.
- Fix a throwing Yjs subscriber skipping the ones after it. A `subscribeCursor`, `subscribeIds`, awareness or admission-status listener that throws goes to `lifecycleErrorSink` under the `yjs` plugin, and the other listeners still run.
- Fix a throwing `shouldUpdate` in `useEditorSelector`, `useRuntimeState` or `useRootState` stopping other selectors from updating, and one in `useEditorRuntimeState` leaving its component stale. The error goes to `lifecycleErrorSink` and the component updates.
- Fix a `subscribeCommit`, `subscribeSource`, annotation, authored-change or refusal listener that unsubscribes and subscribes again while it runs being called again in the same pass.
