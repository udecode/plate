import { defineExtension, type Descendant, type Editor } from '@platejs/plite';
import {
  getCompiledEditorSchemaFromApi,
  getEditorRuntimeOwner,
} from '@platejs/plite/internal';

import { YjsController } from './controller';
import type {
  YjsCursorDataSchema,
  YjsExtensionOptions,
  YjsRemoteCursorData,
  YjsState,
  YjsTx,
} from './types';

type YjsCursorDataOfOptions<TOptions> =
  TOptions extends Readonly<{
    cursorData: YjsCursorDataSchema<infer TCursorData>;
  }>
    ? TCursorData
    : YjsRemoteCursorData;

const activeControllers = new WeakMap<Editor, YjsController<any>>();

const createDeferredYjsState = <TCursorData extends YjsRemoteCursorData>(
  getController: () => YjsController<TCursorData>
): YjsState<TCursorData> => {
  const state: YjsState<TCursorData> = {
    awarenessRevision: () => getController().state().awarenessRevision(),
    clientId: () => getController().state().clientId(),
    connected: () => getController().state().connected(),
    doc: () => getController().state().doc(),
    paused: () => getController().state().paused(),
    providerRevision: () => getController().state().providerRevision(),
    providerStatus: () => getController().state().providerStatus(),
    providerSynced: () => getController().state().providerSynced(),
    remoteCursor: (clientId) => getController().state().remoteCursor(clientId),
    remoteCursors: () => getController().state().remoteCursors(),
    root: () => getController().state().root(),
    subscribeAwareness: (listener) =>
      getController().state().subscribeAwareness(listener),
    subscribeProvider: (listener) =>
      getController().state().subscribeProvider(listener),
    trace: () => getController().state().trace(),
  };

  return Object.freeze(state);
};

const createDeferredYjsTx = <TCursorData extends YjsRemoteCursorData>(
  getController: () => YjsController<TCursorData>
): YjsTx<TCursorData> =>
  Object.freeze({
    clearSelection: () => getController().tx().clearSelection(),
    clearTrace: () => getController().tx().clearTrace(),
    connect: () => getController().tx().connect(),
    disconnect: () => getController().tx().disconnect(),
    pause: () => getController().tx().pause(),
    reconcile: () => getController().tx().reconcile(),
    reconnect: () => getController().tx().reconnect(),
    resume: () => getController().tx().resume(),
    retireSharedEffectPeer: (peerId) =>
      getController().tx().retireSharedEffectPeer(peerId),
    sendCursorData: (data) => getController().tx().sendCursorData(data),
    sendSelection: (range, data) =>
      getController().tx().sendSelection(range, data),
  });

const createYjsExtension = <TCursorData extends YjsRemoteCursorData>(
  options: YjsExtensionOptions
) => {
  const activationErrors = new WeakMap<Editor, unknown>();
  const controllers = new WeakMap<Editor, YjsController<TCursorData>>();
  const getController = (editor: Editor) => {
    const owner = getEditorRuntimeOwner(editor);
    const controller = controllers.get(owner);

    if (controller) return controller;

    const activationError = activationErrors.get(owner);

    if (activationError !== undefined) throw activationError;

    throw new Error('Yjs extension is not active on this editor.');
  };

  return defineExtension('yjs', {
    activate(context) {
      const { editor } = context;
      const owner = getEditorRuntimeOwner(editor);
      const previousActiveController = activeControllers.get(owner);
      const previousLocalController = controllers.get(owner);
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

      const controller = (() => {
        try {
          return new YjsController<TCursorData>(owner, options, {
            canonicalize: (root, children) =>
              owner.read((state) => {
                const before = state.value();
                const transaction = state.transaction((tx) => {
                  if (root === 'main') {
                    tx.value.replace({
                      children,
                      selection: null,
                    });

                    return;
                  }

                  tx.value.replace({
                    ...before,
                    roots: {
                      ...before.roots,
                      [root]: children,
                    },
                    selection: state.selection(),
                  });
                });
                const value = transaction.changes.apply(before);

                return root === 'main'
                  ? value.children
                  : (value.roots?.[root] ?? []);
              }),
            emptyValueFor,
          });
        } catch (error) {
          activationErrors.set(owner, error);
          throw error;
        }
      })();

      controllers.set(owner, controller);
      activeControllers.set(owner, controller);
      activationErrors.delete(owner);
      try {
        controller.initializeCanonicalState();
      } catch (error) {
        try {
          controller.destroy(previousActiveController);
        } finally {
          if (previousLocalController) {
            controllers.set(owner, previousLocalController);
          } else {
            controllers.delete(owner);
          }
          if (previousActiveController) {
            activeControllers.set(owner, previousActiveController);
          } else {
            activeControllers.delete(owner);
          }
          activationErrors.set(owner, error);
        }
        throw error;
      }
      context.onCleanup(({ reason }) => {
        const active = activeControllers.get(owner);
        const replacement =
          active === controller
            ? reason === 'rollback'
              ? previousActiveController
              : undefined
            : active;

        controller.destroy(replacement);
        if (controllers.get(owner) === controller) {
          if (reason === 'rollback' && previousLocalController) {
            controllers.set(owner, previousLocalController);
          } else {
            controllers.delete(owner);
          }
        }
        if (activeControllers.get(owner) === controller) {
          if (reason === 'rollback' && previousActiveController) {
            activeControllers.set(owner, previousActiveController);
          } else {
            activeControllers.delete(owner);
          }
        }
      });
      context.afterPublish(() => controller.seed());
    },
    on: {
      commit({ commit, editor, snapshot }): void {
        getController(editor).handleCommit(commit, snapshot);
      },
      transactionChange({ editor, tx }): void {
        getController(editor).handleTransactionChange(tx);
      },
    },

    read({ editor }) {
      return createDeferredYjsState(() => getController(editor));
    },
    update({ editor }) {
      return createDeferredYjsTx(() => getController(editor));
    },
    validate({ editor, schema }) {
      controllers.get(editor)?.assertSchemaIdentity(schema.identity());
    },
  });
};

type YjsExtensionFor<TCursorData extends YjsRemoteCursorData> = ReturnType<
  typeof createYjsExtension<TCursorData>
>;

export function yjs(): YjsExtensionFor<YjsRemoteCursorData>;
export function yjs<const TOptions extends YjsExtensionOptions>(
  options: TOptions
): YjsExtensionFor<YjsCursorDataOfOptions<TOptions>>;
export function yjs(options: YjsExtensionOptions = {}): YjsExtensionFor<any> {
  return createYjsExtension<any>(options);
}

export type YjsExtension = ReturnType<typeof yjs>;
