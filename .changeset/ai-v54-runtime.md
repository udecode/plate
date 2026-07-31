---
"@platejs/ai": major
---

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

AI Chat controllers and Markdown services live in `aiChat.api`; document
queries live in `aiChat.read`; its mutations live in `aiChat.update`. Mark
undo-safe AI batches with `ai.update.markBatch()`. Remove standalone
`findTextRangeInBlock` imports.

`useAIChatEditor` publishes generated nodes as `previewValue` in the AI Chat
store. `insertBelow` and `replaceSelection` read that owned preview and accept
only formatting options; do not pass the preview editor into either command.

Export `AIChatPluginState` and `CopilotPluginState` as the complete mutable
state contracts for their descriptors.
