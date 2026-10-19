---
'platejs': patch
---

- `ScriptRules.markdown` applies subscript and superscript to `~x~` and `^x^` typed inside a word, such as `H~2~O` and `X^2^`. Inside a word, the opener must follow an ASCII letter, a digit or `)`, the text between must be ASCII letters or digits with an optional sign at either end, and, while `CodePlugin` is installed, the match must not sit inside inline code or where the `` `x` `` shortcut would wrap it on one more typed backtick, even when that shortcut is off. At the start of a text run, such as right after bold text, the opener counts as following a space, so these limits do not apply.
- `createMarkInputRule` no longer deletes the character after the caret when a rule without `end`, such as `*x*`, completes in the middle of a paragraph.
