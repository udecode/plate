---
'platejs': major
---

Require React and React DOM 19.2 or newer.

Use editor-scoped `NodeKey` values for live AI selections, snapshots, and replacement targets. Correlate one request and response with small `blockRef` and table-cell `ref` tokens mapped to local node keys. Persisted IDs remain limited to references that must survive reloads, storage, editor destruction, or another client through `ElementIdPlugin`.

Publish AI behavior through explicit services, snapshot reads, selectors, and transaction updates. Remove standalone preview, streaming, prompt, comment, suggestion, and Copilot command helpers.

**Migration:** Use the installed plugin capabilities:

```tsx
const ai = editor.plugin(BaseAIPlugin);
const aiChat = editor.plugin(AIChatPlugin);
const copilot = editor.plugin(CopilotPlugin);

ai.read.hasPreview();
ai.update.beginPreview();
ai.api.findTextRangeInBlock({ block, findText });
aiChat.read.prompt({ prompt: 'Improve this' });
aiChat.update.insertChunk(chunk);
aiChat.update.insertBelow({ format: 'none' });
aiChat.update.replaceSelection();
copilot.store.get('isSuggested');
copilot.update.accept();
```

Use `{tableCellWithRef}` for selected-table prompt context. Table-cell updates use `{ ref, content }`, while comment results use `{ blockRef, content, comment }`. These refs are request-local and do not require `ElementIdPlugin`.

AI Chat controllers and Markdown services live in `aiChat.api`; document queries live in `aiChat.read`; its mutations live in `aiChat.update`. Mark undo-safe AI batches with `ai.update.markBatch()`. Remove standalone `findTextRangeInBlock` imports.

Bind the editor with `useAIChat({ editableRef, transport, onData })`. The package owns the stream cursor, generated preview, request cancellation, and writable-view lifetime across views sharing one editor; `AIChatEditor` renders that preview. `insertBelow` and `replaceSelection` read the owned preview and accept formatting options. The copied `ai-menu` owns anchoring, prompts, and product interaction policy. Replace `useChatChunk` with this editor binding.

Export `AIChatPluginState` and `CopilotPluginState` as the complete mutable state contracts for their descriptors.

Return focus to the invoking mounted editor when closing AI Chat. Preserve the `focus: false` option and reject anchor removal through a retired view.

Require explicit Copilot completion transport configuration. Set `completeOptions.api` before triggering a completion; the package does not guess an application route. Export `CopilotCompleteOptions` for that contract.
