import { createSlateEditor } from '../editor';
import { createSlatePlugin } from '../plugin';
import { resolvePlugin } from './resolvePlugin';

describe('resolvePlugin', () => {
  it('should be', () => {
    expect(
      resolvePlugin(
        createSlateEditor() as any,
        createSlatePlugin({
          key: 'a',
          plugins: [
            createSlatePlugin({
              key: 'aa',
            }),
          ],
        })
          .extendPlugin(
            { key: 'aa' },
            {
              node: { type: 'ab' },
            }
          )
          .extendPlugin(
            { key: 'aa' },
            {
              node: { type: 'ac' },
            }
          )
      ).plugins[0].node.type
    ).toBe('ac');
  });

  it('should create a deep clone of the plugin', () => {
    const editor = createSlateEditor() as any;
    const originalPlugin = createSlatePlugin({
      key: 'test',
      options: {
        nestedObject: {
          value: 'original',
        },
      },
    });

    const resolvedPlugin = resolvePlugin(editor, originalPlugin);

    // Modify the resolved plugin
    resolvedPlugin.options.nestedObject.value = 'modified';

    // Check that the original plugin is not affected
    expect(originalPlugin.options.nestedObject.value).toBe('original');
    expect(resolvedPlugin.options.nestedObject.value).toBe('modified');

    // Ensure that the resolved plugin still has all the methods
    expect(typeof resolvedPlugin.extend).toBe('function');

    // Create a new instance from the resolved plugin and modify it
    const newInstance = originalPlugin.extend({});
    newInstance.options.nestedObject.value = 'new instance';

    // Check that neither the original nor the first resolved plugin are affected
    expect(originalPlugin.options.nestedObject.value).toBe('original');
    expect(resolvedPlugin.options.nestedObject.value).toBe('modified');
    expect(newInstance.options.nestedObject.value).toBe('new instance');
  });
});
