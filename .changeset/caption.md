---
'@udecode/plate-caption': major
---

- `CaptionPlugin` option `options.plugins` (accepting an array of `PlatePlugin`) has been renamed to `options.query.allow` (accepting an array of plugin keys).
- Migration:

  ```tsx
  // Before
  CaptionPlugin.configure({
    options: {
      plugins: [ImagePlugin], // ImagePlugin is an example
    },
  });

  // After
  CaptionPlugin.configure({
    options: {
      query: {
        allow: [ImagePlugin.key], // Use the plugin's key
      },
    },
  });
  ```
