import { WebsocketProvider } from 'y-websocket';
import { HocuspocusProvider } from '@hocuspocus/provider';
import { awarenessStatesToArray } from '@harbour-enterprises/common/collaboration/awareness.js';
import { Doc as YDoc } from 'yjs';

/**
 * Translate awareness states to an array of users. This will cause superdoc (context) to
 * emit an awareness-update event with the list of users.
 *
 * @param {Object} context The superdoc instance
 * @param {Object} param
 * @param {Object} param.changes The changes in awareness states
 * @param {Object} param.states The current awareness states
 * @returns {void}
 */
function awarenessHandler(context, { changes = {}, states }) {
  // Context is the superdoc instance
  // Since co-presence is handled outside of superdoc,
  // we need to emit an awareness-update event

  const { added = [], removed = [] } = changes;
  const awarenessArray = awarenessStatesToArray(context, states);

  const payload = {
    states: awarenessArray,
    added,
    removed,
    superdoc: context,
  };

  context.emit('awareness-update', payload);
}

/**
 * Main function to create a provider for collaboration.
 * Currently only hocuspocus is actually supported.
 *
 * @param {Object} param The config object
 * @param {Object} param.config The configuration object
 * @param {Object} param.ydoc The Yjs document
 * @param {Object} param.user The user object
 * @param {string} param.documentId The document ID
 * @returns {Object} The provider and socket
 */
function createProvider({ config, user, documentId, socket, superdocInstance }) {
  if (!config.providerType) config.providerType = 'superdoc';

  const providers = {
    hocuspocus: () => createHocuspocusProvider({ config, user, documentId, socket, superdocInstance }),
    superdoc: () => createSuperDocProvider({ config, user, documentId, socket, superdocInstance }),
  };
  if (!providers) throw new Error(`Provider type ${config.providerType} is not supported.`);

  return providers[config.providerType]();
}

/**
 *
 * @param {Object} param The config object
 * @param {Object} param.config The configuration object
 * @param {Object} param.ydoc The Yjs document
 * @param {Object} param.user The user object
 * @param {string} param.documentId The document ID
 * @returns {Object} The provider and socket
 */
function createSuperDocProvider({ config, user, documentId, superdocInstance }) {
  const ydoc = new YDoc({ gc: false });
  const options = {
    params: {
      ...config.params,
    },
  };

  const provider = new WebsocketProvider(config.url, documentId, ydoc, options);
  provider.awareness.setLocalStateField('user', user);
  provider.awareness.on('update', (changes = {}) => {
    return awarenessHandler(superdocInstance, { changes, states: provider.awareness.getStates() });
  });
  return { provider, ydoc };
}

/**
 *
 * @param {Object} param The config object
 * @param {Object} param.config The configuration object
 * @param {Object} param.ydoc The Yjs document
 * @param {Object} param.user The user object
 * @param {string} param.documentId The document ID
 * @returns {Object} The provider and socket
 */
function createHocuspocusProvider({ config, user, documentId, socket, superdocInstance }) {
  const ydoc = new YDoc({ gc: false });
  const options = {
    websocketProvider: socket,
    document: ydoc,
    name: documentId,
    token: config.token || '',
    preserveConnection: false,
    onAuthenticationFailed: () => onAuthenticationFailed(documentId),
    onConnect: () => onConnect(superdocInstance, documentId),
    onDisconnect: () => onDisconnect(superdocInstance, documentId),
    onDestroy: () => onDestroy(superdocInstance, documentId),
  };

  const provider = new HocuspocusProvider(options);
  provider.setAwarenessField('user', user);

  provider.on('awarenessUpdate', (params) => {
    return awarenessHandler(superdocInstance, {
      states: params.states,
    });
  });

  return { provider, ydoc };
}

const onAuthenticationFailed = (data, documentId) => {
  console.warn('🔒 [superdoc] Authentication failed', data, 'document', documentId);
};

const onConnect = (superdocInstance, documentId) => {
  console.warn('🔌 [superdoc] Connected -- ', documentId);
};

const onDisconnect = (superdocInstance, documentId) => {
  console.warn('🔌 [superdoc] Disconnected', documentId);
};

const onDestroy = (superdocInstance, documentId) => {
  console.warn('🔌 [superdoc] Destroyed', documentId);
};

export { createProvider };
