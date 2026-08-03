import { property, schema, target } from '@platejs/plite';

import { createBaseEditor } from '../../lib/editor';
import { defineBasePlugin } from '../../lib/plugin';
import { definePlatePlugin, toPlatePlugin } from '../../react/plugin';
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
    const TargetPlugin = defineBasePlugin('configuredReferenceTarget', {});
    const ConfiguredTargetPlugin = TargetPlugin.configure({
      enabled: true,
    });

    const editor = createBaseEditor({ plugins: [ConfiguredTargetPlugin] });

    expect(editor.plugin(ConfiguredTargetPlugin).name).toBe(
      'configuredReferenceTarget'
    );
    expect(isNominalPluginReference(ConfiguredTargetPlugin)).toBe(true);
  });

  it('keeps every public factory and method result nominal', () => {
    const BasePlugin = defineBasePlugin('baseReference', {
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
    const PlatePlugin = toPlatePlugin(BasePlugin);
    const plateOutputs: NominalPluginOutput[] = [
      definePlatePlugin('plateReference', {
        initialState: { nested: { value: 1 } },
      }),
      PlatePlugin,
      toPlatePlugin(BasePlugin, { editOnly: true }),
      toPlatePlugin(BasePlugin, () => ({ enabled: true })),
      PlatePlugin.configure({ initialState: { nested: { value: 3 } } }),
      PlatePlugin.extend({ editOnly: true }),
      PlatePlugin.extend(() => ({ enabled: true })),
      PlatePlugin.extend(() => ({
        api: () => ({ nominalPluginApi: () => true }),
      })),
      PlatePlugin.extend(() => ({
        selectors: { nominalSelector: () => true },
      })),
      PlatePlugin.extend(() => ({ update: () => ({ nominalTx: () => true }) })),
      toPlatePlugin(BasePlugin, { component: () => null }),
    ];

    [...baseOutputs, ...plateOutputs].forEach(expectReusableReference);
  });

  it('accepts genuine state references and rejects spread-forged identities', () => {
    const TargetPlugin = defineBasePlugin('referenceTarget', {
      schema: {
        element: {
          content: schema.content.text({ default: 'text', min: 1 }),
        },
      },
    });
    const OwnerPlugin = defineBasePlugin('referenceOwner', {
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
      createBaseEditor({ plugins: [TargetPlugin, OwnerPlugin] })
    ).not.toThrow();

    const forgedReference = { ...TargetPlugin };
    const ForgedOwnerPlugin = defineBasePlugin('forgedReferenceOwner', {
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
      createBaseEditor({ plugins: [TargetPlugin, ForgedOwnerPlugin] })
    ).toThrow('references an invalid plugin descriptor');
  });
});
