/**
 * @template HookFnResponse
 * @callback HookFn
 * @param {CollaborationParams} params
 * @returns {Promise<HookFnResponse> | HookFnResponse | void}
 */

/**
 * @typedef {Object} ServiceConfig Configuration for the CollaborationBuilder
 * @property {string} name - Unique service identifier
 * @property {number} [debounce] - Debounce interval in milliseconds
 * @property {number} [documentExpiryMs] - Time before expiring documents in cache in milliseconds
 * @property {Hooks} [hooks] - Lifecycle hooks (authenticate, load, etc.)
 * @property {Extension[]} [extensions] - Array of custom extensions
 */

/**
 * @callback ConfigureFn
 * @param {ServiceConfig} config
 * @returns {void}
 */

/** @typedef {HookFn<Promise<UserContext>>} AuthenticateFn */
/** @typedef {HookFn<Promise<Uint8Array>>} LoadFn */
/** @typedef {HookFn<void>} BeforeChangeFn */
/** @typedef {HookFn<void>} ChangeFn */
/** @typedef {HookFn<void>} AutoSaveFn */

/**
 * @typedef {Object} Hooks
 * @property {ConfigureFn} [configure]
 * @property {AuthenticateFn}  [authenticate]
 * @property {LoadFn} [load]
 * @property {BeforeChangeFn} [beforeChange]
 * @property {ChangeFn} [change]
 * @property {AutoSaveFn} [autoSave]
 */

/**
 * @typedef {Object} Extension This is a CollaborationBuilder extension
 */

/**
 * @typedef {Object} WebSocket
 */

/**
 * @typedef {Object} SocketRequest
 */

/**
 * @typedef {Object} CollaborationParams
 * @property {string} documentId - The ID of the document being collaborated on.
 * @property {string} [token] - Optional authentication token.
 * @property {UserContext} [userContext] - Optional user information.
 */

/**
 * @typedef {Object} UserContext - Custom object containing user context
 */

export {};
