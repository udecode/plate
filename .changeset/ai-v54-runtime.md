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

ai.api.findTextRangeInBlock({ block, findText });
ai.update.insertNodes(nodes);
ai.update.removeMarks();
aiChat.read.prompt({ prompt: 'Improve this' });
aiChat.api.setPreview(accumulatedMarkdown);
aiChat.api.accept();
aiChat.api.insertBelow({ format: 'none' });
aiChat.api.replaceSelection();
aiChat.api.reset();
copilot.store.get('isSuggested');
copilot.update.accept();
```

Use `{tableCellWithRef}` for selected-table prompt context. Table-cell updates use `{ ref, content }`, while comment results use `{ blockRef, content, comment }`. These refs are request-local and do not require `ElementIdPlugin`.

AI Chat draft publication and complete actions live in `aiChat.api`; document queries live in `aiChat.read`. Use `setPreview` for accumulated Markdown and `setTablePreview` for a complete cell response. Remove standalone `findTextRangeInBlock` imports.

Bind the editor with `useAIChat({ editableRef, transport, onData })`. The package owns the stream cursor, request cancellation, and writable-view lifetime across views sharing one editor. Insert and chat output share a temporary `previewValue`. Accept, insert below, or replace selection applies the draft in one history batch under the current editing mode. Streaming does not enter Suggesting or add document history. The copied `ai-menu` owns anchoring, prompts, and product interaction policy. Replace `useChatChunk` with this editor binding.

Use `aiChat.api.reset()` to clear the draft and restore the mapped invoking selection without undoing other edits. `aiChat.api.hide({ focus })` closes the session, cancels its request, and discards unapplied output; `focus: false` preserves the destination focus and selection. Use `stop()` to retain partial output for review. Remove the `undo` option, AI batch markers, AI-specific undo, copied preview rollback state, and preview accept/cancel/discard helpers.

Stop flushes buffered text before cancellation. Each request fences its transport callbacks and retains the captured target for retries; deleted targets fail without replacing another location. The adapter exposes transport errors through `chat.error`. AI comment review publishes or discards only the current request's generated drafts.

Export `AIChatPluginState` and `CopilotPluginState` as the complete mutable state contracts for their descriptors.

Return focus to the invoking mounted editor when closing AI Chat. Preserve the `focus: false` option and reject anchor removal through a retired view.

Require explicit Copilot completion transport configuration. Set `completeOptions.api` before triggering a completion; the package does not guess an application route. Export `CopilotCompleteOptions` for that contract.
