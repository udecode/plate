import { createBaseEditor } from '../../lib/editor';
import { defineBasePlugin } from '../../lib/plugin';
import { DebugPlugin } from '../../lib/plugins/debug/DebugPlugin';
import { defineInputRule } from '../../lib/plugins/input-rules';
import { BaseParagraphPlugin } from '../../lib/plugins/paragraph';
import { getPluginDescriptorMetadata } from '../utils/mergePlugins';
import { getPlateRuntime } from './compilePlateModel';
import { validatePlugin } from './resolvePlugin';

describe('resolvePlugin', () => {
  it('exposes consumer configuration to extensions and keeps it final', () => {
    const seen: string[] = [];
    const plugin = defineBasePlugin('orderedConfiguration', {
      initialState: { label: 'base', mode: 'base' },
    })
      .extend(({ plugin }) => {
        seen.push(plugin.initialState.label);

        return { initialState: { label: 'extension' } };
      })
      .configure({
        initialState: {
          label: 'consumer',
          mode: 'consumer',
        },
      });
    const editor = createBaseEditor({ plugins: [plugin] });

    expect(seen).toEqual(['consumer']);
    expect(editor.plugin(plugin).initialState).toEqual({
      label: 'consumer',
      mode: 'consumer',
    });
    expect(
      getPluginDescriptorMetadata(plugin).configurationLayers
    ).toHaveLength(1);
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
    const plugin = defineBasePlugin('inputRulesPlugin', {}).configure(config);
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
    const plugin = defineBasePlugin('configuredInputRulesFinal', {
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
    const plugin = defineBasePlugin('configuredInputRulesFactory', {
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

  it('reports plugins that do not come from defineBasePlugin', () => {
    const errorLogger = mock();
    const editor = createBaseEditor({
      plugins: [
        DebugPlugin.configure({
          initialState: {
            logger: { error: errorLogger } as any,
            throwErrors: false,
          },
        }),
      ],
    });
    validatePlugin(editor, { name: 'broken' });

    expect(errorLogger).toHaveBeenCalledWith(
      "Invalid plugin 'broken', use defineBasePlugin.",
      'USE_CREATE_PLUGIN',
      undefined
    );
  });

  it('does not mutate the configured plugin between editor instances', () => {
    const configured = BaseParagraphPlugin.configure({
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
    expect(getPlateRuntime(e1).inputRules.plugins.paragraph.rules).toHaveLength(
      1
    );

    const e2 = createBaseEditor({
      plugins: [configured],
    });
    expect(getPlateRuntime(e2).inputRules.plugins.paragraph.rules).toHaveLength(
      1
    );
  });
});
