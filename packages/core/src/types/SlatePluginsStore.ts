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

export type State = {
  /**
   * Slate editor. Default uses `withReact`, `withHistoryPersist` and `withRandomKey` plugins.
   */
  editor?: SPEditor;

  /**
   * If true, slate plugins will create the editor.
   * If false, slate plugins will delete the editor.
   * @default true
   */
  enabled?: boolean;

  /**
   * Slate plugins. Default is [].
   */
  plugins: SlatePlugin[];

  /**
   * Element keys used by the plugins
   */
  pluginKeys: string[];

  /**
   * Editor value. Default is `[{children: [{text: ''}]}]`.
   */
  value: TDescendant[];
};

/**
 * @see {@link EditorId}
 */
export type SlatePluginsState = Record<string, State>;

export type SlatePluginsActions = {
  /**
   * Remove state by id. Called by SlatePlugins on unmount.
   */
  clearState: (id?: string) => void;

  /**
   * Set initial state by id. Called by SlatePlugins on mount.
   */
  setInitialState: (value?: Partial<State>, id?: string) => void;

  /**
   * Set a new editor with slate plugins.
   */
  resetEditor: (id?: string) => void;

  setEditor: (value: State['editor'], id?: string) => void;
  setEnabled: (value: State['enabled'], id?: string) => void;
  setPlugins: (value: State['plugins'], id?: string) => void;
  setPluginKeys: (value: State['pluginKeys'], id?: string) => void;
  setValue: (value: State['value'], id?: string) => void;
};
