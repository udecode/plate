import type { EditorUpdateContext } from '@platejs/plite';
import { defineEditorExtension } from '@platejs/plite';

import type { BasePlateEditor } from '../../lib/editor/BasePlateEditor';
import type { AnyPluginConfig } from '../../lib/plugin/BasePlugin';
import type {
  AnyEditorPlugin,
  EditorPluginContext,
  PlatePluginTxGroup,
} from '../../lib/plugin/EditorPlugin';

type PlateRuntimePluginContext = Omit<
  EditorPluginContext<AnyPluginConfig>,
  'tf'
>;
type PlateRuntimePluginInput = Parameters<BasePlateEditor['getOptions']>[0];

const plateTxExtensionCleanups = new WeakMap<object, () => void>();

const asPlateArg = <T>(value: unknown): T => value as T;

const asPluginInput = (plugin: AnyEditorPlugin): PlateRuntimePluginInput =>
  plugin as unknown as PlateRuntimePluginInput;

const createPlateRuntimePluginContext = (
  editor: BasePlateEditor,
  plugin: AnyEditorPlugin
): PlateRuntimePluginContext =>
  ({
    api: editor.api,
    editor,
    plugin,
    type: plugin.node?.type ?? plugin.key,
    getOption: ((key: PropertyKey, ...args: unknown[]) =>
      (editor.getOption as unknown as (...input: unknown[]) => unknown)(
        plugin,
        key,
        ...args
      )) as PlateRuntimePluginContext['getOption'],
    getOptions: () => editor.getOptions(asPluginInput(plugin)),
    setOption: (key: string | Record<string, unknown>, value?: unknown) => {
      const pluginInput = asPluginInput(plugin);

      if (typeof key === 'string') {
        editor.setOption(
          pluginInput,
          asPlateArg<Parameters<BasePlateEditor['setOption']>[1]>(key),
          asPlateArg<Parameters<BasePlateEditor['setOption']>[2]>(value)
        );
        return;
      }

      editor.setOptions(
        pluginInput,
        asPlateArg<Parameters<BasePlateEditor['setOptions']>[1]>(key)
      );
    },
    setOptions: (
      options:
        | ((state: Record<string, unknown>) => void)
        | Record<string, unknown>
    ) => {
      editor.setOptions(
        asPluginInput(plugin),
        asPlateArg<Parameters<BasePlateEditor['setOptions']>[1]>(options)
      );
    },
  }) as PlateRuntimePluginContext;

const collectPlateTxGroupFactories = (editor: BasePlateEditor) => {
  const txGroups = new Map<string, PlatePluginTxGroup[]>();
  const addGroup = (groupKey: string, groupFactory: unknown) => {
    if (!groupFactory) return;

    const list = txGroups.get(groupKey) ?? [];

    list.push(groupFactory as PlatePluginTxGroup);
    txGroups.set(groupKey, list);
  };

  editor.meta.pluginList.forEach((plugin: AnyEditorPlugin) => {
    plugin.__txExtensions.forEach((txExtension) => {
      Object.entries(
        txExtension(createPlateRuntimePluginContext(editor, plugin))
      ).forEach(([groupKey, groupFactory]) => {
        addGroup(groupKey, groupFactory);
      });
    });

    Object.entries(plugin.tx ?? {}).forEach(([groupKey, groupFactory]) => {
      addGroup(groupKey, groupFactory);
    });
  });

  return txGroups;
};

export const installPlateRuntimeTxExtensions = (editor: BasePlateEditor) => {
  plateTxExtensionCleanups.get(editor)?.();
  plateTxExtensionCleanups.delete(editor);

  const txGroups = collectPlateTxGroupFactories(editor);

  if (txGroups.size === 0) return;

  const tx = Object.create(null) as Record<string, PlatePluginTxGroup>;

  txGroups.forEach((groupFactories, groupKey) => {
    tx[groupKey] = (transaction, runtimeEditor, context) => {
      const group = Object.create(null) as Record<string, unknown>;

      groupFactories.forEach((groupFactory) => {
        Object.assign(
          group,
          groupFactory(
            transaction,
            runtimeEditor as BasePlateEditor,
            context as EditorUpdateContext<BasePlateEditor>
          )
        );
      });

      return group;
    };
  });

  const cleanup = editor.extend(
    defineEditorExtension({
      name: 'plate-plugin-tx',
      tx,
    })
  );

  plateTxExtensionCleanups.set(editor, cleanup);
};
