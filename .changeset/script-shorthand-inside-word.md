---
'platejs': patch
---

`ScriptRules.markdown` applies subscript and superscript to `~x~` and `^x^` typed inside a word, such as `H~2~O` and `X^2^`. Inside a word, the opener must follow an ASCII letter, a digit or `)`, and the text between must be ASCII letters or digits with an optional sign at either end. Anywhere, it leaves `^_^` and any other span with no letter or digit as text. While `CodePlugin` is installed, it also leaves a span as text inside inline code or after an unclosed backtick outside inline code that the `` `x` `` shorthand could close, whether or not that shorthand is enabled.
