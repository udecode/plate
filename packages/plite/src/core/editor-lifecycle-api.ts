import type {
  Editor,
  EditorCommand,
  EditorCommandDispatch,
  EditorCoreUpdateMethods,
  EditorRead,
  EditorReadMethods,
  EditorStateView,
  EditorUpdate,
  EditorUpdateContext,
  EditorUpdateMethods,
  EditorUpdatePolicy,
  EditorUpdateTransaction,
  Value,
} from '../interfaces';
import { isTxOnlyMethod, isTxReadMethod } from './tx-only';
import { getSemanticUpdateLowering } from './semantic-update-method';
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

const readExtensionProperty = <
  V extends Value,
  TExtensions extends readonly unknown[],
>(
  read: RunEditorRead<V, TExtensions>,
  groupName: string,
  propertyName: string
) =>
  read((state) => {
    const group = (state as Record<string, unknown>)[groupName];
    const property = (group as Record<string, unknown> | undefined)?.[
      propertyName
    ];

    if (property === undefined) {
      throw new Error(
        `Editor read group "${groupName}" property "${propertyName}" is not installed.`
      );
    }

    if (typeof property === 'function') {
      return (...args: unknown[]) => property(...args);
    }

    return property;
  });

const resolvePath = (value: unknown, path: readonly string[]): unknown =>
  path.reduce<unknown>(
    (current, key) => (current as Record<string, unknown> | undefined)?.[key],
    value
  );

const ignoredDynamicPropertyNames = new Set([
  'inspect',
  'toJSON',
  'toString',
  'valueOf',
]);

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
        const method = resolvePath(group, path);

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

        result = method(...args);
      });

      return result;
    },
    get(target, key, receiver) {
      if (typeof key !== 'string') return;
      if (key in target) {
        return Reflect.get(target, key, receiver);
      }

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
  const read = (<T>(fn: (state: EditorStateView<V, TExtensions>) => T): T =>
    runRead(fn)) as EditorRead<V, TExtensions>;

  const createGroup = <TGroup extends keyof EditorReadMethods<V>>(
    groupName: TGroup
  ): EditorReadMethods<V>[TGroup] =>
    new Proxy(
      {},
      {
        get(target, key, receiver) {
          if (typeof key !== 'string') return;
          if (key in target) {
            return Reflect.get(target, key, receiver);
          }

          return (...args: unknown[]) =>
            read((state) =>
              (state[groupName] as Record<string, (...args: unknown[]) => any>)[
                key
              ]!(...args)
            );
        },
      }
    ) as EditorReadMethods<V>[TGroup];

  const createCallableGroup = <TGroup extends keyof EditorReadMethods<V>>(
    groupName: TGroup
  ): EditorReadMethods<V>[TGroup] =>
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
        if (typeof key !== 'string') return;
        if (key in target) {
          return Reflect.get(target, key, receiver);
        }

        return (...args: unknown[]) =>
          read((state) =>
            (state[groupName] as Record<string, (...args: unknown[]) => any>)[
              key
            ]!(...args)
          );
      },
    }) as EditorReadMethods<V>[TGroup];

  const methods = {
    children: ((...args) =>
      read((state) =>
        state.children(...args)
      )) as EditorReadMethods<V>['children'],
    facet: ((...args) =>
      read((state) => state.facet(...args))) as EditorReadMethods<V>['facet'],
    fragment: createCallableGroup('fragment'),
    getField: ((...args) =>
      read((state) =>
        state.getField(...args)
      )) as EditorReadMethods<V>['getField'],
    lastCommit: ((...args) =>
      read((state) =>
        state.lastCommit(...args)
      )) as EditorReadMethods<V>['lastCommit'],
    marks: createCallableGroup('marks'),
    meta: ((...args) =>
      read((state) => state.meta(...args))) as EditorReadMethods<V>['meta'],
    nodes: createGroup('nodes'),
    points: createGroup('points'),
    ranges: createGroup('ranges'),
    root: ((...args) =>
      read((state) => state.root(...args))) as EditorReadMethods<V>['root'],
    runtime: createGroup('runtime'),
    schema: createGroup('schema'),
    selection: createCallableGroup('selection'),
    slice: createGroup('slice'),
    text: createGroup('text'),
    value: ((...args) =>
      read((state) => state.value(...args))) as EditorReadMethods<V>['value'],
    view: createGroup('view'),
  } satisfies EditorReadMethods<V>;

  const readApi = Object.assign(read, methods);

  return new Proxy(readApi, {
    get(target, groupName, receiver) {
      if (typeof groupName !== 'string') {
        return Reflect.get(target, groupName, receiver);
      }
      if (ignoredDynamicPropertyNames.has(groupName)) {
        return Reflect.get(target, groupName, receiver);
      }
      if (groupName in target || groupName === 'then') {
        return Reflect.get(target, groupName, receiver);
      }

      return new Proxy(() => {}, {
        apply(_groupTarget, _thisArg, args) {
          return read((state) => {
            const group = (state as Record<string, unknown>)[groupName];

            if (typeof group !== 'function') {
              throw new Error(
                `Editor read group "${groupName}" is not callable.`
              );
            }

            return group(...args);
          });
        },
        get(groupTarget, methodName, receiver) {
          if (typeof methodName !== 'string') return;
          if (methodName in groupTarget) {
            return Reflect.get(groupTarget, methodName, receiver);
          }

          return readExtensionProperty(read, groupName, methodName);
        },
      });
    },
  }) as EditorRead<V, TExtensions>;
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
            if (typeof key !== 'string') return;

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
                )[key]!;
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
          value = ((command: EditorCommand<unknown>, input?: unknown) => {
            let handled = false;

            invoke((tx) => {
              handled = tx.command(command, input);
            });

            return handled;
          }) as EditorCommandDispatch;
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
          ) => invoke((tx) => tx.setField(...args));
          break;
        }
        case 'value': {
          value = Object.freeze({
            repair: () => apiOptions.repairValue(),
            replace: (
              input: Parameters<
                EditorCoreUpdateMethods<V, TExtensions>['value']['replace']
              >[0]
            ) => invoke((tx) => tx.value.replace(input)),
          }) as EditorCoreUpdateMethods<V, TExtensions>['value'];
          break;
        }
        default: {
          value = new Proxy(
            {},
            {
              get(target, methodName, receiver) {
                if (typeof methodName !== 'string') return;
                if (methodName in target) {
                  return Reflect.get(target, methodName, receiver);
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
        if (ignoredDynamicPropertyNames.has(property)) {
          return Reflect.get(target, property, receiver);
        }
        if (property === 'then') return;

        return getUpdateProperty(property);
      },
    }) as EditorUpdate<V, TExtensions>;
  };

  defaultFacade = createFacade();

  return defaultFacade;
};
