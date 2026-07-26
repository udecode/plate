---
"@platejs/ai": major
---

Expose AI, AI Chat, and Copilot behavior through flat plugin capabilities and
remove their standalone command, streaming, prompt, and suggestion helpers.

**Migration:** Use `tx.ai.*` and `tx.copilot.*` inside grouped updates. Use
`editor.plugin(BaseAIPlugin).api.*`,
`editor.plugin(AIChatPlugin).api.*`, and
`editor.plugin(CopilotPlugin).api.*` for one-shot behavior.
