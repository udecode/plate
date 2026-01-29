const COLORS = {
  ConnectionHandler: '\x1b[34m', // blue
  DocumentManager: '\x1b[32m', // green
  SuperDocCollaboration: '\x1b[35m', // magenta
  reset: '\x1b[0m',
};

/**
 * Create a prefixed logger for a given class name.
 * @param {string} label
 * @returns {(...args: any[]) => void} A logger that prepends `[label]` in color.
 */
export function createLogger(label) {
  const color = COLORS[label] || COLORS.reset;

  /**
   * The actual logger function.
   *
   * @param {...any} args  Anything you would normally pass to console.log
   * @returns {void}
   */
  return (...args) => {
    console.log(`${color}[${label}]${COLORS.reset}`, ...args);
  };
}
