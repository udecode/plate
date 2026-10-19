import { property, schema, target } from '../../core';
import { createEditor } from '../../lib/editor';
import { definePlugin as defineHeadlessPlugin } from '../../lib/plugin';
import { definePlugin, toReactPlugin } from '../../react/plugin';
import {
  isNominalPluginDescriptor,
  isNominalPluginReference,
} from '../utils/mergePlugins';

type NominalPluginOutput = Readonly<{
  name: string;
}>;

const expectReusableReference = (plugin: NominalPluginOutput) => {
  expect(isNominalPluginDescriptor(plugin)).toBe(true);
  expect(isNominalPluginReference(plugin)).toBe(true);
};

describe('plugin references', () => {
  it('preserves identity through terminal configuration', () => {
    const TargetPlugin = defineHeadlessPlugin('configuredReferenceTarget', {});
    const ConfiguredTargetPlugin = TargetPlugin.configure({
      enabled: true,
    });

    const editor = createEditor({ plugins: [ConfiguredTargetPlugin] });

    expect(editor.plugin(ConfiguredTargetPlugin).name).toBe(
      'configuredReferenceTarget'
    );
    expect(isNominalPluginReference(ConfiguredTargetPlugin)).toBe(true);
  });

  it('keeps every public factory and method result nominal', () => {
    const BasePlugin = defineHeadlessPlugin('baseReference', {
      initialState: { nested: { value: 1 } },
    });
    const baseOutputs: NominalPluginOutput[] = [
      BasePlugin,
      BasePlugin.configure({ initialState: { nested: { value: 2 } } }),
      BasePlugin.extend({ editOnly: true }),
      BasePlugin.extend(() => ({ enabled: true })),
      BasePlugin.extend(() => ({
        api: () => ({ nominalPluginApi: () => true }),
      })),
      BasePlugin.extend(() => ({ selectors: { nominalSelector: () => true } })),
      BasePlugin.extend(() => ({ update: () => ({ nominalTx: () => true }) })),
    ];
    const Plugin = toReactPlugin(BasePlugin);
    const plateOutputs: NominalPluginOutput[] = [
      definePlugin('plateReference', {
        initialState: { nested: { value: 1 } },
      }),
      Plugin,
      toReactPlugin(BasePlugin, { editOnly: true }),
      toReactPlugin(BasePlugin, () => ({ enabled: true })),
      Plugin.configure({ initialState: { nested: { value: 3 } } }),
      Plugin.extend({ editOnly: true }),
      Plugin.extend(() => ({ enabled: true })),
      Plugin.extend(() => ({
        api: () => ({ nominalPluginApi: () => true }),
      })),
      Plugin.extend(() => ({
        selectors: { nominalSelector: () => true },
      })),
      Plugin.extend(() => ({ update: () => ({ nominalTx: () => true }) })),
      toReactPlugin(BasePlugin, { component: () => null }),
    ];

    [...baseOutputs, ...plateOutputs].forEach(expectReusableReference);
  });

  it('accepts genuine state references and rejects spread-forged identities', () => {
    const TargetPlugin = defineHeadlessPlugin('referenceTarget', {
      schema: {
        element: {
          content: schema.content.text({ default: 'text', min: 1 }),
        },
      },
    });
    const OwnerPlugin = defineHeadlessPlugin('referenceOwner', {
      initialState: { target: TargetPlugin },
      schema: ({ initialState }) => ({
        properties: {
          referenceOwner: schema.elementProperty(property.string(), {
            target: target.element(initialState.target),
          }),
        },
      }),
    });

    expect(OwnerPlugin.initialState.target).toBe(TargetPlugin);
    expect(() =>
      createEditor({ plugins: [TargetPlugin, OwnerPlugin] })
    ).not.toThrow();

    const forgedReference = { ...TargetPlugin };
    const ForgedOwnerPlugin = defineHeadlessPlugin('forgedReferenceOwner', {
      initialState: { target: forgedReference },
      schema: ({ initialState }) => ({
        properties: {
          forgedReferenceOwner: schema.elementProperty(property.string(), {
            target: target.element(initialState.target),
          }),
        },
      }),
    });

    expect(isNominalPluginReference(forgedReference)).toBe(false);
    expect(() =>
      createEditor({ plugins: [TargetPlugin, ForgedOwnerPlugin] })
    ).toThrow('references an invalid plugin descriptor');
  });
});
