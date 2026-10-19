---
'platejs': patch
---

Fix `MarkComboRules.markdown({ variant: 'boldItalic' })`, which matched `**text**` like bold, so `***text***` stayed literal. It now applies bold and italic to `***text***`.
