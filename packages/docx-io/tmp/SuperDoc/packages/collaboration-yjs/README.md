# SuperDoc Yjs collaboration library

`@harbour-enterprises/superdoc-yjs-collaboration` is a library for integrating Yjs-based real-time collaborative editing into any Node.js WebSocket-enabled server framework. It is designed to work out-of-the-box for **SuperDoc**.

It provides:

- **CRDT**-based document synchronization with Yjs
- **WebSocket** compatibility via `y-websocket` utilities
- **Configurable hooks** for authentication, loading initial state, persistence, and change events
- **Debounced persistence** to control write frequency
- **Co-Presence (Awareness)** support through `y-protocols/awareness`

---

## Features

- **Fluent builder API**: chainable methods to configure name, debounce, hooks, and extensions.
- **Framework-agnostic**: can be used with Fastify, Express, Koa, or any WebSocket-capable HTTP server.
- **Pluggable hooks**: `onAuthenticate`, `onLoad`, `onAutoSave`, `onChange`, plus custom extensions.
- **Debounced persistence**: built-in support for batching state saves.
- **Awareness & co-presence**: optional user presence through built-in Awareness support.
- **TypeScript & JSDoc**: fully documented via JSDoc for IDEs and TS consumption.

---

## Examples

Please see a [quick start example here](https://github.com/Harbour-Enterprises/SuperDoc/tree/develop/packages/collaboration-yjs/examples/fastify)

## Installation

```bash
npm install @harbour-enterprises/superdoc-yjs-collaboration
# or
yarn add @harbour-enterprises/superdoc-yjs-collaboration
```

For local development, link your built package:

```bash
cd superdoc-yjs-collaboration
npm run build
npm link

# in your project
npm link @harbour-enterprises/superdoc-yjs-collaboration
```

---

## Quick start

If you installed & linked, you can run the included **Fastify** example by simply running:

```bash
npm run dev
```

## Quick Start (Example)

Below is an example using Fastify, but you can adapt it to any server framework.

```js
import Fastify from 'fastify';
import websocket from '@fastify/websocket';
import { v4 as uuidv4 } from 'uuid';
import SuperDocCollaboration from '@harbour-enterprises/superdoc-yjs-collaboration';

const app = Fastify();
app.register(websocket);

/**
 * Hooks
 */
const onAuthenticate = (params) => {}; // Custom auth logic
const onLoad = (params) => {}; // Load your document from persistence (ie: S3)
const onAutoSave = (params) => {}; // Debounced onChange hook based on 'withDebounce' setting. Save to persistence.
const onChange = (params) => {}; // On change hook. This gets triggered a lot!

const service = new SuperDocCollaboration()
  .withName(`sdc-${uuidv4()}`)
  .withDebounce(500)
  .onAuthenticate(onAuthenticate)
  .onLoad(onLoad)
  .onAutoSave(onAutoSave)
  .onChange(onChange)
  .build();

app.get('/collaboration/:documentId', { websocket: true }, (socket, request) => service.welcome(socket, request));

app.listen({ port: 3000 });
```

See `examples/fastify` for more details

---

## API Reference

### `CollaborationBuilder`

Fluent builder for the collaboration service.

| Method                              | Description                                                       |
| ----------------------------------- | ----------------------------------------------------------------- |
| `.withName(name: string)`           | Set a unique service identifier.                                  |
| `.withDebounce(ms: number)`         | Debounce interval for persistence (ms).                           |
| `.withDocumentExpiryMs(ms: number)` | Time to retain documents in cache when no clients connected (ms). |
| `.onConfigure(fn)`                  | Hook triggered after service is configured                        |
| `.onAuthenticate(fn)`               | Hook to authenticate each connection.                             |
| `.onLoad(fn)`                       | Hook to load document state from storage or database              |
| `.onAutoSave(fn)`                   | Hook to persist document state.                                   |
| `.onChange(fn)`                     | Hook for processing Yjs updates.                                  |
| `.build()`                          | Build and return the `SuperDocCollaboration`                      |

### `SuperDocCollaboration`

Core engine for handling WebSocket connections and Yjs sync.

| Method                                 | Description                                               |
| -------------------------------------- | --------------------------------------------------------- |
| `.welcome(socket: WebSocket, request)` | Accept a new WS connection and start Yjs synchronization. |

---

## License

AGPL-3.0
