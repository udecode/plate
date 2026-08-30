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
import { getSemanticUpdateLowering } from './semantic-update-method';
import { isTxOnlyMethod, isTxReadMethod } from './tx-only';
import {
  compileEditorUpdatePolicy,
  type CompiledEditorUpdatePolicy,
  EMPTY_EDITOR_UPDATE_POLICY,
} from './update-policy';

type RunEditorRead<V extends Value, TExtensions extends readonly unknown[]> = <
  T,
>(
  fn: (state: EditorStateView<V, TExtensions>) => T
) => T;

type RunEditorUpdate<
  V extends Value,
  TExtensions extends readonly unknown[],
> = (
  fn: (
    transaction: EditorUpdateTransaction<V, TExtensions>,
    context: EditorUpdateContext<Editor<V, TExtensions>>
  ) => void,
  policy: CompiledEditorUpdatePolicy
) => void;

type EditorUpdateApiOptions = {
  hasTxGroup?: (groupName: string) => boolean;
  repairValue: () => void;
};

const assertHistoryCapability = (options: {
  hasTxGroup?: (groupName: string) => boolean;
}) => {
  if (!options.hasTxGroup?.('history')) {
    throw new Error(
      'Editor update history policy requires the history extension.'
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

const resolvePath = (value: unknown, path: readonly string[]) => {
  let current = value;
  let owner: unknown;

  for (const key of path) {
    owner = current;
    if (
      (typeof current !== 'object' || current === null) &&
      typeof current !== 'function'
    ) {
      return { owner: undefined, value: undefined };
    }
    const descriptor = Object.getOwnPropertyDescriptor(current, key);

    if (!descriptor || !('value' in descriptor)) {
      return { owner: undefined, value: undefined };
    }
    current = descriptor.value;
  }

  return { owner, value: current };
};

const createReadExtensionPath = <
  V extends Value,
  TExtensions extends readonly unknown[],
>(
  read: RunEditorRead<V, TExtensions>,
  groupName: string,
  pathCache: Map<string, unknown>,
  path: readonly string[] = []
): unknown => {
  const cacheKey = JSON.stringify([groupName, ...path]);
  const existing = pathCache.get(cacheKey);

  if (existing) return existing;

  const extensionPath = new Proxy(() => {}, {
    apply(_target, _thisArg, args) {
      return read((state) => {
        const group = (state as Record<string, unknown>)[groupName];
        const { owner, value: method } = resolvePath(group, path);

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
      return createReadExtensionPath(read, groupName, pathCache, [
        ...path,
        key,
      ]);
    },
  });

  pathCache.set(cacheKey, extensionPath);

  return extensionPath;
};

const createUpdateExtensionPath = <
  V extends Value,
  TExtensions extends readonly unknown[],
>(
  runUpdate: (
    fn: (
      transaction: EditorUpdateTransaction<V, TExtensions>,
      context: EditorUpdateContext<Editor<V, TExtensions>>
    ) => void
  ) => void,
  groupName: string,
  pathCache: Map<string, unknown>,
  path: readonly string[] = []
): unknown => {
  const cacheKey = JSON.stringify([groupName, ...path]);
  const existing = pathCache.get(cacheKey);

  if (existing) {
    return existing;
  }

  const extensionPath = new Proxy(() => {}, {
    apply(_target, _thisArg, args) {
      let result: unknown;

      runUpdate((tx) => {
        const group = (tx as Record<string, unknown>)[groupName];
        const { owner, value: method } = resolvePath(group, path);

        if (typeof method !== 'function') {
          throw new Error(
            `Editor update group "${groupName}" method "${path.join(
              '.'
            )}" is not installed.`
          );
        }

        if (isTxOnlyMethod(method)) {
          throw new Error(
            `Editor update group "${groupName}" method "${path.join(
              '.'
            )}" is transaction-only.`
          );
        }
        if (isTxReadMethod(method)) {
          throw new Error(
            `Editor update group "${groupName}" method "${path.join(
              '.'
            )}" is read-only.`
          );
        }

        result = Reflect.apply(method, owner, args);
      });

      return result;
    },
    get(_target, key) {
      if (typeof key !== 'string') return undefined;
      if (key === 'then' || key === 'toJSON') return undefined;
      return createUpdateExtensionPath(runUpdate, groupName, pathCache, [
        ...path,
        key,
      ]);
    },
  });

  pathCache.set(cacheKey, extensionPath);

  return extensionPath;
};

export const createEditorReadApi = <
  V extends Value,
  TExtensions extends readonly unknown[],
>(
  runRead: RunEditorRead<V, TExtensions>
): EditorRead<V, TExtensions> => {
  type RuntimeReadMethods = Omit<EditorCoreStateView<V>, 'key'>;
  const extensionPathCache = new Map<string, unknown>();
  const read = (<T>(fn: (state: EditorStateView<V, TExtensions>) => T): T =>
    runRead(fn)) as EditorRead<V, TExtensions>;

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
    facet: (...args) => read((state) => state.facet(...args)),
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

      return createReadExtensionPath(read, groupName, extensionPathCache);
    },
  });
};

export const createEditorUpdateApi = <
  V extends Value,
  TExtensions extends readonly unknown[],
>(
  runUpdate: RunEditorUpdate<V, TExtensions>,
  apiOptions: EditorUpdateApiOptions
): EditorUpdate<V, TExtensions> => {
  type UpdateCallback = (
    transaction: EditorUpdateTransaction<V, TExtensions>,
    context: EditorUpdateContext<Editor<V, TExtensions>>
  ) => void;

  const historyFacades = new Map<
    NonNullable<EditorUpdatePolicy['history']>,
    EditorUpdateMethods<V, TExtensions>
  >();
  const taggedFacades = new WeakMap<
    object,
    EditorUpdateMethods<V, TExtensions>
  >();
  let defaultFacade!: EditorUpdate<V, TExtensions>;

  const getConfiguredFacade = (
    policy: EditorUpdatePolicy
  ): EditorUpdateMethods<V, TExtensions> => {
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
  ): EditorUpdate<V, TExtensions> => {
    const propertyCache = new Map<string, unknown>();
    const extensionPathCache = new Map<string, unknown>();
    const invoke = (fn: UpdateCallback) => {
      if (requiresHistory) {
        assertHistoryCapability(apiOptions);
      }

      runUpdate(fn, compiledPolicy ?? EMPTY_EDITOR_UPDATE_POLICY);
    };
    const update = ((
      policyOrFn: EditorUpdatePolicy | UpdateCallback,
      fn?: UpdateCallback
    ): EditorUpdateMethods<V, TExtensions> | void => {
      if (typeof policyOrFn === 'function') {
        if (fn !== undefined) {
          throw new Error(
            'editor.update callback options were removed; pass policy first'
          );
        }

        invoke(policyOrFn);
        return;
      }

      assertUpdatePolicy(policyOrFn, apiOptions);

      if (fn) {
        runUpdate(fn, compileEditorUpdatePolicy(policyOrFn));
        return;
      }

      return getConfiguredFacade(policyOrFn);
    }) as EditorUpdate<V, TExtensions>;

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
    ): EditorCoreUpdateMethods<V, TExtensions>[TGroup] => {
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

            const method = (...args: unknown[]) => {
              let result: unknown;

              invoke((tx) => {
                const transactionMethod = (
                  tx[groupName] as Record<
                    string,
                    (...args: unknown[]) => unknown
                  >
                )[key];
                const lower = getSemanticUpdateLowering(transactionMethod);

                result = lower
                  ? lower(tx.command, args, transactionMethod)
                  : transactionMethod(...args);
              });

              return result;
            };

            methodCache.set(key, method);

            return method;
          },
        }
      ) as EditorCoreUpdateMethods<V, TExtensions>[TGroup];
    };

    const getUpdateProperty = (property: string): unknown => {
      const existing = propertyCache.get(property);

      if (existing) {
        return existing;
      }

      let value: unknown;

      switch (property) {
        case 'command': {
          value = (command: EditorCommand<unknown>, input?: unknown) => {
            let handled = false;

            invoke((tx) => {
              handled = Reflect.apply(tx.command, tx, [command, input]);
            });

            return handled;
          };
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
              EditorCoreUpdateMethods<V, TExtensions>['setField']
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
                EditorCoreUpdateMethods<V, TExtensions>['value']['replace']
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
                return createUpdateExtensionPath(
                  invoke,
                  property,
                  extensionPathCache,
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
