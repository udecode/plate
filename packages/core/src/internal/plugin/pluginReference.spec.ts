import { property, schema, target } from '@platejs/plite';

import { createBaseEditor } from '../../lib/editor';
import { createBasePlugin } from '../../lib/plugin';
import { createPlatePlugin, toPlatePlugin } from '../../react/plugin';
import {
  freezePluginConfiguration,
  isNominalPluginDescriptor,
  isNominalPluginReference,
  isNominalPluginReferenceSnapshot,
} from '../utils/mergePlugins';

type NominalPluginOutput = Readonly<{
  config: unknown;
  key: string;
  plugins: readonly NominalPluginOutput[];
  type: string;
}>;

const expectReusableReference = (plugin: NominalPluginOutput) => {
  expect(isNominalPluginDescriptor(plugin)).toBe(true);
  expect(Object.isFrozen(plugin.config)).toBe(true);

  const first = freezePluginConfiguration({ target: plugin });
  const second = freezePluginConfiguration({ target: first.target });

  expect(first.target).toEqual({ key: plugin.key, type: plugin.type });
  expect(Reflect.ownKeys(first.target)).toEqual(['key', 'type']);
  expect(Object.isFrozen(first.target)).toBe(true);
  expect(isNominalPluginReferenceSnapshot(first.target)).toBe(true);
  expect(isNominalPluginReference(first.target)).toBe(true);
  expect(second.target).toBe(first.target);
};

const expectNominalPluginTree = (plugin: NominalPluginOutput) => {
  expectReusableReference(plugin);
  plugin.plugins.forEach(expectNominalPluginTree);
};

describe('plugin references', () => {
  it('captures configured document type identity', () => {
    const TargetPlugin = createBasePlugin({
      key: 'configuredReferenceTarget',
      type: 'base-reference-type',
    });
    const ConfiguredTargetPlugin = TargetPlugin.configure({
      type: 'configured-reference-type',
    });
    const snapshot = freezePluginConfiguration({
      target: ConfiguredTargetPlugin,
    });

    expect(ConfiguredTargetPlugin.type).toBe('configured-reference-type');
    expect(snapshot.target).toEqual({
      key: 'configuredReferenceTarget',
      type: 'configured-reference-type',
    });
  });

  it('keeps every public factory and method result nominal', () => {
    const BasePlugin = createBasePlugin({
      config: { nested: { value: 1 } },
      key: 'baseReference',
    });
    const baseOutputs: NominalPluginOutput[] = [
      BasePlugin,
      BasePlugin.clone(),
      BasePlugin.configure({ config: { nested: { value: 2 } } }),
      BasePlugin.extend({ priority: 101 }),
      BasePlugin.extend(() => ({ priority: 102 })),
      BasePlugin.extendEditorApi(() => ({ nominalEditorApi: () => true })),
      BasePlugin.extendApi(() => ({ nominalPluginApi: () => true })),
      BasePlugin.extendSelectors(() => ({ nominalSelector: () => true })),
      BasePlugin.extendTx(() => () => ({ nominalTx: () => true })),
      BasePlugin.extendTxGroup('nominalGroup', () => () => ({
        nominalTx: () => true,
      })),
      BasePlugin.extendExtension({
        api: { nominalExtension: { read: () => true } },
      }),
      BasePlugin.withComponent(() => null),
    ];
    const PlatePlugin = toPlatePlugin(BasePlugin);
    const plateOutputs: NominalPluginOutput[] = [
      createPlatePlugin({
        config: { nested: { value: 1 } },
        key: 'plateReference',
      }),
      PlatePlugin,
      toPlatePlugin(BasePlugin, { priority: 105 }),
      toPlatePlugin(BasePlugin, () => ({ priority: 106 })),
      PlatePlugin.clone(),
      PlatePlugin.configure({ config: { nested: { value: 3 } } }),
      PlatePlugin.extend({ priority: 103 }),
      PlatePlugin.extend(() => ({ priority: 104 })),
      PlatePlugin.extendEditorApi(() => ({ nominalEditorApi: () => true })),
      PlatePlugin.extendApi(() => ({ nominalPluginApi: () => true })),
      PlatePlugin.extendSelectors(() => ({ nominalSelector: () => true })),
      PlatePlugin.extendTx(() => () => ({ nominalTx: () => true })),
      PlatePlugin.extendTxGroup('nominalGroup', () => () => ({
        nominalTx: () => true,
      })),
      PlatePlugin.extendExtension({
        api: { nominalExtension: { read: () => true } },
      }),
      PlatePlugin.withComponent(() => null),
    ];

    [...baseOutputs, ...plateOutputs].forEach(expectReusableReference);
  });

  it('keeps deep configure, extend, and editor publication trees nominal', () => {
    const GrandchildPlugin = createBasePlugin({
      key: 'referenceGrandchild',
      options: { value: 1 },
    });
    const ChildPlugin = createBasePlugin({
      key: 'referenceChild',
      plugins: [GrandchildPlugin],
    });
    const ParentPlugin = createBasePlugin({
      key: 'referenceParent',
      plugins: [ChildPlugin],
    });
    const trees = [
      ParentPlugin.configurePlugin(GrandchildPlugin, {
        options: { value: 2 },
      }),
      ParentPlugin.extendPlugin(GrandchildPlugin, {
        options: { value: 3 },
      }),
      toPlatePlugin(ParentPlugin).configurePlugin(GrandchildPlugin, {
        options: { value: 4 },
      }),
      toPlatePlugin(ParentPlugin).extendPlugin(GrandchildPlugin, {
        options: { value: 5 },
      }),
      createBasePlugin({ key: 'addedReferenceParent' }).extendPlugin(
        GrandchildPlugin,
        { options: { value: 6 } }
      ),
      createPlatePlugin({ key: 'addedPlateReferenceParent' }).extendPlugin(
        GrandchildPlugin,
        { options: { value: 7 } }
      ),
    ];

    trees.forEach(expectNominalPluginTree);

    const editor = createBaseEditor({
      plugins: [trees[0]],
    });

    expectNominalPluginTree(editor.getPlugin(ParentPlugin));
    expectReusableReference(editor.getPlugin(GrandchildPlugin));
    expectReusableReference(editor.plugin(ParentPlugin).plugin);
  });

  it('reuses genuine snapshots and rejects spread-forged identities', () => {
    const TargetPlugin = createBasePlugin({
      key: 'referenceTarget',
      schema: {
        element: {
          content: schema.content.text({ default: 'text', min: 1 }),
        },
      },
      type: 'reference-target',
    });
    const FirstOwnerPlugin = createBasePlugin({
      config: { target: TargetPlugin },
      key: 'firstReferenceOwner',
    });
    const ReusedOwnerPlugin = createBasePlugin({
      config: { target: FirstOwnerPlugin.config.target },
      key: 'reusedReferenceOwner',
      schema: ({ config, own, plugins }) => ({
        properties: [
          own.elementProperty(property.string(), {
            target: target.type(plugins.elementType(config.target)),
          }),
        ],
      }),
      type: 'reused-reference-owner',
    });

    expect(ReusedOwnerPlugin.config.target).toBe(
      FirstOwnerPlugin.config.target
    );
    expect(() =>
      createBaseEditor({
        plugins: [TargetPlugin, ReusedOwnerPlugin],
      })
    ).not.toThrow();

    const forgedSnapshot = { ...FirstOwnerPlugin.config.target };
    const ForgedOwnerPlugin = createBasePlugin({
      config: { target: forgedSnapshot },
      key: 'forgedReferenceOwner',
      schema: ({ config, own, plugins }) => ({
        properties: [
          own.elementProperty(property.string(), {
            target: target.type(plugins.elementType(config.target)),
          }),
        ],
      }),
      type: 'forged-reference-owner',
    });

    expect(isNominalPluginReference(forgedSnapshot)).toBe(false);
    expect(() =>
      createBaseEditor({
        plugins: [TargetPlugin, ForgedOwnerPlugin],
      })
    ).toThrow('references an invalid plugin descriptor');
    expect(() =>
      createBasePlugin({
        config: { target: { ...TargetPlugin } },
        key: 'spreadReferenceOwner',
      })
    ).toThrow('Move functions and runtime resources to options');
  });
});
