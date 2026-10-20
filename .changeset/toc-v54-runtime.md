---
'platejs': major
---

Require React and React DOM 19.2 or newer.

Keep TOC interaction controllers in copied renderers. The package exposes heading discovery and insertion instead of renderer-specific hooks.

Track headings through editor-scoped `NodeKey` values. TOC does not install `ElementIdPlugin` or require persisted element IDs.

Read headings through `editor.plugin(TocPlugin).read.headings()` and insert a table of contents through `editor.plugin(BaseTocPlugin).update.insert()`. The plugin owns heading discovery and insertion instead of exported editor/transaction helpers.

Copy the `toc` component for scrolling and navigation feedback.

List TOC entries as `{ key, level, title }`, where `level` is the heading level from 1 to 6.

**Migration:**

- Replace `options.queryHeading` with a read override. The override may return any list, or filter `readTocHeadings`, the plugin's own heading finder:

```tsx
import { BaseTocPlugin, readTocHeadings } from 'platejs/toc';

const AppTocPlugin = BaseTocPlugin.extend({
  read: ({ editor, state }) => ({
    headings: () =>
      readTocHeadings({ editor, state }).filter(
        (heading) => heading.level <= 3
      ),
  }),
});
```

Install `toReactPlugin(AppTocPlugin)` in place of `TocPlugin` in the live kit, and `AppTocPlugin` in place of `BaseTocPlugin` in the static kit.

- Read an entry's `key` instead of `id` and its `level` instead of `depth`. Entries no longer carry `path` or `type`.
