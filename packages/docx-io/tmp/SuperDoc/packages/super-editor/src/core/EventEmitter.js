/**
 * EventEmitter class is used to emit and subscribe to events.
 */
export class EventEmitter {
  #events = new Map();

  /**
   * Subscribe to the event.
   * @param {string} name Event name.
   * @param {(...args: any[]) => void} fn Callback.
   * @returns {void}
   */
  on(name, fn) {
    const callbacks = this.#events.get(name);
    if (callbacks) callbacks.push(fn);
    else this.#events.set(name, [fn]);
  }

  /**
   * Emit event.
   * @param {string} name Event name.
   * @param {...any} args – Arguments to pass to each listener.
   * @returns {void}
   */
  emit(name, ...args) {
    const callbacks = this.#events.get(name);
    if (!callbacks) return;
    for (const fn of callbacks) {
      fn.apply(this, args);
    }
  }

  /**
   * Remove a specific callback from event
   * or all event subscriptions.
   * @param {string} name Event name.
   * @param {(...args: any[]) => void} fn Callback.
   * @returns {void}
   */
  off(name, fn) {
    const callbacks = this.#events.get(name);
    if (!callbacks) return;
    if (fn) {
      this.#events.set(
        name,
        callbacks.filter((cb) => cb !== fn),
      );
    } else {
      this.#events.delete(name);
    }
  }

  /**
   * Subscribe to an event that will be called only once.
   * @param {string} name Event name.
   * @param {(...args: any[]) => void} fn Callback.
   * @returns {void}
   */
  once(name, fn) {
    const wrapper = (...args) => {
      this.off(name, wrapper);
      fn.apply(this, args);
    };
    this.on(name, wrapper);
  }

  /**
   * Remove all registered events and subscriptions.
   */
  removeAllListeners() {
    this.#events = new Map();
  }
}
