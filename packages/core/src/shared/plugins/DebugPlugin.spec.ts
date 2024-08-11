import { createPlateEditor } from '../../client';
import { createPlugin } from '../utils/createPlugin';
import { getPlugin } from '../utils/getPlugin';
import { DebugPlugin } from './DebugPlugin';

describe('DebugPlugin', () => {
  it('should create an editor with combined plugin APIs MyEditor', () => {
    let a = 1;

    const fn = jest.fn();

    // Create the editor with our plugins
    const editor = createPlateEditor({
      plugins: [
        DebugPlugin,
        createPlugin({
          api: {
            sampleMethod: () => {
              a = 2;
            },
          },
          key: 'sample',
        }),
      ],
      rootPlugin: (plugin) =>
        plugin.configurePlugin(DebugPlugin.key, { logger: fn }),
    });

    expect(editor.api).toBeDefined();
    expect(typeof editor.api.debug.log).toBe('function');
    expect(typeof editor.api.debug.error).toBe('function');
    expect(typeof editor.api.debug.info).toBe('function');
    expect(typeof editor.api.debug.warn).toBe('function');

    // Test SamplePlugin API
    expect(typeof editor.api.sampleMethod).toBe('function');

    // Ensure type safety
    editor.api.debug.log({
      message: 'Test message',
      type: 'TEST',
    });

    editor.api.sampleMethod();

    expect(a).toBe(2);
  });

  it('should create a PlateEditor with DebugPlugin', () => {
    const logger = jest.fn();
    const editor = createPlateEditor({
      plugins: [
        DebugPlugin.configure({
          logger,
        }),
      ],
    });

    expect(getPlugin(editor, DebugPlugin).options.logger).toBe(logger);
    expect(editor.api).toBeDefined();

    editor.api.debug.log({
      message: 'Test message',
      type: 'TEST',
    });

    expect(logger).toHaveBeenCalledWith({
      level: 'log',
      message: 'Test message',
      type: 'TEST',
    });
  });
});
