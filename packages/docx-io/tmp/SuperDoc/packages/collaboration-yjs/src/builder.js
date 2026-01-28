import { SuperDocCollaboration } from './collaboration/index.js';

/**
 * @typedef {import('./types.js').ConfigureFn} ConfigureFn
 * @typedef {import('./types.js').AuthenticateFn} AuthenticateFn
 * @typedef {import('./types.js').LoadFn} LoadFn
 * @typedef {import('./types.js').AutoSaveFn} AutoSaveFn
 * @typedef {import('./types.js').BeforeChangeFn} BeforeChangeFn
 * @typedef {import('./types.js').ChangeFn} ChangeFn
 * @typedef {import('./types.js').Hooks} Hooks
 * @typedef {import('./types.js').Hooks} Extension
 */

/**
 * Fluent builder for the SuperDoc collaboration service.
 */
export class CollaborationBuilder {
  constructor() {
    /** @type {string} */
    this._name = '';

    /** @type {number} */
    this._debounceMs = 5000;

    /** @type {Hooks} */
    this._hooks = {};

    /** @type {Extension[]} */
    this._extensions = [];

    /** @type {number} */
    this._documentExpiryMs = 5000;
  }

  /**
   * @param {string} name  Unique service name/id
   * @returns {CollaborationBuilder}
   */
  withName(name) {
    this._name = name;
    return this;
  }

  /**
   * @param {number} ms  Time before expiring documents in cache in milliseconds.
   * @returns {CollaborationBuilder}
   */
  withDocumentExpiryMs(ms) {
    this._documentExpiryMs = ms;
    return this;
  }

  /**
   * @param {number} ms  Debounce interval in milliseconds
   * @returns {CollaborationBuilder}
   */
  withDebounce(ms) {
    this._debounceMs = ms;
    return this;
  }

  /**
   * @param {ConfigureFn} userFunction
   * @returns {CollaborationBuilder}
   */
  onConfigure(userFunction) {
    this._hooks.configure = userFunction;
    return this;
  }

  /**
   * @param {AuthenticateFn} userFunction
   * @returns {CollaborationBuilder}
   */
  onAuthenticate(userFunction) {
    this._hooks.authenticate = userFunction;
    return this;
  }

  /**
   * @param {LoadFn} userFunction
   * @returns {CollaborationBuilder}
   */
  onLoad(userFunction) {
    this._hooks.load = userFunction;
    return this;
  }

  /**
   * @param {AutoSaveFn} userFunction
   * @returns {CollaborationBuilder}
   */
  onAutoSave(userFunction) {
    this._hooks.autoSave = userFunction;
    return this;
  }

  /**
   * @param {BeforeChangeFn} userFunction
   * @returns {CollaborationBuilder}
   */
  onBeforeChange(userFunction) {
    this._hooks.beforeChange = userFunction;
    return this;
  }

  /**
   * @param {ChangeFn} userFunction
   * @returns {CollaborationBuilder}
   */
  onChange(userFunction) {
    this._hooks.change = userFunction;
    return this;
  }

  /**
   * @param {Extension[]} exts
   * @returns {CollaborationBuilder}
   */
  useExtensions(exts) {
    this._extensions.push(...exts);
    return this;
  }

  /**
   * Validate and construct our SuperDoc Collaboration service instance.
   * @throws {Error} if required options are missing
   * @returns {SuperDocCollaboration} The collaboration service instance
   */
  build() {
    if (!this._name) {
      throw new Error('CollaborationBuilder: `.withName()` is required');
    }

    const config = {
      name: this._name,
      documentExpiryMs: this._documentExpiryMs,
      debounce: this._debounceMs,
      hooks: this._hooks,
      extensions: this._extensions,
    };

    if (this._hooks.configure) {
      this._hooks.configure(config);
    }

    return new SuperDocCollaboration(config);
  }
}
