---
'plitejs': patch
---

- Fix pasting a copy that ends in a quote, such as text copied from a paragraph into the quote after it or across two quotes, into the middle of a paragraph, which changed nothing. The first copied line now joins the text before the caret, and the last lands in a quote with the text after the caret.
- Fix pasting two titles into the middle of a block, which changed nothing. Each pasted block now takes the type its place allows. In a title, the second title becomes a paragraph, as it does when you press Return in a title.
