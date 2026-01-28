import { generateParams } from './helpers.js';
import { createLogger } from '../internal-logger/logger.js';

import { DocumentManager } from '../document-manager/manager.js';
import { ConnectionHandler } from '../connection-handler/handler.js';

/**
 * Create and configure a SuperDoc collaboration service.
 * Simply call service.welcome(socket, request) in your WebSocket endpoint.
 *
 * @property {ServiceConfig} config - Configuration object
 * @property {DocumentManager} documentManager  - Manages SharedSuperDoc instances
 */
export class SuperDocCollaboration {
  /** @type {import('../connection-handler/handler.js').ConnectionHandler} */
  #connectionHandler;

  #log = createLogger('SuperDocCollaboration');

  /**
   * @param {import('../types.js').ServiceConfig} config
   */
  constructor(config) {
    this.config = config;
    this.documentManager = new DocumentManager(config);

    this.#connectionHandler = new ConnectionHandler({
      documentManager: this.documentManager,
      hooks: config.hooks,
    });
  }

  /** Get the name of the collaboration service */
  get name() {
    return this.config.name || 'SuperDocCollaboration';
  }

  /**
   * Initialize the SuperDoc collaboration service and initialize the connection.
   * @param {import('../types.js').WebSocket} socket - The WebSocket connection.
   * @param {import('../types.js').SocketRequest} request - The request object containing connection details.
   * @returns {Promise<void>}
   */
  async welcome(socket, request) {
    const params = generateParams(request, this);
    this.#log('New connection request', params.documentId);
    await this.#connectionHandler.handle(socket, request, params);
  }

  has(documentId) {
    return this.documentManager.has(documentId);
  }
}
