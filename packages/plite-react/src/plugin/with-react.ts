import {
  type CreateEditorOptions,
  createEditor,
  defineEditorExtension,
  type Editor,
  type EditorExtension,
  type EditorExtensionSetupContext,
  type EditorExtensionTypeProvider,
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
import { history, type HistoryExtension } from '@platejs/plite-history';
import { refreshEditorDecorations } from '../decoration-refresh';
import {
  getEditorTransformRegistry,
  setEditorTransformRegistry,
} from '../editable/runtime-editor-api';
import type { PliteProjectionStoreRefreshOptions } from '../projection-store';

const ANDROID_USER_AGENT_RE = /Android/;

/** Options for installing the React DOM bridge on an editor. */
export interface ReactEditorOptions extends DOMEditorOptions {}

/** React capability exposed through `editor.api.react`. */
export type ReactApi = {
  refreshDecorations: (options?: PliteProjectionStoreRefreshOptions) => void;
  isComposing: () => boolean;
  isFocused: () => boolean;
  isReadOnly: () => boolean;
};

export type ReactExtensionTypes = {
  api: {
    clipboard: DOMClipboardApi;
    dom: DOMApi;
    react: ReactApi;
  };
};

/** Editor extension installed by `react()`. */
export type ReactExtension = Omit<
  EditorExtension<Editor>,
  'api' | 'conflicts' | 'name' | 'setup' | 'state' | 'tx'
> &
  EditorExtensionTypeProvider<(editor: Editor) => ReactExtensionTypes> & {
    conflicts: readonly ['dom'];
    name: 'react';
    setup: (context: EditorExtensionSetupContext<Editor>) => {
      api: ReactExtensionTypes['api'];
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

const createReactApi = (editor: Editor, domApi: DOMApi): ReactApi =>
  Object.freeze({
    refreshDecorations: (options) => {
      refreshEditorDecorations(editor, {
        ...options,
        reason: options?.reason ?? 'external',
        requiresDOMSelectionExport:
          options?.requiresDOMSelectionExport ?? domApi.isFocused(),
      });
    },
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
          react: createReactApi(editor, frozenDOMApi),
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
