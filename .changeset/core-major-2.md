---
"@udecode/slate-plugins-core": major
---

removed: `useEditorId` in favor of `useEditorRef().id`,
`useEditorOptions` in favor of `useEditorRef().options`,
`useSlatePluginOptions` in favor of
`getSlatePluginOptions(useEditorRef(), pluginKey)`, `useSlatePluginType`
in favor of `getSlatePluginType(useEditorRef(), pluginKey)`,
`pipeOnDOMBeforeInput` in favor of `pipeHandler`,  
`pipeOnKeyDown` in favor of `pipeHandler`


