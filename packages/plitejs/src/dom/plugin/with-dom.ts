import {
  definePlugin,
  type EditorCommit,
  type Plugin,
  type PluginApiFactoryContext,
  type EditorTransactionChangeContext,
  LocationApi,
  type Editor as EditorType,
} from '../..';
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
  domCommands,
  getDOMClipboardFormatKey,
  setDOMClipboardFormatKey,
} from './dom-clipboard-runtime';
import {
  createDOMEditorCapability,
  type DOMApi,
  type DOMClipboardApi,
} from './dom-editor';
import { destroyEditorDOMPhaseSchedulerFallback } from './dom-phase-scheduler';

const DEFAULT_CLIPBOARD_FORMAT_KEY = 'x-editor-fragment';
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
   * Expose DOM clipboard insertion through
   * `editor.api.dom.clipboard.insertData`.
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

export type DOMPluginTypes<TClipboard extends boolean = true> = {
  api: {
    dom: DOMApi &
      ([TClipboard] extends [true]
        ? { clipboard: DOMClipboardApi }
        : { clipboard?: never });
  };
} & ([TClipboard] extends [true]
  ? { update: { dom: Pick<DOMClipboardApi, 'insertData'> } }
  : Record<never, never>);

type DOMPluginApi = DOMApi & {
  clipboard?: DOMClipboardApi;
};

type DOMPluginDefinition<TClipboard extends boolean> = {
  activate: true;
  api: DOMPluginTypes<TClipboard>['api']['dom'];
  name: 'dom';
  on: true;
} & ([TClipboard] extends [true]
  ? { update: Pick<DOMClipboardApi, 'insertData'> }
  : Record<never, never>);

/** Editor plugin installed by `dom()`. */
export type DOMPlugin<TClipboard extends boolean = true> = Plugin<
  DOMPluginDefinition<TClipboard>
>;

/** Install DOM clipboard, selection, focus, and node-resolution behavior. */
export function dom(
  options: DOMEditorOptions & { clipboard: false }
): DOMPlugin<false>;
export function dom(
  options?: Omit<DOMEditorOptions, 'clipboard'> & { clipboard?: never }
): DOMPlugin;
export function dom(options: DOMEditorOptions): DOMPlugin<boolean>;
export function dom(
  options: DOMEditorOptions = {}
): DOMPlugin | DOMPlugin<false> | DOMPlugin<boolean> {
  const createApi = ({ editor }: PluginApiFactoryContext) => {
    const { clipboard, ...domApi } = createDOMEditorCapability(editor);
    return Object.freeze({
      ...domApi,
      ...(options.clipboard === false ? {} : { clipboard }),
    }) as DOMPluginApi;
  };

  const plugin = definePlugin('dom', {
    activate(context) {
      const { editor } = context;
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
    api: createApi,
    ...(options.clipboard === false
      ? {}
      : {
          commands: ({ around }) => [
            around(domCommands.insertData, ({ next, state }) => {
              const result = next();

              return result === false
                ? false
                : state.transaction.extend(result, (tx) => {
                    tx.tags.add('paste');
                  });
            }),
          ],
        }),
    on: {
      commit({ commit, editor }) {
        handleDOMCommit(editor, commit);
      },
      transactionChange(context) {
        handleDOMTransactionChange(context.editor, context);
      },
    },
    ...(options.clipboard === false
      ? {}
      : {
          update: ({ tx }) => ({
            insertData: (data: DataTransfer) =>
              tx.command(domCommands.insertData, data),
          }),
        }),
  });

  return plugin as unknown as DOMPlugin<boolean>;
}

/** Editor with the DOM capability installed over its exact plugin set. */
export type DOMEditor<
  V extends import('../..').Value = import('../..').Value,
  TPlugins extends readonly unknown[] = readonly [],
> = Omit<EditorType<V, TPlugins>, 'api' | 'update'> & {
  readonly api: EditorType<V, TPlugins>['api'] & DOMPluginTypes['api'];
  update: EditorType<V, TPlugins>['update'] & DOMPluginTypes['update'];
};
