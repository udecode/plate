---
'plitejs': patch
---

Fix a decision that returned `blocked` until another author's change was decided when it emptied a line or a quote, unwrapped a quote, or landed a join on a line it removed. The decision now applies, and the other author's change stays pending on what is left. For example, accepting the deletion of a line's text while another author struck the whole line leaves an empty line that the strike still decides, and a line built to keep a quote from being empty joins any insertion or deletion pending on that quote. One author's decisions still give the same result in every order.
