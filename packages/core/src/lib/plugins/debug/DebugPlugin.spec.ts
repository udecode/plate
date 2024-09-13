/* eslint-disable jest/no-conditional-expect */
import { createPlateEditor } from '../../../react';
import { createSlatePlugin } from '../../plugin';
import { DebugPlugin, PlateError } from './DebugPlugin';

describe('DebugPlugin', () => {
  it('should create an editor with combined plugin APIs', () => {
    const mockLogger = jest.fn();
    const editor = createPlateEditor({
      plugins: [
        DebugPlugin.configure({
          options: {
            logLevel: 'log',
            logger: {
              log: mockLogger,
            } as any,
          },
        }),
        createSlatePlugin({
          key: 'sample',
          api: {
            sampleMethod: () => {},
          },
        }),
      ],
    });

    expect(editor.api.debug).toBeDefined();
    expect(typeof editor.api.debug.log).toBe('function');
    expect(typeof editor.api.debug.error).toBe('function');
    expect(typeof editor.api.debug.info).toBe('function');
    expect(typeof editor.api.debug.warn).toBe('function');
    expect(typeof editor.api.sampleMethod).toBe('function');

    editor.api.debug.log('Test message', 'TEST');

    expect(mockLogger).toHaveBeenCalledWith('Test message', 'TEST', undefined);
  });

  it('should respect log levels', () => {
    const warnLogger = jest.fn();
    const logLogger = jest.fn();
    const infoLogger = jest.fn();
    const editor = createPlateEditor({
      plugins: [
        DebugPlugin.configure({
          options: {
            logLevel: 'info',
            logger: {
              info: infoLogger,
              log: logLogger,
              warn: warnLogger,
            },
          },
        }),
      ],
    });

    editor.api.debug.log('Log message', 'TEST');
    editor.api.debug.info('Info message', 'TEST');
    editor.api.debug.warn('Warn message', 'TEST');

    expect(infoLogger).toHaveBeenCalledTimes(1);
    expect(warnLogger).toHaveBeenCalledTimes(1);
    expect(logLogger).toHaveBeenCalledTimes(0);
  });

  it('should throw errors when throwErrors is true', () => {
    const editor = createPlateEditor({
      plugins: [DebugPlugin],
    });

    expect(() => {
      editor.api.debug.error('Test error', 'TEST_ERROR');
    }).toThrow(PlateError);

    try {
      editor.api.debug.error('Test error', 'TEST_ERROR', { foo: 'bar' });
    } catch (error) {
      expect(error).toBeInstanceOf(PlateError);
      expect((error as PlateError).message).toBe('[TEST_ERROR] Test error');
      expect((error as PlateError).type).toBe('TEST_ERROR');
    }
  });

  it('should not throw errors when throwErrors is false', () => {
    const editor = createPlateEditor({
      plugins: [
        DebugPlugin.configure({
          options: {
            throwErrors: false,
          },
        }),
      ],
    });

    expect(() => {
      editor.api.debug.error('Test error', 'TEST_ERROR');
    }).not.toThrow();
  });

  it('should not log in production mode', () => {
    const mockLogger = jest.fn();
    const editor = createPlateEditor({
      plugins: [
        DebugPlugin.configure({
          options: {
            isProduction: true,
            logLevel: 'log',
            logger: {
              log: mockLogger,
            } as any,
          },
        }),
      ],
    });

    editor.api.debug.log('This should not be logged', 'TEST');

    expect(mockLogger).not.toHaveBeenCalled();
  });
});
