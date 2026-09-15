import { createEditor } from '../../lib/editor';
import { definePlugin } from '../../lib/plugin';
import { DebugPlugin } from '../../lib/plugins/debug/DebugPlugin';
import { defineInputRule } from '../../lib/plugins/input-rules';
import { BaseParagraphPlugin } from '../../lib/plugins/paragraph';
import { getPluginDescriptorMetadata } from '../utils/mergePlugins';
import { getPlateRuntime } from './compilePlateModel';
import { validatePlugin } from './resolvePlugin';

describe('resolvePlugin', () => {
  it('exposes consumer configuration to stages and keeps it final', () => {
    const seen: string[] = [];
    const plugin = definePlugin('orderedConfiguration', {
      initialState: { label: 'base', mode: 'base' },
    })
      .extend(({ plugin: innerPlugin }) => {
        seen.push(innerPlugin.initialState.label);

        return { initialState: { label: 'stage' } };
      })
      .configure({
        initialState: {
          label: 'consumer',
          mode: 'consumer',
        },
      });
    const editor = createEditor({ plugins: [plugin] });

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
    const plugin = definePlugin('inputRulesPlugin', {}).configure(config);
    const firstEditor = createEditor({
      plugins: [plugin],
    });
    const secondEditor = createEditor({
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

  it('keeps terminal inputRules configuration final over stages', () => {
    const stageRule = defineInputRule({
      apply: () => true,
      target: 'insertText',
      trigger: 'stage',
    });
    const plugin = definePlugin('configuredInputRulesFinal', {
      inputRules: [
        defineInputRule({
          apply: () => true,
          target: 'insertText',
          trigger: 'base',
        }),
      ],
    })
      .extend(() => ({
        inputRules: [stageRule],
      }))
      .configure({
        inputRules: [],
      });
    const editor = createEditor({ plugins: [plugin] });

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
    const plugin = definePlugin('configuredInputRulesFactory', {
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
    const editor = createEditor({ plugins: [plugin] });
    const { rules } =
      getPlateRuntime(editor).inputRules.plugins.configuredInputRulesFactory;

    expect(rules).toHaveLength(1);
    expect(rules[0]?.target).toBe('insertText');
    if (rules[0]?.target !== 'insertText') {
      throw new Error('Expected an insertText input rule.');
    }
    expect(rules[0].trigger).toBe('configured');
  });

  it('reports plugins that do not come from definePlugin', () => {
    const errorLogger = mock();
    const editor = createEditor({
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
      "Invalid plugin 'broken', use definePlugin.",
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

    const e1 = createEditor({
      plugins: [configured],
    });
    expect(getPlateRuntime(e1).inputRules.plugins.paragraph.rules).toHaveLength(
      1
    );

    const e2 = createEditor({
      plugins: [configured],
    });
    expect(getPlateRuntime(e2).inputRules.plugins.paragraph.rules).toHaveLength(
      1
    );
  });
});
