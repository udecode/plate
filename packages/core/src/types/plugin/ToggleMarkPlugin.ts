import { Value } from '../../slate/editor/TEditor';
import { HotkeyPlugin } from './HotkeyPlugin';

export interface ToggleMarkPlugin<V extends Value = Value>
  extends HotkeyPlugin {
  /**
   * Node properties to delete.
   */
  clear?: string | string[];
}
