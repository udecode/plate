---
'plitejs': patch
---

- Fix a paste over a selection that spans roots running its commands outside the pasting view. The paste now decides whether it writes a draft as that view does, and a file it uploads in a Suggesting view keeps that view's author and intent.
