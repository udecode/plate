import { extendEditor, getFragment } from './core';
import { createEditorAnchorApi } from './core/anchor';
import { hasActiveAnchors } from './core/anchor-state';
import {
  authoredDocumentCapabilityPoint,
  type NativeAuthoredDocumentCapability,
} from './core/authored-document-capability';
import { initializeAuthoredDocument } from './core/authored-runtime';
import { createCommandDispatch } from './core/command-registry';
import {
  createEditorReadApi,
  createEditorUpdateApi,
} from './core/editor-lifecycle-api';
import { createEditorReadRuntime } from './core/editor-read-runtime';
import {
  type InternalPluginPublicationEntry,
  type InternalPluginRuntime,
  type InternalEditorRuntime,
  type InternalEditorSnapshotRuntime,
  type InternalEditorTransactionRuntime,
  getEditorSchema,
  setEditorRuntime,
} from './core/editor-runtime';
import {
  createEditorSchema,
  type InternalEditorSchemaApi,
} from './core/editor-schema';
import {
  createEditorViewPluginApis,
  prepareInitialPluginPublication,
  prepareScopedPluginPublication,
  setEditorLifecycleErrorSink,
} from './core/plugin';
import {
  assertPluginPublicationInactive,
  createPluginRegistry,
  finalizePluginRegistry,
  getPluginRegistry,
  initializeBasePluginRegistry,
  registerEffectTypeInRegistry,
} from './core/plugin-registry';
import { MAIN_ROOT_KEY } from './core/public-root';
import {
  getChildren,
  getCurrentSelectionRoot,
  getEditorDocumentValue,
  getLastCommit,
  getLiveSelection,
  getPathByNodeKey,
  getNodeKey,
  getSnapshot,
  createTransactionSpec,
  applyTransactionSpecToDocument,
  initializeEditorSchemaSelection,
  initializeEditorSchemaDocument,
  initializeEditorSchemaSnapshot,
  invalidateEditorTransactionSpecs,
  initializePublicState,
  readEditor,
  repairEditorValue,
  snapshotInitialDocumentState,
  subscribe,
  subscribeCommit,
  subscribeSource,
  transformEditorSnapshotInput,
  updateEditor,
  withEditorRootChildren,
} from './core/public-state';
import type {
  CompiledEditorSchema,
  EditorSchemaContract,
} from './core/schema-compiler';
import { screenReaderAnnouncementEffect } from './core/screen-reader-announcement';
import {
  assertSelectionSupported,
  mapSelectionThroughChange,
} from './core/selection-protocol';
import type { InternalEditorUpdateOptions } from './core/update-policy';
import type {
  AnyEditor,
  CreateEditorOptions,
  DescendantIn,
  Descendant,
  Editor,
  EditorKeyApi,
  EditorCommit,
  PluginInput,
  EditorSnapshot,
  EditorStateField,
  EditorTransactionSpecBuilder,
  EditorUpdateContext,
  EditorUpdateTransaction,
  EditorValueFromPlugins,
  PluginsOf,
  SchemaPluginsOf,
  Location,
  SnapshotInput,
  ValueOf,
  Value,
} from './interfaces';

let nextEditorId = 0;
const PENDING_SCHEMA_BOOTSTRAP = new WeakSet<AnyEditor>();
const SCHEMA_BOOTSTRAP_DOCUMENT_CHANGED = new WeakSet<AnyEditor>();
const SCHEMA_BOOTSTRAP_CLEANUPS = new WeakMap<AnyEditor, () => void>();

const disarmSchemaBootstrap = (editor: AnyEditor) => {
  PENDING_SCHEMA_BOOTSTRAP.delete(editor);
  SCHEMA_BOOTSTRAP_DOCUMENT_CHANGED.delete(editor);
  SCHEMA_BOOTSTRAP_CLEANUPS.get(editor)?.();
  SCHEMA_BOOTSTRAP_CLEANUPS.delete(editor);
};

const armSchemaBootstrap = (editor: AnyEditor) => {
  PENDING_SCHEMA_BOOTSTRAP.add(editor);
  const cleanup = subscribeCommit(editor, (commit) => {
    if (commit.changes.empty) return;

    SCHEMA_BOOTSTRAP_DOCUMENT_CHANGED.add(editor);
    cleanup();
    SCHEMA_BOOTSTRAP_CLEANUPS.delete(editor);
  });

  SCHEMA_BOOTSTRAP_CLEANUPS.set(editor, cleanup);
};

/** Plugin tuple inferred from a `createEditor` options object. */
export type PluginsFromOptions<TOptions> = TOptions extends {
  plugins: infer TPlugins extends readonly unknown[];
}
  ? TPlugins
  : readonly [];

type ReadonlyJson<T> = T extends (...args: any[]) => unknown
  ? T
  : T extends string
    ? string
    : T extends number
      ? number
      : T extends boolean
        ? boolean
        : T extends ReadonlyArray<infer TItem>
          ? ReadonlyArray<ReadonlyJson<TItem>>
          : T extends object
            ? { readonly [TKey in keyof T]: ReadonlyJson<T[TKey]> }
            : T;

type InitialValueFromOptions<TOptions> = TOptions extends {
  initialValue: infer TInitialValue;
}
  ? (
      TInitialValue extends { children: infer TChildren }
        ? TChildren
        : TInitialValue
    ) extends infer TChildren
    ? TChildren extends unknown[]
      ? TChildren extends Value
        ? TChildren
        : Value
      : ReadonlyJson<TChildren> extends infer V extends Value
        ? V
        : Value
    : Value
  : Value;

/** Editor value inferred from installed schema or initial data. */
export type EditorValueFromOptions<TOptions> = [
  SchemaPluginsOf<PluginsFromOptions<TOptions>>,
] extends [never]
  ? InitialValueFromOptions<TOptions>
  : EditorValueFromPlugins<PluginsFromOptions<TOptions>>;

const createEditorId = () => `plite-editor-${(nextEditorId += 1)}`;

const publishInitialPlugins = <TEditor extends AnyEditor>(
  editor: TEditor,
  input: PluginInput | readonly InternalPluginPublicationEntry[],
  explicitInitialDocument: boolean,
  options: Readonly<{
    initialize?: (
      transaction: EditorTransactionSpecBuilder<
        ValueOf<TEditor>,
        PluginsOf<TEditor>
      >
    ) => void;
    initialValue?: () => SnapshotInput<ValueOf<TEditor>>;
  }> = {},
  compiledEntries = false
) => {
  if (hasActiveAnchors(editor)) {
    throw new Error(
      'Editor schema initialization requires an editor without active anchors.'
    );
  }
  const publication = compiledEntries
    ? prepareScopedPluginPublication(
        editor,
        input as readonly InternalPluginPublicationEntry[],
        {
          initialPublication: true,
          initializeDocument: !explicitInitialDocument,
        }
      )
    : prepareInitialPluginPublication(
        editor,
        input as PluginInput,
        !explicitInitialDocument
      );
  const initialDocument = getEditorDocumentValue(editor);
  const initialSelection = getLiveSelection(editor);
  const initialSelectionRoot = getCurrentSelectionRoot(editor);
  const preparedDocumentValidated =
    publication.configurationChanged &&
    explicitInitialDocument &&
    publication.documentChange.empty;

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
    const validatePublishedDocument = (
      requireExplicitDocument = explicitInitialDocument,
      validateDocument = true
    ) => {
      const publishedDocument = getEditorDocumentValue(editor);

      if (requireExplicitDocument && publishedDocument.children.length === 0) {
        throw new Error(
          '[Plite] initialValue is invalid! Expected at least one element.'
        );
      }

      assertSelectionSupported(
        editor,
        getLiveSelection(editor),
        publishedDocument
      );
      if (validateDocument && publication.configurationChanged) {
        publication.validateDocument(publishedDocument);
      } else if (validateDocument) {
        const schema: InternalEditorSchemaApi = getEditorSchema(editor);

        schema.assertDocument(publishedDocument);
      }
    };

    validatePublishedDocument(
      explicitInitialDocument,
      !preparedDocumentValidated
    );

    if (options.initialValue) {
      initializeEditorSchemaSnapshot(
        editor,
        transformEditorSnapshotInput(editor, options.initialValue())
      );
      validatePublishedDocument(true);
    }

    if (options.initialize) {
      const spec = createTransactionSpec(editor, options.initialize as never);

      if (
        spec.effects.length > 0 ||
        spec.annotations.length > 0 ||
        spec.tags.length > 0
      ) {
        throw new Error(
          'Editor schema initialization cannot publish effects, annotations, or tags.'
        );
      }
      const initializedDocument = applyTransactionSpecToDocument(
        editor,
        spec,
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
      validatePublishedDocument(
        explicitInitialDocument || !!options.initialValue
      );
    }
    initializeAuthoredDocument(editor);
    publication.beforePublish();
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
  publication.afterPublish();

  if (getPluginRegistry(editor).schemaContributions.records.size > 0) {
    disarmSchemaBootstrap(editor);
  }
};

const assertEditorSchemaBootstrap = (editor: AnyEditor) => {
  if (!PENDING_SCHEMA_BOOTSTRAP.has(editor)) {
    throw new Error(
      'Editor schema initialization requires an editor without an installed schema.'
    );
  }
  if (getPluginRegistry(editor).schemaContributions.records.size > 0) {
    disarmSchemaBootstrap(editor);
    throw new Error('Editor schema is already initialized.');
  }
  const document = getEditorDocumentValue(editor);
  const hasDocument =
    document.children.length > 0 ||
    Object.values(document.roots ?? {}).some((children) => children.length > 0);

  if (SCHEMA_BOOTSTRAP_DOCUMENT_CHANGED.has(editor)) {
    disarmSchemaBootstrap(editor);
    throw new Error(
      'Editor schema initialization requires an unchanged document.'
    );
  }

  return hasDocument;
};

/**
 * Compile plugins against one unchanged raw editor without publishing them.
 * API factories and schema validators run; document defaults and activation do not.
 */
export const compileEditorSchemaContract = (
  editor: AnyEditor,
  input: PluginInput
) => {
  assertPluginPublicationInactive(editor);
  const hasDocument = assertEditorSchemaBootstrap(editor);

  if (hasDocument || hasActiveAnchors(editor)) {
    throw new Error(
      'Editor schema compilation requires an empty editor without active anchors.'
    );
  }
  const publication = prepareInitialPluginPublication(
    editor,
    input,
    'schema-contract'
  );

  try {
    return publication.schemaContract();
  } finally {
    publication.rollback();
  }
};

/** Compile owner-provided plugin entries without publishing them. @internal */
export const compileEditorSchemaContractEntries = (
  editor: AnyEditor,
  entries: readonly InternalPluginPublicationEntry[]
) => {
  assertPluginPublicationInactive(editor);
  const hasDocument = assertEditorSchemaBootstrap(editor);

  if (hasDocument || hasActiveAnchors(editor)) {
    throw new Error(
      'Editor schema compilation requires an empty editor without active anchors.'
    );
  }
  const publication = prepareScopedPluginPublication(editor, entries, {
    initialPublication: true,
    validateDocument: false,
  });

  try {
    return publication.schemaContract();
  } finally {
    publication.rollback();
  }
};

/** Compile immutable schema and persistent-field authority without publishing it. @internal */
export const compileEditorSchemaCapabilityEntries = (
  editor: AnyEditor,
  entries: readonly InternalPluginPublicationEntry[]
): Readonly<{
  authored?: NativeAuthoredDocumentCapability;
  contract: EditorSchemaContract;
  fields: ReadonlyArray<EditorStateField<any>>;
  schema: CompiledEditorSchema;
}> => {
  assertPluginPublicationInactive(editor);
  const hasDocument = assertEditorSchemaBootstrap(editor);

  if (hasDocument || hasActiveAnchors(editor)) {
    throw new Error(
      'Editor schema compilation requires an empty editor without active anchors.'
    );
  }
  const publication = prepareScopedPluginPublication(editor, entries, {
    initialPublication: true,
    validateDocument: false,
  });

  try {
    const compilation = publication.schemaCompilation();
    const authored = compilation.contributions(authoredDocumentCapabilityPoint);

    if (authored.length > 1) {
      throw new Error(
        'Editor schema compilation received multiple authored document capabilities.'
      );
    }
    const ownsAuthored = compilation.fields.some(
      ({ key }) => key === 'authored'
    );
    if (ownsAuthored !== (authored.length === 1)) {
      throw new Error(
        'The authored state field and document capability must be installed together.'
      );
    }

    return Object.freeze({
      ...(authored[0] ? { authored: authored[0] } : {}),
      contract: publication.schemaContract(),
      fields: compilation.fields,
      schema: compilation.schema,
    });
  } finally {
    publication.rollback();
  }
};

/** Replace the derived base schema on one unchanged raw editor. @internal */
export const initializePlugins = <TEditor extends AnyEditor>(
  editor: TEditor,
  input: PluginInput,
  options: Readonly<{
    initialize?: (
      transaction: EditorTransactionSpecBuilder<
        ValueOf<TEditor>,
        PluginsOf<TEditor>
      >
    ) => void;
    /** Resolve one post-publication initial value for direct schema adoption. */
    initialValue?: () => SnapshotInput<ValueOf<TEditor>>;
  }> = {}
) => {
  publishInitialPlugins(
    editor,
    input,
    assertEditorSchemaBootstrap(editor),
    options
  );
};

/** Publish owner-compiled plugin entries against one unchanged editor. @internal */
export const initializePluginEntries = <TEditor extends AnyEditor>(
  editor: TEditor,
  entries: readonly InternalPluginPublicationEntry[],
  options: Readonly<{
    initialize?: (
      transaction: EditorTransactionSpecBuilder<
        ValueOf<TEditor>,
        PluginsOf<TEditor>
      >
    ) => void;
    initialValue?: () => SnapshotInput<ValueOf<TEditor>>;
  }> = {}
) => {
  publishInitialPlugins(
    editor,
    entries,
    assertEditorSchemaBootstrap(editor),
    options,
    true
  );
};

/**
 * Create a mutable Plite editor with schema, command, query, state, and
 * plugin runtime APIs installed.
 */
export function createEditor<
  const TOptions extends CreateEditorOptions<any, readonly unknown[]> & {
    plugins: readonly unknown[];
  },
>(
  options: TOptions
): Editor<EditorValueFromOptions<TOptions>, PluginsFromOptions<TOptions>>;

export function createEditor<
  V extends Value,
  const TPlugins extends readonly unknown[],
>(
  options: CreateEditorOptions<V, TPlugins> & {
    plugins: TPlugins;
  }
): Editor<V, TPlugins>;

export function createEditor<
  const TOptions extends Omit<CreateEditorOptions<any>, 'plugins'> & {
    plugins?: never;
  },
>(options: TOptions): Editor<EditorValueFromOptions<TOptions>>;

export function createEditor<V extends Value = Value>(
  options?: Omit<CreateEditorOptions<V>, 'plugins'> & {
    plugins?: never;
  }
): Editor<V>;

export function createEditor<
  V extends Value = Value,
  const TPlugins extends readonly unknown[] = readonly [],
>(options: CreateEditorOptions<V, TPlugins> = {}): Editor<V, TPlugins> {
  return createEditorImplementation(options);
}

/**
 * Generic construction entrypoint for typed runtime wrappers.
 *
 * @internal
 */
export const createEditorUnchecked = <
  V extends Value = Value,
  const TPlugins extends readonly unknown[] = readonly [],
>(
  options: CreateEditorOptions<V, TPlugins> = {}
): Editor<V, TPlugins> => createEditorImplementation(options);

const createEditorImplementation = <
  V extends Value,
  const TPlugins extends readonly unknown[],
>(
  options: CreateEditorOptions<V, TPlugins>
): Editor<V, TPlugins> => {
  let editor!: Editor<V, TPlugins>;
  const runtimeEditor = () => editor;
  const schema: InternalEditorSchemaApi<V> = createEditorSchema(runtimeEditor);

  const pluginRuntime = {
    schema,
    install: (plugin, pluginOptions) =>
      extendEditor(editor, plugin, pluginOptions),
    preparePluginPublication: (entries, publicationOptions) =>
      prepareScopedPluginPublication(editor, entries, publicationOptions),
  } satisfies InternalPluginRuntime<V>;

  const snapshotRuntime = {
    getChildren: () => getChildren(editor),
    getFragment: () => getFragment(editor) as Array<DescendantIn<V>>,
    getLastCommit: () => getLastCommit(editor) as EditorCommit<V> | null,
    getPathByNodeKey: (nodeKey) => getPathByNodeKey(editor, nodeKey),
    getNodeKey: (path) => getNodeKey(editor, path),
    getSelection: () => getLiveSelection(editor),
    getSnapshot: () => getSnapshot(editor) as EditorSnapshot<V>,
  } satisfies InternalEditorSnapshotRuntime<V>;

  const runtimeBoundaryEditor = () => editor as unknown as Editor<V, any>;

  const transactionRuntime = {
    read: (fn) => readEditor(runtimeBoundaryEditor(), fn),
    runCommand: createCommandDispatch(() => editor),
    subscribe: (listener) => subscribe(editor, listener),
    subscribeCommit: (listener) => subscribeCommit(editor, listener),
    subscribeSource: (source, listener) =>
      subscribeSource(editor, source, listener),
    update: (
      fn: (
        transaction: EditorUpdateTransaction<V, any>,
        context: EditorUpdateContext<Editor<V, any>>
      ) => void,
      innerOptions?: InternalEditorUpdateOptions
    ) => updateEditor(runtimeBoundaryEditor(), fn, innerOptions),
  } satisfies InternalEditorTransactionRuntime<V>;

  const anchorApi = createEditorAnchorApi(() => editor);
  const read = createEditorReadApi<V, TPlugins>((fn) =>
    withEditorRootChildren(editor, 'main', () => readEditor(editor, fn))
  );
  const key = ((target: Descendant | Location) =>
    withEditorRootChildren(editor, MAIN_ROOT_KEY, () =>
      readEditor(editor, (state) => state.key(target as never))
    )) as EditorKeyApi;
  const update = createEditorUpdateApi<V, TPlugins>(
    (fn, policy) => updateEditor(editor, fn, { tags: policy.tags }),
    {
      hasTxGroup: (groupName) =>
        getPluginRegistry(editor).txGroups.has(groupName),
      repairValue: () =>
        updateEditor(
          editor,
          () => {
            repairEditorValue(editor);
          },
          {
            tags: ['history-skip'],
          }
        ),
    }
  );

  const baseEditor: Editor<V, TPlugins> = {
    api: Object.create(null) as Editor<V, TPlugins>['api'],
    anchor: anchorApi,
    id: options.id ?? createEditorId(),
    plugin: undefined as unknown as Editor<V, TPlugins>['plugin'],
    key,
    read,
    subscribe: (listener) => subscribe(editor, listener),
    subscribeCommit: (listener) => subscribeCommit(editor, listener),
    update,
    install: (plugin, pluginOptions) =>
      extendEditor(editor, plugin, pluginOptions),
  };

  editor = baseEditor;
  setEditorLifecycleErrorSink(editor, options.lifecycleErrorSink);

  const readRuntime = createEditorReadRuntime(editor);

  const runtime = {
    ...pluginRuntime,
    ...readRuntime,
    ...snapshotRuntime,
    ...transactionRuntime,
  } satisfies InternalEditorRuntime<V>;

  setEditorRuntime(editor, runtime);

  const baseRegistry = createPluginRegistry();

  registerEffectTypeInRegistry(
    baseRegistry,
    'plite:screen-reader-announcement',
    screenReaderAnnouncementEffect
  );
  initializeBasePluginRegistry(editor, finalizePluginRegistry(baseRegistry));
  Object.assign(editor, createEditorViewPluginApis(editor, editor));
  const initialState = initializePublicState(editor, options);

  armSchemaBootstrap(editor);

  if (options.plugins) {
    publishInitialPlugins(
      editor as AnyEditor,
      options.plugins as PluginInput,
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
    schema.assertDocument(initialDocument);
  }

  snapshotInitialDocumentState(editor);

  return editor;
};
