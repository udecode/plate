/**
 * Error handling utilities for consistent error processing
 * Ensures all caught errors are properly typed and handled
 */

/**
 * Type guard to check if a value is an Error object
 * @param error - The value to check
 * @returns True if the value is an Error instance
 */
export function isError(error: unknown): error is Error {
  return error instanceof Error;
}

/**
 * Converts unknown error to Error object
 * Ensures we always have a proper Error with message property
 * @param error - The error to normalize (can be anything)
 * @returns Normalized Error object
 */
export function toError(error: unknown): Error {
  if (isError(error)) {
    return error;
  }

  // Handle string errors
  if (typeof error === 'string') {
    return new Error(error);
  }

  // Handle objects with message property
  if (error && typeof error === 'object' && 'message' in error) {
    return new Error(String(error.message));
  }

  // Fallback for any other type
  return new Error(String(error));
}

/**
 * Wraps an error with additional context
 * Useful for adding file paths, operation names, etc.
 * @param error - The original error
 * @param context - Additional context to prepend to error message
 * @returns New Error with combined message and original stack
 */
export function wrapError(error: unknown, context: string): Error {
  const originalError = toError(error);
  const wrappedError = new Error(`${context}: ${originalError.message}`);

  // Preserve original stack trace if available
  if (originalError.stack) {
    wrappedError.stack = `${wrappedError.message}\nCaused by: ${originalError.stack}`;
  }

  return wrappedError;
}

/**
 * Safe error message extraction
 * Returns error message or generic fallback
 * @param error - The error to extract message from
 * @param fallback - Fallback message if extraction fails
 * @returns Error message string
 */
export function getErrorMessage(error: unknown, fallback = 'Unknown error occurred'): string {
  if (isError(error)) {
    return error.message;
  }

  if (typeof error === 'string') {
    return error;
  }

  if (error && typeof error === 'object' && 'message' in error) {
    return String(error.message);
  }

  return fallback;
}
