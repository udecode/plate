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

  const methods = {
    fragment: createGroup('fragment'),
    getField: ((...args) =>
      read((state) =>
        state.getField(...args)
      )) as EditorReadMethods<V>['getField'],
    marks: createGroup('marks'),
    nodes: createGroup('nodes'),
    points: createGroup('points'),
    ranges: createGroup('ranges'),
    runtime: createGroup('runtime'),
    schema: createGroup('schema'),
    selection: createGroup('selection'),
    text: createGroup('text'),
    value: createGroup('value'),
    view: createGroup('view'),
  } satisfies EditorReadMethods<V>;

  return Object.assign(read, methods);
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

          return (...args: unknown[]) =>
            update((tx) =>
              (tx[groupName] as Record<string, (...args: unknown[]) => void>)[
                key
              ]!(...args)
            );
        },
      }
    ) as EditorUpdateMethods<V>[TGroup];

  const methods = {
    break: createGroup('break'),
    fragment: createGroup('fragment'),
    marks: createGroup('marks'),
    nodes: createGroup('nodes'),
    normalize: ((...args) =>
      update((tx) =>
        tx.normalize(...args)
      )) as EditorUpdateMethods<V>['normalize'],
    operations: createGroup('operations'),
    roots: createGroup('roots'),
    selection: createGroup('selection'),
    setField: ((...args) =>
      update((tx) =>
        tx.setField(...args)
      )) as EditorUpdateMethods<V>['setField'],
    statePatches: createGroup('statePatches'),
    text: createGroup('text'),
    value: createGroup('value'),
    withoutNormalizing: ((...args) =>
      update((tx) =>
        tx.withoutNormalizing(...args)
      )) as EditorUpdateMethods<V>['withoutNormalizing'],
  } satisfies EditorUpdateMethods<V>;

  return Object.assign(update, methods);
};
