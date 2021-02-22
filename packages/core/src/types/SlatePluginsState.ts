import { FunctionComponent } from 'react';
import { Node } from 'slate';
import { SlatePlugin } from './SlatePlugin';

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
  setComponents: (value: State['components'], key?: string) => void;
  setEditor: (value: State['editor'], key?: string) => void;
  setPlugins: (value: State['plugins'], key?: string) => void;
  setValue: (value: State['value'], key?: string) => void;
};

export type SlatePluginsState = StateById & Actions;
