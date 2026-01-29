# SuperDoc collaboration from scratch

This example shows how to create an absolutely minimal collaboration service for SuperDoc using utilities from the Yjs library directly.
It does not use our own **superdoc-yjs-library** (contact us q@sueprdoc.dev for more info).

This example is really an adaptation of [y-websocket-server](https://github.com/yjs/y-websocket-server/) from Yjs and shows how to use the basic utilities provided there to set up the socket connection.

**⚠️ Warning:** This example is a very basic, minimal example of getting Yjs set up on the server, and connecting it to the client. It does not offer any security or auth features, etc.

**Usage**: 
```
npm install
npm run dev
```

**Note**: Open two or more browser windows to http://localhost:5173/ (each one will refresh the document). Then, start collaborating!
