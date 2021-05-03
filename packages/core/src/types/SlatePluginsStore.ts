import { SlatePlugin } from './SlatePlugin/SlatePlugin';
import { SPEditor } from './SPEditor';
import { TDescendant } from './TDescendant';

/**
 * A unique id used to store the editor state by id.
 * Required if rendering multiple `SlatePlugins`.
 * Optional otherwise.
 * @default 'main'
 */
export type EditorId = string | null | undefined;

export type State<T extends SPEditor = SPEditor> = {
  /**
   * Slate editor reference.
   * @default pipe(createEditor(), withSlatePlugins({ id, plugins, options, components }))
   */
  editorRef?: T;

  /**
   * Slate editor state.
   * @default pipe(createEditor(), withSlatePlugins({ id, plugins, options, components }))
   */
  editorState?: T;

  /**
   * If true, slate plugins will create the editor with `withSlatePlugins`.
   * If false, slate plugins will remove the editor from the store.
   * @default true
   */
  enabled?: boolean;

  /**
   * Slate plugins.
   * @default [createReactPlugin(), createHistoryPlugin()]
   */
  plugins: SlatePlugin<T>[];

  /**
   * Element keys used by the plugins
   */
  pluginKeys: string[];

  /**
   * Editor value.
   * @default [{ children: [{ text: '' }]}]
   */
  value: TDescendant[];
};

/**
 * @see {@link EditorId}
 */
export type SlatePluginsState<T extends SPEditor = SPEditor> = Record<
  string,
  State<T>
>;

export type SlatePluginsActions<T extends SPEditor = SPEditor> = {
  /**
   * Remove state by id. Called by `SlatePlugins` on unmount.
   */
  clearState: (id?: string) => void;

  /**
   * Set initial state by id. Called by `SlatePlugins` on mount.
   */
  setInitialState: (value?: Partial<State<T>>, id?: string) => void;

  /**
   * Set a new editor with slate plugins.
   */
  resetEditor: (id?: string) => void;

  setEditorRef: (value: State<T>['editorRef'], id?: string) => void;
  setEditorState: (value: State<T>['editorState'], id?: string) => void;

  setEnabled: (value: State<T>['enabled'], id?: string) => void;
  setPlugins: (value: State<T>['plugins'], id?: string) => void;
  setPluginKeys: (value: State<T>['pluginKeys'], id?: string) => void;
  setValue: (value: State<T>['value'], id?: string) => void;
};
