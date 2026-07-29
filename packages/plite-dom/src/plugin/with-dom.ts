import {
  defineEditorExtension,
  type EditorCommit,
  type EditorExtension,
  type EditorExtensionConfigurationContext,
  type EditorExtensionTxGroup,
  type EditorExtensionTypeProvider,
  type EditorTransactionChangeContext,
  LocationApi,
  type Editor as EditorType,
} from '@platejs/plite';
import { getEditorExtensionContributions } from '@platejs/plite/internal';
import {
  type TextDiff,
  transformPendingPoint,
  transformPendingRange,
  transformTextDiff,
} from '../utils/diff-text';
import {
  EDITOR_TO_KEY_TO_ELEMENT,
  EDITOR_TO_PENDING_ACTION,
  EDITOR_TO_PENDING_DIFFS,
  EDITOR_TO_PENDING_INSERTION_MARKS,
  EDITOR_TO_PENDING_SELECTION,
  EDITOR_TO_ROOT_VIEW_EDITORS,
  EDITOR_TO_SCHEDULE_FLUSH,
  EDITOR_TO_USER_MARKS,
  EDITOR_TO_USER_SELECTION,
  IS_NODE_MAP_DIRTY,
} from '../utils/weak-maps';
import {
  clearDOMClipboardFormatKey,
  dispatchDOMClipboardHandlers,
  DOM_CLIPBOARD_HANDLERS,
  getDOMClipboardFormatKey,
  setDOMClipboardFormatKey,
} from './dom-clipboard-runtime';
import { destroyEditorDOMPhaseSchedulerFallback } from './dom-phase-scheduler';
import {
  createDOMEditorCapability,
  DOMEditor as DOMEditorApi,
  type DOMApi,
  type DOMClipboardApi,
} from './dom-editor';

const DEFAULT_CLIPBOARD_FORMAT_KEY = 'x-plite-fragment';
const DOM_ACTIVATION = new WeakMap<EditorType, object>();

const clearUserSelectionRef = (editor: EditorType) => {
  EDITOR_TO_USER_SELECTION.get(editor)?.release();
  EDITOR_TO_USER_SELECTION.delete(editor);
};

const handleDOMCommit = (editor: EditorType, commit: EditorCommit) => {
  if (commit.changed.hasAny('marks')) {
    EDITOR_TO_SCHEDULE_FLUSH.get(editor)?.();

    if (
      !EDITOR_TO_PENDING_INSERTION_MARKS.get(editor) &&
      EDITOR_TO_PENDING_DIFFS.get(editor)?.length
    ) {
      EDITOR_TO_PENDING_INSERTION_MARKS.set(editor, null);
    }
    EDITOR_TO_USER_MARKS.delete(editor);
  }

  if (!commit.selectionChanged) return;

  clearUserSelectionRef(editor);
  EDITOR_TO_ROOT_VIEW_EDITORS.get(editor)?.forEach(clearUserSelectionRef);
};

const handleDOMTransactionChange = (
  editor: EditorType,
  context: EditorTransactionChangeContext
) => {
  const transformPendingState = (runtimeEditor: EditorType) => {
    const pendingDiffs = EDITOR_TO_PENDING_DIFFS.get(runtimeEditor);

    if (pendingDiffs?.length) {
      const transformed = pendingDiffs
        .map((textDiff) => transformTextDiff(textDiff, context, runtimeEditor))
        .filter(Boolean) as TextDiff[];

      EDITOR_TO_PENDING_DIFFS.set(runtimeEditor, transformed);
    }

    const pendingSelection = EDITOR_TO_PENDING_SELECTION.get(runtimeEditor);
    if (pendingSelection) {
      EDITOR_TO_PENDING_SELECTION.set(
        runtimeEditor,
        transformPendingRange(runtimeEditor, pendingSelection, context)
      );
    }

    const pendingAction = EDITOR_TO_PENDING_ACTION.get(runtimeEditor);
    if (pendingAction?.at) {
      const at = LocationApi.isPoint(pendingAction.at)
        ? transformPendingPoint(runtimeEditor, pendingAction.at, context)
        : transformPendingRange(runtimeEditor, pendingAction.at, context);

      EDITOR_TO_PENDING_ACTION.set(
        runtimeEditor,
        at ? { ...pendingAction, at } : null
      );
    }
  };

  transformPendingState(editor);
  EDITOR_TO_ROOT_VIEW_EDITORS.get(editor)?.forEach(transformPendingState);
  IS_NODE_MAP_DIRTY.set(editor, true);
};

export interface DOMEditorOptions {
  /**
   * Expose DOM clipboard insertion through `editor.api.clipboard.insertData`.
   *
   * Set to `false` when a host package owns clipboard parsing and fallback
   * insertion.
   */
  clipboard?: false;
  /**
   * Bare `DataTransfer` subtype for Plite's internal fragment payload.
   *
   * Plite writes and reads `application/${clipboardFormatKey}`.
   */
  clipboardFormatKey?: string;
}

export type DOMExtensionTypes<TClipboard extends boolean = true> = {
  api: { dom: DOMApi } & ([TClipboard] extends [true]
    ? { clipboard: DOMClipboardApi }
    : Record<never, never>);
} & ([TClipboard] extends [true]
  ? { tx: { clipboard: Pick<DOMClipboardApi, 'insertData'> } }
  : Record<never, never>);

type DOMExtensionApi = DOMExtensionTypes<false>['api'] & {
  clipboard?: DOMClipboardApi;
};

/** Editor extension installed by `dom()`. */
export type DOMExtension<TClipboard extends boolean = true> =
  EditorExtensionTypeProvider<
    (editor: EditorType) => DOMExtensionTypes<TClipboard>
  > &
    Omit<EditorExtension<EditorType>, 'api' | 'name'> & {
      api: (
        editor: EditorType,
        context: EditorExtensionConfigurationContext
      ) => DOMExtensionApi;
      name: 'dom';
    };

/** Install DOM clipboard, selection, focus, and node-resolution behavior. */
export function dom(
  options: DOMEditorOptions & { clipboard: false }
): DOMExtension<false>;
export function dom(
  options?: Omit<DOMEditorOptions, 'clipboard'> & { clipboard?: never }
): DOMExtension<true>;
export function dom(options: DOMEditorOptions): DOMExtension<boolean>;
export function dom(options: DOMEditorOptions = {}): DOMExtension<boolean> {
  const getApi = (
    editor: EditorType,
    context: EditorExtensionConfigurationContext
  ) => {
    const handlers = context.getContributions(DOM_CLIPBOARD_HANDLERS);

    const { clipboard, ...domApi } = createDOMEditorCapability(
      editor,
      handlers
    );
    const api: DOMExtensionApi = {
      dom: Object.freeze(domApi) as DOMApi,
    };

    if (options.clipboard !== false) api.clipboard = clipboard;

    return api;
  };

  const extension = defineEditorExtension<EditorType>()({
    activate(editor, context) {
      const previousActivation = DOM_ACTIVATION.get(editor);
      const previousClipboardFormatKey = getDOMClipboardFormatKey(editor);
      const previousElements = EDITOR_TO_KEY_TO_ELEMENT.get(editor);
      const activation = {};

      DOM_ACTIVATION.set(editor, activation);
      context.onCleanup(({ reason }) => {
        if (DOM_ACTIVATION.get(editor) !== activation) return;

        if (reason === 'rollback') {
          if (previousActivation) {
            DOM_ACTIVATION.set(editor, previousActivation);
          } else {
            DOM_ACTIVATION.delete(editor);
          }
          setDOMClipboardFormatKey(editor, previousClipboardFormatKey);
          if (previousElements) {
            EDITOR_TO_KEY_TO_ELEMENT.set(editor, previousElements);
          } else {
            EDITOR_TO_KEY_TO_ELEMENT.delete(editor);
          }
          return;
        }

        DOM_ACTIVATION.delete(editor);
        destroyEditorDOMPhaseSchedulerFallback(editor);
        clearDOMClipboardFormatKey(editor);
        EDITOR_TO_KEY_TO_ELEMENT.delete(editor);
      });
      setDOMClipboardFormatKey(
        editor,
        options.clipboardFormatKey ?? DEFAULT_CLIPBOARD_FORMAT_KEY
      );
      if (!EDITOR_TO_KEY_TO_ELEMENT.has(editor)) {
        EDITOR_TO_KEY_TO_ELEMENT.set(editor, new WeakMap());
      }
    },
    api: getApi,
    name: 'dom',
    on: {
      commit({ commit, editor }) {
        handleDOMCommit(editor, commit);
      },
      transactionChange(context) {
        handleDOMTransactionChange(context.editor, context);
      },
    },
    tx:
      options.clipboard === false
        ? {}
        : {
            clipboard: ((tx, editor) => ({
              insertData: (data) => {
                tx.tags.add('paste');

                return dispatchDOMClipboardHandlers(
                  getEditorExtensionContributions(
                    editor,
                    DOM_CLIPBOARD_HANDLERS
                  ),
                  data,
                  tx,
                  (nextData) =>
                    DOMEditorApi.clipboard.insertData(editor, nextData)
                );
              },
            })) satisfies EditorExtensionTxGroup<
              EditorType,
              Pick<DOMClipboardApi, 'insertData'>
            >,
          },
  });

  return extension as DOMExtension<boolean>;
}

/** Editor type with the public API installed by `dom()`. */
export type DOMEditor<
  V extends import('@platejs/plite').Value = import('@platejs/plite').Value,
> = EditorType<V, readonly [DOMExtension]>;
