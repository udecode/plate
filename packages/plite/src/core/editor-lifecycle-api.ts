import type {
  Editor,
  EditorRead,
  EditorReadMethods,
  EditorStateView,
  EditorUpdate,
  EditorUpdateContext,
  EditorUpdateMethods,
  EditorUpdateOptions,
  EditorUpdateTransaction,
  EditorValueReplaceOptions,
  Value,
} from '../interfaces';

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
  options?: EditorUpdateOptions
) => void;

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

const toValueReplaceUpdateOptions = (
  options?: EditorValueReplaceOptions
): EditorUpdateOptions | undefined => {
  if (!options) return;

  const { history, metadata, normalize, tag } = options;

  return {
    metadata: history
      ? {
          ...metadata,
          history: {
            ...metadata?.history,
            mode: history,
          },
        }
      : metadata,
    skipNormalize: normalize === undefined ? undefined : !normalize,
    tag,
  };
};

const createUpdateExtensionPath = <
  V extends Value,
  TExtensions extends readonly unknown[],
>(
  update: EditorUpdate<V, TExtensions>,
  groupName: string,
  path: readonly string[] = []
): unknown =>
  new Proxy(() => {}, {
    apply(_target, _thisArg, args) {
      let result: unknown;

      update((tx) => {
        const group = (tx as Record<string, unknown>)[groupName];
        const method = resolvePath(group, path);

        if (typeof method !== 'function') {
          throw new Error(
            `Editor update group "${groupName}" method "${path.join('.')}" is not installed.`
          );
        }

        result = method(...args);
      });

      return result;
    },
    get(_target, key) {
      if (typeof key !== 'string') return;

      return createUpdateExtensionPath(update, groupName, [...path, key]);
    },
  });

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
        get(_target, key) {
          if (typeof key !== 'string') return;

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
      get(_target, key) {
        if (typeof key !== 'string') return;

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
    operations: ((...args) =>
      read((state) =>
        state.operations(...args)
      )) as EditorReadMethods<V>['operations'],
    points: createGroup('points'),
    ranges: createGroup('ranges'),
    root: ((...args) =>
      read((state) => state.root(...args))) as EditorReadMethods<V>['root'],
    runtime: createGroup('runtime'),
    schema: createGroup('schema'),
    selection: createCallableGroup('selection'),
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
        get(_groupTarget, methodName) {
          if (typeof methodName !== 'string') return;

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
  runUpdate: RunEditorUpdate<V, TExtensions>
): EditorUpdate<V, TExtensions> => {
  const update = ((
    fn: (
      transaction: EditorUpdateTransaction<V, TExtensions>,
      context: EditorUpdateContext<Editor<V, TExtensions>>
    ) => void,
    options?: EditorUpdateOptions
  ): void => runUpdate(fn, options)) as EditorUpdate<V, TExtensions>;

  const createGroup = <TGroup extends keyof EditorUpdateMethods<V>>(
    groupName: TGroup
  ): EditorUpdateMethods<V>[TGroup] =>
    new Proxy(
      {},
      {
        get(_target, key) {
          if (typeof key !== 'string') return;

          return (...args: unknown[]) => {
            let result: unknown;

            update((tx) => {
              result = (
                tx[groupName] as Record<string, (...args: unknown[]) => unknown>
              )[key]!(...args);
            });

            return result;
          };
        },
      }
    ) as EditorUpdateMethods<V>[TGroup];

  const methods = {
    blocks: createGroup('blocks'),
    break: createGroup('break'),
    fragment: createGroup('fragment'),
    marks: createGroup('marks'),
    nodes: createGroup('nodes'),
    normalize: ((...args) =>
      update((tx) =>
        tx.normalize(...args)
      )) as EditorUpdateMethods<V>['normalize'],
    operations: createGroup('operations'),
    refs: createGroup('refs'),
    roots: createGroup('roots'),
    selection: createGroup('selection'),
    setField: ((...args) =>
      update((tx) =>
        tx.setField(...args)
      )) as EditorUpdateMethods<V>['setField'],
    statePatches: createGroup('statePatches'),
    text: createGroup('text'),
    value: Object.freeze({
      replace: (input, options) =>
        update((tx) => {
          tx.value.replace(input);
        }, toValueReplaceUpdateOptions(options)),
    }) as EditorUpdateMethods<V>['value'],
    withoutNormalizing: ((...args) =>
      update((tx) =>
        tx.withoutNormalizing(...args)
      )) as EditorUpdateMethods<V>['withoutNormalizing'],
  } satisfies EditorUpdateMethods<V>;

  const updateApi = Object.assign(update, methods);

  return new Proxy(updateApi, {
    get(target, groupName, receiver) {
      if (typeof groupName !== 'string') {
        return Reflect.get(target, groupName, receiver);
      }
      if (groupName in target || groupName === 'then') {
        return Reflect.get(target, groupName, receiver);
      }

      return new Proxy(
        {},
        {
          get(_groupTarget, methodName) {
            if (typeof methodName !== 'string') return;

            return createUpdateExtensionPath(update, groupName, [methodName]);
          },
        }
      );
    },
  }) as EditorUpdate<V, TExtensions>;
};
