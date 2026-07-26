import { schema } from '@platejs/plite';

import { createBaseEditor } from '../../lib/editor';
import { createBasePlugin } from '../../lib/plugin';
import { defineInputRule } from '../../lib/plugins/input-rules';
import { DebugPlugin } from '../../lib/plugins/debug/DebugPlugin';
import { validatePlugin } from './resolvePlugin';
import { getPlateRuntime } from './compilePlateModel';

describe('resolvePlugin', () => {
  it('exposes consumer configuration to extensions and keeps it final', () => {
    const seen: string[] = [];
    const plugin = createBasePlugin({
      key: 'orderedConfiguration',
      options: { label: 'base', mode: 'base' },
    })
      .extend(({ plugin }) => {
        seen.push(plugin.options.label);

        return { options: { label: 'extension' } };
      })
      .configure({
        options: {
          label: 'consumer',
          mode: 'consumer',
        },
      });
    const editor = createBaseEditor({ plugins: [plugin] });

    expect(seen).toEqual(['consumer']);
    expect(editor.getPlugin(plugin).options).toEqual({
      label: 'consumer',
      mode: 'consumer',
    });
    expect(plugin.__configurationLayers).toHaveLength(1);
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
      getPlateRuntime(firstEditor).inputRules.plugins.inputRulesPlugin.rules
    ).toHaveLength(1);
    expect(
      getPlateRuntime(secondEditor).inputRules.plugins.inputRulesPlugin.rules
    ).toHaveLength(1);
  });

  it('keeps terminal inputRules configuration final over extensions', () => {
    const extensionRule = defineInputRule({
      apply: () => true,
      target: 'insertText',
      trigger: 'extension',
    });
    const plugin = createBasePlugin({
      key: 'configuredInputRulesFinal',
      inputRules: [
        defineInputRule({
          apply: () => true,
          target: 'insertText',
          trigger: 'base',
        }),
      ],
    })
      .extend(() => ({
        inputRules: [extensionRule],
      }))
      .configure({
        inputRules: [],
      });
    const editor = createBaseEditor({ plugins: [plugin] });

    expect(
      getPlateRuntime(editor).inputRules.plugins.configuredInputRulesFinal.rules
    ).toEqual([]);
  });

  it('accepts an inputRules factory in terminal object configuration', () => {
    const configuredRule = defineInputRule({
      apply: () => true,
      target: 'insertText',
      trigger: 'configured',
    });
    const plugin = createBasePlugin({
      key: 'configuredInputRulesFactory',
      inputRules: [
        defineInputRule({
          apply: () => true,
          target: 'insertText',
          trigger: 'base',
        }),
      ],
    }).configure({
      inputRules: () => [configuredRule],
    });
    const editor = createBaseEditor({ plugins: [plugin] });
    const rules =
      getPlateRuntime(editor).inputRules.plugins.configuredInputRulesFactory
        .rules;

    expect(rules).toHaveLength(1);
    expect(rules[0]?.target).toBe('insertText');
    if (rules[0]?.target !== 'insertText') {
      throw new Error('Expected an insertText input rule.');
    }
    expect(rules[0].trigger).toBe('configured');
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
    expect(getPlateRuntime(e1).inputRules.plugins.p.rules).toHaveLength(1);

    const e2 = createBaseEditor({
      plugins: [configured],
    });
    expect(getPlateRuntime(e2).inputRules.plugins.p.rules).toHaveLength(1);
  });
});
