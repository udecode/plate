---
'plitejs': patch
---

Fix a word composed with an input method, such as Japanese or Chinese, when another edit changes the formatting of its line before the word is confirmed. Bold added beside or across the word, by the app or by a collaborator, drew part of the line twice, and in plain text editors the unfinished word disappeared. The line now keeps drawing as it was until the word is confirmed, then shows the other edit once. The same holds when another edit joins or removes the text the word is composed in, when a paragraph is joined onto that line, and for a collaborator's typing elsewhere in that line.
