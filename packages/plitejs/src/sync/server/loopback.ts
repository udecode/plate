import type { SyncClientMessage, SyncServerMessage } from '../protocol';
import type { SyncConnect, SyncRequest } from './server';

/**
 * Connects an in-process tab to a room. Each message crosses as JSON text, as
 * it would over a socket, so neither end can share an object with the other.
 */
export const connectLoopback = (
  server: Readonly<{ connect: SyncConnect }>,
  request: SyncRequest,
  receive: (message: SyncServerMessage) => void
) => {
  const connection = server.connect((data) => {
    const message: SyncServerMessage = JSON.parse(data);

    receive(message);
  }, request);

  return {
    close: connection.close,
    send: (message: SyncClientMessage) =>
      connection.receive(JSON.stringify(message)),
  };
};
