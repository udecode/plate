import { setupConnection } from '../shared-doc/index.js';
import { createLogger } from '../internal-logger/logger.js';

/**
 * @typedef {Object} ConnectionHandlerConfig
 * @property {import('../document-manager/manager.js').DocumentManager} documentManager - The document manager instance.
 * @property {import('../types.js').Hooks} hooks - The hooks for authentication and change handling.
 */

/**
 * Handles WebSocket connections for collaborative document editing.
 * This class manages the connection lifecycle, including authentication,
 * setting up the document, and handling incoming messages.
 * It also provides methods to close the connection gracefully.
 */
export class ConnectionHandler {
  /** @type {import('../document-manager/manager.js').DocumentManager} */
  documentManager;

  /** @type {import('../types.js').Hooks} */
  #hooks;

  /** @type {ReturnType<import('../internal-logger/logger.js').createLogger>} */
  #log;

  /** @type {import('../types.js').WebSocket|null} */
  #socket;

  /** @type {import('../types.js').SocketRequest} */
  #request;

  /** @type {string} */
  #documentId;

  /** @type {import('../types.js').CollaborationParams} */
  #params;

  /**
   * @param {ConnectionHandlerConfig} config
   */
  constructor({ documentManager, hooks }) {
    this.documentManager = documentManager;
    this.#hooks = hooks;
    this.#log = createLogger('ConnectionHandler');
  }

  /**
   * Main handler for incoming WebSocket connections.
   * @param {import('../types.js').WebSocket} socket
   * @param {import('../types.js').SocketRequest} request
   * @param {import('../types.js').CollaborationParams} params - Additional parameters for the connection.
   */
  async handle(socket, request, params) {
    this.#socket = socket;
    this.#request = request;
    this.#params = { ...params };
    this.#documentId = this.#params.documentId;

    /**
     * Attempt to authenticate the connection.
     * If the authentication hook throws an error, we abort the connection
     */
    const userContext = await this.#authenticate(this.#socket, this.#request, this.#params);
    const userParams = { ...this.#params, userContext };

    /**
     * If authenticated, load the document
     */
    const sharedDoc = await this.documentManager.getDocument(this.#documentId, userParams);
    userParams['document'] = sharedDoc;

    /**
     * Connect some listeners for our hooks, if provided
     */
    if (this.#hooks.beforeChange) {
      // keeping transaction here for future reference
      // eslint-disable-next-line no-unused-vars
      sharedDoc.on('beforeTransaction', (transaction) => {
        this.#hooks.beforeChange(userParams);
      });
    }

    if (this.#hooks.change) {
      // keeping origin here for future reference
      // eslint-disable-next-line no-unused-vars
      sharedDoc.on('update', (update, origin) => {
        this.#hooks.change(userParams);
      });
    }

    // eslint-disable-next-line no-unused-vars
    socket.on('close', (/** @type {number} */ code, /** @type {Buffer} */ reason) => {
      this.#log('🔌 Socket closed, cleaning up connection for', /** @type {string} */ (params.documentId));
      this.documentManager.releaseConnection(/** @type {string} */ (params.documentId), socket);
    });

    /** Initialieze the socket connection  */
    setupConnection(this.#socket, sharedDoc);

    return userParams;
  }

  /**
   * Authenticate the WebSocket connection.
   * This method checks if the `authenticate` hook is defined and calls it.
   * If the authentication fails, it closes the socket with an error code.
   * If an error occurs during authentication, it also closes the socket with an error code.
   * @param {import('../types.js').WebSocket} socket The WebSocket connection to authenticate.
   * @param {import('../types.js').CollaborationParams} params - The parameters for this connection.
   * @returns {Promise<import('../types.js').UserContext | void>} Context object if authentication is successful, else closes the socket.
   */
  async #authenticate(socket, request, params) {
    if (!this.#hooks.authenticate) {
      return true;
    }

    try {
      const userContext = await this.#hooks.authenticate(params);
      if (!userContext) {
        this.#log(`⛔ Auth rejected for ${params.documentId}`);
        socket.close(1008, 'Authentication failed');
      }
      return userContext;
    } catch (err) {
      this.#log(`🛑 Auth hook threw:`, err);
      socket.close(1011, 'Internal auth error');
      return false;
    }
  }

  /**
   * Close the socket connection with an error code.
   * @param {import('../types.js').WebSocket} socket
   * @param {string} errorMessage - The error message to send with the close frame.
   * @param {number} [code=1011] - The WebSocket close code (default is 1011, indicating an unexpected condition).
   */
  hangUp(socket, errorMessage, code = 1011) {
    this.#log(`Closing socket (${code})...`, errorMessage);
    socket.close(code, errorMessage);
  }
}
