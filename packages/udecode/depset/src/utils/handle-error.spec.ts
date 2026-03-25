import { afterEach, beforeEach, describe, expect, it, mock } from 'bun:test';

import { ZodError } from 'zod';

import { highlighter, logger } from './logger';
import { handleError } from './handle-error';

describe('handleError', () => {
  const originalExit = process.exit;
  const originalBreak = logger.break;
  const originalError = logger.error;
  let breakMock: ReturnType<typeof mock>;
  let errorMock: ReturnType<typeof mock>;
  let exitMock: ReturnType<typeof mock>;

  beforeEach(() => {
    breakMock = mock(() => {});
    errorMock = mock(() => {});
    logger.break = breakMock as typeof logger.break;
    logger.error = errorMock as typeof logger.error;
    exitMock = mock(() => undefined as never);
    process.exit = exitMock as unknown as typeof process.exit;
  });

  afterEach(() => {
    logger.break = originalBreak;
    logger.error = originalError;
    process.exit = originalExit;
  });

  it('prints the generic header and string errors before exiting', () => {
    handleError('bad input');

    expect(errorMock).toHaveBeenNthCalledWith(
      1,
      'Something went wrong. Please check the error below for more details.'
    );
    expect(errorMock).toHaveBeenNthCalledWith(2, 'bad input');
    expect(breakMock).toHaveBeenCalledTimes(1);
    expect(exitMock).toHaveBeenCalledWith(1);
  });

  it('formats zod field errors with highlighted field names', () => {
    const error = new ZodError([
      {
        code: 'custom',
        message: 'Required',
        path: ['name'],
      },
      {
        code: 'custom',
        message: 'Too short',
        path: ['name'],
      },
    ]);

    handleError(error);

    expect(errorMock).toHaveBeenNthCalledWith(2, 'Validation failed:');
    expect(errorMock).toHaveBeenNthCalledWith(
      3,
      `- ${highlighter.info('name')}: Required, Too short`
    );
    expect(exitMock).toHaveBeenCalledWith(1);
  });

  it('prints error.message for Error instances', () => {
    handleError(new Error('boom'));

    expect(errorMock).toHaveBeenNthCalledWith(2, 'boom');
    expect(exitMock).toHaveBeenCalledWith(1);
  });
});
