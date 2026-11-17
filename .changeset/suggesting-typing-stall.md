---
'plitejs': patch
---

- Fix typing in Suggesting on a long document pausing for seconds as the session goes on. Earlier versions of the document are now freed instead of kept alive until the editor goes away.
- Reduce how much each Suggesting key slows down while a collaborator types between your letters.
