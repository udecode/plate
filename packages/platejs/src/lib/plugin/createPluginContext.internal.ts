import {
  callPluginUpdateMethod,
  getStateViewPresentation,
  getViewPresentation,
  type InternalCompiledPluginPublicationEntry,
  resolveInstalledPlugin,
  resolvePluginMethod,
} from 'plitejs/internal';

import type {
  RuntimePluginReference,
  EditorUpdatePolicy,
  SchemaPropertyHandle,
  Value,
} from '../../facade';
import { withTransactionSpecDraftRead } from '../../facade';
import {
  evaluatePluginSchemaDeclaration,
  getAuthoredPluginPropertyHandle,
  getCandidateApplicationElementType,
  getCompiledPlateModelBinding,
  getCompiledPlatePlugin,
  getCompiledPlatePluginApi,
  hasCompiledPlateModelCandidate,
  hasCompiledPlatePluginApiCandidate,
  hasCompiledPlatePluginCandidate,
  isResolvingPlatePlugin,
  resolvePluginElementType,
  resolvePluginPropertyKey,
} from '../../internal/plugin/compilePlateModel';
import { getPlateRuntimeOwner } from '../../internal/plugin/plateRuntime';
import {
  getEditorViewStore,
  getPluginStore,
  getViewStore,
  type InternalPluginStore,
} from '../../internal/plugin/pluginStore';
import {
  getPluginSchemaFamily,
  isNominalPluginDescriptor,
  isPluginDescriptorOf,
  isResolvedPluginDescriptor,
} from '../../internal/utils/mergePlugins';
import type { Editor, InternalBaseEditorWithInstalledPlugins } from '../editor';
import type {
  AnyBasePlugin,
  AnyBasePluginContext,
  AnyBasePluginPortal,
  AnyPluginBase,
  BasePluginContext,
} from './BasePlugin';
import { createDefinePluginFormats } from './pluginAuthoringContext';
import type {
  AnyBasePluginDefinition,
  PluginReference,
  PluginSchemaDeclaration,
  PluginStore,
} from './PluginDefinition';
import type { InternalPluginDefinitionOf } from './pluginDefinitionLookup.internal';

const isPluginBaseDescriptor = (value: unknown): value is AnyBasePlugin =>
  isNominalPluginDescriptor(value) && isResolvedPluginDescriptor(value);

type PluginAccessCache = {
  authoring: Map<
    AnyBasePlugin | AnyPluginBase | PluginReference | string,
    AnyBasePluginContext
  >;
  portal: Map<
    AnyBasePlugin | AnyPluginBase | PluginReference | string,
    AnyBasePluginPortal
  >;
};

const PLUGIN_ACCESS_CACHE = new WeakMap<object, PluginAccessCache>();

const createViewStoreAccess = (getStore: () => InternalPluginStore) =>
  Object.freeze({
    get: (key?: PropertyKey) => {
      const store = getStore().public;

      return key === undefined ? store.get() : store.get(key);
    },
    set: (value: object) => {
      getStore().public.set(value);
    },
    subscribe: (listener: (state: object, previousState: object) => void) =>
      getStore().public.subscribe(listener),
  });

const createEditorViewStoreAccess = (
  editor: object,
  getPlugin: () => AnyBasePlugin
) =>
  createViewStoreAccess(() =>
    getEditorViewStore(editor as Editor, getPlugin())
  );

export const withPluginViewStore = <T extends object>(
  context: T,
  editor: Editor,
  plugin: AnyBasePlugin
): T =>
  Object.create(context, {
    viewStore: {
      enumerable: true,
      value: createEditorViewStoreAccess(editor, () => plugin),
    },
  });

export const createPlatePluginPortal = (
  editor: Parameters<
    NonNullable<InternalCompiledPluginPublicationEntry['createPortal']>
  >[0],
  descriptor: RuntimePluginReference
) =>
  createPluginAccess(
    editor,
    descriptor as AnyBasePlugin | PluginReference,
    false
  ) as AnyBasePluginPortal;

export function createPluginContext<
  V extends Value,
  E extends AnyBasePluginDefinition,
  P extends (AnyBasePlugin | AnyPluginBase) & PluginReference,
>(
  editor: InternalBaseEditorWithInstalledPlugins<V, E>,
  p: P
): BasePluginContext<InternalPluginDefinitionOf<P>>;
export function createPluginContext(
  editor: Editor,
  plugin: AnyBasePlugin | AnyPluginBase | PluginReference | string
): AnyBasePluginContext;
export function createPluginContext(
  editor: object,
  plugin: AnyBasePlugin | AnyPluginBase | PluginReference | string
): unknown {
  return createPluginAccess(editor, plugin, true);
}

const createPluginAccess = (
  editor: object,
  input: AnyBasePlugin | AnyPluginBase | PluginReference | string,
  authoring: boolean
): AnyBasePluginContext | AnyBasePluginPortal => {
  if (typeof input !== 'string' && !isNominalPluginDescriptor(input)) {
    throw new TypeError(
      'Plate plugin lookup requires a plugin descriptor or plugin name string.'
    );
  }

  let cache = PLUGIN_ACCESS_CACHE.get(editor);

  if (!cache) {
    cache = { authoring: new Map(), portal: new Map() };
    PLUGIN_ACCESS_CACHE.set(editor, cache);
  }
  const accessCache = authoring ? cache.authoring : cache.portal;
  const cached = accessCache.get(input);

  if (cached) return cached;

  const descriptor = typeof input === 'string' ? undefined : input;
  const name = typeof input === 'string' ? input : input.name;
  const provided =
    descriptor && isPluginBaseDescriptor(descriptor) ? descriptor : undefined;
  const isDescriptorInstalled = () => {
    if (!descriptor) return true;
    const compiled = getCompiledPlatePlugin(editor, name);

    if (compiled) return isPluginDescriptorOf(descriptor, compiled);
    return (
      resolveInstalledPlugin(
        editor as Parameters<typeof resolveInstalledPlugin>[0],
        descriptor
      ) !== undefined
    );
  };
  const getCandidate = () => {
    if (provided && isResolvingPlatePlugin(editor, provided)) return provided;
    if (
      !hasCompiledPlatePluginCandidate(editor) &&
      !hasCompiledPlateModelCandidate(editor)
    ) {
      return undefined;
    }
    const compiled = getCompiledPlatePlugin(editor, name);

    if (compiled && descriptor && isPluginDescriptorOf(descriptor, compiled)) {
      return compiled;
    }

    return undefined;
  };
  const getPlugin = () => {
    const plugin = getCandidate() ?? getCompiledPlatePlugin(editor, name);

    if (!plugin) {
      throw new Error(`Plate plugin "${name}" is not installed.`);
    }
    if (!getCandidate() && !isDescriptorInstalled()) {
      if (
        descriptor &&
        getPluginSchemaFamily(descriptor) !== getPluginSchemaFamily(plugin)
      ) {
        throw new Error(
          `Plate plugin "${name}" resolves to a different descriptor family.`
        );
      }
      throw new Error(
        `Plate plugin "${name}" descriptor is not installed on this editor.`
      );
    }

    return plugin;
  };
  const isInstalled = () => {
    const candidate = getCandidate();
    const plugin = candidate ?? getCompiledPlatePlugin(editor, name);

    return (
      plugin !== undefined &&
      (candidate !== undefined || isDescriptorInstalled())
    );
  };
  const getStore = () => getPluginStore(editor, getPlugin());
  const viewStoreOf = (state: object) =>
    createViewStoreAccess(() =>
      getViewStore(
        editor,
        getPlugin(),
        getStateViewPresentation(state) ??
          getViewPresentation(getPlateRuntimeOwner(editor))
      )
    );
  const getAuthoredSchema = () =>
    evaluatePluginSchemaDeclaration(editor as Editor, getPlugin());
  const getPublishedBinding = () => {
    const plugin = getPlugin();
    const binding = getCompiledPlateModelBinding(editor, plugin);

    if (!binding) {
      throw new Error(
        `Plate plugin "${plugin.name}" schema is not published yet.`
      );
    }

    return binding;
  };
  const pendingPropertyHandles = new Map<string, SchemaPropertyHandle>();
  const getPendingPropertyHandle = (localId: string) => {
    const known = pendingPropertyHandles.get(localId);

    if (known) return known;
    const authored = getAuthoredPluginPropertyHandle(
      editor as Editor,
      getPlugin(),
      localId
    );

    if (!authored) {
      throw new Error(
        `Plate plugin "${getPlugin().name}" schema property "${localId}" is not published yet.`
      );
    }
    const current = () =>
      getCompiledPlateModelBinding(editor, getPlugin())?.propertyHandles[
        localId
      ] ?? authored;
    const pending = Object.freeze(
      Object.defineProperties(
        {},
        {
          id: { enumerable: true, get: () => current().id },
          key: { enumerable: true, get: () => current().key },
          kind: { enumerable: true, value: 'schema-property' },
          placement: { enumerable: true, get: () => current().placement },
        }
      )
    ) as SchemaPropertyHandle;

    pendingPropertyHandles.set(localId, pending);

    return pending;
  };
  const unpublishedProperties = new Proxy(
    Object.create(null) as Record<PropertyKey, unknown>,
    {
      get(_target, localId) {
        if (typeof localId !== 'string') return undefined;

        return getPendingPropertyHandle(localId);
      },
    }
  );
  const authorSchema = new Proxy(
    Object.create(null) as Record<PropertyKey, unknown>,
    {
      get(_target, key) {
        if (key === 'then' || key === 'toJSON' || typeof key === 'symbol') {
          return undefined;
        }
        const binding = getCompiledPlateModelBinding(editor, getPlugin());

        if (!binding && key === 'properties') return unpublishedProperties;
        if (!binding && key === 'type') {
          const plugin = getPlugin();

          return (
            getCandidateApplicationElementType(editor, plugin) ??
            resolvePluginElementType(editor as Editor, plugin)
          );
        }
        if (!binding && key === 'key') {
          return resolvePluginPropertyKey(editor as Editor, getPlugin());
        }

        return Reflect.get(getPublishedBinding().schema, key);
      },
      getOwnPropertyDescriptor(_target, key) {
        const innerDescriptor = Object.getOwnPropertyDescriptor(
          getPublishedBinding().schema,
          key
        );

        return innerDescriptor
          ? { ...innerDescriptor, configurable: true }
          : undefined;
      },
      has(_target, key) {
        return key in getPublishedBinding().schema;
      },
      ownKeys() {
        return Reflect.ownKeys(getPublishedBinding().schema);
      },
    }
  );
  const getConsumerSchemaIdentity = (identity: 'key' | 'type') => {
    const plugin = getPlugin();
    const binding = getCompiledPlateModelBinding(editor, plugin);
    const expectedKind = identity === 'type' ? 'element' : 'mark';

    if (binding) {
      if (binding.kind !== expectedKind) {
        throw new Error(
          `Plate plugin "${plugin.name}" does not own a primary ${expectedKind} schema identity.`
        );
      }

      return identity === 'type' ? binding.elementType : binding.propertyKey;
    }

    const authored = getAuthoredSchema();
    const authoredKind = authored
      ? authored.element
        ? 'element'
        : authored.mark
          ? 'mark'
          : 'none'
      : 'none';

    if (authoredKind !== expectedKind) {
      throw new Error(
        `Plate plugin "${plugin.name}" does not own a primary ${expectedKind} schema identity.`
      );
    }

    if (hasCompiledPlatePluginCandidate(editor)) {
      if (identity === 'type') {
        return (
          getCandidateApplicationElementType(editor, plugin) ??
          authored?.element?.type ??
          plugin.name
        );
      }

      return authored?.mark && 'property' in authored.mark
        ? (authored.mark.key ?? plugin.name)
        : plugin.name;
    }

    return identity === 'type'
      ? getPublishedBinding().elementType
      : getPublishedBinding().propertyKey;
  };
  const hasConsumerSchemaIdentity = (identity: 'key' | 'type') => {
    try {
      getConsumerSchemaIdentity(identity);

      return true;
    } catch {
      return false;
    }
  };
  const consumerSchema = new Proxy(
    Object.create(null) as Record<PropertyKey, unknown>,
    {
      get(_target, key) {
        if (key === 'then' || key === 'toJSON' || typeof key === 'symbol') {
          return undefined;
        }
        if (key === 'type' || key === 'key') {
          return getConsumerSchemaIdentity(key);
        }

        return undefined;
      },
      getOwnPropertyDescriptor(_target, key) {
        if (key !== 'type' && key !== 'key') return undefined;

        return {
          configurable: true,
          enumerable: true,
          value: getConsumerSchemaIdentity(key),
          writable: false,
        };
      },
      has(_target, key) {
        if (key !== 'type' && key !== 'key') return false;

        return hasConsumerSchemaIdentity(key);
      },
      ownKeys() {
        return (['type', 'key'] as const).filter(hasConsumerSchemaIdentity);
      },
    }
  );
  const createApiFacade = (path: readonly PropertyKey[]): unknown =>
    new Proxy(
      (...args: unknown[]) => {
        const runtimeApi = getRuntimeApi();
        let owner: unknown = runtimeApi === api ? {} : runtimeApi;
        let value = owner;

        for (const key of path) {
          owner = value;
          value =
            value && (typeof value === 'object' || typeof value === 'function')
              ? (value as Record<PropertyKey, unknown>)[key]
              : undefined;
        }

        if (typeof value !== 'function') {
          throw new TypeError(
            `Plugin API method "${path.map(String).join('.')}" is not callable.`
          );
        }

        return Reflect.apply(value, owner, args);
      },
      {
        get(target, key, receiver) {
          if (key === 'then' || key === 'toJSON' || typeof key === 'symbol') {
            return undefined;
          }
          if (key === 'toString' || key === 'valueOf') {
            return Reflect.get(target, key, receiver);
          }

          return createApiFacade([...path, key]);
        },
      }
    );
  const api = new Proxy(Object.create(null) as Record<PropertyKey, unknown>, {
    get(_target, key) {
      if (key === 'then' || key === 'toJSON' || typeof key === 'symbol') {
        return undefined;
      }

      return createApiFacade([key]);
    },
  });
  const getRuntimeApi = () => {
    const plugin = getPlugin();

    if (isResolvingPlatePlugin(editor, plugin)) {
      return plugin.api &&
        typeof plugin.api === 'object' &&
        !Array.isArray(plugin.api)
        ? plugin.api
        : api;
    }
    if (
      !hasCompiledPlatePluginApiCandidate(editor) &&
      getCompiledPlatePluginApi(editor, plugin) === undefined
    ) {
      return api;
    }

    if (hasCompiledPlatePluginApiCandidate(editor)) {
      return getCompiledPlatePluginApi(editor, plugin) ?? {};
    }

    return Reflect.get(Reflect.get(editor, 'api'), plugin.name) ?? {};
  };
  const createUpdateFacade = (
    path: readonly PropertyKey[],
    policy?: EditorUpdatePolicy
  ): unknown => {
    const label = `Plugin update command "${path.map(String).join('.')}"`;

    return new Proxy(
      (...args: unknown[]) => {
        const update = Reflect.get(editor, 'update');

        if (typeof update !== 'function') {
          throw new TypeError('Plate editor update API is not callable.');
        }
        const callback = (transaction: Record<PropertyKey, unknown>) => {
          const own = resolvePluginMethod(transaction[getPlugin().name], path);

          return callPluginUpdateMethod(
            label,
            typeof own.value === 'function'
              ? own
              : resolvePluginMethod(transaction, path),
            args
          );
        };

        return Reflect.apply(
          update,
          editor,
          policy === undefined ? [callback] : [policy, callback]
        );
      },
      {
        get(target, key) {
          if (key === 'toString' || key === 'valueOf') {
            return Reflect.get(target, key);
          }
          if (key === 'then' || key === 'toJSON' || typeof key === 'symbol') {
            return undefined;
          }
          return createUpdateFacade([...path, key], policy);
        },
      }
    );
  };
  const createReadFacade = (path: readonly PropertyKey[]): unknown =>
    new Proxy(
      (...args: unknown[]) =>
        withTransactionSpecDraftRead(editor as Editor, () => {
          const editorRead = Reflect.get(editor, 'read');
          if (typeof editorRead !== 'function') {
            throw new TypeError('Plate editor read API is not callable.');
          }

          return Reflect.apply(editorRead, editor, [
            (state: Record<PropertyKey, unknown>) => {
              const { owner, value } = resolvePluginMethod(
                state[getPlugin().name],
                path
              );

              if (typeof value !== 'function') {
                throw new TypeError(
                  `Plugin read method "${path.map(String).join('.')}" is not callable.`
                );
              }

              return Reflect.apply(value, owner, args);
            },
          ]);
        }),
      {
        get(target, key) {
          if (key === 'toString' || key === 'valueOf') {
            return Reflect.get(target, key);
          }
          if (key === 'then' || key === 'toJSON' || typeof key === 'symbol') {
            return undefined;
          }
          return createReadFacade([...path, key]);
        },
      }
    );
  const read = createReadFacade([]);
  const createScopedUpdateFacade = (policy?: EditorUpdatePolicy): unknown =>
    new Proxy(
      (nextPolicy: EditorUpdatePolicy) => createScopedUpdateFacade(nextPolicy),
      {
        get(target, key) {
          if (key === 'toString' || key === 'valueOf') {
            return Reflect.get(target, key);
          }
          if (key === 'then' || key === 'toJSON' || typeof key === 'symbol') {
            return undefined;
          }

          return createUpdateFacade([key], policy);
        },
      }
    );
  const update = createScopedUpdateFacade();
  const store: PluginStore = Object.freeze({
    get(key?: PropertyKey, ...args: unknown[]) {
      const runtime = getStore();

      if (runtime) {
        // oxlint-disable-next-line typescript/unbound-method -- [P0 behavior-boundary] Reflect.apply preserves the erased plugin-store receiver and variadic contract that a direct generic call cannot express.
        return Reflect.apply(runtime.public.get, runtime.public, [
          key,
          ...args,
        ]);
      }
      const plugin = getPlugin();

      if (key === undefined) return plugin.initialState;
      const selector = Reflect.get(plugin.selectors, key);

      if (typeof selector === 'function') {
        return Reflect.apply(selector, plugin.selectors, [
          plugin.initialState,
          ...args,
        ]);
      }
      if (Object.hasOwn(plugin.initialState, key)) {
        return Reflect.get(plugin.initialState, key);
      }

      throw new Error(
        `Plate plugin "${plugin.name}" has no state field or selector "${String(key)}".`
      );
    },
    set(value: unknown) {
      const runtime = getStore();

      if (runtime) {
        // oxlint-disable-next-line typescript/unbound-method -- [P0 behavior-boundary] Reflect.apply preserves the erased plugin-store receiver and runtime value contract that a direct generic call cannot express.
        Reflect.apply(runtime.public.set, runtime.public, [value]);
      }
    },
    subscribe(listener: (state: object, previousState: object) => void) {
      const runtime = getStore();

      return runtime
        ? Reflect.apply(runtime.public.subscribe, runtime.public, [listener])
        : () => {};
    },
  }) as PluginStore;
  const context = {} as Record<PropertyKey, unknown>;
  if (authoring) {
    context.defineFormats =
      createDefinePluginFormats<AnyBasePluginDefinition>();
    context.editor = editor;
    Object.defineProperty(context, 'plugin', {
      enumerable: true,
      get: getPlugin,
    });
    context.viewStoreOf = viewStoreOf;
  } else {
    Object.defineProperty(context, 'viewStore', {
      enumerable: true,
      value: createEditorViewStoreAccess(editor, getPlugin),
    });
  }

  const declaration =
    descriptor && 'schema' in descriptor
      ? (descriptor.schema as PluginSchemaDeclaration | undefined)
      : undefined;
  const compiledPlugin = getCandidate() ?? getCompiledPlatePlugin(editor, name);
  const compiledSchemaKind = compiledPlugin
    ? getCompiledPlateModelBinding(editor, compiledPlugin)?.kind
    : undefined;
  const evaluatedDeclaration =
    compiledPlugin && compiledSchemaKind === undefined
      ? evaluatePluginSchemaDeclaration(editor as Editor, compiledPlugin)
      : undefined;
  const effectiveDeclaration = evaluatedDeclaration ?? declaration;
  const authoredSchemaKind =
    effectiveDeclaration && typeof effectiveDeclaration === 'object'
      ? effectiveDeclaration.element
        ? 'element'
        : effectiveDeclaration.mark
          ? 'mark'
          : 'none'
      : 'none';
  const exposesConsumerSchema =
    typeof input === 'string' ||
    compiledSchemaKind === 'element' ||
    compiledSchemaKind === 'mark' ||
    authoredSchemaKind === 'element' ||
    authoredSchemaKind === 'mark';

  Object.defineProperties(context, {
    api: { enumerable: true, get: getRuntimeApi },
    installed: { enumerable: true, get: isInstalled },
    name: { enumerable: true, get: () => getPlugin().name },
    read: {
      enumerable: true,
      get: () => {
        getPlugin();

        return read;
      },
    },
    ...(authoring || exposesConsumerSchema
      ? {
          schema: {
            enumerable: true,
            get: () => {
              getPlugin();

              return authoring ? authorSchema : consumerSchema;
            },
          },
        }
      : {}),
    store: {
      enumerable: true,
      get: () => {
        getPlugin();

        return store;
      },
    },
    update: {
      enumerable: true,
      get: () => {
        getPlugin();

        return update;
      },
    },
  });

  const access = new Proxy(context, {
    get(target, key, receiver) {
      if (Reflect.has(target, key)) {
        return Reflect.get(target, key, receiver);
      }
      if (key === 'schema') return undefined;

      return Reflect.get(getPlugin(), key);
    },
    getOwnPropertyDescriptor(target, key) {
      const ownDescriptor = Reflect.getOwnPropertyDescriptor(target, key);

      if (ownDescriptor) return ownDescriptor;
      if (key === 'schema') return undefined;

      const pluginDescriptor = Reflect.getOwnPropertyDescriptor(
        getPlugin(),
        key
      );

      return pluginDescriptor
        ? { ...pluginDescriptor, configurable: true }
        : undefined;
    },
    has(target, key) {
      if (key === 'schema') return Reflect.has(target, key);

      return Reflect.has(target, key) || Reflect.has(getPlugin(), key);
    },
    ownKeys(target) {
      return [
        ...new Set([
          ...Reflect.ownKeys(target),
          ...Reflect.ownKeys(getPlugin()).filter(
            (key) => key !== 'schema' && key !== 'slots'
          ),
        ]),
      ];
    },
    defineProperty(target, key, attributes) {
      return authoring
        ? Reflect.defineProperty(target, key, attributes)
        : false;
    },
    deleteProperty(target, key) {
      return authoring ? Reflect.deleteProperty(target, key) : false;
    },
    set(target, key, value, receiver) {
      return authoring ? Reflect.set(target, key, value, receiver) : false;
    },
  }) as AnyBasePluginContext | AnyBasePluginPortal;

  accessCache.set(input, access as never);

  return access;
};
