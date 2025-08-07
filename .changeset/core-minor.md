---
'@platejs/core': patch
---

- Added `onNodeChange` and `onTextChange` callbacks to track editor operations:

  - `onNodeChange`: Called for node operations (insert, remove, set, merge, split, move)
  - `onTextChange`: Called for text operations (insert, remove)

  ```tsx
  // Usage via Plate component
  <Plate
    onNodeChange={({ editor, node, operation, prevNode }) => {
      console.log('Node changed:', { node, operation, prevNode });
    }}
    onTextChange={({ editor, node, operation, prevText, text }) => {
      console.log('Text changed:', { text, prevText, operation });
    }}
  />;

  // Usage via plugin
  MyPlugin.configure({
    handlers: {
      onNodeChange: ({ node, operation, prevNode }) => {
        // Handle node changes
      },
      onTextChange: ({ node, operation, prevText, text }) => {
        // Handle text changes
      },
    },
  });
  ```
