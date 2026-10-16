import type {
  AnyEditor as Editor,
  EditorCommand,
  EditorCoreStateView,
  EditorCoreUpdateMethods,
  EditorRead,
  EditorStateView,
  EditorUpdate,
  EditorUpdateContext,
  EditorUpdateMethods,
  EditorUpdatePolicy,
  EditorUpdateTransaction,
  Value,
} from '../interfaces';
import { callPluginUpdateMethod, resolvePluginMethod } from './plugin-dispatch';
import { getSemanticUpdateLowering } from './semantic-update-method';
import {
  compileEditorUpdatePolicy,
  type CompiledEditorUpdatePolicy,
  EMPTY_EDITOR_UPDATE_POLICY,
} from './update-policy';

type RunEditorRead<V extends Value, TPlugins extends readonly unknown[]> = <T>(
  fn: (state: EditorStateView<V, TPlugins>) => T
) => T;

type UpdateAuthor<V extends Value, TPlugins extends readonly unknown[], R> = (
  transaction: EditorUpdateTransaction<V, TPlugins>,
  context: EditorUpdateContext<Editor<V, TPlugins>>
) => R;

type RunEditorUpdate<V extends Value, TPlugins extends readonly unknown[]> = <
  R,
>(
  fn: UpdateAuthor<V, TPlugins, R>,
  policy: CompiledEditorUpdatePolicy
) => R | undefined;

type EditorUpdateApiOptions = {
  hasTxGroup?: (groupName: string) => boolean;
  repairValue: () => void;
};

const assertHistoryCapability = (options: {
  hasTxGroup?: (groupName: string) => boolean;
}) => {
  if (!options.hasTxGroup?.('history')) {
    throw new Error(
      'Editor update history policy requires the history plugin.'
    );
  }
};

const assertUpdatePolicy = (
  policy: EditorUpdatePolicy,
  options: { hasTxGroup?: (groupName: string) => boolean }
) => {
  if (policy.history) {
    assertHistoryCapability(options);
  }
};

const createReadPluginPath = <
  V extends Value,
  TPlugins extends readonly unknown[],
>(
  read: RunEditorRead<V, TPlugins>,
  groupName: string,
  pathCache: Map<string, unknown>,
  path: readonly string[] = []
): unknown => {
  const cacheKey = JSON.stringify([groupName, ...path]);
  const existing = pathCache.get(cacheKey);

  if (existing) return existing;

  const pluginPath = new Proxy(() => {}, {
    apply(_target, _thisArg, args) {
      return read((state) => {
        const group = (state as Record<string, unknown>)[groupName];
        const { owner, value: method } = resolvePluginMethod(group, path);

        if (typeof method !== 'function') {
          throw new Error(
            `Editor read group "${groupName}" method "${path.join(
              '.'
            )}" is not installed.`
          );
        }

        return Reflect.apply(method, owner, args);
      });
    },
    get(_target, key) {
      if (typeof key !== 'string') return undefined;
      if (key === 'then' || key === 'toJSON') return undefined;
      return createReadPluginPath(read, groupName, pathCache, [...path, key]);
    },
  });

  pathCache.set(cacheKey, pluginPath);

  return pluginPath;
};

const createUpdatePluginPath = <
  V extends Value,
  TPlugins extends readonly unknown[],
>(
  runUpdate: <R>(fn: UpdateAuthor<V, TPlugins, R>) => R | undefined,
  groupName: string,
  pathCache: Map<string, unknown>,
  path: readonly string[] = []
): unknown => {
  const cacheKey = JSON.stringify([groupName, ...path]);
  const existing = pathCache.get(cacheKey);

  if (existing) {
    return existing;
  }

  const label = `Editor update group "${groupName}" method "${path.join('.')}"`;
  const pluginPath = new Proxy(() => {}, {
    apply(_target, _thisArg, args) {
      return runUpdate((tx) =>
        callPluginUpdateMethod(
          label,
          resolvePluginMethod((tx as Record<string, unknown>)[groupName], path),
          args
        )
      );
    },
    get(_target, key) {
      if (typeof key !== 'string') return undefined;
      if (key === 'then' || key === 'toJSON') return undefined;
      return createUpdatePluginPath(runUpdate, groupName, pathCache, [
        ...path,
        key,
      ]);
    },
  });

  pathCache.set(cacheKey, pluginPath);

  return pluginPath;
};

export const createEditorReadApi = <
  V extends Value,
  TPlugins extends readonly unknown[],
>(
  runRead: RunEditorRead<V, TPlugins>
): EditorRead<V, TPlugins> => {
  type RuntimeReadMethods = Omit<EditorCoreStateView<V>, 'key'>;
  const pluginPathCache = new Map<string, unknown>();
  const read = (<T>(fn: (state: EditorStateView<V, TPlugins>) => T): T =>
    runRead(fn)) as EditorRead<V, TPlugins>;

  const createGroup = <TGroup extends keyof RuntimeReadMethods>(
    groupName: TGroup
  ): RuntimeReadMethods[TGroup] =>
    new Proxy(
      {},
      {
        get(target, key, receiver) {
          if (typeof key !== 'string') return undefined;
          if (key === 'toJSON') return undefined;
          if (key in target) {
            return Reflect.get(target, key, receiver);
          }

          return (...args: unknown[]) =>
            read((state) => {
              const method = (
                state[groupName] as Record<string, unknown> | undefined
              )?.[key];

              if (typeof method !== 'function') {
                throw new Error(
                  `Editor read group "${groupName}" has no method "${key}".`
                );
              }

              return method(...args);
            });
        },
      }
    ) as RuntimeReadMethods[TGroup];

  const createCallableGroup = <TGroup extends keyof RuntimeReadMethods>(
    groupName: TGroup
  ): RuntimeReadMethods[TGroup] =>
    new Proxy(() => {}, {
      apply(_target, _thisArg, args) {
        return read((state) => {
          const group = state[groupName];

          if (typeof group !== 'function') {
            throw new Error(
              `Editor read group "${String(groupName)}" is not callable.`
            );
          }

          return (group as (...args: unknown[]) => unknown)(...args);
        });
      },
      get(target, key, receiver) {
        if (typeof key !== 'string') return undefined;
        if (key === 'toJSON') return undefined;
        if (key in target) {
          return Reflect.get(target, key, receiver);
        }

        return (...args: unknown[]) =>
          read((state) => {
            const method = (
              state[groupName] as Record<string, unknown> | undefined
            )?.[key];

            if (typeof method !== 'function') {
              throw new Error(
                `Editor read group "${groupName}" has no method "${key}".`
              );
            }

            return method(...args);
          });
      },
    }) as RuntimeReadMethods[TGroup];

  const methods = {
    children: (...args) => read((state) => state.children(...args)),
    fragment: createCallableGroup('fragment'),
    getField: ((...args) =>
      read((state) =>
        state.getField(...args)
      )) as RuntimeReadMethods['getField'],
    lastCommit: (...args) => read((state) => state.lastCommit(...args)),
    marks: createCallableGroup('marks'),
    meta: (...args) => read((state) => state.meta(...args)),
    nodes: createGroup('nodes'),
    points: createGroup('points'),
    ranges: createGroup('ranges'),
    root: (...args) => read((state) => state.root(...args)),
    runtime: createGroup('runtime'),
    schema: createGroup('schema'),
    selection: createCallableGroup('selection'),
    slice: createGroup('slice'),
    text: createGroup('text'),
    value: ((...args) =>
      read((state) => state.value(...args))) as RuntimeReadMethods['value'],
    view: createGroup('view'),
  } satisfies RuntimeReadMethods;
  const coreMethodNames = new Set(Object.keys(methods));

  const readApi = Object.assign(read, methods);

  return new Proxy(readApi, {
    get(target, groupName, receiver) {
      if (typeof groupName !== 'string') {
        return Reflect.get(target, groupName, receiver);
      }
      if (
        groupName in target ||
        coreMethodNames.has(groupName) ||
        groupName === 'then' ||
        groupName === 'toJSON'
      ) {
        return Reflect.get(target, groupName, receiver);
      }

      return createReadPluginPath(read, groupName, pluginPathCache);
    },
  });
};

export const createEditorUpdateApi = <
  V extends Value,
  TPlugins extends readonly unknown[],
>(
  runUpdate: RunEditorUpdate<V, TPlugins>,
  apiOptions: EditorUpdateApiOptions
): EditorUpdate<V, TPlugins> => {
  type UpdateCallback = UpdateAuthor<V, TPlugins, unknown>;

  const historyFacades = new Map<
    NonNullable<EditorUpdatePolicy['history']>,
    EditorUpdateMethods<V, TPlugins>
  >();
  const taggedFacades = new WeakMap<object, EditorUpdateMethods<V, TPlugins>>();
  let defaultFacade!: EditorUpdate<V, TPlugins>;

  const getConfiguredFacade = (
    policy: EditorUpdatePolicy
  ): EditorUpdateMethods<V, TPlugins> => {
    assertUpdatePolicy(policy, apiOptions);

    if (!policy.history && policy.tags === undefined) {
      return defaultFacade;
    }

    if (policy.history && policy.tags === undefined) {
      const existing = historyFacades.get(policy.history);

      if (existing) {
        return existing;
      }

      const facade = createFacade(compileEditorUpdatePolicy(policy), true);
      historyFacades.set(policy.history, facade);

      return facade;
    }

    const existing = taggedFacades.get(policy);

    if (existing) {
      return existing;
    }

    const facade = createFacade(
      compileEditorUpdatePolicy(policy),
      policy.history !== undefined
    );
    taggedFacades.set(policy, facade);

    return facade;
  };

  const createFacade = (
    compiledPolicy?: CompiledEditorUpdatePolicy,
    requiresHistory = false
  ): EditorUpdate<V, TPlugins> => {
    const propertyCache = new Map<string, unknown>();
    const pluginPathCache = new Map<string, unknown>();
    const invoke = <R>(fn: UpdateAuthor<V, TPlugins, R>) => {
      if (requiresHistory) {
        assertHistoryCapability(apiOptions);
      }

      return runUpdate(fn, compiledPolicy ?? EMPTY_EDITOR_UPDATE_POLICY);
    };
    const update = ((
      policyOrFn: EditorUpdatePolicy | UpdateCallback,
      fn?: UpdateCallback
    ): unknown => {
      if (typeof policyOrFn === 'function') {
        if (fn !== undefined) {
          throw new Error(
            'editor.update callback options were removed; pass policy first'
          );
        }

        return invoke(policyOrFn);
      }

      assertUpdatePolicy(policyOrFn, apiOptions);

      if (fn) {
        return runUpdate(fn, compileEditorUpdatePolicy(policyOrFn));
      }

      return getConfiguredFacade(policyOrFn);
    }) as EditorUpdate<V, TPlugins>;

    const createGroup = <
      TGroup extends
        | 'blocks'
        | 'break'
        | 'fragment'
        | 'marks'
        | 'nodes'
        | 'roots'
        | 'selection'
        | 'slice'
        | 'text',
    >(
      groupName: TGroup
    ): EditorCoreUpdateMethods<V, TPlugins>[TGroup] => {
      const methodCache = new Map<string, (...args: unknown[]) => unknown>();

      return new Proxy(
        {},
        {
          get(_target, key) {
            if (typeof key !== 'string') return undefined;
            if (key === 'toJSON') return undefined;

            const existing = methodCache.get(key);

            if (existing) {
              return existing;
            }

            const method = (...args: unknown[]) =>
              invoke((tx) => {
                const transactionMethod = (
                  tx[groupName] as Record<
                    string,
                    (...args: unknown[]) => unknown
                  >
                )[key];
                const lower = getSemanticUpdateLowering(transactionMethod);

                return lower
                  ? lower(tx.command, args, transactionMethod)
                  : transactionMethod(...args);
              });

            methodCache.set(key, method);

            return method;
          },
        }
      ) as EditorCoreUpdateMethods<V, TPlugins>[TGroup];
    };

    const getUpdateProperty = (property: string): unknown => {
      const existing = propertyCache.get(property);

      if (existing) {
        return existing;
      }

      let value: unknown;

      switch (property) {
        case 'command': {
          value = (command: EditorCommand<unknown>, input?: unknown) =>
            invoke((tx) => Reflect.apply(tx.command, tx, [command, input]));
          break;
        }

        case 'blocks':
        case 'break':
        case 'fragment':
        case 'marks':
        case 'nodes':
        case 'roots':
        case 'selection':
        case 'slice':
        case 'text': {
          value = createGroup(property);
          break;
        }

        case 'setField': {
          value = (
            ...args: Parameters<
              EditorCoreUpdateMethods<V, TPlugins>['setField']
            >
          ) => {
            invoke((tx) => tx.setField(...args));
          };
          break;
        }

        case 'value': {
          value = Object.freeze({
            repair: () => {
              apiOptions.repairValue();
            },
            replace: (
              input: Parameters<
                EditorCoreUpdateMethods<V, TPlugins>['value']['replace']
              >[0]
            ) => {
              invoke((tx) => {
                tx.value.replace(input);
              });
            },
          });
          break;
        }

        default: {
          value = new Proxy(
            {},
            {
              get(_target, methodName) {
                if (typeof methodName !== 'string') return undefined;
                if (methodName === 'then' || methodName === 'toJSON') {
                  return undefined;
                }
                return createUpdatePluginPath(
                  invoke,
                  property,
                  pluginPathCache,
                  [methodName]
                );
              },
            }
          );
        }
      }

      propertyCache.set(property, value);

      return value;
    };

    return new Proxy(update, {
      get(target, property, receiver) {
        if (typeof property !== 'string' || property in target) {
          return Reflect.get(target, property, receiver);
        }
        if (property === 'then' || property === 'toJSON') return undefined;

        return getUpdateProperty(property);
      },
    });
  };

  defaultFacade = createFacade();

  return defaultFacade;
};
