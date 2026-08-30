import type {
  EditorExtensionReference,
  EditorReadMethodTree,
} from '../../facade';
import { isEditorExtension } from '../../facade';
import type { Editor } from '../../lib/editor';
import type { AnyBasePlugin } from '../../lib/plugin/BasePlugin';
import { createPluginContext } from '../../lib/plugin/createPluginContext.internal';
import { pluginCodecMapDeclaration } from '../../lib/plugin/pluginAuthoringContext';
import { DebugPlugin } from '../../lib/plugins/debug/DebugPlugin';
import {
  getPluginDescriptorMetadata,
  isNominalPluginDescriptor,
  mergePlugins,
  registerHtmlCodecSchemaFamilies,
  setPluginDescriptorMetadata,
} from '../utils/mergePlugins';
import { snapshotApiValue } from '../utils/snapshotApiValue';
import { withResolvingPlatePlugin } from './compilePlateModel';

export type ResolvedPluginConfiguration = Readonly<
  Record<PropertyKey, unknown>
>;

type PluginContribution = Record<PropertyKey, unknown> & {
  api?: (context: object) => object;
  codecs?: Readonly<Record<PropertyKey, unknown>>;
  name?: string;
  on?: Readonly<Record<PropertyKey, unknown>>;
  read?: (context: object) => EditorReadMethodTree;
  update?: (context: object) => object;
};

type ResolvedPluginApiContribution =
  | Readonly<{
      factory: (context: object) => object;
      kind: 'native';
    }>
  | Readonly<{
      kind: 'plate';
      value: Readonly<Record<PropertyKey, unknown>>;
    }>;

export type ResolvedPluginCapabilityContribution = Readonly<{
  factory: (context: object) => unknown;
  kind: 'native' | 'plate';
}>;

type ResolvedPluginCapabilities = Readonly<{
  api: readonly ResolvedPluginApiContribution[];
  nativeSources: readonly EditorExtensionReference[];
  read: readonly ResolvedPluginCapabilityContribution[];
  update: readonly ResolvedPluginCapabilityContribution[];
}>;

const emptyResolvedPluginCapabilities: ResolvedPluginCapabilities =
  Object.freeze({
    api: Object.freeze([]),
    nativeSources: Object.freeze([]),
    read: Object.freeze([]),
    update: Object.freeze([]),
  });

const resolvedPluginCapabilities = new WeakMap<
  object,
  ResolvedPluginCapabilities
>();

export const getResolvedPluginCapabilities = (plugin: object) =>
  resolvedPluginCapabilities.get(plugin) ?? emptyResolvedPluginCapabilities;

export const inheritResolvedPluginCapabilities = <T extends object>(
  source: object,
  target: T
): T => {
  const capabilities = resolvedPluginCapabilities.get(source);

  if (capabilities) {
    resolvedPluginCapabilities.set(target, capabilities);
  }

  return target;
};

const isObjectRecord = (
  value: unknown
): value is Record<PropertyKey, unknown> =>
  typeof value === 'object' && value !== null && !Array.isArray(value);

const assertConfiguredInputRules = (value: unknown) => {
  if (
    value === undefined ||
    typeof value === 'function' ||
    Array.isArray(value)
  ) {
    return;
  }

  throw new Error(
    'inputRules must be an array of explicit rule instances or a factory.'
  );
};

const mergeLifecycleHandlers = (
  plugin: AnyBasePlugin,
  previous: unknown,
  contribution: Readonly<Record<PropertyKey, unknown>>
) => {
  const handlers: Record<PropertyKey, unknown> = isObjectRecord(previous)
    ? { ...previous }
    : {};

  for (const name of Reflect.ownKeys(contribution)) {
    const prior = handlers[name];
    const next = contribution[name];

    if (typeof prior === 'function' && typeof next === 'function') {
      handlers[name] = (...args: unknown[]) => {
        const result = Reflect.apply(prior, undefined, args);

        return result === true ? true : Reflect.apply(next, undefined, args);
      };
    } else if (
      next === null ||
      next === undefined ||
      typeof next === 'function'
    ) {
      handlers[name] = next;
    } else {
      throw new Error(
        `Plate plugin "${plugin.name}" on.${String(name)} must be a function or null.`
      );
    }
  }

  return handlers;
};

const mergeFactory =
  (
    previous: unknown,
    next: (context: object) => object,
    pluginContext: Readonly<{ plugin: Readonly<{ name: string }> }>
  ) =>
  (context: object) => {
    const prior =
      typeof previous === 'function'
        ? Reflect.apply(previous, undefined, [context])
        : {};
    const contribution = Reflect.apply(next, undefined, [
      Object.assign(Object.create(pluginContext), context),
    ]);

    if (!isObjectRecord(contribution)) {
      throw new Error(
        `Plate plugin "${pluginContext.plugin.name}" capability factories must return an object.`
      );
    }

    return mergePlugins(prior, contribution);
  };

const assertNativeTopology = (
  plugin: AnyBasePlugin,
  field: 'conflicts' | 'dependencies',
  contribution: unknown
) => {
  if (contribution === undefined) return;
  if (
    !Array.isArray(contribution) ||
    contribution.some(
      (reference) =>
        !reference ||
        typeof reference !== 'object' ||
        typeof Reflect.get(reference, 'name') !== 'string'
    )
  ) {
    throw new Error(
      `Plate plugin "${plugin.name}" adopted a native extension with invalid ${field}.`
    );
  }

  const declared = plugin[field];

  if (
    declared.length !== contribution.length ||
    declared.some(
      (reference, index) =>
        reference.name !== Reflect.get(contribution[index], 'name')
    )
  ) {
    throw new Error(
      `Plate plugin "${plugin.name}" must declare the same ${field} as its adopted native extension.`
    );
  }
};

const applyCodecs = (
  plugin: AnyBasePlugin,
  codecs: Readonly<Record<PropertyKey, unknown>>
) => {
  if (codecs[pluginCodecMapDeclaration] !== true) {
    throw new Error(
      `Plate plugin "${plugin.name}" codecs must be declared with the context-bound \`defineCodecs(...)\` helper.`
    );
  }

  const { 'text/html': htmlCodec, ...productCodecs } = codecs;
  let currentCodecs = Reflect.get(plugin, 'codecs');

  if (Reflect.ownKeys(productCodecs).length > 0) {
    if (isObjectRecord(currentCodecs)) {
      const currentFormats = new Map(
        Object.keys(currentCodecs).map((format) => [
          format.trim().toLowerCase(),
          format,
        ])
      );

      for (const format of Object.keys(productCodecs)) {
        const normalizedFormat = format.trim().toLowerCase();

        if (currentFormats.has(normalizedFormat)) {
          throw new Error(
            `Plate codec owner "${plugin.name}" must declare "${normalizedFormat}" once with decode and encode in the same object.`
          );
        }
      }
    }

    currentCodecs = mergePlugins(currentCodecs ?? {}, productCodecs);
    Reflect.set(plugin, 'codecs', currentCodecs);
  }
  if (htmlCodec === undefined) return;

  const htmlCodecs = Array.isArray(htmlCodec) ? htmlCodec : [htmlCodec];
  const currentHtmlHooks = isObjectRecord(currentCodecs)
    ? Reflect.get(currentCodecs, 'text/html')
    : undefined;
  const htmlHooks: Record<PropertyKey, unknown> = isObjectRecord(
    currentHtmlHooks
  )
    ? { ...currentHtmlHooks }
    : {};

  if (htmlCodecs.length === 0) {
    throw new Error(
      'Plate plugin `codecs["text/html"]` tuples must be non-empty.'
    );
  }

  for (const declaration of htmlCodecs) {
    if (!isObjectRecord(declaration)) {
      throw new Error(
        'Plate plugin `codecs["text/html"]` must contain codec declarations.'
      );
    }

    const { query, target, transformData, transformFragment, ...rule } =
      declaration;

    for (const [name, hook] of Object.entries({
      query,
      transformData,
      transformFragment,
    })) {
      if (hook === undefined) continue;
      if (typeof hook !== 'function') {
        throw new Error(
          `Plate plugin HTML codec hook "${name}" must be a function.`
        );
      }
      if (Reflect.has(htmlHooks, name)) {
        throw new Error(
          `Plate plugin "${plugin.name}" must declare HTML codec hook "${name}" once.`
        );
      }
      Reflect.set(htmlHooks, name, hook);
    }

    if (Reflect.ownKeys(rule).length === 0) {
      if (target !== undefined) {
        throw new Error(
          'Plate plugin HTML codec hooks cannot target another plugin.'
        );
      }
      continue;
    }
    const targetPlugin = target ?? plugin;

    if (!isNominalPluginDescriptor(targetPlugin)) {
      throw new Error(
        'Plate plugin HTML codec `target` must be a plugin descriptor.'
      );
    }
    if (target !== undefined && targetPlugin.name === plugin.name) {
      throw new Error(
        'Plate plugin HTML codec `target` must be a different plugin descriptor.'
      );
    }

    const contribution = registerHtmlCodecSchemaFamilies(
      () => rule,
      plugin,
      targetPlugin
    );

    const metadata = getPluginDescriptorMetadata(plugin);

    setPluginDescriptorMetadata(plugin, {
      ...metadata,
      htmlCodecContributions: [
        ...metadata.htmlCodecContributions,
        Object.freeze({
          extension: contribution,
          targetPlugin: target === undefined ? null : targetPlugin.name,
        }),
      ],
    });
  }

  if (Reflect.ownKeys(htmlHooks).length > 0) {
    Reflect.set(
      plugin,
      'codecs',
      mergePlugins(currentCodecs ?? {}, {
        'text/html': Object.freeze(htmlHooks),
      })
    );
  }
};

const applyStage = (
  plugin: AnyBasePlugin,
  contribution: PluginContribution,
  pluginContext: Readonly<{ plugin: Readonly<{ name: string }> }>
) => {
  const isRawPliteDescriptor = isEditorExtension(contribution);

  if (
    isRawPliteDescriptor &&
    contribution.name !== undefined &&
    contribution.name !== plugin.name
  ) {
    throw new Error(
      `Plate plugin "${plugin.name}" cannot adopt Plite extension "${contribution.name}". Their names must match.`
    );
  }

  const {
    api,
    codecs,
    conflicts,
    dependencies,
    name: _name,
    on,
    read,
    update,
    ...configuration
  } = contribution;
  if (isRawPliteDescriptor) {
    assertNativeTopology(plugin, 'conflicts', conflicts);
    assertNativeTopology(plugin, 'dependencies', dependencies);
  }
  const next = mergePlugins(
    plugin,
    isRawPliteDescriptor
      ? configuration
      : {
          ...configuration,
          ...(conflicts === undefined ? {} : { conflicts }),
          ...(dependencies === undefined ? {} : { dependencies }),
        }
  );
  const previousCapabilities = getResolvedPluginCapabilities(plugin);
  let apiContributions = previousCapabilities.api;
  let { nativeSources } = previousCapabilities;
  let readContributions = previousCapabilities.read;
  let updateContributions = previousCapabilities.update;

  if (isRawPliteDescriptor) {
    nativeSources = Object.freeze([...nativeSources, contribution]);
  }

  if (on !== undefined) {
    if (!isObjectRecord(on)) {
      throw new Error(`Plate plugin "${plugin.name}" on must be an object.`);
    }
    Reflect.set(
      next,
      'on',
      mergeLifecycleHandlers(plugin, Reflect.get(next, 'on'), on)
    );
  }
  if (api !== undefined) {
    if (typeof api !== 'function') {
      throw new Error(
        `Plate plugin "${plugin.name}" API must be a context factory.`
      );
    }
    if (isRawPliteDescriptor) {
      apiContributions = Object.freeze([
        ...apiContributions,
        Object.freeze({ factory: api, kind: 'native' as const }),
      ]);
    } else {
      const apiValue = Reflect.apply(api, undefined, [pluginContext]);

      if (!isObjectRecord(apiValue)) {
        throw new Error(
          `Plate plugin "${plugin.name}" API factories must return an object.`
        );
      }
      const snapshot = snapshotApiValue(apiValue);

      apiContributions = Object.freeze([
        ...apiContributions,
        Object.freeze({ kind: 'plate' as const, value: snapshot }),
      ]);
      Reflect.set(
        next,
        'api',
        snapshotApiValue(
          mergePlugins(
            isObjectRecord(Reflect.get(next, 'api'))
              ? Reflect.get(next, 'api')
              : {},
            snapshot
          )
        )
      );
    }
  }
  if (typeof read === 'function') {
    readContributions = Object.freeze([
      ...readContributions,
      Object.freeze({
        factory: read,
        kind: isRawPliteDescriptor ? ('native' as const) : ('plate' as const),
      }),
    ]);
    if (!isRawPliteDescriptor) {
      Reflect.set(
        next,
        'read',
        mergeFactory(Reflect.get(next, 'read'), read, pluginContext)
      );
    }
  }
  if (typeof update === 'function') {
    updateContributions = Object.freeze([
      ...updateContributions,
      Object.freeze({
        factory: update,
        kind: isRawPliteDescriptor ? ('native' as const) : ('plate' as const),
      }),
    ]);
    if (!isRawPliteDescriptor) {
      Reflect.set(
        next,
        'update',
        mergeFactory(Reflect.get(next, 'update'), update, pluginContext)
      );
    }
  }
  if (codecs !== undefined) {
    if (!isObjectRecord(codecs)) {
      throw new Error(
        `Plate plugin "${next.name}" codecs must be a MIME-keyed object.`
      );
    }
    applyCodecs(next, codecs);
  }

  if (
    apiContributions.length > 0 ||
    nativeSources.length > 0 ||
    readContributions.length > 0 ||
    updateContributions.length > 0
  ) {
    resolvedPluginCapabilities.set(
      next,
      Object.freeze({
        api: apiContributions,
        nativeSources,
        read: readContributions,
        update: updateContributions,
      })
    );
  }

  return next;
};

const finalizeResolvedPlugin = <P extends AnyBasePlugin>(
  editor: Editor,
  plugin: P
): P => {
  const { nodeProps } = plugin.inject;

  if (nodeProps?.nodeKey && nodeProps.styleKey === undefined) {
    plugin.inject = {
      ...plugin.inject,
      nodeProps: {
        ...nodeProps,
        styleKey: nodeProps.nodeKey,
      },
    };
  }
  (plugin as { targetPlugins: AnyBasePlugin['targetPlugins'] }).targetPlugins =
    Object.freeze([...plugin.targetPlugins]);
  validatePlugin(editor, plugin);

  return plugin;
};

/** Reapply captured terminal configuration without executing callbacks again. */
export const reapplyResolvedPluginConfigurations = <P extends AnyBasePlugin>(
  editor: Editor,
  plugin: P,
  configurations: readonly ResolvedPluginConfiguration[]
): P => {
  let configured = plugin;

  for (const configuration of configurations) {
    configured = inheritResolvedPluginCapabilities(
      configured,
      mergePlugins(configured, configuration)
    );
  }

  return finalizeResolvedPlugin(editor, configured);
};

export const resolvePluginWithConfigurations = <P extends AnyBasePlugin>(
  editor: Editor,
  descriptor: P
): Readonly<{
  configurations: readonly ResolvedPluginConfiguration[];
  plugin: P;
}> => {
  let plugin = mergePlugins({}, descriptor) as P;
  const descriptorMetadata = getPluginDescriptorMetadata(plugin);

  setPluginDescriptorMetadata(plugin, {
    ...descriptorMetadata,
    resolved: true,
  });

  const layers = [...descriptorMetadata.configurationLayers];
  const configurations: ResolvedPluginConfiguration[] = [];

  for (const layer of layers) {
    const value =
      layer.kind === 'context'
        ? withResolvingPlatePlugin(editor, plugin, () =>
            Reflect.apply(layer.value, undefined, [
              createPluginContext(editor, plugin),
            ])
          )
        : layer.value;

    if (!isObjectRecord(value)) {
      throw new Error(
        `Plate plugin "${plugin.name}" configuration must resolve to an object.`
      );
    }
    if (Object.hasOwn(value, 'inputRules')) {
      assertConfiguredInputRules(value.inputRules);
    }

    const snapshot = { ...value };

    plugin = mergePlugins(plugin, snapshot);
    configurations.push(snapshot);
  }

  const stages = [...getPluginDescriptorMetadata(plugin).stages];

  for (const stage of stages) {
    plugin = withResolvingPlatePlugin(editor, plugin, () => {
      const context = createPluginContext(editor, plugin);
      const contribution = Reflect.apply(stage, undefined, [context]);

      if (!isObjectRecord(contribution)) {
        throw new Error(
          `Plate plugin "${plugin.name}" stage must return an object.`
        );
      }

      return applyStage(plugin, contribution, context) as P;
    });
  }
  plugin = reapplyResolvedPluginConfigurations(editor, plugin, configurations);

  return Object.freeze({
    configurations: Object.freeze(configurations),
    plugin,
  });
};

export const resolvePlugin = <P extends AnyBasePlugin>(
  editor: Editor,
  plugin: P
): P => resolvePluginWithConfigurations(editor, plugin).plugin;

export const validatePlugin = (
  editor: Editor,
  plugin: Pick<AnyBasePlugin, 'name'>
) => {
  if (!isNominalPluginDescriptor(plugin)) {
    const api = createPluginContext(editor, DebugPlugin).api as {
      error: (message: string, code: string) => void;
    };

    api.error(
      `Invalid plugin '${(plugin as { name: string }).name}', use defineBasePlugin.`,
      'USE_CREATE_PLUGIN'
    );
  }
};
