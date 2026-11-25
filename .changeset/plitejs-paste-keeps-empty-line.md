---
'plitejs': patch
---

- Fix a paste of whole blocks into an empty block of the same type replacing that block, so a paste rule that remembered the line lost it. A YouTube or other provider link copied with a space before or after it, or as HTML in a paragraph, and pasted on an empty line now becomes a media embed under `MediaEmbedRules.autoEmbed({ variant: 'paste' })`. A heading or other block of another type still replaces the empty block.
