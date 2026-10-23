---
'plitejs': patch
---

- Keep a property value someone writes even when it equals the default its place leaves out, so rejecting a split or retyping a block gives that value back
- Keep a rejected split's two halves apart when they hold different values, such as a link split with Enter whose halves got different urls, and wait while another pending suggestion still decides them
- Drop a written default that a move, wrap, merge or retype carries into a place that cannot hold it, and give it back when that suggestion is rejected
- Fix accepting a suggestion that inserts text and then removes a mark from the whole text, which left the mark on the text after the insertion
