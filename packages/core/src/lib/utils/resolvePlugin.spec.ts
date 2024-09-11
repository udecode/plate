import { createSlateEditor } from '../editor';
import { createSlatePlugin } from '../plugin';

describe('resolvePlugin', () => {
  it('should be', () => {
    expect(
      createSlateEditor({
        plugins: [
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
            ),
        ],
      }).plugins.aa.node.type
    ).toBe('ac');
  });

  it('should create a deep clone of the plugin instead of options', () => {
    const originalPlugin = createSlatePlugin({
      key: 'test',
      options: {
        nestedObject: {
          value: 'original',
        },
      },
    });

    const editor = createSlateEditor({
      plugins: [originalPlugin],
    }) as any;

    const resolvedPlugin = editor.plugins.test;

    // Modify the resolved plugin
    resolvedPlugin.options.nestedObject.value = 'modified';

    // Check that the original plugin is not affected
    expect(originalPlugin.options.nestedObject.value).toBe('modified');
    expect(resolvedPlugin.options.nestedObject.value).toBe('modified');

    // Ensure that the resolved plugin still has all the methods
    expect(typeof resolvedPlugin.extend).toBe('function');

    // Create a new instance from the resolved plugin and modify it
    const newInstance = originalPlugin.extend({
      options: {
        nestedObject: {
          value: 'new instance',
        },
      },
    });

    const editor2 = createSlateEditor({
      plugins: [newInstance],
    }) as any;

    // Check that neither the original nor the first resolved plugin are affected
    expect(originalPlugin.options.nestedObject.value).toBe('modified');
    expect(editor2.plugins.test.options.nestedObject.value).toBe(
      'new instance'
    );
    expect(editor.plugins.test.options.nestedObject.value).toBe('modified');
    expect(editor2.plugins.test.options.nestedObject.value).toBe(
      'new instance'
    );
  });
});
