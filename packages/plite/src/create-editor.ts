import { extendEditor, getFragment } from './core';
import {
  getInstalledEditorExtensionApi,
  prepareInitialEditorExtensionPublication,
  prepareScopedEditorExtensionPublication,
  resolveInstalledEditorExtension,
  setEditorLifecycleErrorSink,
} from './core/editor-extension';
import { createEditorQueryRuntime } from './core/editor-query-runtime';
import {
  createEditorReadApi,
  createEditorUpdateApi,
} from './core/editor-lifecycle-api';
import { createCommandDispatch } from './core/command-registry';
import {
  type InternalEditorExtensionRuntime,
  type InternalEditorRuntime,
  type InternalEditorSnapshotRuntime,
  type InternalEditorTransactionRuntime,
  getEditorSchema,
  setEditorRuntime,
} from './core/editor-runtime';
import { createEditorSchema } from './core/editor-schema';
import { createAnchor } from './core/anchor';
import { hasActiveAnchors } from './core/anchor-state';
import {
  assertSelectionSupported,
  mapSelectionThroughChange,
} from './core/selection-protocol';
import {
  createExtensionRegistry,
  finalizeExtensionRegistry,
  getExtensionRegistry,
  initializeBaseExtensionRegistry,
  registerEffectTypeInRegistry,
} from './core/extension-registry';
import { screenReaderAnnouncementEffect } from './core/screen-reader-announcement';
import {
  getChildren,
  getActiveEditorTransaction,
  getCurrentSelectionRoot,
  getEditorDocumentValue,
  getLastCommit,
  getLiveSelection,
  getPathByRuntimeId,
  getRuntimeId,
  getSnapshot,
  createTransactionSpec,
  initializeEditorSchemaSelection,
  initializeEditorSchemaDocument,
  invalidateEditorTransactionSpecs,
  initializePublicState,
  readEditor,
  repairEditorValue,
  subscribe,
  subscribeCommit,
  subscribeSource,
  updateEditor,
  withEditorRootChildren,
} from './core/public-state';
import {
  assertPublicLocationRoot,
  assertPublicRootKey,
} from './core/public-root';
import type {
  CreateEditorOptions,
  DescendantIn,
  Editor,
  EditorAnchorApi,
  EditorClipboardApi,
  EditorClipboardInsertDataCapability,
  EditorCommit,
  EditorExtension,
  EditorExtensionInput,
  EditorSnapshot,
  EditorTransactionSpecBuilder,
  EditorUpdateContext,
  EditorUpdateTransaction,
  EditorValueFromExtensions,
  SchemaExtensionsOf,
  Value,
} from './interfaces';
import type { InternalEditorUpdateOptions } from './core/update-policy';

let nextEditorId = 0;
const PENDING_SCHEMA_BOOTSTRAP = new WeakSet<Editor>();

type ExtensionsFromOptions<TOptions> = TOptions extends {
  extensions: infer TExtensions extends readonly unknown[];
}
  ? TExtensions
  : readonly [];

type MutableJson<T> = T extends readonly (infer TItem)[]
  ? MutableJson<TItem>[]
  : T extends object
    ? { -readonly [TKey in keyof T]: MutableJson<T[TKey]> }
    : T;

type InitialValueFromOptions<TOptions> = TOptions extends {
  initialValue: infer TInitialValue;
}
  ? MutableJson<
      TInitialValue extends { children: infer TChildren }
        ? TChildren
        : TInitialValue
    > extends infer V extends Value
    ? V
    : Value
  : Value;

type ValueFromOptions<TOptions> = [
  SchemaExtensionsOf<ExtensionsFromOptions<TOptions>>,
] extends [never]
  ? InitialValueFromOptions<TOptions>
  : EditorValueFromExtensions<ExtensionsFromOptions<TOptions>>;

const createEditorId = () => `plite-editor-${++nextEditorId}`;

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

export const createInternalClipboardApi = (
  getEditor: () => Editor,
  getFallback?: () => ((data: DataTransfer) => boolean) | undefined
): EditorClipboardApi =>
  Object.freeze({
    insertData(dataTransfer) {
      const editor = getEditor();
      const handlers = (getExtensionRegistry(editor).capabilities.get(
        'clipboard.insertData'
      ) ?? []) as EditorClipboardInsertDataCapability[];

      const dispatch = (
        index: number,
        data: DataTransfer,
        tx: EditorUpdateTransaction
      ): boolean => {
        const handler = handlers[index];

        if (!handler) return getFallback?.()?.(data) === true;

        return (
          handler(editor, data, tx, (nextData = data) =>
            dispatch(index - 1, nextData, tx)
          ) === true
        );
      };

      const activeTx = getActiveEditorTransaction(editor);

      if (activeTx) {
        activeTx.tags.add('paste');

        return dispatch(handlers.length - 1, dataTransfer, activeTx);
      }

      let handled = false;

      updateEditor(
        editor,
        (tx) => {
          handled = dispatch(handlers.length - 1, dataTransfer, tx);
        },
        { tags: ['paste'] }
      );

      return handled;
    },
  });

const publishInitialEditorExtensions = <TEditor extends Editor>(
  editor: TEditor,
  input: EditorExtensionInput<TEditor>,
  explicitInitialDocument: boolean,
  initialize?: (
    transaction: EditorTransactionSpecBuilder<
      TEditor extends Editor<infer V> ? V : Value
    >
  ) => void
) => {
  if (hasActiveAnchors(editor)) {
    throw new Error(
      'Editor schema initialization requires an editor without active anchors.'
    );
  }
  const publication = prepareInitialEditorExtensionPublication(
    editor,
    input,
    !explicitInitialDocument
  );
  const initialDocument = getEditorDocumentValue(editor);
  const initialSelection = getLiveSelection(editor);
  const initialSelectionRoot = getCurrentSelectionRoot(editor);

  try {
    publication.stage();
    publication.commit();
    if (!publication.documentChange.empty) {
      const fittedDocument = publication.documentChange.apply(
        initialDocument
      ) as ReturnType<typeof getEditorDocumentValue>;

      initializeEditorSchemaDocument(editor, fittedDocument);
      if (initialSelection) {
        const mapped = mapSelectionThroughChange(
          editor,
          initialSelection,
          publication.documentChange,
          initialDocument,
          fittedDocument,
          initialSelectionRoot,
          { association: 'backward', preferPositionMapping: true }
        );

        if (!mapped) {
          throw new Error(
            'Initial selection cannot be mapped through schema fitting.'
          );
        }
        initializeEditorSchemaSelection(editor, mapped, initialSelectionRoot);
      }
    }
    const validatePublishedDocument = () => {
      const publishedDocument = getEditorDocumentValue(editor);

      if (explicitInitialDocument && publishedDocument.children.length === 0) {
        throw new Error(
          '[Plite] initialValue is invalid! Expected at least one element.'
        );
      }

      assertSelectionSupported(
        editor,
        getLiveSelection(editor),
        publishedDocument
      );
      if (publication.configurationChanged) {
        publication.validateDocument(publishedDocument);
      } else {
        getEditorSchema(editor).validateDocument(publishedDocument);
      }
    };

    validatePublishedDocument();

    if (initialize) {
      const spec = createTransactionSpec(editor, initialize as never);

      if (
        spec.effects.length > 0 ||
        spec.annotations.length > 0 ||
        spec.tags.length > 0
      ) {
        throw new Error(
          'Editor schema initialization cannot publish effects, annotations, or tags.'
        );
      }
      const initializedDocument = spec.changes.apply(
        getEditorDocumentValue(editor)
      );

      initializeEditorSchemaDocument(editor, initializedDocument);
      if (spec.selection) {
        initializeEditorSchemaSelection(
          editor,
          spec.selection.value,
          spec.selection.root ?? 'main'
        );
      }
      validatePublishedDocument();
    }
    publication.finalize();
    invalidateEditorTransactionSpecs(editor);
  } catch (error) {
    publication.rollback();
    initializeEditorSchemaDocument(editor, initialDocument);
    initializeEditorSchemaSelection(
      editor,
      initialSelection,
      initialSelectionRoot
    );
    throw error;
  }
  publication.ready();

  if (getExtensionRegistry(editor).schemaContributions.records.size > 0) {
    PENDING_SCHEMA_BOOTSTRAP.delete(editor);
  }
};

/** @internal Replace the derived base schema on one unchanged raw editor. */
export const initializeEditorExtensions = <TEditor extends Editor>(
  editor: TEditor,
  input: EditorExtensionInput<TEditor>,
  options: Readonly<{
    initialize?: (
      transaction: EditorTransactionSpecBuilder<
        TEditor extends Editor<infer V> ? V : Value
      >
    ) => void;
  }> = {}
) => {
  if (!PENDING_SCHEMA_BOOTSTRAP.has(editor)) {
    throw new Error(
      'Editor schema initialization requires an editor without an installed schema.'
    );
  }
  if (getExtensionRegistry(editor).schemaContributions.records.size > 0) {
    PENDING_SCHEMA_BOOTSTRAP.delete(editor);
    throw new Error('Editor schema is already initialized.');
  }
  const lastCommit = getLastCommit(editor);
  const document = getEditorDocumentValue(editor);
  const hasDocument =
    document.children.length > 0 ||
    Object.values(document.roots ?? {}).some((children) => children.length > 0);

  if (lastCommit && !lastCommit.changes.empty) {
    PENDING_SCHEMA_BOOTSTRAP.delete(editor);
    throw new Error(
      'Editor schema initialization requires an unchanged document.'
    );
  }

  publishInitialEditorExtensions(
    editor,
    input,
    hasDocument,
    options.initialize
  );
};

/**
 * Create a mutable Plite editor with schema, command, query, state, and
 * extension runtime APIs installed.
 */
export function createEditor<
  const TOptions extends CreateEditorOptions<any, readonly unknown[]> & {
    extensions: readonly unknown[];
  },
>(
  options: TOptions
): Editor<ValueFromOptions<TOptions>, ExtensionsFromOptions<TOptions>>;

export function createEditor<
  V extends Value,
  const TExtensions extends readonly unknown[],
>(
  options: CreateEditorOptions<V, TExtensions> & {
    extensions: TExtensions;
  }
): Editor<V, TExtensions>;

export function createEditor<V extends Value = Value>(
  options?: Omit<CreateEditorOptions<V, readonly []>, 'extensions'> & {
    extensions?: never;
  }
): Editor<V, readonly []>;

export function createEditor<
  V extends Value = Value,
  const TExtensions extends readonly unknown[] = readonly [],
>(options: CreateEditorOptions<V, TExtensions> = {}): Editor<V, TExtensions> {
  return createEditorImplementation(options);
}

/** @internal Generic construction entrypoint for typed runtime wrappers. */
export const createEditorUnchecked = <
  V extends Value = Value,
  const TExtensions extends readonly unknown[] = readonly [],
>(
  options: CreateEditorOptions<V, TExtensions> = {}
): Editor<V, TExtensions> => createEditorImplementation(options);

const createEditorImplementation = <
  V extends Value,
  const TExtensions extends readonly unknown[],
>(
  options: CreateEditorOptions<V, TExtensions>
): Editor<V, TExtensions> => {
  let editor!: Editor<V, TExtensions>;
  const runtimeEditor = () => editor;
  const schema = createEditorSchema(runtimeEditor);

  const extensionRuntime = {
    schema,
    extend: (extension, extensionOptions) =>
      extendEditor(editor, extension, extensionOptions),
    prepareExtensionPublication: (entries, publicationOptions) =>
      prepareScopedEditorExtensionPublication(
        editor,
        entries,
        publicationOptions
      ),
  } satisfies InternalEditorExtensionRuntime<V>;

  const snapshotRuntime = {
    getChildren: () => getChildren(editor),
    getFragment: () => getFragment(editor) as DescendantIn<V>[],
    getLastCommit: () => getLastCommit(editor) as EditorCommit<V> | null,
    getPathByRuntimeId: (runtimeId) => getPathByRuntimeId(editor, runtimeId),
    getRuntimeId: (path) => getRuntimeId(editor, path),
    getSelection: () => getLiveSelection(editor),
    getSnapshot: () => getSnapshot(editor) as EditorSnapshot<V>,
  } satisfies InternalEditorSnapshotRuntime<V>;

  const transactionRuntime = {
    read: (fn) => readEditor(editor, fn),
    runCommand: createCommandDispatch(() => editor),
    subscribe: (listener) => subscribe(editor, listener),
    subscribeCommit: (listener) => subscribeCommit(editor, listener),
    subscribeSource: (source, listener) =>
      subscribeSource(editor, source, listener),
    update: (
      fn: (
        transaction: EditorUpdateTransaction<V>,
        context: EditorUpdateContext<Editor<V>>
      ) => void,
      options?: InternalEditorUpdateOptions
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

  const createResolvedClipboardApi = () => {
    const capabilities =
      getExtensionRegistry(editor as Editor).capabilities.get('clipboard') ??
      [];
    const resolved = resolveApiCapability(capabilities);
    const capability = isMergeableApiCapability(resolved) ? resolved : {};
    const insertFragmentData = capability.insertFragmentData;
    const insertTextData = capability.insertTextData;
    const fallbackInsertData =
      typeof capability.insertData === 'function'
        ? (capability.insertData as (data: DataTransfer) => boolean).bind(
            capability
          )
        : typeof insertFragmentData === 'function' &&
            typeof insertTextData === 'function'
          ? (data: DataTransfer) =>
              (insertFragmentData as (data: DataTransfer) => boolean).call(
                capability,
                data
              ) ||
              (insertTextData as (data: DataTransfer) => boolean).call(
                capability,
                data
              )
          : undefined;

    return Object.freeze({
      ...capability,
      insertData: createInternalClipboardApi(
        () => editor as Editor,
        () => fallbackInsertData
      ).insertData,
    });
  };
  const anchorApi: EditorAnchorApi = (value, anchorOptions) => {
    assertPublicLocationRoot(value);
    assertPublicRootKey(anchorOptions.root);

    return createAnchor(editor, value, anchorOptions);
  };
  const api = new Proxy(Object.create(null) as Record<string, unknown>, {
    get(_target, property) {
      if (typeof property !== 'string') {
        return;
      }
      if (property === 'clipboard') {
        return createResolvedClipboardApi();
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
    const installedExtension = resolveInstalledEditorExtension(
      editor as Editor,
      extension
    );

    if (!installedExtension) {
      throw new Error(
        `Editor extension "${extension.name}" is not installed on this editor.`
      );
    }

    const apiNames = Object.keys(
      getInstalledEditorExtensionApi(
        editor as Editor,
        installedExtension.name
      ) ?? {}
    );
    const installedName = installedExtension.name;
    const capabilityName = apiNames.includes(installedName)
      ? installedName
      : (apiNames[0] ?? installedName);

    if (apiNames.length > 1 && !apiNames.includes(installedName)) {
      throw new Error(
        `Editor extension "${installedName}" must expose exactly one capability or a capability matching its extension name to be used with editor.getApi().`
      );
    }

    const capability = api[capabilityName as keyof typeof api];

    if (capability === undefined) {
      throw new Error(
        `Editor extension "${installedName}" capability "${capabilityName}" is not installed.`
      );
    }

    return capability;
  };

  const read = createEditorReadApi<V, TExtensions>((fn) =>
    withEditorRootChildren(editor, 'main', () => readEditor(editor, fn))
  );
  const update = createEditorUpdateApi<V, TExtensions>(
    (fn, policy) =>
      updateEditor(
        editor,
        fn as (
          transaction: EditorUpdateTransaction<V>,
          context: EditorUpdateContext<Editor<V>>
        ) => void,
        { tags: policy.tags }
      ),
    {
      hasTxGroup: (groupName) =>
        getExtensionRegistry(editor).txGroups.has(groupName),
      repairValue: () =>
        updateEditor(editor, () => repairEditorValue(editor), {
          tags: ['history-skip'],
        }),
    }
  );

  const baseEditor: Editor<V, TExtensions> = {
    api,
    anchor: anchorApi,
    id: options.id ?? createEditorId(),
    getApi: getApi as Editor<V, TExtensions>['getApi'],
    read,
    subscribe: (listener) => subscribe(editor, listener),
    subscribeCommit: (listener) => subscribeCommit(editor, listener),
    update,
    extend: (extension, extensionOptions) =>
      extendEditor(editor, extension, extensionOptions),
  };

  editor = baseEditor;
  setEditorLifecycleErrorSink(editor, options.lifecycleErrorSink);

  const queryRuntime = createEditorQueryRuntime(editor);

  const runtime = {
    ...extensionRuntime,
    ...queryRuntime,
    ...snapshotRuntime,
    ...transactionRuntime,
  } satisfies InternalEditorRuntime<V>;

  setEditorRuntime(editor, runtime);

  const baseRegistry = createExtensionRegistry();

  registerEffectTypeInRegistry(
    baseRegistry,
    'plite:screen-reader-announcement',
    screenReaderAnnouncementEffect
  );
  initializeBaseExtensionRegistry(
    editor,
    finalizeExtensionRegistry(baseRegistry)
  );
  const initialState = initializePublicState(editor, options);

  PENDING_SCHEMA_BOOTSTRAP.add(editor);

  if (options.extensions) {
    publishInitialEditorExtensions(
      editor as Editor,
      options.extensions as EditorExtensionInput,
      initialState.explicit
    );
  } else {
    const initialDocument = getEditorDocumentValue(editor);

    if (initialState.explicit && initialDocument.children.length === 0) {
      throw new Error(
        '[Plite] initialValue is invalid! Expected at least one element.'
      );
    }
    assertSelectionSupported(editor, getLiveSelection(editor), initialDocument);
    schema.validateDocument(initialDocument);
  }

  return editor;
};
