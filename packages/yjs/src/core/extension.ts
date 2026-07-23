import {
  defineEditorExtension,
  type Descendant,
  type Editor,
  type Value,
} from '@platejs/plite';
import {
  getCompiledEditorSchemaFromApi,
  toInternalRoot,
} from '@platejs/plite/internal';

import { YjsController } from './controller';
import type {
  YjsExtensionOptions,
  YjsRemoteCursorData,
  YjsState,
  YjsTx,
} from './types';

const activeControllers = new WeakMap<Editor, YjsController>();

const createDeferredYjsState = (getController: () => YjsController) => {
  const state: YjsState = {
    awarenessRevision: () => getController().state().awarenessRevision(),
    clientId: () => getController().state().clientId(),
    connected: () => getController().state().connected(),
    doc: () => getController().state().doc(),
    paused: () => getController().state().paused(),
    providerRevision: () => getController().state().providerRevision(),
    providerStatus: () => getController().state().providerStatus(),
    providerSynced: () => getController().state().providerSynced(),
    remoteCursor: <
      TCursorData extends YjsRemoteCursorData = YjsRemoteCursorData,
    >(
      clientId: number
    ) => getController().state().remoteCursor<TCursorData>(clientId),
    remoteCursors: <
      TCursorData extends YjsRemoteCursorData = YjsRemoteCursorData,
    >() => getController().state().remoteCursors<TCursorData>(),
    root: () => getController().state().root(),
    subscribeAwareness: (listener) =>
      getController().state().subscribeAwareness(listener),
    subscribeProvider: (listener) =>
      getController().state().subscribeProvider(listener),
    trace: () => getController().state().trace(),
  };

  return Object.freeze(state);
};

const createDeferredYjsTx = (getController: () => YjsController): YjsTx =>
  Object.freeze({
    clearSelection: () => getController().tx().clearSelection(),
    clearTrace: () => getController().tx().clearTrace(),
    connect: () => getController().tx().connect(),
    disconnect: () => getController().tx().disconnect(),
    pause: () => getController().tx().pause(),
    reconcile: () => getController().tx().reconcile(),
    reconnect: () => getController().tx().reconnect(),
    redo: () => getController().tx().redo(),
    resume: () => getController().tx().resume(),
    retireSharedEffectPeer: (peerId) =>
      getController().tx().retireSharedEffectPeer(peerId),
    sendCursorData: (data) => getController().tx().sendCursorData(data),
    sendSelection: (range, data) =>
      getController().tx().sendSelection(range, data),
    undo: () => getController().tx().undo(),
  });

const canonicalizeRootContent = (
  editor: Editor<Value>,
  root: string,
  children: readonly Descendant[]
) =>
  editor.read((state) => {
    const before = state.value();
    const transaction = state.transaction((tx) => {
      if (root === 'main') {
        tx.value.replace({
          children: children as Value,
          selection: null,
        });
      } else if (Object.hasOwn(before.roots ?? {}, root)) {
        tx.roots.replace(root, children as Value);
      } else {
        tx.roots.create(root, children as Value);
      }
    });
    const value = transaction.changes.apply(before);

    return root === 'main' ? value.children : (value.roots?.[root] ?? []);
  });

export const createYjsExtension = (options: YjsExtensionOptions = {}) => {
  const activationErrors = new WeakMap<Editor, unknown>();
  const controllers = new WeakMap<Editor, YjsController>();
  const getController = (editor: Editor) => {
    const controller = controllers.get(editor);

    if (controller) return controller;

    const activationError = activationErrors.get(editor);

    if (activationError !== undefined) throw activationError;

    throw new Error('Yjs extension is not active on this editor.');
  };

  return defineEditorExtension({
    activate(editor, context) {
      const root = toInternalRoot(context.root);
      const previousActiveController = activeControllers.get(editor);
      const previousLocalController = controllers.get(editor);
      const compiledSchema = getCompiledEditorSchemaFromApi(context.schema);
      const rootContent =
        root === 'main'
          ? compiledSchema?.primaryRoot.content
          : compiledSchema?.roots.get(root)?.content;
      const emptyYjsValue: readonly Descendant[] = (() => {
        if (!rootContent || rootContent.min === 0) return Object.freeze([]);

        const children: Descendant[] = [];

        while (children.length < rootContent.min) {
          const child = context.schema.createDefaultRootChild(context.root);

          if (!child) {
            throw new Error(
              `Yjs root "${context.root ?? 'primary'}" requires content but has no schema default.`
            );
          }
          children.push(child);
        }

        return Object.freeze(children);
      })();

      const controller = (() => {
        try {
          return new YjsController(
            editor,
            options,
            {
              canonicalize: (children) =>
                canonicalizeRootContent(editor, root, children),
              emptyYjsValue,
              root,
            },
            previousActiveController
          );
        } catch (error) {
          activationErrors.set(editor, error);
          throw error;
        }
      })();

      controllers.set(editor, controller);
      activeControllers.set(editor, controller);
      activationErrors.delete(editor);
      try {
        controller.initializeCanonicalState();
      } catch (error) {
        try {
          controller.destroy(previousActiveController);
        } finally {
          if (previousLocalController) {
            controllers.set(editor, previousLocalController);
          } else {
            controllers.delete(editor);
          }
          if (previousActiveController) {
            activeControllers.set(editor, previousActiveController);
          } else {
            activeControllers.delete(editor);
          }
          activationErrors.set(editor, error);
        }
        throw error;
      }
      context.onCleanup(({ reason }) => {
        const active = activeControllers.get(editor);
        const replacement =
          active === controller
            ? reason === 'rollback'
              ? previousActiveController
              : undefined
            : active;

        controller.destroy(replacement);
        if (controllers.get(editor) === controller) {
          if (reason === 'rollback' && previousLocalController) {
            controllers.set(editor, previousLocalController);
          } else {
            controllers.delete(editor);
          }
        }
        if (activeControllers.get(editor) === controller) {
          if (reason === 'rollback' && previousActiveController) {
            activeControllers.set(editor, previousActiveController);
          } else {
            activeControllers.delete(editor);
          }
        }
      });
      context.onReady(() => controller.seed());
    },
    name: 'yjs',
    onCommit({ commit, editor, snapshot }): void {
      getController(editor).handleCommit(commit, snapshot);
    },
    onTransactionChange({ editor, tx }): void {
      getController(editor).handleTransactionChange(tx);
    },
    state: {
      yjs(_state, editor) {
        return createDeferredYjsState(() => getController(editor));
      },
    },
    tx: {
      yjs(_tx, editor) {
        return createDeferredYjsTx(() => getController(editor));
      },
    },
    validateConfiguration({ editor, schema }) {
      controllers.get(editor)?.assertSchemaIdentity(schema.identity());
    },
  });
};
