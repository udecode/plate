---
'platejs': patch
---

Allow code block text edits, indentation, language changes, and structural conversions to record as proposals in Suggesting mode. `BaseCodeBlockPlugin` now uses `schema.content.text({ default: 'text', min: 1 })` without `max: 1` and removes its `authoredVeto`, while plain code blocks still canonicalize to a single text leaf and `BaseCodeHighlightPlugin` splits syntax decorations across multi-leaf code blocks.
