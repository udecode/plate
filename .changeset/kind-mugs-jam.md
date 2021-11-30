---
"@udecode/plate-basic-marks": patch
---

- fix: The Subscript and Superscript plugins weren't clearing the other one on hotkey use. There was a typo in each one where they cleared themselves instead of the other
- swap hotkeys: `mod+,` for subscript and `mod+.` for superscript
- updated the hotkey for strikethrough to match Google Docs `mod+shift+x`. The existing one `mod+shift+s` would cause a refresh in Chrome.

