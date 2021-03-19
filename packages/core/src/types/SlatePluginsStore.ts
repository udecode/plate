import { Node } from 'slate';
import { SlatePlugin } from './SlatePlugin/SlatePlugin';
import { SlatePluginsOptions } from './SlatePluginOptions/SlatePluginsOptions';

export type State = {
  /**
   * Slate editor. Default uses `withReact`, `withHistoryPersist` and `withRandomKey` plugins.
   */
  editor?: unknown;

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
  value: Node[];
};

export type SlatePluginsState = Record<string, State>;

export type SlatePluginsActions = {
  clearState: (id?: string) => void;
  setInitialState: (id?: string) => void;
  setEditor: (
    value: {
      editor?: State['editor'];
      plugins?: SlatePlugin[];
      options?: SlatePluginsOptions;
    },
    id?: string
  ) => void;
  setPlugins: (value: State['plugins'], id?: string) => void;
  setPluginKeys: (value: State['pluginKeys'], id?: string) => void;
  setValue: (value: State['value'], id?: string) => void;
  resetEditorKey: (id?: string) => void;
};
