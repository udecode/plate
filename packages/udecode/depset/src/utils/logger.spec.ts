import {
  afterEach,
  beforeEach,
  describe,
  expect,
  it,
  mock,
  type Mock,
} from 'bun:test';

import { highlighter, logger } from './logger';

describe('logger', () => {
  const originalLog = console.log;
  let logMock: Mock<(...args: unknown[]) => void>;

  beforeEach(() => {
    logMock = mock((..._args: unknown[]) => {});
    console.log = logMock;
  });

  afterEach(() => {
    console.log = originalLog;
  });

  it('prints plain joined output for log and a blank line for break', () => {
    logger.log('a', 1, 'b');
    logger.break();

    expect(logMock).toHaveBeenNthCalledWith(1, 'a 1 b');
    expect(logMock).toHaveBeenNthCalledWith(2, '');
  });

  it('formats colorized levels through the shared highlighter', () => {
    logger.info('hello', 'world');
    logger.success('done');
    logger.warn('careful');
    logger.error('boom');

    expect(logMock).toHaveBeenNthCalledWith(1, highlighter.info('hello world'));
    expect(logMock).toHaveBeenNthCalledWith(2, highlighter.success('done'));
    expect(logMock).toHaveBeenNthCalledWith(3, highlighter.warn('careful'));
    expect(logMock).toHaveBeenNthCalledWith(4, highlighter.error('boom'));
  });
});
