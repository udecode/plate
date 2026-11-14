---
'platejs': major
---

- Remove the plugin shortcut options `delimiter`, `splitKey`, `useKey`, `ignoreModifiers`, `enableOnFormTags`, `enableOnContentEditable`, `ignoreEventWhenPrevented`, `ignoreEventWhen`, `keyup`, `keydown`, `enabled`, `description` and `preventDefault`. A shortcut takes `keys`, `priority`, and a `handler` or a `target`. Any shortcut with another field throws when the editor is created, and most shortcuts written in place with a removed option also fail to type-check.
- Remove the shortcut handler's `eventDetails` argument and the `HotkeysEvent` type. A handler receives `{ editor, event }`.
- Accept only a string or an array of strings in `keys`. A comma list such as `'mod+b, ctrl+b'` throws when the editor is created, and one such as `'escape, esc'` never matches. `'*'` is the unshifted asterisk key, such as the numpad's, not a match for every key, so Shift+8 needs `'shift+*'`.
- Run shortcuts on keydown only. A handled shortcut always calls `preventDefault()` and `stopPropagation()`, so `ParagraphPlugin`'s `Mod+Alt+0` no longer reaches other key handlers.

**Migration:**

- Move an `enabled` check into the handler and return `false` when the shortcut should not run.
- Move a keyup shortcut to the plugin's `on.keyUp` handler.
- Write `'mod+b, ctrl+b'` as `['mod+b', 'ctrl+b']`, and a nested array such as `[['mod', 'b']]` as `'mod+b'`.
- Read the pressed keys from `event` instead of `eventDetails`.
- To keep the browser's action on a key, set every shortcut bound to that key to `null`, or wrap each of their handlers with `extend` and return `false` where the browser should act. The first handler that does not return `false` takes the key, so wrapping only one of several plugins, such as `IndentPlugin` but not `ListPlugin` for Tab, leaves the key with the other.
