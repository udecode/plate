import {
  apply,
  extendEditor,
  getDirtyPaths,
  getFragment,
  isEditorExtensionInstalled,
  normalizeNode,
  shouldNormalize,
} from './core';
import { createEditorQueryRuntime } from './core/editor-query-runtime';
import {
  type InternalEditorExtensionRuntime,
  type InternalEditorRefRuntime,
  type InternalEditorRuntime,
  type InternalEditorSnapshotRuntime,
  type InternalEditorTransactionRuntime,
  type InternalEditorTransformRuntime,
  setEditorRuntime,
} from './core/editor-runtime';
import { createEditorSchema } from './core/editor-schema';
import {
  bindEditorMethod,
  createEditorTransformRegistry,
  type EditorMethod,
} from './core/editor-transform-runtime';
import { getExtensionRegistry } from './core/extension-registry';
import {
  getChildren,
  getLastCommit,
  getLiveSelection,
  getOperationDirtiness,
  getOperations,
  getPathByRuntimeId,
  getRuntimeId,
  getSnapshot,
  initializePublicState,
  readEditor,
  setBaseApply,
  subscribe,
  subscribeCommit,
  subscribeSource,
  updateEditor,
} from './core/public-state';
import { setEditorTransformRegistry } from './core/transform-registry';
import {
  pathRef,
  pathRefs,
  pointRef,
  pointRefs,
  rangeRef,
  rangeRefs,
} from './editor';
import type {
  CreateEditorOptions,
  DescendantIn,
  Editor,
  EditorCommit,
  EditorExtension,
  EditorExtensionInput,
  EditorSnapshot,
  EditorUpdateContext,
  EditorUpdateOptions,
  EditorUpdateTransaction,
  Operation,
  Value,
} from './interfaces';

const isMergeableApiCapability = (
  capability: unknown
): capability is Record<PropertyKey, unknown> =>
  typeof capability === 'object' &&
  capability !== null &&
  !Array.isArray(capability);

const resolveApiCapability = (capabilities: unknown[]) => {
  if (capabilities.length === 1) {
    return capabilities[0];
  }

  if (capabilities.every(isMergeableApiCapability)) {
    return Object.freeze(Object.assign({}, ...capabilities));
  }

  return capabilities.at(-1);
};

/**
 * Create a mutable Plite editor with schema, command, query, state, and
 * extension runtime APIs installed.
 */
export function createEditor<
  V extends Value = Value,
  const TExtensions extends readonly unknown[] = readonly [],
>(options?: CreateEditorOptions<V, TExtensions>): Editor<V, TExtensions>;

export function createEditor<
  V extends Value = Value,
  const TExtensions extends readonly unknown[] = readonly [],
>(options: CreateEditorOptions<V, TExtensions> = {}): Editor<V, TExtensions> {
  let editor!: Editor<V, TExtensions>;
  const runtimeEditor = () => editor as Editor;
  const bind = <T extends EditorMethod>(method: T) =>
    bindEditorMethod(runtimeEditor, method);
  const schema = createEditorSchema(runtimeEditor);

  const extensionRuntime = {
    schema,
    extend: (extension) => extendEditor(editor, extension),
  } satisfies InternalEditorExtensionRuntime<V>;

  const snapshotRuntime = {
    getChildren: () => getChildren(editor),
    getDirtyPaths: (operation) => getDirtyPaths(editor, operation),
    getFragment: () => getFragment(editor) as DescendantIn<V>[],
    getLastCommit: () => getLastCommit(editor) as EditorCommit<V> | null,
    getOperationDirtiness: (operations, options) =>
      getOperationDirtiness(editor, operations, options) as EditorCommit<V>,
    getOperations: (startIndex) =>
      getOperations(editor, startIndex) as readonly Operation<V>[],
    getPathByRuntimeId: (runtimeId) => getPathByRuntimeId(editor, runtimeId),
    getRuntimeId: (path) => getRuntimeId(editor, path),
    getSelection: () => getLiveSelection(editor),
    getSnapshot: () => getSnapshot(editor) as EditorSnapshot<V>,
  } satisfies InternalEditorSnapshotRuntime<V>;

  const transactionRuntime = {
    read: (fn) => readEditor(editor, fn),
    subscribe: (listener) => subscribe(editor, listener),
    subscribeCommit: (listener) => subscribeCommit(editor, listener),
    subscribeSource: (source, listener) =>
      subscribeSource(editor, source, listener),
    update: (
      fn: (
        transaction: EditorUpdateTransaction<V>,
        context: EditorUpdateContext<Editor<V>>
      ) => void,
      options?: EditorUpdateOptions
    ) =>
      updateEditor(
        editor,
        fn as (
          transaction: EditorUpdateTransaction<V>,
          context: EditorUpdateContext<Editor<V>>
        ) => void,
        options
      ),
  } satisfies InternalEditorTransactionRuntime<V>;

  const transformRuntime = {
    normalizeNode: (entry, options) => normalizeNode(editor, entry, options),
    shouldNormalize: (options) => shouldNormalize(editor, options),
  } satisfies InternalEditorTransformRuntime<V>;

  const api = new Proxy(Object.create(null) as Record<string, unknown>, {
    get(_target, property) {
      if (typeof property !== 'string') {
        return;
      }

      const capabilities = getExtensionRegistry(
        editor as Editor
      ).capabilities.get(property);

      if (!capabilities || capabilities.length === 0) {
        return;
      }

      return resolveApiCapability(capabilities);
    },
  }) as Editor<V, TExtensions>['api'];

  const getApi = (extension: EditorExtension<any, any>) => {
    if (!isEditorExtensionInstalled(editor as Editor, extension)) {
      throw new Error(
        `Editor extension "${extension.name}" is not installed on this editor.`
      );
    }

    const apiNames = Object.keys(extension.api ?? {});
    const capabilityName = apiNames.includes(extension.name)
      ? extension.name
      : (apiNames[0] ?? extension.name);

    if (apiNames.length > 1 && !apiNames.includes(extension.name)) {
      throw new Error(
        `Editor extension "${extension.name}" must expose exactly one capability or a capability matching its extension name to be used with editor.getApi().`
      );
    }

    const capability = api[capabilityName as keyof typeof api];

    if (capability === undefined) {
      throw new Error(
        `Editor extension "${extension.name}" capability "${capabilityName}" is not installed.`
      );
    }

    return capability;
  };

  const baseEditor: Editor<V, TExtensions> = {
    api,
    getApi: getApi as Editor<V, TExtensions>['getApi'],
    read: (fn) => readEditor(editor, fn),
    subscribe: (listener) => subscribe(editor, listener),
    subscribeCommit: (listener) => subscribeCommit(editor, listener),
    update: (
      fn: (
        transaction: EditorUpdateTransaction<V, TExtensions>,
        context: EditorUpdateContext<Editor<V, TExtensions>>
      ) => void,
      options
    ) =>
      updateEditor(
        editor,
        fn as (
          transaction: EditorUpdateTransaction<V>,
          context: EditorUpdateContext<Editor<V>>
        ) => void,
        options
      ),
    extend: (extension) => extendEditor(editor, extension),
  };

  editor = baseEditor;

  const queryRuntime = createEditorQueryRuntime(editor);

  const refRuntime = {
    pathRef: bind(pathRef),
    pathRefs: bind(pathRefs),
    pointRef: bind(pointRef),
    pointRefs: bind(pointRefs),
    rangeRef: bind(rangeRef),
    rangeRefs: bind(rangeRefs),
  } satisfies InternalEditorRefRuntime;

  const runtime = {
    ...extensionRuntime,
    ...queryRuntime,
    ...refRuntime,
    ...snapshotRuntime,
    ...transactionRuntime,
    ...transformRuntime,
  } satisfies InternalEditorRuntime<V>;

  setEditorRuntime(editor, runtime);

  setEditorTransformRegistry(
    editor,
    createEditorTransformRegistry(runtimeEditor)
  );
  setBaseApply(editor, (...args) => apply(editor, ...args));

  initializePublicState(editor, options);

  if (options.extensions) {
    extendEditor(editor as Editor, options.extensions as EditorExtensionInput);
  }

  return editor;
}
