---
'plitejs': patch
---

Fix a suggested paste that adds a block after the paragraph it pastes over, in a document that already holds a suggestion. The added block now shows as inserted, and rejecting the suggestion removes it. Before, a streamed AI answer that opened a code block left an empty code block behind.
