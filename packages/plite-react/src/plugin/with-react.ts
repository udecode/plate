import {
  type CreateEditorOptions,
  createEditor,
  defineExtension,
  type EditorExtensionPortal,
  type EditorExtensionReference,
  type EditorLifecycleErrorSink,
  type EditorUpdateContext,
  type EditorUpdatePolicy,
  type EditorUpdateTransaction,
  type EditorExtensionsFromOptions,
  type EditorValueFromOptions,
  type Value,
} from '@platejs/plite';
import type {
  DOMEditorOptions,
  DOMExtension,
  DOMExtensionTypes,
} from '@platejs/plite-dom';
import { dom } from '@platejs/plite-dom';
import {
  DOMEditor,
  EDITOR_TO_PENDING_SELECTION,
  findEditorDOMRootRuntime,
} from '@platejs/plite-dom/internal';
import type { AnyEditor } from '../editable/runtime-editor-api';
import { refreshEditorDecorations } from '../decoration-refresh';
import type { PliteProjectionStoreRefreshOptions } from '../projection-store';

type AnyDOMExtension =
  | DOMExtension<true>
  | DOMExtension<false>
  | DOMExtension<boolean>;

/** Options for installing React over one exact DOM extension descriptor. */
export interface ReactEditorOptions<
  TDOMExtension extends AnyDOMExtension = AnyDOMExtension,
> {
  /** DOM extension owned by this React bridge. */
  dom: TDOMExtension;
}

/** React capability exposed through `editor.api.react`. */
export type ReactApi = {
  refreshDecorations: (options?: PliteProjectionStoreRefreshOptions) => void;
  isComposing: () => boolean;
  isFocused: () => boolean;
  isReadOnly: () => boolean;
};

const createReactApi = (editor: AnyEditor): ReactApi =>
  Object.freeze({
    refreshDecorations: (options) => {
      refreshEditorDecorations(editor, {
        ...options,
        reason: options?.reason ?? 'external',
        requiresDOMSelectionExport:
          options?.requiresDOMSelectionExport ?? DOMEditor.isFocused(editor),
      });
    },
    isComposing: () => DOMEditor.isComposing(editor),
    isFocused: () => DOMEditor.isFocused(editor),
    isReadOnly: () => DOMEditor.isReadOnly(editor),
  });

const createReactExtension = <const TDOMExtension extends AnyDOMExtension>(
  domExtension: TDOMExtension
) =>
  defineExtension('react', {
    api: ({ editor }) => createReactApi(editor),
    dependencies: [domExtension],
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

/** React extension backed by one exact DOM dependency. */
export type ReactExtension<
  TDOMExtension extends AnyDOMExtension = DOMExtension<true>,
> = ReturnType<typeof createReactExtension<TDOMExtension>>;

/**
 * Installs the DOM bridge and exposes React focus, read-only, and composition
 * APIs through the editor extension system.
 */
export const react = <const TDOMExtension extends AnyDOMExtension>({
  dom: domExtension,
}: ReactEditorOptions<TDOMExtension>): ReactExtension<TDOMExtension> =>
  createReactExtension(domExtension);

type ReactDefaultExtensions<TExtensions extends readonly unknown[]> = readonly [
  ...TExtensions,
  DOMExtension<true>,
  ReactExtension,
];
type ReactEditorBase<
  V extends Value,
  TExtensions extends readonly unknown[],
> = AnyEditor<V, ReactDefaultExtensions<TExtensions>>;
/** AnyEditor type with Plite React and DOM extensions installed. */
export type ReactEditor<
  V extends Value = Value,
  TExtensions extends readonly unknown[] = readonly [],
> = Omit<ReactEditorBase<V, TExtensions>, 'api' | 'update'> & {
  readonly api: ReactEditorBase<V, TExtensions>['api'] &
    DOMExtensionTypes<true>['api'] & { react: ReactApi };
  update: ReactEditorBase<V, TExtensions>['update'] &
    DOMExtensionTypes<true>['update'];
};

/** React-only editor context value used by lower-level provider internals. */
export type ReactEditorContextValue<V extends Value = Value> = Omit<
  ReactEditor<V>,
  'extension' | 'update'
> & {
  extension: ReactEditor<V>['extension'] &
    (<const TExtension extends EditorExtensionReference>(
      extension: TExtension
    ) => EditorExtensionPortal<TExtension, V>);
  update: ReactEditor<V>['update'] &
    ((
      policy: EditorUpdatePolicy,
      fn: (
        tx: EditorUpdateTransaction<V, any>,
        context: EditorUpdateContext<ReactEditor<V>>
      ) => void
    ) => void);
};

/** Options for `createReactEditor`. */
export type CreateReactEditorOptions<
  V extends Value = Value,
  TExtensions extends readonly unknown[] = readonly [],
> = Omit<CreateEditorOptions<V, TExtensions>, 'lifecycleErrorSink'> &
  Pick<DOMEditorOptions, 'clipboardFormatKey'> & {
    lifecycleErrorSink?: EditorLifecycleErrorSink<ReactEditor<V, TExtensions>>;
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
 * Creates a React editor with the React bridge installed before custom
 * extensions. Install history explicitly when the editor needs undo/redo.
 */
export function createReactEditor<
  V extends Value = Value,
  const TExtensions extends readonly unknown[] = readonly [],
>(
  options: CreateReactEditorOptions<V, TExtensions> = {}
): ReactEditor<V, TExtensions> {
  const {
    clipboardFormatKey,
    extensions,
    lifecycleErrorSink,
    ...editorOptions
  } = options;
  const exactDOMExtension = dom({ clipboardFormatKey });
  const editorExtensions = [
    react({ dom: exactDOMExtension }),
    ...((extensions ?? []) as TExtensions),
  ] as const;

  return createEditor<V, typeof editorExtensions>({
    ...editorOptions,
    extensions: editorExtensions,
    lifecycleErrorSink: lifecycleErrorSink as EditorLifecycleErrorSink<
      AnyEditor<V, typeof editorExtensions>
    >,
  }) as unknown as ReactEditor<V, TExtensions>;
}
