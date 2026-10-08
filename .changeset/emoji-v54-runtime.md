---
'platejs': major
---

Require React and React DOM 19.2 or newer.

Remove the emoji plugin. `@platejs/emoji` does not move into `platejs`, and Plate no longer depends on `@emoji-mart/data`. Emoji entry lives in copied registry components on frimousse and Emojibase: `emoji` for the `:` popup, `emoji-data` for the catalog, and `emoji-picker` with `emoji-toolbar-button` for the picker. Emoji are plain text, so documents need no migration.

**Migration:** Remove `@platejs/emoji` and `@emoji-mart/data`, add the registry items, and replace `EmojiPlugin` and `EmojiInputPlugin` with the copied `EmojiKit`:

```bash
npx shadcn@latest add @plate/emoji @plate/emoji-picker @plate/emoji-toolbar-button
```

```tsx
import { EmojiKit } from '@/components/editor/emoji';

const editor = createEditor({ plugins: [...EmojiKit] });
```
