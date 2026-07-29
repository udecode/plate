import {
  type CreateEditorOptions,
  createEditor,
  defineEditorExtension,
  type Editor,
  type EditorExtensionsFromOptions,
  type EditorExtension,
  type EditorExtensionConfigurationEditor,
  type EditorExtensionConfigurationContext,
  type EditorExtensionTypeProvider,
  type EditorValueFromOptions,
  type Value,
} from '@platejs/plite';
import type {
  DOMApi,
  DOMClipboardApi,
  DOMEditorOptions,
  DOMExtension,
} from '@platejs/plite-dom';
import { dom } from '@platejs/plite-dom';
import {
  EDITOR_TO_PENDING_SELECTION,
  findEditorDOMRootRuntime,
} from '@platejs/plite-dom/internal';
import { history, type HistoryExtension } from '@platejs/plite-history';
import { refreshEditorDecorations } from '../decoration-refresh';
import type { PliteProjectionStoreRefreshOptions } from '../projection-store';

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
  'api' | 'dependencies' | 'name' | 'state' | 'tx'
> &
  EditorExtensionTypeProvider<(editor: Editor) => ReactExtensionTypes> & {
    api: (
      editor: EditorExtensionConfigurationEditor<Editor>,
      context: EditorExtensionConfigurationContext
    ) => ReactExtensionTypes['api'];
    dependencies: readonly [DOMExtension<true>];
    name: 'react';
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
export const react = (options: ReactEditorOptions = {}): ReactExtension => {
  const { clipboard: _clipboard, ...domOptions } = options;
  const domExtension = dom(domOptions);

  const extension = defineEditorExtension<Editor>()({
    api(editor, context) {
      const api = domExtension.api(editor, context);

      if (!api.clipboard) {
        throw new Error('React editor DOM clipboard capability is missing.');
      }

      return {
        ...api,
        clipboard: api.clipboard,
        react: createReactApi(editor, api.dom),
      };
    },
    dependencies: [domExtension],
    name: 'react',
    on: {
      commit(context) {
        if (
          context.commit.changed.hasAny('text') &&
          findEditorDOMRootRuntime(context.editor)?.isAndroidHost
        ) {
          EDITOR_TO_PENDING_SELECTION.delete(context.editor);
        }
      },
    },
  });

  return extension as ReactExtension;
};

export function createReactEditor<
  const TOptions extends CreateReactEditorOptions<any, readonly unknown[]> & {
    extensions: readonly unknown[];
  },
>(
  options: TOptions
): ReactEditor<
  EditorValueFromOptions<TOptions>,
  EditorExtensionsFromOptions<TOptions>
>;

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
