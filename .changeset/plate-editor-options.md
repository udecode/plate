---
'platejs': major
---

`createEditor` and `useCreateEditor` take only the editor's own settings, and behavior goes on a plugin in `plugins`.

- Remove the `api`, `decorate`, `inject`, `initialState`, `override`, `on`, `render` and `shortcuts` options, which filled a hidden root plugin. Define them on a plugin of your own and list it first in `plugins`. Its API moves from `editor.api.root` to `editor.plugin(AppPlugin).api`, and its shortcut ids from `root.<name>` to `<plugin>.<name>`
- A plugin listed first runs ahead of the kit plugins, as the root did, except that a core plugin a kit configures, such as `ParagraphPlugin.configure(...)`, stays ahead of it, a plugin with `dependencies` runs after the plugins it depends on, and another plugin's weak `override` can turn it off. Its `on.commit`, `on.transactionChange` and render hooks run after the core plugins' hooks. A shortcut on the same keys as a built-in one, such as the paragraph toggle, needs a `priority` to win
- Remove the `affinity` and `navigationFeedback` options. Configure `AffinityPlugin` or `NavigationFeedbackPlugin` in `plugins` instead, with `.configure({ enabled: false })` for `false`. Another plugin's weak `override` can now turn navigation feedback off
- Remove the `selection` and `autoSelect` options. Pass the starting caret as `initialSelection`, which takes a selection, `'start'`, `'end'` or `null`. `autoSelect: true` becomes `initialSelection: 'end'`, and `autoSelect: false` goes with no replacement. `null` starts the editor with no caret, even when `initialValue` holds a saved selection. Leave `initialSelection` out to keep the saved selection
- Throw a `TypeError` that names any option `createEditor` or `useCreateEditor` does not take, such as `value` for `initialValue` or a removed option. `useCreateEditor` checks the options of every render, even when `enabled` is `false`
- Read each option `createEditor` and `useCreateEditor` take wherever the options object holds it, so a document or user id that a parent object or a class getter defines reaches the editor
- Name the unknown option, instead of the plugins, in the type error for a `createEditor` or `useCreateEditor` call that writes one beside `plugins`. `Parameters<typeof createEditor>[0]` and `Parameters<typeof useCreateEditor>[0]` now give the options that take `plugins`

**Migration:**

```tsx
// Before
const editor = createEditor({
  autoSelect: 'end',
  navigationFeedback: { duration: 1200 },
  shortcuts: { reportWordCount: { keys: 'mod+shift+w', handler } },
});

// After
const WordCountPlugin = definePlugin('wordCount', {
  shortcuts: { reportWordCount: { keys: 'mod+shift+w', handler } },
});

const editor = createEditor({
  initialSelection: 'end',
  plugins: [
    WordCountPlugin,
    NavigationFeedbackPlugin.configure({ initialState: { duration: 1200 } }),
  ],
});
```
