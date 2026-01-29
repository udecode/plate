import { applyUpdate } from 'yjs';
import { createLogger } from '../internal-logger/logger.js';
import { SharedSuperDoc } from '../shared-doc/index.js';

/**
 * DocumentManager is responsible for managing Yjs documents.
 * It handles document retrieval and debouncing updates.
 */
export class DocumentManager {
  /** @type {Map<string, SharedSuperDoc>} */
  #documents = new Map();

  /** @type {import('../types.js').Hooks} */
  #hooks;

  /** @type {Map<string, NodeJS.Timeout>} */
  #timers = new Map();

  /** @type {ReturnType<import('../internal-logger/logger.js').createLogger>} */
  #log = createLogger('DocumentManager');

  /** @type {Map<string, NodeJS.Timeout>} */
  #cleanupTimers = new Map();

  /** @type {number} */
  #cacheDocumentsMs = 1000 * 60; // 1 minutes

  /** @type {number} */
  debounceMs = 5000; // 5 seconds

  /**
   * @param {import('../types.js').ServiceConfig} config
   */
  constructor(config) {
    this.#hooks = config.hooks;
    this.debounceMs = config.debounce ?? 0;
    1;
    this.#cacheDocumentsMs = config.documentExpiryMs ?? this.#cacheDocumentsMs;
  }

  get(documentId) {
    if (this.#documents.has(documentId)) {
      return this.#documents.get(documentId);
    }
    return null;
  }

  /**
   * Retrieves a Yjs document by its ID.
   * @param {string} documentId The ID of the document to retrieve.
   * @returns {Promise<SharedSuperDoc>} A promise that resolves to the Yjs document.
   */
  async getDocument(documentId, userParams) {
    if (!this.#documents.has(documentId)) {
      const doc = new SharedSuperDoc(documentId);
      this.#log(`Tracking new document: ${documentId}`);
      this.#documents.set(documentId, doc);

      if (this.#hooks.load) {
        const buffer = await this.#hooks.load(userParams);
        if (buffer) applyUpdate(doc, buffer);
      }

      this.#setupAutoSave(doc, userParams);
    }

    clearTimeout(this.#cleanupTimers.get(documentId)); // Clear any pending deletions
    return this.#documents.get(documentId);
  }

  /**
   * @param {SharedSuperDoc} doc - The SharedSuperDoc instance.
   */
  #setupAutoSave(doc, userParams) {
    if (this.debounceMs > 0 && this.#hooks.autoSave) {
      doc.on('update', () => this.#scheduleSave(doc, userParams));
    } else if (this.debounceMs === 0 && this.#hooks.autoSave) {
      this.#scheduleSave(doc, userParams);
    }
  }

  /**
   * @param {SharedSuperDoc} doc - The SharedSuperDoc instance.
   */
  #scheduleSave(doc, userParams) {
    const documentId = doc.name;
    if (this.debounceMs > 0) {
      clearTimeout(this.#timers.get(documentId));

      this.#timers.set(
        documentId,
        setTimeout(() => {
          this.#hooks.autoSave(userParams);
        }, this.debounceMs)
      );
    } else {
      this.#hooks.autoSave(userParams);
    }
  }

  /**
   * Public API: let us know this socket is gone for that doc.
   * @param {string} documentId
   * @param {WebSocket} socket
   */
  releaseConnection(documentId, socket) {
    const doc = this.#documents.get(documentId);
    if (!doc) return;

    doc.conns.delete(socket);

    // If nobody else is connected, schedule a cleanup
    if (doc.conns.size === 0) {
      this.#scheduleDocCleanup(documentId);
    }
  }

  /**
   * @param {string} documentId
   */
  #scheduleDocCleanup(documentId) {
    // clear any existing timer
    clearTimeout(this.#cleanupTimers?.get(documentId));

    // after X ms (or immediately) remove the doc
    const timeout = setTimeout(() => {
      const doc = this.#documents.get(documentId);
      if (doc.conns.size === 0) {
        this.#log(`🗑️  Cleaning up document "${documentId}" from memory.`);
        this.#documents.delete(documentId);
        this.#cleanupTimers.delete(documentId);
      }
    }, this.#cacheDocumentsMs);

    this.#cleanupTimers.set(documentId, timeout);
  }

  /**
   * Check if a document exists in the manager.
   * @param {string} documentId
   * @returns {boolean} True if the document exists, false otherwise.
   */
  has(documentId) {
    return this.#documents.has(documentId);
  }
}
