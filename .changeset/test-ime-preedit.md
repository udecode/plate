---
'@platejs/test': patch
---

Add a `'preedit'` transport to `composeText` and `ime.compose` that draws each composition step into the DOM and sends the composition and input events in the order Chromium, Firefox or WebKit sends them
