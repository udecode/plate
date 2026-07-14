import {
  afterEach,
  beforeEach,
  describe,
  expect,
  it,
  mock,
  type Mock,
} from 'bun:test';

import { ZodError } from 'zod';

import { highlighter, logger } from './logger';
import { handleError } from './handle-error';

describe('handleError', () => {
  const exitError = new Error('process.exit');
  const originalExit = process.exit;
  const originalBreak = logger.break;
  const originalError = logger.error;
  let breakMock: Mock<typeof logger.break>;
  let errorMock: Mock<typeof logger.error>;
  let exitMock: Mock<typeof process.exit>;

  beforeEach(() => {
    breakMock = mock(() => {});
    errorMock = mock((..._args: unknown[]) => {});
    logger.break = breakMock;
    logger.error = errorMock;
    exitMock = mock((_code?: string | number | null): never => {
      throw exitError;
    });
    process.exit = exitMock;
  });

  afterEach(() => {
    logger.break = originalBreak;
    logger.error = originalError;
    process.exit = originalExit;
  });

  it('prints the generic header and string errors before exiting', () => {
    expect(() => handleError('bad input')).toThrow(exitError);

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

    expect(() => handleError(error)).toThrow(exitError);

    expect(errorMock).toHaveBeenNthCalledWith(2, 'Validation failed:');
    expect(errorMock).toHaveBeenNthCalledWith(
      3,
      `- ${highlighter.info('name')}: Required, Too short`
    );
    expect(exitMock).toHaveBeenCalledWith(1);
  });

  it('prints error.message for Error instances', () => {
    expect(() => handleError(new Error('boom'))).toThrow(exitError);

    expect(errorMock).toHaveBeenNthCalledWith(2, 'boom');
    expect(exitMock).toHaveBeenCalledWith(1);
  });
});
