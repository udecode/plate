/* eslint-disable no-console */
import chalk from 'chalk';

/**
 * This is a simple logging utility, which wraps console.log and
 * prefixes messages with colored severity levels.
 * This can be used throughout the project to log informative, warning, error,
 * and success messages in a consistent way.
 */
export const logger = {
  error(...args: unknown[]) {
    console.log(chalk.red(...args));
  },
  warn(...args: unknown[]) {
    console.log(chalk.yellow(...args));
  },
  info(...args: unknown[]) {
    console.log(chalk.cyan(...args));
  },
  success(...args: unknown[]) {
    console.log(chalk.green(...args));
  },
  break() {
    console.log('');
  },
};
