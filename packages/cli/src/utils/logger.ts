/* eslint-disable no-console */
import chalk from 'chalk';

/**
 * This is a simple logging utility, which wraps console.log and prefixes
 * messages with colored severity levels. This can be used throughout the
 * project to log informative, warning, error, and success messages in a
 * consistent way.
 */
export const logger = {
  break() {
    console.info('');
  },
  error(...args: unknown[]) {
    console.info(chalk.red(...args));
  },
  info(...args: unknown[]) {
    console.info(chalk.cyan(...args));
  },
  success(...args: unknown[]) {
    console.info(chalk.green(...args));
  },
  warn(...args: unknown[]) {
    console.info(chalk.yellow(...args));
  },
};
