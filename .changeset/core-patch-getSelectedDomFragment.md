---
'@platejs/core': patch
---

- Added `getSelectedDomFragment` utility function that returns Slate nodes from DOM selection.
  
  ```ts
  // Before: Using getSelectedDomBlocks
  const domBlocks = getSelectedDomBlocks();
  const fragment: Descendant[] = [];
  domBlocks.forEach((node) => {
    const blockId = node.dataset.slateId;
    const block = editor.api.node({ id: blockId, at: [] });
    if (block && block[1].length === 1) {
      fragment.push(block[0]);
    }
  });
  
  // After: Using getSelectedDomFragment
  const fragment = getSelectedDomFragment(editor);
  ```

- Deprecated `getSelectedDomBlocks`. Use `getSelectedDomFragment` instead.