// @ts-check

/**
 * Create special debug logger for SuperValidator and validators.
 * @param {boolean} debug
 * @param {string[]} [additionalPrefixes]
 * @returns {import('../types.js').ValidatorLogger}
 */
export function createLogger(debug, additionalPrefixes = []) {
  const basePrefix = '[SuperValidator]';
  const style = 'color: teal; font-weight: bold;';

  const allPrefixes = [basePrefix, ...additionalPrefixes.map((p) => `[${p}]`)];
  const format = allPrefixes.map(() => '%c%s').join(' ');
  const styledPrefixes = allPrefixes.map((p) => [style, p]).flat();

  return {
    debug: (...args) => {
      if (!debug) return;
      console.debug(format, ...styledPrefixes, ...args);
    },

    withPrefix: (prefix) => createLogger(debug, [...additionalPrefixes, prefix]),
  };
}
