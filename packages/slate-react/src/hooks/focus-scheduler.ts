export const scheduleSlateReactFocus = (callback: () => void) => {
  if (typeof globalThis.requestAnimationFrame === 'function') {
    globalThis.requestAnimationFrame(() => {
      callback();
    });
    return;
  }

  if (typeof globalThis.setTimeout === 'function') {
    globalThis.setTimeout(callback, 0);
    return;
  }

  void Promise.resolve().then(callback);
};
