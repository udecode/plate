---
"@platejs/ai": major
---

Require React and React DOM 19.2 or newer.

Use editor-scoped `NodeKey` values for live AI selections, snapshots, and
replacement targets. Correlate one request and response with small `blockRef`
and table-cell `ref` tokens mapped to local node keys. Persisted IDs remain
limited to references that must survive reloads, storage, editor destruction,
or another client through `ElementIdPlugin`.

Publish AI behavior through explicit services, snapshot reads, selectors, and
transaction updates. Remove standalone preview, streaming, prompt, comment,
suggestion, and Copilot command helpers.

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

Use `{tableCellWithRef}` for selected-table prompt context. Table-cell updates
use `{ ref, content }`, while comment results use `{ blockRef, content,
comment }`. These refs are request-local and do not require `ElementIdPlugin`.

AI Chat controllers and Markdown services live in `aiChat.api`; document
queries live in `aiChat.read`; its mutations live in `aiChat.update`. Mark
undo-safe AI batches with `ai.update.markBatch()`. Remove standalone
`findTextRangeInBlock` imports.

The copied registry `AIChatEditor` publishes generated nodes as `previewValue`
in the AI Chat store. `insertBelow` and `replaceSelection` read that owned
preview and accept only formatting options; do not pass a preview editor into
either command. Package consumers use `useChatChunk` for reusable streaming;
the copied `ai-menu` item owns menu anchoring and product interaction policy.

Export `AIChatPluginState` and `CopilotPluginState` as the complete mutable
state contracts for their descriptors.

Require explicit Copilot completion transport configuration. Set
`completeOptions.api` before triggering a completion; the package does not
guess an application route. Export `CopilotCompleteOptions` for that contract.
