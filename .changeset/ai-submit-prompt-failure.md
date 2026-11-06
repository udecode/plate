---
'platejs': patch
---

- Fix an AI prompt failing on a document with content that has no Markdown mapping, such as an upload draft: prompt placeholders now leave that content out
- Fix `aiChat.api.submit` leaving the running request live when its prompt throws: it now stops that request and discards its draft before the error reaches the caller
