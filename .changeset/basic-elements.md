---
'@udecode/plate-basic-elements': major
---

- Removed `CodeBlockPlugin` from this package and `BasicElementsPlugin` since it does not fall into the "basic" category anymore. Migration: add `CodeBlockPlugin` from `@udecode/plate-code-block` to your plugins if not already done.
- `HorizontalRulePlugin` is now part of `BasicElementsPlugin`
- **Removed Default Shortcuts**: Default keyboard shortcuts are no longer bundled directly within the plugins. Instead, configure them manually using the `shortcuts` field.

```ts
// In your plugin setup (e.g., basic-elements-kit.tsx)
import {
  H1Plugin,
  H2Plugin,
  H3Plugin,
  BlockquotePlugin,
} from '@udecode/plate-basic-elements/react';

H1Plugin.configure({
  // Matches editor.tf.h1.toggle()
  shortcuts: { toggle: { keys: 'mod+alt+1' } },
});

H2Plugin.configure({
  shortcuts: { toggle: { keys: 'mod+alt+2' } },
});

H3Plugin.configure({
  shortcuts: { toggle: { keys: 'mod+alt+3' } },
});

BlockquotePlugin.configure({
  shortcuts: { toggle: { keys: 'mod+shift+period' } },
});
```

- **Default HTML Tags for Blocks**: Basic element plugins now default to rendering with specific HTML tags if no custom component is provided. If you were relying on the previous default rendering and need to revert, or wish to use a different tag, you can provide a custom component or configure the `render.as` option for the respective plugin.
  - `BlockquotePlugin`: now defaults to `<blockquote>` (previously might have been `<div>` or browser default).
  - `CodeBlockPlugin`: now defaults to `<pre>` for the code block container.
  - `HeadingPlugin`: now defaults to appropriate heading tags (`<h1>`, `<h2>`, `<h3>`, `<h4>`, `<h5>`, `<h6>`) based on the heading level.
  - `HorizontalRulePlugin`: now defaults to `<hr>` for the horizontal rule.
