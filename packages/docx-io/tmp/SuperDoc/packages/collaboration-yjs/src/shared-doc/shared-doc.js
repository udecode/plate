import { writeUpdate, readSyncMessage, writeSyncStep1, writeSyncStep2 } from 'y-protocols/sync';
import { createEncoder, writeVarUint, writeVarUint8Array, toUint8Array, length as encodingLength } from 'lib0/encoding';
import { readVarUint8Array, createDecoder, readVarUint } from 'lib0/decoding';
import { Awareness, encodeAwarenessUpdate, removeAwarenessStates, applyAwarenessUpdate } from 'y-protocols/awareness';
import { Doc as YDoc } from 'yjs';
import { callbackHandler, isCallbackSet, debouncer } from './index.js';
import { messageSync, messageAwareness, wsReadyStateConnecting, wsReadyStateOpen } from './index.js';

/**
 * Represents a shared document that can be collaboratively edited.
 * Wraps a Yjs document and manages WebSocket connections,
 * awareness states, and update handling.
 */
export class SharedSuperDoc extends YDoc {
  /**
   * @param {string} name
   */
  constructor(name) {
    super({ gc: false });
    this.name = name;
    /**
     * Maps from conn to set of controlled user ids. Delete all user ids from awareness when this conn is closed
     * @type {Map<Object, Set<number>>}
     */
    this.conns = new Map();

    /**
     * @type {Awareness}
     */
    this.awareness = new Awareness(this);
    this.awareness.setLocalState(null);

    /**
     * @param {{ added: Array<number>, updated: Array<number>, removed: Array<number> }} changes
     * @param {Object | null} conn Origin is the connection that made the change
     */
    const awarenessChangeHandler = ({ added, updated, removed }, conn) => {
      const changedClients = added.concat(updated, removed);
      if (conn !== null) {
        const connControlledIDs = /** @type {Set<number>} */ (this.conns.get(conn));
        if (connControlledIDs !== undefined) {
          added.forEach((clientID) => {
            connControlledIDs.add(clientID);
          });
          removed.forEach((clientID) => {
            connControlledIDs.delete(clientID);
          });
        }
      }

      // broadcast awareness update
      const encoder = createEncoder();
      writeVarUint(encoder, messageAwareness);
      writeVarUint8Array(encoder, encodeAwarenessUpdate(this.awareness, changedClients));
      const buff = toUint8Array(encoder);
      this.conns.forEach((_, c) => {
        send(this, c, buff);
      });
    };

    this.awareness.on('update', awarenessChangeHandler);
    this.on('update', updateHandler);
    if (isCallbackSet) {
      this.on('update', (_update, _origin, doc) => {
        debouncer(() => callbackHandler(/** @type {SharedSuperDoc} */ (doc)));
      });
    }

    this.whenInitialized = contentInitializer();
  }
}

/**
 * @type {() => Promise<void>}
 */
let contentInitializer = () => Promise.resolve();

/**
 * The main handler for updates to the Yjs document.
 * This function encodes the update and sends it to all connected clients.
 * @param {Uint8Array} update
 * @param {any} _origin
 * @param {SharedSuperDoc} doc
 */
const updateHandler = (update, _origin, doc) => {
  const encoder = createEncoder();
  writeVarUint(encoder, messageSync);
  writeUpdate(encoder, update);
  const message = toUint8Array(encoder);
  doc.conns.forEach((_, conn) => send(doc, conn, message));
};

/**
 * @param {SharedSuperDoc} doc
 * @param {import('../types.js').WebSocket} conn - The WebSocket connection object.
 */
const closeConn = (doc, conn) => {
  if (doc.conns.has(conn)) {
    /**
     * @type {Set<number>}
     */
    // @ts-ignore
    const controlledIds = doc.conns.get(conn);
    doc.conns.delete(conn);
    removeAwarenessStates(doc.awareness, Array.from(controlledIds), null);
  }
  conn.close();
};

/**
 * @param {SharedSuperDoc} doc
 * @param {import('../types.js').WebSocket} conn - The WebSocket connection object.
 * @param {Uint8Array} message - The message to send.
 * @returns {void}
 */
export const send = (doc, conn, message) => {
  if (conn.readyState !== wsReadyStateConnecting && conn.readyState !== wsReadyStateOpen) {
    closeConn(doc, conn);
  }
  try {
    conn.send(message, {}, (err) => {
      err != null && closeConn(doc, conn);
    });
  } catch {
    closeConn(doc, conn);
  }
};

/**
 * Initialize the connection for a given document.
 * This function sets up the connection, assigns an on message handler,
 * and sends the initial sync message to the client.
 *
 * This also assigns onBeforeChange and onChange hooks if they are provided.
 * @param {import('../types.js').WebSocket} conn - The WebSocket connection object.
 * @param {SharedSuperDoc} doc - The SharedSuperDoc instance.
 * @returns {void}
 */
export const setupConnection = (conn, doc) => {
  doc.conns.set(conn, new Set());

  /** Assign an on message handler to the connection */
  conn.on(
    'message',
    /** @param {ArrayBuffer} message */
    (message) => {
      return messageListener(conn, doc, new Uint8Array(message));
    }
  );

  // Send initial sync step 1
  const encoder = createEncoder();
  writeVarUint(encoder, messageSync);
  writeSyncStep1(encoder, doc);
  send(doc, conn, toUint8Array(encoder));
};

/**
 * Add a message listener to the WebSocket connection.
 * This function decodes the message, determines its type, and processes it accordingly.
 * It handles sync messages and awareness updates, and sends appropriate responses.
 *
 * It also adds onChange and onBeforeChange hooks if they are provided.
 *
 * @param {any} conn - The WebSocket connection object.
 * @param {SharedSuperDoc} doc - The shared document instance.
 * @param {Uint8Array} message - The message received from the client.
 * @returns {void}
 */
const messageListener = (conn, doc, message) => {
  try {
    const encoder = createEncoder();
    const decoder = createDecoder(message);
    const messageType = readVarUint(decoder);

    switch (messageType) {
      case messageSync:
        writeVarUint(encoder, messageSync);
        readSyncMessage(decoder, encoder, doc, conn);

        // Check if readSyncMessage added content
        if (encodingLength(encoder) > 1) {
          send(doc, conn, toUint8Array(encoder));
        } else {
          // readSyncMessage didn't add anything, but we still need to send sync-step2
          // This happens when the client sends sync-step2 and we need to respond with our state
          writeSyncStep2(encoder, doc);
          if (encodingLength(encoder) > 1) {
            send(doc, conn, toUint8Array(encoder));
          }
        }
        break;

      case messageAwareness: {
        applyAwarenessUpdate(doc.awareness, readVarUint8Array(decoder), conn);
        break;
      }

      default:
        console.warn('Unknown message type:', messageType);
    }
  } catch (err) {
    console.error('Error in messageListener:', err);
    // @ts-ignore
    doc.emit('error', [err]);
  }
};
