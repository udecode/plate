---
'plitejs': patch
---

Let a void element, such as an inline field, hold a `unique` property that the other types in its place do not hold. In Suggesting, turning such an element into another type, such as a field into a mention, records a deletion and an insertion, so rejecting the change keeps the element and its value. When the old and new elements cannot both fit in that place, such as where the schema allows only one of them, Suggesting refuses the change.
