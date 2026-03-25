import { createSlateEditor } from '../../lib/editor';
import { createSlatePlugin } from '../../lib/plugin';
import { DebugPlugin } from '../../lib/plugins/debug/DebugPlugin';
import { validatePlugin } from './resolvePlugin';

describe('resolvePlugin', () => {
  it('lets the last child-plugin extension win', () => {
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

  it('reports plugins that do not come from createSlatePlugin', () => {
    const errorLogger = mock();
    const editor = createSlateEditor({
      plugins: [
        DebugPlugin.configure({
          options: {
            logger: { error: errorLogger } as any,
            throwErrors: false,
          },
        }),
      ],
    });
    const plugin = createSlatePlugin({ key: 'broken' });

    delete (plugin as any).__extensions;

    validatePlugin(editor, plugin as any);

    expect(errorLogger).toHaveBeenCalledWith(
      "Invalid plugin 'broken', you should use createSlatePlugin.",
      'USE_CREATE_PLUGIN',
      undefined
    );
  });

  it('reports plugins that claim to be both elements and leaves', () => {
    const errorLogger = mock();
    const editor = createSlateEditor({
      plugins: [
        DebugPlugin.configure({
          options: {
            logger: { error: errorLogger } as any,
            throwErrors: false,
          },
        }),
      ],
    });

    validatePlugin(
      editor,
      createSlatePlugin({
        key: 'invalid',
        node: {
          isElement: true,
          isLeaf: true,
        },
      }) as any
    );

    expect(errorLogger).toHaveBeenCalledWith(
      'Plugin invalid cannot be both an element and a leaf.',
      'PLUGIN_NODE_TYPE',
      undefined
    );
  });
});
