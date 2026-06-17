# Plate Yjs plugin

`@platejs/yjs` binds Plate editors to a shared Yjs document. It ships provider wrappers for IndexedDB, Hocuspocus, and WebRTC, and accepts custom providers that implement the same `UnifiedProvider` interface.

Read the main docs at [platejs.org/docs/yjs](https://platejs.org/docs/yjs).

## Installation

Install the plugin.

```bash
npm install @platejs/yjs
```

Install network provider packages as needed:

```bash
npm install @hocuspocus/provider
```

```bash
npm install y-webrtc
```

## Usage

Configure `YjsPlugin` with a `providers` array. Every configured provider receives the same plugin-owned `Y.Doc` and `Awareness` instance.

```tsx
import { YjsPlugin } from '@platejs/yjs/react';
import { createPlateEditor } from 'platejs/react';

const editor = createPlateEditor({
  plugins: [
    YjsPlugin.configure({
      options: {
        providers: [
          {
            type: 'indexeddb',
            options: {
              docName: 'document-1',
            },
          },
          {
            type: 'hocuspocus',
            options: {
              name: 'document-1',
              url: 'wss://collab.example.com',
            },
          },
          {
            type: 'webrtc',
            options: {
              roomName: 'document-1',
            },
          },
        ],
      },
    }),
  ],
  skipInitialization: true,
});
```

Call `init` after the editor mounts, and call `destroy` when it unmounts:

```tsx
await editor.getApi(YjsPlugin).yjs.init({
  id: 'document-1',
  value: initialValue,
});

editor.getApi(YjsPlugin).yjs.destroy();
```

## Providers

| Type | Package | Purpose | Options |
| --- | --- | --- | --- |
| `indexeddb` | `y-indexeddb` | Browser-local document persistence | `{ docName: string }` |
| `hocuspocus` | `@hocuspocus/provider` | WebSocket server collaboration | `HocuspocusProviderConfiguration` |
| `webrtc` | `y-webrtc` | Peer-to-peer collaboration | `{ roomName: string; signaling?: string[]; password?: string; maxConns?: number; peerOpts?: object }` |

Use the same document identifier across providers that should share one document. For example, pair `docName: 'document-1'` with `name: 'document-1'` or `roomName: 'document-1'`.

IndexedDB only persists Yjs updates locally. It does not transport awareness, cursors, or remote users; combine it with Hocuspocus or WebRTC for multi-user collaboration.

## Shared Documents

Pass `ydoc` when another part of your app owns the document:

```tsx
import * as Y from 'yjs';

const ydoc = new Y.Doc();

YjsPlugin.configure({
  options: {
    ydoc,
    providers: [
      {
        type: 'indexeddb',
        options: {
          docName: 'document-1',
        },
      },
    ],
  },
});
```

Use `sharedType` when the editor content lives inside a nested `Y.XmlText`:

```tsx
const parentDoc = new Y.Doc();
const editors = parentDoc.getMap('editors');
const mainContent = new Y.XmlText();

editors.set('main', mainContent);

YjsPlugin.configure({
  options: {
    sharedType: mainContent,
    ydoc: parentDoc,
    providers: [
      {
        type: 'indexeddb',
        options: {
          docName: 'document-1',
        },
      },
    ],
  },
});
```

## Custom Providers

Use a pre-instantiated provider directly when you need behavior outside the built-in wrappers:

```tsx
import type { UnifiedProvider } from '@platejs/yjs';

const provider: UnifiedProvider = new MyProvider({ awareness, doc: ydoc });

YjsPlugin.configure({
  options: {
    providers: [provider],
  },
});
```

Register reusable provider classes with `registerProviderType`:

```tsx
import { registerProviderType } from '@platejs/yjs';

registerProviderType('custom', CustomProviderWrapper);

YjsPlugin.configure({
  options: {
    providers: [
      {
        type: 'custom',
        options: {
          roomName: 'document-1',
        },
      },
    ],
  },
});
```

## License

[MIT](../../LICENSE)
