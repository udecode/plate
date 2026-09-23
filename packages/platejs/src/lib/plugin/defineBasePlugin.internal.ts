import { isFunction } from '../../internal/utils/isFunction';
import {
  brandPluginDescriptor,
  freezePluginDescriptorValue,
  getPluginDescriptorMetadata,
  isConfiguredPluginDescriptor,
  mergePlugins,
  setPluginDescriptorMetadata,
} from '../../internal/utils/mergePlugins';
import { assertNoPrepareDocument } from './assertNoPrepareDocument.internal';
import type { AnyBasePlugin, AnyBasePluginContext } from './BasePlugin';
import type { PluginReference } from './PluginDefinition';

const PLUGIN_NAME_PATTERN = /^[a-z][A-Za-z0-9]*$/;

type MutableBasePlugin = AnyBasePlugin & {
  targetPlugins: ReadonlyArray<PluginReference | string>;
};

type PluginRecord = Record<PropertyKey, unknown> & {
  name?: unknown;
};

const isObjectRecord = (value: unknown): value is PluginRecord =>
  typeof value === 'object' && value !== null;

const assertInputRules = (value: PluginRecord) => {
  if (
    Object.hasOwn(value, 'inputRules') &&
    value.inputRules !== undefined &&
    !Array.isArray(value.inputRules)
  ) {
    throw new Error('inputRules must be an array of explicit rule instances.');
  }
};

const assertBaseDefinition: (
  value: unknown
) => asserts value is PluginRecord = (value) => {
  if (!isObjectRecord(value)) {
    throw new Error('Plate plugin definitions must be objects.');
  }
  if (typeof value.name !== 'string' || value.name.length === 0) {
    throw new Error('Plate plugins require a non-empty `name`.');
  }
  assertNoPrepareDocument(value);
  if (Object.hasOwn(value, 'key') || Object.hasOwn(value, 'type')) {
    throw new Error(
      'Plate plugins do not support top-level `key` or `type`; declare persisted identity inside `schema`.'
    );
  }

  if (Object.hasOwn(value, 'node')) {
    throw new Error(
      'Plate plugin `node` is unsupported. Use top-level `schema` and `render`.'
    );
  }
  if (Object.hasOwn(value, 'api') && typeof value.api !== 'function') {
    throw new Error('Plate plugin `api` must be a context factory.');
  }
  assertInputRules(value);
};

const assertExtendObject = (value: object) => {
  assertNoPrepareDocument(value);
  assertInputRules(value as PluginRecord);

  if (Object.hasOwn(value, 'component')) {
    throw new Error(
      'Plate plugin .extend() cannot define `component`; declare the default in the constructor or replace it through terminal .configure({ component }).'
    );
  }

  if (
    Object.hasOwn(value, 'api') &&
    typeof Reflect.get(value, 'api') !== 'function'
  ) {
    throw new Error('Plate plugin `api` must be a context factory.');
  }

  for (const field of [
    'dependencies',
    'key',
    'name',
    'schema',
    'type',
  ] as const) {
    if (Object.hasOwn(value, field)) {
      throw new Error(
        `Plate plugin .extend() cannot define \`${field}\`; declare model identity and dependencies in the constructor.`
      );
    }
  }
};

const assertConfigureObject = (value: object) => {
  assertNoPrepareDocument(value);
  assertInputRules(value as PluginRecord);

  for (const field of [
    'activate',
    'api',
    'codecs',
    'commands',
    'conflicts',
    'contributions',
    'corrections',
    'dependencies',
    'effectTypes',
    'key',
    'name',
    'read',
    'readMiddleware',
    'schema',
    'stateFields',
    'type',
    'update',
    'validate',
  ] as const) {
    if (Object.hasOwn(value, field)) {
      throw new Error(
        `Plate plugin .configure() cannot define \`${field}\`; use .extend() for author capabilities.`
      );
    }
  }
};

const normalizeConfiguration = (configuration: PluginRecord) => {
  assertConfigureObject(configuration);

  return configuration;
};

const snapshotConfiguration = (configuration: object) => {
  const snapshot: Record<PropertyKey, unknown> = {};

  for (const key of Reflect.ownKeys(configuration)) {
    snapshot[key] = freezePluginDescriptorValue(
      Reflect.get(configuration, key)
    );
  }

  return Object.freeze(snapshot);
};

const createInitialStage = (definition: PluginRecord) => {
  const { api, codecs, initialState, read, update } = definition;
  const contextualInitialState =
    typeof initialState === 'function' ? initialState : undefined;

  if (
    api === undefined &&
    codecs === undefined &&
    contextualInitialState === undefined &&
    read === undefined &&
    update === undefined
  ) {
    return [];
  }

  return [
    (context: AnyBasePluginContext) => ({
      ...(api !== undefined
        ? {
            api,
          }
        : {}),
      ...(codecs !== undefined
        ? {
            codecs:
              typeof codecs === 'function'
                ? Reflect.apply(codecs, undefined, [context])
                : codecs,
          }
        : {}),
      ...(contextualInitialState
        ? {
            initialState: Reflect.apply(contextualInitialState, undefined, [
              context,
            ]),
          }
        : {}),
      ...(read !== undefined ? { read } : {}),
      ...(update !== undefined ? { update } : {}),
    }),
  ] as const;
};

const attachPluginMethods = (
  source: MutableBasePlugin,
  familySource?: object
): MutableBasePlugin => {
  const plugin = source;
  const recreate = (next: MutableBasePlugin) =>
    attachPluginMethods(
      brandPluginDescriptor(next, familySource ?? plugin),
      familySource ?? plugin
    );
  const assertAuthoringOpen = (method: string) => {
    if (!isConfiguredPluginDescriptor(plugin)) return;

    throw new Error(
      `Plate plugin '${plugin.name}' is already configured. Call .${method}() before .configure().`
    );
  };

  Reflect.set(plugin, 'configure', (input: unknown) => {
    assertAuthoringOpen('configure');
    const next = { ...plugin } as MutableBasePlugin;
    const metadata = getPluginDescriptorMetadata(plugin);

    if (isFunction(input)) {
      setPluginDescriptorMetadata(next, {
        ...metadata,
        configured: true,
        configurationLayers: [
          ...metadata.configurationLayers,
          Object.freeze({
            kind: 'context' as const,
            value: (context: AnyBasePluginContext) => {
              const configuration = Reflect.apply(input, undefined, [context]);

              if (!isObjectRecord(configuration)) {
                throw new Error(
                  'Plate plugin .configure() callbacks must return an object.'
                );
              }
              return normalizeConfiguration(configuration);
            },
          }),
        ],
        sourceReferences: Object.freeze([...metadata.sourceReferences, plugin]),
      });
    } else {
      if (!isObjectRecord(input)) {
        throw new Error('Plate plugin .configure() values must be objects.');
      }
      const configuration = normalizeConfiguration(input);
      setPluginDescriptorMetadata(next, {
        ...metadata,
        configured: true,
        configurationLayers: [
          ...metadata.configurationLayers,
          Object.freeze({
            kind: 'object' as const,
            value: snapshotConfiguration(configuration),
          }),
        ],
        sourceReferences: Object.freeze([...metadata.sourceReferences, plugin]),
      });
    }

    return recreate(next);
  });

  Reflect.set(plugin, 'extend', (input: unknown) => {
    assertAuthoringOpen('extend');
    const next = { ...plugin } as MutableBasePlugin;
    const metadata = getPluginDescriptorMetadata(plugin);

    if (isFunction(input)) {
      setPluginDescriptorMetadata(next, {
        ...metadata,
        sourceReferences: Object.freeze([...metadata.sourceReferences, plugin]),
        stages: [
          ...metadata.stages,
          (context: AnyBasePluginContext) => {
            const contribution = Reflect.apply(input, undefined, [context]);

            if (!isObjectRecord(contribution)) {
              throw new Error(
                'Plate plugin .extend() callbacks must return an object.'
              );
            }
            assertNoPrepareDocument(contribution);
            if (!Object.hasOwn(contribution, 'name')) {
              assertExtendObject(contribution);
            }

            return contribution;
          },
        ],
      });
    } else {
      if (!isObjectRecord(input)) {
        throw new Error('Plate plugin .extend() values must be objects.');
      }

      assertNoPrepareDocument(input);

      // A named object is a canonical raw Plite descriptor. Its name is
      // validated by the resolver and its native fields are adopted flat.
      if (!Object.hasOwn(input, 'name')) assertExtendObject(input);

      const contribution = freezePluginDescriptorValue(input);

      setPluginDescriptorMetadata(next, {
        ...metadata,
        sourceReferences: Object.freeze([...metadata.sourceReferences, plugin]),
        stages: [...metadata.stages, () => contribution],
      });
    }

    return recreate(next);
  });

  return Object.freeze(
    brandPluginDescriptor(plugin, familySource)
  ) as MutableBasePlugin;
};

const defineBasePluginRuntime = (definition: unknown): MutableBasePlugin => {
  assertBaseDefinition(definition);
  const normalizedDefinition = definition;

  const {
    api: _api,
    codecs: _codecs,
    initialState,
    read: _read,
    update: _update,
    ...staticDefinition
  } = normalizedDefinition;
  const name = normalizedDefinition.name as string;
  const plugin = mergePlugins(
    {
      name,
      conflicts: [],
      dependencies: [],
      initialState: {},
      inject: {},
      inputRules: [],
      on: {},
      override: {},
      render: {},
      rules: {},
      schema: null,
      selectors: {},
      shortcuts: {},
      slots: {},
      targetPlugins: [],
    },
    {
      ...staticDefinition,
      ...(initialState === undefined || typeof initialState === 'function'
        ? {}
        : { initialState }),
    }
  ) as unknown as MutableBasePlugin;

  setPluginDescriptorMetadata(plugin, {
    configured: false,
    configurationLayers: Object.freeze([]),
    htmlCodecContributions: Object.freeze([]),
    resolved: false,
    sourceReferences: Object.freeze([]),
    stages: createInitialStage(normalizedDefinition),
  });

  plugin.targetPlugins = Object.freeze([...plugin.targetPlugins]);

  return attachPluginMethods(plugin);
};

export function createBasePlugin(
  name: string,
  definition: unknown
): AnyBasePlugin {
  if (typeof name !== 'string' || name.length === 0) {
    throw new Error('Plate plugins require a non-empty name.');
  }
  if (!PLUGIN_NAME_PATTERN.test(name)) {
    throw new Error(
      `Plate plugin name "${name}" must be a human-readable camelCase identifier.`
    );
  }
  if (!isObjectRecord(definition)) {
    throw new Error('Plate plugin definitions must be objects.');
  }
  if (Object.hasOwn(definition, 'name')) {
    throw new Error(
      'Plate plugin identity is positional. Remove `name` from the definition.'
    );
  }

  return defineBasePluginRuntime({ ...definition, name });
}
