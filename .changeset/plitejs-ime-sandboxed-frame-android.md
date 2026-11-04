---
'plitejs': patch
---

- Fix the caret staying before a word an input method commits when the editor renders inside a frame sandboxed without `allow-scripts`, such as `sandbox="allow-same-origin"`.
- Fix a word an Android keyboard commits over selected text, such as a long-pressed word, landing beside the selection instead of replacing it.
- Fix a word an Android keyboard commits right after a mark is turned on or off at the caret, such as Underline, ignoring that change.
