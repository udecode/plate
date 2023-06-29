/* eslint-disable unicorn/no-process-exit */
import { logger } from './logger';

/**
 * This module exports a function for handling errors in a standardized way
 * across the project. It logs the error message and then terminates the process
 * with a non-zero exit code.
 */
export function handleError(error: unknown) {
  if (typeof error === 'string') {
    logger.error(error);
    process.exit(1);
  }

  if (error instanceof Error) {
    logger.error(error.message);
    process.exit(1);
  }

  logger.error('Something went wrong. Please try again.');
  process.exit(1);
}
