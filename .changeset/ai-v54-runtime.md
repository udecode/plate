---
"@platejs/ai": major
---

Move AI, AI Chat, and Copilot behavior to Plite reads, state, and transactions,
register AI marks as boolean text properties in compiled schemas, and install
Markdown and block-selection capabilities through `AIChatPlugin` dependencies.

**Migration:** Use `editor.update.ai.*` and `editor.update.copilot.*` for mutations. Use `editor.api.ai` and `editor.api.aiChat` for preview and chat orchestration.
