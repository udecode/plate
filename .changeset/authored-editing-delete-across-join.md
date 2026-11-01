---
'plitejs': patch
---

- Fix deleting across a suggested line join in an `edit` view, yours or another author's, which left the remaining text in separate lines. The delete now merges the lines at once, as it does without the suggestion, and the next character you type lands at the join. The suggestion stays in review as a `joined` review mark on the merged line, and accepting or rejecting it changes no text. The lines still stay apart until that suggestion is decided when a line typed right after the join is already stored, or when the join was saved by an older version.
- Fix a line typed right after a suggested join, which moved into another join of the same suggestion once its own join was merged or its line removed. That line now stays where it is. While its own join still waits, it goes with the nearest join of that suggestion, as before. A join and the lines typed after it that an app copies in one insert now stay together, whatever a decision does to the originals.
- Fix undoing an `edit` delete across a suggested join after a teammate accepted that join, which kept the lines merged. The line break now comes back on every peer and after a reload, as undoing a merge does without the suggestion. It stays when the teammate then undoes and redoes the accept.
- Add the `joined` kind to `AuthoredMark`, and a `key` to its `join` and `joined` marks. An older `plitejs` build refuses to load a value that holds either, so every peer in a room needs this version once anyone suggests a line join.
- Fix deleting across a line break in an `edit` view when the next line holds another author's suggested text, which kept the lines apart until that text was decided. The lines now join at once, and that text stays pending in the merged line.
- Fix rejecting a join that another author suggested on a line while your `edit` delete there still waited on another decision, which kept that join pending.
- Fix `decide` with no decisions, which could apply a merge that another peer's decision had allowed. It now changes nothing and reports `unchanged`.
