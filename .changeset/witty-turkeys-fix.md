---
'@udecode/plate-selection': patch
---

Remove the Div rendered above the editor.

This div is to solve the issue of the browser's default scrolling behavior being too fast.

However, it caused some other issues and complicated configurations, such as being unable to focus on the editor when clicking the padding-right area.

If you think this issue is more important, you refer to the flowing code.
```tsx
  BlockSelectionPlugin.configure({
    render: {
      aboveEditable: ({ children }) => {
    return ( <div style={{ position: 'relative', width: '100%' }}>
      {/*
       *select text then move cursor to the very bottom will trigger the default browser behavior
       *this div is a workaround to prevent the default browser behavior (set userSelect: none)
       *Make sure the div with is the same with the editor's padding-right
       */}

      {/* TODO: click to focus the node */}
      <div
        style={{
          height: '100%',
          position: 'absolute',
          right: 0,
          top: 0,
          userSelect: 'none',
          width: editorPaddingRight ?? 'max(5%, 24px)',
          zIndex: 1,
        }}
        data-plate-selectable
      />
      {children}
      </div>)
  },
    },
  }),
```
