import {
  type CreateEditorOptions as CoreCreateEditorOptions,
  createEditor as createCoreEditor,
  definePlugin,
  type PluginPortal,
  type PluginReference,
  type PluginsFromOptions,
  type EditorLifecycleErrorSink,
  type EditorUpdateContext,
  type EditorUpdatePolicy,
  type EditorUpdateTransaction,
  type EditorValueFromOptions,
  type Value,
} from '../..';
import type { DOMEditorOptions, DOMPlugin, DOMPluginTypes } from '../../dom';
import { dom } from '../../dom';
import {
  DOMEditor,
  EDITOR_TO_PENDING_SELECTION,
  findEditorDOMRootRuntime,
} from '../../dom/internal';
import type { AnyEditor } from '../editable/runtime-editor-api';

type AnyDOMPlugin = DOMPlugin | DOMPlugin<false> | DOMPlugin<boolean>;

/** Options for installing React over one exact DOM plugin descriptor. */
export interface ReactPluginOptions<
  TDOMPlugin extends AnyDOMPlugin = AnyDOMPlugin,
> {
  /** DOM plugin owned by this React bridge. */
  dom: TDOMPlugin;
}

/** React capability exposed through `editor.api.react`. */
export type ReactApi = {
  isComposing: () => boolean;
  isFocused: () => boolean;
  isReadOnly: () => boolean;
};

const createReactApi = (editor: AnyEditor): ReactApi =>
  Object.freeze({
    isComposing: () => DOMEditor.isComposing(editor),
    isFocused: () => DOMEditor.isFocused(editor),
    isReadOnly: () => DOMEditor.isReadOnly(editor),
  });

const createReactPlugin = <const TDOMPlugin extends AnyDOMPlugin>(
  domPlugin: TDOMPlugin
) =>
  definePlugin('react', {
    api: ({ editor }) => createReactApi(editor),
    dependencies: [domPlugin],
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

/** React plugin backed by one exact DOM dependency. */
export type ReactPlugin<TDOMPlugin extends AnyDOMPlugin = DOMPlugin> =
  ReturnType<typeof createReactPlugin<TDOMPlugin>>;

/**
 * Installs the DOM bridge and exposes React focus, read-only, and composition
 * APIs through the editor plugin system.
 */
export const react = <const TDOMPlugin extends AnyDOMPlugin>({
  dom: domPlugin,
}: ReactPluginOptions<TDOMPlugin>): ReactPlugin<TDOMPlugin> =>
  createReactPlugin(domPlugin);

type ReactDefaultPlugins<TPlugins extends readonly unknown[]> = readonly [
  ...TPlugins,
  DOMPlugin,
  ReactPlugin,
];
type EditorBase<
  V extends Value,
  TPlugins extends readonly unknown[],
> = AnyEditor<V, ReactDefaultPlugins<TPlugins>>;
/** AnyEditor type with the React and DOM plugins installed. */
export type Editor<
  V extends Value = Value,
  TPlugins extends readonly unknown[] = readonly [],
> = Omit<EditorBase<V, TPlugins>, 'api' | 'update'> & {
  readonly api: EditorBase<V, TPlugins>['api'] &
    DOMPluginTypes['api'] & { react: ReactApi };
  update: EditorBase<V, TPlugins>['update'] & DOMPluginTypes['update'];
};

/** React-only editor context value used by lower-level provider internals. */
export type EditorContextValue<V extends Value = Value> = Omit<
  Editor<V>,
  'plugin' | 'update'
> & {
  plugin: Editor<V>['plugin'] &
    (<const TPlugin extends PluginReference>(
      plugin: TPlugin
    ) => PluginPortal<TPlugin, V>);
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
  TPlugins extends readonly unknown[] = readonly [],
> = Omit<CoreCreateEditorOptions<V, TPlugins>, 'lifecycleErrorSink'> &
  Pick<DOMEditorOptions, 'clipboardFormatKey'> & {
    lifecycleErrorSink?: EditorLifecycleErrorSink<Editor<V, TPlugins>>;
  };

export function createEditor<
  const TOptions extends CreateEditorOptions<any, readonly unknown[]> & {
    plugins: readonly unknown[];
  },
>(
  options: TOptions
): Editor<EditorValueFromOptions<TOptions>, PluginsFromOptions<TOptions>>;

export function createEditor<
  V extends Value = Value,
  const TPlugins extends readonly unknown[] = readonly [],
>(options?: CreateEditorOptions<V, TPlugins>): Editor<V, TPlugins>;

/**
 * Creates a React editor with the React bridge installed before custom
 * plugins. Install history explicitly when the editor needs undo/redo.
 */
export function createEditor<
  V extends Value = Value,
  const TPlugins extends readonly unknown[] = readonly [],
>(options: CreateEditorOptions<V, TPlugins> = {}): Editor<V, TPlugins> {
  const {
    clipboardFormatKey,
    plugins: authoredPlugins,
    lifecycleErrorSink,
    ...editorOptions
  } = options;
  const exactDOMPlugin = dom({ clipboardFormatKey });
  const installedPlugins = [
    react({ dom: exactDOMPlugin }),
    ...((authoredPlugins ?? []) as TPlugins),
  ] as const;

  return createCoreEditor<V, typeof installedPlugins>({
    ...editorOptions,
    plugins: installedPlugins,
    lifecycleErrorSink: lifecycleErrorSink as EditorLifecycleErrorSink<
      AnyEditor<V, typeof installedPlugins>
    >,
  }) as unknown as Editor<V, TPlugins>;
}
