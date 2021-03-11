import { FunctionComponent } from 'react';
import { Node } from 'slate';
import { SlatePlugin } from './SlatePlugin';

export interface SlatePluginOptions {
  [key: string]: any;

  /**
   * Element or mark type.
   */
  type: string;

  /**
   * Element or mark React component.
   */
  component?: FunctionComponent;

  // nodeToProps
  // defaultType
  // hotkey
}

export type SlatePluginOptionKey = keyof SlatePluginOptions;

export type SlatePluginsOptions = Record<string, SlatePluginOptions>;

export type State = {
  /**
   * Options for each key.
   */
  options: SlatePluginsOptions;

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
  elementKeys: string[];

  /**
   * Editor value. Default is `[{children: [{text: ''}]}]`.
   */
  value: Node[];
};

export type SlatePluginsState = { byId: Record<string, State> };

export type SlatePluginsActions = {
  setInitialState: (id?: string) => void;
  setOption: (
    value: {
      pluginKey: string;
      optionKey: SlatePluginOptionKey;
      value: any;
    },
    id?: string
  ) => void;
  setOptions: (value: State['options'], id?: string) => void;
  setEditor: (value: State['editor'], id?: string) => void;
  setPlugins: (value: State['plugins'], id?: string) => void;
  setElementKeys: (value: State['elementKeys'], id?: string) => void;
  setWithPlugins: (value: any[], id?: string) => void;
  setValue: (value: State['value'], id?: string) => void;
  resetEditorKey: (id?: string) => void;
};

export type SlatePluginsStore = SlatePluginsState & SlatePluginsActions;
