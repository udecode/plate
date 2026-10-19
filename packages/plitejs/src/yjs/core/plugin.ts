import { getCompiledEditorSchemaFromApi } from '../../core/editor-schema';
import {
  carryPluginFactoryType,
  queueAfterPluginAcquisition,
} from '../../core/plugin';
import {
  definePlugin,
  type Descendant,
  getEditorRuntimeOwner,
  readEditorSelection,
} from '../../index';
import type {
  PluginDefinitionInput,
  PluginFactoryTypeLambda,
} from '../../interfaces/editor';
import { YjsBinding } from './binding';
import { YjsController } from './controller';
import {
  claimYjsNamespace,
  deleteActiveYjsBinding,
  getActiveYjsBinding,
  setActiveYjsBinding,
} from './controller-registry';
import type { YjsEditor } from './editor-types';
import { DEFAULT_YJS_ROOT_NAME } from './keys';
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
  getBinding: () => YjsBinding<TCursorData>
): YjsBaseApi =>
  Object.freeze({
    admissionStatus: () => getBinding().baseApi().admissionStatus(),
    retryImport: () => getBinding().baseApi().retryImport(),
    subscribeAdmissionStatus: (listener) =>
      getBinding().baseApi().subscribeAdmissionStatus(listener),
  });

const createDeferredPresenceApi = <TCursorData extends YjsRemoteCursorData>(
  getBinding: () => YjsBinding<TCursorData>,
  view: YjsEditor
): YjsPresenceApi<TCursorData> =>
  Object.freeze({
    clearSelection: () => getBinding().presenceApi(view).clearSelection(),
    remoteCursor: (clientId) =>
      getBinding().presenceApi(view).remoteCursor(clientId),
    remoteCursors: () => getBinding().presenceApi(view).remoteCursors(),
    setCursorData: (data) => getBinding().presenceApi(view).setCursorData(data),
    subscribeRemoteCursors: (listener) =>
      getBinding().presenceApi(view).subscribeRemoteCursors(listener),
    syncSelection: () => getBinding().presenceApi(view).syncSelection(),
  });

const createDeferredCompactionApi = <TCursorData extends YjsRemoteCursorData>(
  getBinding: () => YjsBinding<TCursorData>
): YjsCompactionApi =>
  Object.freeze({
    retireSharedEffectPeer: (clientId) =>
      getBinding().compactionApi().retireSharedEffectPeer(clientId),
  });

const createBindingRuntime = <TCursorData extends YjsRemoteCursorData>(
  options: YjsPluginOptions<TCursorData>
) => {
  const activationErrors = new WeakMap<YjsEditor, unknown>();
  const bindings = new WeakMap<YjsEditor, YjsBinding<TCursorData>>();
  const factoryToken = {};
  const rootName = options.rootName ?? DEFAULT_YJS_ROOT_NAME;
  const getBinding = (editor: YjsEditor) => {
    const owner = getEditorRuntimeOwner(editor);
    const binding = bindings.get(owner);

    if (binding) return binding;

    const activationError = activationErrors.get(owner);

    // oxlint-disable-next-line typescript/only-throw-error -- Preserve the host-owned activation failure unchanged.
    if (activationError !== undefined) throw activationError;

    throw new Error('Yjs plugin is not active on this editor.');
  };
  const common = {
    activate(context) {
      const owner = getEditorRuntimeOwner(context.editor);
      let binding = bindings.get(owner);

      if (!binding) {
        if (getActiveYjsBinding(owner)) {
          throw new Error(
            'Changing a Yjs document or namespace requires a fresh editor.'
          );
        }
        binding = new YjsBinding(owner, options);
        bindings.set(owner, binding);
        setActiveYjsBinding(owner, binding);
      }

      const current = binding;

      current.records += 1;
      context.onCleanup(() => {
        current.records -= 1;
        if (current.records > 0) return;

        current.destroy();
        if (bindings.get(owner) === current) bindings.delete(owner);
        deleteActiveYjsBinding(owner, current);
      });
      const buildController = () => {
        const compiledSchema = getCompiledEditorSchemaFromApi(context.schema);
        const emptyValueFor = (root: string): readonly Descendant[] => {
          const rootContent =
            root === 'main'
              ? compiledSchema?.primaryRoot.content
              : compiledSchema?.roots.get(root)?.content;

          if (!rootContent || rootContent.min === 0) return Object.freeze([]);

          const children: Descendant[] = [];

          while (children.length < rootContent.min) {
            const child = context.schema.createDefaultChild({
              at: [children.length],
              root: root === 'main' ? undefined : root,
            });

            if (!child) {
              throw new Error(
                `Yjs root "${root}" requires content but has no schema default.`
              );
            }
            children.push(child);
          }

          return Object.freeze(children);
        };

        const controller = new YjsController(owner, options, {
          canonicalize: (root, children) =>
            owner.read((state) => {
              const before = state.value();
              const transaction = state.transaction((tx) => {
                if (root === 'main') {
                  tx.value.replace({ children, selection: null });

                  return;
                }

                // A replacement that names no records keeps the
                // editor's.
                const { records: _records, ...content } = before;

                tx.value.replace({
                  ...content,
                  roots: { ...content.roots, [root]: children },
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

        try {
          controller.initializeCanonicalState();
        } catch (error) {
          controller.destroy();
          throw error;
        }

        return controller;
      };
      context.acquire(() => {
        const lease = claimYjsNamespace(
          options.doc,
          rootName,
          owner,
          factoryToken
        );

        try {
          if (!lease.reused) {
            current.attach(buildController());
            queueAfterPluginAcquisition(owner, context.pluginName, () => {
              try {
                current.publishPendingCursorData();
              } finally {
                if (current.published) current.controller?.start();
              }
            });
          } else if (!current.controller) {
            throw new Error('A reused Yjs binding lost its owning controller.');
          }
          activationErrors.delete(owner);
        } catch (error) {
          lease.release('rollback', () => current.detach());
          activationErrors.set(owner, error);
          throw error;
        }

        return ({ reason }) => {
          lease.release(reason === 'rollback' ? 'rollback' : 'dispose', () =>
            current.detach()
          );
        };
      });
      context.afterPublish(() => {
        current.published = true;
        current.controller?.start();
      });
    },
    on: {
      commit({ commit, editor, snapshot }) {
        bindings
          .get(getEditorRuntimeOwner(editor))
          ?.controller?.handleCommit(commit, snapshot);
      },
    },
    validate({ editor, schema }) {
      bindings
        .get(getEditorRuntimeOwner(editor))
        ?.controller?.assertSchemaIdentity(schema.identity());
    },
  } satisfies Pick<
    PluginDefinitionInput<YjsEditor>,
    'activate' | 'on' | 'validate'
  >;

  return { common, getBinding };
};

const createBaseYjsPlugin = <TCursorData extends YjsRemoteCursorData>(
  options: YjsPluginOptions<TCursorData>
) => {
  const runtime = createBindingRuntime(options);

  return definePlugin('yjs', {
    ...runtime.common,
    api: ({ editor }) =>
      createDeferredBaseApi(() => runtime.getBinding(editor)),
  });
};

const createPresenceYjsPlugin = <TCursorData extends YjsRemoteCursorData>(
  options: YjsOptionsWithAwareness<TCursorData>
) => {
  const runtime = createBindingRuntime(options);

  return definePlugin('yjs', {
    ...runtime.common,
    api: ({ editor }) => ({
      ...createDeferredBaseApi(() => runtime.getBinding(editor)),
      ...createDeferredPresenceApi(() => runtime.getBinding(editor), editor),
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
      ...createDeferredBaseApi(() => runtime.getBinding(editor)),
      ...createDeferredCompactionApi(() => runtime.getBinding(editor)),
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
      ...createDeferredBaseApi(() => runtime.getBinding(editor)),
      ...createDeferredPresenceApi(() => runtime.getBinding(editor), editor),
      ...createDeferredCompactionApi(() => runtime.getBinding(editor)),
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
