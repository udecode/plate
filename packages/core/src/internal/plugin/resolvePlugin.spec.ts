import { createBasePlateEditor } from '../../lib/editor';
import { createEditorPlugin } from '../../lib/plugin';
import { defineInputRule } from '../../lib/plugins/input-rules';
import { DebugPlugin } from '../../lib/plugins/debug/DebugPlugin';
import { validatePlugin } from './resolvePlugin';

describe('resolvePlugin', () => {
  it('lets the last child-plugin extension win', () => {
    expect(
      createBasePlateEditor({
        plugins: [
          createEditorPlugin({
            key: 'a',
            plugins: [
              createEditorPlugin({
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

  it('does not mutate configured inputRules reused across editors', () => {
    const configuredRule = defineInputRule({
      apply: () => true,
      target: 'insertText',
      trigger: '*',
    });
    const config = {
      inputRules: [configuredRule],
    };
    const plugin = createEditorPlugin({
      key: 'inputRulesPlugin',
    }).configure(config);
    const firstEditor = createBasePlateEditor({
      plugins: [plugin],
    });
    const secondEditor = createBasePlateEditor({
      plugins: [plugin],
    });

    expect(config.inputRules).toEqual([configuredRule]);
    expect(
      firstEditor.meta.inputRules.plugins.inputRulesPlugin.rules
    ).toHaveLength(1);
    expect(
      secondEditor.meta.inputRules.plugins.inputRulesPlugin.rules
    ).toHaveLength(1);
  });

  it('reports plugins that do not come from createEditorPlugin', () => {
    const errorLogger = mock();
    const editor = createBasePlateEditor({
      plugins: [
        DebugPlugin.configure({
          options: {
            logger: { error: errorLogger } as any,
            throwErrors: false,
          },
        }),
      ],
    });
    const plugin = createEditorPlugin({ key: 'broken' });

    delete (plugin as any).__extensions;

    validatePlugin(editor, plugin as any);

    expect(errorLogger).toHaveBeenCalledWith(
      "Invalid plugin 'broken', you should use createEditorPlugin.",
      'USE_CREATE_PLUGIN',
      undefined
    );
  });

  it('reports plugins that claim to be both elements and leaves', () => {
    const errorLogger = mock();
    const editor = createBasePlateEditor({
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
      createEditorPlugin({
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

  it('does not mutate the configured plugin between editor instances', () => {
    const configured = createEditorPlugin({ key: 'p' }).configure({
      inputRules: [
        {
          apply: () => true,
          target: 'insertText',
          trigger: ' ',
        } as any,
      ],
    });

    const e1 = createBasePlateEditor({ plugins: [configured] });
    expect((e1.plugins.p as any).__configuredInputRules?.length).toBe(1);

    const e2 = createBasePlateEditor({ plugins: [configured] });
    expect((e2.plugins.p as any).__configuredInputRules?.length).toBe(1);
  });
});
