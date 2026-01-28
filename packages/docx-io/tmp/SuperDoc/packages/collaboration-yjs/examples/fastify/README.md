# SuperDoc Collaboration Example (Fastify)

This example demonstrates how to set up a Fastify server with WebSocket support to run the custom SuperDoc Collaboration service using Yjs.

## Prerequisites

* Node.js v18+ or higher (Node v20+ recommended)
* npm or yarn
* The `@harbour-enterprises/superdoc-yjs-collaboration` package built and linked locally (or installed from npm)

## Installation

1. **Install dependencies** in the example directory:

   ```bash
   cd examples/fastify
   npm install
   ```

2. **Link or install** the collaboration library:

   * **Using `npm link`** (local development):

     ```bash
     # in your main package folder
     npm run build       # ensure dist/ is built
     npm link

     # in the example folder
     npm link @harbour-enterprises/superdoc-yjs-collaboration
     ```

   * **Or as a file dependency** in `package.json`:

     ```json
     "dependencies": {
       "@harbour-enterprises/superdoc-yjs-collaboration": "file:../../"
     }
     ```

## Running the Example

The `dev` script watches both your library and the example and restarts the server on changes.

```bash
npm run dev
```

Or start the example alone (after building the library):

```bash
cd examples/fastify
npm start
```

The server listens on port `3000` by default.

## Endpoints

* **`GET /`**

  * Simple HTTP endpoint. Returns a greeting string.

* **`GET /collaboration/:documentId`**

  * WebSocket endpoint to join a Yjs-powered collaborative session.
  * Replace `:documentId` with your document identifier (e.g. `my-doc-id`).
