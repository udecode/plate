import { Node } from 'slate';
import { State } from './SlatePluginsState';

/**
 * Options related to Slate component
 */
export interface UseSlateOptions
  extends Pick<Partial<State>, 'value' | 'editor'> {
  /**
   * Unique key to store multiple editor states. Default is 'main'.
   */
  key?: string;

  /**
   * Controlled callback called when the editor state changes
   */
  onChange?: (value: Node[]) => void;
}
