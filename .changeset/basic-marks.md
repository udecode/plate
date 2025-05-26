---
'@udecode/plate-basic-marks': major
---

- Removed `SkipMarkPlugin`: it's now part of the built-in editor plugins. Use `plugin.configure({ node: { clearOnBoundary: true } })` to enable this behavior.
- **Default HTML Tags for Marks**: Basic mark plugins now default to rendering with specific HTML tags if no custom component is provided. If you were relying on the previous default rendering and need to revert, or wish to use a different tag, you can provide a custom component or configure the `render.as` option for the respective plugin.
  - `BoldPlugin`: now defaults to `<strong>` (previously might have been `<span>` or browser default).
  - `CodePlugin`: now defaults to `<code>`.
  - `ItalicPlugin`: now defaults to `<em>`.
  - `StrikethroughPlugin`: now defaults to `<s>`.
  - `SubscriptPlugin`: now defaults to `<sub>`.
  - `SuperscriptPlugin`: now defaults to `<sup>`.
  - `UnderlinePlugin`: now defaults to `<u>`.
  - `KbdPlugin`: now defaults to `<kbd>`.
- **Removed Default Shortcuts & New Shortcut Pattern**: Default keyboard shortcuts are no longer bundled directly within the plugins, except bold, italic and underline. Instead, configure them manually using the `shortcuts` field.

```ts
// In your plugin setup (e.g., basic-marks-kit.tsx)
import { CodePlugin, Key } from '@udecode/plate';

CodePlugin.configure({
  // Matches editor.tf.code.toggle()
  shortcuts: { toggle: { keys: 'mod+e' } },
});

// StrikethroughPlugin (Cmd+Shift+X)
StrikethroughPlugin.configure({
  shortcuts: { toggle: { keys: 'mod+shift+x' } },
});

// SubscriptPlugin (Cmd+Comma)
SubscriptPlugin.configure({
  shortcuts: { toggle: { keys: 'mod+comma' } },
});

// SuperscriptPlugin (Cmd+Period)
SuperscriptPlugin.configure({
  shortcuts: { toggle: { keys: 'mod+period' } },
});

// HighlightPlugin (Cmd+Shift+H)
HighlightPlugin.configure({
  shortcuts: { toggle: { keys: 'mod+shift+h' } },
});
```
