import {
  type CreateEditorOptions as CoreCreateEditorOptions,
  createEditor as createCoreEditor,
  defineExtension,
  type EditorExtensionPortal,
  type EditorExtensionReference,
  type EditorExtensionsFromOptions,
  type EditorLifecycleErrorSink,
  type EditorUpdateContext,
  type EditorUpdatePolicy,
  type EditorUpdateTransaction,
  type EditorValueFromOptions,
  type Value,
} from '../..';
import type {
  DOMEditorOptions,
  DOMExtension,
  DOMExtensionTypes,
} from '../../dom';
import { dom } from '../../dom';
import {
  DOMEditor,
  EDITOR_TO_PENDING_SELECTION,
  findEditorDOMRootRuntime,
} from '../../dom/internal';
import { refreshEditorDecorations } from '../decoration-refresh';
import type { AnyEditor } from '../editable/runtime-editor-api';
import type { PliteProjectionStoreRefreshOptions } from '../projection-store';

type AnyDOMExtension =
  | DOMExtension
  | DOMExtension<false>
  | DOMExtension<boolean>;

/** Options for installing React over one exact DOM extension descriptor. */
export interface ReactExtensionOptions<
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
  TDOMExtension extends AnyDOMExtension = DOMExtension,
> = ReturnType<typeof createReactExtension<TDOMExtension>>;

/**
 * Installs the DOM bridge and exposes React focus, read-only, and composition
 * APIs through the editor extension system.
 */
export const react = <const TDOMExtension extends AnyDOMExtension>({
  dom: domExtension,
}: ReactExtensionOptions<TDOMExtension>): ReactExtension<TDOMExtension> =>
  createReactExtension(domExtension);

type ReactDefaultExtensions<TExtensions extends readonly unknown[]> = readonly [
  ...TExtensions,
  DOMExtension,
  ReactExtension,
];
type EditorBase<
  V extends Value,
  TExtensions extends readonly unknown[],
> = AnyEditor<V, ReactDefaultExtensions<TExtensions>>;
/** AnyEditor type with Plite React and DOM extensions installed. */
export type Editor<
  V extends Value = Value,
  TExtensions extends readonly unknown[] = readonly [],
> = Omit<EditorBase<V, TExtensions>, 'api' | 'update'> & {
  readonly api: EditorBase<V, TExtensions>['api'] &
    DOMExtensionTypes['api'] & { react: ReactApi };
  update: EditorBase<V, TExtensions>['update'] & DOMExtensionTypes['update'];
};

/** React-only editor context value used by lower-level provider internals. */
export type EditorContextValue<V extends Value = Value> = Omit<
  Editor<V>,
  'extension' | 'update'
> & {
  extension: Editor<V>['extension'] &
    (<const TExtension extends EditorExtensionReference>(
      extension: TExtension
    ) => EditorExtensionPortal<TExtension, V>);
  update: Editor<V>['update'] &
    ((
      policy: EditorUpdatePolicy,
      fn: (
        tx: EditorUpdateTransaction<V, any>,
        context: EditorUpdateContext<Editor<V>>
      ) => void
    ) => void);
};

/** Options for `createEditor`. */
export type CreateEditorOptions<
  V extends Value = Value,
  TExtensions extends readonly unknown[] = readonly [],
> = Omit<CoreCreateEditorOptions<V, TExtensions>, 'lifecycleErrorSink'> &
  Pick<DOMEditorOptions, 'clipboardFormatKey'> & {
    lifecycleErrorSink?: EditorLifecycleErrorSink<Editor<V, TExtensions>>;
  };

export function createEditor<
  const TOptions extends CreateEditorOptions<any, readonly unknown[]> & {
    extensions: readonly unknown[];
  },
>(
  options: TOptions
): Editor<
  EditorValueFromOptions<TOptions>,
  EditorExtensionsFromOptions<TOptions>
>;

export function createEditor<
  V extends Value = Value,
  const TExtensions extends readonly unknown[] = readonly [],
>(options?: CreateEditorOptions<V, TExtensions>): Editor<V, TExtensions>;

/**
 * Creates a React editor with the React bridge installed before custom
 * extensions. Install history explicitly when the editor needs undo/redo.
 */
export function createEditor<
  V extends Value = Value,
  const TExtensions extends readonly unknown[] = readonly [],
>(options: CreateEditorOptions<V, TExtensions> = {}): Editor<V, TExtensions> {
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

  return createCoreEditor<V, typeof editorExtensions>({
    ...editorOptions,
    extensions: editorExtensions,
    lifecycleErrorSink: lifecycleErrorSink as EditorLifecycleErrorSink<
      AnyEditor<V, typeof editorExtensions>
    >,
  }) as unknown as Editor<V, TExtensions>;
}
