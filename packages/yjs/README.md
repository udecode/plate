# Plate yjs plugin

This package implements the yjs plugin for Plate with support for both Hocuspocus and WebRTC providers.

## Documentation

Check out [Collaboration](https://platejs.org/docs/yjs) for the main documentation.

### Installation

This package only requires the providers you actually use. Each provider package is an optional dependency:

```bash
# Base installation
npm install @platejs/yjs

# For Hocuspocus server-based collaboration
npm install @hocuspocus/provider

# For WebRTC peer-to-peer collaboration
npm install y-webrtc

# For IndexedDB persistence (optional)
npm install y-indexeddb
```

### Provider Configuration

The plugin supports two types of providers out of the box, with full type safety:

1. **Hocuspocus Provider**

   - Server-based collaboration using WebSocket
   - Suitable for large-scale applications
   - Requires a Hocuspocus server

2. **WebRTC Provider**
   - Peer-to-peer collaboration using WebRTC
   - No server required (except for signaling)
   - Best for small to medium-sized groups

Configuration is done using the `providerConfigs` array with provider-specific type checking:

```typescript
import { YjsPlugin } from '@platejs/yjs';
import * as Y from 'yjs';

// Create a Y.Doc (or use an existing one)
const ydoc = new Y.Doc();

const plugins = [
  // ... other plugins
  YjsPlugin({
    ydoc, // Pass your Y.Doc
    providerConfigs: [
      // Hocuspocus provider with type-checked options
      {
        type: 'hocuspocus',
        options: {
          url: 'ws://localhost:1234',
          name: 'document-name',
        },
      },
      // WebRTC provider with type-checked options
      {
        type: 'webrtc',
        options: {
          roomName: 'document-1',
          signaling: ['ws://127.0.0.1:4444'],
        },
      },
    ],
    // Optional: wait for all providers to sync before showing content
    waitForAllProviders: false, // Default is false
  }),
];
```

The configuration is fully type-safe, so you'll get autocomplete and type checking for provider-specific options.

### Using Custom Providers (Like IndexedDB)

The plugin now supports passing in pre-instantiated providers that implement the `UnifiedProvider` interface. This is especially useful for:

1. **Using providers that aren't built-in**, like IndexedDB for offline persistence
2. **Configuring providers with custom logic** beyond what the built-in options support
3. **Sharing provider instances** across different parts of your application

Here's an example using IndexedDB for offline persistence:

```typescript
import { YjsPlugin } from '@platejs/yjs';
import * as Y from 'yjs';
import { IndexeddbProvider } from 'y-indexeddb';
import { Awareness } from 'y-protocols/awareness';

// Create a Y.Doc
const ydoc = new Y.Doc();

// First, create the actual IndexedDB provider
const indexedDBInstance = new IndexeddbProvider('my-document', ydoc);

// Then wrap it to implement the UnifiedProvider interface
const indexedDBProvider = {
  // Required properties
  type: 'indexeddb',
  document: ydoc,
  awareness: new Awareness(ydoc),
  isConnected: true,
  isSynced: false,

  // Store the actual provider instance
  _provider: indexedDBInstance,

  // Required methods
  connect: function () {
    // IndexedDB is always "connected" locally
    this.isConnected = true;
    // Mark as synced once connected
    this.isSynced = true;
  },
  disconnect: function () {
    this.isConnected = false;
    this.isSynced = false;
  },
  destroy: function () {
    // Clean up the actual provider
    this._provider.destroy();
    this.disconnect();
  },
};

// Use your custom provider with the plugin
const plugins = [
  YjsPlugin({
    ydoc,
    // Pass your pre-instantiated providers
    customProviders: [indexedDBProvider],
    // You can still use built-in providers alongside custom ones
    providerConfigs: [
      {
        type: 'webrtc',
        options: {
          roomName: 'document-1',
        },
      },
    ],
  }),
];
```

The plugin will handle initializing, connecting, and synchronizing with all providers, regardless of whether they're built-in or custom. State tracking is maintained across all provider types.

### Multiple Providers and Fallbacks

You can use multiple providers simultaneously with the same Y.Doc for different synchronization strategies:

```typescript
import { YjsPlugin } from '@platejs/yjs';
import * as Y from 'yjs';

// Create a shared Y.Doc
const ydoc = new Y.Doc();

const plugins = [
  // ... other plugins
  YjsPlugin({
    ydoc,
    providerConfigs: [
      {
        type: 'webrtc',
        options: {
          roomName: 'document-1',
        },
      },
      {
        type: 'hocuspocus',
        options: {
          url: 'ws://localhost:1234',
          name: 'document-1',
        },
      },
    ],
    // Wait for all providers to sync before showing content
    waitForAllProviders: true,
  }),
];
```

#### How Multiple Providers Work Together

When you configure multiple providers:

1. All providers share the same Y.Doc instance
2. Data changes are automatically synced between all connected providers
3. If one provider (e.g., Hocuspocus server) goes down, other providers (e.g., WebRTC) continue to work
4. When a provider reconnects, it automatically syncs with the latest state
5. The plugin keeps track of how many providers are synced using a counter system

This lets you create robust setups like:

- WebRTC for fast peer-to-peer editing with Hocuspocus for server persistence
- Multiple Hocuspocus providers for fallback server connections
- Custom IndexedDB provider for offline persistence
- Any combination that suits your reliability and performance needs

By default, content will be shown as soon as at least one provider is synced. If `waitForAllProviders` is set to `true`, content will only appear when all configured providers are in sync.

### Using Nested Y.Doc Structures

By default, the plugin uses `ydoc.get('content', Y.XmlText)` for storing editor content. However, you can use the `sharedType` option to work with nested structures from a parent Y.Doc:

```typescript
import { YjsPlugin } from '@platejs/yjs';
import * as Y from 'yjs';

// Create a parent document with multiple nested editors
const parentDoc = new Y.Doc();

// Create nested structures for different editors
const editorsMap = parentDoc.getMap('editors');
const mainEditorContent = new Y.XmlText();
const sidebarEditorContent = new Y.XmlText();

// Store them in the parent doc
editorsMap.set('main', mainEditorContent);
editorsMap.set('sidebar', sidebarEditorContent);

// You can also store other data in the parent doc
const metadata = parentDoc.getMap('metadata');
metadata.set('title', 'My Document');
metadata.set('author', 'John Doe');
metadata.set('createdAt', Date.now());

// Create the main editor with the nested shared type
const mainEditor = createPlateEditor({
  plugins: [
    YjsPlugin.configure({
      ydoc: parentDoc, // Pass the parent doc for provider sync
      sharedType: mainEditorContent, // Use the specific nested content
      providers: [
        {
          type: 'webrtc',
          options: { roomName: 'my-document' },
        },
      ],
    }),
  ],
});

// Create a sidebar editor with its own nested shared type
const sidebarEditor = createPlateEditor({
  plugins: [
    YjsPlugin.configure({
      ydoc: parentDoc, // Same parent doc
      sharedType: sidebarEditorContent, // Different nested content
      providers: [], // Don't create new providers, parent is already synced
    }),
  ],
});

// Initialize with initial values - they'll be applied to the correct sharedTypes
await mainEditor.api.yjs.init({
  autoConnect: true,
  value: [{ type: 'p', children: [{ text: 'Main editor content' }] }],
});
await sidebarEditor.api.yjs.init({
  autoConnect: false,
  value: [{ type: 'p', children: [{ text: 'Sidebar content' }] }],
});
```

**Important:** When using a custom `sharedType`, the initial `value` passed to `init()` will be applied directly to that specific `sharedType`, not to the default `ydoc.get('content', Y.XmlText)`. This ensures each editor's initial content goes to the correct location in your nested structure.

### Cursor Support

Collaborative cursors are enabled by default. You can customize their appearance and behavior:

```typescript
YjsPlugin({
  ydoc,
  providerConfigs: [/* providers */],
  cursorOptions: {
    // Custom cursor options
    cursorData: {
      name: 'User Name',
      color: '#f00',
    },
  },
  // Alternatively, set disableCursors: true to disable cursors completely
}),
```

### Custom Provider Registration

For more complex scenarios, you can register your own provider types for the plugin to create automatically:

```typescript
import { registerProviderType } from '@platejs/yjs';
import * as Y from 'yjs';
import { Awareness } from 'y-protocols/awareness';
import { ProviderEventHandlers } from '@platejs/yjs';

// Create a custom provider class that implements UnifiedProvider interface
class CustomProviderWrapper {
  type = 'custom';
  private _awareness: Awareness;
  private _document: Y.Doc;
  private _isConnected = false;
  private _isSynced = false;
  private handlers?: ProviderEventHandlers;

  constructor(options, handlers, ydoc, awareness) {
    this.handlers = handlers;
    this._document = ydoc || new Y.Doc();
    this._awareness = awareness || new Awareness(this._document);
    // Setup your provider using the options...
  }

  // Required methods from UnifiedProvider interface
  connect() {
    // Implementation that connects to your service
    this._isConnected = true;
    // When you connect and become synced:
    this._isSynced = true;
    this.handlers?.onSyncChange?.(true);
  }

  disconnect() {
    // Implementation to disconnect
    this._isConnected = false;

    // If we were synced, report sync state change
    if (this._isSynced) {
      this._isSynced = false;
      this.handlers?.onSyncChange?.(false);
    }
  }

  destroy() {
    // Clean up resources
    this.disconnect();
  }

  get awareness() {
    return this._awareness;
  }

  get document() {
    return this._document;
  }

  get isConnected() {
    return this._isConnected;
  }

  get isSynced() {
    return this._isSynced;
  }
}

// Register your custom provider type
registerProviderType('custom', CustomProviderWrapper);

// Then use it in your config just like built-in providers
YjsPlugin({
  ydoc,
  providerConfigs: [
    {
      type: 'custom', // Use your registered type
      options: {
        // Custom options for your provider
      },
    },
  ],
});
```

> **Note:** There are two ways to use custom providers:
>
> 1. Use `customProviders` to pass pre-instantiated provider objects (simpler for one-off usage)
> 2. Use `registerProviderType` to register a provider class that can be created via `providerConfigs` (better for reusable providers)

## License

[MIT](../../LICENSE)
