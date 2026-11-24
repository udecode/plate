---
'platejs': patch
---

- Add follow-up paste rules. A `defineInputRule` rule with `target: 'insertData'`, `resolve` and `followUp` runs `followUp` after a local paste that history saved, as its own undo step on the view that pasted.
- Add `key` to an input rule's `editor`, which returns a node's stable key, as `editor.key` does.
- Add `MediaEmbedRules.autoEmbed({ variant: 'paste' })` to `platejs/media`. A YouTube, Vimeo, Dailymotion, Youku, Coub or X link pasted alone on an empty paragraph becomes a media embed above that paragraph, and one undo gives back what the paste landed. A Vimeo link with an `h` parameter stays a link.
