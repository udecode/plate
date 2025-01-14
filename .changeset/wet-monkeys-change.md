---
'@udecode/plate-emoji': minor
---

Fix / Breaking change:

- Fixes #3978
- Fixes #3320
- Add `@emoji-mart/data` to your dependencies, then configure your `EmojiPlugin`:

```ts
EmojiPlugin.configure({ options: { data: emojiMartData as any } });
```
