import { schema } from '@platejs/plite';

import { createBaseEditor } from '../../lib/editor';
import { createBasePlugin } from '../../lib/plugin';
import { defineInputRule } from '../../lib/plugins/input-rules';
import { DebugPlugin } from '../../lib/plugins/debug/DebugPlugin';
import { validatePlugin } from './resolvePlugin';

describe('resolvePlugin', () => {
  it('lets the last child-plugin extension win', () => {
    const child = createBasePlugin({
      key: 'aa',
      options: { value: 'base' },
    });

    expect(
      createBaseEditor({
        plugins: [
          createBasePlugin({
            key: 'a',
            plugins: [child],
          })
            .extendPlugin(child, { options: { value: 'first' } })
            .extendPlugin(child, { options: { value: 'last' } }),
        ],
      }).plugins.aa.options.value
    ).toBe('last');
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

  it('does not mutate the configured plugin between editor instances', () => {
    const configured = createBasePlugin({
      key: 'p',
      type: 'p',
      schema: {
        element: { content: schema.content.open({ default: 'text', min: 1 }) },
      },
    }).configure({
      inputRules: [
        {
          apply: () => true,
          target: 'insertText',
          trigger: ' ',
        } as any,
      ],
    });

    const e1 = createBaseEditor({
      plugins: [configured],
    });
    expect(e1.runtime.inputRules.plugins.p.rules).toHaveLength(1);

    const e2 = createBaseEditor({
      plugins: [configured],
    });
    expect(e2.runtime.inputRules.plugins.p.rules).toHaveLength(1);
  });
});
