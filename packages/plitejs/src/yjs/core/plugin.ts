import { carryPluginFactoryType } from '../../core/plugin';
import {
  definePlugin,
  type Descendant,
  getCompiledEditorSchemaFromApi,
  getEditorRuntimeOwner,
  readEditorSelection,
} from '../../index';
import type {
  PluginDefinitionInput,
  PluginFactoryTypeLambda,
} from '../../interfaces/editor';
import { YjsController } from './controller';
import {
  claimYjsNamespace,
  deleteActiveYjsController,
  getActiveYjsController,
  setActiveYjsController,
} from './controller-registry';
import type { YjsEditor } from './editor-types';
import type {
  YjsAwarenessLike,
  YjsBaseApi,
  YjsCompactionApi,
  YjsPluginOptions,
  YjsPresenceApi,
  YjsRemoteCursorData,
} from './types';

type YjsCursorDataOfOptions<TOptions> =
  TOptions extends YjsPluginOptions<infer TCursorData>
    ? TCursorData
    : YjsRemoteCursorData;

type YjsOptionsWithAwareness<
  TCursorData extends YjsRemoteCursorData = YjsRemoteCursorData,
> = YjsPluginOptions<TCursorData> & Readonly<{ awareness: YjsAwarenessLike }>;

type YjsOptionsWithCompaction<
  TCursorData extends YjsRemoteCursorData = YjsRemoteCursorData,
> = YjsPluginOptions<TCursorData> &
  Readonly<{
    sharedEffectCompaction: Readonly<{
      authorityId: string;
      threshold?: number;
    }>;
  }>;

const createDeferredBaseApi = <TCursorData extends YjsRemoteCursorData>(
  getController: () => YjsController<TCursorData>
): YjsBaseApi =>
  Object.freeze({
    admissionStatus: () => getController().baseApi().admissionStatus(),
    retryImport: () => getController().baseApi().retryImport(),
    subscribeAdmissionStatus: (listener) =>
      getController().baseApi().subscribeAdmissionStatus(listener),
  });

const createDeferredPresenceApi = <TCursorData extends YjsRemoteCursorData>(
  getController: () => YjsController<TCursorData>,
  view: YjsEditor
): YjsPresenceApi<TCursorData> =>
  Object.freeze({
    clearSelection: () => getController().presenceApi(view).clearSelection(),
    remoteCursor: (clientId) =>
      getController().presenceApi(view).remoteCursor(clientId),
    remoteCursors: () => getController().presenceApi(view).remoteCursors(),
    setCursorData: (data) =>
      getController().presenceApi(view).setCursorData(data),
    subscribeRemoteCursors: (listener) =>
      getController().presenceApi(view).subscribeRemoteCursors(listener),
    syncSelection: () => getController().presenceApi(view).syncSelection(),
  });

const createDeferredCompactionApi = <TCursorData extends YjsRemoteCursorData>(
  getController: () => YjsController<TCursorData>
): YjsCompactionApi =>
  Object.freeze({
    retireSharedEffectPeer: (clientId) =>
      getController().compactionApi().retireSharedEffectPeer(clientId),
  });

const createBindingRuntime = <TCursorData extends YjsRemoteCursorData>(
  options: YjsPluginOptions<TCursorData>
) => {
  const activationErrors = new WeakMap<YjsEditor, unknown>();
  const controllers = new WeakMap<YjsEditor, YjsController<TCursorData>>();
  const factoryToken = {};
  const rootName = options.rootName ?? 'plitejs';
  const getController = (editor: YjsEditor) => {
    const owner = getEditorRuntimeOwner(editor);
    const controller = controllers.get(owner);

    if (controller) return controller;

    const activationError = activationErrors.get(owner);

    // oxlint-disable-next-line typescript/only-throw-error -- Preserve the host-owned activation failure unchanged.
    if (activationError !== undefined) throw activationError;

    throw new Error('Yjs plugin is not active on this editor.');
  };
  const common = {
    activate(context) {
      const owner = getEditorRuntimeOwner(context.editor);
      const lease = claimYjsNamespace(
        options.doc,
        rootName,
        owner,
        factoryToken
      );
      let controller: YjsController<TCursorData>;

      try {
        if (lease.reused) {
          const current = controllers.get(owner);

          if (!current) {
            throw new Error('A reused Yjs binding lost its owning controller.');
          }
          controller = current;
        } else {
          const active = getActiveYjsController(owner);

          if (active) {
            throw new Error(
              'Changing a Yjs document or namespace requires a fresh editor.'
            );
          }

          const compiledSchema = getCompiledEditorSchemaFromApi(context.schema);
          const emptyValueFor = (root: string): readonly Descendant[] => {
            const rootContent =
              root === 'main'
                ? compiledSchema?.primaryRoot.content
                : compiledSchema?.roots.get(root)?.content;

            if (!rootContent || rootContent.min === 0) return Object.freeze([]);

            const children: Descendant[] = [];

            while (children.length < rootContent.min) {
              const child = context.schema.createDefaultRootChild(
                root === 'main' ? undefined : root
              );

              if (!child) {
                throw new Error(
                  `Yjs root "${root}" requires content but has no schema default.`
                );
              }
              children.push(child);
            }

            return Object.freeze(children);
          };

          controller = new YjsController(owner, options, {
            canonicalize: (root, children) =>
              owner.read((state) => {
                const before = state.value();
                const transaction = state.transaction((tx) => {
                  if (root === 'main') {
                    tx.value.replace({ children, selection: null });

                    return;
                  }

                  tx.value.replace({
                    ...before,
                    roots: { ...before.roots, [root]: children },
                    selection: readEditorSelection(owner),
                  });
                });
                const value = transaction.changes.apply(before);

                return root === 'main'
                  ? value.children
                  : (value.roots?.[root] ?? []);
              }),
            emptyValueFor,
          });
          controller.initializeCanonicalState();
          controllers.set(owner, controller);
          setActiveYjsController(owner, controller);
        }

        activationErrors.delete(owner);
      } catch (error) {
        if (lease.release('rollback')) {
          controllers.get(owner)?.destroy();
          controllers.delete(owner);
        }
        activationErrors.set(owner, error);
        throw error;
      }

      context.onCleanup(({ reason }) => {
        if (!lease.release(reason === 'rollback' ? 'rollback' : 'dispose')) {
          return;
        }

        controller.destroy();
        if (controllers.get(owner) === controller) controllers.delete(owner);
        deleteActiveYjsController(owner, controller);
      });
      context.afterPublish(() => controller.start());
    },
    on: {
      commit({ commit, editor, snapshot }) {
        getController(editor).handleCommit(commit, snapshot);
      },
    },
    validate({ editor, schema }) {
      controllers
        .get(getEditorRuntimeOwner(editor))
        ?.assertSchemaIdentity(schema.identity());
    },
  } satisfies Pick<
    PluginDefinitionInput<YjsEditor>,
    'activate' | 'on' | 'validate'
  >;

  return { common, getController };
};

const createBaseYjsPlugin = <TCursorData extends YjsRemoteCursorData>(
  options: YjsPluginOptions<TCursorData>
) => {
  const runtime = createBindingRuntime(options);

  return definePlugin('yjs', {
    ...runtime.common,
    api: ({ editor }) =>
      createDeferredBaseApi(() => runtime.getController(editor)),
  });
};

const createPresenceYjsPlugin = <TCursorData extends YjsRemoteCursorData>(
  options: YjsOptionsWithAwareness<TCursorData>
) => {
  const runtime = createBindingRuntime(options);

  return definePlugin('yjs', {
    ...runtime.common,
    api: ({ editor }) => ({
      ...createDeferredBaseApi(() => runtime.getController(editor)),
      ...createDeferredPresenceApi(() => runtime.getController(editor), editor),
    }),
  });
};

const createCompactionYjsPlugin = <TCursorData extends YjsRemoteCursorData>(
  options: YjsOptionsWithCompaction<TCursorData>
) => {
  const runtime = createBindingRuntime(options);

  return definePlugin('yjs', {
    ...runtime.common,
    api: ({ editor }) => ({
      ...createDeferredBaseApi(() => runtime.getController(editor)),
      ...createDeferredCompactionApi(() => runtime.getController(editor)),
    }),
  });
};

const createPresenceCompactionYjsPlugin = <
  TCursorData extends YjsRemoteCursorData,
>(
  options: YjsOptionsWithAwareness<TCursorData> &
    YjsOptionsWithCompaction<TCursorData>
) => {
  const runtime = createBindingRuntime(options);

  return definePlugin('yjs', {
    ...runtime.common,
    api: ({ editor }) => ({
      ...createDeferredBaseApi(() => runtime.getController(editor)),
      ...createDeferredPresenceApi(() => runtime.getController(editor), editor),
      ...createDeferredCompactionApi(() => runtime.getController(editor)),
    }),
  });
};

type BaseYjsPlugin<TCursorData extends YjsRemoteCursorData> = ReturnType<
  typeof createBaseYjsPlugin<TCursorData>
>;
type PresenceYjsPlugin<TCursorData extends YjsRemoteCursorData> = ReturnType<
  typeof createPresenceYjsPlugin<TCursorData>
>;
type CompactionYjsPlugin<TCursorData extends YjsRemoteCursorData> = ReturnType<
  typeof createCompactionYjsPlugin<TCursorData>
>;
type PresenceCompactionYjsPlugin<TCursorData extends YjsRemoteCursorData> =
  ReturnType<typeof createPresenceCompactionYjsPlugin<TCursorData>>;

type YjsPluginForOptions<TOptions extends YjsPluginOptions> =
  TOptions extends YjsOptionsWithAwareness & YjsOptionsWithCompaction
    ? PresenceCompactionYjsPlugin<YjsCursorDataOfOptions<TOptions>>
    : TOptions extends YjsOptionsWithAwareness
      ? PresenceYjsPlugin<YjsCursorDataOfOptions<TOptions>>
      : TOptions extends YjsOptionsWithCompaction
        ? CompactionYjsPlugin<YjsCursorDataOfOptions<TOptions>>
        : BaseYjsPlugin<YjsCursorDataOfOptions<TOptions>>;

interface YjsFactoryType extends PluginFactoryTypeLambda {
  readonly input: YjsPluginOptions;
  readonly output: YjsPluginForOptions<this['input']>;
}

function createYjsDescriptor<const TOptions extends YjsPluginOptions>(
  options: TOptions
): YjsPluginForOptions<TOptions>;
function createYjsDescriptor(
  options: YjsPluginOptions
):
  | BaseYjsPlugin<YjsRemoteCursorData>
  | CompactionYjsPlugin<YjsRemoteCursorData>
  | PresenceYjsPlugin<YjsRemoteCursorData>
  | PresenceCompactionYjsPlugin<YjsRemoteCursorData> {
  if (options.awareness && options.sharedEffectCompaction) {
    return createPresenceCompactionYjsPlugin({
      ...options,
      awareness: options.awareness,
      sharedEffectCompaction: options.sharedEffectCompaction,
    });
  }
  if (options.awareness) {
    return createPresenceYjsPlugin({
      ...options,
      awareness: options.awareness,
    });
  }
  if (options.sharedEffectCompaction) {
    return createCompactionYjsPlugin({
      ...options,
      sharedEffectCompaction: options.sharedEffectCompaction,
    });
  }

  return createBaseYjsPlugin(options);
}

/** Create one Yjs binding descriptor for an app-owned document. */
export const yjs = carryPluginFactoryType<
  YjsFactoryType,
  typeof createYjsDescriptor
>(createYjsDescriptor);
