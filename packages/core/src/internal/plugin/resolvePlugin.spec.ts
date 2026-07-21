import { createBaseEditor } from '../../lib/editor';
import { createBasePlugin } from '../../lib/plugin';
import { defineInputRule } from '../../lib/plugins/input-rules';
import { DebugPlugin } from '../../lib/plugins/debug/DebugPlugin';
import { validatePlugin } from './resolvePlugin';

describe('resolvePlugin', () => {
  it('lets the last child-plugin extension win', () => {
    expect(
      createBaseEditor({
        plugins: [
          createBasePlugin({
            key: 'a',
            plugins: [
              createBasePlugin({
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
    const plugin = createBasePlugin({
      key: 'inputRulesPlugin',
    }).configure(config);
    const firstEditor = createBaseEditor({
      plugins: [plugin],
    });
    const secondEditor = createBaseEditor({
      plugins: [plugin],
    });

    expect(config.inputRules).toEqual([configuredRule]);
    expect(
      firstEditor.runtime.inputRules.plugins.inputRulesPlugin.rules
    ).toHaveLength(1);
    expect(
      secondEditor.runtime.inputRules.plugins.inputRulesPlugin.rules
    ).toHaveLength(1);
  });

  it('reports plugins that do not come from createBasePlugin', () => {
    const errorLogger = mock();
    const editor = createBaseEditor({
      plugins: [
        DebugPlugin.configure({
          options: {
            logger: { error: errorLogger } as any,
            throwErrors: false,
          },
        }),
      ],
    });
    const plugin = createBasePlugin({ key: 'broken' });

    delete (plugin as any).__extensions;

    validatePlugin(editor, plugin as any);

    expect(errorLogger).toHaveBeenCalledWith(
      "Invalid plugin 'broken', you should use createBasePlugin.",
      'USE_CREATE_PLUGIN',
      undefined
    );
  });

  it('reports plugins that claim to be both elements and leaves', () => {
    const errorLogger = mock();
    const editor = createBaseEditor({
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
      createBasePlugin({
        key: 'invalid',
        node: {
          element: {},
          mark: true,
        },
      }) as any
    );

    expect(errorLogger).toHaveBeenCalledWith(
      'Plugin invalid cannot declare both node.element and node.mark.',
      'PLUGIN_NODE_TYPE',
      undefined
    );
  });

  it('does not mutate the configured plugin between editor instances', () => {
    const configured = createBasePlugin({
      key: 'p',
      node: { element: { groups: ['block'] }, type: 'p' },
    }).configure({
      inputRules: [
        {
          apply: () => true,
          target: 'insertText',
          trigger: ' ',
        } as any,
      ],
    });

    const e1 = createBaseEditor({ plugins: [configured] });
    expect((e1.plugins.p as any).__configuredInputRules?.length).toBe(1);

    const e2 = createBaseEditor({ plugins: [configured] });
    expect((e2.plugins.p as any).__configuredInputRules?.length).toBe(1);
  });
});
