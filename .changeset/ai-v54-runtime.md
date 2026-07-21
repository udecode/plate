---
"@platejs/ai": major
---

Move AI, AI Chat, and Copilot behavior to Plite reads, state, and transactions,
and register AI marks as boolean text properties in compiled schemas.

**Migration:** Use `editor.update.ai.*` and `editor.update.copilot.*` for mutations. Use `editor.plugin(BaseAIPlugin).api` and `editor.plugin(AIChatPlugin).api` for preview and chat orchestration.
