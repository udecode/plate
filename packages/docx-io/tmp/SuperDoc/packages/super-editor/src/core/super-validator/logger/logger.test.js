import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { createLogger } from './logger.js';

describe('createLogger', () => {
  let consoleDebugSpy;

  beforeEach(() => {
    consoleDebugSpy = vi.spyOn(console, 'debug').mockImplementation(() => {});
  });

  afterEach(() => {
    consoleDebugSpy.mockRestore();
  });

  it('does not log when debug is false', () => {
    const logger = createLogger(false);
    logger.debug('should not log');
    expect(consoleDebugSpy).not.toHaveBeenCalled();
  });

  it('logs with correct format and styles when debug is true', () => {
    const logger = createLogger(true);
    logger.debug('hello', 'world');

    expect(consoleDebugSpy).toHaveBeenCalledTimes(1);

    const [format, ...rest] = consoleDebugSpy.mock.calls[0];
    expect(format).toBe('%c%s');

    const [style, prefix, ...args] = rest;
    expect(style).toBe('color: teal; font-weight: bold;');
    expect(prefix).toBe('[SuperValidator]');
    expect(args).toEqual(['hello', 'world']);
  });

  it('adds additional prefix correctly', () => {
    const logger = createLogger(true, ['MyValidator']);
    logger.debug('test');

    expect(consoleDebugSpy).toHaveBeenCalledTimes(1);

    const [format, ...rest] = consoleDebugSpy.mock.calls[0];
    expect(format).toBe('%c%s %c%s');

    const [style1, prefix1, style2, prefix2, ...args] = rest;
    expect(style1).toBe('color: teal; font-weight: bold;');
    expect(prefix1).toBe('[SuperValidator]');
    expect(style2).toBe('color: teal; font-weight: bold;');
    expect(prefix2).toBe('[MyValidator]');
    expect(args).toEqual(['test']);
  });

  it('allows chaining withPrefix to add more prefixes', () => {
    const logger = createLogger(true).withPrefix('ValidatorA').withPrefix('Nested');
    logger.debug('deep');

    expect(consoleDebugSpy).toHaveBeenCalledTimes(1);

    const [format, ...rest] = consoleDebugSpy.mock.calls[0];
    expect(format).toBe('%c%s %c%s %c%s');

    const styled = rest.slice(0, 6);
    const expectedPrefixes = ['[SuperValidator]', '[ValidatorA]', '[Nested]'];
    for (let i = 0; i < styled.length; i += 2) {
      expect(styled[i]).toBe('color: teal; font-weight: bold;');
      expect(styled[i + 1]).toBe(expectedPrefixes[i / 2]);
    }

    expect(rest.slice(6)).toEqual(['deep']);
  });

  it('stringifies non-string prefixes', () => {
    const logger = createLogger(true, [123, null, undefined]);
    logger.debug('mixed');

    const [format, ...rest] = consoleDebugSpy.mock.calls[0];
    expect(format).toBe('%c%s %c%s %c%s %c%s');
    expect(rest).toContain('[123]');
    expect(rest).toContain('[null]');
    expect(rest).toContain('[undefined]');
  });

  it('works with no additionalPrefixes provided', () => {
    const logger = createLogger(true);
    logger.debug('only base');

    const [format, ...rest] = consoleDebugSpy.mock.calls[0];
    expect(format).toBe('%c%s');
    expect(rest).toContain('[SuperValidator]');
  });

  it('handles empty debug call gracefully', () => {
    const logger = createLogger(true);
    logger.debug();

    const [format, ...rest] = consoleDebugSpy.mock.calls[0];
    expect(format).toBe('%c%s');
    expect(rest).toEqual(['color: teal; font-weight: bold;', '[SuperValidator]']);
  });

  it('does not log from chained logger if debug is false', () => {
    const logger = createLogger(false).withPrefix('Sub');
    logger.debug('should not log');
    expect(consoleDebugSpy).not.toHaveBeenCalled();
  });
});
