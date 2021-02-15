import { FunctionComponent } from 'react';
import { SlatePlugin } from '../../types';

export type SlatePluginsState = {
  /**
   * Components by type rendered by plugins `renderElement` and `renderLeaf`. Default is {}.
   * TODO: typed key
   */
  components: Record<string, FunctionComponent>;

  /**
   * Slate editor. Default uses `withReact` and `withHistory` plugins.
   */
  editor?: unknown;

  /**
   * Slate plugins. Default is [].
   */
  plugins: SlatePlugin[];

  /**
   * Editor value. Default is [].
   */
  value: Node[];
};

export type SlatePluginsStateById = { byId: Record<string, SlatePluginsState> };

export type SlatePluginsActions = {
  setComponents: (key: string, value: SlatePluginsState['components']) => void;
  setEditor: (key: string, value: SlatePluginsState['editor']) => void;
  setPlugins: (key: string, value: SlatePluginsState['plugins']) => void;
  setValue: (key: string, value: SlatePluginsState['value']) => void;
};

export type SlatePluginsStore = SlatePluginsStateById & SlatePluginsActions;

export type UseSlatePluginsOptions = Partial<SlatePluginsState> & {
  /**
   * Unique key to store multiple editor states. Default is 'main'.
   */
  key?: string;
};
