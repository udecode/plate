import { createSlateEditor } from '../../editor';
import { createSlatePlugin } from '../../plugin';
import { DebugPlugin, PlateError } from './DebugPlugin';

describe('DebugPlugin', () => {
  afterEach(() => {
    mock.restore();
  });

  it('create an editor with combined plugin APIs', () => {
    const mockLogger = mock();
    const editor = createSlateEditor({
      plugins: [
        DebugPlugin.configure({
          options: {
            logger: {
              log: mockLogger,
            } as any,
            logLevel: 'log',
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

  it('respect log levels', () => {
    const warnLogger = mock();
    const logLogger = mock();
    const infoLogger = mock();
    const editor = createSlateEditor({
      plugins: [
        DebugPlugin.configure({
          options: {
            logger: {
              info: infoLogger,
              log: logLogger,
              warn: warnLogger,
            },
            logLevel: 'info',
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

  it('throw errors when throwErrors is true', () => {
    const editor = createSlateEditor({
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

  it('does not throw errors when throwErrors is false', () => {
    const errorLogger = mock();

    const editor = createSlateEditor({
      plugins: [
        DebugPlugin.configure({
          options: {
            logger: {
              error: errorLogger,
            },
            throwErrors: false,
          },
        }),
      ],
    });

    expect(() => {
      editor.api.debug.error('Test error', 'TEST_ERROR');
    }).not.toThrow();
    expect(errorLogger).toHaveBeenCalledWith(
      'Test error',
      'TEST_ERROR',
      undefined
    );
  });

  it('does not log in production mode', () => {
    const mockLogger = mock();
    const editor = createSlateEditor({
      plugins: [
        DebugPlugin.configure({
          options: {
            isProduction: true,
            logger: {
              log: mockLogger,
            } as any,
            logLevel: 'log',
          },
        }),
      ],
    });

    editor.api.debug.log('This should not be logged', 'TEST');

    expect(mockLogger).not.toHaveBeenCalled();
  });

  it('uses the default console logger surface when throwErrors is disabled', () => {
    const errorSpy = spyOn(console, 'error').mockImplementation(() => {});
    const infoSpy = spyOn(console, 'info').mockImplementation(() => {});
    const logSpy = spyOn(console, 'log').mockImplementation(() => {});
    const warnSpy = spyOn(console, 'warn').mockImplementation(() => {});
    const editor = createSlateEditor({
      plugins: [
        DebugPlugin.configure({
          options: {
            logLevel: 'log',
            throwErrors: false,
          },
        }),
      ],
    });

    editor.api.debug.error('error', 'ERR');
    editor.api.debug.info('info', 'INFO');
    editor.api.debug.log('log', 'LOG');
    editor.api.debug.warn('warn', 'WARN');

    expect(errorSpy).toHaveBeenCalledWith('[ERR] error', undefined);
    expect(infoSpy).toHaveBeenCalledWith('[INFO] info', undefined);
    expect(logSpy).toHaveBeenCalledWith('[LOG] log', undefined);
    expect(warnSpy).toHaveBeenCalledWith('[WARN] warn', undefined);
  });
});
