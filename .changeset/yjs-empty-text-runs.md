---
'plitejs': patch
---

- Fix Yjs peers ending with two copies of a paragraph or section when they change the same inline element at once, such as one proposing a new `ref` on a link while the other unsets it, or type beside it at once. A proposed property change stays proposed on every peer.
- Fix a letter typed beside a link being lost when a peer joins the room or when an older client removed the empty texts beside it.
- Fix Enter after a link never reaching the other Yjs peers, and the Yjs binding throwing when the two lines are joined back.
- Fix a caret placed beside a link a peer just inserted throwing in the Yjs binding and never reaching the other peers.
- Fix an empty text staying after a link when text with other marks follows it, without moving the caret into the link.

**Migration:** A document saved by an earlier beta loses that empty text when it loads, so each later child in its paragraph moves back by one. If you save paths into documents, such as comment ranges, move each saved path after that empty text back by one, or loading the comment can throw.
