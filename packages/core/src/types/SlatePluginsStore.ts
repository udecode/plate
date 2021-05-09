import { Editor } from 'slate';
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

export type SlatePluginsState<T extends SPEditor = SPEditor> = {
  /**
   * Slate editor reference.
   * @default pipe(createEditor(), withSlatePlugins({ id, plugins, options, components }))
   */
  editor?: T;

  /**
   * A key that is incremented on each editor change.
   */
  keyChange?: number;

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

  selection: Editor['selection'];

  /**
   * Editor value.
   * @default [{ children: [{ text: '' }]}]
   */
  value: TDescendant[];
};

/**
 * @see {@link EditorId}
 */
export type SlatePluginsStates<T extends SPEditor = SPEditor> = Record<
  string,
  SlatePluginsState<T>
>;

export type SlatePluginsActions<T extends SPEditor = SPEditor> = {
  /**
   * Remove state by id. Called by `SlatePlugins` on unmount.
   */
  clearState: (id?: string) => void;

  /**
   * Set initial state by id. Called by `SlatePlugins` on mount.
   */
  setInitialState: (value?: Partial<SlatePluginsState<T>>, id?: string) => void;

  /**
   * Set a new editor with slate plugins.
   */
  resetEditor: (id?: string) => void;

  setEditor: (value: SlatePluginsState<T>['editor'], id?: string) => void;
  setSelection: (value: SlatePluginsState<T>['selection'], id?: string) => void;
  incrementKeyChange: (id?: string) => void;
  setEnabled: (value: SlatePluginsState<T>['enabled'], id?: string) => void;
  setPlugins: (value: SlatePluginsState<T>['plugins'], id?: string) => void;
  setPluginKeys: (
    value: SlatePluginsState<T>['pluginKeys'],
    id?: string
  ) => void;
  setValue: (value: SlatePluginsState<T>['value'], id?: string) => void;
};
