import { property, schema, target } from '@platejs/plite';

import { createBaseEditor } from '../../lib/editor';
import { createBasePlugin } from '../../lib/plugin';
import { createPlatePlugin, toPlatePlugin } from '../../react/plugin';
import {
  isNominalPluginDescriptor,
  isNominalPluginReference,
} from '../utils/mergePlugins';

type NominalPluginOutput = Readonly<{
  name: string;
  type: string;
}>;

const expectReusableReference = (plugin: NominalPluginOutput) => {
  expect(isNominalPluginDescriptor(plugin)).toBe(true);
  expect(isNominalPluginReference(plugin)).toBe(true);
};

describe('plugin references', () => {
  it('preserves document type identity through terminal configuration', () => {
    const TargetPlugin = createBasePlugin({
      name: 'configuredReferenceTarget',
      type: 'configured-reference-type',
    });
    const ConfiguredTargetPlugin = TargetPlugin.configure({
      enabled: true,
    });

    const editor = createBaseEditor({ plugins: [ConfiguredTargetPlugin] });

    expect(editor.plugin(ConfiguredTargetPlugin).plugin.type).toBe(
      'configured-reference-type'
    );
    expect(isNominalPluginReference(ConfiguredTargetPlugin)).toBe(true);
  });

  it('keeps every public factory and method result nominal', () => {
    const BasePlugin = createBasePlugin({
      name: 'baseReference',
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
      createPlatePlugin({
        name: 'plateReference',
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
    const TargetPlugin = createBasePlugin({
      name: 'referenceTarget',
      schema: {
        element: {
          content: schema.content.text({ default: 'text', min: 1 }),
        },
      },
      type: 'reference-target',
    });
    const OwnerPlugin = createBasePlugin({
      name: 'referenceOwner',
      initialState: { target: TargetPlugin },
      schema: ({ initialState, own, plugins }) => ({
        properties: [
          own.elementProperty(property.string(), {
            target: target.type(plugins.elementType(initialState.target)),
          }),
        ],
      }),
      type: 'reference-owner',
    });

    expect(OwnerPlugin.initialState.target).toBe(TargetPlugin);
    expect(() =>
      createBaseEditor({ plugins: [TargetPlugin, OwnerPlugin] })
    ).not.toThrow();

    const forgedReference = { ...TargetPlugin };
    const ForgedOwnerPlugin = createBasePlugin({
      name: 'forgedReferenceOwner',
      initialState: { target: forgedReference },
      schema: ({ initialState, own, plugins }) => ({
        properties: [
          own.elementProperty(property.string(), {
            target: target.type(plugins.elementType(initialState.target)),
          }),
        ],
      }),
      type: 'forged-reference-owner',
    });

    expect(isNominalPluginReference(forgedReference)).toBe(false);
    expect(() =>
      createBaseEditor({ plugins: [TargetPlugin, ForgedOwnerPlugin] })
    ).toThrow('references an invalid plugin descriptor');
  });
});
