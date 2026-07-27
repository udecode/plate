import type { BaseEditor } from '../../lib/editor';
import type {
  AnyPluginConfig,
  AnyPluginTx,
  PluginConfig,
} from '../../lib/plugin/PluginConfig';
import type {
  PlatePluginReadState,
  PlatePluginTransaction,
} from '../../lib/editor/pluginRuntimeTypes';
import type {
  AnyBasePlugin,
  BasePlugin,
  BasePluginContext,
  PlateEditorExtensionInput,
  PlatePluginReadExtension,
  PlatePluginTxExtension,
} from '../../lib/plugin/BasePlugin';

import { normalizePlateEditorExtensions } from '../../lib/plugin/createBasePlugin';
import { getEditorPlugin } from '../../lib/plugin/getEditorPlugin';
import { pluginCodecMapDeclaration } from '../../lib/plugin/pluginAuthoringContext';
import { DebugPlugin } from '../../lib/plugins/debug/DebugPlugin';
import {
  isNominalPluginDescriptor,
  mergePlugins,
  registerHtmlCodecSchemaFamilies,
} from '../utils/mergePlugins';
import { snapshotApiValue } from '../utils/snapshotApiValue';
import { withResolvingPlatePlugin } from './compilePlateModel';

const assertConfiguredInputRules = (config: unknown) => {
  if (
    config === undefined ||
    typeof config === 'function' ||
    Array.isArray(config)
  ) {
    return;
  }

  throw new Error(
    'inputRules config must be an array of explicit rule instances or a factory.'
  );
};

/**
 * Resolves and finalizes a plugin configuration for use in a Plate editor.
 *
 * This function processes a given plugin configuration and applies its
 * extensions. It prepares the plugin for integration into the Plate editor
 * system by:
 *
 * 1. Cloning the plugin to avoid mutating the original
 * 2. Resolving the stored consumer configuration once
 * 3. Applying extensions against the configured values
 * 4. Reapplying the captured consumer values as the final override
 *
 * @example
 *   const plugin = createBasePlugin({ key: 'myPlugin', ...otherOptions });
 *   const resolvedPlugin = resolvePlugin(editor, plugin);
 */
export type ResolvedPluginConfiguration = Readonly<
  Record<PropertyKey, unknown>
>;

const finalizeResolvedPlugin = <P extends AnyBasePlugin>(
  editor: BaseEditor,
  plugin: P
): P => {
  (plugin as { targetPluginKeys: readonly string[] }).targetPluginKeys =
    Object.freeze([...plugin.targetPluginKeys]);

  (validatePlugin as any)(editor, plugin);

  return plugin;
};

type UnifiedExtensionResult = Record<PropertyKey, unknown> & {
  api?: object;
  codecs?: Readonly<Record<string, object>>;
  extension?: PlateEditorExtensionInput;
  read?: (context: { state: PlatePluginReadState<AnyPluginConfig> }) => object;
  selectors?: object;
  update?: (context: {
    context: import('@platejs/plite').EditorUpdateContext;
    tx: PlatePluginTransaction<AnyPluginConfig>;
  }) => object;
};

const snapshotStaticExtensionApis = (
  input: PlateEditorExtensionInput
): PlateEditorExtensionInput => {
  const extensions = Array.isArray(input) ? input : [input];

  return extensions.map((extension) => {
    if (
      !extension.api ||
      typeof extension.api === 'function' ||
      Array.isArray(extension.api)
    ) {
      return extension;
    }

    return {
      ...extension,
      api: snapshotApiValue(extension.api),
    };
  });
};

const applyUnifiedExtension = <P extends AnyBasePlugin>(
  plugin: P,
  extension: UnifiedExtensionResult,
  pluginContext: BasePluginContext<AnyPluginConfig>
): P => {
  const {
    api,
    codecs,
    extension: editorExtension,
    read,
    selectors,
    update,
    ...configuration
  } = extension;
  const extended = mergePlugins(
    plugin,
    selectors === undefined ? configuration : { ...configuration, selectors }
  );

  if (codecs !== undefined) {
    if (!codecs || typeof codecs !== 'object' || Array.isArray(codecs)) {
      throw new Error('Plate plugin `codecs` must be a MIME-keyed object.');
    }
    if (
      (codecs as Record<PropertyKey, unknown>)[pluginCodecMapDeclaration] !==
      true
    ) {
      throw new Error(
        `Plate plugin "${plugin.key}" codecs must be declared with the context-bound \`defineCodecs(...)\` helper.`
      );
    }

    const { 'text/html': htmlCodec, ...productCodecs } = codecs;

    if (Object.keys(productCodecs).length > 0) {
      extended.__codecExtensions = [
        ...extended.__codecExtensions,
        () => productCodecs,
      ];
    }
    if (htmlCodec !== undefined) {
      const htmlCodecs = Array.isArray(htmlCodec) ? htmlCodec : [htmlCodec];

      if (htmlCodecs.length === 0) {
        throw new Error(
          'Plate plugin `codecs["text/html"]` tuples must be non-empty.'
        );
      }

      for (const declaration of htmlCodecs) {
        if (
          !declaration ||
          typeof declaration !== 'object' ||
          Array.isArray(declaration)
        ) {
          throw new Error(
            'Plate plugin `codecs["text/html"]` must contain codec declarations.'
          );
        }

        const { target, ...rule } = declaration as Record<PropertyKey, unknown>;
        const targetPlugin = target ?? extended;

        if (!isNominalPluginDescriptor(targetPlugin)) {
          throw new Error(
            'Plate plugin HTML codec `target` must be a plugin descriptor.'
          );
        }
        if (target !== undefined && targetPlugin.key === extended.key) {
          throw new Error(
            'Plate plugin HTML codec `target` must be a different plugin descriptor.'
          );
        }

        const storedExtension = registerHtmlCodecSchemaFamilies(
          () => rule,
          extended,
          targetPlugin
        );

        extended.__htmlCodecExtensions = [
          ...extended.__htmlCodecExtensions,
          Object.freeze({
            extension: storedExtension,
            targetKey: target === undefined ? null : targetPlugin.key,
          }),
        ];
      }
    }
  }
  if (api !== undefined) {
    extended.__apiExtensions = [
      ...extended.__apiExtensions,
      { extension: () => api, isPluginSpecific: true },
    ];
  }
  if (typeof read === 'function') {
    const readExtension: PlatePluginReadExtension = () => ({
      [extended.key]: (state) =>
        read(
          Object.assign(Object.create(pluginContext), {
            state,
          })
        ),
    });

    extended.__readExtensions = [...extended.__readExtensions, readExtension];
  }
  if (typeof update === 'function') {
    const txExtension: PlatePluginTxExtension = () => ({
      [extended.key]: (tx, _editor, context) =>
        update(
          Object.assign(Object.create(pluginContext), {
            context,
            tx,
          })
        ),
    });

    txExtension.__plateOwnTxGroup = true;
    extended.__txExtensions = [...extended.__txExtensions, txExtension];
  }
  if (editorExtension !== undefined) {
    const snapshottedExtensions = snapshotStaticExtensionApis(editorExtension);

    extended.__editorExtensions = [
      ...extended.__editorExtensions,
      () => normalizePlateEditorExtensions(extended.key, snapshottedExtensions),
    ];
  }

  return extended;
};

/** Reapply captured terminal configuration without executing callbacks again. */
export const reapplyResolvedPluginConfigurations = <P extends AnyBasePlugin>(
  editor: BaseEditor,
  plugin: P,
  configurations: readonly ResolvedPluginConfiguration[]
): P => {
  const configurationLayers = [...plugin.__configurationLayers];
  let configured = plugin;

  for (const configuration of configurations) {
    configured = mergePlugins(configured, configuration);
    configured.__configurationLayers = configurationLayers;
  }

  return finalizeResolvedPlugin(editor, configured);
};

export const resolvePluginWithConfigurations = <P extends AnyBasePlugin>(
  editor: BaseEditor,
  _plugin: P
): Readonly<{
  configurations: readonly ResolvedPluginConfiguration[];
  plugin: P;
}> => {
  // Create a deep clone of the plugin
  let plugin = mergePlugins({}, _plugin) as P;

  plugin.__resolved = true;

  // A direct descriptor contributes at most one terminal consumer
  // configuration. Capture every result so contextual callbacks execute only
  // once per editor.
  const configurationLayers = [...plugin.__configurationLayers];
  const resolvedConfigurations: ResolvedPluginConfiguration[] = [];

  for (const layer of configurationLayers) {
    const rawConfigResult =
      layer.kind === 'context'
        ? withResolvingPlatePlugin(editor, plugin, () =>
            layer.value(getEditorPlugin(editor, plugin))
          )
        : layer.value;
    // Copy before merging: descriptor snapshots and callback results can be
    // reused across editor instances.
    const configResult = {
      ...rawConfigResult,
    } as Record<PropertyKey, unknown>;

    if (Object.hasOwn(configResult, 'inputRules')) {
      assertConfiguredInputRules(configResult.inputRules);
    }

    plugin = mergePlugins(plugin, configResult);
    plugin.__configurationLayers = configurationLayers;
    resolvedConfigurations.push(configResult);
  }
  // Apply all stored extensions
  if (plugin.__extensions && plugin.__extensions.length > 0) {
    const extensions = [...plugin.__extensions];

    for (const extension of extensions) {
      plugin = withResolvingPlatePlugin(editor, plugin, () => {
        const pluginContext = getEditorPlugin(editor, plugin);

        return applyUnifiedExtension(
          plugin,
          extension(pluginContext),
          pluginContext
        );
      });
    }
    plugin.__extensions = extensions;
  }
  // Extensions read configured values, but the consumer configuration remains
  // the final override for fields that both layers define.
  plugin = reapplyResolvedPluginConfigurations(
    editor,
    plugin,
    resolvedConfigurations
  );

  return Object.freeze({
    configurations: Object.freeze(resolvedConfigurations),
    plugin,
  });
};

export const resolvePlugin = <P extends AnyBasePlugin>(
  editor: BaseEditor,
  plugin: P
): P => resolvePluginWithConfigurations(editor, plugin).plugin;

export const validatePlugin = <
  K extends string = any,
  StoreState = {},
  A = {},
  Tx extends AnyPluginTx = {},
  S = {},
>(
  editor: BaseEditor,
  plugin: BasePlugin<PluginConfig<K, StoreState, A, Tx, S>>
) => {
  if (!plugin.__extensions) {
    getEditorPlugin(editor, DebugPlugin).api.error(
      `Invalid plugin '${plugin.key}', you should use createBasePlugin.`,
      'USE_CREATE_PLUGIN'
    );
  }
};
