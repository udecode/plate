import {
  type CreateEditorOptions,
  createEditor,
  defineEditorExtension,
  type Editor,
  type EditorExtension,
  type EditorExtensionSetupContext,
  type EditorStateExtensionGroups,
  type EditorStatePatch,
  type EditorTxExtensionGroups,
  type Operation,
  type Range,
  type Value,
} from '@platejs/plite';
import type {
  DOMApi,
  DOMClipboardApi,
  DOMEditorOptions,
} from '@platejs/plite-dom';
import {
  EDITOR_TO_PENDING_SELECTION,
  installDOM,
} from '@platejs/plite-dom/internal';
import { history } from '@platejs/plite-history';
import {
  getEditorTransformRegistry,
  setEditorTransformRegistry,
} from '../editable/runtime-editor-api';

const ANDROID_USER_AGENT_RE = /Android/;

/** Options for installing the React DOM bridge on an editor. */
export interface ReactEditorOptions extends DOMEditorOptions {}

/** React capability exposed through `editor.api.react`. */
export type ReactApi = {
  isComposing: () => boolean;
  isFocused: () => boolean;
  isReadOnly: () => boolean;
};

type ReactHistoryBatch<V extends Value = Value> = {
  operations: Operation<V>[];
  selectionBefore: Range | null;
  selectionBeforeRoot?: string;
  statePatches: EditorStatePatch[];
};

type ReactHistoryStateFallback<V extends Value = Value> = {
  get: () => {
    redos: ReactHistoryBatch<V>[];
    undos: ReactHistoryBatch<V>[];
  };
  redos: () => readonly ReactHistoryBatch<V>[];
  undos: () => readonly ReactHistoryBatch<V>[];
};

type ReactHistoryStateKey<V extends Value = Value> = Extract<
  'history',
  keyof EditorStateExtensionGroups<V>
>;

type ReactHistoryStateApi<V extends Value = Value> = [
  ReactHistoryStateKey<V>,
] extends [never]
  ? ReactHistoryStateFallback<V>
  : EditorStateExtensionGroups<V>[ReactHistoryStateKey<V>];

type ReactHistoryTxKey<V extends Value = Value> = Extract<
  'history',
  keyof EditorTxExtensionGroups<V>
>;

type ReactHistoryTxFallback = {
  redo: () => void;
  undo: () => void;
};

type ReactHistoryTxApi<V extends Value = Value> = [
  ReactHistoryTxKey<V>,
] extends [never]
  ? ReactHistoryTxFallback
  : EditorTxExtensionGroups<V>[ReactHistoryTxKey<V>];

type ReactHistoryControlApi = {
  isMerging: () => boolean | undefined;
  isSaving: () => boolean | undefined;
  withMerging: (fn: () => void) => void;
  withNewBatch: (fn: () => void) => void;
  withoutMerging: (fn: () => void) => void;
  withoutSaving: (fn: () => void) => void;
};

/** Editor extension installed by `react()`. */
export type ReactExtension = EditorExtension<Editor> & {
  conflicts: readonly ['dom'];
  name: 'react';
  setup: (context: EditorExtensionSetupContext<Editor>) => {
    api: {
      clipboard: DOMClipboardApi;
      dom: DOMApi;
      react: ReactApi;
    };
  };
};
type HistoryExtension = {
  api: {
    history: ReactHistoryControlApi;
  };
  name: 'history';
  state: {
    history: <V extends Value>(
      _state: unknown,
      editor: Editor<V>
    ) => ReactHistoryStateApi<V>;
  };
  tx: {
    history: <V extends Value>(
      _tx: unknown,
      editor: Editor<V>
    ) => ReactHistoryTxApi<V>;
  };
};
type ReactDefaultExtensions<TExtensions extends readonly unknown[]> = readonly [
  ReactExtension,
  HistoryExtension,
  ...TExtensions,
];
/** Editor type with Plite React, DOM, and history extensions installed. */
export type ReactEditor<
  V extends Value = Value,
  TExtensions extends readonly unknown[] = readonly [],
> = Editor<V, ReactDefaultExtensions<TExtensions>>;

/** React-only editor context value used by lower-level provider internals. */
export type ReactEditorContextValue<V extends Value = Value> = Omit<
  Editor<V, readonly [ReactExtension]>,
  'api' | 'getApi'
> & {
  api: Editor<V, readonly [ReactExtension]>['api'];
  getApi: Editor<V, readonly [ReactExtension]>['getApi'];
};

/** Options for `createReactEditor`. */
export type CreateReactEditorOptions<
  V extends Value = Value,
  TExtensions extends readonly unknown[] = readonly [],
> = CreateEditorOptions<V, TExtensions> & ReactEditorOptions;

const installReactTransforms = (editor: Editor) => {
  const transforms = getEditorTransformRegistry(editor);

  if (
    typeof navigator !== 'undefined' &&
    ANDROID_USER_AGENT_RE.test(navigator.userAgent)
  ) {
    setEditorTransformRegistry(editor, {
      ...transforms,
      insertText: (text, options) => {
        // COMPAT: Android devices can apply pending selection after insertText.
        EDITOR_TO_PENDING_SELECTION.delete(editor);

        return transforms.insertText(text, options);
      },
    });
  }
};

const createReactApi = (domApi: DOMApi): ReactApi =>
  Object.freeze({
    isComposing: () => domApi.isComposing(),
    isFocused: () => domApi.isFocused(),
    isReadOnly: () => domApi.isReadOnly(),
  });

/**
 * Installs the DOM bridge and exposes React focus, read-only, and composition
 * APIs through the editor extension system.
 */
export const react = (options: ReactEditorOptions = {}): ReactExtension =>
  defineEditorExtension({
    conflicts: ['dom'],
    name: 'react',
    setup(context: EditorExtensionSetupContext<Editor>) {
      const editor = installDOM(context.editor, options);
      const { clipboard, ...domApi } = editor.dom;

      Reflect.deleteProperty(editor, 'dom');
      installReactTransforms(editor);

      const frozenDOMApi = Object.freeze(domApi) as DOMApi;

      return {
        api: {
          clipboard,
          dom: frozenDOMApi,
          react: createReactApi(frozenDOMApi),
        },
      };
    },
  });

export function createReactEditor<
  V extends Value = Value,
  const TExtensions extends readonly unknown[] = readonly [],
>(
  options?: CreateReactEditorOptions<V, TExtensions>
): ReactEditor<V, TExtensions>;

/**
 * Creates a React editor with the React bridge and history extension installed
 * before any custom extensions.
 */
export function createReactEditor<
  V extends Value = Value,
  const TExtensions extends readonly unknown[] = readonly [],
>(
  options: CreateReactEditorOptions<V, TExtensions> = {}
): ReactEditor<V, TExtensions> {
  const { clipboardFormatKey, extensions, ...editorOptions } = options;
  const reactOptions = { clipboardFormatKey };
  const editorExtensions = [
    react(reactOptions),
    history(),
    ...((extensions ?? []) as TExtensions),
  ] as const;

  return createEditor({
    ...editorOptions,
    extensions: editorExtensions,
  }) as ReactEditor<V, TExtensions>;
}
