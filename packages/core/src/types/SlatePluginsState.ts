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
   * Slate editor. Default uses `withReact`, `withHistoryPersist` and `withRandomKey` plugins.
   */
  editor?: unknown;

  /**
   * Slate plugins. Default is [].
   */
  plugins: SlatePlugin[];

  /**
   * Editor value. Default is `[{children: [{text: ''}]}]`.
   */
  value: Node[];
};

export type StateById = { byId: Record<string, State> };

export type Actions = {
  setInitialState: (id?: string) => void;
  setComponents: (value: State['components'], id?: string) => void;
  setEditor: (value: State['editor'], id?: string) => void;
  setPlugins: (value: State['plugins'], id?: string) => void;
  setWithPlugins: (value: any[], id?: string) => void;
  setValue: (value: State['value'], id?: string) => void;
};

export type SlatePluginsState = StateById & Actions;
