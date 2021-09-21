---
"@udecode/plate-link": minor
---

feat(link): Unwrap selected links when pasting a URL. Previously, pasting any text (including a URL) with an existing link selected would insert plain text. With this change, pasting a URL will unwrap any selected links and wrap a new link.
