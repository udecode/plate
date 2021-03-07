import { Node } from 'slate';
import { State } from './SlatePluginsStore';

/**
 * Options related to Slate component
 */
export interface UseSlateOptions
  extends Pick<Partial<State>, 'value' | 'editor'> {
  /**
   * Unique id to store multiple editor states. Default is 'main'.
   */
  id?: string;

  /**
   * Initial value of the editor.
   * Default is `[{children: [{text: ''}]}]`.
   */
  initialValue?: Node[];

  /**
   * Apply the plugins to the editor singleton.
   * Default is `[withReact, withHistory, withRandomKey]`.
   */
  withPlugins?: any;

  /**
   * Controlled callback called when the editor state changes.
   */
  onChange?: (value: Node[]) => void;
}
