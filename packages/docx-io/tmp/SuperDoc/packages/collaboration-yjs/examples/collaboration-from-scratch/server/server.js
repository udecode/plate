import * as Y from 'yjs';
import Fastify from 'fastify';
import websocketPlugin from '@fastify/websocket';
import { setupWSConnection } from './yjs-utils.js'

const app = Fastify({ logger: false });
app.register(websocketPlugin);

app.register(async function (app) {
  app.get('/collaboration/:documentId', { websocket: true }, (socket, request) => {
    const { documentId } = request.params;
    console.debug('WebSocket connection requested for document:', documentId);
  
    const options = { docName: documentId };
    const doc = setupWSConnection(socket, request.request, options);

    // You could add some listeners...
  
    /** Note: The update listener will get called a lot. You might want to debounce this. */
    doc.on('update', (update) => {
      console.debug(`Document ${documentId} updated with size: ${update.byteLength} bytes`);
    });
  
  })
});

app.listen({ port: 3050 });