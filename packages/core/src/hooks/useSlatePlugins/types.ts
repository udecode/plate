import { FunctionComponent } from 'react';
import { SlatePlugin } from '../../types';

export type State = {
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

export type StateById = { byId: Record<string, State> };

export type Actions = {
  setComponents: (key: string, value: State['components']) => void;
  setEditor: (key: string, value: State['editor']) => void;
  setPlugins: (key: string, value: State['plugins']) => void;
  setValue: (key: string, value: State['value']) => void;
};

export type SlatePluginsState = StateById & Actions;

export type UseSlatePluginsOptions = Partial<State> & {
  /**
   * Unique key to store multiple editor states. Default is 'main'.
   */
  key?: string;
};
