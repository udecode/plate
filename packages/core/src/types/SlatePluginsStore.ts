import { FunctionComponent } from 'react';
import { Node } from 'slate';
import { SlatePlugin } from './SlatePlugin';

export interface SlatePluginOptionsByKey {
  /**
   * Element or mark type.
   */
  type?: string;

  /**
   * Element or mark React component.
   */
  component?: FunctionComponent;
}

export type SlatePluginOptionKey = keyof SlatePluginOptionsByKey;

export type SlatePluginOptions = Record<string, SlatePluginOptionsByKey>;

export type State = {
  /**
   * Options for each key.
   */
  options: SlatePluginOptions;

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
      optionKey: string;
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
};

export type SlatePluginsStore = SlatePluginsState & SlatePluginsActions;
