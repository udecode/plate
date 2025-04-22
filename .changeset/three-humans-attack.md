---
'@udecode/plate-yjs': major
---

- Add multi-provider support for improved collaboration: now supports both Hocuspocus and WebRTC simultaneously using a shared Y.Doc.
  - **Migration**: Replace `hocuspocusProviderOptions` with the new `providers` array. See examples below.

**Before:**

```tsx
YjsPlugin.configure({
  options: {
    cursorOptions: {
      /* ... */
    },
    hocuspocusProviderOptions: {
      url: 'wss://hocuspocus.example.com',
      name: 'document-1',
      // ... other Hocuspocus options
    },
  },
});
```

**After (Hocuspocus only):**

```tsx
YjsPlugin.configure({
  options: {
    cursors: {
      /* ... */
    },
    providers: [
      {
        type: 'hocuspocus',
        options: {
          url: 'wss://hocuspocus.example.com',
          name: 'document-1',
          // ... other Hocuspocus options
        },
      },
    ],
  },
});
```

**After (Hocuspocus + WebRTC):**

```tsx
YjsPlugin.configure({
  options: {
    cursors: {
      /* ... */
    },
    providers: [
      {
        type: 'hocuspocus',
        options: {
          url: 'wss://hocuspocus.example.com',
          name: 'document-1',
        },
      },
      {
        type: 'webrtc',
        options: {
          roomName: 'document-1',
          // signaling: ['wss://signaling.example.com'], // Optional
        },
      },
    ],
  },
});
```

- Introduces `UnifiedProvider` interface that enables custom provider implementations (e.g., IndexedDB for offline persistence).
- Renamed `cursorOptions` to `cursors`.
- Merged `yjsOptions` into `options`.
  - **Migration**: Move options previously under `yjsOptions` directly into the main `options` object.
- Removed `YjsAboveEditable`. You should now call `init` and `destroy` manually:

```tsx
React.useEffect(() => {
  if (!mounted) return;

  // Initialize Yjs connection and sync
  editor.getApi(YjsPlugin).yjs.init({
    id: roomName, // Or your document identifier
    value: INITIAL_VALUE, // Your initial editor content
    autoSelect: 'end', // Optional: Auto-select end after init
  });

  // Destroy connection on component unmount
  return () => {
    editor.getApi(YjsPlugin).yjs.destroy();
  };
}, [editor, mounted, roomName]); // Add relevant dependencies
```
