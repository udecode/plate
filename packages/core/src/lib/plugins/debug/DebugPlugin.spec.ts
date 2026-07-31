import { createBaseEditor } from '../../editor';
import { createBasePlugin } from '../../plugin';
import { DebugPlugin, PlateError } from './DebugPlugin';

const SamplePlugin = createBasePlugin({
  api: () => ({
    sampleMethod: () => {},
  }),
  name: 'sample',
});

describe('DebugPlugin', () => {
  afterEach(() => {
    mock.restore();
  });

  it('create an editor with combined plugin APIs', () => {
    const mockLogger = mock();
    const editor = createBaseEditor({
      plugins: [
        DebugPlugin.configure({
          initialState: {
            logger: {
              log: mockLogger as any,
            },
            logLevel: 'log',
          },
        }),
        SamplePlugin,
      ],
    });

    expect(editor.plugin(DebugPlugin).api).toBeDefined();
    expect(typeof editor.plugin(DebugPlugin).api.log).toBe('function');
    expect(typeof editor.plugin(DebugPlugin).api.error).toBe('function');
    expect(typeof editor.plugin(DebugPlugin).api.info).toBe('function');
    expect(typeof editor.plugin(DebugPlugin).api.warn).toBe('function');
    expect(typeof editor.api.sample.sampleMethod).toBe('function');

    editor.plugin(DebugPlugin).api.log('Test message', 'TEST');

    expect(mockLogger).toHaveBeenCalledWith('Test message', 'TEST', undefined);
  });

  it('respect log levels', () => {
    const warnLogger = mock();
    const logLogger = mock();
    const infoLogger = mock();
    const editor = createBaseEditor({
      plugins: [
        DebugPlugin.configure({
          initialState: {
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

    editor.plugin(DebugPlugin).api.log('Log message', 'TEST');
    editor.plugin(DebugPlugin).api.info('Info message', 'TEST');
    editor.plugin(DebugPlugin).api.warn('Warn message', 'TEST');

    expect(infoLogger).toHaveBeenCalledTimes(1);
    expect(warnLogger).toHaveBeenCalledTimes(1);
    expect(logLogger).toHaveBeenCalledTimes(0);
  });

  it('throw errors when throwErrors is true', () => {
    const editor = createBaseEditor({
      plugins: [DebugPlugin],
    });

    expect(() => {
      editor.plugin(DebugPlugin).api.error('Test error', 'TEST_ERROR');
    }).toThrow(PlateError);

    try {
      editor
        .plugin(DebugPlugin)
        .api.error('Test error', 'TEST_ERROR', { foo: 'bar' });
    } catch (error) {
      expect(error).toBeInstanceOf(PlateError);
      if (!(error instanceof PlateError)) throw error;

      expect(error.message).toBe('[TEST_ERROR] Test error');
      expect(error.type).toBe('TEST_ERROR');
    }
  });

  it('does not throw errors when throwErrors is false', () => {
    const errorLogger = mock();

    const editor = createBaseEditor({
      plugins: [
        DebugPlugin.configure({
          initialState: {
            logger: {
              error: errorLogger,
            },
            throwErrors: false,
          },
        }),
      ],
    });

    expect(() => {
      editor.plugin(DebugPlugin).api.error('Test error', 'TEST_ERROR');
    }).not.toThrow();
    expect(errorLogger).toHaveBeenCalledWith(
      'Test error',
      'TEST_ERROR',
      undefined
    );
  });

  it('does not log in production mode', () => {
    const mockLogger = mock();
    const editor = createBaseEditor({
      plugins: [
        DebugPlugin.configure({
          initialState: {
            isProduction: true,
            logger: {
              log: mockLogger,
            },
            logLevel: 'log',
          },
        }),
      ],
    });

    editor.plugin(DebugPlugin).api.log('This should not be logged', 'TEST');

    expect(mockLogger).not.toHaveBeenCalled();
  });

  it('uses the default console logger surface when throwErrors is disabled', () => {
    const errorSpy = spyOn(console, 'error').mockImplementation(() => {});
    const infoSpy = spyOn(console, 'info').mockImplementation(() => {});
    const logSpy = spyOn(console, 'log').mockImplementation(() => {});
    const warnSpy = spyOn(console, 'warn').mockImplementation(() => {});
    const editor = createBaseEditor({
      plugins: [
        DebugPlugin.configure({
          initialState: {
            logLevel: 'log',
            throwErrors: false,
          },
        }),
      ],
    });

    editor.plugin(DebugPlugin).api.error('error', 'ERR');
    editor.plugin(DebugPlugin).api.info('info', 'INFO');
    editor.plugin(DebugPlugin).api.log('log', 'LOG');
    editor.plugin(DebugPlugin).api.warn('warn', 'WARN');

    expect(errorSpy).toHaveBeenCalledWith('[ERR] error', undefined);
    expect(infoSpy).toHaveBeenCalledWith('[INFO] info', undefined);
    expect(logSpy).toHaveBeenCalledWith('[LOG] log', undefined);
    expect(warnSpy).toHaveBeenCalledWith('[WARN] warn', undefined);
  });
});
