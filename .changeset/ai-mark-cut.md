---
'platejs': major
---

- Drop a saved `ai` mark in `migrateV54`, from text and from a saved selection's marks, when no plugin of the target schema declares an `ai` text property. The text stays as ordinary text.
- Let a migration step's `mapSelection` rename a saved typing mark that the target schema does not declare. `migrateDocument` checks the selection's marks once, against the final document.

**Migration:** To keep saved `ai` text marked, declare your own `ai` text property before you migrate.
