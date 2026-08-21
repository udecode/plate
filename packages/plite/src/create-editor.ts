import { extendEditor, getFragment } from './core';
import { createAnchor } from './core/anchor';
import { hasActiveAnchors } from './core/anchor-state';
import { createCommandDispatch } from './core/command-registry';
import {
  getCandidateEditorApiValue,
  createEditorExtensionUpdatePortal,
  getInstalledEditorExtensionApi,
  getCandidateEditorExtensionApi,
  prepareInitialEditorExtensionPublication,
  prepareScopedEditorExtensionPublication,
  resolveInstalledEditorExtension,
  setEditorLifecycleErrorSink,
} from './core/editor-extension';
import {
  createEditorReadApi,
  createEditorUpdateApi,
} from './core/editor-lifecycle-api';
import { createEditorReadRuntime } from './core/editor-read-runtime';
import {
  type InternalEditorExtensionRuntime,
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
  createExtensionRegistry,
  finalizeExtensionRegistry,
  getExtensionRegistry,
  initializeBaseExtensionRegistry,
  registerEffectTypeInRegistry,
} from './core/extension-registry';
import {
  assertPublicLocationRoot,
  assertPublicRootKey,
  MAIN_ROOT_KEY,
} from './core/public-root';
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
  subscribe,
  subscribeCommit,
  subscribeSource,
  transformEditorSnapshotInput,
  updateEditor,
  withEditorRootChildren,
} from './core/public-state';
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
  EditorAnchorApi,
  EditorKeyApi,
  EditorCommit,
  EditorExtensionReference,
  EditorExtensionApiMap,
  EditorExtensionInput,
  EditorSnapshot,
  EditorTransactionSpecBuilder,
  EditorUpdateContext,
  EditorUpdateTransaction,
  EditorValueFromExtensions,
  ExtensionsOf,
  SchemaExtensionsOf,
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

/** Extension tuple inferred from a `createEditor` options object. */
export type EditorExtensionsFromOptions<TOptions> = TOptions extends {
  extensions: infer TExtensions extends readonly unknown[];
}
  ? TExtensions
  : readonly [];

type ReadonlyJson<T> = T extends (...args: any[]) => unknown
  ? T
  : T extends string
    ? string
    : T extends number
      ? number
      : T extends boolean
        ? boolean
        : T extends readonly (infer TItem)[]
          ? readonly ReadonlyJson<TItem>[]
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
  SchemaExtensionsOf<EditorExtensionsFromOptions<TOptions>>,
] extends [never]
  ? InitialValueFromOptions<TOptions>
  : EditorValueFromExtensions<EditorExtensionsFromOptions<TOptions>>;

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

const publishInitialEditorExtensions = <TEditor extends AnyEditor>(
  editor: TEditor,
  input: EditorExtensionInput,
  explicitInitialDocument: boolean,
  options: Readonly<{
    initialize?: (
      transaction: EditorTransactionSpecBuilder<
        ValueOf<TEditor>,
        ExtensionsOf<TEditor>
      >
    ) => void;
    initialValue?: () => SnapshotInput<ValueOf<TEditor>>;
  }> = {}
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
    const validatePublishedDocument = (
      requireExplicitDocument = explicitInitialDocument
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
      if (publication.configurationChanged) {
        publication.validateDocument(publishedDocument);
      } else {
        const schema: InternalEditorSchemaApi = getEditorSchema(editor);

        schema.assertDocument(publishedDocument);
      }
    };

    validatePublishedDocument();

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

  if (getExtensionRegistry(editor).schemaContributions.records.size > 0) {
    disarmSchemaBootstrap(editor);
  }
};

/**
 * Replace the derived base schema on one unchanged raw editor.
 *
 * @internal
 */
export const initializeEditorExtensions = <TEditor extends AnyEditor>(
  editor: TEditor,
  input: EditorExtensionInput,
  options: Readonly<{
    initialize?: (
      transaction: EditorTransactionSpecBuilder<
        ValueOf<TEditor>,
        ExtensionsOf<TEditor>
      >
    ) => void;
    /** Resolve one post-publication initial value for direct schema adoption. */
    initialValue?: () => SnapshotInput<ValueOf<TEditor>>;
  }> = {}
) => {
  if (!PENDING_SCHEMA_BOOTSTRAP.has(editor)) {
    throw new Error(
      'Editor schema initialization requires an editor without an installed schema.'
    );
  }
  if (getExtensionRegistry(editor).schemaContributions.records.size > 0) {
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

  publishInitialEditorExtensions(editor, input, hasDocument, options);
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
): Editor<
  EditorValueFromOptions<TOptions>,
  EditorExtensionsFromOptions<TOptions>
>;

export function createEditor<
  V extends Value,
  const TExtensions extends readonly unknown[],
>(
  options: CreateEditorOptions<V, TExtensions> & {
    extensions: TExtensions;
  }
): Editor<V, TExtensions>;

export function createEditor<
  const TOptions extends Omit<
    CreateEditorOptions<any, readonly []>,
    'extensions'
  > & {
    extensions?: never;
  },
>(options: TOptions): Editor<EditorValueFromOptions<TOptions>, readonly []>;

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

/**
 * Generic construction entrypoint for typed runtime wrappers.
 *
 * @internal
 */
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
  // oxlint-disable-next-line prefer-const -- Runtime factories close over the editor assigned after base construction.
  let editor!: Editor<V, TExtensions>;
  const runtimeEditor = () => editor;
  const schema: InternalEditorSchemaApi<V> = createEditorSchema(runtimeEditor);

  const extensionRuntime = {
    schema,
    install: (extension, extensionOptions) =>
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
      options?: InternalEditorUpdateOptions
    ) => updateEditor(runtimeBoundaryEditor(), fn, options),
  } satisfies InternalEditorTransactionRuntime<V>;

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
      const candidateValue = getCandidateEditorApiValue(
        editor as AnyEditor,
        property
      );

      if (candidateValue !== undefined) return candidateValue;
      const apiValues = getExtensionRegistry(editor as AnyEditor).apiGroups.get(
        property
      );

      if (!apiValues || apiValues.length === 0) {
        return;
      }

      return resolveApiCapability(apiValues);
    },
  }) as Editor<V, TExtensions>['api'];

  const extensionPortal = (extension: EditorExtensionReference) => {
    const resolveValue = (installedApi: EditorExtensionApiMap) => {
      const capability = installedApi[extension.name];

      if (capability === undefined) {
        throw new Error(
          `Editor extension "${extension.name}" does not expose an API.`
        );
      }

      return capability;
    };
    const createPortal = (
      requested: EditorExtensionReference,
      enforceIdentity: boolean
    ) => {
      const name = requested.name;
      const update = createEditorExtensionUpdatePortal(
        editor as AnyEditor,
        name,
        enforceIdentity ? requested : undefined
      );
      const assertCurrentDescriptor = () => {
        if (
          enforceIdentity &&
          getCandidateEditorExtensionApi(editor as AnyEditor, requested) ===
            undefined &&
          resolveInstalledEditorExtension(editor as AnyEditor, requested) !==
            requested
        ) {
          throw new Error(
            `Editor extension "${name}" descriptor is no longer installed.`
          );
        }
      };

      return Object.freeze({
        get api() {
          const candidateApi = getCandidateEditorExtensionApi(
            editor as AnyEditor,
            extension
          );

          if (candidateApi) return resolveValue(candidateApi);

          assertCurrentDescriptor();
          const installedApi = getInstalledEditorExtensionApi(
            editor as AnyEditor,
            name
          );

          if (!installedApi) {
            throw new Error(
              `Editor extension "${name}" is not installed on this editor.`
            );
          }

          return resolveValue(installedApi);
        },
        get read() {
          assertCurrentDescriptor();
          const capability = Reflect.get(read, name);

          if (capability === undefined) {
            throw new Error(
              `Editor extension "${name}" does not expose read methods.`
            );
          }

          return capability;
        },
        get update() {
          return update;
        },
      });
    };
    const candidateApi = getCandidateEditorExtensionApi(
      editor as AnyEditor,
      extension
    );

    if (candidateApi) {
      return createPortal(extension, true);
    }
    const installedExtension = resolveInstalledEditorExtension(
      editor as AnyEditor,
      extension
    );

    if (!installedExtension) {
      throw new Error(
        `Editor extension "${extension.name}" is not installed on this editor.`
      );
    }

    return createPortal(installedExtension, true);
  };

  const read = createEditorReadApi<V, TExtensions>((fn) =>
    withEditorRootChildren(editor, 'main', () => readEditor(editor, fn))
  );
  const key = ((target: Descendant | Location) =>
    withEditorRootChildren(editor, MAIN_ROOT_KEY, () =>
      readEditor(editor, (state) => state.key(target as never))
    )) as EditorKeyApi;
  const update = createEditorUpdateApi<V, TExtensions>(
    (fn, policy) =>
      updateEditor(
        editor,
        fn as (
          transaction: EditorUpdateTransaction<V, TExtensions>,
          context: EditorUpdateContext<Editor<V, TExtensions>>
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
    extension: extensionPortal as unknown as Editor<
      V,
      TExtensions
    >['extension'],
    key,
    read,
    subscribe: (listener) => subscribe(editor, listener),
    subscribeCommit: (listener) => subscribeCommit(editor, listener),
    update,
    install: (extension, extensionOptions) =>
      extendEditor(editor, extension, extensionOptions),
  };

  editor = baseEditor;
  setEditorLifecycleErrorSink(editor, options.lifecycleErrorSink);

  const readRuntime = createEditorReadRuntime(editor);

  const runtime = {
    ...extensionRuntime,
    ...readRuntime,
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

  armSchemaBootstrap(editor);

  if (options.extensions) {
    publishInitialEditorExtensions(
      editor as AnyEditor,
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
    schema.assertDocument(initialDocument);
  }

  return editor;
};
