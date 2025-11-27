# @platejs/yjs

## 52.0.1

### Patch Changes

- [#4750](https://github.com/udecode/plate/pull/4750) by [@zbeyens](https://github.com/zbeyens) – Add React Compiler support.

## 52.0.0

### Major Changes

- [#4747](https://github.com/udecode/plate/pull/4747) by [@zbeyens](https://github.com/zbeyens) – ESM-only

## 51.1.2

### Patch Changes

- [#4732](https://github.com/udecode/plate/pull/4732) by [@zbeyens](https://github.com/zbeyens) – Format code with Biome

## 51.1.0

### Minor Changes

- [#4714](https://github.com/udecode/plate/pull/4714) by [@baptisteArno](https://github.com/baptisteArno) – Add sharedType option

## 51.0.0

## 50.3.6

### Patch Changes

- [#4685](https://github.com/udecode/plate/pull/4685) by [@Pagebakers](https://github.com/Pagebakers) – Fixed issue where onReady would not be called

## 50.2.6

### Patch Changes

- [#4643](https://github.com/udecode/plate/pull/4643) by [@dpnova](https://github.com/dpnova) – Make provider accessible on hocuspocus so other libs can use it.

## 50.2.4

### Patch Changes

- [#4627](https://github.com/udecode/plate/pull/4627) by [@MohakBajaj](https://github.com/MohakBajaj) – Add `wsOptions` in YjsPlugin

## 49.0.0

### Major Changes

- [#4327](https://github.com/udecode/plate/pull/4327) by [@zbeyens](https://github.com/zbeyens) –
  - Renamed all `@udecode/plate-*` packages to `@platejs/*`. Replace `@udecode/plate-` with `@platejs/` in your code.

# @udecode/plate-yjs

## 48.0.0

### Major Changes

- [#4225](https://github.com/udecode/plate/pull/4225) by [@zbeyens](https://github.com/zbeyens) –

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
        url: "wss://hocuspocus.example.com",
        name: "document-1",
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
          type: "hocuspocus",
          options: {
            url: "wss://hocuspocus.example.com",
            name: "document-1",
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
          type: "hocuspocus",
          options: {
            url: "wss://hocuspocus.example.com",
            name: "document-1",
          },
        },
        {
          type: "webrtc",
          options: {
            roomName: "document-1",
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
    });

    // Destroy connection on component unmount
    return () => {
      editor.getApi(YjsPlugin).yjs.destroy();
    };
  }, [editor, mounted, roomName]); // Add relevant dependencies
  ```

## 44.0.0

## 43.0.0

### Minor Changes

- [#4019](https://github.com/udecode/plate/pull/4019) by [@zbeyens](https://github.com/zbeyens) – Upgrade dependencies to latest

## 42.0.0

## 41.0.0

## 40.0.0

## 39.0.0

## 38.0.1

### Patch Changes

- [#3526](https://github.com/udecode/plate/pull/3526) by [@zbeyens](https://github.com/zbeyens) – Prefix base plugin with `Base`

- [#3526](https://github.com/udecode/plate/pull/3526) by [@zbeyens](https://github.com/zbeyens) – Upgrade `yjs`, `@hocuspocus/provider`

## 38.0.0

## 37.0.0

### Major Changes

- [#3420](https://github.com/udecode/plate/pull/3420) by [@zbeyens](https://github.com/zbeyens) –
  - `createYjsPlugin` -> `YjsPlugin`
  - Move `yjsStore` to `YjsPlugin`
  - Move `editor.yjs.provider` to `options.provider`
  - Rename `RenderAboveEditableYjs` to `YjsAboveEditable`

## 36.0.2

### Patch Changes

- [`e01e1fc73403aaa6abccb04326e78cdfc8e6e8b6`](https://github.com/udecode/plate/commit/e01e1fc73403aaa6abccb04326e78cdfc8e6e8b6) by [@zbeyens](https://github.com/zbeyens) – doc: homepage

## 36.0.0

## 34.0.0

## 33.0.0

## 32.0.0

## 31.0.0

### Minor Changes

- [#3040](https://github.com/udecode/plate/pull/3040) by [@zbeyens](https://github.com/zbeyens) – Updated minor dependencies

## 30.5.3

### Patch Changes

- [`4cbed7159`](https://github.com/udecode/plate/commit/4cbed7159d51f7427051686e45bcf2a8899aeede) by [@zbeyens](https://github.com/zbeyens) – Move `@udecode/plate-common` to peerDeps to fix a bug when multiple instances were installed

## 30.4.5

## 30.1.2

## 30.0.0

## 29.1.0

## 29.0.1

## 29.0.0

## 28.0.0

## 27.0.3

## 27.0.0

### Patch Changes

- [#2763](https://github.com/udecode/plate/pull/2763) by [@12joan](https://github.com/12joan) – Update Zustood imports

## 25.0.1

## 25.0.0

## 24.5.2

## 24.4.0

### Minor Changes

- [#2675](https://github.com/udecode/plate/pull/2675) by [@zbeyens](https://github.com/zbeyens) – Support slate-react 0.99.0

## 24.3.6

## 24.3.5

## 24.3.2

## 24.3.1

## 24.3.0

## 24.2.0

## 24.0.2

## 24.0.1

## 24.0.0

## 23.7.4

## 23.7.0

## 23.6.0

## 23.3.1

## 23.3.0

## 22.1.0

### Minor Changes

- [#2487](https://github.com/udecode/plate/pull/2487) by [@zbeyens](https://github.com/zbeyens) – New plugin: yjs for collaboration.
